/**
 * Generates a prompt for Google Gemini (gemini-2.5-flash)
 * tailored for detecting SMS phishing in transliterated Hindi (Hinglish) and Indian vernacular SMS.
 */
function buildGeminiPrompt(message) {
  return `You are a high-precision Cybersecurity & Fraud Detection AI Assistant specializing in detecting SMS Phishing (Smishing) in India, particularly Hindi written in Latin script (Hinglish), regional Indian dialects, transliterated vernacular text, and Indian English.

You must analyze the following incoming SMS message for indicators of phishing, fraud, credential harvesting, social engineering, and financial deception.

### Key Threat Vectors to Scrutinize:
1. **Phonetic & Transliterated Hindi Variations**:
   - Words like "khata" (account), "band/bandh" (blocked/closed), "turant/jaldi" (immediate/urgent), "paisa/rupaye" (money), "kat jayega" (will be deducted/disconnected), "bhejo/batayein" (send/tell), "inam/lottery" (prize), "bijli" (electricity).
2. **Obfuscations & Leetspeak**:
   - Replacing letters with numbers/symbols (e.g. "0" for "o", "1" for "i", "k-y-c", "blck", "b4nd").
3. **Common Indian Scam Modus Operandi**:
   - Urgent KYC/PAN/Aadhaar update or SIM/Netbanking deactivation threats.
   - Electricity (Bijli) disconnection threats tonight asking to call a personal/fraudulent number or install APK.
   - Fake lottery/reward/KBC/cashback winnings requiring clicking a link or paying processing fees.
   - OTP, PIN, CVV, or Password harvesting under the guise of verification or unblocking.
   - Impersonation of trusted Indian entities (SBI, YONO, HDFC, ICICI, Paytm, PhonePe, TRAI, Police, CBI, Income Tax).
   - Shortened or deceptive URLs (.apk downloads, bit.ly, fake domains ending in .xyz, .top, .icu, etc.).

### Input SMS Message to Analyze:
"""
${message}
"""

### Strict Output Contract:
You MUST respond ONLY with a single valid JSON object, without any markdown code fence wrappers (\`\`\`json or \`\`\`), without introductory or closing text.

The JSON MUST conform strictly to this schema:
{
  "is_scam": boolean,
  "confidence": number,
  "trigger_phrases": [string],
  "reasoning": string,
  "scam_type": "KYC_FRAUD" | "OTP_THEFT" | "BANK_IMPERSONATION" | "LOTTERY_REWARD" | "UTILITY_BILL" | "URGENCY_EXTORTION" | "JOB_TASK_FRAUD" | "BENIGN" | "OTHER"
}

- "confidence": Float between 0.0 and 1.0 representing certainty of the scam classification.
- "trigger_phrases": Array of exact substrings from the message that triggered suspicion (empty array if benign).
- "reasoning": 1-2 concise sentences explaining why the message is a scam or why it is legitimate.
- "scam_type": The most applicable scam category, or "BENIGN" if safe.`;
}

module.exports = {
  buildGeminiPrompt
};
