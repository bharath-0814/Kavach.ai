const { analyzeScamPatterns } = require('../lib/scamPatterns');
const { callGeminiClassifier, inferScamTypeFromLabels } = require('../lib/geminiClient');
const { analyzeUrlForensics } = require('../lib/urlChecker');
const { logFlag, getSimilarFlags } = require('../lib/db');

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
    // Parse request body
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const message = body?.message;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: "message" (must be a non-empty string).'
      });
    }

    // Step 1: Run Deterministic Levenshtein & Regex Rule Engine
    const ruleResult = analyzeScamPatterns(message);
    const ruleScore = ruleResult.ruleScore;

    // Step 2: Run Live URL Threat Forensics & Google Safe Browsing Check
    const urlForensics = await analyzeUrlForensics(message);

    // Step 3: Call Gemini 2.5 Flash API (with retries and fallback)
    const geminiResult = await callGeminiClassifier(message, ruleResult);
    const geminiConfidence = geminiResult.confidence;

    // Step 4: Combine scores: 40% Rule Engine + 60% Gemini AI + URL Threat Multiplier
    let rawFinalScore = (ruleScore * 0.4) + (geminiConfidence * 0.6);
    
    // Elevate score if Google Safe Browsing or severe URL heuristics triggered
    if (urlForensics.isGoogleBlacklisted) {
      rawFinalScore = Math.max(rawFinalScore, 0.98);
    } else if (urlForensics.hasBrandMismatch || urlForensics.hasApkDownload) {
      rawFinalScore = Math.max(rawFinalScore, 0.88);
    } else if (urlForensics.urlRisk > 0) {
      rawFinalScore = Math.max(rawFinalScore, rawFinalScore * 0.7 + urlForensics.urlRisk * 0.3);
    }

    const finalScore = Number(Math.min(Math.max(rawFinalScore, 0.0), 1.0).toFixed(4));

    // Step 5: Determine Verdict
    let verdict = 'safe';
    if (finalScore >= 0.65) {
      verdict = 'high_risk';
    } else if (finalScore >= 0.35) {
      verdict = 'suspicious';
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
    const logRes = await logFlag({
      message,
      risk_score: finalScore,
      verdict,
      trigger_phrases: combinedPhrases,
      scam_type: scamType
    });

    // Step 7: Retrieve similar past scams from Turso threat intelligence feed
    let similarFlags = [];
    try {
      similarFlags = await getSimilarFlags({
        scam_type: scamType,
        trigger_phrases: combinedPhrases,
        exclude_id: logRes?.id || null,
        limit: 3
      });
    } catch (simErr) {
      console.warn('Failed to retrieve similar flags:', simErr.message);
    }

    // Step 8: Return JSON Response
    return res.status(200).json({
      success: true,
      message,
      risk_score: finalScore,
      verdict,
      scam_type: scamType,
      trigger_phrases: combinedPhrases,
      similar_flags: similarFlags,
      breakdown: {
        rule_score: ruleScore,
        gemini_confidence: geminiConfidence,
        rule_matches: ruleResult.matchedLabels,
        fuzzy_matches: ruleResult.fuzzyMatches,
        url_analysis: urlForensics,
        ai_fallback_used: geminiResult.fallback,
        model_used: geminiResult.model_used || 'rule_heuristics'
      },
      reasoning: geminiResult.reasoning,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Unhandled error in /api/classify:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error during SMS classification.',
      details: error.message
    });
  }
};
