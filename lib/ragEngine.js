/**
 * Kavach AI — High-Performance Multilingual RAG Retrieval Engine
 * Matches incoming SMS messages against verified Indian threat vectors,
 * CERT-In advisories, and legal frameworks using hybrid vector similarity.
 */

const { THREAT_KNOWLEDGE_BASE } = require('./threatKnowledgeBase');

/**
 * Tokenize and normalize text for vectorization.
 */
function tokenizeText(text) {
  if (!text || typeof text !== 'string') return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1);
}

/**
 * Compute Term Frequency (TF) vector for a document.
 */
function computeTf(tokens) {
  const tf = {};
  const total = tokens.length || 1;
  for (const token of tokens) {
    tf[token] = (tf[token] || 0) + (1 / total);
  }
  return tf;
}

/**
 * Calculate Cosine Similarity between two sparse vectors.
 */
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const key in vecA) {
    normA += vecA[key] * vecA[key];
    if (vecB[key]) {
      dotProduct += vecA[key] * vecB[key];
    }
  }

  for (const key in vecB) {
    normB += vecB[key] * vecB[key];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Pre-vectorize the threat knowledge base for sub-5ms retrieval.
 */
const vectorizedCorpus = THREAT_KNOWLEDGE_BASE.map(item => {
  const combinedText = [
    item.title,
    item.category,
    item.modus_operandi,
    item.keywords.join(' '),
    item.vernacular_patterns.join(' ')
  ].join(' ');

  const tokens = tokenizeText(combinedText);
  const tfVector = computeTf(tokens);

  return {
    ...item,
    tokens,
    tfVector
  };
});

/**
 * Retrieve Top-K most semantically similar threat vectors for an incoming SMS.
 */
function retrieveSimilarThreats(smsText, topK = 3) {
  if (!smsText || typeof smsText !== 'string') {
    return {
      has_match: false,
      top_matches: [],
      rag_context_str: ''
    };
  }

  const queryTokens = tokenizeText(smsText);
  if (queryTokens.length === 0) {
    return {
      has_match: false,
      top_matches: [],
      rag_context_str: ''
    };
  }

  const queryVector = computeTf(queryTokens);

  // Score each threat vector in the knowledge base
  const scoredResults = vectorizedCorpus.map(item => {
    let score = cosineSimilarity(queryVector, item.tfVector);

    // Boost score if explicit keyword matches exist
    let keywordHits = 0;
    for (const kw of item.keywords) {
      if (smsText.toLowerCase().includes(kw)) {
        keywordHits++;
      }
    }

    if (keywordHits > 0) {
      score = Math.min(1.0, score + (keywordHits * 0.15));
    }

    return {
      id: item.id,
      category: item.category,
      title: item.title,
      similarity: parseFloat(score.toFixed(3)),
      modus_operandi: item.modus_operandi,
      i4c_advisory: item.i4c_advisory,
      cert_in_bulletin: item.cert_in_bulletin,
      legal_sections: item.legal_sections,
      action_plan: item.action_plan
    };
  });

  // Sort descending by similarity
  scoredResults.sort((a, b) => b.similarity - a.similarity);

  const topMatches = scoredResults.slice(0, topK);
  const bestMatch = topMatches[0];

  const hasMatch = bestMatch && bestMatch.similarity >= 0.12;

  // Format RAG context for injection into LLM prompt
  let ragContextStr = '';
  if (hasMatch) {
    ragContextStr = `### RETRIEVED THREAT INTELLIGENCE & OFFICIAL ADVISORY (RAG GROUNDING):
- Primary Threat Vector: ${bestMatch.title} (Category: ${bestMatch.category})
- Vector Similarity: ${(bestMatch.similarity * 100).toFixed(1)}%
- Official Bulletin: ${bestMatch.i4c_advisory} / ${bestMatch.cert_in_bulletin}
- Modus Operandi: ${bestMatch.modus_operandi}
- Legal Provisions: ${bestMatch.legal_sections.join(', ')}
- Actionable Mitigation: ${bestMatch.action_plan}`;
  }

  return {
    has_match: hasMatch,
    best_match: hasMatch ? bestMatch : null,
    top_matches: topMatches,
    rag_context_str: ragContextStr
  };
}

module.exports = {
  retrieveSimilarThreats
};
