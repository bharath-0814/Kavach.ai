require('dotenv').config();
const { callGeminiClassifier } = require('./lib/geminiClient');

async function testGemini() {
  console.log('Testing Gemini API key...');
  console.log('Key length:', process.env.GEMINI_API_KEY?.length);

  const sampleMessage = 'Y0UR SB1 ACC0UNT WILL BLCK T0DAY. UPDATE K-Y-C IMMED1ATE: http://bit.ly/sbi-kyc';
  const result = await callGeminiClassifier(sampleMessage, {
    ruleScore: 1.0,
    matchedLabels: ['KYC_THREAT', 'URGENCY_COERCION'],
    triggerPhrases: ['update kyc', 'BLCK (obfuscated "block")']
  });

  console.log('Result:', JSON.stringify(result, null, 2));
}

testGemini().catch(console.error);
