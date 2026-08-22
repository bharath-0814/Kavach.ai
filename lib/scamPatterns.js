const levenshtein = require('fast-levenshtein');

/**
 * Extensive Whitelist of Common English & Vernacular Hindi (Hinglish), Bengali, 
 * Tamil/Telugu transliterations, and conversational words that should NEVER 
 * be mutated into threat words via fuzzy matching.
 */
const SAFE_WORDS = new Set([
  // Basic Prepositions & Pronouns
  'on', 'in', 'at', 'to', 'is', 'it', 'as', 'an', 'be', 'or', 'by', 'of',
  'we', 'me', 'us', 'up', 'my', 'do', 'go', 'so', 'no', 'if', 'he', 'ok',
  'your', 'you', 'will', 'with', 'from', 'this', 'that', 'have', 'here',
  'there', 'where', 'when', 'what', 'which', 'who', 'how', 'why', 'can',
  'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some',
  'such', 'than', 'too', 'very', 'just', 'now', 'then', 'also', 'about',

  // Conversational & Greetings
  'dear', 'user', 'hello', 'sir', 'madam', 'name', 'time', 'date', 'call',
  'bhai', 'bro', 'yaar', 'dost', 'chai', 'khana', 'peena', 'milte', 'milna',
  'market', 'aaj', 'kal', 'parso', 'ghar', 'room', 'office', 'kya', 'kyun',
  'kaise', 'kab', 'kahan', 'kidhar', 'hota', 'hoga', 'hogi', 'karte', 'kare',
  'karna', 'karo', 'karein', 'kijiye', 'ap', 'aap', 'apka', 'aapka', 'apke', 'aapke',
  'apni', 'aapni', 'meri', 'mera', 'mere', 'tera', 'teri', 'tere', 'hum',
  'hamara', 'hamari', 'unka', 'unki', 'unke', 'inka', 'inki', 'inke', 'sab',
  'kuch', 'aur', 'par', 'pe', 'mein', 'se', 'ko', 'ke', 'ka', 'ki', 'hai',
  'hain', 'tha', 'the', 'thi', 'raha', 'rahe', 'rahi', 'gaya', 'gaye', 'gayi',
  'bhi', 'to', 'hi', 'mat', 'na', 'nahi', 'nahin', 'badhai', 'shubh', 'kripya',
  'dhanyawad', 'please', 'pls', 'thanks', 'thank', 'okay', 'good', 'morning',
  'night', 'afternoon', 'evening', 'welcome', 'great', 'fine', 'sure', 'yes',
  'notice', 'package', 'due', 'track', 'pay', 'post', 'delivery', 'failed', 'due',

  // Work, Job, Media & General Terms (Protects task scam sentences from bad fuzzy matches)
  'chahte', 'chahta', 'chahti', 'chahenge', 'chahiye', 'chaho', 'job', 'jobs',
  'work', 'works', 'working', 'daily', 'videos', 'video', 'screenshot', 'screenshots',
  'photo', 'photos', 'pic', 'pics', 'image', 'images', 'income', 'earning',
  'part-time', 'full-time', 'parttime', 'fulltime', 'zero', 'investment', 'invest',
  'baithe', 'baithein', 'kamana', 'kamaye', 'kamayein', 'like', 'likes', 'liking',
  'subscribe', 'channel', 'message', 'messages', 'number', 'numbers', 'link',
  'links', 'app', 'apps', 'play', 'game', 'money', 'salary', 'fees', 'free',
  'bhejo', 'bhej', 'bhejein', 'bhejte', 'send', 'share', 'contact', 'whatsapp',
  'telegram', 'youtube', 'google', 'facebook', 'instagram', 'twitter', 'sms',
  'man', 'boy', 'girl', 'pen', 'book', 'car', 'bike', 'home', 'house', 'city',
  'delhi', 'mumbai', 'bangalore', 'chennai', 'kolkata', 'hyderabad', 'pune',

  // Numbers in words & Common amounts
  'one', 'two', 'three', 'four', 'five', 'ten', 'hundred', 'thousand', 'crore',
  'lakh', 'rupees', 'inr', 'rs', 'rs.', 'rupee', 'paisa', 'paise'
]);

