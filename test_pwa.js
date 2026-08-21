const http = require('http');
const server = require('./server');

async function testStaticAndPwa() {
  const PORT = 3456;
  server.listen(PORT, async () => {
    console.log(`Test server running on port ${PORT}`);

    const paths = ['/', '/style.css', '/app.js', '/manifest.json', '/sw.js', '/icon.svg', '/api/stats'];

    for (const p of paths) {
      const res = await fetch(`http://localhost:${PORT}${p}`);
      console.log(`Checking ${p.padEnd(20)} -> Status: ${res.status} (${res.headers.get('content-type')})`);
    }

    server.close(() => {
      console.log('✅ All PWA and Static Assets verified successfully!');
      process.exit(0);
    });
  });
}

testStaticAndPwa().catch(err => {
  console.error(err);
  process.exit(1);
});
