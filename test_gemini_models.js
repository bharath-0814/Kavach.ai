require('dotenv').config();

async function testGeminiModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('API Key present:', !!apiKey, 'Length:', apiKey?.length);

  // List available models from Google API
  try {
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const listData = await listRes.json();
    console.log('List models response status:', listRes.status);
    if (listData.models) {
      const flashModels = listData.models
        .filter(m => m.name.includes('flash') || m.name.includes('gemini'))
        .map(m => ({ name: m.name, supportedGenerationMethods: m.supportedGenerationMethods }));
      console.log('Available Gemini models for this key:');
      console.log(JSON.stringify(flashModels, null, 2));
    } else {
      console.log('No models list returned:', listData);
    }
  } catch (err) {
    console.error('Failed to list models:', err);
  }

  // Test generation on top candidate models
  const testModels = [
    'gemini-1.5-flash',
    'gemini-2.0-flash',
    'gemini-2.5-flash',
    'gemini-2.0-flash-exp',
    'gemini-1.5-flash-8b',
    'gemini-1.5-pro'
  ];

  for (const model of testModels) {
    console.log(`\nTesting model: ${model}...`);
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Respond with JSON: {"status": "ok"}' }] }]
        })
      });

      console.log(`Status for ${model}: ${res.status}`);
      const data = await res.json();
      if (res.ok) {
        console.log(`✅ Model ${model} SUCCESS:`, JSON.stringify(data?.candidates?.[0]?.content?.parts?.[0]?.text));
      } else {
        console.log(`❌ Model ${model} ERROR:`, data?.error?.message || data);
      }
    } catch (e) {
      console.log(`Exception for ${model}:`, e.message);
    }
  }
}

testGeminiModels().catch(console.error);
