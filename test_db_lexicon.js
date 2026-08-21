require('dotenv').config();
const { getScamLexicon, getDbStats } = require('./lib/db');

async function testLexicon() {
  console.log('Testing Lexicon API queries...');
  const stats = await getDbStats();
  console.log('Live Database Stats:', JSON.stringify(stats, null, 2));

  const taskScams = await getScamLexicon('TASK_JOB_FRAUD', 5);
  console.log('\nSample Task/Job Scams from DB:', JSON.stringify(taskScams, null, 2));

  const digitalArrests = await getScamLexicon('DIGITAL_ARREST', 5);
  console.log('\nSample Digital Arrest Threats from DB:', JSON.stringify(digitalArrests, null, 2));

  const regionalScams = await getScamLexicon('VERNACULAR_REGIONAL', 5);
  console.log('\nSample Regional Vernacular Scams from DB:', JSON.stringify(regionalScams, null, 2));
}

testLexicon().catch(console.error);