/**
 * 100x Broader Threat Lexicon covering all major Indian smishing vectors.
 */
const THREAT_LEXICON = [
  // 1. Account Actions & Suspensions
  'block', 'blocked', 'band', 'bandh', 'rok', 'suspend', 'suspended', 
  'deactivate', 'deactivated', 'expire', 'expired', 'disconnect', 'disconnected', 
  'terminate', 'terminated', 'freeze', 'frozen', 'hold', 'penalty',

  // 2. KYC, Identity & Verification
  'kyc', 'pan', 'aadhaar', 'aadhar', 'pancard', 'update', 'updated', 
  'verify', 'verification', 're-kyc', 'submit', 'document', 'biometric',
  're-verification', 'mandate', 'mandatory', 'unverified',

  // 3. Credential Harvesting & Remote Tools
  'otp', 'pin', 'password', 'passcode', 'cvv', 'credential', 'mpin', 'tpin',
  'anydesk', 'teamviewer', 'quicksupport', 'rustdesk', 'screenshare',

  // 4. Banking & Financial Entities
  'bank', 'account', 'khata', 'balance', 'yono', 'sbi', 'hdfc', 
  'icici', 'pnb', 'axis', 'bob', 'kotak', 'paytm', 'phonepe', 'gpay', 
  'cred', 'bhim', 'netbanking', 'atm', 'credit', 'creditcard', 'debit', 'debitcard', 'card',

  // 5. Urgency & Coercion
  'urgent', 'turant', 'jaldi', 'immediate', 'immediately', 'warning', 
  'warn', 'hours', 'ghante', 'today', 'tonight', 'aaj', 'warna', 'deadline',

  // 6. Lottery, Rewards & Lures
  'lottery', 'inam', 'reward', 'cashback', 'bonus', 'refund', 
  'winner', 'won', 'claim', 'crore', 'lakh', 'prize', 'jackpot', 'kbc',

  // 7. Part-Time Job / Task Scams
  'task', 'part-time', 'full-time', 'kamana', 'kamaye', 'earning', 
  'screenshot', 'like', 'subscribe', 'commission', 'investment', 
  'pre-paid', 'vip', 'mentor', 'recharge',

  // 8. Utilities (Electricity / Gas / Water)
  'bijli', 'electricity', 'ebill', 'power', 'bill', 'officer', 
  'substation', 'unpaid', 'overdue', 'meter', 'feeder',

  // 9. Traffic Challan & Legal Impersonation
  'challan', 'echallan', 'e-challan', 'mparivahan', 'parivahan', 
  'police', 'cbi', 'cybercell', 'warrant', 'court', 'summons', 
  'customs', 'arrest', 'narcotics', 'seizure', 'trai',

  // 10. Postal & Delivery Scams
  'indiapost', 'parcel', 'courier', 'consignment', 'shipment', 
  'address', 'undelivered', 'reschedule', 'redelivery',

  // 11. Telecom & SIM
  'sim', 'esim', '5g', 'port', 'simswap', 'trai',

  // 12. Income Tax & Loans
  'incometax', 'taxrefund', 'tds', 'itr', 'cibil', 'instantloan', 'disbursal',

  // 13. Suspicious Actions & Formats
  'download', 'install', 'apk', 'login', 'portal', 'click', 'url'
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
 * Normalization and Fuzzy Levenshtein Matcher with Length-Adaptive Distance:
 * 1. Collapses spaced/hyphenated single characters (e.g. K-Y-C -> KYC, O.T.P -> OTP, S B I -> SBI)
 * 2. Replaces common leetspeak substitutions (e.g. 0 -> o, 1 -> i, @ -> a)
 * 3. Compares tokens against threat lexicon using strict length-adaptive Levenshtein distance
 *    while protecting safe/natural vernacular words from false positive matches.
 */
function normalizeAndFuzzyMatch(rawText) {
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
    if (/^(https?:\/\/|[0-9.,:/?&=%_@#-]+|\s+)$/i.test(token)) {
      reconstructedTokens.push(token);
      continue;
    }

    const cleanWord = token.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (!cleanWord || cleanWord.length < 2) {
      reconstructedTokens.push(token);
      continue;
    }

    // If it's a known safe vernacular or English word, preserve it untouched!
    if (SAFE_WORDS.has(cleanWord)) {
      reconstructedTokens.push(token);
      continue;
    }

    // If it's already an exact threat word, keep it
    if (THREAT_SET.has(cleanWord)) {
      reconstructedTokens.push(token);
      continue;
    }

    // Collapse excessive repeats (e.g., "blloocckk" -> "block")
    const collapsedWord = cleanWord.replace(/(.)\1{2,}/g, '$1$1');

    let bestMatch = null;
    let minDistance = Infinity;

    for (const threatWord of THREAT_LEXICON) {
      // Length-Adaptive Distance Rules:
      let allowedDist = 1;
      if (threatWord.length <= 3) {
        // e.g. "0tpp" (length 4) -> "otp" (length 3, dist 1)
        if (Math.abs(cleanWord.length - threatWord.length) > 1) continue;
        allowedDist = 1;
      } else if (threatWord.length <= 4) {
        if (Math.abs(cleanWord.length - threatWord.length) > 1) continue;
        allowedDist = 1; // e.g. "blck" -> "block"
      } else {
        if (Math.abs(cleanWord.length - threatWord.length) > 2) continue;
        allowedDist = 2; // e.g. "immed1ate" -> "immediate", "updte" -> "update"
      }

      const distDirect = levenshtein.get(cleanWord, threatWord);
      const distCollapsed = levenshtein.get(collapsedWord, threatWord);
      const dist = Math.min(distDirect, distCollapsed);

      if (dist <= allowedDist && dist < minDistance) {
        minDistance = dist;
        bestMatch = threatWord;
      }
    }

    if (bestMatch && minDistance <= 2) {
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
 * 100x Broader Comprehensive Regex Pattern Suite for Indian SMS Phishing.
 */
const SCAM_RULES = [
  // 1. Task / Part-Time Job / YouTube Like Scam
  {
    id: 'TASK_JOB_SCAM',
    name: 'Part-Time Job / YouTube Task Scam',
    weight: 0.5,
    regex: /(ghar\s*baithe|daily\s*(rs\.?|inr|rupees|\d+[\s-]*\d+)\s*(kamana|kamaye)|part[\s-]*time\s*job|full[\s-]*time\s*job|work\s*from\s*home|investment\s*zero|zero\s*investment|youtube\s*videos?\s*(like|subscribe)|like\s*karo\s*aur\s*screenshot|screenshot\s*bhejo|whatsapp\s*par\s*message|telegram\s*(task|group|channel|vip|manager)|per\s*day\s*(rs\.?|\d+)\s*earning|daily\s*income)/i
  },

  // 2. KYC / PAN / Aadhaar Expiry Threat
  {
    id: 'KYC_THREAT',
    name: 'KYC Expiry / Update Threat',
    weight: 0.4,
    regex: /(kyc|pan|aadhaar|aadhar|pancard|document)[\s\S]{0,50}?(update|verify|expire|expired|suspended|pending|karo|bhejo|jama|invalid|deactivate|link|block)/i
  },
  {
    id: 'REVERSE_KYC_THREAT',
    name: 'Action on KYC / Account',
    weight: 0.4,
    regex: /(update|complete|verify|submit|link)[\s\S]{0,50}?(kyc|pan|aadhaar|aadhar|profile|account|khata)/i
  },
  {
    id: 'PAN_AADHAAR_PENALTY',
    name: 'PAN-Aadhaar Penalty / Mandatory Link Scam',
    weight: 0.45,
    regex: /(pan\s*aadhaar|aadhaar\s*pan)[\s\S]{0,50}?(link|mandatory|penalty|fine|rs\.?\s*10000|inoperative|deactivated)/i
  },

  // 3. Bank Account / SIM Suspension
  {
    id: 'ACCOUNT_SUSPENSION',
    name: 'Account / SIM / Connection Block Warning',
    weight: 0.4,
    regex: /(account|khata|sim|card|atm|bijli|service|connection|yono|netbanking|access)[\s\S]{0,60}?(band|block|suspend|deactivat|kat\s*jaye|rok\s*diya|freeze|bandh|disabled)/i
  },
  {
    id: 'SUSPENSION_PREDICATE',
    name: 'Suspension Predicate in Vernacular',
    weight: 0.35,
    regex: /(block|suspend|deactivat|band|freeze|kat)\s*(ho\s*jayega|kar\s*diya|karenge|hoga|hoye|hogi|jayegi|ho\s*chuka)/i
  },

  // 4. Credential & Remote Access Harvesting
  {
    id: 'OTP_CREDENTIAL_HARVESTING',
    name: 'OTP / PIN / Password Solicitation',
    weight: 0.45,
    regex: /(otp|pin|cvv|password|passcode|mpin|tpin)[\s\S]{0,60}?(share|bhejo|bataye|batao|send|enter|submit|kisi\s*ko|verify|karein|bata)/i
  },
  {
    id: 'REVERSE_OTP_HARVESTING',
    name: 'Request for Sensitive Credential',
    weight: 0.45,
    regex: /(share|send|enter|batao|bhejo|bataye)[\s\S]{0,60}?(otp|pin|code|password|passcode|mpin)/i
  },
  {
    id: 'REMOTE_ACCESS_APP',
    name: 'Remote Access App Installation (AnyDesk / TeamViewer)',
    weight: 0.5,
    regex: /(anydesk|teamviewer|quicksupport|rustdesk|screen\s*share|apk\s*install)\s*(download|install|karo|karein|open)/i
  },

  // 5. Urgency & Coercion
  {
    id: 'URGENCY_COERCION',
    name: 'High Urgency / Coercion',
    weight: 0.25,
    regex: /(turant|jaldi|aaj hi|24 ghante|24 hrs|immediate|immediately|urgent|last warning|aakhri mauka|within 24|today itself|warna|tonight|aaj raat)/i
  },

  // 6. Rewards, Cashback, Lottery Lure
  {
    id: 'FINANCIAL_LOTTERY_REWARD',
    name: 'Lottery / Reward / Cashback Lure',
    weight: 0.4,
    regex: /(lottery|inam|reward|cashback|refund|won|winner|bonus|paisa|rupees|kbc|lucky\s*draw)[\s\S]{0,50}?(claim|jeet|paaye|mubarak|received|credit|deposit|jackpot)/i
  },
  {
    id: 'FINANCIAL_LURE_VERNACULAR',
    name: 'Vernacular Winning / Reward Lure',
    weight: 0.35,
    regex: /(jeet\s*gaye|badhai|claim\s*kijiye|claim\s*karein|paayein|inam\s*mila|cashback\s*mila|congratulations)/i
  },

  // 7. Electricity / Utility Bill Cut
  {
    id: 'UTILITY_BILL_SCAM',
    name: 'Electricity / Utility Bill Disconnection Scam',
    weight: 0.45,
    regex: /(bijli|electricity|power|ebill|light\s*bill|meter)[\s\S]{0,60}?(disconnect|bandh|kat|cut|unpaid|overdue|officer|raat|9\s*baje|bandh\s*ho\s*jayega)/i
  },

  // 8. Traffic e-Challan & Fake APK Scam
  {
    id: 'TRAFFIC_ECHALLAN_SCAM',
    name: 'Traffic e-Challan / mParivahan APK Scam',
    weight: 0.45,
    regex: /(traffic|echallan|e-challan|challan|mparivahan|parivahan|driving\s*licence)[\s\S]{0,60}?(pending|fine|court|pay\s*now|download|apk|seize)/i
  },

  // 9. India Post / Courier Delivery Scam
  {
    id: 'PARCEL_DELIVERY_SCAM',
    name: 'India Post / Parcel Delivery Scam',
    weight: 0.45,
    regex: /(india\s*post|post\s*office|parcel|courier|consignment|shipment|speed\s*post|package)[\s\S]{0,60}?(failed|incomplete|wrong\s*address|incorrect\s*address|hold|holding|hub|update\s*address|reschedule|delivery\s*fee)/i
  },

  // 10. Digital Arrest / CBI / Police Impersonation
  {
    id: 'DIGITAL_ARREST_SCAM',
    name: 'Digital Arrest / CBI / Police Threat',
    weight: 0.5,
    regex: /(cbi|mumbai\s*police|crime\s*branch|cyber\s*cell|ed\s*officer|customs|digital\s*arrest|arrest\s*warrant|narcotics|drugs\s*in\s*parcel|passport\s*seized)/i
  },

  // 11. SIM 5G Deactivation Scam
  {
    id: 'SIM_5G_SCAM',
    name: 'SIM Block / 5G Upgrade Scam',
    weight: 0.4,
    regex: /(sim|esim|4g\s*to\s*5g|5g\s*upgrade|trai\s*disconnection|sim\s*block)[\s\S]{0,60}?(block|deactivat|port|kyc|expired)/i
  },

  // 12. Income Tax Refund Scam
  {
    id: 'INCOME_TAX_REFUND_SCAM',
    name: 'Income Tax Refund / IT Dept Scam',
    weight: 0.45,
    regex: /(income\s*tax|it\s*department|tax\s*refund|it\s*refund|tds\s*refund|itr\s*refund)[\s\S]{0,60}?(approved|credit|claim|pending|bank\s*account)/i
  },

  // 13. Fake Instant Loan App Scam
  {
    id: 'FAKE_LOAN_SCAM',
    name: 'Fake Instant Loan / Extortion Scam',
    weight: 0.4,
    regex: /(pre-approved|instant\s*loan|personal\s*loan|without\s*cibil|zero\s*cibil|zero\s*interest)\s*(disbursed|approved|apply|rs\.?\s*\d+)/i
  },

  // 14. Suspicious Links & Shorteners
  {
    id: 'SUSPICIOUS_LINK_OR_APK',
    name: 'Suspicious URL, Shortener, or APK',
    weight: 0.35,
    regex: /(https?:\/\/|bit\.ly|tinyurl\.com|t\.co|wa\.me|t\.me|\.apk|\.xyz|\.top|\.club|\.online|\.site|\.live|\.app|\.buzz|\.icu|click here|klick here|open link)/i
  },

  // 15. Bank & Authority Impersonation
  {
    id: 'BANK_IMPERSONATION',
    name: 'Bank / Authority Impersonation',
    weight: 0.3,
    regex: /(sbi|yono|hdfc|icici|pnb|axis|bob|kotak|paytm|phonepe|gpay|income tax|cbi|police|trai|rbi)\s*(alert|team|officer|update|notice|department|care|bank|support)/i
  }
];

/**
 * Suspicious TLDs frequently used in SMS Phishing.
 */
const SUSPICIOUS_TLDS = new Set([
  'xyz', 'top', 'club', 'live', 'online', 'site', 'app', 'buzz', 'icu', 
  'vip', 'cc', 'tk', 'ml', 'ga', 'cf', 'gq', 'work', 'link', 'click', 
  'info', 'rest', 'shop', 'cfd', 'sbs', 'best', 'monster', 'download', 
  'pro', 'win', 'bid', 'stream', 'trade', 'date'
]);

/**
 * Common URL Shortener services used to mask malicious destination endpoints.
 */
const SHORTENER_DOMAINS = new Set([
  'bit.ly', 'tinyurl.com', 't.co', 'wa.me', 't.me', 'is.gd', 'buff.ly', 
  'ow.ly', 'cutt.ly', 'rb.gy', 'shorturl.at', 'page.link', 'v.gd', 's.id',
  'bc.vc', 'goo.gl', 'dlvr.it', 'lnkd.in', 'qr.ae', 'trib.al', 'clck.ru'
]);

/**
 * Legitimate Indian Banking, Government, and Public Utility Allowlist Domains.
 */
const ALLOWLIST_DOMAINS = new Set([
  'sbi.co.in', 'onlinesbi.sbi', 'onlinesbi.com', 'bank.sbi', 'hdfcbank.com', 
  'icicibank.com', 'axisbank.com', 'kotak.com', 'pnbindia.in', 'bankofbaroda.in', 
  'canarabank.com', 'unionbankofindia.co.in', 'idbibank.in', 'paytm.com', 
  'phonepe.com', 'google.com', 'gov.in', 'nic.in', 'incometax.gov.in', 
  'indiapost.gov.in', 'mparivahan.gov.in', 'parivahan.gov.in', 'uidai.gov.in', 
  'npci.org.in', 'rbi.org.in', 'epfindia.gov.in', 'cybercrime.gov.in',
  'amazon.in', 'flipkart.com', 'apple.com'
]);

/**
 * Extract and analyze URLs found in the SMS text using deterministic heuristics.
 */
function analyzeUrls(text) {
  if (!text || typeof text !== 'string') {
    return {
      urls: [],
      hasShortener: false,
      hasSuspiciousTld: false,
      hasApkDownload: false,
      isAllowlisted: false,
      hasBrandMismatch: false,
      domainVerdict: 'NO_LINKS',
      urlRisk: 0.0
    };
  }

  const urlRegex = /(https?:\/\/[^\s]+|bit\.ly\/[^\s]+|tinyurl\.com\/[^\s]+|t\.me\/[^\s]+|wa\.me\/[^\s]+|[a-zA-Z0-9-]+\.(?:xyz|top|club|live|online|site|app|buzz|icu|vip|apk|cfd|sbs|best|download)\b[^\s]*)/gi;
  const matches = text.match(urlRegex) || [];

  if (matches.length === 0) {
    return {
      urls: [],
      hasShortener: false,
      hasSuspiciousTld: false,
      hasApkDownload: false,
      isAllowlisted: false,
      hasBrandMismatch: false,
      domainVerdict: 'NO_LINKS',
      urlRisk: 0.0
    };
  }

  let hasShortener = false;
  let hasSuspiciousTld = false;
  let hasApkDownload = false;
  let isAllowlisted = false;
  let hasBrandMismatch = false;
  let urlRisk = 0.0;

  const textLower = text.toLowerCase();
  const mentionsOfficialBrand = /(sbi|yono|hdfc|icici|pnb|axis|bob|kotak|paytm|phonepe|gpay|india post|indiapost|parivahan|challan|income tax|pan card|aadhaar|electricity|bijli)/i.test(textLower);

  for (const rawUrl of matches) {
    const urlLower = rawUrl.toLowerCase();

    // 1. Link Shortener Heuristic
    if (SHORTENER_DOMAINS.has(urlLower) || [...SHORTENER_DOMAINS].some(d => urlLower.includes(d))) {
      hasShortener = true;
      urlRisk = Math.max(urlRisk, 0.40);
    }

    // 2. Malicious File Payload (APK / Executable) Heuristic
    if (urlLower.endsWith('.apk') || urlLower.includes('.apk?') || urlLower.includes('/apk/') || urlLower.endsWith('.exe')) {
      hasApkDownload = true;
      urlRisk = Math.max(urlRisk, 0.50);
    }

    // 3. Suspicious TLD Heuristic
    for (const tld of SUSPICIOUS_TLDS) {
      if (new RegExp(`\\.${tld}(?:[/?:#]|$)`, 'i').test(urlLower)) {
        hasSuspiciousTld = true;
        urlRisk = Math.max(urlRisk, 0.45);
        break;
      }
    }

    // 4. Domain Allowlist Check
    let domainMatchedAllowlist = false;
    for (const allowDomain of ALLOWLIST_DOMAINS) {
      if (urlLower.includes(`://${allowDomain}`) || urlLower.includes(`.${allowDomain}`) || urlLower.startsWith(allowDomain)) {
        domainMatchedAllowlist = true;
        break;
      }
    }

    if (domainMatchedAllowlist) {
      isAllowlisted = true;
    } else {
      // 5. Brand Mismatch / Lookalike Domain Spoofing Check
      if (mentionsOfficialBrand && !hasShortener) {
        hasBrandMismatch = true;
        urlRisk = Math.max(urlRisk, 0.45);
      }
    }
  }

  let domainVerdict = 'UNVERIFIED_EXTERNAL_LINK';
  if (hasApkDownload) {
    domainVerdict = 'MALICIOUS_APK_DOWNLOAD';
  } else if (hasShortener) {
    domainVerdict = 'MASKED_URL_SHORTENER';
  } else if (hasSuspiciousTld) {
    domainVerdict = 'SUSPICIOUS_HIGH_RISK_TLD';
  } else if (hasBrandMismatch) {
    domainVerdict = 'DOMAIN_SPOOFING_MISMATCH';
  } else if (isAllowlisted) {
    domainVerdict = 'VERIFIED_OFFICIAL_DOMAIN';
    urlRisk = Math.max(0.0, urlRisk - 0.3); // Safe discount
  }

  return {
    urls: matches,
    hasShortener,
    hasSuspiciousTld,
    hasApkDownload,
    isAllowlisted,
    hasBrandMismatch,
    domainVerdict,
    urlRisk
  };
}

/**
 * Main Rule Engine Function:
 * Analyzes an SMS message, performs deobfuscation and fuzzy matching,
 * runs regex rules, inspects URLs, and calculates a normalized rule score (0.0 - 1.0).
 */
function analyzeScamPatterns(message) {
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return {
      ruleScore: 0.0,
      matchedLabels: [],
      triggerPhrases: [],
      fuzzyMatches: [],
      normalizedMessage: '',
      urlAnalysis: { urls: [], hasShortener: false, hasSuspiciousTld: false, hasApkDownload: false, urlRisk: 0.0 }
    };
  }

  const { normalizedText, fuzzyMatches, originalText } = normalizeAndFuzzyMatch(message);
  const urlAnalysis = analyzeUrls(originalText);

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

  // Include URL risk if suspicious link detected
  if (urlAnalysis.urlRisk > 0) {
    totalScore += urlAnalysis.urlRisk;
    if (urlAnalysis.hasShortener) matchedLabels.push('URL_SHORTENER_DETECTED');
    if (urlAnalysis.hasSuspiciousTld) matchedLabels.push('SUSPICIOUS_TLD_DETECTED');
    if (urlAnalysis.hasApkDownload) matchedLabels.push('MALICIOUS_APK_DOWNLOAD');
  }

  // If fuzzy matches were found (obfuscations detected), add to triggerPhrases
  if (fuzzyMatches.length > 0) {
    fuzzyMatches.forEach(fm => {
      triggerPhrases.push(`${fm.original} (obfuscated "${fm.matchedWord}")`);
    });
    totalScore += Math.min(fuzzyMatches.length * 0.1, 0.2);
  }

  // Bonus weight if high-risk combinations are detected
  const hasThreatOrKYC = matchedLabels.some(l => [
    'KYC_THREAT', 'REVERSE_KYC_THREAT', 'PAN_AADHAAR_PENALTY',
    'ACCOUNT_SUSPENSION', 'SUSPENSION_PREDICATE', 'UTILITY_BILL_SCAM',
    'TRAFFIC_ECHALLAN_SCAM', 'PARCEL_DELIVERY_SCAM', 'DIGITAL_ARREST_SCAM'
  ].includes(l));

  const hasJobTaskScam = matchedLabels.includes('TASK_JOB_SCAM');
  const hasCredential = matchedLabels.some(l => ['OTP_CREDENTIAL_HARVESTING', 'REMOTE_ACCESS_APP'].includes(l));
  const hasLink = matchedLabels.includes('SUSPICIOUS_LINK_OR_APK') || urlAnalysis.urls.length > 0;
  const hasUrgency = matchedLabels.includes('URGENCY_COERCION');

  if (hasJobTaskScam && (hasLink || /whatsapp|telegram/i.test(originalText))) {
    totalScore += 0.35;
  }
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
    normalizedMessage: normalizedText,
    urlAnalysis
  };
}

module.exports = {
  normalizeAndFuzzyMatch,
  analyzeScamPatterns,
  analyzeUrls,
  SAFE_WORDS,
  THREAT_LEXICON,
  SCAM_RULES,
  SUSPICIOUS_TLDS,
  SHORTENER_DOMAINS
};
