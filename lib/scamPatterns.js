const levenshtein = require('fast-levenshtein');

/**
 * Common English and Vernacular Hindi (Hinglish) words that should NOT
 * be falsely converted into threat words via fuzzy matching.
 */
const SAFE_WORDS = new Set([
  'on', 'in', 'at', 'to', 'is', 'it', 'as', 'an', 'be', 'or', 'by', 'of',
  'we', 'me', 'us', 'up', 'my', 'do', 'go', 'so', 'no', 'if', 'he', 'ok',
  'your', 'you', 'will', 'with', 'from', 'this', 'that', 'have', 'here',
  'dear', 'user', 'hello', 'sir', 'madam', 'name', 'time', 'date', 'call',
  'bhai', 'chai', 'khana', 'peena', 'milte', 'milna', 'market', 'aaj', 'kal',
  'parso', 'ghar', 'dost', 'kya', 'kyun', 'kaise', 'kab', 'kahan', 'hota',
  'hoga', 'hogi', 'karte', 'kare', 'karna', 'karo', 'apka', 'aapka', 'apke',
  'aapke', 'apni', 'meri', 'mera', 'mere', 'tera', 'teri', 'tere', 'hum',
  'hamara', 'unka', 'inka', 'sab', 'kuch', 'aur', 'par', 'pe', 'mein', 'se',
  'ko', 'ke', 'ka', 'ki', 'hai', 'hain', 'tha', 'the', 'thi', 'raha', 'rahe',
  'rahi', 'gaya', 'gaye', 'gayi', 'bhi', 'to', 'hi', 'mat', 'na', 'nahi',
  'badhai', 'shubh', 'kripya', 'dhanyawad',
  'please', 'pls', 'thanks', 'thank', 'okay', 'good', 'morning', 'night'
]);

/**
 * Threat keywords dictionary for fuzzy matching and regex analysis.
 */
const THREAT_LEXICON = [
  // Threats & Account Actions
  'block', 'blocked', 'band', 'bandh', 'rok', 'suspend', 'suspended', 
  'deactivate', 'deactivated', 'expire', 'expired', 'disconnect', 'disconnected', 
  'terminate', 'freeze', 'frozen', 'penalty', 'challan',

  // Verification & KYC
  'kyc', 'pan', 'aadhaar', 'aadhar', 'pancard', 'update', 'updated', 
  'verify', 'verification', 're-kyc', 'submit', 'document',

  // Credential Theft
  'otp', 'pin', 'password', 'passcode', 'cvv', 'credential',

  // Banking (Vernacular + Standard)
  'bank', 'account', 'khata', 'paisa', 'balance', 'yono', 'sbi', 
  'hdfc', 'icici', 'pnb', 'axis', 'bob', 'paytm', 'phonepe', 'gpay',

  // Urgency & Coercion
  'urgent', 'turant', 'jaldi', 'immediate', 'immediately', 'warning', 
  'warn', 'hours', 'ghante', 'today',

  // Lottery, Rewards, Lures
  'lottery', 'inam', 'reward', 'cashback', 'bonus', 'refund', 
  'winner', 'won', 'claim', 'crore', 'lakh', 'prize',

  // Utilities & Impersonation
  'bijli', 'electricity', 'ebill', 'power', 'bill', 'officer', 
  'police', 'cbi', 'trai', 'customs',

  // Suspicious Actions
  'click', 'download', 'install', 'link', 'apk', 'login'
];

/**
 * Exact threat words as a Set for fast lookup.
 */
const THREAT_SET = new Set(THREAT_LEXICON);

/**
 * Common Leetspeak character mapping.
 */
const LEET_MAP = {
  '0': 'o',
  '1': 'i',
  '3': 'e',
  '4': 'a',
  '5': 's',
  '7': 't',
  '8': 'b',
  '@': 'a',
  '$': 's',
  '!': 'i',
  '+': 't',
  '|': 'i'
};

