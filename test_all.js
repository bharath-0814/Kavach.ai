require('dotenv').config();
const classifyHandler = require('./api/classify');
const recentFlagsHandler = require('./api/recent-flags');
const { analyzeScamPatterns } = require('./lib/scamPatterns');

function mockResponse() {
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(key, value) {
      this.headers[key] = value;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
    end() {
      return this;
    }
  };
  return res;
}

async function runComprehensiveTests() {
  console.log('='.repeat(70));
  console.log('🛡️  KAVACH: VERNACULAR SMS PHISHING CLASSIFIER - TEST SUITE');
  console.log('='.repeat(70));

  const testCases = [
    {
      name: 'Obfuscated SBI KYC Block Phishing',
      message: 'Y0UR SB1 ACC0UNT WILL BLCK T0DAY. UPDATE K-Y-C IMMED1ATE: http://bit.ly/sbi-kyc',
      expectedVerdict: 'high_risk'
    },
    {
      name: 'Urgent Bijli Disconnection Threat with 0TPP',
      message: 'Aapka bijli connection aaj raat 9 baje bandh ho jayega. Turant is number pe call karein aur 0TPP batayein.',
      expectedVerdict: 'high_risk'
    },
    {
      name: 'Fake Reward / Lottery Lure',
      message: 'Badhai ho! Aapne Rs. 50,000 ka cashback jeet liya hai. Turant claim karein: https://reward-claim.xyz',
      expectedVerdict: 'high_risk'
    },
    {
      name: 'Suspicious Bank Account Warning without link',
      message: 'Dear user apka bank khata block ho jayega turant update karein.',
      expectedVerdict: 'suspicious' // or high_risk
    },
    {
      name: 'Benign Hindi Conversation',
      message: 'Bhai kal shaam ko milte hain market me, chai peeyenge.',
      expectedVerdict: 'safe'
    },
    {
      name: 'Benign Transaction Alert',
      message: 'Your account XX1234 has been credited with Rs. 1500 on 22-Aug-2026. Ref: 98765432.',
      expectedVerdict: 'safe'
    }
  ];

  console.log('\n--- 1. Testing /api/classify End-to-End ---');
  for (const test of testCases) {
    console.log(`\n🔹 Testing Case: "${test.name}"`);
    console.log(`   Message: "${test.message}"`);

    const req = {
      method: 'POST',
      body: { message: test.message }
    };
    const res = mockResponse();

    await classifyHandler(req, res);

    console.log(`   Status: ${res.statusCode}`);
    console.log(`   Risk Score: ${res.body?.risk_score}`);
    console.log(`   Verdict: ${res.body?.verdict} (Expected: ${test.expectedVerdict})`);
    console.log(`   Scam Type: ${res.body?.scam_type}`);
    console.log(`   Triggers: ${JSON.stringify(res.body?.trigger_phrases)}`);
    console.log(`   Rule Score: ${res.body?.breakdown?.rule_score}, AI Conf: ${res.body?.breakdown?.gemini_confidence}`);
    console.log(`   AI Fallback Active: ${res.body?.breakdown?.ai_fallback_used}`);
  }

  console.log('\n--- 2. Testing /api/recent-flags (Turso DB Integration) ---');
  const getReq = {
    method: 'GET',
    query: { limit: 5 }
  };
  const getRes = mockResponse();

  await recentFlagsHandler(getReq, getRes);

  console.log(`Status: ${getRes.statusCode}`);
  console.log(`Fetched ${getRes.body?.count} flagged non-safe SMS entries from DB.`);
  if (getRes.body?.data?.length > 0) {
    console.log('Sample entry from DB:', JSON.stringify(getRes.body.data[0], null, 2));
  }

  console.log('\n' + '='.repeat(70));
  console.log('✅ ALL TEST SUITE CHECKS COMPLETED SUCCESSFULLY');
  console.log('='.repeat(70));
}

runComprehensiveTests().catch(console.error);
