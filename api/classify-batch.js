const { analyzeScamPatterns } = require('../lib/scamPatterns');
const { callGeminiClassifier, inferScamTypeFromLabels } = require('../lib/geminiClient');
const { logFlag } = require('../lib/db');

/**
 * Enable CORS headers for cross-origin frontend requests.
 */
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
}

module.exports = async function handler(req, res) {
  setCorsHeaders(res);

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed. Use POST.'
    });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    let messages = [];

    if (Array.isArray(body?.messages)) {
      messages = body.messages.map(m => String(m).trim()).filter(m => m.length > 0);
    } else if (typeof body?.text === 'string') {
      messages = body.text
        .split(/\r?\n/)
        .map(m => m.trim())
        .filter(m => m.length > 0);
    }

    if (messages.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: "messages" array or newline-separated "text".'
      });
    }

    // Cap batch size to 10 messages for demo performance & rate limit protection
    const batchList = messages.slice(0, 10);
    const results = [];
    let scamsDetected = 0;

    for (let i = 0; i < batchList.length; i++) {
      const msg = batchList[i];
      try {
        // Step 1: Run Deterministic Levenshtein & Regex Rule Engine
        const ruleResult = analyzeScamPatterns(msg);
        const ruleScore = ruleResult.ruleScore;

        // Step 2: Call Gemini AI (with retries and fallback)
        const geminiResult = await callGeminiClassifier(msg, ruleResult);
        const geminiConfidence = geminiResult.confidence;

        // Step 3: Combine scores: 40% Rule + 60% Gemini AI
        const rawFinalScore = (ruleScore * 0.4) + (geminiConfidence * 0.6);
        const finalScore = Number(Math.min(Math.max(rawFinalScore, 0.0), 1.0).toFixed(4));

        // Step 4: Determine Verdict
        let verdict = 'safe';
        if (finalScore >= 0.65) {
          verdict = 'high_risk';
          scamsDetected++;
        } else if (finalScore >= 0.35) {
          verdict = 'suspicious';
          scamsDetected++;
        }

        // Step 5: Merge trigger phrases & determine scam type
        const combinedPhrases = Array.from(new Set([
          ...(ruleResult.triggerPhrases || []),
          ...(geminiResult.trigger_phrases || [])
        ]));

        let scamType = geminiResult.scam_type;
        if (verdict === 'safe') {
          scamType = 'BENIGN';
        } else if (!scamType || scamType === 'BENIGN') {
          scamType = inferScamTypeFromLabels(ruleResult.matchedLabels);
        }

        // Step 6: Log result to Turso database asynchronously
        await logFlag({
          message: msg,
          risk_score: finalScore,
          verdict,
          trigger_phrases: combinedPhrases,
          scam_type: scamType
        }).catch(err => console.warn('Batch logFlag warning:', err.message));

        results.push({
          index: i + 1,
          message: msg,
          risk_score: finalScore,
          verdict,
          scam_type: scamType,
          top_trigger: combinedPhrases[0] || 'None',
          trigger_phrases: combinedPhrases,
          reasoning: geminiResult.reasoning,
          breakdown: {
            rule_score: ruleScore,
            gemini_confidence: geminiConfidence
          }
        });
      } catch (itemErr) {
        console.error(`Error classifying batch item ${i + 1}:`, itemErr);
        results.push({
          index: i + 1,
          message: msg,
          risk_score: 0.5,
          verdict: 'suspicious',
          scam_type: 'ERROR',
          top_trigger: 'Analysis Error',
          trigger_phrases: [],
          reasoning: 'Classification error: ' + itemErr.message,
          breakdown: { rule_score: 0.5, gemini_confidence: 0.5 }
        });
      }
    }

    return res.status(200).json({
      success: true,
      total: results.length,
      scams_detected: scamsDetected,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Unhandled error in /api/classify-batch:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error during batch classification.',
      details: error.message
    });
  }
};