/**
 * Normalization and Fuzzy Levenshtein Matcher:
 * 1. Collapses spaced/hyphenated single characters (e.g. K-Y-C -> KYC, O.T.P -> OTP, S B I -> SBI)
 * 2. Replaces common leetspeak substitutions (e.g. 0 -> o, 1 -> i, @ -> a)
 * 3. Compares tokens against threat lexicon using Levenshtein distance (threshold <= 2)
 *    while protecting safe/natural vernacular words from false positive matches.
 */
function normalizeAndFuzzyMatch(rawText, maxDistance = 2) {
  if (!rawText || typeof rawText !== 'string') {
    return {
      normalizedText: '',
      fuzzyMatches: [],
      originalText: rawText || ''
    };
  }

  // Step 1: Pre-process connected single-letter abbreviations (e.g., K-Y-C, K.Y.C, O_T_P, S-B-I)
  let preprocessed = rawText.replace(/(?<=\b[a-zA-Z0-9])[.\-_/|\\](?=[a-zA-Z0-9]\b)/g, '');
  
  // Also handle patterns like K - Y - C or O T P with spaces between single letters
  preprocessed = preprocessed.replace(/\b([a-zA-Z0-9])\s+([a-zA-Z0-9])\s+([a-zA-Z0-9])\b/g, '$1$2$3');

  // Step 2: Leetspeak character substitution
  let leetReplaced = '';
  for (let i = 0; i < preprocessed.length; i++) {
    const char = preprocessed[i];
    leetReplaced += LEET_MAP[char] || char;
  }

  // Step 3: Tokenize words while preserving punctuation and URLs
  const tokens = leetReplaced.split(/(\s+|[^\w\s:/.?=&-])/);
  const fuzzyMatches = [];
  const reconstructedTokens = [];

  for (let token of tokens) {
    // Preserve URLs, numbers, whitespace, and punctuation untouched
    if (/^(https?:\/\/|[0-9.,:/?&=%_-]+|\s+)$/i.test(token)) {
      reconstructedTokens.push(token);
      continue;
    }

    const cleanWord = token.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (!cleanWord || cleanWord.length < 2) {
      reconstructedTokens.push(token);
      continue;
    }

    // If it's already an exact threat word, keep it
    if (THREAT_SET.has(cleanWord)) {
      reconstructedTokens.push(token);
      continue;
    }

    // If it's a known safe/common vernacular or English word, do not distort it
    if (SAFE_WORDS.has(cleanWord)) {
      reconstructedTokens.push(token);
      continue;
    }

    // Collapse excessive repeats (e.g., "blloocckk" -> "block")
    const collapsedWord = cleanWord.replace(/(.)\1{2,}/g, '$1$1');

    let bestMatch = null;
    let minDistance = Infinity;

    for (const threatWord of THREAT_LEXICON) {
      let allowedDist = maxDistance;
      
      // Dynamic max allowed distance
      if (threatWord.length <= 3) {
        allowedDist = 1; // e.g. "0tpp" -> "otp"
        // Avoid matching words with different length for 3-letter threats unless strict
        if (Math.abs(cleanWord.length - threatWord.length) > 1) continue;
      } else if (threatWord.length <= 4) {
        allowedDist = 1; // e.g. "blck" -> "block" (distance 1)
        if (Math.abs(cleanWord.length - threatWord.length) > 1) continue;
      } else {
        allowedDist = 2; // e.g. "immed1ate" -> "immediate" (distance 1), "updte" -> "update"
        if (Math.abs(cleanWord.length - threatWord.length) > 2) continue;
      }

      const distDirect = levenshtein.get(cleanWord, threatWord);
      const distCollapsed = levenshtein.get(collapsedWord, threatWord);
      const dist = Math.min(distDirect, distCollapsed);

      if (dist <= allowedDist && dist < minDistance) {
        minDistance = dist;
        bestMatch = threatWord;
      }
    }

    if (bestMatch && minDistance <= maxDistance) {
      fuzzyMatches.push({
        original: token,
        matchedWord: bestMatch,
        distance: minDistance
      });
      reconstructedTokens.push(bestMatch);
    } else {
      reconstructedTokens.push(token);
    }
  }

  const normalizedText = reconstructedTokens.join('').toLowerCase();

  return {
    originalText: rawText,
    normalizedText,
    fuzzyMatches
  };
}

