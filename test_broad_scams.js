const { analyzeScamPatterns } = require('./lib/scamPatterns');
const { inferScamTypeFromLabels } = require('./lib/geminiClient');

const tests = [
  {
    msg: "Aapka bijli connection aaj raat 9 baje bandh ho jayega. Turant is number pe call karein aur 0TPP batayein.",
    expectedCategory: 'UTILITY_BILL'
  },
  {
    msg: "Hello sir, kya aap ghar baithe daily Rs 3000-5000 kamana chahte hain? YouTube videos like karo aur screenshot bhejo. Part-time/Full-time job, investment zero hai. WhatsApp par message karein: https://wa.me/919876543210",
    expectedCategory: 'JOB_TASK_FRAUD'
  },
  {
    msg: "Y0UR SB1 ACC0UNT WILL BLCK T0DAY. UPDATE K-Y-C IMMED1ATE: http://bit.ly/sbi-kyc",
    expectedCategory: 'KYC_FRAUD'
  },
  {
    msg: "Notice: Traffic challan DL-01-AB-1234 fine Rs. 1000 is pending. Download mParivahan.apk to pay: https://echallan-pay.xyz/mparivahan.apk",
    expectedCategory: 'TRAFFIC_ECHALLAN'
  },
  {
    msg: "India Post: Your package IN98234 delivery failed due to incorrect address. Update within 24 hours: https://indiapost.top",
    expectedCategory: 'PARCEL_DELIVERY'
  },
  {
    msg: "Bhai kal shaam ko milte hain market me, chai peeyenge.",
    expectedCategory: 'BENIGN'
  }
];

console.log('=== VERIFYING HEURISTIC ENGINE ALONE (Offline / Rate-Limit Resilience) ===');
for (const t of tests) {
  const res = analyzeScamPatterns(t.msg);
  const cat = res.ruleScore >= 0.35 ? inferScamTypeFromLabels(res.matchedLabels) : 'BENIGN';
  console.log(`\nMsg: "${t.msg.substring(0, 60)}..."`);
  console.log(`Rule Score: ${res.ruleScore} | Category: ${cat} | Expected: ${t.expectedCategory}`);
  console.log(`Triggers: ${JSON.stringify(res.triggerPhrases)}`);
  console.log(`Labels: ${JSON.stringify(res.matchedLabels)}`);
}
