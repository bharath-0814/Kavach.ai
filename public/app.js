document.addEventListener('DOMContentLoaded', () => {
  // Interactive 3D Particle Constellation Background Canvas
  const canvas = document.getElementById('bgCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    const particles = [];
    const particleCount = Math.min(width > 768 ? 55 : 25, 60);

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: (Math.random() - 0.5) * width * 1.5,
        y: (Math.random() - 0.5) * height * 1.5,
        z: Math.random() * 1000 + 100,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        size: Math.random() * 1.8 + 0.8
      });
    }

    let scrollVel = 0;
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      scrollVel = (currentScrollY - lastScrollY) * 0.15;
      lastScrollY = currentScrollY;
    }, { passive: true });

    function renderParticles() {
      ctx.clearRect(0, 0, width, height);
      scrollVel *= 0.92; // Damping

      const fov = 400;
      const cx = width / 2;
      const cy = height / 2;
      const projected = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy - (scrollVel * 0.4);
        p.z -= scrollVel * 1.2;

        if (p.z <= 50) p.z = 1100;
        if (p.z > 1100) p.z = 50;

        const scale = fov / (fov + p.z);
        const px = cx + p.x * scale;
        const py = cy + p.y * scale;

        if (px < -50 || px > width + 50 || py < -50 || py > height + 50) {
          p.x = (Math.random() - 0.5) * width * 1.5;
          p.y = (Math.random() - 0.5) * height * 1.5;
        }

        projected.push({ x: px, y: py, scale, size: p.size * scale });
      }

      ctx.fillStyle = 'rgba(212, 175, 55, 0.45)';
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.06)';

      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.6, p.size), 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < projected.length; j++) {
          const p2 = projected[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(renderParticles);
    }
    renderParticles();

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });
  }

  // Elements
  const smsInput = document.getElementById('smsInput');
  const charCount = document.getElementById('charCount');
  const clearBtn = document.getElementById('clearBtn');
  const scanBtn = document.getElementById('scanBtn');
  const btnText = document.getElementById('btnText');
  const btnIcon = document.getElementById('btnIcon');

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

  // Character counter
  smsInput.addEventListener('input', () => {
    charCount.textContent = `${smsInput.value.length} characters`;
  });

  // Clear button
  clearBtn.addEventListener('click', () => {
    smsInput.value = '';
    charCount.textContent = '0 characters';
    resultsSection.style.display = 'none';
    smsInput.focus();
  });

  // Preset chips
  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const msg = chip.getAttribute('data-msg');
      smsInput.value = msg;
      charCount.textContent = `${msg.length} characters`;
      runClassification(msg);
    });
  });

  // Scan Button Click
  scanBtn.addEventListener('click', () => {
    const text = smsInput.value.trim();
    if (!text) {
      alert('Please enter or paste an SMS message to analyze.');
      smsInput.focus();
      return;
    }
    runClassification(text);
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

  // Main Classification Function
  async function runClassification(message) {
    scanBtn.disabled = true;
    btnText.textContent = 'Analyzing Threat...';
    btnIcon.textContent = '⏳';

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
    }
  }

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
