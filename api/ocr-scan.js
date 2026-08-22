const { extractTextFromScreenshot } = require('../lib/geminiClient');

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
    const image = body?.image;
    const mimeType = body?.mimeType || 'image/png';

    if (!image || typeof image !== 'string' || image.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: "image" (base64 string).'
      });
    }

    const extractedText = await extractTextFromScreenshot(image, mimeType);

    return res.status(200).json({
      success: true,
      extracted_text: extractedText,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Unhandled error in /api/ocr-scan:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error during screenshot OCR extraction.',
      details: error.message
    });
  }
};