/**
 * Regex Pattern Definitions for Vernacular & Hinglish SMS Phishing.
 */
const SCAM_RULES = [
  {
    id: 'KYC_THREAT',
    name: 'KYC Expiry / Update Threat',
    weight: 0.35,
    regex: /(kyc|pan|aadhaar|aadhar|pancard|document)\s*(update|verify|expire|suspended|pending|karo|bhejo|jama|invalid|deactivate|link|block)/i
  },
  {
    id: 'REVERSE_KYC_THREAT',
    name: 'Action on KYC / Account',
    weight: 0.35,
    regex: /(update|complete|verify|submit|link)\s*(your|apna|apni)?\s*(kyc|pan|aadhaar|aadhar|profile|account|khata)/i
  },
  {
    id: 'ACCOUNT_SUSPENSION',
    name: 'Account / SIM / Connection Block Warning',
    weight: 0.35,
    regex: /(account|khata|sim|card|atm|bijli|service|connection|yono|netbanking)\s*(band|block|suspend|deactivat|kat jaye|rok diya|freeze|bandh)/i
  },
  {
    id: 'SUSPENSION_PREDICATE',
    name: 'Suspension Predicate in Vernacular',
    weight: 0.3,
    regex: /(block|suspend|deactivat|band|freeze|kat)\s*(ho jayega|kar diya|karenge|hoga|hoye|hogi|jayegi)/i
  },
  {
    id: 'OTP_CREDENTIAL_HARVESTING',
    name: 'OTP / PIN / Password Solicitation',
    weight: 0.4,
    regex: /(otp|pin|cvv|password|passcode)\s*(share|bhejo|bataye|batao|send|enter|submit|kisi ko|verify|karein)/i
  },
  {
    id: 'REVERSE_OTP_HARVESTING',
    name: 'Request for Sensitive Credential',
    weight: 0.4,
    regex: /(share|send|enter|batao|bhejo|bataye)\s*(your|apna|apne)?\s*(otp|pin|code|password|passcode)/i
  },
  {
    id: 'URGENCY_COERCION',
    name: 'High Urgency / Coercion',
    weight: 0.25,
    regex: /(turant|jaldi|aaj hi|24 ghante|24 hrs|immediate|immediately|urgent|last warning|aakhri mauka|within 24|today itself|warna)/i
  },
  {
    id: 'FINANCIAL_LOTTERY_REWARD',
    name: 'Lottery / Reward / Cashback Lure',
    weight: 0.35,
    regex: /(lottery|inam|reward|cashback|refund|credited|won|winner|bonus|paisa|rupees|rs\.?\s*\d+)\s*(claim|jeet|paaye|mubarak|received|credit|deposit)/i
  },
  {
    id: 'FINANCIAL_LURE_VERNACULAR',
    name: 'Vernacular Winning / Reward Lure',
    weight: 0.35,
    regex: /(jeet gaye|badhai|claim kijiye|claim karein|paayein|inam mila|cashback mila)/i
  },
  {
    id: 'UTILITY_BILL_SCAM',
    name: 'Electricity / Utility Bill Scam',
    weight: 0.35,
    regex: /(bijli|electricity|power|ebill|light bill|challan)\s*(unpaid|overdue|disconnect|bhare|jama kare|officer|raat)/i
  },
  {
    id: 'SUSPICIOUS_LINK_OR_APK',
    name: 'Suspicious URL, Shortener, or APK',
    weight: 0.35,
    regex: /(https?:\/\/|bit\.ly|tinyurl\.com|t\.co|wa\.me|t\.me|\.apk|\.xyz|\.top|\.club|\.online|\.site|\.live|\.app|\.buzz|\.icu|click here|klick here|open link)/i
  },
  {
    id: 'BANK_IMPERSONATION',
    name: 'Bank / Authority Impersonation',
    weight: 0.25,
    regex: /(sbi|yono|hdfc|icici|pnb|axis|bob|paytm|phonepe|gpay|income tax|cbi|police|trai|rbi)\s*(alert|team|officer|update|notice|department|care|bank)/i
  }
];

