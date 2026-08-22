const OFFICIAL_INDIAN_DOMAINS = [
  'onlinesbi.sbi', 'sbi.co.in', 'statebankofindia.com',
  'hdfcbank.com', 'icicibank.com', 'axisbank.com',
  'pnbindia.in', 'bankofbaroda.in', 'kotak.com', 'canarabank.com',
  'unionbankofindia.co.in', 'idbibank.in', 'indusind.com',
  'paytm.com', 'paytmbank.com', 'phonepe.com', 'gpay.app.goo.gl',
  'bhimupi.org.in', 'npci.org.in', 'cred.club',
  'incometax.gov.in', 'incometaxindia.gov.in', 'tin-nsdl.com',
  'parivahan.gov.in', 'mparivahan.gov.in', 'uidai.gov.in',
  'indiapost.gov.in', 'epfindia.gov.in', 'rbi.org.in',
  'trai.gov.in', 'sebi.gov.in', 'ceir.gov.in',
  'uppclonline.com', 'bsesdelhi.com', 'tatapower.com', 'mahadiscom.in'
];

const BRAND_KEYWORDS = {
  sbi: ['sbi', 'yono', 'statebank'],
  hdfc: ['hdfc', 'hdfcbank'],
  icici: ['icici', 'icicibank', 'imobile'],
  axis: ['axis', 'axisbank'],
  pnb: ['pnb', 'pnbone'],
  kotak: ['kotak', 'kotak811'],
  paytm: ['paytm'],
  phonepe: ['phonepe'],
  gpay: ['gpay', 'googlepay'],
  incometax: ['incometax', 'itr', 'taxrefund'],
  parivahan: ['parivahan', 'mparivahan', 'echallan', 'challan'],
  uidai: ['uidai', 'aadhaar', 'aadhar'],
  indiapost: ['indiapost', 'speedpost', 'postoffice'],
  electricity: ['bijli', 'electricity', 'uppcl', 'bses', 'tatapower', 'ebill']
};

const SUSPICIOUS_TLDS = new Set([
  '.top', '.xyz', '.club', '.work', '.click', '.buzz', '.cc', '.tk', 
  '.ml', '.ga', '.cf', '.gq', '.site', '.online', '.vip', '.icu', 
  '.rest', '.monster', '.live', '.surf', '.space', '.fun'
]);

const SHORTENERS = new Set([
  'bit.ly', 'tinyurl.com', 't.co', 'is.gd', 'cutt.ly', 'rb.gy', 
  'shorturl.at', 'wa.me', 't.me', 'v.gd', 'clck.ru', 's.id'
]);

const DANGEROUS_EXTENSIONS = ['.apk', '.exe', '.dex', '.vbs', '.scr', '.bat', '.cmd', '.msi'];

function extractUrls(text = '') {
  if (!text || typeof text !== 'string') return [];
  const urlRegex = /(?:https?:\/\/|www\.)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?|(?:[a-zA-Z0-9.-]+\.(?:xyz|top|club|work|click|buzz|cc|tk|ml|ga|cf|gq|site|online|vip|icu|apk))(?:\/[^\s]*)?/gi;
  const matches = text.match(urlRegex) || [];
  return Array.from(new Set(matches));
}

