require('dotenv').config();

async function testWorkingModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  const models = [
    'gemini-3.6-flash',
    'gemini-3.5-flash',
    'gemini-3.7-flash',
    'gemini-flash-latest',
    'gemini-3.5-flash-lite',
    'gemini-flash-lite-latest'
  ];

  for (const m of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Respond strictly in JSON: {"status":"active","message":"ok"}' }] }]
        })
      });
      const data = await res.json();
      console.log(`Model ${m.padEnd(25)} -> Status: ${res.status} -> Text: ${data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()}`);
    } catch (e) {
      console.error(`Error for ${m}:`, e.message);
    }
  }
}

testWorkingModels().catch(console.error);
