const { logFlag, getRecentFlags } = require('./lib/db');

async function testDb() {
  console.log('Testing LibSQL / SQLite DB...');
  
  const insertResult = await logFlag({
    message: 'Y0UR SB1 ACC0UNT WILL BLCK T0DAY. UPDATE K-Y-C IMMED1ATE: http://bit.ly/sbi-kyc',
    risk_score: 0.94,
    verdict: 'high_risk',
    trigger_phrases: ['update kyc', 'BLCK (obfuscated "block")', 'http://bit.ly/sbi-kyc'],
    scam_type: 'KYC_FRAUD'
  });
  console.log('Insert result:', insertResult);

  const flags = await getRecentFlags(5);
  console.log('Fetched flags count:', flags.length);
  console.log('Recent flag:', flags[0]);
}

testDb().catch(console.error);
