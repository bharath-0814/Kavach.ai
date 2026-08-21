const { getScamLexicon } = require('../lib/db');

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
}

module.exports = async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed. Use GET.'
    });
  }

  try {
    const category = req.query.category || 'ALL';
    const limit = Math.min(Math.max(parseInt(req.query.limit || '100', 10), 1), 500);

    const lexicon = await getScamLexicon(category, limit);

    return res.status(200).json({
      success: true,
      category,
      count: lexicon.length,
      lexicon
    });
  } catch (error) {
    console.error('Error in /api/lexicon handler:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve scam lexicon from database.'
    });
  }
};
