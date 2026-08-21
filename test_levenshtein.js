const { analyzeScamPatterns, normalizeAndFuzzyMatch } = require('./lib/scamPatterns');

console.log('='.repeat(60));
console.log('🧪 TESTING LEVENSHTEIN FUZZY MATCHING & NORMALIZATION');
console.log('='.repeat(60));

const testMessages = [
  {
    title: 'Test 1: Obfuscated SBI KYC Block Scam with BLCK and K-Y-C',
    message: 'Y0UR SB1 ACC0UNT WILL BLCK T0DAY. UPDATE K-Y-C IMMED1ATE: http://bit.ly/sbi-kyc'
  },
  {
    title: 'Test 2: Vernacular Electricity Threat with 0TPP and Dialect',
    message: 'Aapka bijli connection aaj raat bandh ho jayega. Turant is number pe call karein aur 0TPP batayein.'
  },
  {
    title: 'Test 3: Obfuscated Bank Suspension (b4nd, acct, updte)',
    message: 'Dear user apka bank acct b4nd ho jayega. Pls updte ur pan card here: https://fake-bank.xyz'
  },
  {
    title: 'Test 4: Benign Hindi conversation',
    message: 'Bhai kal shaam ko milte hain market me, chai peeyenge.'
  }
];

testMessages.forEach((test, idx) => {
  console.log(`\n🔹 [${idx + 1}] ${test.title}`);
  console.log(`📥 Input Message: "${test.message}"`);
  
  const normResult = normalizeAndFuzzyMatch(test.message);
  console.log(`🔄 Normalized Text: "${normResult.normalizedText}"`);
  console.log(`🎯 Fuzzy / Obfuscation Matches:`, JSON.stringify(normResult.fuzzyMatches, null, 2));

  const result = analyzeScamPatterns(test.message);
  console.log(`📊 Rule Score: ${result.ruleScore}`);
  console.log(`🏷️  Matched Rule Labels:`, result.matchedLabels);
  console.log(`🚨 Trigger Phrases:`, result.triggerPhrases);
});

console.log('\n' + '='.repeat(60));
console.log('✅ TEST COMPLETED');
console.log('='.repeat(60));
