require('dotenv').config();
const { callGeminiClassifier } = require('./lib/geminiClient');
const { analyzeScamPatterns } = require('./lib/scamPatterns');

async function testClassifier() {
  const msg = "Hello sir, kya aap ghar baithe daily Rs 3000-5000 kamana chahte hain? YouTube videos like karo aur screenshot bhejo. Part-time/Full-time job, investment zero hai. WhatsApp par message karein: https://wa.me/919876543210";
  
  const ruleResult = analyzeScamPatterns(msg);
  console.log('Rule Score:', ruleResult.ruleScore);
  
  const result = await callGeminiClassifier(msg, ruleResult);
  console.log('\n--- Gemini Multi-Model Pool Result ---');
  console.log('Model Used:', result.model_used);
  console.log('Is Scam:', result.is_scam);
  console.log('Confidence:', result.confidence);
  console.log('Reasoning:', result.reasoning);
  console.log('Scam Type:', result.scam_type);
  console.log('Fallback:', result.fallback);
}

testClassifier().catch(console.error);
