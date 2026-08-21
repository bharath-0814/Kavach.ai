const { buildGeminiPrompt } = require('./geminiPrompt');

/**
 * Infer a scam type from rule engine labels when in fallback mode.
 */
function inferScamTypeFromLabels(labels = []) {
  if (labels.some(l => l.includes('OTP') || l.includes('CREDENTIAL'))) return 'OTP_THEFT';
  if (labels.some(l => l.includes('KYC'))) return 'KYC_FRAUD';
  if (labels.some(l => l.includes('UTILITY') || l.includes('BILL'))) return 'UTILITY_BILL';
  if (labels.some(l => l.includes('LOTTERY') || l.includes('REWARD'))) return 'LOTTERY_REWARD';
  if (labels.some(l => l.includes('SUSPENSION') || l.includes('ACCOUNT'))) return 'BANK_IMPERSONATION';
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
 * Call Gemini 2.5 Flash API with retries and exponential backoff.
 * Falls back gracefully to rule-engine based estimation if the API key is missing or calls fail.
 */
async function callGeminiClassifier(message, ruleEngineResult = {}, maxRetries = 2) {
  const apiKey = process.env.GEMINI_API_KEY;

  // Graceful fallback if no API key is configured
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not configured. Using rule-engine fallback.');
    const ruleScore = ruleEngineResult.ruleScore || 0.0;
    return {
      is_scam: ruleScore >= 0.35,
      confidence: ruleScore,
      trigger_phrases: ruleEngineResult.triggerPhrases || [],
      reasoning: ruleScore >= 0.35
        ? 'Message matched known vernacular fraud patterns and urgency markers (Rule Engine fallback).'
        : 'No obvious vernacular phishing or urgency signals found (Rule Engine fallback).',
      scam_type: ruleScore >= 0.35 ? inferScamTypeFromLabels(ruleEngineResult.matchedLabels) : 'BENIGN',
      fallback: true
    };
  }

  const prompt = buildGeminiPrompt(message);
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

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

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeout);

      // Handle Rate Limiting (429) or Service Unavailable (503) with retry
      if (response.status === 429 || response.status === 503) {
        const backoffMs = Math.pow(2, attempt) * 1000;
        console.warn(`Gemini rate limited (${response.status}). Retrying in ${backoffMs}ms (attempt ${attempt + 1}/${maxRetries + 1})...`);
        if (attempt < maxRetries) {
          await sleep(backoffMs);
          continue;
        }
        throw new Error(`Gemini rate limit exceeded with status ${response.status}`);
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

      return {
        is_scam: Boolean(parsed.is_scam),
        confidence: typeof parsed.confidence === 'number' ? Math.min(Math.max(parsed.confidence, 0.0), 1.0) : 0.5,
        trigger_phrases: Array.isArray(parsed.trigger_phrases) ? parsed.trigger_phrases : [],
        reasoning: parsed.reasoning || 'Classified by Gemini AI.',
        scam_type: parsed.scam_type || (parsed.is_scam ? 'OTHER' : 'BENIGN'),
        fallback: false
      };
    } catch (err) {
      lastError = err;
      console.warn(`Gemini call attempt ${attempt + 1} failed: ${err.message}`);
      if (attempt < maxRetries) {
        await sleep(Math.pow(2, attempt) * 800);
      }
    }
  }

  // Graceful fallback if all retries fail
  console.error('All Gemini API retries exhausted. Activating graceful rule-engine fallback:', lastError?.message);
  const ruleScore = ruleEngineResult.ruleScore || 0.0;
  return {
    is_scam: ruleScore >= 0.35,
    confidence: ruleScore,
    trigger_phrases: ruleEngineResult.triggerPhrases || [],
    reasoning: `Gemini unavailable (${lastError?.message || 'timeout'}). Classified via heuristic rule engine.`,
    scam_type: ruleScore >= 0.35 ? inferScamTypeFromLabels(ruleEngineResult.matchedLabels) : 'BENIGN',
    fallback: true
  };
}

module.exports = {
  callGeminiClassifier,
  inferScamTypeFromLabels
};
