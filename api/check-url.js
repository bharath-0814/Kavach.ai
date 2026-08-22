const { analyzeUrlForensics, extractUrls } = require('../lib/urlChecker');

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
    const url = body?.url || body?.message;

    if (!url || typeof url !== 'string' || url.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: "url" or "message".'
      });
    }

    const forensics = await analyzeUrlForensics(url);

    return res.status(200).json({
      success: true,
      url,
      forensics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Unhandled error in /api/check-url:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error during URL forensic check.',
      details: error.message
    });
  }
};
