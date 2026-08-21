const { getRecentFlags } = require('../lib/db');

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

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed. Use GET.'
    });
  }

  try {
    const limit = Math.min(Math.max(parseInt(req.query?.limit, 10) || 10, 1), 50);
    const flags = await getRecentFlags(limit);

    return res.status(200).json({
      success: true,
      count: flags.length,
      data: flags
    });
  } catch (error) {
    console.error('Unhandled error in /api/recent-flags:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve recent flags from database.',
      details: error.message
    });
  }
};
