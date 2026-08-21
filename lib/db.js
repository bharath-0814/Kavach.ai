const { createClient } = require('@libsql/client');

let client = null;
let initPromise = null;

/**
 * Get or initialize the LibSQL / Turso database client.
 */
function getDbClient() {
  if (!client) {
    const url = process.env.TURSO_DATABASE_URL || 'file:local.db';
    const authToken = process.env.TURSO_AUTH_TOKEN || undefined;

    client = createClient({
      url,
      authToken
    });
  }
  return client;
}

/**
 * Ensure the flags table exists.
 */
async function initDb() {
  if (!initPromise) {
    initPromise = (async () => {
      const db = getDbClient();
      await db.execute(`
        CREATE TABLE IF NOT EXISTS flags (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          message TEXT NOT NULL,
          risk_score REAL NOT NULL,
          verdict TEXT NOT NULL,
          trigger_phrases TEXT,
          scam_type TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
    })();
  }
  return initPromise;
}

/**
 * Log a classification result to the Turso flags table.
 */
async function logFlag({ message, risk_score, verdict, trigger_phrases, scam_type }) {
  try {
    await initDb();
    const db = getDbClient();

    const phrasesStr = Array.isArray(trigger_phrases)
      ? JSON.stringify(trigger_phrases)
      : (trigger_phrases || '[]');

    const result = await db.execute({
      sql: `INSERT INTO flags (message, risk_score, verdict, trigger_phrases, scam_type, created_at)
            VALUES (?, ?, ?, ?, ?, datetime('now'))`,
      args: [
        message,
        risk_score,
        verdict,
        phrasesStr,
        scam_type || 'UNKNOWN'
      ]
    });

    return {
      success: true,
      id: Number(result.lastInsertRowid)
    };
  } catch (error) {
    console.error('Error logging flag to database:', error.message);
    // Don't crash the classification endpoint if database logging encounters an issue
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Fetch the 10 most recent non-'safe' messages from Turso flags table.
 */
async function getRecentFlags(limit = 10) {
  try {
    await initDb();
    const db = getDbClient();

    const result = await db.execute({
      sql: `SELECT id, message, risk_score, verdict, trigger_phrases, scam_type, created_at
            FROM flags
            WHERE verdict != 'safe'
            ORDER BY created_at DESC, id DESC
            LIMIT ?`,
      args: [limit]
    });

    return result.rows.map(row => {
      let parsedPhrases = [];
      try {
        parsedPhrases = typeof row.trigger_phrases === 'string'
          ? JSON.parse(row.trigger_phrases)
          : (row.trigger_phrases || []);
      } catch {
        parsedPhrases = row.trigger_phrases ? [row.trigger_phrases] : [];
      }

      return {
        id: row.id,
        message: row.message,
        risk_score: row.risk_score,
        verdict: row.verdict,
        trigger_phrases: parsedPhrases,
        scam_type: row.scam_type,
        created_at: row.created_at
      };
    });
  } catch (error) {
    console.error('Error fetching recent flags from database:', error.message);
    throw error;
  }
}

module.exports = {
  getDbClient,
  initDb,
  logFlag,
  getRecentFlags
};
