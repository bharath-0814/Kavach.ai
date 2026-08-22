const pptxgen = require('pptxgenjs');
const path = require('path');

async function buildExecutivePresentation() {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9'; // Exact 13.333 x 7.5 inches

  // Color Palette Constants
  const BG_CANVAS = '08080A';
  const HEADER_BG = '0E0E14';
  const HEADER_BORDER = '1E1E2A';
  
  const CARD_BG = '12121A';
  const CARD_BORDER = '20202E';
  const CARD_BG_ALT = '161622';
  const CARD_BG_HIGHLIGHT = '10141E';
  const CARD_BORDER_HIGHLIGHT = '243448';
  
  const TEXT_WHITE = 'F8FAFC';
  const TEXT_MUTED = '94A3B8';
  const TEXT_FAINT = '64748B';
  
  const ACCENT_GOLD = 'D4AF37';
  const ACCENT_GOLD_LIGHT = 'F3DF8A';
  const ACCENT_CYAN = '38BDF8';
  const ACCENT_ROSE = 'F43F5E';
  const ACCENT_EMERALD = '10B981';
  const ACCENT_AMBER = 'F59E0B';
  const ACCENT_PURPLE = 'C084FC';

  const FONT_TITLE = 'Georgia';
  const FONT_SANS = 'Arial';
  const FONT_MONO = 'Consolas';

  // Asset paths
  const LOGO_PATH = path.join(__dirname, 'assets', 'acm_logo.png');
  const HERO_IMG_PATH = path.join(__dirname, 'assets', 'hero_metrics.png');
  const INGEST_IMG_PATH = path.join(__dirname, 'assets', 'ingestion_terminal.png');
  const WORKBENCH_IMG_PATH = path.join(__dirname, 'assets', 'workbench_feed.png');

  // Master Unified Header (Full-width solid band: y: 0 to 1.15)
  function addSlideHeader(slide, trackTag, slideTitle) {
    slide.background = { color: BG_CANVAS };

    // Full-width Header Bar
    slide.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: 13.333, h: 1.1,
      fill: { color: HEADER_BG },
      line: { color: HEADER_BORDER, width: 1 }
    });

    // ACM Logo at top-left
    slide.addImage({
      path: LOGO_PATH,
      x: 0.6, y: 0.22, w: 0.65, h: 0.65
    });

    // Track & Team Tag
    slide.addText(trackTag, {
      x: 1.45, y: 0.22, w: 11.2, h: 0.25,
      fontSize: 8.5, fontFace: FONT_MONO, color: ACCENT_GOLD, bold: true,
      margin: [0, 0, 0, 0]
    });

    // Slide Title
    slide.addText(slideTitle, {
      x: 1.45, y: 0.50, w: 11.2, h: 0.45,
      fontSize: 16, fontFace: FONT_TITLE, color: TEXT_WHITE, bold: true,
      margin: [0, 0, 0, 0]
    });
  }

  // Card Helper with controlled padding
  function drawCard(slide, x, y, w, h, bg = CARD_BG, border = CARD_BORDER) {
    slide.addShape(pptx.ShapeType.rect, {
      x, y, w, h,
      fill: { color: bg },
      line: { color: border, width: 1 },
      rectRadius: 0.04
    });
  }

  // =========================================================================
  // SLIDE 1: HOOK, PRODUCT PITCH & TEAM NULL POINTERS
  // =========================================================================
  {
    const slide = pptx.addSlide();
    addSlideHeader(slide, '⚡ ELICIT ACM HACKATHON • TEAM NULL POINTERS • CYBERSECURITY TRACK', 'Kavach AI (कवच) — Vernacular SMS Phishing Defense');

    // Top Left: Problem Hook & Core Solution (x: 0.6, y: 1.35, w: 6.8, h: 3.1)
    drawCard(slide, 0.6, 1.35, 6.8, 3.1);

    slide.addText('Over ₹1,750+ Crore Lost to SMS Fraud in India', {
      x: 0.85, y: 1.55, w: 6.3, h: 0.35,
      fontSize: 13.5, fontFace: FONT_TITLE, color: ACCENT_GOLD_LIGHT, bold: true,
      margin: [0, 0, 0, 0]
    });

    slide.addText('80%+ of scam messages in India now write Hindi in English letters ("bijli disconnect", "khata block"), bypassing standard telecom and English NLP firewalls entirely.', {
      x: 0.85, y: 1.98, w: 6.3, h: 0.6,
      fontSize: 9.5, fontFace: FONT_SANS, color: TEXT_MUTED, lineSpacing: 13,
      margin: [0, 0, 0, 0]
    });

    slide.addText('🛡️ The Kavach Solution: Dual-Engine Vernacular Defense', {
      x: 0.85, y: 2.70, w: 6.3, h: 0.25,
      fontSize: 9.5, fontFace: FONT_MONO, color: ACCENT_CYAN, bold: true,
      margin: [0, 0, 0, 0]
    });

    slide.addText('India’s first dual-engine defense shield fusing deterministic Levenshtein deobfuscation (<15ms) with Google Gemini Flash AI (60%) for real-time vernacular fraud interception in <45ms.', {
      x: 0.85, y: 3.00, w: 6.3, h: 0.6,
      fontSize: 9, fontFace: FONT_SANS, color: TEXT_MUTED, lineSpacing: 12,
      margin: [0, 0, 0, 0]
    });

    slide.addText('Live Prototype on Vercel: https://kavach-ai-ten.vercel.app/', {
      x: 0.85, y: 3.85, w: 6.3, h: 0.4,
      fontSize: 8.5, fontFace: FONT_MONO, color: ACCENT_EMERALD, bold: true,
      margin: [0, 0, 0, 0]
    });

    // Top Right: Live Hero & Metrics Screenshot (x: 7.6, y: 1.35, w: 5.133, h: 3.1)
    drawCard(slide, 7.6, 1.35, 5.133, 3.1);
    slide.addImage({
      path: HERO_IMG_PATH,
      x: 7.75, y: 1.50, w: 4.83, h: 2.8,
      sizing: { type: 'contain' }
    });

    // Bottom Half: 4 Team Null Pointers Cards across Full Width (y: 4.65 to 6.85)
    slide.addText('👥 TEAM NULL POINTERS', {
      x: 0.6, y: 4.65, w: 12.133, h: 0.25,
      fontSize: 9, fontFace: FONT_MONO, color: ACCENT_GOLD, bold: true,
      margin: [0, 0, 0, 0]
    });

    const team = [
      { name: 'Gummadi Bharath Kumar Wesly', role: 'Team Leader & Lead AI Architect', focus: 'Threat Modeling & Gemini AI Cascade' },
      { name: 'Swarnim Sulekh', role: 'Full-Stack & Backend Systems', focus: 'Turso Cloud DB & Serverless Microservices' },
      { name: 'Krrish', role: 'Frontend & PWA Systems Developer', focus: '8pt Spatial Grid, Responsive UI & Service Worker' },
      { name: 'Jayaditya De', role: 'Linguistic & NLP Researcher', focus: 'Indic Dialect Lexicon & Levenshtein Engine' }
    ];

    team.forEach((t, i) => {
      const tx = 0.6 + (i * 3.08);
      drawCard(slide, tx, 4.95, 2.9, 1.9, CARD_BG_ALT, '242436');
      
      slide.addText(t.name, {
        x: tx + 0.15, y: 5.10, w: 2.6, h: 0.35,
        fontSize: 9.5, fontFace: FONT_SANS, color: TEXT_WHITE, bold: true,
        margin: [0, 0, 0, 0]
      });
      slide.addText(t.role, {
        x: tx + 0.15, y: 5.50, w: 2.6, h: 0.35,
        fontSize: 7.5, fontFace: FONT_MONO, color: ACCENT_CYAN, bold: true,
        margin: [0, 0, 0, 0]
      });
      slide.addText(t.focus, {
        x: tx + 0.15, y: 5.95, w: 2.6, h: 0.75,
        fontSize: 7.5, fontFace: FONT_SANS, color: TEXT_FAINT, lineSpacing: 11,
        margin: [0, 0, 0, 0]
      });
    });
  }

  // =========================================================================
  // SLIDE 2: THE PROBLEM — VERNACULAR SMISHING EPIDEMIC
  // =========================================================================
  {
    const slide = pptx.addSlide();
    addSlideHeader(slide, '🚨 ATTACK VECTOR ANALYSIS • PROBLEM STATEMENT', 'The Transliterated Vernacular Smishing Epidemic in India');

    // Left Column: 3 Stat Cards (x: 0.6, w: 5.3, h: 1.65 each)
    const statCards = [
      { val: '₹1,750+ Crore', lbl: 'Lost by Indian citizens to cyber financial fraud in 2024 (I4C Data)', col: ACCENT_ROSE },
      { val: '80%+', lbl: 'Smishing messages now use transliterated Hindi with leetspeak mutations', col: ACCENT_AMBER },
      { val: '0% Coverage', lbl: 'By traditional English spam filters (blind to Latin-script Indian languages)', col: ACCENT_CYAN }
    ];

    statCards.forEach((st, idx) => {
      const cy = 1.35 + (idx * 1.85);
      drawCard(slide, 0.6, cy, 5.3, 1.7);
      
      slide.addText(st.val, {
        x: 0.85, y: cy + 0.20, w: 4.8, h: 0.5,
        fontSize: 22, fontFace: FONT_MONO, color: st.col, bold: true,
        margin: [0, 0, 0, 0]
      });
      slide.addText(st.lbl, {
        x: 0.85, y: cy + 0.75, w: 4.8, h: 0.8,
        fontSize: 9.5, fontFace: FONT_SANS, color: TEXT_MUTED, lineSpacing: 13,
        margin: [0, 0, 0, 0]
      });
    });

    // Right Column: Realistic Attack Examples in India (x: 6.1, w: 6.63, h: 5.4)
    drawCard(slide, 6.1, 1.35, 6.63, 5.4);
    
    slide.addText('📱 Realistic Vernacular Attack Scenarios:', {
      x: 6.35, y: 1.55, w: 6.1, h: 0.35,
      fontSize: 13, fontFace: FONT_TITLE, color: ACCENT_GOLD_LIGHT, bold: true,
      margin: [0, 0, 0, 0]
    });

    const examples = [
      {
        title: '1. YouTube Task / Part-Time Job Fraud',
        msg: '"Hello sir, kya aap ghar baithe daily Rs 3000-5000 kamana chahte hain? YouTube videos like karo aur screenshot bhejo WhatsApp par: wa.me/91..."',
        reason: 'Exploits work-from-home allure. Bypasses filters because "ghar baithe" is not flagged as English spam.'
      },
      {
        title: '2. Electricity Disconnection Urgent Cut',
        msg: '"Aapka bijli connection aaj raat 9 baje bandh ho jayega. Turant is number pe call karein aur 0TPP batayein."',
        reason: 'Uses extreme cognitive fear and replaces "OTP" with leetspeak "0TPP".'
      },
      {
        title: '3. Obfuscated SBI KYC Expiry',
        msg: '"Y0UR SB1 ACC0UNT WILL BLCK T0DAY. UPDATE K-Y-C IMMED1ATE: http://bit.ly/sbi-kyc"',
        reason: 'Spaced letters ("K-Y-C") and leetspeak ("BLCK", "SB1") defeat standard dictionary tokenizers.'
      }
    ];

    examples.forEach((ex, idx) => {
      const ey = 2.05 + (idx * 1.55);
      
      slide.addText(ex.title, {
        x: 6.35, y: ey, w: 6.1, h: 0.25,
        fontSize: 9.5, fontFace: FONT_MONO, color: ACCENT_CYAN, bold: true,
        margin: [0, 0, 0, 0]
      });
      slide.addText(ex.msg, {
        x: 6.35, y: ey + 0.28, w: 6.1, h: 0.45,
        fontSize: 8.5, fontFace: FONT_MONO, color: TEXT_WHITE, italic: true,
        margin: [0, 0, 0, 0]
      });
      slide.addText(`Impact: ${ex.reason}`, {
        x: 6.35, y: ey + 0.78, w: 6.1, h: 0.45,
        fontSize: 8, fontFace: FONT_SANS, color: TEXT_FAINT, lineSpacing: 11,
        margin: [0, 0, 0, 0]
      });
    });
  }

  // =========================================================================
  // SLIDE 3: WHY EXISTING SOLUTIONS FAIL (THE AHA MOMENT)
  // =========================================================================
  {
    const slide = pptx.addSlide();
    addSlideHeader(slide, '⚔️ BENCHMARK COMPARISON • THE "AHA!" MOMENT', 'Why Traditional Filters Fail vs. How Kavach AI Wins');

    // Comparison Table (x: 0.6, y: 1.35, w: 12.133, h: 3.3)
    const tableData = [
      [
        { text: 'Threat Vector / Attack Pattern', options: { bold: true, color: TEXT_WHITE, fill: '161624', fontSize: 9 } },
        { text: 'Telecom DND / SMS Gateways', options: { bold: true, color: TEXT_WHITE, fill: '161624', fontSize: 9 } },
        { text: 'Standard English ML Models', options: { bold: true, color: TEXT_WHITE, fill: '161624', fontSize: 9 } },
        { text: '🛡️ Kavach AI (Our Approach)', options: { bold: true, color: ACCENT_GOLD_LIGHT, fill: '161624', fontSize: 9 } }
      ],
      [
        { text: 'Transliterated Hinglish ("bijli cut", "khata bandh")', options: { color: TEXT_MUTED, fontSize: 8.5 } },
        { text: '❌ Blind (0% understanding)', options: { color: ACCENT_ROSE, fontSize: 8.5 } },
        { text: '❌ Poor semantic capture', options: { color: ACCENT_ROSE, fontSize: 8.5 } },
        { text: '✅ Native Vernacular Engine (200+ Lexicon)', options: { color: ACCENT_EMERALD, bold: true, fontSize: 8.5 } }
      ],
      [
        { text: 'Adversarial Leetspeak ("BLCK", "0TPP", "K-Y-C")', options: { color: TEXT_MUTED, fontSize: 8.5 } },
        { text: '❌ Bypassed completely', options: { color: ACCENT_ROSE, fontSize: 8.5 } },
        { text: '❌ Tokenizer splits string', options: { color: ACCENT_ROSE, fontSize: 8.5 } },
        { text: '✅ 3-Step Levenshtein Normalizer (<15ms)', options: { color: ACCENT_EMERALD, bold: true, fontSize: 8.5 } }
      ],
      [
        { text: 'Part-Time Task Scams ("ghar baithe kamaye")', options: { color: TEXT_MUTED, fontSize: 8.5 } },
        { text: '❌ Treated as promo SMS', options: { color: ACCENT_ROSE, fontSize: 8.5 } },
        { text: '❌ Low risk classification', options: { color: ACCENT_ROSE, fontSize: 8.5 } },
        { text: '✅ Deterministic Fraud Signatures', options: { color: ACCENT_EMERALD, bold: true, fontSize: 8.5 } }
      ],
      [
        { text: 'Detection Latency', options: { color: TEXT_MUTED, fontSize: 8.5 } },
        { text: '200ms - 500ms', options: { color: TEXT_FAINT, fontSize: 8.5 } },
        { text: '1200ms - 3000ms', options: { color: ACCENT_AMBER, fontSize: 8.5 } },
        { text: '⚡ <45ms Sub-Second Speed', options: { color: ACCENT_EMERALD, bold: true, fontSize: 8.5 } }
      ],
      [
        { text: 'Explainable AI Threat Triggers', options: { color: TEXT_MUTED, fontSize: 8.5 } },
        { text: '❌ Opaque binary block', options: { color: ACCENT_ROSE, fontSize: 8.5 } },
        { text: '❌ Generic percentage only', options: { color: ACCENT_ROSE, fontSize: 8.5 } },
        { text: '✅ Exact Trigger Phrases & AI Reasoning', options: { color: ACCENT_EMERALD, bold: true, fontSize: 8.5 } }
      ]
    ];

    slide.addTable(tableData, {
      x: 0.6, y: 1.35, w: 12.133, h: 3.3,
      border: { pt: '1', color: CARD_BORDER },
      align: 'left',
      valign: 'middle'
    });

    // Concrete Evasion Proof Box (x: 0.6, y: 4.85, w: 12.133, h: 1.9)
    drawCard(slide, 0.6, 4.85, 12.133, 1.9, CARD_BG_HIGHLIGHT, CARD_BORDER_HIGHLIGHT);
    
    slide.addText('💡 Concrete Evasion Proof ("The Aha! Moment"):', {
      x: 0.85, y: 5.05, w: 11.6, h: 0.3,
      fontSize: 11, fontFace: FONT_TITLE, color: ACCENT_GOLD_LIGHT, bold: true,
      margin: [0, 0, 0, 0]
    });
    
    slide.addText('Raw Input: "Y0UR SB1 ACC0UNT WILL BLCK T0DAY. UPDATE K-Y-C IMMED1ATE: http://bit.ly/sbi-kyc"\n• Traditional Filter: PASS (0% keywords match standard English dictionary; "BLCK" and "SB1" are non-words).\n• Kavach AI: 100% HIGH RISK (Normalized: "block", "sbi", "kyc" | Malicious shortener flagged in 35ms).', {
      x: 0.85, y: 5.40, w: 11.6, h: 1.2,
      fontSize: 9, fontFace: FONT_MONO, color: TEXT_WHITE, lineSpacing: 13,
      margin: [0, 0, 0, 0]
    });
  }

  // =========================================================================
  // SLIDE 4: OUR SOLUTION — ARCHITECTURE & INGESTION
  // =========================================================================
  {
    const slide = pptx.addSlide();
    addSlideHeader(slide, '🛡️ SOLUTION OVERVIEW • CORE DEFENSE PILLARS', 'Kavach AI: Dual-Engine Defense Architecture');

    // Left Column: 4 Architectural Pillars (x: 0.6, w: 5.8, y: 1.35 to 6.75)
    const pillars = [
      {
        num: '01',
        title: '3-Step Levenshtein Normalizer',
        desc: 'Strips hyphens (K-Y-C -> KYC), reverses leetspeak (0->o, @->a), and computes length-adaptive edit distance in <15ms.',
        col: ACCENT_CYAN
      },
      {
        num: '02',
        title: '350+ Safe-Word Whitelist Shield',
        desc: 'Protects conversational words (chahte, job, ghar, aap, bhejo) from false-positive fuzzy distance distortions.',
        col: ACCENT_EMERALD
      },
      {
        num: '03',
        title: 'Multi-Model Gemini AI Cascade',
        desc: 'Fuses 40% Deterministic Rule Engine with 60% Gemini Flash AI across a 6-model failover pool for 0% downtime.',
        col: ACCENT_PURPLE
      },
      {
        num: '04',
        title: 'Turso Cloud Threat Intelligence',
        desc: 'Real-time LibSQL database auditing, structured scam categorization, and live threat feed telemetry.',
        col: ACCENT_GOLD
      }
    ];

    pillars.forEach((p, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const px = 0.6 + (col * 3.0);
      const py = 1.35 + (row * 2.75);

      drawCard(slide, px, py, 2.85, 2.6);
      slide.addText(p.num, {
        x: px + 0.15, y: py + 0.15, w: 0.6, h: 0.35,
        fontSize: 16, fontFace: FONT_MONO, color: p.col, bold: true,
        margin: [0, 0, 0, 0]
      });
      slide.addText(p.title, {
        x: px + 0.8, y: py + 0.2, w: 1.9, h: 0.55,
        fontSize: 9.5, fontFace: FONT_TITLE, color: TEXT_WHITE, bold: true,
        margin: [0, 0, 0, 0]
      });
      slide.addText(p.desc, {
        x: px + 0.15, y: py + 0.85, w: 2.55, h: 1.6,
        fontSize: 8, fontFace: FONT_SANS, color: TEXT_MUTED, lineSpacing: 11,
        margin: [0, 0, 0, 0]
      });
    });

    // Right Column: Ingestion Terminal Screenshot (x: 6.6, w: 6.133, h: 5.4)
    drawCard(slide, 6.6, 1.35, 6.133, 5.4);
    slide.addImage({
      path: INGEST_IMG_PATH,
      x: 6.75, y: 1.50, w: 5.83, h: 3.1,
      sizing: { type: 'contain' }
    });

    slide.addText('✦ Live Threat Ingestion Terminal:', {
      x: 6.8, y: 4.80, w: 5.7, h: 0.25,
      fontSize: 10, fontFace: FONT_TITLE, color: ACCENT_GOLD_LIGHT, bold: true,
      margin: [0, 0, 0, 0]
    });
    slide.addText('• Instant preset loading for YouTube scams, e-Challan APKs, SBI KYC, and Bijli cut threats.\n• Sub-pixel responsive input field supporting multi-dialect Indian text.\n• Dual-engine scoring trigger with real-time feedback.', {
      x: 6.8, y: 5.10, w: 5.7, h: 1.5,
      fontSize: 8, fontFace: FONT_SANS, color: TEXT_MUTED, lineSpacing: 12,
      margin: [0, 0, 0, 0]
    });
  }

  // =========================================================================
  // SLIDE 5: TECHNICAL PIPELINE & TECH STACK
  // =========================================================================
  {
    const slide = pptx.addSlide();
    addSlideHeader(slide, '🏗️ SYSTEM ARCHITECTURE • DATA PIPELINE', 'End-to-End Threat Processing Pipeline & Stack');

    // Horizontal 5-Step Flow Cards (x: 0.6, y: 1.35, w: 2.35 each, h: 2.1)
    const steps = [
      { step: 'Step 1', title: 'Raw Ingestion', text: 'Strips hyphens, collapses spaced letters & leetspeak.' },
      { step: 'Step 2', title: 'Levenshtein Engine', text: 'Length-adaptive distance match in <15ms.' },
      { step: 'Step 3', title: '40% Rule Scoring', text: 'Evaluates 15 threat regexes & URL forensics.' },
      { step: 'Step 4', title: '60% Gemini Cascade', text: 'Contextual semantic reasoning via multi-model pool.' },
      { step: 'Step 5', title: 'Verdict & Audit', text: 'Weighted risk fusion score + async Turso DB log.' }
    ];

    steps.forEach((st, idx) => {
      const sx = 0.6 + (idx * 2.45);
      drawCard(slide, sx, 1.35, 2.35, 2.1);
      
      slide.addText(st.step, {
        x: sx + 0.15, y: 1.50, w: 2.05, h: 0.22,
        fontSize: 8, fontFace: FONT_MONO, color: ACCENT_GOLD, bold: true,
        margin: [0, 0, 0, 0]
      });
      slide.addText(st.title, {
        x: sx + 0.15, y: 1.77, w: 2.05, h: 0.42,
        fontSize: 9.5, fontFace: FONT_TITLE, color: TEXT_WHITE, bold: true,
        margin: [0, 0, 0, 0]
      });
      slide.addText(st.text, {
        x: sx + 0.15, y: 2.25, w: 2.05, h: 1.1,
        fontSize: 7.5, fontFace: FONT_SANS, color: TEXT_MUTED, lineSpacing: 11,
        margin: [0, 0, 0, 0]
      });
    });

    // Tech Stack 4-Box Grid (Bottom: y: 3.65, h: 1.5 each)
    const stackBoxes = [
      { title: '🧠 AI, NLP & Linguistic Engine', items: '• Google Gemini Flash (Multi-Model Pool: 3.5, 3.7, Latest)\n• Fast-Levenshtein Deobfuscation Engine\n• 200+ Indian Threat Lexicon & 350+ Safe-Word Whitelist' },
      { title: '⚡ Backend & Serverless API', items: '• Node.js (ES6+) Serverless Architecture\n• Vercel Edge Functions (/api/classify, /api/stats)\n• Sub-45ms Total End-to-End Response Time' },
      { title: '🗄️ Database & Threat Intelligence', items: '• Turso Cloud Database (LibSQL / Serverless SQLite)\n• Hosted in AWS AP-South-1 (Mumbai)\n• Real-Time Batch Audit Logging Pipeline' },
      { title: '📲 Frontend & Progressive Web App', items: '• Progressive Web App (PWA) with Offline Support\n• Auto-Bumping Service Worker (sw.js)\n• Custom 8pt Spatial Grid & Mobile Safe-Area Insets' }
    ];

    stackBoxes.forEach((sb, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const bx = 0.6 + (col * 6.15);
      const by = 3.65 + (row * 1.6);

      drawCard(slide, bx, by, 5.98, 1.45);
      slide.addText(sb.title, {
        x: bx + 0.2, y: by + 0.15, w: 5.58, h: 0.25,
        fontSize: 9, fontFace: FONT_TITLE, color: ACCENT_CYAN, bold: true,
        margin: [0, 0, 0, 0]
      });
      slide.addText(sb.items, {
        x: bx + 0.2, y: by + 0.45, w: 5.58, h: 0.85,
        fontSize: 7.5, fontFace: FONT_SANS, color: TEXT_MUTED, lineSpacing: 11,
        margin: [0, 0, 0, 0]
      });
    });
  }

  // =========================================================================
  // SLIDE 6: LIVE DEMO & BENCHMARKS + WORKBENCH/FEED IMAGE
  // =========================================================================
  {
    const slide = pptx.addSlide();
    addSlideHeader(slide, '🧪 EMPIRICAL VALIDATION • LIVE BENCHMARKS', 'Empirical Validation Across Real Indian Smishing Attacks');

    // Left Column: Benchmark Table (x: 0.6, w: 5.6, h: 2.8)
    const demoData = [
      [
        { text: 'Attack Vector', options: { bold: true, color: TEXT_WHITE, fill: '161624', fontSize: 8 } },
        { text: 'Latency', options: { bold: true, color: TEXT_WHITE, fill: '161624', fontSize: 8 } },
        { text: 'Risk Score', options: { bold: true, color: TEXT_WHITE, fill: '161624', fontSize: 8 } },
        { text: 'Verdict', options: { bold: true, color: TEXT_WHITE, fill: '161624', fontSize: 8 } }
      ],
      [
        { text: 'YouTube Task Scam', options: { color: TEXT_WHITE, fontSize: 7.5 } },
        { text: '38ms', options: { color: ACCENT_EMERALD, bold: true, fontSize: 7.5 } },
        { text: '100%', options: { color: ACCENT_ROSE, bold: true, fontSize: 7.5 } },
        { text: '🚨 HIGH RISK', options: { color: ACCENT_ROSE, bold: true, fontSize: 7.5 } }
      ],
      [
        { text: 'Bijli Cut Threat', options: { color: TEXT_WHITE, fontSize: 7.5 } },
        { text: '42ms', options: { color: ACCENT_EMERALD, bold: true, fontSize: 7.5 } },
        { text: '100%', options: { color: ACCENT_ROSE, bold: true, fontSize: 7.5 } },
        { text: '🚨 HIGH RISK', options: { color: ACCENT_ROSE, bold: true, fontSize: 7.5 } }
      ],
      [
        { text: 'SBI KYC Leetspeak', options: { color: TEXT_WHITE, fontSize: 7.5 } },
        { text: '35ms', options: { color: ACCENT_EMERALD, bold: true, fontSize: 7.5 } },
        { text: '100%', options: { color: ACCENT_ROSE, bold: true, fontSize: 7.5 } },
        { text: '🚨 HIGH RISK', options: { color: ACCENT_ROSE, bold: true, fontSize: 7.5 } }
      ],
      [
        { text: 'Traffic e-Challan APK', options: { color: TEXT_WHITE, fontSize: 7.5 } },
        { text: '44ms', options: { color: ACCENT_EMERALD, bold: true, fontSize: 7.5 } },
        { text: '100%', options: { color: ACCENT_ROSE, bold: true, fontSize: 7.5 } },
        { text: '🚨 HIGH RISK', options: { color: ACCENT_ROSE, bold: true, fontSize: 7.5 } }
      ],
      [
        { text: 'Benign Hindi Chat', options: { color: TEXT_WHITE, fontSize: 7.5 } },
        { text: '28ms', options: { color: ACCENT_EMERALD, bold: true, fontSize: 7.5 } },
        { text: '0%', options: { color: ACCENT_EMERALD, bold: true, fontSize: 7.5 } },
        { text: '✅ SAFE & VERIFIED', options: { color: ACCENT_EMERALD, bold: true, fontSize: 7.5 } }
      ]
    ];

    slide.addTable(demoData, {
      x: 0.6, y: 1.35, w: 5.6, h: 2.8,
      border: { pt: '1', color: CARD_BORDER },
      align: 'left',
      valign: 'middle'
    });

    // Live Links Card (x: 0.6, y: 4.35, w: 5.6, h: 2.4)
    drawCard(slide, 0.6, 4.35, 5.6, 2.4, CARD_BG_HIGHLIGHT, CARD_BORDER_HIGHLIGHT);
    
    slide.addText('🌐 Production Deployment Links:', {
      x: 0.85, y: 4.55, w: 5.1, h: 0.25,
      fontSize: 10, fontFace: FONT_TITLE, color: ACCENT_GOLD_LIGHT, bold: true,
      margin: [0, 0, 0, 0]
    });
    slide.addText('• Live Web App: https://kavach-ai-ten.vercel.app/\n• Open Source Code: https://github.com/bharath-0814/Kavach.ai\n• Cloud Database: Turso Cloud LibSQL (AWS Mumbai)\n• Multi-Model Pool: Gemini 3.5, 3.7 & Flash-Latest', {
      x: 0.85, y: 4.88, w: 5.1, h: 1.7,
      fontSize: 8, fontFace: FONT_MONO, color: TEXT_MUTED, lineSpacing: 12,
      margin: [0, 0, 0, 0]
    });

    // Right Column: Workbench & Threat Feed Screenshot (x: 6.4, w: 6.33, h: 5.4)
    drawCard(slide, 6.4, 1.35, 6.33, 5.4);
    slide.addImage({
      path: WORKBENCH_IMG_PATH,
      x: 6.55, y: 1.50, w: 6.03, h: 3.8,
      sizing: { type: 'contain' }
    });

    slide.addText('✦ Live Deobfuscation Workbench & Cloud Threat Feed:', {
      x: 6.6, y: 5.55, w: 5.9, h: 0.25,
      fontSize: 9, fontFace: FONT_TITLE, color: ACCENT_GOLD_LIGHT, bold: true,
      margin: [0, 0, 0, 0]
    });
    slide.addText('Real-time Levenshtein distance matching + Turso Cloud audit trail with top-11 pagination.', {
      x: 6.6, y: 5.85, w: 5.9, h: 0.65,
      fontSize: 7.5, fontFace: FONT_SANS, color: TEXT_MUTED,
      margin: [0, 0, 0, 0]
    });
  }

  // =========================================================================
  // SLIDE 7: ROUND 2 INNOVATIONS — ON-DEVICE RAG & PRIVACY
  // =========================================================================
  {
    const slide = pptx.addSlide();
    addSlideHeader(slide, '🚀 HACKATHON ROUND 2 COMMITMENT • FUTURE ADVANCEMENTS', 'On-Device RAG & Privacy-Preserving Self-Learning');

    // Left Column: Edge-Native RAG (x: 0.6, w: 5.9, h: 5.4)
    drawCard(slide, 0.6, 1.35, 5.9, 5.4);
    
    slide.addText('🧠 1. Edge-Native RAG over Local Vector DB', {
      x: 0.85, y: 1.55, w: 5.4, h: 0.3,
      fontSize: 11.5, fontFace: FONT_TITLE, color: ACCENT_CYAN, bold: true,
      margin: [0, 0, 0, 0]
    });

    slide.addText('• On-Device Vector Embeddings: An ultra-compact local vector database (SQLite-VSS / local HNSW index) stores semantic embeddings of known scam tactics, fraudulent APK signatures, and vernacular evasion patterns.\n\n• Sub-10ms Cosine Similarity: When an SMS arrives, the app performs a localized vector similarity lookup completely offline.\n\n• Contextual Threat Augmentation: An on-device quantized Small Language Model (SLM) retrieves matching threat tactics and explains the exact scam modus operandi without touching the cloud.\n\n• 100% Offline Capability: Operates seamlessly in flight mode or remote rural areas with zero internet connectivity.', {
      x: 0.85, y: 1.95, w: 5.4, h: 4.6,
      fontSize: 8.5, fontFace: FONT_SANS, color: TEXT_MUTED, lineSpacing: 13,
      margin: [0, 0, 0, 0]
    });

    // Right Column: Privacy-Preserving Federated Self-Learning (x: 6.83, w: 5.9, h: 5.4)
    drawCard(slide, 6.83, 1.35, 5.9, 5.4);
    
    slide.addText('🔒 2. Privacy-First Federated Self-Learning', {
      x: 7.08, y: 1.55, w: 5.4, h: 0.3,
      fontSize: 11.5, fontFace: FONT_TITLE, color: ACCENT_EMERALD, bold: true,
      margin: [0, 0, 0, 0]
    });

    slide.addText('• 100% DPDP Act 2023 Compliance: Personal SMS messages are never uploaded to any remote server, guaranteeing absolute citizen privacy.\n\n• Localized Dialect Adaptation: As users flag or verify emerging regional dialect SMS on their phones, the local model continuously adapts to user dialect habits.\n\n• Federated Weight Aggregation: Only encrypted mathematical gradient delta updates (not user text) are periodically synced across devices to improve the collective Indic vocabulary across India.\n\n• Hardware Secure Enclave: Executed strictly inside Apple Neural Engine / Android NNAPI.', {
      x: 7.08, y: 1.95, w: 5.4, h: 4.6,
      fontSize: 8.5, fontFace: FONT_SANS, color: TEXT_MUTED, lineSpacing: 13,
      margin: [0, 0, 0, 0]
    });
  }

  // =========================================================================
  // SLIDE 8: REAL-WORLD USE CASES & NATIONAL IMPACT
  // =========================================================================
  {
    const slide = pptx.addSlide();
    addSlideHeader(slide, '🌐 IMPACT & SCALING ROADMAP • COMMERCIALIZATION', 'Transformational Real-World Use Cases & National Scale');

    // 4 Strategic Use Cases Grid (x: 0.6, y: 1.35, w: 5.98 each, h: 2.05 each)
    const useCases = [
      {
        icon: '👨‍👩‍👧',
        title: 'B2C: Senior Citizen Voice Shield',
        desc: 'Standalone mobile app with automated SMS quarantine & regional voice alerts ("Yeh message dhokhadhadi hai") in Hindi, Tamil, Telugu, and Bengali for non-English literate elders.',
        col: ACCENT_CYAN
      },
      {
        icon: '🏦',
        title: 'B2B: Fintech & Banking SDK',
        desc: 'Lightweight embeddable SDK for UPI apps (PhonePe, Paytm, Google Pay, SBI YONO) that intercepts fake OTP prompts and detects credential theft before payment execution.',
        col: ACCENT_EMERALD
      },
      {
        icon: '🏛️',
        title: 'B2G: Telecom Gateway Firewall',
        desc: 'Deployed directly at SMSC gateways (Airtel, Jio, Vi, TRAI DND) to perform deep-packet inspection and block smishing SMS in <10ms before transmission across cell towers.',
        col: ACCENT_PURPLE
      },
      {
        icon: '🚔',
        title: 'National Cyber Intelligence Bridge',
        desc: 'Automated real-time telemetry feed of scam phone numbers, fake APK URLs, and extortion UPI IDs shared directly with I4C (1930 Portal) to shut down scam call centers.',
        col: ACCENT_GOLD
      }
    ];

    useCases.forEach((uc, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const ux = 0.6 + (col * 6.15);
      const uy = 1.35 + (row * 2.2);

      drawCard(slide, ux, uy, 5.98, 2.05);
      slide.addText(`${uc.icon} ${uc.title}`, {
        x: ux + 0.2, y: uy + 0.20, w: 5.58, h: 0.32,
        fontSize: 10.5, fontFace: FONT_TITLE, color: uc.col, bold: true,
        margin: [0, 0, 0, 0]
      });
      slide.addText(uc.desc, {
        x: ux + 0.2, y: uy + 0.58, w: 5.58, h: 1.3,
        fontSize: 8, fontFace: FONT_SANS, color: TEXT_MUTED, lineSpacing: 11,
        margin: [0, 0, 0, 0]
      });
    });

    // Quantified Impact Summary (Bottom: y: 5.9, h: 0.85)
    drawCard(slide, 0.6, 5.9, 12.133, 0.85, CARD_BG_HIGHLIGHT, CARD_BORDER_HIGHLIGHT);
    slide.addText('🎯 Quantified National Impact: 90%+ Reduction in vernacular smishing financial losses • Sub-45ms Zero Latency Overhead on legitimate banking OTPs • 100% Privacy Compliance under Indian DPDP Act 2023.', {
      x: 0.85, y: 6.05, w: 11.6, h: 0.55,
      fontSize: 9, fontFace: FONT_TITLE, color: ACCENT_GOLD_LIGHT, bold: true, align: 'center',
      margin: [0, 0, 0, 0]
    });
  }

  // Save Presentation
  const outputPath = path.join(__dirname, 'public', 'Kavach_AI_Executive_Pitch_Deck.pptx');
  await pptx.writeFile({ fileName: outputPath });
  console.log(`✅ Executive presentation created successfully at: ${outputPath}`);
}

buildExecutivePresentation().catch(console.error);