/**
 * Main Rule Engine Function:
 * Analyzes an SMS message, performs deobfuscation and fuzzy matching,
 * runs regex rules, and calculates a normalized rule score (0.0 - 1.0).
 */
function analyzeScamPatterns(message) {
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return {
      ruleScore: 0.0,
      matchedLabels: [],
      triggerPhrases: [],
      fuzzyMatches: [],
      normalizedMessage: ''
    };
  }

  const { normalizedText, fuzzyMatches, originalText } = normalizeAndFuzzyMatch(message);

  const matchedLabels = [];
  const triggerPhrases = [];
  let totalScore = 0.0;

  // Track matched substrings from both original and normalized text
  for (const rule of SCAM_RULES) {
    const matchNorm = normalizedText.match(rule.regex);
    const matchOrig = originalText.match(rule.regex);

    if (matchNorm || matchOrig) {
      matchedLabels.push(rule.id);
      totalScore += rule.weight;

      if (matchOrig && matchOrig[0]) {
        triggerPhrases.push(matchOrig[0]);
      } else if (matchNorm && matchNorm[0]) {
        triggerPhrases.push(matchNorm[0]);
      }
    }
  }

  // If fuzzy matches were found (obfuscations detected), add to triggerPhrases
  if (fuzzyMatches.length > 0) {
    fuzzyMatches.forEach(fm => {
      triggerPhrases.push(`${fm.original} (obfuscated "${fm.matchedWord}")`);
    });
    totalScore += Math.min(fuzzyMatches.length * 0.1, 0.2);
  }

  // Bonus weight if high-risk combinations are detected (e.g. Threat + Link or Urgency + Credential)
  const hasThreatOrKYC = matchedLabels.some(l => ['KYC_THREAT', 'REVERSE_KYC_THREAT', 'ACCOUNT_SUSPENSION', 'SUSPENSION_PREDICATE'].includes(l));
  const hasCredential = matchedLabels.some(l => ['OTP_CREDENTIAL_HARVESTING', 'REVERSE_OTP_HARVESTING'].includes(l));
  const hasLink = matchedLabels.includes('SUSPICIOUS_LINK_OR_APK');
  const hasUrgency = matchedLabels.includes('URGENCY_COERCION');

  if ((hasThreatOrKYC || hasCredential) && hasLink) {
    totalScore += 0.25;
  }
  if ((hasThreatOrKYC || hasCredential) && hasUrgency) {
    totalScore += 0.15;
  }

  // Deduplicate triggers and labels
  const uniqueTriggers = Array.from(new Set(triggerPhrases));
  const uniqueLabels = Array.from(new Set(matchedLabels));

  // Cap rule score between 0.0 and 1.0, formatted to 2 decimals
  const ruleScore = Math.min(Math.max(Number(totalScore.toFixed(2)), 0.0), 1.0);

  return {
    ruleScore,
    matchedLabels: uniqueLabels,
    triggerPhrases: uniqueTriggers,
    fuzzyMatches,
    normalizedMessage: normalizedText
  };
}

module.exports = {
  normalizeAndFuzzyMatch,
  analyzeScamPatterns,
  THREAT_LEXICON,
  SCAM_RULES
};
