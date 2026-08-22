document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // DRIBBBLE-GRADE 3D WEBGL CYBER SHIELD ENGINE (THREE.JS)
  // =========================================================================
  let pulse3dShield = null;
  const webglCanvas = document.getElementById('webglCanvas');

  if (typeof THREE !== 'undefined' && webglCanvas) {
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
  const feedCountInfo = document.getElementById('feedCountInfo');
  const presetChips = document.querySelectorAll('.preset-tag, .chip-btn, .preset-chip');

  // Sandbox Elements
  const sandboxInput = document.getElementById('sandboxInput');
  const testWordBtn = document.getElementById('testWordBtn');
  const sbLeet = document.getElementById('sbLeet');
  const sbThreat = document.getElementById('sbThreat');
  const sbDist = document.getElementById('sbDist');
  const sbVerdict = document.getElementById('sbVerdict');

  let currentAnalysisData = null;
  let cachedFlags = [];
  let activeFilterType = 'ALL';
  let showAllLogs = false;
  const INITIAL_FEED_LIMIT = 11;

  // Client-side threat dictionary for sandbox
  const CLIENT_THREAT_LEXICON = [
    'block', 'blocked', 'band', 'bandh', 'rok', 'suspend', 'suspended', 
    'deactivate', 'deactivated', 'expire', 'expired', 'disconnect', 'disconnected', 
    'terminate', 'freeze', 'frozen', 'penalty', 'challan', 'kyc', 'pan', 'aadhaar', 
    'aadhar', 'pancard', 'update', 'updated', 'verify', 'verification', 're-kyc', 
    'submit', 'document', 'otp', 'pin', 'password', 'passcode', 'cvv', 'credential',
    'bank', 'account', 'khata', 'paisa', 'balance', 'yono', 'sbi', 'hdfc', 'icici', 
    'pnb', 'axis', 'bob', 'paytm', 'phonepe', 'gpay', 'urgent', 'turant', 'jaldi', 
    'immediate', 'immediately', 'warning', 'warn', 'hours', 'ghante', 'today',
    'lottery', 'inam', 'reward', 'cashback', 'bonus', 'refund', 'winner', 'won', 
    'claim', 'crore', 'lakh', 'prize', 'bijli', 'electricity', 'ebill', 'power', 
    'bill', 'officer', 'police', 'cbi', 'trai', 'customs', 'click', 'download', 
    'install', 'link', 'apk', 'login'
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

  function runSandbox(rawWord) {
    if (!rawWord || !rawWord.trim()) return;
    const cleanRaw = rawWord.trim();

    // 1. Separation collapse
    let collapsed = cleanRaw.replace(/(?<=\b[a-zA-Z0-9])[.\-_/|\\](?=[a-zA-Z0-9]\b)/g, '');

    // 2. Leet translation
    let leet = '';
    for (let i = 0; i < collapsed.length; i++) {
      const c = collapsed[i].toLowerCase();
      leet += CLIENT_LEET_MAP[c] || c;
    }
    sbLeet.textContent = `"${leet}"`;

    // 3. Levenshtein search
    let bestMatch = 'None';
    let minDist = Infinity;

    for (const threat of CLIENT_THREAT_LEXICON) {
      const dist = clientLevenshtein(leet, threat);
      if (dist < minDist) {
        minDist = dist;
        bestMatch = threat;
      }
    }

    sbThreat.textContent = `"${bestMatch}"`;
    sbDist.textContent = `d = ${minDist} (${minDist <= 2 ? 'Match ≤ 2' : 'No Match'})`;

    if (minDist <= 2) {
      sbVerdict.innerHTML = '<span style="color: var(--accent-rose);">🚨 Obfuscation Caught</span>';
    } else {
      sbVerdict.innerHTML = '<span style="color: var(--accent-emerald);">🟢 Safe / Unmatched</span>';
    }
  }

  sandboxInput.addEventListener('input', () => {
    runSandbox(sandboxInput.value);
  });
  testWordBtn.addEventListener('click', () => {
    runSandbox(sandboxInput.value);
  });
  // Initial sandbox run
  runSandbox('BLCK');

  // Mode Switching Logic (Feature 2)
  function updateModeUI() {
    if (currentScanMode === 'single') {
      if (tabSingleMode) {
        tabSingleMode.classList.add('active');
        tabSingleMode.setAttribute('aria-selected', 'true');
      }
      if (tabBatchMode) {
        tabBatchMode.classList.remove('active');
        tabBatchMode.setAttribute('aria-selected', 'false');
      }

      if (singlePresetsWrap) singlePresetsWrap.style.display = 'block';
      if (batchPresetsWrap) batchPresetsWrap.style.display = 'none';

      smsInput.placeholder = "Paste suspicious SMS text here (Hindi, Hinglish, Tamil, Telugu, Leetspeak)... e.g. 'Y0UR SB1 ACC0UNT WILL BLCK T0DAY. UPDATE K-Y-C IMMED1ATE: http://bit.ly/sbi-kyc'";
      btnText.textContent = 'Execute Threat Vector Analysis';
      if (engineBadgeText) engineBadgeText.textContent = 'Engine: Deterministic Heuristic (40%) + Multi-Model Gemini Flash (60%)';
      updateInputCount();
    } else {
      if (tabSingleMode) {
        tabSingleMode.classList.remove('active');
        tabSingleMode.setAttribute('aria-selected', 'false');
      }
      if (tabBatchMode) {
        tabBatchMode.classList.add('active');
        tabBatchMode.setAttribute('aria-selected', 'true');
      }

      if (singlePresetsWrap) singlePresetsWrap.style.display = 'none';
      if (batchPresetsWrap) batchPresetsWrap.style.display = 'block';

      smsInput.placeholder = "Paste multiple SMS messages here (1 message per line or separated by double newlines)...\n\nExample:\nMessage 1: Hello sir, kya aap ghar baithe daily Rs 3000-5000 kamana chahte hain? WhatsApp pe message karein\nMessage 2: Aapka bijli connection aaj raat 9 baje bandh ho jayega. Turant call karein aur 0TPP batayein\nMessage 3: Y0UR SB1 ACC0UNT WILL BLCK T0DAY. UPDATE K-Y-C IMMED1ATE\nMessage 4: Bhai kal shaam ko milte hain market me, chai peeyenge.";
      btnText.textContent = 'Execute Batch Threat Analysis';
      if (engineBadgeText) engineBadgeText.textContent = 'Engine: Multi-Message Batch Processing & Threat Correlation';
      updateInputCount();
    }
  }

  function updateInputCount() {
    const text = smsInput.value;
    if (currentScanMode === 'single') {
      charCount.textContent = `${text.length} characters`;
    } else {
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
      charCount.textContent = `${lines.length} message${lines.length !== 1 ? 's' : ''} detected`;
    }
  }

  if (tabSingleMode) {
    tabSingleMode.addEventListener('click', () => {
      currentScanMode = 'single';
      updateModeUI();
    });
  }

  if (tabBatchMode) {
    tabBatchMode.addEventListener('click', () => {
      currentScanMode = 'batch';
      updateModeUI();
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

  // Clear button
  clearBtn.addEventListener('click', () => {
    smsInput.value = '';
    updateInputCount();
    resultsSection.style.display = 'none';
    if (batchResultsSection) batchResultsSection.style.display = 'none';
    smsInput.focus();
  });

  // Preset chips (Single mode)
  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const msg = chip.getAttribute('data-msg');
      if (msg) {
        smsInput.value = msg;
        updateInputCount();
        runClassification(msg);
      }
    });
  });

  // Scan Button Click (Single / Batch Router)
  scanBtn.addEventListener('click', () => {
    const text = smsInput.value.trim();
    if (!text) {
      alert('Please enter or paste SMS message(s) to analyze.');
      smsInput.focus();
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
    const urlAnalysis = breakdown?.url_analysis;
    if (urlBox && urlDetails) {
      if (urlAnalysis && urlAnalysis.urls && urlAnalysis.urls.length > 0) {
        urlBox.style.display = 'block';
        let badgesHtml = '';
        if (urlAnalysis.hasShortener) {
          badgesHtml += '<span class="threat-tag" style="background: rgba(245, 158, 11, 0.15); border-color: var(--accent-amber); color: var(--accent-amber);">⚠️ Shortener Detected</span>';
        }
        if (urlAnalysis.hasSuspiciousTld) {
          badgesHtml += '<span class="threat-tag" style="background: rgba(244, 63, 94, 0.15); border-color: var(--accent-rose); color: var(--accent-rose);">🚨 Suspicious TLD</span>';
        }
        if (urlAnalysis.hasApkDownload) {
          badgesHtml += '<span class="threat-tag" style="background: rgba(244, 63, 94, 0.15); border-color: var(--accent-rose); color: var(--accent-rose);">⚠️ Malicious APK Download</span>';
        }
        if (!urlAnalysis.hasShortener && !urlAnalysis.hasSuspiciousTld && !urlAnalysis.hasApkDownload) {
          badgesHtml += '<span class="threat-tag" style="background: rgba(16, 185, 129, 0.15); border-color: var(--accent-emerald); color: var(--accent-emerald);">Standard Web Link</span>';
        }

        urlDetails.innerHTML = `
          <div style="margin-bottom: 0.35rem; display: flex; gap: 0.35rem; flex-wrap: wrap;">${badgesHtml}</div>
          <div style="font-family: var(--font-mono); font-size: 0.78rem; color: var(--accent-cyan); word-break: break-all;">
            ${urlAnalysis.urls.join(', ')}
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
    // FEATURE 1: Render Similar Past Scams from Turso Threat Intelligence Feed
    if (similarScamsContainer && similarScamsList) {
      if (data.similar_flags && data.similar_flags.length > 0) {
        similarScamsContainer.style.display = 'block';
        if (similarScamsCount) {
          similarScamsCount.textContent = `${data.similar_flags.length} historical match${data.similar_flags.length > 1 ? 'es' : ''}`;
        }
        similarScamsList.innerHTML = data.similar_flags.map(flag => {
          const scorePct = Math.round((flag.risk_score || 0) * 100);
          const badgeClass = flag.verdict === 'high_risk' ? 'high_risk' : (flag.verdict === 'suspicious' ? 'suspicious' : 'safe');
          const badgeText = flag.verdict === 'high_risk' ? '🚨 HIGH RISK' : (flag.verdict === 'suspicious' ? '⚠️ SUSPICIOUS' : '✅ SAFE');
          const timeStr = flag.created_at ? new Date(flag.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent';
          const truncated = flag.message.length > 120 ? flag.message.substring(0, 120) + '...' : flag.message;

          return `
            <div class="similar-scam-card ${badgeClass}">
              <div class="similar-scam-top">
                <span class="similar-badge ${badgeClass}">${badgeText} • ${scorePct}% Risk</span>
                <span style="color: var(--gold-light); font-family: var(--font-mono); font-size: 0.68rem; font-weight: 600;">${escapeHtml(flag.scam_type || 'THREAT')}</span>
              </div>
              <div class="similar-scam-msg">"${escapeHtml(truncated)}"</div>
              <div class="similar-scam-meta">
                <span>🕒 ${timeStr}</span>
                ${flag.trigger_phrases && flag.trigger_phrases.length > 0 ? `<span>• Triggers: ${escapeHtml(flag.trigger_phrases.slice(0, 3).join(', '))}</span>` : ''}
              </div>
            </div>
          `;
        }).join('');
      } else {
        similarScamsContainer.style.display = 'none';
      }
    }
  }

  // FEATURE 2: Batch Classification Function
  async function runBatchClassification(rawText) {
    const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) {
      alert('Please enter at least one message for batch analysis.');
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

  // Fetch Live DB Stats
  async function fetchStats() {
    try {
      const res = await fetch('/api/stats');
      if (!res.ok) return;
      const json = await res.json();
      if (json?.stats) {
        if (statTotalScanned) statTotalScanned.textContent = json.stats.total_scanned;
        if (statScamsBlocked) statScamsBlocked.textContent = json.stats.scams_blocked;
        if (statThreatWords) statThreatWords.textContent = json.stats.total_threat_words ? `${json.stats.total_threat_words}+` : '200+';
      }
    } catch (e) {
      console.warn('Stats fetch error:', e);
    }
  }

  // Fetch Recent Flags from Turso Cloud DB
  async function fetchRecentFlags() {
    try {
      const res = await fetch('/api/recent-flags?limit=25');
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
      return;
    }

    const totalCount = flags.length;
    const itemsToDisplay = showAllLogs ? flags : flags.slice(0, INITIAL_FEED_LIMIT);

    // Update count info text
    if (feedCountInfo) {
      if (totalCount > INITIAL_FEED_LIMIT) {
        feedCountInfo.textContent = showAllLogs 
          ? `Showing all ${totalCount} logs` 
          : `Showing top ${Math.min(INITIAL_FEED_LIMIT, totalCount)} of ${totalCount} logs`;
      } else {
        feedCountInfo.textContent = `Showing ${totalCount} log${totalCount === 1 ? '' : 's'}`;
      }
    }

    // Update Load More button
    if (loadMoreFeedBtn) {
      if (totalCount > INITIAL_FEED_LIMIT) {
        loadMoreFeedBtn.style.display = 'inline-flex';
        loadMoreFeedBtn.innerHTML = showAllLogs 
          ? '<span>▲ Show Less (Top 11)</span>' 
          : `<span>⚡ View All (${totalCount}) Logs</span>`;
      } else {
        loadMoreFeedBtn.style.display = 'none';
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

  // Load More / Show Less Toggle
  if (loadMoreFeedBtn) {
    loadMoreFeedBtn.addEventListener('click', () => {
      showAllLogs = !showAllLogs;
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
      filterAndRenderFeed();
    });
  });

  // Search input in Feed
  if (feedSearchInput) {
    feedSearchInput.addEventListener('input', () => {
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

  // PWA Service Worker Registration with Auto-Bumping
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => {
          console.log('[PWA] Service Worker registered:', reg.scope);
          reg.update();
        })
        .catch(err => console.warn('[PWA] Service Worker registration failed:', err));

      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          console.log('[PWA] New version detected, auto-reloading UI...');
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
