const pptxgen = require('pptxgenjs');
const path = require('path');

async function createKavachPresentation() {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';

  // Palette Constants
  const BG_DARK = '09090D';
  const CARD_BG = '121218';
  const CARD_BORDER = '232330';
  const TEXT_WHITE = 'F8FAFC';
  const TEXT_MUTED = '94A3B8';
  const TEXT_DIM = '64748B';
  const ACCENT_CYAN = '38BDF8';
  const ACCENT_EMERALD = '10B981';
  const ACCENT_ROSE = 'F43F5E';
  const ACCENT_AMBER = 'F59E0B';
  const ACCENT_PURPLE = 'C084FC';

  const FONT_TITLE = 'Arial';
  const FONT_BODY = 'Calibri';
  const FONT_MONO = 'Consolas';

  // Helper for slide background & logo
  function setDarkSlide(slide) {
    slide.background = { color: BG_DARK };
    // Top-left subtle ACM logo
    slide.addImage({
      path: path.join(__dirname, 'public', 'acm-logo.png'),
      x: 0.8, y: 0.35, w: 0.45, h: 0.45
    });
  }

  // Helper for card boxes
  function addCard(slide, x, y, w, h, bg = CARD_BG, border = CARD_BORDER) {
    slide.addShape(pptx.ShapeType.rect, {
      x, y, w, h,
      fill: { color: bg },
      line: { color: border, width: 1 },
      rectRadius: 0.1
    });
  }

  // =========================================================================
  // SLIDE 1: Hook + Team Info
  // =========================================================================
  {
    const slide = pptx.addSlide();
    setDarkSlide(slide);

    // Pill Badge & Team Name
    slide.addText('⚡ ELICIT ACM HACKATHON • TEAM: NULL POINTERS', {
      x: 1.4, y: 0.45, w: 9.0, h: 0.35,
      fontSize: 10.5, fontFace: FONT_MONO, color: ACCENT_CYAN, bold: true
    });

    // Main Hook
    slide.addText('Over ₹1,750+ Crore Lost to SMS Fraud in India — Because 80% of Scam Texts Dodge Firewalls by Writing Hindi in English Letters.', {
      x: 0.8, y: 0.95, w: 11.5, h: 1.1,
      fontSize: 20, fontFace: FONT_TITLE, color: TEXT_WHITE, bold: true
    });

    // Product Title Callout
    addCard(slide, 0.8, 2.15, 11.7, 1.7, '101016', '28283C');
    slide.addText('🛡️ KAVACH AI (कवच) — Team: Null Pointers', {
      x: 1.1, y: 2.3, w: 8.0, h: 0.35,
      fontSize: 16, fontFace: FONT_TITLE, color: ACCENT_CYAN, bold: true
    });
    slide.addText('India’s First Real-Time Dual-Engine Vernacular SMS Phishing Defense Shield.\nDeobfuscates Latin-script regional dialects (Hinglish, Tanglish, Benglish) and adversarial leetspeak in <45ms by blending deterministic Levenshtein heuristics (40%) with multi-model Google Gemini Flash AI (60%).', {
      x: 1.1, y: 2.7, w: 11.0, h: 0.95,
      fontSize: 11, fontFace: FONT_BODY, color: TEXT_MUTED
    });

    // Team Information Cards (4 members)
    const teamMembers = [
      { name: 'Gummadi Bharath Kumar Wesly', role: 'Team Leader • AI Architect', focus: 'Threat Modeling & Gemini Cascade' },
      { name: 'Swarnim Sulekh', role: 'Full-Stack & Backend Engineer', focus: 'Serverless APIs & Turso Cloud DB' },
      { name: 'Krrish', role: 'Frontend & PWA Developer', focus: 'Editorial UI & Service Worker' },
      { name: 'Jayaditya De', role: 'Linguistic & NLP Researcher', focus: 'Vernacular Lexicon & Deobfuscation' }
    ];

    teamMembers.forEach((member, idx) => {
      const xPos = 0.8 + (idx * 2.95);
      addCard(slide, xPos, 4.0, 2.85, 2.7);
      slide.addText(`👤 ${member.name}`, {
        x: xPos + 0.15, y: 4.15, w: 2.55, h: 0.65,
        fontSize: 10.5, fontFace: FONT_TITLE, color: TEXT_WHITE, bold: true
      });
      slide.addText(member.role, {
        x: xPos + 0.15, y: 4.85, w: 2.55, h: 0.45,
        fontSize: 9, fontFace: FONT_MONO, color: ACCENT_PURPLE, bold: true
      });
      slide.addText(member.focus, {
        x: xPos + 0.15, y: 5.35, w: 2.55, h: 1.1,
        fontSize: 9.5, fontFace: FONT_BODY, color: TEXT_MUTED
      });
    });
  }

  // =========================================================================
  // SLIDE 2: The Problem (Vernacular Smishing Epidemic in India)
  // =========================================================================
  {
    const slide = pptx.addSlide();
    setDarkSlide(slide);

    slide.addText('THE PROBLEM', {
      x: 0.8, y: 0.5, w: 4.0, h: 0.3,
      fontSize: 11, fontFace: FONT_MONO, color: ACCENT_ROSE, bold: true
    });
    slide.addText('The Transliterated Vernacular Smishing Blindspot', {
      x: 0.8, y: 0.8, w: 11.5, h: 0.6,
      fontSize: 22, fontFace: FONT_TITLE, color: TEXT_WHITE, bold: true
    });

    // Stat Boxes
    const stats = [
      { val: '₹1,750+ Cr', lbl: 'Lost to Cyber Scams in India (2024)', color: ACCENT_ROSE },
      { val: '80%+', lbl: 'Smishing Texts Use Transliterated Hindi', color: ACCENT_AMBER },
      { val: '0% Coverage', lbl: 'By Traditional English Telecom Filters', color: ACCENT_CYAN }
    ];

    stats.forEach((st, idx) => {
      const xPos = 0.8 + (idx * 4.0);
      addCard(slide, xPos, 1.55, 3.7, 1.25);
      slide.addText(st.val, {
        x: xPos + 0.2, y: 1.7, w: 3.3, h: 0.5,
        fontSize: 22, fontFace: FONT_TITLE, color: st.color, bold: true
      });
      slide.addText(st.lbl, {
        x: xPos + 0.2, y: 2.2, w: 3.3, h: 0.5,
        fontSize: 10, fontFace: FONT_BODY, color: TEXT_MUTED
      });
    });

    // Real Attack Breakdown Cards
    addCard(slide, 0.8, 3.0, 5.7, 3.6);
    slide.addText('📱 Realistic Vernacular Attack Examples', {
      x: 1.0, y: 3.2, w: 5.3, h: 0.35,
      fontSize: 13, fontFace: FONT_TITLE, color: TEXT_WHITE, bold: true
    });
    slide.addText('1. YouTube Task Scam:\n"Ghar baithe daily Rs 3000-5000 kamaye. Videos like karo aur screenshot bhejo WhatsApp par."\n\n2. Electricity Cut Threat:\n"Aapka bijli connection aaj raat 9 baje bandh ho jayega. Turant call karein aur 0TPP batayein."\n\n3. Obfuscated SBI KYC:\n"Y0UR SB1 ACC0UNT WILL BLCK T0DAY. UPDATE K-Y-C IMMED1ATE: bit.ly/sbi-kyc"', {
      x: 1.0, y: 3.6, w: 5.3, h: 2.8,
      fontSize: 10, fontFace: FONT_MONO, color: TEXT_MUTED
    });

    addCard(slide, 6.8, 3.0, 5.7, 3.6);
    slide.addText('🚨 Why Smishing is Exploding in India', {
      x: 7.0, y: 3.2, w: 5.3, h: 0.35,
      fontSize: 13, fontFace: FONT_TITLE, color: TEXT_WHITE, bold: true
    });
    slide.addText('• Script Transliteration: Latin-alphabet Hindi bypasses standard English NLP tokenizers completely.\n\n• Coercive Urgency: Threats of power disconnection, bank freezing, and police arrest exploit cognitive fear.\n\n• Leetspeak & Spaced Words: "BLCK", "0TPP", "K-Y-C" defeat crude exact-match regex filters.\n\n• Non-English Smartphone User Base: Over 500M+ regional internet users are vulnerable to localized fraud cues.', {
      x: 7.0, y: 3.65, w: 5.3, h: 2.8,
      fontSize: 11, fontFace: FONT_BODY, color: TEXT_MUTED
    });
  }

  // =========================================================================
  // SLIDE 3: Why Existing Solutions Fail (The "Aha" Comparison)
  // =========================================================================
  {
    const slide = pptx.addSlide();
    setDarkSlide(slide);

    slide.addText('THE COMPARISON & AHA MOMENT', {
      x: 0.8, y: 0.5, w: 5.0, h: 0.3,
      fontSize: 11, fontFace: FONT_MONO, color: ACCENT_AMBER, bold: true
    });
    slide.addText('Why Traditional Filters Fail vs. How Kavach AI Wins', {
      x: 0.8, y: 0.8, w: 11.5, h: 0.6,
      fontSize: 22, fontFace: FONT_TITLE, color: TEXT_WHITE, bold: true
    });

    // Comparison Table
    const tableData = [
      [
        { text: 'Capability / Vector', options: { bold: true, color: TEXT_WHITE, fill: '1A1A24' } },
        { text: 'Telecom DND / SMS Gateways', options: { bold: true, color: TEXT_WHITE, fill: '1A1A24' } },
        { text: 'Standard English ML Models', options: { bold: true, color: TEXT_WHITE, fill: '1A1A24' } },
        { text: '🛡️ Kavach AI (Our Approach)', options: { bold: true, color: ACCENT_CYAN, fill: '1A1A24' } }
      ],
      [
        { text: 'Transliterated Hinglish ("bijli cut", "khata bandh")', options: { color: TEXT_MUTED } },
        { text: '❌ Blind (0% understanding)', options: { color: ACCENT_ROSE } },
        { text: '❌ Poor semantic capture', options: { color: ACCENT_ROSE } },
        { text: '✅ Native Vernacular Engine', options: { color: ACCENT_EMERALD, bold: true } }
      ],
      [
        { text: 'Adversarial Leetspeak ("BLCK", "0TPP", "K-Y-C")', options: { color: TEXT_MUTED } },
        { text: '❌ Bypassed completely', options: { color: ACCENT_ROSE } },
        { text: '❌ Tokenizer fails / splits', options: { color: ACCENT_ROSE } },
        { text: '✅ 3-Step Levenshtein Normalizer', options: { color: ACCENT_EMERALD, bold: true } }
      ],
      [
        { text: 'Part-Time Task Fraud ("ghar baithe kamaye")', options: { color: TEXT_MUTED } },
        { text: '❌ Treated as promo SMS', options: { color: ACCENT_ROSE } },
        { text: '❌ Low risk classification', options: { color: ACCENT_ROSE } },
        { text: '✅ Deterministic Fraud Signatures', options: { color: ACCENT_EMERALD, bold: true } }
      ],
      [
        { text: 'Analysis Latency', options: { color: TEXT_MUTED } },
        { text: '200ms - 500ms', options: { color: TEXT_MUTED } },
        { text: '1200ms - 3000ms', options: { color: ACCENT_AMBER } },
        { text: '⚡ <45ms Sub-Second Speed', options: { color: ACCENT_EMERALD, bold: true } }
      ],
      [
        { text: 'Explainable AI Threat Reasons', options: { color: TEXT_MUTED } },
        { text: '❌ Opaque binary block', options: { color: ACCENT_ROSE } },
        { text: '❌ Generic percentage only', options: { color: ACCENT_ROSE } },
        { text: '✅ Exact Triggers & Reasoning', options: { color: ACCENT_EMERALD, bold: true } }
      ]
    ];

    slide.addTable(tableData, {
      x: 0.8, y: 1.55, w: 11.7, h: 3.4,
      fontSize: 10,
      border: { pt: '1', color: CARD_BORDER },
      align: 'left',
      valign: 'middle'
    });

    // Concrete Example Callout at Bottom
    addCard(slide, 0.8, 5.2, 11.7, 1.4, '121620', '2A3A4C');
    slide.addText('💡 Concrete Evasion Proof ("The Aha! Moment"):', {
      x: 1.0, y: 5.35, w: 11.3, h: 0.3,
      fontSize: 11, fontFace: FONT_TITLE, color: ACCENT_CYAN, bold: true
    });
    slide.addText('Input SMS: "Y0UR SB1 ACC0UNT WILL BLCK T0DAY. UPDATE K-Y-C IMMED1ATE: http://bit.ly/sbi-kyc"\n• Traditional Filter: PASS (No English spam keywords; "BLCK" and "SB1" are non-dictionary strings).\n• Kavach AI: 100% HIGH RISK (Deobfuscated: "block", "sbi", "kyc" | Shortener & threat patterns flagged in 35ms).', {
      x: 1.0, y: 5.65, w: 11.3, h: 0.85,
      fontSize: 10, fontFace: FONT_MONO, color: TEXT_WHITE
    });
  }

  // =========================================================================
  // SLIDE 4: Our Solution (Kavach AI Core Architecture)
  // =========================================================================
  {
    const slide = pptx.addSlide();
    setDarkSlide(slide);

    slide.addText('OUR SOLUTION', {
      x: 0.8, y: 0.5, w: 4.0, h: 0.3,
      fontSize: 11, fontFace: FONT_MONO, color: ACCENT_EMERALD, bold: true
    });
    slide.addText('Kavach AI: The Multi-Engine Defense Architecture', {
      x: 0.8, y: 0.8, w: 11.5, h: 0.6,
      fontSize: 22, fontFace: FONT_TITLE, color: TEXT_WHITE, bold: true
    });

    const pillars = [
      {
        num: '01',
        title: '3-Step Levenshtein Normalizer',
        desc: 'Strips single-character punctuation (K-Y-C -> KYC), translates leetspeak (0->o, @->a), and performs length-adaptive edit distance in <15ms.',
        color: ACCENT_CYAN
      },
      {
        num: '02',
        title: '350+ Safe-Word Whitelist Shield',
        desc: 'Protects natural vernacular conversational words (chahte, job, ghar, aap, bhejo) from being distorted by fuzzy distance matching.',
        color: ACCENT_EMERALD
      },
      {
        num: '03',
        title: 'Multi-Model Gemini AI Cascade',
        desc: 'Fuses 40% Deterministic Rule Engine with 60% Gemini Flash AI across a 6-model failover pool (Gemini 3.5, 3.7, Flash Latest) for 0% downtime.',
        color: ACCENT_PURPLE
      },
      {
        num: '04',
        title: 'Turso Cloud Threat Intelligence',
        desc: 'Real-time LibSQL/Turso database auditing, structured scam categorization, and live threat feed telemetry with zero privacy leakage.',
        color: ACCENT_AMBER
      }
    ];

    pillars.forEach((p, idx) => {
      const xPos = 0.8 + (idx % 2 * 6.0);
      const yPos = 1.6 + (Math.floor(idx / 2) * 2.5);
      addCard(slide, xPos, yPos, 5.7, 2.3);

      slide.addText(p.num, {
        x: xPos + 0.2, y: yPos + 0.2, w: 0.8, h: 0.4,
        fontSize: 18, fontFace: FONT_TITLE, color: p.color, bold: true
      });
      slide.addText(p.title, {
        x: xPos + 1.0, y: yPos + 0.25, w: 4.4, h: 0.35,
        fontSize: 13, fontFace: FONT_TITLE, color: TEXT_WHITE, bold: true
      });
      slide.addText(p.desc, {
        x: xPos + 0.2, y: yPos + 0.75, w: 5.3, h: 1.4,
        fontSize: 11, fontFace: FONT_BODY, color: TEXT_MUTED
      });
    });
  }

  // =========================================================================
  // SLIDE 5: Architecture Pipeline & Tech Stack
  // =========================================================================
  {
    const slide = pptx.addSlide();
    setDarkSlide(slide);

    slide.addText('ARCHITECTURE & PIPELINE', {
      x: 0.8, y: 0.5, w: 5.0, h: 0.3,
      fontSize: 11, fontFace: FONT_MONO, color: ACCENT_CYAN, bold: true
    });
    slide.addText('End-to-End Threat Processing & Anti-Evasion Pipeline', {
      x: 0.8, y: 0.8, w: 11.5, h: 0.6,
      fontSize: 22, fontFace: FONT_TITLE, color: TEXT_WHITE, bold: true
    });

    // Pipeline Steps Horizontal
    const steps = [
      { step: 'Step 1', title: 'Raw Ingestion & Deobfuscator', text: 'Strips hyphens, collapses spaced letters, maps leetspeak.' },
      { step: 'Step 2', title: 'Adaptive Levenshtein Engine', text: 'Length-aware distance lookup against 200+ threat lexicon.' },
      { step: 'Step 3', title: '40% Rule Scoring & URL Check', text: 'Evaluates 15 Indian attack vector regexes & shorteners.' },
      { step: 'Step 4', title: '60% Gemini Flash AI Cascade', text: 'Contextual semantic reasoning via multi-model pool.' },
      { step: 'Step 5', title: 'Verdict & Turso Cloud Audit', text: 'Weighted risk fusion score + asynchronous DB log.' }
    ];

    steps.forEach((st, idx) => {
      const xPos = 0.8 + (idx * 2.4);
      addCard(slide, xPos, 1.6, 2.25, 2.6);
      slide.addText(st.step, {
        x: xPos + 0.15, y: 1.8, w: 1.95, h: 0.25,
        fontSize: 10, fontFace: FONT_MONO, color: ACCENT_CYAN, bold: true
      });
      slide.addText(st.title, {
        x: xPos + 0.15, y: 2.1, w: 1.95, h: 0.6,
        fontSize: 11, fontFace: FONT_TITLE, color: TEXT_WHITE, bold: true
      });
      slide.addText(st.text, {
        x: xPos + 0.15, y: 2.8, w: 1.95, h: 1.2,
        fontSize: 9.5, fontFace: FONT_BODY, color: TEXT_MUTED
      });
    });

    // Tech Stack Summary at Bottom
    addCard(slide, 0.8, 4.45, 11.7, 2.15);
    slide.addText('🛠️ Comprehensive Technology Stack', {
      x: 1.0, y: 4.65, w: 5.0, h: 0.3,
      fontSize: 13, fontFace: FONT_TITLE, color: TEXT_WHITE, bold: true
    });
    slide.addText('• AI & Linguistic Engine: Google Gemini Flash (Multi-Model Pool), Fast-Levenshtein, Indic Dialect Threat Lexicon\n• Database & Storage: LibSQL / Turso Cloud Serverless SQLite (AWS AP-South-1)\n• Frontend & PWA: Custom Carbon Obsidian Micro-Surfaces, CSS 100dvh, env(safe-area-inset-*) Mobile Ergonomics\n• Deployment & Runtime: Vercel Serverless Microservices, Node.js, Service Worker Stale-While-Revalidate', {
      x: 1.0, y: 5.0, w: 11.3, h: 1.5,
      fontSize: 11, fontFace: FONT_BODY, color: TEXT_MUTED
    });
  }

  // =========================================================================
  // SLIDE 6: Live Prototype Demo & Benchmarks
  // =========================================================================
  {
    const slide = pptx.addSlide();
    setDarkSlide(slide);

    slide.addText('LIVE DEMO & BENCHMARKS', {
      x: 0.8, y: 0.5, w: 5.0, h: 0.3,
      fontSize: 11, fontFace: FONT_MONO, color: ACCENT_EMERALD, bold: true
    });
    slide.addText('Empirical Validation Across Real Indian Smishing Attacks', {
      x: 0.8, y: 0.8, w: 11.5, h: 0.6,
      fontSize: 22, fontFace: FONT_TITLE, color: TEXT_WHITE, bold: true
    });

    // Benchmark Table
    const demoData = [
      [
        { text: 'Smishing Vector Tested', options: { bold: true, color: TEXT_WHITE, fill: '1A1A24' } },
        { text: 'Sample Input Message', options: { bold: true, color: TEXT_WHITE, fill: '1A1A24' } },
        { text: 'Latency', options: { bold: true, color: TEXT_WHITE, fill: '1A1A24' } },
        { text: 'Risk Score', options: { bold: true, color: TEXT_WHITE, fill: '1A1A24' } },
        { text: 'Final Verdict', options: { bold: true, color: TEXT_WHITE, fill: '1A1A24' } }
      ],
      [
        { text: 'YouTube Task Scam', options: { color: TEXT_WHITE } },
        { text: '"Ghar baithe daily Rs 3000-5000 kamaye. Videos like karo..."', options: { color: TEXT_MUTED, fontFace: FONT_MONO } },
        { text: '38ms', options: { color: ACCENT_EMERALD, bold: true } },
        { text: '100%', options: { color: ACCENT_ROSE, bold: true } },
        { text: '🚨 HIGH RISK', options: { color: ACCENT_ROSE, bold: true } }
      ],
      [
        { text: 'Bijli Cut Threat', options: { color: TEXT_WHITE } },
        { text: '"Aapka bijli connection aaj raat 9 baje bandh ho jayega... 0TPP"', options: { color: TEXT_MUTED, fontFace: FONT_MONO } },
        { text: '42ms', options: { color: ACCENT_EMERALD, bold: true } },
        { text: '100%', options: { color: ACCENT_ROSE, bold: true } },
        { text: '🚨 HIGH RISK', options: { color: ACCENT_ROSE, bold: true } }
      ],
      [
        { text: 'SBI KYC Leetspeak', options: { color: TEXT_WHITE } },
        { text: '"Y0UR SB1 ACC0UNT WILL BLCK T0DAY. UPDATE K-Y-C IMMED1ATE"', options: { color: TEXT_MUTED, fontFace: FONT_MONO } },
        { text: '35ms', options: { color: ACCENT_EMERALD, bold: true } },
        { text: '100%', options: { color: ACCENT_ROSE, bold: true } },
        { text: '🚨 HIGH RISK', options: { color: ACCENT_ROSE, bold: true } }
      ],
      [
        { text: 'Traffic e-Challan APK', options: { color: TEXT_WHITE } },
        { text: '"Traffic challan pending. Download mParivahan.apk to pay fine"', options: { color: TEXT_MUTED, fontFace: FONT_MONO } },
        { text: '44ms', options: { color: ACCENT_EMERALD, bold: true } },
        { text: '100%', options: { color: ACCENT_ROSE, bold: true } },
        { text: '🚨 HIGH RISK', options: { color: ACCENT_ROSE, bold: true } }
      ],
      [
        { text: 'Benign Hindi Chat', options: { color: TEXT_WHITE } },
        { text: '"Bhai kal shaam ko milte hain market me, chai peeyenge."', options: { color: TEXT_MUTED, fontFace: FONT_MONO } },
        { text: '28ms', options: { color: ACCENT_EMERALD, bold: true } },
        { text: '0%', options: { color: ACCENT_EMERALD, bold: true } },
        { text: '✅ SAFE & VERIFIED', options: { color: ACCENT_EMERALD, bold: true } }
      ]
    ];

    slide.addTable(demoData, {
      x: 0.8, y: 1.55, w: 11.7, h: 3.4,
      fontSize: 10,
      border: { pt: '1', color: CARD_BORDER },
      align: 'left',
      valign: 'middle'
    });

    // Live URL Verification Box
    addCard(slide, 0.8, 5.2, 11.7, 1.4, '10141E', '1E2D3D');
    slide.addText('🌐 Live Tested & Deployed Prototype:', {
      x: 1.0, y: 5.35, w: 6.0, h: 0.3,
      fontSize: 11, fontFace: FONT_TITLE, color: ACCENT_CYAN, bold: true
    });
    slide.addText('• Live Production Web Application: https://kavach-ai-ten.vercel.app/\n• Open Source GitHub Repository: https://github.com/bharath-0814/Kavach.ai\n• Cloud Database: Turso Cloud LibSQL Active in AWS ap-south-1 with 200+ live threat signatures.', {
      x: 1.0, y: 5.7, w: 11.3, h: 0.8,
      fontSize: 10, fontFace: FONT_MONO, color: TEXT_WHITE
    });
  }

  // =========================================================================
  // SLIDE 7: Round 2 Innovations (On-Device RAG & Privacy Self-Learning)
  // =========================================================================
  {
    const slide = pptx.addSlide();
    setDarkSlide(slide);

    slide.addText('HACKATHON ROUND 2 INNOVATIONS', {
      x: 0.8, y: 0.5, w: 5.0, h: 0.3,
      fontSize: 11, fontFace: FONT_MONO, color: ACCENT_PURPLE, bold: true
    });
    slide.addText('On-Device RAG & Privacy-Preserving Self-Learning', {
      x: 0.8, y: 0.8, w: 11.5, h: 0.6,
      fontSize: 22, fontFace: FONT_TITLE, color: TEXT_WHITE, bold: true
    });

    // Left Column: Edge-Native RAG
    addCard(slide, 0.8, 1.6, 5.7, 5.0);
    slide.addText('🧠 1. Edge-Native RAG over Local Vector DB', {
      x: 1.0, y: 1.85, w: 5.3, h: 0.35,
      fontSize: 14, fontFace: FONT_TITLE, color: ACCENT_CYAN, bold: true
    });
    slide.addText('• On-Device Vector Embeddings: An ultra-compact local vector database (SQLite-VSS / local HNSW index) stores semantic embeddings of known scam tactics, fraudulent APK signatures, and vernacular evasion patterns.\n\n• Sub-10ms Cosine Similarity: When an SMS arrives, the app performs a localized vector similarity lookup completely offline.\n\n• Contextual Threat Augmentation: An on-device quantized Small Language Model (SLM) retrieves matching threat tactics and explains the exact scam modus operandi without touching the cloud.\n\n• 100% Offline Capability: Works in flight mode or remote areas with zero internet connectivity.', {
      x: 1.0, y: 2.3, w: 5.3, h: 4.1,
      fontSize: 11, fontFace: FONT_BODY, color: TEXT_MUTED
    });

    // Right Column: Federated Self-Learning & Privacy
    addCard(slide, 6.8, 1.6, 5.7, 5.0);
    slide.addText('🔒 2. Privacy-First Federated Self-Learning', {
      x: 7.0, y: 1.85, w: 5.3, h: 0.35,
      fontSize: 14, fontFace: FONT_TITLE, color: ACCENT_EMERALD, bold: true
    });
    slide.addText('• Continuous Local Adaptation: As users flag or verify emerging regional dialect SMS on their phones, the local model continuously adapts to user dialect habits.\n\n• 100% DPDP Act 2023 Compliance: Personal SMS messages are never uploaded to any remote server, guaranteeing absolute citizen privacy.\n\n• Federated Weight Aggregation: Only encrypted mathematical gradient delta updates (not user text) are periodically synced across devices to improve the collective Indic vocabulary across India.\n\n• Hardware Secure Enclave: Executed strictly inside Apple Neural Engine / Android NNAPI.', {
      x: 7.0, y: 2.3, w: 5.3, h: 4.1,
      fontSize: 11, fontFace: FONT_BODY, color: TEXT_MUTED
    });
  }

  // =========================================================================
  // SLIDE 8: High-Impact Use Cases & National Roadmap
  // =========================================================================
  {
    const slide = pptx.addSlide();
    setDarkSlide(slide);

    slide.addText('IMPACT & SCALE', {
      x: 0.8, y: 0.5, w: 4.0, h: 0.3,
      fontSize: 11, fontFace: FONT_MONO, color: ACCENT_CYAN, bold: true
    });
    slide.addText('Transformational Real-World Use Cases & National Scale', {
      x: 0.8, y: 0.8, w: 11.5, h: 0.6,
      fontSize: 22, fontFace: FONT_TITLE, color: TEXT_WHITE, bold: true
    });

    const useCases = [
      {
        icon: '👨‍👩‍👧',
        title: 'B2C: Senior Citizen Voice Shield',
        desc: 'Standalone mobile app with automated quarantine & regional voice alerts ("Yeh message dhokhadhadi hai") in Hindi, Tamil, Telugu, and Bengali for non-English literate elders.',
        color: ACCENT_CYAN
      },
      {
        icon: '🏦',
        title: 'B2B: Fintech & Banking SDK',
        desc: 'Lightweight embeddable SDK for UPI apps (PhonePe, Paytm, Google Pay, SBI YONO) that intercepts fake OTP screens and detects credential theft before payment execution.',
        color: ACCENT_EMERALD
      },
      {
        icon: '🏛️',
        title: 'B2G: Telecom Gateway Firewall',
        desc: 'Deployed directly at SMSC gateways (Airtel, Jio, Vi, TRAI DND) to perform deep-packet inspection and block smishing SMS in <10ms before transmission across cell towers.',
        color: ACCENT_PURPLE
      },
      {
        icon: '🚔',
        title: 'National Cyber Intelligence Bridge',
        desc: 'Automated real-time telemetry feed of scam phone numbers, fake APK URLs, and extortion UPI IDs shared directly with I4C (1930 Portal) to shut down scam call centers.',
        color: ACCENT_AMBER
      }
    ];

    useCases.forEach((uc, idx) => {
      const xPos = 0.8 + (idx % 2 * 6.0);
      const yPos = 1.6 + (Math.floor(idx / 2) * 2.5);
      addCard(slide, xPos, yPos, 5.7, 2.3);

      slide.addText(`${uc.icon} ${uc.title}`, {
        x: xPos + 0.25, y: yPos + 0.25, w: 5.2, h: 0.35,
        fontSize: 13, fontFace: FONT_TITLE, color: uc.color, bold: true
      });
      slide.addText(uc.desc, {
        x: xPos + 0.25, y: yPos + 0.7, w: 5.2, h: 1.45,
        fontSize: 11, fontFace: FONT_BODY, color: TEXT_MUTED
      });
    });
  }

  // Save Presentation
  const outputPath = path.join(__dirname, 'Kavach_AI_Hackathon_Pitch_Deck.pptx');
  await pptx.writeFile({ fileName: outputPath });
  console.log(`✅ PowerPoint presentation created successfully at: ${outputPath}`);
}

createKavachPresentation().catch(console.error);
