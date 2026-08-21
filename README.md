# 🛡️ Kavach AI (कवच) — AI-Powered Vernacular SMS Phishing Classifier

[![Vercel Deployment](https://img.shields.io/badge/Deployed_on-Vercel-black?logo=vercel)](https://kavach-ai-ten.vercel.app/)
[![Database](https://img.shields.io/badge/Database-Turso%20LibSQL-00eb88?logo=sqlite)](https://turso.tech/)
[![AI Fusion](https://img.shields.io/badge/AI%20Model-Google%20Gemini%202.5%20Flash-4285F4?logo=google)](https://aistudio.google.com/)

> **Kavach AI** is a real-time, AI-fused smishing defense system specifically built to detect and neutralize **vernacular transliterated SMS phishing** (Hinglish, regional Indian dialects, and leetspeak obfuscations).

---

## 🎯 What Problem is Kavach Solving?

In India, **over 80% of SMS phishing scams are written in Latin-script Hindi (Hinglish)** and regional vernaculars rather than standard English. 

### Why Traditional Spam Filters Fail:
1. **Phonetic Variations**: Attackers write *"Aapka bijli connection raat 9 baje bandh ho jayega"* or *"Khata block hone se bachayein"*. Traditional English ML models classify this as random gibberish or harmless text.
2. **Intentional Obfuscation & Leetspeak**: Fraudsters evade keyword blacklists by writing `BLCK` instead of `block`, `0TPP` instead of `otp`, `K-Y-C` instead of `kyc`, and `b4nd` instead of `band`.
3. **High Urgency & Social Engineering**: Coercive threats (electricity cuts tonight, PAN deactivation within 24 hours, fake lottery credits) trick ordinary citizens into sharing credentials or clicking malicious links.

---

## 🔬 How Kavach Solves It (Architecture & Fusion)

Kavach employs a **Dual-Core AI Fusion Pipeline** that combines lightning-fast deterministic heuristics with deep multilingual LLM contextual reasoning:

```
[ Incoming SMS ]
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. Deobfuscation & Levenshtein Engine (lib/scamPatterns.js) │
│    - Collapses spaced/hyphenated tokens (K-Y-C ➔ KYC)        │
│    - Normalizes leetspeak substitutions (0 ➔ o, 1 ➔ i)      │
│    - Fuzzy Levenshtein Matcher (≤ 2 dist) (BLCK ➔ block)    │
│    - Vernacular Regex Heuristics (Urgency, OTP, KYC)        │
└──────────────────────────────┬──────────────────────────────┘
                               │ Rule Score (40% Weight)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. AI Multilingual Reasoning (lib/geminiClient.js)          │
│    - Google Gemini 2.5 Flash API                            │
│    - Translates phonetic context & social engineering intent│
│    - Exponential backoff retry + resilient graceful fallback│
└──────────────────────────────┬──────────────────────────────┘
                               │ Gemini Confidence (60% Weight)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Fusion & Storage Layer (api/classify.js & lib/db.js)     │
│    - Final Score = (RuleScore × 0.4) + (Gemini × 0.6)       │
│    - Verdict: HIGH RISK (≥0.65) | SUSPICIOUS (≥0.35) | SAFE │
│    - Real-time logging to Turso Cloud DB (flags table)      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Live Demo & Endpoints

- **Live Web Application**: [https://kavach-ai-ten.vercel.app/](https://kavach-ai-ten.vercel.app/)
- **Classify SMS (`POST`)**: `/api/classify`
- **Recent Threat Logs (`GET`)**: `/api/recent-flags?limit=10`

---

## 💻 API Usage

### `POST /api/classify`
Analyze an SMS message:

```bash
curl -X POST https://kavach-ai-ten.vercel.app/api/classify \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Y0UR SB1 ACC0UNT WILL BLCK T0DAY. UPDATE K-Y-C IMMED1ATE: http://bit.ly/sbi-kyc"
  }'
```

#### Sample Response:
```json
{
  "success": true,
  "message": "Y0UR SB1 ACC0UNT WILL BLCK T0DAY. UPDATE K-Y-C IMMED1ATE: http://bit.ly/sbi-kyc",
  "risk_score": 0.96,
  "verdict": "high_risk",
  "scam_type": "KYC_FRAUD",
  "trigger_phrases": [
    "update kyc",
    "immediate",
    "http://",
    "BLCK (obfuscated \"block\")"
  ],
  "breakdown": {
    "rule_score": 1.0,
    "gemini_confidence": 0.94,
    "rule_matches": ["REVERSE_KYC_THREAT", "URGENCY_COERCION", "SUSPICIOUS_LINK_OR_APK"],
    "fuzzy_matches": [
      { "original": "BLCK", "matchedWord": "block", "distance": 1 }
    ],
    "ai_fallback_used": false
  },
  "reasoning": "The message impersonates SBI and creates false urgency threatening account block unless an unverified link is clicked for KYC update.",
  "timestamp": "2026-08-22T02:30:00.000Z"
}
```

---

## 🛠️ Local Setup & Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/<your-username>/kavach-sms-phishing-detector.git
   cd kavach-sms-phishing-detector
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables** in `.env`:
   ```ini
   GEMINI_API_KEY=your_gemini_api_key_here
   TURSO_DATABASE_URL=libsql://your-db-org.turso.io
   TURSO_AUTH_TOKEN=your_turso_auth_token_here
   ```

4. **Run test suite**:
   ```bash
   npm test
   ```

5. **Start local server**:
   ```bash
   npm start
   ```
   Open `http://localhost:3000` in your browser.

---

## 🌐 Deploy to Vercel

1. Push your repository to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Under **Settings $\to$ Environment Variables**, configure:
   - `GEMINI_API_KEY`
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
4. Click **Deploy**!
