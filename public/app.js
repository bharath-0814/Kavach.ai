document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // DRIBBBLE-GRADE 3D WEBGL CYBER SHIELD ENGINE (THREE.JS)
  // =========================================================================
  let pulse3dShield = null;
  const webglCanvas = document.getElementById('webglCanvas');

  if (typeof THREE !== 'undefined' && webglCanvas && window.innerWidth >= 992) {
    try {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
      camera.position.set(0, 0, 16);

      const renderer = new THREE.WebGLRenderer({
        canvas: webglCanvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);

      // Lights
      const ambientLight = new THREE.AmbientLight(0x0a0f1d, 2.0);
      scene.add(ambientLight);

      const goldPointLight = new THREE.PointLight(0xd4af37, 3.5, 35);
      goldPointLight.position.set(5, 5, 8);
      scene.add(goldPointLight);

      const cyanPointLight = new THREE.PointLight(0x38bdf8, 3.0, 35);
      cyanPointLight.position.set(-5, -5, 8);
      scene.add(cyanPointLight);

      const threatPulseLight = new THREE.PointLight(0xf43f5e, 0, 30);
      threatPulseLight.position.set(0, 0, 5);
      scene.add(threatPulseLight);

      // Central Holographic Shield Group
      const shieldGroup = new THREE.Group();
      scene.add(shieldGroup);

      // 1. Outer Hologram Geodesic Shield (Gold Wireframe)
      const outerGeo = new THREE.IcosahedronGeometry(2.8, 1);
      const outerMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        wireframe: true,
        transparent: true,
        opacity: 0.45,
        roughness: 0.1,
        metalness: 0.95
      });
      const outerMesh = new THREE.Mesh(outerGeo, outerMat);
      shieldGroup.add(outerMesh);

      // 2. Inner Faceted Dark Obsidian Core
      const innerGeo = new THREE.OctahedronGeometry(1.6, 0);
      const innerMat = new THREE.MeshPhysicalMaterial({
        color: 0x070913,
        emissive: 0x1e1b4b,
        emissiveIntensity: 0.6,
        roughness: 0.15,
        metalness: 0.9,
        flatShading: true,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1
      });
      const innerMesh = new THREE.Mesh(innerGeo, innerMat);
      shieldGroup.add(innerMesh);

      // 3. Glowing Cyan Node Center
      const coreGeo = new THREE.SphereGeometry(0.65, 24, 24);
      const coreMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      shieldGroup.add(coreMesh);

      // 4. Orbiting Gyro Defense Rings
      const ring1Geo = new THREE.TorusGeometry(3.6, 0.022, 16, 100);
      const ring1Mat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.1 });
      const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
      ring1.rotation.x = Math.PI / 3;
      shieldGroup.add(ring1);

      const ring2Geo = new THREE.TorusGeometry(3.1, 0.018, 16, 100);
      const ring2Mat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.9, roughness: 0.1 });
      const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
      ring2.rotation.y = Math.PI / 4;
      shieldGroup.add(ring2);

      const ring3Geo = new THREE.TorusGeometry(2.4, 0.015, 16, 100);
      const ring3Mat = new THREE.MeshStandardMaterial({ color: 0xc084fc, metalness: 0.9, roughness: 0.1 });
      const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
      ring3.rotation.z = Math.PI / 6;
      shieldGroup.add(ring3);

      // 5. 3D Floating Particle Cloud
      const particleCount = 700;
      const particleGeo = new THREE.BufferGeometry();
      const particlePos = new Float32Array(particleCount * 3);
      const particleColors = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i++) {
        particlePos[i * 3] = (Math.random() - 0.5) * 50;
        particlePos[i * 3 + 1] = (Math.random() - 0.5) * 50;
        particlePos[i * 3 + 2] = (Math.random() - 0.5) * 30;

        const isGold = Math.random() > 0.4;
        particleColors[i * 3] = isGold ? 0.83 : 0.22;
        particleColors[i * 3 + 1] = isGold ? 0.68 : 0.74;
        particleColors[i * 3 + 2] = isGold ? 0.21 : 0.97;
      }

      particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
      particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

      const particleMat = new THREE.PointsMaterial({
        size: 0.09,
        vertexColors: true,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending
      });
      const particlePoints = new THREE.Points(particleGeo, particleMat);
      scene.add(particlePoints);

      // Mouse Parallax & Inertia
      let mouseX = 0;
      let mouseY = 0;
      let targetRotX = 0;
      let targetRotY = 0;
      let scrollFraction = 0;
      let pulseIntensity = 0;

      window.addEventListener('mousemove', e => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        targetRotY = mouseX * 0.4;
        targetRotX = mouseY * 0.4;

        goldPointLight.position.x = mouseX * 8 + 5;
        goldPointLight.position.y = -mouseY * 8 + 5;
      });

      window.addEventListener('scroll', () => {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        scrollFraction = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      }, { passive: true });

      // Pulse function for live scans
      pulse3dShield = function(verdict) {
        pulseIntensity = 1.0;
        if (verdict === 'high_risk') {
          threatPulseLight.color.setHex(0xf43f5e);
          coreMat.color.setHex(0xf43f5e);
          innerMat.emissive.setHex(0x881337);
        } else if (verdict === 'suspicious') {
          threatPulseLight.color.setHex(0xf59e0b);
          coreMat.color.setHex(0xf59e0b);
          innerMat.emissive.setHex(0x78350f);
        } else {
          threatPulseLight.color.setHex(0x10b981);
          coreMat.color.setHex(0x10b981);
          innerMat.emissive.setHex(0x064e3b);
        }
      };

      // Animation Loop
      let clock = new THREE.Clock();

      function animate() {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        // 3D Model Choreography across Scroll Stages
        let targetX, targetY, targetZ, targetScale;

        if (scrollFraction < 0.2) {
          // Hero Section: Majestic Center-Right
          const t = scrollFraction / 0.2;
          targetX = 3.6 + t * 0.8;
          targetY = 0.5 - t * 0.8;
          targetZ = 0 - t * 1.5;
          targetScale = 1.05;
        } else if (scrollFraction < 0.5) {
          // Terminal Section: Floating beside input
          const t = (scrollFraction - 0.2) / 0.3;
          targetX = 4.4 - t * 7.5; // Glides to left
          targetY = -0.3 + t * 0.6;
          targetZ = -1.5 + t * 0.5;
          targetScale = 0.95 + t * 0.15;
        } else if (scrollFraction < 0.8) {
          // Deobfuscator & Feed Section: Orbiting
          const t = (scrollFraction - 0.5) / 0.3;
          targetX = -3.1 + t * 6.5;
          targetY = 0.3 - t * 0.8;
          targetZ = -1.0 - t * 1.5;
          targetScale = 1.1 - t * 0.2;
        } else {
          // Architecture & Footer: Centered deep space
          const t = (scrollFraction - 0.8) / 0.2;
          targetX = 3.4 - t * 3.4;
          targetY = -0.5 - t * 1.5;
          targetZ = -2.5 - t * 2.0;
          targetScale = 0.9 + t * 0.3;
        }

        // Smooth Lerp Transitions
        shieldGroup.position.x += (targetX - shieldGroup.position.x) * 0.06;
        shieldGroup.position.y += (targetY - shieldGroup.position.y) * 0.06;
        shieldGroup.position.z += (targetZ - shieldGroup.position.z) * 0.06;

        const currentScale = targetScale * (1 + pulseIntensity * 0.3);
        shieldGroup.scale.set(currentScale, currentScale, currentScale);

        // Rotations
        const spinSpeed = 1 + pulseIntensity * 3.5;
        outerMesh.rotation.y += 0.005 * spinSpeed;
        outerMesh.rotation.x += 0.003 * spinSpeed;

        innerMesh.rotation.y -= 0.008 * spinSpeed;
        innerMesh.rotation.z += 0.004 * spinSpeed;

        ring1.rotation.z += 0.012 * spinSpeed;
        ring2.rotation.x += 0.015 * spinSpeed;
        ring3.rotation.y += 0.01 * spinSpeed;

        // Mouse Parallax
        shieldGroup.rotation.y += (targetRotY - shieldGroup.rotation.y) * 0.05;
        shieldGroup.rotation.x += (targetRotX - shieldGroup.rotation.x) * 0.05;

        // Particle field drift
        particlePoints.rotation.y = elapsedTime * 0.02;
        particlePoints.rotation.x = elapsedTime * 0.01;

        // Decay pulse
        if (pulseIntensity > 0.01) {
          pulseIntensity *= 0.94;
          threatPulseLight.intensity = pulseIntensity * 4.0;
        } else {
          pulseIntensity = 0;
          threatPulseLight.intensity = 0;
        }

        renderer.render(scene, camera);
      }

      animate();

      window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });

    } catch (err) {
      console.warn('[Three.js 3D] Failed to init WebGL:', err);
    }
  }

  // Elements
  const smsInput = document.getElementById('smsInput');
  const charCount = document.getElementById('charCount');
  const clearBtn = document.getElementById('clearBtn');
  const scanBtn = document.getElementById('scanBtn');
  const btnText = document.getElementById('btnText');
  const btnIcon = document.getElementById('btnIcon');

  // Round 2 Elements: Mode Switcher, Similar Scams, Batch Mode
  const tabSingleMode = document.getElementById('tabSingleMode');
  const tabBatchMode = document.getElementById('tabBatchMode');
  const singlePresetsWrap = document.getElementById('singlePresetsWrap');
  const batchPresetsWrap = document.getElementById('batchPresetsWrap');
  const loadBatchDemoBtn = document.getElementById('loadBatchDemoBtn');
  const loadGovBatchBtn = document.getElementById('loadGovBatchBtn');
  const engineBadgeText = document.getElementById('engineBadgeText');

  const similarScamsContainer = document.getElementById('similarScamsContainer');
  const similarScamsList = document.getElementById('similarScamsList');
  const similarScamsCount = document.getElementById('similarScamsCount');

  const batchResultsSection = document.getElementById('batchResultsSection');
  const batchSummaryStrip = document.getElementById('batchSummaryStrip');
  const batchResultsList = document.getElementById('batchResultsList');

  let currentScanMode = 'single'; // 'single' | 'batch'

  const resultsSection = document.getElementById('resultsSection');
  const verdictBadge = document.getElementById('verdictBadge');
  const scoreCircle = document.getElementById('scoreCircle');
  const riskScoreNumber = document.getElementById('riskPercent') || document.getElementById('riskScoreNumber');
  const scamTypePill = document.getElementById('scamTypeBadge') || document.getElementById('scamTypePill');
  const ruleScoreVal = document.getElementById('ruleScoreVal');
  const ruleBar = document.getElementById('ruleBar');
  const aiScoreVal = document.getElementById('aiScoreVal');
  const aiBar = document.getElementById('aiBar');
  const aiReasoning = document.getElementById('aiReasoning');
  const triggersContainer = document.getElementById('triggersContainer');
  const deobfRaw = document.getElementById('deobfRaw');
  const deobfClean = document.getElementById('deobfClean');
  const copyJsonBtn = document.getElementById('copyJsonBtn');
  const urlBox = document.getElementById('urlBox');
  const urlDetails = document.getElementById('urlDetails');

  // Stats Elements
  const statTotalScanned = document.getElementById('statTotalScanned');
  const statScamsBlocked = document.getElementById('statScamsBlocked');
  const statThreatWords = document.getElementById('statThreatWords');

  // Feed Elements
  const feedTableBody = document.getElementById('feedTableBody');
  const refreshFeedBtn = document.getElementById('refreshFeedBtn');
  const exportLogsBtn = document.getElementById('exportLogsBtn');
  const feedSearchInput = document.getElementById('feedSearchInput');
  const feedFilterChips = document.querySelectorAll('.filter-btn-item, .filter-pill, .filter-btn');
  const loadMoreFeedBtn = document.getElementById('loadMoreFeedBtn');
  const viewAllFeedBtn = document.getElementById('viewAllFeedBtn');
  const feedCountInfo = document.getElementById('feedCountInfo');
  const presetChips = document.querySelectorAll('.preset-tag, .chip-btn, .preset-chip');

  // Side-by-Side Diff Workbench Elements (Image 2 Style)
  const sandboxInput = document.getElementById('sandboxInput');
  const testWordBtn = document.getElementById('testWordBtn');
  const diffOriginalVal = document.getElementById('diffOriginalVal');
  const diffNormalizedVal = document.getElementById('diffNormalizedVal');
  const thresholdSlider = document.getElementById('thresholdSlider');
  const thresholdReadout = document.getElementById('thresholdReadout');
  const thresholdStatusBadge = document.getElementById('thresholdStatusBadge');

  // Inline Threat Ingestion Inspector Elements (Image 1 Style)
  const highlightedMessageDisplay = document.getElementById('highlightedMessageDisplay');
  const riskIndexProgress = document.getElementById('riskIndexProgress');
  const riskIndexPct = document.getElementById('riskIndexPct');
  const riskIndexVerdict = document.getElementById('riskIndexVerdict');

  // Image & QR Dropzone Elements
  const tabImageMode = document.getElementById('tabImageMode');
  const tabUrlMode = document.getElementById('tabUrlMode');
  const imageDropzone = document.getElementById('imageDropzone');
  const dropzoneTrigger = document.getElementById('dropzoneTrigger');
  const imageFileInput = document.getElementById('imageFileInput');
  const browseImageBtn = document.getElementById('browseImageBtn');
  const imagePreviewStrip = document.getElementById('imagePreviewStrip');
  const imagePreviewThumbnail = document.getElementById('imagePreviewThumbnail');
  const imagePreviewName = document.getElementById('imagePreviewName');
  const imageOcrStatus = document.getElementById('imageOcrStatus');
  const clearImageBtn = document.getElementById('clearImageBtn');

  let currentAnalysisData = null;
  let cachedFlags = [];
  let activeFilterType = 'ALL';
  let feedVisibleLimit = 10;
  const FEED_PAGE_STEP = 10;

  // Client-side Safe Words Protection Dictionary (prevents false-positive matches on benign vocabulary)
  const CLIENT_SAFE_WORDS = new Set([
    'on', 'in', 'at', 'to', 'is', 'it', 'as', 'an', 'be', 'or', 'by', 'of',
    'we', 'me', 'us', 'up', 'my', 'do', 'go', 'so', 'no', 'if', 'he', 'ok',
    'your', 'you', 'will', 'with', 'from', 'this', 'that', 'have', 'here',
    'there', 'where', 'when', 'what', 'which', 'who', 'how', 'why', 'can',
    'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some',
    'such', 'than', 'too', 'very', 'just', 'now', 'then', 'also', 'about',
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
    'chahte', 'job', 'work', 'daily', 'videos', 'photo', 'income', 'earning',
    'baithe', 'kamana', 'kamaye', 'like', 'subscribe', 'channel', 'message',
    'send', 'share', 'contact', 'whatsapp', 'telegram', 'youtube', 'car', 'bike',
    'home', 'house', 'city', 'delhi', 'mumbai', 'bangalore', 'pune', 'chennai'
  ]);

  // Comprehensive Cyber Fraud, Phishing & Smishing Threat Lexicon (All Categories)
  const CLIENT_THREAT_LEXICON = [
    // Banking & Financial Credentials
    'credit', 'creditcard', 'debit', 'debitcard', 'card', 'cards', 'cvv', 'cvv2',
    'pin', 'mpin', 'tpin', 'password', 'passcode', 'passkey', 'otp', 'one-time-password',
    'bank', 'banking', 'netbanking', 'account', 'acct', 'khata', 'balance', 'paisa',
    'rupee', 'rupees', 'cash', 'fund', 'funds', 'transfer', 'neft', 'rtgs', 'imps',
    'upi', 'vpa', 'mandate', 'autodebit', 'autopay', 'limit', 'overdraft', 'cheque',
    'sbi', 'yono', 'hdfc', 'icici', 'axis', 'pnb', 'bob', 'kotak', 'canara', 'union',
    'paytm', 'phonepe', 'gpay', 'googlepay', 'bhim', 'cred', 'mobikwik', 'freecharge',
    
    // Account Suspension & Coercion
    'block', 'blocked', 'blocking', 'blck', 'blcked', 'b4nd', 'band', 'bandh',
    'suspend', 'suspended', 'suspension', 'deactivate', 'deactivated', 'deactivation',
    'freeze', 'frozen', 'freezing', 'lock', 'locked', 'terminate', 'terminated',
    'termination', 'disconnect', 'disconnected', 'disconnection', 'cutoff', 'cut',
    'hold', 'lapse', 'lapsed', 'expire', 'expired', 'expiry', 'expiring',
    'penalty', 'fine', 'charges', 'overdue', 'unpaid', 'due', 'bill', 'ebill',
    
    // Verification & Identity Theft (KYC / PAN / Aadhaar)
    'kyc', 're-kyc', 'rekyc', 'pan', 'pancard', 'aadhaar', 'aadhar', 'uidai',
    'update', 'updated', 'updating', 'updt', 'verify', 'verified', 'verification',
    'v3rify', 'authenticate', 'authentication', 'authorize', 'authorization',
    'submit', 'submission', 'upload', 'document', 'documents', 'biometric',
    'identity', 'credential', 'credentials', 'login', 'signin', 'portal', 'link',
    
    // Urgency & Coercive Timelines
    'urgent', 'urgently', 'urget', 'immediate', 'immediately', 'immed1ate',
    'turant', 'jaldi', 'aaj', 'kal', 'raat', 'tonight', 'today', 'hours', 'ghante',
    'minutes', 'warna', 'warning', 'warn', 'alert', 'notice', 'caution', 'deadline',
    'mandatory', 'compulsory', 'require', 'required', 'action',
    
    // Utility & Electricity Scams
    'bijli', 'electricity', 'power', 'substation', 'meter', 'officer', 'department',
    'uppcl', 'bses', 'tangedco', 'bescom', 'wbsedcl', 'tatapower', 'adani', 'dhbvn',
    'connection', 'lineman', 'helpline',
    
    // Legal Threat, Extortion & Digital Arrest
    'police', 'cbi', 'ed', 'cybercell', 'cybercrime', 'crime', 'warrant', 'court',
    'summons', 'arrest', 'fir', 'investigation', 'narcotics', 'customs', 'seizure',
    'trai', 'rbi', 'sebi', 'incometax', 'tax', 'challan', 'echallan', 'e-challan',
    'parivahan', 'mparivahan', 'rto', 'traffic', 'violation',
    
    // Postal, Package & Courier Scams
    'parcel', 'package', 'courier', 'consignment', 'shipment', 'delivery', 'deliver',
    'undelivered', 'failed', 'returned', 'reschedule', 'address', 'indiapost',
    'speedpost', 'bluedart', 'dtdc', 'delhivery', 'tracking',
    
    // Lottery, Rewards, Cashback & Task Scams
    'lottery', 'inam', 'prize', 'jackpot', 'winner', 'won', 'winning', 'claim',
    'reward', 'rewards', 'rewardpoints', 'cashback', 'bonus', 'refund', 'rebate',
    'crore', 'lakh', 'lakhs', 'kbc', 'lucky', 'draw', 'gift', 'voucher', 'coupon',
    'task', 'job', 'part-time', 'full-time', 'wfh', 'commission', 'investment',
    'invest', 'profit', 'trading', 'crypto', 'bitcoin', 'usdt', 'salary', 'income',
    'earn', 'earning', 'daily', 'ghar-baithe', 'baithe', 'kamana', 'kamaye',
    
    // Telecom & Malicious Software / Remote Access
    'sim', 'simcard', 'esim', '5g', '4g', 'port', 'porting', 'simswap', 'recharge',
    'validity', 'anydesk', 'teamviewer', 'quicksupport', 'rustdesk', 'airmirror',
    'screen', 'remote', 'mirror', 'support', 'download', 'install', 'apk', 'app'
  ];

  const CLIENT_LEET_MAP = {
    '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b',
    '@': 'a', '$': 's', '!': 'i', '+': 't', '|': 'i'
  };

  function clientLevenshtein(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  // Side-by-Side Diff Workbench Logic (Image 2 Style)
  function renderDiffWorkbench(rawWord, threshold = 2) {
    if (!diffOriginalVal || !diffNormalizedVal) return;
    if (!rawWord || !rawWord.trim()) {
      diffOriginalVal.innerHTML = '<span style="color: var(--text-faint);">--</span>';
      diffNormalizedVal.innerHTML = '<span style="color: var(--text-faint);">--</span>';
      if (thresholdReadout) thresholdReadout.textContent = 'd = -';
      if (thresholdStatusBadge) {
        thresholdStatusBadge.className = 'threshold-status-badge clean';
        thresholdStatusBadge.textContent = 'awaiting';
      }
      return;
    }

    const cleanRaw = rawWord.trim();
    const thresh = Number(threshold);

    // 1. Separation collapse & Leet translation
    let collapsed = cleanRaw.replace(/(?<=\b[a-zA-Z0-9])[.\-_/|\\](?=[a-zA-Z0-9]\b)/g, '').replace(/\s+/g, '');
    let leet = '';
    for (let i = 0; i < collapsed.length; i++) {
      const c = collapsed[i].toLowerCase();
      leet += CLIENT_LEET_MAP[c] || c;
    }

    const lowerInput = cleanRaw.toLowerCase();

    // Check safe words
    if (CLIENT_SAFE_WORDS.has(lowerInput) || CLIENT_SAFE_WORDS.has(leet)) {
      diffOriginalVal.innerHTML = `<span class="diff-char-clean">${escapeHtml(cleanRaw)}</span>`;
      diffNormalizedVal.innerHTML = `<span class="diff-char-clean">${escapeHtml(lowerInput)}</span>`;
      if (thresholdReadout) thresholdReadout.textContent = 'd = 0';
      if (thresholdStatusBadge) {
        thresholdStatusBadge.className = 'threshold-status-badge clean';
        thresholdStatusBadge.textContent = 'safe';
      }
      return;
    }

    // Levenshtein search for nearest threat
    let bestMatch = 'None';
    let minDist = Infinity;

    for (const threat of CLIENT_THREAT_LEXICON) {
      const dist = clientLevenshtein(leet, threat);
      if (dist < minDist) {
        minDist = dist;
        bestMatch = threat;
      }
    }

    // Diff highlighting for original input (Image 2 style)
    let origHtml = '';
    const normUpper = bestMatch.toUpperCase();
    for (let i = 0; i < cleanRaw.length; i++) {
      const ch = cleanRaw[i];
      const trans = (CLIENT_LEET_MAP[ch.toLowerCase()] || ch).toUpperCase();
      if (i < normUpper.length && trans === normUpper[i]) {
        origHtml += `<span class="diff-char-threat">${escapeHtml(ch)}</span>`;
      } else {
        origHtml += `<span class="diff-char-mutated">${escapeHtml(ch)}</span>`;
      }
    }
    diffOriginalVal.innerHTML = origHtml;

    // Normalized Threat Display in Green (Image 2 style)
    diffNormalizedVal.innerHTML = `<span class="diff-char-clean">${escapeHtml(bestMatch.toUpperCase())}</span>`;

    if (thresholdReadout) {
      thresholdReadout.textContent = `d = ${minDist} edit${minDist !== 1 ? 's' : ''} (closest: "${bestMatch.toUpperCase()}")`;
    }

    if (thresholdStatusBadge) {
      if (minDist <= thresh) {
        thresholdStatusBadge.className = 'threshold-status-badge flagged';
        thresholdStatusBadge.textContent = '🚨 Flagged as Scam Keyword';
      } else {
        thresholdStatusBadge.className = 'threshold-status-badge clean';
        thresholdStatusBadge.textContent = '🟢 Clean (Within Tolerance)';
      }
    }

    const deobfExplanationText = document.getElementById('deobfExplanationText');
    if (deobfExplanationText) {
      if (minDist <= thresh) {
        deobfExplanationText.innerHTML = `<strong>How it works:</strong> Disguised word <code>'${escapeHtml(cleanRaw)}'</code> requires <strong>${minDist} letter edit${minDist !== 1 ? 's' : ''}</strong> to match threat keyword <strong>"${escapeHtml(bestMatch.toUpperCase())}"</strong> (≤ sensitivity threshold ${thresh}). Kavach normalizes and flags it as smishing.`;
      } else {
        deobfExplanationText.innerHTML = `<strong>How it works:</strong> Disguised word <code>'${escapeHtml(cleanRaw)}'</code> is <strong>${minDist} edits away</strong> from closest keyword "${escapeHtml(bestMatch.toUpperCase())}" which exceeds threshold (${thresh}), so it is marked clean.`;
      }
    }
  }

  let currentDeobfThreshold = 2;
  const sensitivityPills = document.querySelectorAll('.sensitivity-btn');

  sensitivityPills.forEach(btn => {
    btn.addEventListener('click', () => {
      triggerHaptic('light');
      sensitivityPills.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentDeobfThreshold = parseInt(btn.getAttribute('data-thresh'), 10) || 2;
      renderDiffWorkbench(sandboxInput ? sandboxInput.value : '0TPP', currentDeobfThreshold);
    });
  });

  if (sandboxInput) {
    sandboxInput.addEventListener('input', () => {
      renderDiffWorkbench(sandboxInput.value, currentDeobfThreshold);
    });
  }

  if (testWordBtn) {
    testWordBtn.addEventListener('click', () => {
      triggerHaptic('light');
      renderDiffWorkbench(sandboxInput.value, currentDeobfThreshold);
    });
  }

  // Initial workbench run
  renderDiffWorkbench('0TPP', 2);

  // Mode Switching Logic (Single, Batch, Screenshot/QR, URL)
  function updateModeUI() {
    [tabSingleMode, tabBatchMode, tabImageMode, tabUrlMode].forEach(tab => {
      if (tab) {
        tab.classList.remove('active');
        tab.setAttribute('aria-selected', 'false');
      }
    });

    if (imageDropzone) imageDropzone.style.display = 'none';
    if (singlePresetsWrap) singlePresetsWrap.style.display = 'none';
    if (batchPresetsWrap) batchPresetsWrap.style.display = 'none';

    if (currentScanMode === 'single') {
      if (tabSingleMode) {
        tabSingleMode.classList.add('active');
        tabSingleMode.setAttribute('aria-selected', 'true');
      }
      if (singlePresetsWrap) singlePresetsWrap.style.display = 'block';
      smsInput.placeholder = "Paste suspicious SMS text here (Hindi, Hinglish, Tamil, Telugu, Leetspeak)... e.g. 'Y0UR SB1 ACC0UNT WILL BLCK T0DAY. UPDATE K-Y-C IMMED1ATE: http://bit.ly/sbi-kyc'";
      btnText.textContent = 'Execute Threat Vector Analysis';
      if (engineBadgeText) engineBadgeText.textContent = 'Engine: Deterministic Heuristic (40%) + Multi-Model Gemini Flash (60%)';
    } else if (currentScanMode === 'batch') {
      if (tabBatchMode) {
        tabBatchMode.classList.add('active');
        tabBatchMode.setAttribute('aria-selected', 'true');
      }
      if (batchPresetsWrap) batchPresetsWrap.style.display = 'block';
      smsInput.placeholder = "Paste multiple SMS messages here (1 message per line or separated by double newlines)...\n\nExample:\nMessage 1: Hello sir, kya aap ghar baithe daily Rs 3000-5000 kamana chahte hain? WhatsApp pe message karein\nMessage 2: Aapka bijli connection aaj raat 9 baje bandh ho jayega. Turant call karein aur 0TPP batayein\nMessage 3: Y0UR SB1 ACC0UNT WILL BLCK T0DAY. UPDATE K-Y-C IMMED1ATE\nMessage 4: Bhai kal shaam ko milte hain market me, chai peeyenge.";
      btnText.textContent = 'Execute Batch Threat Analysis';
      if (engineBadgeText) engineBadgeText.textContent = 'Engine: Multi-Message Batch Processing & Threat Correlation';
    } else if (currentScanMode === 'image') {
      if (tabImageMode) {
        tabImageMode.classList.add('active');
        tabImageMode.setAttribute('aria-selected', 'true');
      }
      if (imageDropzone) imageDropzone.style.display = 'block';
      if (singlePresetsWrap) singlePresetsWrap.style.display = 'block';
      smsInput.placeholder = "Paste screenshot (Ctrl+V) or drop QR code image above. Extracted text will appear here automatically...";
      btnText.textContent = 'Analyze Extracted Image Payload';
      if (engineBadgeText) engineBadgeText.textContent = 'Engine: jsQR Client Decoder + Gemini 2.5 Flash Multimodal OCR';
    } else if (currentScanMode === 'url') {
      if (tabUrlMode) {
        tabUrlMode.classList.add('active');
        tabUrlMode.setAttribute('aria-selected', 'true');
      }
      if (singlePresetsWrap) singlePresetsWrap.style.display = 'block';
      smsInput.placeholder = "Paste URL or domain to inspect against Google Safe Browsing & forensic database (e.g. 'https://sbi-kyc-update.xyz/mparivahan.apk')...";
      btnText.textContent = 'Inspect URL against Google Safe Browsing';
      if (engineBadgeText) engineBadgeText.textContent = 'Engine: Google Safe Browsing API v4 + Domain Spoofing Heuristics';
    }
    updateInputCount();
  }

  function updateInputCount() {
    const text = smsInput.value;
    if (currentScanMode === 'single' || currentScanMode === 'image' || currentScanMode === 'url') {
      charCount.textContent = `${text.length} characters`;
    } else {
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
      charCount.textContent = `${lines.length} message${lines.length !== 1 ? 's' : ''} detected`;
    }
  }

  if (tabSingleMode) {
    tabSingleMode.addEventListener('click', () => {
      triggerHaptic('light');
      currentScanMode = 'single';
      updateModeUI();
    });
  }

  if (tabBatchMode) {
    tabBatchMode.addEventListener('click', () => {
      triggerHaptic('light');
      currentScanMode = 'batch';
      updateModeUI();
    });
  }

  if (tabImageMode) {
    tabImageMode.addEventListener('click', () => {
      triggerHaptic('light');
      currentScanMode = 'image';
      updateModeUI();
    });
  }

  if (tabUrlMode) {
    tabUrlMode.addEventListener('click', () => {
      triggerHaptic('light');
      currentScanMode = 'url';
      updateModeUI();
    });
  }

  // Process Image File (Screenshot OCR + jsQR Decoding)
  async function processImageFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    triggerHaptic('medium');

    // Switch to image mode automatically
    currentScanMode = 'image';
    updateModeUI();

    if (imagePreviewStrip) imagePreviewStrip.style.display = 'flex';
    if (imagePreviewName) imagePreviewName.textContent = file.name || 'Pasted_Screenshot.png';
    if (imageOcrStatus) imageOcrStatus.textContent = '🔍 Decoding QR code & scanning image...';

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target.result;
      if (imagePreviewThumbnail) imagePreviewThumbnail.src = dataUrl;

      // 1. Attempt Client-Side Ultra-Fast QR Decoding (jsQR)
      const img = new Image();
      img.onload = async () => {
        let qrDecoded = null;
        if (typeof jsQR !== 'undefined') {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, img.width, img.height);
            const imageData = ctx.getImageData(0, 0, img.width, img.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'dontInvert'
            });
            if (code && code.data) {
              qrDecoded = code.data;
            }
          } catch (qrErr) {
            console.warn('jsQR decoding attempt:', qrErr.message);
          }
        }

        if (qrDecoded) {
          if (imageOcrStatus) imageOcrStatus.textContent = `✅ QR Payload Extracted: ${qrDecoded.substring(0, 40)}...`;
          smsInput.value = qrDecoded;
          updateInputCount();
          runClassification(qrDecoded);
          return;
        }

        // 2. If not a QR code, run Multimodal Gemini Flash OCR for Screenshots
        if (imageOcrStatus) imageOcrStatus.textContent = '🤖 Extracting SMS / Chat text via Gemini Vision...';
        try {
          const res = await fetch('/api/ocr-scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image: dataUrl,
              mimeType: file.type || 'image/png'
            })
          });
          const json = await res.json();
          if (json.success && json.extracted_text) {
            if (imageOcrStatus) imageOcrStatus.textContent = '✅ Text Extracted Successfully!';
            smsInput.value = json.extracted_text;
            updateInputCount();
            runClassification(json.extracted_text);
          } else {
            if (imageOcrStatus) imageOcrStatus.textContent = '⚠️ No clear text or QR code detected in image.';
          }
        } catch (ocrErr) {
          if (imageOcrStatus) imageOcrStatus.textContent = '⚠️ OCR extraction failed: ' + ocrErr.message;
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }

  // Global Clipboard Paste Event Handler (Ctrl+V Image Support)
  window.addEventListener('paste', (e) => {
    const items = (e.clipboardData || e.originalEvent?.clipboardData)?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          processImageFile(file);
          break;
        }
      }
    }
  });

  // Dropzone Click & Drag-and-Drop Event Handlers
  if (browseImageBtn && imageFileInput) {
    browseImageBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      imageFileInput.click();
    });
  }

  if (dropzoneTrigger && imageFileInput) {
    dropzoneTrigger.addEventListener('click', () => {
      imageFileInput.click();
    });
  }

  if (imageFileInput) {
    imageFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        processImageFile(e.target.files[0]);
      }
    });
  }

  if (imageDropzone) {
    ['dragenter', 'dragover'].forEach(eventName => {
      imageDropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        imageDropzone.classList.add('drag-over');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      imageDropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        imageDropzone.classList.remove('drag-over');
      }, false);
    });

    imageDropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt?.files;
      if (files && files[0]) {
        processImageFile(files[0]);
      }
    });
  }

  // Unified Reset Function for Text, Batch, Image, and OCR states
  function clearAllInputs() {
    triggerHaptic('light');
    if (smsInput) {
      smsInput.value = '';
    }
    updateInputCount();
    if (imagePreviewStrip) {
      imagePreviewStrip.style.cssText = 'display: none !important;';
    }
    if (imageFileInput) {
      imageFileInput.value = '';
    }
    if (imagePreviewThumbnail) {
      imagePreviewThumbnail.src = '';
      imagePreviewThumbnail.removeAttribute('src');
    }
    if (imageOcrStatus) imageOcrStatus.textContent = '';
    if (imagePreviewName) imagePreviewName.textContent = '';
    if (resultsSection) resultsSection.style.display = 'none';
    if (batchResultsSection) batchResultsSection.style.display = 'none';
    if (smsInput) smsInput.focus();
  }

  if (clearImageBtn) {
    clearImageBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      clearAllInputs();
    });
  }

  // Batch Presets
  if (loadBatchDemoBtn) {
    loadBatchDemoBtn.addEventListener('click', () => {
      const sampleBatch = [
        "Hello sir, kya aap ghar baithe daily Rs 3000-5000 kamana chahte hain? YouTube videos like karo aur screenshot bhejo. Part-time job zero investment: https://wa.me/919876543210",
        "Aapka bijli connection aaj raat 9 baje bandh ho jayega. Turant is number pe call karein aur 0TPP batayein.",
        "Y0UR SB1 ACC0UNT WILL BLCK T0DAY. UPDATE K-Y-C IMMED1ATE: http://bit.ly/sbi-kyc",
        "Bhai kal shaam ko milte hain market me, chai peeyenge."
      ].join('\n\n');
      smsInput.value = sampleBatch;
      updateInputCount();
      runBatchClassification(sampleBatch);
    });
  }

  if (loadGovBatchBtn) {
    loadGovBatchBtn.addEventListener('click', () => {
      const govBatch = [
        "Notice: Traffic challan DL-01-AB-1234 fine Rs. 1000 is pending. Download mParivahan.apk to pay immediately: https://echallan-pay.xyz/mparivahan.apk",
        "India Post: Your package IN98234 delivery failed due to incorrect address. Please update your address within 24 hours: https://indiapost-update.top/track",
        "Dear consumer, your electricity power will be disconnected at 9:30 PM due to unpaid bill. Call electricity officer now: 9876543210"
      ].join('\n\n');
      smsInput.value = govBatch;
      updateInputCount();
      runBatchClassification(govBatch);
    });
  }

  // Character counter & message counter
  smsInput.addEventListener('input', () => {
    updateInputCount();
  });

  // Clear button (Removes text, pasted images, and diagnostics)
  clearBtn.addEventListener('click', () => {
    clearAllInputs();
  });

  // Preset chips (Single mode)
  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      triggerHaptic('light');
      const msg = chip.getAttribute('data-msg');
      if (msg) {
        smsInput.value = msg;
        updateInputCount();
        runClassification(msg);
      }
    });
  });

  // Custom Cyber Modal Controllers for Empty Input
  const emptyInputModal = document.getElementById('emptyInputModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const modalDismissBtn = document.getElementById('modalDismissBtn');
  const modalSampleBtn = document.getElementById('modalSampleBtn');

  function openEmptyModal() {
    if (emptyInputModal) {
      emptyInputModal.style.display = 'flex';
      requestAnimationFrame(() => {
        emptyInputModal.classList.add('active');
      });
    }
  }

  function closeEmptyModal() {
    if (emptyInputModal) {
      emptyInputModal.classList.remove('active');
      setTimeout(() => {
        emptyInputModal.style.display = 'none';
        smsInput.focus();
      }, 220);
    }
  }

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeEmptyModal);
  if (modalDismissBtn) modalDismissBtn.addEventListener('click', closeEmptyModal);
  if (emptyInputModal) {
    emptyInputModal.addEventListener('click', e => {
      if (e.target === emptyInputModal) closeEmptyModal();
    });
  }

  if (modalSampleBtn) {
    modalSampleBtn.addEventListener('click', () => {
      closeEmptyModal();
      const sample = 'Y0UR SB1 ACC0UNT WILL BLCK T0DAY. UPDATE K-Y-C IMMED1ATE: http://bit.ly/sbi-kyc';
      smsInput.value = sample;
      updateInputCount();
      runClassification(sample);
    });
  }

  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && emptyInputModal && emptyInputModal.classList.contains('active')) {
      closeEmptyModal();
    }
  });

  // Scan Button Click (Single / Batch Router)
  scanBtn.addEventListener('click', () => {
    triggerHaptic('medium');
    const text = smsInput.value.trim();
    if (!text) {
      openEmptyModal();
      return;
    }
    if (currentScanMode === 'single') {
      runClassification(text);
    } else {
      runBatchClassification(text);
    }
  });

  // Copy JSON Button
  copyJsonBtn.addEventListener('click', () => {
    if (!currentAnalysisData) return;
    navigator.clipboard.writeText(JSON.stringify(currentAnalysisData, null, 2)).then(() => {
      copyJsonBtn.textContent = '✅ Copied!';
      setTimeout(() => {
        copyJsonBtn.textContent = '📋 Copy JSON';
      }, 2000);
    });
  });

  // Main Classification Function (Single Mode)
  async function runClassification(message) {
    scanBtn.disabled = true;
    btnText.textContent = 'Analyzing Threat...';
    btnIcon.textContent = '⏳';
    if (batchResultsSection) batchResultsSection.style.display = 'none';

    try {
      const res = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      currentAnalysisData = data;
      displayResults(data);
      // Refresh live threat feed & live stats
      fetchRecentFlags();
      fetchStats();
    } catch (err) {
      console.error('Classification error:', err);
      alert('Classification failed: ' + err.message);
    } finally {
      scanBtn.disabled = false;
      btnText.textContent = 'Analyze SMS Threat';
      btnIcon.textContent = '🛡️';
    }
  }

  // Display Result in Dashboard
  function displayResults(data) {
    const { risk_score, verdict, scam_type, trigger_phrases, breakdown, reasoning, message } = data;
    const percentage = Math.round(risk_score * 100);

    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Tactile Verdict Haptic Pulse
    triggerHaptic(verdict === 'high_risk' ? 'threat' : (verdict === 'suspicious' ? 'medium' : 'safe'));

    // Trigger 3D WebGL Hologram Pulse Shockwave
    if (typeof pulse3dShield === 'function') {
      pulse3dShield(verdict);
    }

    riskScoreNumber.textContent = `${percentage}%`;

    const circumference = 377;
    const offset = circumference - (circumference * (percentage / 100));
    scoreCircle.style.strokeDashoffset = offset;

    verdictBadge.className = `threat-verdict-pill ${verdict}`;
    if (verdict === 'high_risk') {
      verdictBadge.innerHTML = '<span>🚨 HIGH RISK PHISHING</span>';
      scoreCircle.style.stroke = '#f43f5e';
    } else if (verdict === 'suspicious') {
      verdictBadge.innerHTML = '<span>⚠️ SUSPICIOUS MESSAGE</span>';
      scoreCircle.style.stroke = '#f59e0b';
    } else {
      verdictBadge.innerHTML = '<span>✅ SAFE & VERIFIED</span>';
      scoreCircle.style.stroke = '#10b981';
    }

    scamTypePill.textContent = `CATEGORY: ${scam_type || 'GENERAL'}`;

    const rulePercent = Math.round((breakdown?.rule_score || 0) * 100);
    const aiPercent = Math.round((breakdown?.gemini_confidence || 0) * 100);

    ruleScoreVal.textContent = `${rulePercent}%`;
    ruleBar.style.width = `${rulePercent}%`;

    aiScoreVal.textContent = `${aiPercent}%`;
    aiBar.style.width = `${aiPercent}%`;

    // Render Inline Highlighted Threat Text (Image 1 Style)
    const urlAnalysis = breakdown?.url_analysis;
    if (highlightedMessageDisplay) {
      let rawMsg = message || data.message || (smsInput ? smsInput.value : '');
      let highlightedHtml = escapeHtml(rawMsg);

      // Collect all triggers, fuzzy matches, and URLs
      const triggers = (trigger_phrases || []).slice();
      if (breakdown?.fuzzy_matches) {
        breakdown.fuzzy_matches.forEach(fm => {
          if (fm.original && !triggers.includes(fm.original)) triggers.push(fm.original);
        });
      }

      // Sort by length descending to prevent partial match conflicts
      triggers.sort((a, b) => b.length - a.length);

      const BRAND_ENTITIES = ['sbi', 'sb1', 'yono', 'hdfc', 'icici', 'axis', 'pnb', 'india post', 'indiapost', 'parivahan', 'mparivahan', 'electricity', 'bijli', 'uppcl', 'bses', 'income tax', 'incometax', 'uidai', 'aadhaar', 'paytm', 'phonepe', 'gpay'];

      triggers.forEach(trig => {
        if (!trig || trig.trim().length === 0) return;
        const escapedTrig = escapeHtml(trig).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const lowerTrig = trig.toLowerCase();

        let colorClass = 'amber';
        if (BRAND_ENTITIES.some(b => lowerTrig.includes(b))) {
          colorClass = 'cyan';
        } else if (lowerTrig.includes('block') || lowerTrig.includes('blck') || lowerTrig.includes('cut') || lowerTrig.includes('otp') || lowerTrig.includes('kyc') || lowerTrig.includes('arrest') || lowerTrig.includes('urgent') || lowerTrig.includes('apk') || lowerTrig.includes('http') || lowerTrig.includes('wa.me')) {
          colorClass = 'red';
        }

        const regex = new RegExp(`(${escapedTrig})`, 'gi');
        highlightedHtml = highlightedHtml.replace(regex, `<span class="inline-threat-tag ${colorClass}">$1</span>`);
      });

      if (urlAnalysis?.urls) {
        urlAnalysis.urls.forEach(u => {
          const escapedU = escapeHtml(u).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`(${escapedU})`, 'gi');
          highlightedHtml = highlightedHtml.replace(regex, `<span class="inline-threat-tag red">$1</span>`);
        });
      }

      highlightedMessageDisplay.innerHTML = highlightedHtml || 'Awaiting SMS analysis...';
    }

    // Dynamic Cyber Response Shield Action List
    const actionShieldCard = document.getElementById('actionShieldCard');
    const actionShieldTitle = document.getElementById('actionShieldTitle');
    const actionShieldList = document.getElementById('actionShieldList');
    if (actionShieldCard && actionShieldTitle && actionShieldList) {
      if (verdict === 'high_risk') {
        actionShieldCard.style.borderColor = 'rgba(244, 63, 94, 0.4)';
        actionShieldTitle.style.color = 'var(--rose-threat)';
        actionShieldTitle.textContent = '🚨 Recommended Defense Protocol';
        actionShieldList.innerHTML = `
          <li>🚫 <strong>Do NOT Click or Reply:</strong> Never open links, send OTPs, or install APK files.</li>
          <li>📞 <strong>Report Incident:</strong> Call <strong>1930</strong> (National Cybercrime Helpline) or visit <strong>cybercrime.gov.in</strong>.</li>
          <li>🛡️ <strong>Block Sender:</strong> Add sender ID to your telecom spam blacklist immediately.</li>
        `;
      } else if (verdict === 'suspicious') {
        actionShieldCard.style.borderColor = 'rgba(245, 158, 11, 0.4)';
        actionShieldTitle.style.color = 'var(--amber-warn)';
        actionShieldTitle.textContent = '⚠️ Cautionary Protocol';
        actionShieldList.innerHTML = `
          <li>🔍 <strong>Verify Directly:</strong> Contact official bank/department via verified app only.</li>
          <li>🛡️ <strong>Never Share Credentials:</strong> Refuse any OTP, PIN, or remote app installation requests.</li>
        `;
      } else {
        actionShieldCard.style.borderColor = 'rgba(16, 185, 129, 0.3)';
        actionShieldTitle.style.color = 'var(--emerald-safe)';
        actionShieldTitle.textContent = '✅ Verified Safe Communication';
        actionShieldList.innerHTML = `
          <li>🟢 <strong>No Coercion Detected:</strong> Message contains no malicious URLs, financial coercion, or disguised leetspeak.</li>
        `;
      }
    }

    if (riskIndexProgress) {
      riskIndexProgress.style.width = `${percentage}%`;
      riskIndexProgress.style.background = verdict === 'high_risk' ? '#f43f5e' : (verdict === 'suspicious' ? '#f59e0b' : '#10b981');
    }
    if (riskIndexPct) {
      riskIndexPct.textContent = `${percentage}%`;
    }
    if (riskIndexVerdict) {
      riskIndexVerdict.className = `threat-verdict-pill ${verdict}`;
      riskIndexVerdict.textContent = verdict === 'high_risk' ? 'high risk' : verdict;
    }

    aiReasoning.textContent = reasoning || 'No reasoning details available.';

    // Trigger phrases
    triggersContainer.innerHTML = '';
    if (trigger_phrases && trigger_phrases.length > 0) {
      trigger_phrases.forEach(phrase => {
        const tag = document.createElement('span');
        tag.className = 'threat-tag';
        tag.textContent = phrase;
        triggersContainer.appendChild(tag);
      });
    } else {
      const tag = document.createElement('span');
      tag.className = 'threat-tag';
      tag.style.borderColor = 'rgba(16, 185, 129, 0.3)';
      tag.style.color = '#6ee7b7';
      tag.style.background = 'rgba(16, 185, 129, 0.1)';
      tag.textContent = 'No malicious triggers detected';
      triggersContainer.appendChild(tag);
    }

    // URL Inspection
    // URL Forensic Heuristics & Google Safe Browsing Verification
    if (urlBox && urlDetails) {
      if (urlAnalysis && urlAnalysis.urls && urlAnalysis.urls.length > 0) {
        urlBox.style.display = 'block';
        let badgesHtml = '';

        if (urlAnalysis.isGoogleBlacklisted) {
          badgesHtml += `<span class="threat-tag" style="background: rgba(244, 63, 94, 0.3); border-color: var(--accent-rose); color: #fda4af; font-weight: 800;">🚨 Google Safe Browsing: ${escapeHtml(urlAnalysis.googleThreatType || 'BLACKLISTED')}</span>`;
        }
        if (urlAnalysis.isAllowlisted) {
          badgesHtml += '<span class="threat-tag" style="background: rgba(16, 185, 129, 0.2); border-color: var(--accent-emerald); color: var(--accent-emerald); font-weight: 700;">✅ Verified Official Indian Domain</span>';
        }
        if (urlAnalysis.hasBrandMismatch) {
          badgesHtml += `<span class="threat-tag" style="background: rgba(244, 63, 94, 0.25); border-color: var(--accent-rose); color: var(--accent-rose); font-weight: 700;">🚨 Brand Impersonation: '${escapeHtml(urlAnalysis.spoofedBrand || 'BANK')}'</span>`;
        }
        if (urlAnalysis.hasShortener) {
          badgesHtml += '<span class="threat-tag" style="background: rgba(245, 158, 11, 0.2); border-color: var(--accent-amber); color: var(--accent-amber);">⚠️ URL Shortener Masking</span>';
        }
        if (urlAnalysis.hasSuspiciousTld) {
          badgesHtml += '<span class="threat-tag" style="background: rgba(244, 63, 94, 0.25); border-color: var(--accent-rose); color: var(--accent-rose);">🚨 Suspicious Unverified TLD</span>';
        }
        if (urlAnalysis.hasApkDownload) {
          badgesHtml += '<span class="threat-tag" style="background: rgba(244, 63, 94, 0.3); border-color: var(--accent-rose); color: var(--accent-rose); font-weight: 800;">🚨 Direct Malicious APK Download Payload</span>';
        }
        if (urlAnalysis.hasIpHost) {
          badgesHtml += '<span class="threat-tag" style="background: rgba(244, 63, 94, 0.25); border-color: var(--accent-rose); color: var(--accent-rose);">🚨 Numerical IP Host Address</span>';
        }

        let itemsHtml = '';
        if (urlAnalysis.details && urlAnalysis.details.length > 0) {
          itemsHtml = urlAnalysis.details.map(d => `
            <div class="url-forensic-item">
              <span style="color: ${d.status.includes('BLACKLIST') || d.status.includes('SPOOF') || d.status.includes('APK') ? '#fda4af' : (d.status === 'ALLOWLISTED' ? '#6ee7b7' : '#fcd34d')}; font-weight: 700;">
                [ ${escapeHtml(d.status)} ]
              </span>
              <span style="color: var(--text-pure); word-break: break-all; margin-left: 4px;">${escapeHtml(d.url)}</span>
              <span style="color: var(--text-muted); font-size: 0.72rem; margin-left: 6px;">— ${escapeHtml(d.note)}</span>
            </div>
          `).join('');
        }

        urlDetails.innerHTML = `
          <div style="margin-bottom: 0.55rem; display: flex; gap: 0.4rem; flex-wrap: wrap;">${badgesHtml}</div>
          <div class="url-forensic-card">
            ${itemsHtml || urlAnalysis.urls.map(u => `<div>🔗 <span style="color: var(--accent-cyan); word-break: break-all;">${escapeHtml(u)}</span></div>`).join('')}
          </div>
        `;
      } else {
        urlBox.style.display = 'none';
      }
    }

    // Deobfuscation Box
    if (deobfRaw) deobfRaw.textContent = `"${message}"`;
    if (deobfClean) {
      if (breakdown?.fuzzy_matches && breakdown.fuzzy_matches.length > 0) {
        const matchText = breakdown.fuzzy_matches
          .map(fm => `${fm.original} ➔ "${fm.matchedWord}" (dist: ${fm.distance})`)
          .join(', ');
        deobfClean.textContent = matchText;
      } else {
        deobfClean.textContent = 'Clean / Standard Text (No Levenshtein Obfuscation Detected)';
      }
    }

    // FEATURE 1: Render Similar Past Scams from Turso Threat Intelligence Feed
    if (similarScamsContainer && similarScamsList) {
      if (data.similar_flags && data.similar_flags.length > 0) {
        similarScamsContainer.style.display = 'block';
        if (similarScamsCount) {
          similarScamsCount.textContent = `${data.similar_flags.length} historical match${data.similar_flags.length > 1 ? 'es' : ''}`;
        }
        similarScamsList.innerHTML = data.similar_flags.map((flag, idx) => {
          const scorePct = Math.round((flag.risk_score || 0) * 100);
          const badgeClass = flag.verdict === 'high_risk' ? 'high_risk' : (flag.verdict === 'suspicious' ? 'suspicious' : 'safe');
          const badgeText = flag.verdict === 'high_risk' ? '🚨 HIGH RISK' : (flag.verdict === 'suspicious' ? '⚠️ SUSPICIOUS' : '✅ SAFE');
          const timeStr = flag.created_at ? new Date(flag.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent';
          const cleanMsg = flag.message || '';
          const truncated = cleanMsg.length > 130 ? cleanMsg.substring(0, 130) + '...' : cleanMsg;

          // Clean discrete trigger tags
          let triggerChipsHtml = '';
          if (flag.trigger_phrases && flag.trigger_phrases.length > 0) {
            const cleanTriggers = flag.trigger_phrases
              .map(t => typeof t === 'string' ? t.trim() : '')
              .filter(t => t.length > 0 && t.length < 35)
              .slice(0, 3);

            if (cleanTriggers.length > 0) {
              triggerChipsHtml = cleanTriggers.map(t => {
                const isLink = t.startsWith('http') || t.includes('.top') || t.includes('.xyz') || t.includes('.apk') || t.includes('wa.me');
                return `<span class="similar-trigger-pill ${isLink ? 'link' : 'phrase'}">${isLink ? '🔗 ' : '🚨 '}${escapeHtml(t)}</span>`;
              }).join('');
            }
          }

          return `
            <div class="similar-scam-card ${badgeClass}">
              <div class="similar-scam-top">
                <div class="similar-scam-badges">
                  <span class="similar-badge ${badgeClass}">${badgeText} • ${scorePct}%</span>
                  <span class="similar-category-pill">${escapeHtml(flag.scam_type || 'THREAT')}</span>
                </div>
                <div class="similar-scam-actions">
                  <span class="similar-time">🕒 ${timeStr}</span>
                  <button type="button" class="similar-load-btn" data-scam-idx="${idx}">
                    ⚡ Load & Test
                  </button>
                </div>
              </div>
              <div class="similar-scam-msg-box">
                <span class="similar-quote-icon">“</span>
                <span class="similar-quote-text">${escapeHtml(truncated)}</span>
              </div>
              ${triggerChipsHtml ? `
                <div class="similar-scam-triggers-row">
                  <span class="triggers-mini-label">MATCHED SIGNATURES:</span>
                  <div class="triggers-mini-list">${triggerChipsHtml}</div>
                </div>
              ` : ''}
            </div>
          `;
        }).join('');

        // Wire up "Load & Test" button click handlers
        similarScamsList.querySelectorAll('.similar-load-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            triggerHaptic('light');
            const idx = parseInt(btn.getAttribute('data-scam-idx'), 10);
            const targetFlag = data.similar_flags[idx];
            if (targetFlag && targetFlag.message) {
              smsInput.value = targetFlag.message;
              updateInputCount();
              window.scrollTo({ top: smsInput.offsetTop - 80, behavior: 'smooth' });
              runClassification(targetFlag.message);
            }
          });
        });
      } else {
        similarScamsContainer.style.display = 'none';
      }
    }
  }

  // FEATURE 2: Batch Classification Function
  async function runBatchClassification(rawText) {
    const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) {
      openEmptyModal();
      return;
    }

    scanBtn.disabled = true;
    btnText.textContent = `Analyzing ${lines.length} Messages in Batch...`;
    btnIcon.textContent = '⏳';
    resultsSection.style.display = 'none';

    try {
      const res = await fetch('/api/classify-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: lines })
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      renderBatchResults(data);

      // Trigger 3D WebGL Hologram Pulse
      if (typeof pulse3dShield === 'function') {
        pulse3dShield(data.scams_detected > 0 ? 'high_risk' : 'safe');
      }

      // Refresh live threat feed & live stats
      fetchRecentFlags();
      fetchStats();
    } catch (err) {
      console.error('Batch classification error:', err);
      alert('Batch classification failed: ' + err.message);
    } finally {
      scanBtn.disabled = false;
      btnText.textContent = 'Execute Batch Threat Analysis';
      btnIcon.textContent = '🛡️';
    }
  }

  // Render Batch Results Dashboard
  function renderBatchResults(data) {
    if (!batchResultsSection || !batchResultsList) return;

    const { total, scams_detected, results } = data;
    const safeCount = total - scams_detected;

    // Summary Strip
    if (batchSummaryStrip) {
      batchSummaryStrip.innerHTML = `
        <span class="batch-summary-pill">Total: <strong>${total}</strong> Messages</span>
        <span class="batch-summary-pill rose">🚨 <strong>${scams_detected}</strong> Scams Blocked</span>
        <span class="batch-summary-pill emerald">✅ <strong>${safeCount}</strong> Clean / Safe</span>
        <span class="batch-summary-pill" style="color: var(--cyan-accent); border-color: rgba(56, 189, 248, 0.3);">⚡ Sub-45ms / Msg</span>
      `;
    }

    // Results List
    batchResultsList.innerHTML = results.map(item => {
      const scorePct = Math.round((item.risk_score || 0) * 100);
      const isHighRisk = item.verdict === 'high_risk';
      const isSuspicious = item.verdict === 'suspicious';
      const badgeClass = isHighRisk ? 'high_risk' : (isSuspicious ? 'suspicious' : 'safe');
      const badgeText = isHighRisk ? '🚨 HIGH RISK' : (isSuspicious ? '⚠️ SUSPICIOUS' : '✅ SAFE');

      return `
        <div class="batch-item-card ${badgeClass}">
          <div class="batch-item-header">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="batch-item-index">#${item.index}</span>
              <span class="threat-verdict-pill ${badgeClass}" style="font-size: 0.72rem; padding: 2px 8px;">
                ${badgeText} (${scorePct}%)
              </span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.4rem;">
              <span style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--gold-light); font-weight: 600;">
                ${escapeHtml(item.scam_type || 'GENERAL')}
              </span>
            </div>
          </div>

          <div class="batch-item-msg">"${escapeHtml(item.message)}"</div>

          <div class="batch-item-footer">
            <div style="display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;">
              <span style="font-family: var(--font-mono); font-size: 0.68rem; color: var(--text-faint);">Top Trigger:</span>
              <span class="threat-tag" style="padding: 2px 6px; font-size: 0.68rem;">${escapeHtml(item.top_trigger || 'None')}</span>
              ${item.trigger_phrases && item.trigger_phrases.length > 1 ? `
                <span class="threat-tag" style="padding: 2px 6px; font-size: 0.68rem;">${escapeHtml(item.trigger_phrases[1])}</span>
              ` : ''}
            </div>

            <button class="batch-reasoning-toggle" onclick="toggleBatchReasoning(${item.index})">
              <span>View AI Reasoning ▼</span>
            </button>
          </div>

          <div class="batch-reasoning-box" id="batchReasoning_${item.index}">
            <strong style="color: var(--gold-light);">AI Diagnostic Reasoning:</strong> ${escapeHtml(item.reasoning || 'Heuristic rules + Gemini Flash evaluation.')}
          </div>
        </div>
      `;
    }).join('');

    batchResultsSection.style.display = 'block';
    batchResultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Global toggle for batch reasoning accordion
  window.toggleBatchReasoning = function(index) {
    const box = document.getElementById(`batchReasoning_${index}`);
    if (box) {
      box.style.display = box.style.display === 'block' ? 'none' : 'block';
    }
  };

  // High-Refresh-Rate Tactile Feedback Engine (Haptics & Micro-Interactions)
  function triggerHaptic(type = 'light') {
    if (!('vibrate' in navigator)) return;
    try {
      if (type === 'light') {
        navigator.vibrate(8); // Subtle 8ms micro-click
      } else if (type === 'medium') {
        navigator.vibrate(18); // Solid 18ms action feedback
      } else if (type === 'threat') {
        navigator.vibrate([25, 35, 20]); // High-priority pulse for threats
      } else if (type === 'safe') {
        navigator.vibrate(12);
      }
    } catch (e) {
      // Ignore vibration errors if blocked by OS policy
    }
  }

  // 120Hz/144Hz Display Interpolator (Apple / Linear Ease Curve)
  function animateNumberTicker(el, start, end, duration = 1000, suffix = '') {
    if (!el) return;
    const startVal = parseInt(String(start).replace(/[^0-9]/g, '')) || 0;
    const endVal = parseInt(String(end).replace(/[^0-9]/g, '')) || 0;
    if (isNaN(endVal) || startVal === endVal) {
      el.textContent = end + suffix;
      return;
    }
    const startTime = performance.now();
    const diff = endVal - startVal;

    function frame(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Apple cubic-out easing curve: 1 - pow(1 - progress, 3.5)
      const ease = 1 - Math.pow(1 - progress, 3.5);
      const current = Math.round(startVal + diff * ease);
      el.textContent = current.toLocaleString() + suffix;

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        el.textContent = endVal.toLocaleString() + suffix;
      }
    }
    requestAnimationFrame(frame);
  }

  // Fetch Live DB Stats with 120Hz/144Hz Ticker Animation
  async function fetchStats() {
    try {
      const res = await fetch('/api/stats');
      if (!res.ok) return;
      const json = await res.json();
      if (json?.stats) {
        if (statTotalScanned) {
          const currentText = statTotalScanned.textContent;
          animateNumberTicker(statTotalScanned, currentText === '--' ? 0 : currentText, json.stats.total_scanned);
        }
        if (statScamsBlocked) {
          const currentText = statScamsBlocked.textContent;
          animateNumberTicker(statScamsBlocked, currentText === '--' ? 0 : currentText, json.stats.scams_blocked);
        }
        if (statThreatWords) {
          statThreatWords.textContent = json.stats.total_threat_words ? `${json.stats.total_threat_words}+` : '600+';
        }
      }
    } catch (e) {
      console.warn('Stats fetch error:', e);
    }
  }

  // Fetch Recent Flags from Turso Cloud DB
  async function fetchRecentFlags() {
    try {
      const res = await fetch('/api/recent-flags?limit=100');
      if (!res.ok) throw new Error('Failed to fetch flags');
      const json = await res.json();
      cachedFlags = json.data || [];
      filterAndRenderFeed();
    } catch (err) {
      console.warn('Feed fetch error:', err);
      feedTableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">
            Unable to fetch threat logs. Turso Cloud DB may be initializing.
          </td>
        </tr>
      `;
    }
  }

  // Filter and Render Feed Table
  function filterAndRenderFeed() {
    const searchQuery = (feedSearchInput?.value || '').toLowerCase().trim();
    let filtered = cachedFlags;

    if (activeFilterType !== 'ALL') {
      filtered = filtered.filter(f => f.scam_type === activeFilterType);
    }

    if (searchQuery) {
      filtered = filtered.filter(f => 
        (f.message || '').toLowerCase().includes(searchQuery) ||
        (f.scam_type || '').toLowerCase().includes(searchQuery)
      );
    }

    renderFeed(filtered);
  }

  function renderFeed(flags) {
    if (!flags || flags.length === 0) {
      feedTableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">
            No matching threat logs found in Turso Cloud.
          </td>
        </tr>
      `;
      if (feedCountInfo) feedCountInfo.textContent = '0 logs';
      if (loadMoreFeedBtn) loadMoreFeedBtn.style.display = 'none';
      if (viewAllFeedBtn) viewAllFeedBtn.style.display = 'none';
      return;
    }

    const totalCount = flags.length;
    const itemsToDisplay = flags.slice(0, feedVisibleLimit);
    const displayedCount = itemsToDisplay.length;

    // Update count info text
    if (feedCountInfo) {
      if (displayedCount < totalCount) {
        feedCountInfo.textContent = `Showing top ${displayedCount} of ${totalCount} logs`;
      } else {
        feedCountInfo.textContent = `Showing all ${totalCount} log${totalCount === 1 ? '' : 's'}`;
      }
    }

    // Update Load More & View All buttons
    if (loadMoreFeedBtn) {
      if (displayedCount < totalCount) {
        loadMoreFeedBtn.style.display = 'inline-flex';
        const remaining = totalCount - displayedCount;
        const nextBatch = Math.min(FEED_PAGE_STEP, remaining);
        loadMoreFeedBtn.innerHTML = `<span>➕ Load ${nextBatch} More Logs (+${nextBatch})</span>`;
      } else if (totalCount > 10) {
        loadMoreFeedBtn.style.display = 'inline-flex';
        loadMoreFeedBtn.innerHTML = '<span>▲ Show Less (Top 10)</span>';
      } else {
        loadMoreFeedBtn.style.display = 'none';
      }
    }

    if (viewAllFeedBtn) {
      if (displayedCount < totalCount && totalCount > 10) {
        viewAllFeedBtn.style.display = 'inline-flex';
        viewAllFeedBtn.innerHTML = `<span>⚡ View All (${totalCount}) Logs</span>`;
      } else {
        viewAllFeedBtn.style.display = 'none';
      }
    }

    feedTableBody.innerHTML = itemsToDisplay.map(item => {
      const scorePct = Math.round((item.risk_score || 0) * 100);
      let badgeClass = 'high_risk';
      let badgeLabel = 'HIGH RISK';
      if (item.verdict === 'suspicious') {
        badgeClass = 'suspicious';
        badgeLabel = 'SUSPICIOUS';
      } else if (item.verdict === 'safe') {
        badgeClass = 'safe';
        badgeLabel = 'SAFE';
      }

      return `
        <tr>
          <td><strong style="color: ${item.verdict === 'high_risk' ? 'var(--accent-rose)' : (item.verdict === 'suspicious' ? 'var(--accent-amber)' : 'var(--accent-emerald)')}; font-family: var(--font-mono); font-weight: 800;">${scorePct}%</strong></td>
          <td><span class="threat-verdict-pill ${badgeClass}" style="margin: 0; padding: 0.2rem 0.55rem; font-size: 0.7rem;">${badgeLabel}</span></td>
          <td><span style="font-family: var(--font-mono); font-size: 0.78rem; color: var(--accent-cyan);">${item.scam_type || 'SCAM'}</span></td>
          <td><div class="feed-text-msg" title="${escapeHtml(item.message)}">${escapeHtml(item.message)}</div></td>
          <td style="color: var(--text-muted); font-size: 0.78rem; font-family: var(--font-mono);">${item.created_at || 'Just now'}</td>
        </tr>
      `;
    }).join('');
  }

  // Progressive Load More / Reset Toggle
  if (loadMoreFeedBtn) {
    loadMoreFeedBtn.addEventListener('click', () => {
      const currentFilteredTotal = (activeFilterType !== 'ALL' || (feedSearchInput?.value || '').trim())
        ? cachedFlags.filter(f => {
            const matchesType = activeFilterType === 'ALL' || f.scam_type === activeFilterType;
            const q = (feedSearchInput?.value || '').toLowerCase().trim();
            const matchesQuery = !q || (f.message || '').toLowerCase().includes(q) || (f.scam_type || '').toLowerCase().includes(q);
            return matchesType && matchesQuery;
          }).length
        : cachedFlags.length;

      if (feedVisibleLimit >= currentFilteredTotal) {
        // Reset to top 10
        feedVisibleLimit = 10;
      } else {
        // Increment by 10
        feedVisibleLimit += FEED_PAGE_STEP;
      }
      filterAndRenderFeed();
    });
  }

  // View All Logs Button
  if (viewAllFeedBtn) {
    viewAllFeedBtn.addEventListener('click', () => {
      feedVisibleLimit = 9999;
      filterAndRenderFeed();
    });
  }

  function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Feed Filter chips click
  feedFilterChips.forEach(btn => {
    btn.addEventListener('click', () => {
      feedFilterChips.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilterType = btn.getAttribute('data-type');
      feedVisibleLimit = 10; // Reset to 10 on filter switch
      filterAndRenderFeed();
    });
  });

  // Search input in Feed
  if (feedSearchInput) {
    feedSearchInput.addEventListener('input', () => {
      feedVisibleLimit = 10; // Reset to 10 on new search query
      filterAndRenderFeed();
    });
  }

  // Refresh Feed Button
  refreshFeedBtn.addEventListener('click', () => {
    refreshFeedBtn.textContent = '⏳ Refreshing...';
    fetchRecentFlags().finally(() => {
      refreshFeedBtn.textContent = '🔄 Refresh Feed';
    });
    fetchStats();
  });

  // Export JSON Logs
  if (exportLogsBtn) {
    exportLogsBtn.addEventListener('click', () => {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(cachedFlags, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `kavach_threat_logs_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    });
  }

  // Initial loads
  fetchRecentFlags();
  fetchStats();

  // Service Worker Registration with "Tap to Update" Notification
  const swUpdateToast = document.getElementById('swUpdateToast');
  const swReloadBtn = document.getElementById('swReloadBtn');
  const swDismissBtn = document.getElementById('swDismissBtn');

  function showSwUpdateToast(worker) {
    if (!swUpdateToast) return;
    swUpdateToast.style.display = 'block';
    requestAnimationFrame(() => swUpdateToast.classList.add('show'));

    if (swReloadBtn) {
      swReloadBtn.onclick = () => {
        if (worker) {
          worker.postMessage({ type: 'SKIP_WAITING' });
        }
        window.location.reload();
      };
    }
  }

  if (swDismissBtn) {
    swDismissBtn.addEventListener('click', () => {
      if (swUpdateToast) {
        swUpdateToast.classList.remove('show');
        setTimeout(() => { swUpdateToast.style.display = 'none'; }, 300);
      }
    });
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => {
          console.log('[PWA] Service Worker registered:', reg.scope);
          reg.update();

          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  showSwUpdateToast(newWorker);
                }
              });
            }
          });
        })
        .catch(err => console.warn('[PWA] Service Worker registration failed:', err));

      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    });
  }

  // Handle PWA Install Prompt
  let deferredPrompt;
  const installPwaBtn = document.getElementById('installPwaBtn');

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    if (installPwaBtn) {
      installPwaBtn.style.display = 'inline-flex';
    }
  });

  if (installPwaBtn) {
    installPwaBtn.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        installPwaBtn.style.display = 'none';
      }
      deferredPrompt = null;
    });
  }

  window.addEventListener('appinstalled', () => {
    if (installPwaBtn) installPwaBtn.style.display = 'none';
    console.log('Kavach PWA successfully installed!');
  });

  // =========================================================================
  // 3D SPATIAL SCROLL & PARALLAX PERSPECTIVE CONTROLLER (LAPTOP / DESKTOP)
  // =========================================================================
  const toggle3dBtn = document.getElementById('toggle3dBtn');
  const spatialStatusBadge = document.getElementById('spatialStatusBadge');
  const spatialTelemetry = document.getElementById('spatialTelemetry');
  const spatialCards = document.querySelectorAll('.hero-editorial, .arch-card, .results-container, .editorial-footer');

  let is3dEnabled = window.innerWidth >= 992;

  function update3dUIState() {
    if (is3dEnabled && window.innerWidth >= 992) {
      document.body.classList.add('mode-3d');
      if (spatialStatusBadge) {
        spatialStatusBadge.textContent = 'ON';
        spatialStatusBadge.style.color = 'var(--emerald-safe)';
        spatialStatusBadge.style.borderColor = 'rgba(16, 185, 129, 0.3)';
        spatialStatusBadge.style.background = 'rgba(16, 185, 129, 0.15)';
      }
    } else {
      document.body.classList.remove('mode-3d');
      if (spatialStatusBadge) {
        spatialStatusBadge.textContent = 'OFF';
        spatialStatusBadge.style.color = 'var(--text-faint)';
        spatialStatusBadge.style.borderColor = 'rgba(100, 116, 139, 0.3)';
        spatialStatusBadge.style.background = 'rgba(100, 116, 139, 0.15)';
      }
      spatialCards.forEach(card => {
        card.style.removeProperty('--card-pitch');
        card.style.removeProperty('--card-yaw');
        card.style.removeProperty('--card-z');
        card.style.removeProperty('--glow-alpha');
      });
      if (spatialTelemetry) {
        spatialTelemetry.textContent = '3D Inactive (Press 3)';
      }
    }
  }

  if (toggle3dBtn) {
    toggle3dBtn.addEventListener('click', () => {
      is3dEnabled = !is3dEnabled;
      update3dUIState();
      requestSpatialUpdate();
    });
  }

  // Keyboard shortcut: Press '3' or 'D' to toggle 3D mode
  window.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === '3' || e.key === 'd' || e.key === 'D') {
      is3dEnabled = !is3dEnabled;
      update3dUIState();
      requestSpatialUpdate();
    }
  });

  // 3D Spatial Calculation Loop with requestAnimationFrame
  let scrollTicking = false;

  function updateSpatialTransform() {
    if (!is3dEnabled || window.innerWidth < 992) {
      scrollTicking = false;
      return;
    }

    const vh = window.innerHeight;
    const viewCenterY = vh / 2;

    let dominantPitch = 0;
    let dominantZ = 0;

    spatialCards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const cardCenterY = rect.top + rect.height / 2;
      const distFromCenter = cardCenterY - viewCenterY;
      const normalizedDist = Math.max(-1, Math.min(1, distFromCenter / (vh * 0.65)));

      // Dynamic 3D Pitch: tilts slightly as it enters, flattens at eye level
      const pitch = (normalizedDist * 5.5).toFixed(2);
      // Dynamic Z-Depth: in center focus (+22px), off center (-35px)
      const depthZ = ((1 - Math.abs(normalizedDist)) * 32 - 12).toFixed(1);
      // Center glow alpha
      const glowAlpha = Math.max(0.02, (1 - Math.abs(normalizedDist)) * 0.12).toFixed(3);

      card.style.setProperty('--card-pitch', `${pitch}deg`);
      card.style.setProperty('--card-z', `${depthZ}px`);
      card.style.setProperty('--glow-alpha', `${glowAlpha}`);

      // Track most prominent card for HUD telemetry
      if (Math.abs(distFromCenter) < vh * 0.35) {
        dominantPitch = pitch;
        dominantZ = depthZ;
      }
    });

    // Update Telemetry HUD
    if (spatialTelemetry) {
      const sign = dominantPitch >= 0 ? '+' : '';
      const zSign = dominantZ >= 0 ? '+' : '';
      spatialTelemetry.textContent = `Pitch: ${sign}${dominantPitch}° • Z: ${zSign}${dominantZ}px`;
    }

    scrollTicking = false;
  }

  function requestSpatialUpdate() {
    if (!scrollTicking) {
      requestAnimationFrame(updateSpatialTransform);
      scrollTicking = true;
    }
  }

  window.addEventListener('scroll', requestSpatialUpdate, { passive: true });
  window.addEventListener('resize', () => {
    if (window.innerWidth < 992 && is3dEnabled) {
      is3dEnabled = false;
      update3dUIState();
    } else if (window.innerWidth >= 992 && !is3dEnabled) {
      is3dEnabled = true;
      update3dUIState();
    }
    requestSpatialUpdate();
  });

  // Interactive 3D Cursor Specular Light on Cards
  spatialCards.forEach(card => {
    card.addEventListener('mousemove', e => {
      if (!is3dEnabled || window.innerWidth < 992) return;
      const rect = card.getBoundingClientRect();
      const localX = e.clientX - rect.left;
      const localY = e.clientY - rect.top;
      const percentX = ((localX / rect.width) * 100).toFixed(1);
      const percentY = ((localY / rect.height) * 100).toFixed(1);

      const yaw = (((localX / rect.width) - 0.5) * 3.2).toFixed(2);

      card.style.setProperty('--specular-x', `${percentX}%`);
      card.style.setProperty('--specular-y', `${percentY}%`);
      card.style.setProperty('--card-yaw', `${yaw}deg`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--card-yaw', '0deg');
    });
  });

  // Initial trigger on load
  update3dUIState();
  requestSpatialUpdate();
});
