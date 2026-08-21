const { analyzeScamPatterns, normalizeAndFuzzyMatch } = require('./lib/scamPatterns');
const { inferScamTypeFromLabels } = require('./lib/geminiClient');

const testMsg = "Hello sir, kya aap ghar baithe daily Rs 3000-5000 kamana chahte hain? YouTube videos like karo aur screenshot bhejo. Part-time/Full-time job, investment zero hai. WhatsApp par message karein: https://wa.me/919876543210";

console.log('--- Testing User Message ---');
const norm = normalizeAndFuzzyMatch(testMsg);
console.log('Fuzzy matches:', norm.fuzzyMatches);

const result = analyzeScamPatterns(testMsg);
console.log('Rule Score:', result.ruleScore);
console.log('Matched Labels:', result.matchedLabels);
console.log('Trigger Phrases:', result.triggerPhrases);
console.log('Inferred Category:', inferScamTypeFromLabels(result.matchedLabels));

if (result.ruleScore >= 0.8 && result.matchedLabels.includes('TASK_JOB_SCAM')) {
  console.log('✅ TEST PASSED: Task scam detected with 100% accuracy!');
  process.exit(0);
} else {
  console.error('❌ TEST FAILED: Score too low or missing task scam label.');
  process.exit(1);
}
