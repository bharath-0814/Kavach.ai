document.addEventListener('DOMContentLoaded', () => {
  const smsInput = document.getElementById('smsInput');
  const charCount = document.getElementById('charCount');
  const clearBtn = document.getElementById('clearBtn');
  const scanBtn = document.getElementById('scanBtn');
  const btnText = document.getElementById('btnText');
  const btnIcon = document.getElementById('btnIcon');

  const resultsSection = document.getElementById('resultsSection');
  const verdictCard = document.getElementById('verdictCard');
  const verdictBadge = document.getElementById('verdictBadge');
  const scoreCircle = document.getElementById('scoreCircle');
  const riskScoreNumber = document.getElementById('riskScoreNumber');
  const scamTypePill = document.getElementById('scamTypePill');
  const ruleScoreVal = document.getElementById('ruleScoreVal');
  const ruleBar = document.getElementById('ruleBar');
  const aiScoreVal = document.getElementById('aiScoreVal');
  const aiBar = document.getElementById('aiBar');
  const aiReasoning = document.getElementById('aiReasoning');
  const triggersContainer = document.getElementById('triggersContainer');
  const deobfRaw = document.getElementById('deobfRaw');
  const deobfClean = document.getElementById('deobfClean');

  const feedTableBody = document.getElementById('feedTableBody');
  const refreshFeedBtn = document.getElementById('refreshFeedBtn');
  const presetChips = document.querySelectorAll('.preset-chip');

  // Update character count
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

  // Preset chips click
  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const msg = chip.getAttribute('data-msg');
      smsInput.value = msg;
      charCount.textContent = `${msg.length} characters`;
      // Trigger scan automatically on preset click
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

  // Main Classification Function
  async function runClassification(message) {
    // Set loading state
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
      displayResults(data);
      // Refresh feed to show the newly logged message
      fetchRecentFlags();
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

    // Show section with animation
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Set Risk Score Number
    riskScoreNumber.textContent = `${percentage}%`;

    // Calculate circle dashoffset (Circumference ~ 377 for r=60)
    const circumference = 377;
    const offset = circumference - (circumference * (percentage / 100));
    scoreCircle.style.strokeDashoffset = offset;

    // Verdict Badge & Gauge Color
    verdictBadge.className = `verdict-badge ${verdict}`;
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

    // Scam Type Pill
    scamTypePill.textContent = `Category: ${scam_type || 'GENERAL'}`;

    // Dual Meter Bars
    const rulePercent = Math.round((breakdown?.rule_score || 0) * 100);
    const aiPercent = Math.round((breakdown?.gemini_confidence || 0) * 100);

    ruleScoreVal.textContent = `${rulePercent}%`;
    ruleBar.style.width = `${rulePercent}%`;

    aiScoreVal.textContent = `${aiPercent}%`;
    aiBar.style.width = `${aiPercent}%`;

    // AI Reasoning
    aiReasoning.textContent = reasoning || 'No reasoning details available.';

    // Render Trigger Phrases
    triggersContainer.innerHTML = '';
    if (trigger_phrases && trigger_phrases.length > 0) {
      trigger_phrases.forEach(phrase => {
        const tag = document.createElement('span');
        tag.className = 'trigger-tag';
        tag.textContent = phrase;
        triggersContainer.appendChild(tag);
      });
    } else {
      const tag = document.createElement('span');
      tag.className = 'trigger-tag';
      tag.style.borderColor = 'rgba(16, 185, 129, 0.3)';
      tag.style.color = '#6ee7b7';
      tag.style.background = 'rgba(16, 185, 129, 0.1)';
      tag.textContent = 'No malicious triggers detected';
      triggersContainer.appendChild(tag);
    }

    // Deobfuscation Box
    deobfRaw.textContent = `"${message}"`;
    if (breakdown?.fuzzy_matches && breakdown.fuzzy_matches.length > 0) {
      const matchText = breakdown.fuzzy_matches
        .map(fm => `${fm.original} ➔ "${fm.matchedWord}" (dist: ${fm.distance})`)
        .join(', ');
      deobfClean.textContent = matchText;
    } else {
      deobfClean.textContent = 'Clean / Standard Text (No Levenshtein Obfuscation Detected)';
    }
  }

  // Fetch Recent Flags from Turso Cloud DB
  async function fetchRecentFlags() {
    try {
      const res = await fetch('/api/recent-flags?limit=10');
      if (!res.ok) throw new Error('Failed to fetch flags');
      const json = await res.json();
      renderFeed(json.data || []);
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

  // Render Table
  function renderFeed(flags) {
    if (!flags || flags.length === 0) {
      feedTableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">
            No suspicious threats logged yet.
          </td>
        </tr>
      `;
      return;
    }

    feedTableBody.innerHTML = flags.map(item => {
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
          <td><strong style="color: ${item.verdict === 'high_risk' ? 'var(--accent-rose)' : 'var(--accent-amber)'}">${scorePct}%</strong></td>
          <td><span class="verdict-badge ${badgeClass}" style="margin: 0; padding: 0.2rem 0.6rem; font-size: 0.72rem;">${badgeLabel}</span></td>
          <td><span style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--accent-cyan);">${item.scam_type || 'SCAM'}</span></td>
          <td><div class="feed-msg" title="${escapeHtml(item.message)}">${escapeHtml(item.message)}</div></td>
          <td style="color: var(--text-muted); font-size: 0.8rem;">${item.created_at || 'Just now'}</td>
        </tr>
      `;
    }).join('');
  }

  function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Refresh Feed Button
  refreshFeedBtn.addEventListener('click', () => {
    refreshFeedBtn.textContent = '⏳ Refreshing...';
    fetchRecentFlags().finally(() => {
      refreshFeedBtn.textContent = '🔄 Refresh Feed';
    });
  });

  // Initial load of feed
  fetchRecentFlags();
});