async function checkGoogleSafeBrowsing(urls = []) {
  const apiKey = process.env.GOOGLE_SAFE_BROWSING_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey || urls.length === 0) {
    return { checked: false, matches: [] };
  }

  const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`;
  const entries = urls.map(u => {
    let fullUrl = u;
    if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
      fullUrl = 'http://' + fullUrl;
    }
    return { url: fullUrl };
  });

  const payload = {
    client: {
      clientId: 'kavach-ai-defense',
      clientVersion: '1.0.0'
    },
    threatInfo: {
      threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
      platformTypes: ['ANY_PLATFORM'],
      threatEntryTypes: ['URL'],
      threatEntries: entries
    }
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      const matches = data.matches || [];
      return {
        checked: true,
        matches: matches.map(m => ({
          url: m.threat?.url,
          threatType: m.threatType,
          platformType: m.platformType
        }))
      };
    }
  } catch (err) {
    console.warn('Google Safe Browsing query error:', err.message);
  }

  return { checked: false, matches: [] };
}

async function analyzeUrlForensics(text = '') {
  const urls = extractUrls(text);
  if (urls.length === 0) {
    return {
      hasUrls: false,
      urls: [],
      isAllowlisted: false,
      isGoogleBlacklisted: false,
      googleThreatType: null,
      hasBrandMismatch: false,
      spoofedBrand: null,
      hasShortener: false,
      hasSuspiciousTld: false,
      hasApkDownload: false,
      hasIpHost: false,
      urlRisk: 0.0,
      details: []
    };
  }

  let isAllowlisted = false;
  let hasBrandMismatch = false;
  let spoofedBrand = null;
  let hasShortener = false;
  let hasSuspiciousTld = false;
  let hasApkDownload = false;
  let hasIpHost = false;
  let urlRisk = 0.0;
  const details = [];

  for (const rawUrl of urls) {
    let normalized = rawUrl.toLowerCase();
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = 'http://' + normalized;
    }

    let parsedHost = '';
    let parsedPath = '';
    try {
      const uObj = new URL(normalized);
      parsedHost = uObj.hostname.toLowerCase();
      parsedPath = uObj.pathname.toLowerCase() + uObj.search.toLowerCase();
    } catch (e) {
      parsedHost = rawUrl.split('/')[0].toLowerCase();
    }

    // 1. Official Allowlist Check
    const isOfficial = OFFICIAL_INDIAN_DOMAINS.some(d => parsedHost === d || parsedHost.endsWith('.' + d));
    if (isOfficial) {
      isAllowlisted = true;
      details.push({ url: rawUrl, status: 'ALLOWLISTED', note: 'Official Verified Indian Portal' });
      continue;
    }

    // 2. Shortener Check
    if (SHORTENERS.has(parsedHost) || Array.from(SHORTENERS).some(s => parsedHost.endsWith('.' + s))) {
      hasShortener = true;
      urlRisk = Math.max(urlRisk, 0.45);
      details.push({ url: rawUrl, status: 'SHORTENER', note: 'URL shortener masking true destination' });
    }

    // 3. Suspicious TLD Check
    const tldMatch = Array.from(SUSPICIOUS_TLDS).find(tld => parsedHost.endsWith(tld));
    if (tldMatch) {
      hasSuspiciousTld = true;
      urlRisk = Math.max(urlRisk, 0.55);
      details.push({ url: rawUrl, status: 'SUSPICIOUS_TLD', note: `High-risk unverified TLD (${tldMatch})` });
    }

    // 4. Malicious APK Payload Check
    const hasApk = DANGEROUS_EXTENSIONS.some(ext => parsedPath.endsWith(ext) || parsedPath.includes(ext + '?') || parsedHost.endsWith('.apk'));
    if (hasApk) {
      hasApkDownload = true;
      urlRisk = Math.max(urlRisk, 0.90);
      details.push({ url: rawUrl, status: 'MALICIOUS_APK', note: 'Direct Android APK malware download payload' });
    }

    // 5. Raw IP Hostname Check
    const isIp = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(parsedHost);
    if (isIp) {
      hasIpHost = true;
      urlRisk = Math.max(urlRisk, 0.70);
      details.push({ url: rawUrl, status: 'RAW_IP', note: 'Raw numerical IP address used as hostname' });
    }

    // 6. Brand Spoofing & Impersonation
    for (const [brand, keywords] of Object.entries(BRAND_KEYWORDS)) {
      const mentionsBrand = keywords.some(k => parsedHost.includes(k) || (parsedPath.includes(k) && !isOfficial));
      if (mentionsBrand && !isOfficial) {
        hasBrandMismatch = true;
        spoofedBrand = brand.toUpperCase();
        urlRisk = Math.max(urlRisk, 0.85);
        details.push({ 
          url: rawUrl, 
          status: 'BRAND_SPOOF', 
          note: `Impersonating ${brand.toUpperCase()} on unverified host ${parsedHost}` 
        });
        break;
      }
    }
  }

  // 7. Live Google Safe Browsing Lookup
  const gsb = await checkGoogleSafeBrowsing(urls);
  const isGoogleBlacklisted = gsb.matches.length > 0;
  let googleThreatType = null;

  if (isGoogleBlacklisted) {
    urlRisk = 1.0;
    googleThreatType = gsb.matches[0].threatType;
    details.push({
      url: gsb.matches[0].url,
      status: 'GOOGLE_SAFE_BROWSING_BLACKLIST',
      note: `Blacklisted by Google Safe Browsing (${googleThreatType})`
    });
  }

  return {
    hasUrls: true,
    urls,
    isAllowlisted,
    isGoogleBlacklisted,
    googleThreatType,
    hasBrandMismatch,
    spoofedBrand,
    hasShortener,
    hasSuspiciousTld,
    hasApkDownload,
    hasIpHost,
    urlRisk,
    details
  };
}

module.exports = {
  extractUrls,
  checkGoogleSafeBrowsing,
  analyzeUrlForensics,
  OFFICIAL_INDIAN_DOMAINS
};
