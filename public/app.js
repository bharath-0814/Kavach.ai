document.addEventListener('DOMContentLoaded', () => {
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
  const feedFilterChips = document.querySelectorAll('.filter-pill, .filter-btn');
  const loadMoreFeedBtn = document.getElementById('loadMoreFeedBtn');
  const feedCountInfo = document.getElementById('feedCountInfo');
  const presetChips = document.querySelectorAll('.chip-btn, .preset-chip');

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

  // PWA Service Worker Registration
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('PWA Service Worker registered:', reg.scope))
        .catch(err => console.warn('Service Worker registration failed:', err));
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
});
