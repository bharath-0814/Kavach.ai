const { buildGeminiPrompt } = require('./geminiPrompt');

/**
 * Supported Gemini models in priority cascade order.
 * If one model is rate-limited (429) or busy, the system immediately
 * cascades to the next active model in milliseconds.
 */
const CANDIDATE_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.7-flash',
  'gemini-flash-latest',
  'gemini-3.6-flash',
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest'
];

/**
 * Infer a scam type from rule engine labels when in fallback mode.
 */
function inferScamTypeFromLabels(labels = []) {
  if (labels.some(l => l.includes('TASK') || l.includes('JOB'))) return 'JOB_TASK_FRAUD';
  if (labels.some(l => l.includes('OTP') || l.includes('REMOTE') || l.includes('CREDENTIAL'))) return 'OTP_THEFT';
  if (labels.some(l => l.includes('KYC') || l.includes('PAN_AADHAAR'))) return 'KYC_FRAUD';
  if (labels.some(l => l.includes('UTILITY') || l.includes('BILL'))) return 'UTILITY_BILL';
  if (labels.some(l => l.includes('TRAFFIC') || l.includes('CHALLAN'))) return 'TRAFFIC_ECHALLAN';
  if (labels.some(l => l.includes('PARCEL') || l.includes('DELIVERY'))) return 'PARCEL_DELIVERY';
  if (labels.some(l => l.includes('DIGITAL_ARREST') || l.includes('POLICE'))) return 'DIGITAL_ARREST';
  if (labels.some(l => l.includes('SIM_5G'))) return 'SIM_DEACTIVATION';
  if (labels.some(l => l.includes('INCOME_TAX'))) return 'INCOME_TAX_REFUND';
  if (labels.some(l => l.includes('FAKE_LOAN'))) return 'FAKE_LOAN';
  if (labels.some(l => l.includes('LOTTERY') || l.includes('REWARD') || l.includes('CASHBACK'))) return 'LOTTERY_REWARD';
  if (labels.some(l => l.includes('SUSPENSION') || l.includes('ACCOUNT') || l.includes('BANK'))) return 'BANK_IMPERSONATION';
  if (labels.some(l => l.includes('URGENCY'))) return 'URGENCY_EXTORTION';
  return 'OTHER';
}

/**
 * Sleep helper for retry backoff.
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Clean and parse JSON response from Gemini.
 */
function parseGeminiJson(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Empty Gemini response text');
  }

  // Remove markdown code fences if present
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  return JSON.parse(cleaned);
}

/**
 * Call Gemini Flash API with automatic multi-model pool cascading, retries, and exponential backoff.
 * If one model is rate limited, it cascades instantly to the next model in the pool.
 */
async function callGeminiClassifier(message, ruleEngineResult = {}, maxRetries = 1) {
  const apiKey = process.env.GEMINI_API_KEY;

  // Graceful handling if no API key is configured
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not configured. Using rule-engine classification.');
    const ruleScore = ruleEngineResult.ruleScore || 0.0;
    return {
      is_scam: ruleScore >= 0.35,
      confidence: ruleScore,
      trigger_phrases: ruleEngineResult.triggerPhrases || [],
      reasoning: ruleScore >= 0.35
        ? 'High-risk vernacular fraud patterns and urgency markers detected.'
        : 'No obvious vernacular phishing or urgency signals found.',
      scam_type: ruleScore >= 0.35 ? inferScamTypeFromLabels(ruleEngineResult.matchedLabels) : 'BENIGN',
      fallback: true
    };
  }

  const prompt = buildGeminiPrompt(message);
  const payload = {
    contents: [
      {
        parts: [
          {
            text: prompt
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json'
    }
  };

  let lastError = null;

  // Cascade across the active model pool
  for (const model of CANDIDATE_MODELS) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      let response = null;
      let timeout = null;
      try {
        const controller = new AbortController();
        timeout = setTimeout(() => controller.abort(), 12000);

        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        // If 404 (model not found), break immediately to try next candidate model
        if (response.status === 404) {
          break;
        }

        // If 429 (rate limited on this specific model), break immediately to try next candidate model in pool!
        if (response.status === 429) {
          console.warn(`Model ${model} hit 429 rate limit. Instantly cascading to next model in pool...`);
          break;
        }

        if (response.status === 503) {
          if (attempt < maxRetries) {
            await sleep(600);
            continue;
          }
          break;
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Gemini API error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedText) {
          throw new Error('No candidate content received from Gemini');
        }

        const parsed = parseGeminiJson(generatedText);
        const isScam = Boolean(parsed.is_scam);
        let rawConfidence = typeof parsed.confidence === 'number' ? Math.min(Math.max(parsed.confidence, 0.0), 1.0) : 0.5;
        
        // If Gemini determined the message is NOT a scam, scam risk confidence is 0.0
        const scamRiskConfidence = isScam ? Math.max(rawConfidence, 0.5) : Math.min(rawConfidence, 0.0);

        return {
          is_scam: isScam,
          confidence: scamRiskConfidence,
          raw_confidence: rawConfidence,
          trigger_phrases: isScam && Array.isArray(parsed.trigger_phrases) ? parsed.trigger_phrases : [],
          reasoning: parsed.reasoning || (isScam ? 'High-risk smishing indicators and social engineering tactics detected.' : 'Classified as safe and legitimate communication.'),
          scam_type: isScam ? (parsed.scam_type || 'OTHER') : 'BENIGN',
          fallback: false,
          model_used: model
        };
      } catch (err) {
        lastError = err;
        if (attempt < maxRetries && response?.status !== 404 && response?.status !== 429) {
          await sleep(500);
        }
      } finally {
        if (timeout) clearTimeout(timeout);
      }
    }
  }

  // Graceful fallback with clean cybersecurity reasoning
  console.warn('Cascaded through model pool. Active heuristic classification applied.');
  const ruleScore = ruleEngineResult.ruleScore || 0.0;
  return {
    is_scam: ruleScore >= 0.35,
    confidence: ruleScore,
    trigger_phrases: ruleEngineResult.triggerPhrases || [],
    reasoning: ruleScore >= 0.35
      ? 'High-risk vernacular smishing patterns and coercive urgency indicators detected in message content.'
      : 'No malicious triggers, financial coercion, or suspicious links detected. Message appears safe.',
    scam_type: ruleScore >= 0.35 ? inferScamTypeFromLabels(ruleEngineResult.matchedLabels) : 'BENIGN',
    fallback: true
  };
}

module.exports = {
  callGeminiClassifier,
  inferScamTypeFromLabels,
  CANDIDATE_MODELS
};
