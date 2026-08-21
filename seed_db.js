require('dotenv').config();
const { initDb, getScamLexicon, getDbStats } = require('./lib/db');

async function main() {
  console.log('--- Initializing & Seeding Turso DB Threat Lexicon ---');
  await initDb();
  
  const stats = await getDbStats();
  console.log('Database Stats:', stats);
  
  const words = await getScamLexicon('ALL', 10);
  console.log(`Sample threat words from DB (${words.length} fetched):`);
  console.log(JSON.stringify(words, null, 2));
}

main().catch(console.error);
