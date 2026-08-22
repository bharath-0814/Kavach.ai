/**
 * Kavach AI — Indian Cybersecurity Threat Knowledge Base (RAG Corpus)
 * Contains verified threat intelligence vectors, CERT-In / I4C advisories,
 * IT Act 2000 & BNS legal provisions, and citizen safety mitigations.
 */

const THREAT_KNOWLEDGE_BASE = [
  {
    id: 'VEC-TASK-001',
    category: 'JOB_TASK_FRAUD',
    title: 'YouTube / Telegram Part-Time Work-From-Home Task Scam',
    vernacular_patterns: [
      'Ghar baithe daily Rs 3000-5000 kamaye',
      'YouTube video like karo aur screenshot bhejo',
      'Part time job zero investment WhatsApp message',
      'Daily payout 2000-8000 Telegram task complete',
      'Review rating task daily income'
    ],
    modus_operandi: 'Victim is lured with small initial payouts (Rs 150-500) for liking YouTube videos or leaving Google reviews. Then coerced into joining VIP Telegram groups demanding prepaid deposits for high returns, leading to complete fund freeze.',
    i4c_advisory: 'I4C Advisory MHA-2024-TASK-09 (Part-Time Job Task Frauds)',
    cert_in_bulletin: 'CERT-In Alert CI-2024-0045 (Social Media Task Phishing)',
    legal_sections: ['IT Act 2000 § 66D (Cheating by Personation)', 'BNS § 318(4) / IPC § 420 (Cheating & Dishonesty)'],
    action_plan: 'Never pay money to unlock job earnings. Do not join private Telegram investment channels. Report extortion UPI handles to 1930.',
    keywords: ['ghar baithe', 'kamaye', 'youtube', 'like', 'screenshot', 'part time', 'daily earning', 'task', 'telegram', 'zero investment']
  },
  {
    id: 'VEC-UTIL-002',
    category: 'UTILITY_BILL',
    title: 'Electricity & Gas Disconnection Urgency Extortion',
    vernacular_patterns: [
      'Aapka bijli connection aaj raat 9 baje bandh ho jayega',
      'Bijli bill overdue turant phone karein 0TPP batayein',
      'Dear consumer your electricity power will be disconnected tonight',
      'Contact electricity officer at mobile number immediately',
      'Gas connection suspended update bill payment'
    ],
    modus_operandi: 'Attacker creates extreme panic claiming power will be cut in 1 hour due to previous month un-updated bill. Directs victim to call a personal mobile number or download a malicious APK / remote desktop app (AnyDesk/TeamViewer) or share OTP.',
    i4c_advisory: 'I4C Advisory MHA-2024-ELEC-14 (Electricity Bill Cyber Phishing)',
    cert_in_bulletin: 'CERT-In Advisory CI-2024-0112 (Utility Disconnection Smishing)',
    legal_sections: ['IT Act 2000 § 66C (Identity Theft)', 'IT Act 2000 § 66D', 'BNS § 318(4) / IPC § 420'],
    action_plan: 'Electricity DISCOMs (BESCOM, Tata Power, UPPCL, WBSEDCL) NEVER send personal mobile numbers in SMS. Pay solely through official DISCOM portals or official BBPS apps.',
    keywords: ['bijli', 'electricity', 'disconnect', 'bandh', 'overdue', 'power cut', 'consumer', '0tpp', 'officer', 'bill']
  },
  {
    id: 'VEC-KYC-003',
    category: 'KYC_FRAUD',
    title: 'Bank Account Suspension & PAN/Aadhaar KYC Expiry Lure',
    vernacular_patterns: [
      'Y0UR SB1 ACC0UNT WILL BLCK T0DAY UPDATE K-Y-C IMMED1ATE',
      'Aapka khata bandh ho chuka hai PAN link karein',
      'Dear Customer your HDFC account deactivated submit Aadhaar KYC',
      'YONO access disabled update netbanking details now',
      'Penalty Rs 10000 will be debited for unlinked PAN card'
    ],
    modus_operandi: 'Phishing SMS impersonates major banks (SBI, HDFC, ICICI, PNB) using obfuscated leetspeak and shortened URLs. Directs victim to a pixel-perfect fake netbanking portal to steal credentials, password, and OTP.',
    i4c_advisory: 'I4C Advisory MHA-2024-BNK-03 (Banking Impersonation & Fake KYC Portals)',
    cert_in_bulletin: 'CERT-In Advisory CI-2024-0088 (Fake Banking Web-Spoofing)',
    legal_sections: ['IT Act 2000 § 66C', 'IT Act 2000 § 66D', 'BNS § 319 (Cheating by Impersonation)'],
    action_plan: 'Banks never request KYC updates via bit.ly/ngrok links or SMS. Check official banking app directly or visit your local branch.',
    keywords: ['sbi', 'hdfc', 'icici', 'yono', 'account block', 'khata', 'kyc', 'pan', 'aadhaar', 'blck', 'k-y-c']
  },
  {
    id: 'VEC-TRAF-004',
    category: 'TRAFFIC_ECHALLAN',
    title: 'Fake Traffic e-Challan Notice with Malicious APK Dropper',
    vernacular_patterns: [
      'Traffic challan pending fine download mParivahan.apk to pay',
      'Notice: Traffic fine Rs 1000 pending on vehicle DL-01',
      'Court warrant issued for unpaid traffic challan download app',
      'e-Challan payment failed click link to clear warrant'
    ],
    modus_operandi: 'Victim receives SMS claiming unpaid vehicle fine with urgent court threats. Clicking the link downloads a fake Android APK (e.g. mParivahan_v2.apk) that intercepts banking OTPs and reads SMS permissions in the background.',
    i4c_advisory: 'I4C Alert MHA-2024-APK-07 (Malicious APK Spread via Traffic Challan SMS)',
    cert_in_bulletin: 'CERT-In Vulnerability Note CI-2024-0091 (Android Malware Droppers)',
    legal_sections: ['IT Act 2000 § 43 (Damage to Computer System)', 'IT Act § 66 (Computer Related Offences)', 'IT Act § 66D'],
    action_plan: 'Official traffic challans are paid exclusively on https://echallan.parivahan.gov.in. NEVER install `.apk` files from SMS links or browser downloads.',
    keywords: ['traffic', 'challan', 'echallan', 'mparivahan', 'apk', 'fine', 'vehicle', 'court', 'warrant', 'dl-']
  },
  {
    id: 'VEC-PARC-005',
    category: 'PARCEL_DELIVERY',
    title: 'India Post / Courier Delivery Address Update Phishing',
    vernacular_patterns: [
      'India Post: Your package delivery failed due to incorrect address',
      'Update delivery address within 24 hours to avoid return to sender',
      'Parcel IN98234 held at transit hub pay Rs 25 re-delivery fee',
      'Speed post parcel returned update pin code immediately'
    ],
    modus_operandi: 'Smishing SMS mimics India Post, BlueDart, or DTDC claiming a parcel is stuck. Victims are prompted to enter address details and pay a nominal Rs 10-25 fee, which captures credit/debit card credentials and triggers unauthorized transactions.',
    i4c_advisory: 'I4C Advisory MHA-2024-POST-05 (Postal Service Smishing Campaigns)',
    cert_in_bulletin: 'CERT-In Advisory CI-2024-0062 (Postal Delivery Credential Harvest)',
    legal_sections: ['IT Act 2000 § 66C', 'IT Act 2000 § 66D', 'BNS § 318(4)'],
    action_plan: 'Track parcels strictly on https://www.indiapost.gov.in using tracking consignment numbers. India Post never requests payment via unofficial shortened links.',
    keywords: ['india post', 'parcel', 'package', 'delivery failed', 'address', 'speed post', 're-delivery', 'consignment']
  },
  {
    id: 'VEC-ARST-006',
    category: 'DIGITAL_ARREST',
    title: 'Digital Arrest / CBI / Mumbai Police Video Extortion',
    vernacular_patterns: [
      'CBI / Mumbai Police arrest warrant issued on your Aadhaar',
      'Illegal narcotics found in FedEx parcel sent from Taiwan in your name',
      'Connect on Skype / WhatsApp video call for Supreme Court verification',
      'Do not disconnect phone or local police will raid your house'
    ],
    modus_operandi: 'Attackers impersonate police/CBI/customs officials over phone and video calls using fake badges and police station backdrops. Victim is placed under psychological "Digital Arrest" and coerced into transferring entire bank savings into "RBI verification accounts".',
    i4c_advisory: 'I4C National Advisory MHA-2024-DIGI-01 (Digital Arrest Scams)',
    cert_in_bulletin: 'CERT-In Advisory CI-2024-0130 (Law Enforcement Impersonation Frauds)',
    legal_sections: ['IT Act 2000 § 66D', 'BNS § 308 (Extortion)', 'BNS § 319 (Cheating by Impersonation)'],
    action_plan: 'Indian Law has NO provision for "Digital Arrest". No police officer or court conducts trials on Skype/WhatsApp. Terminate the call and call 1930 immediately.',
    keywords: ['cbi', 'police', 'digital arrest', 'fedex', 'narcotics', 'warrant', 'skype', 'customs', 'illegal parcel']
  },
  {
    id: 'VEC-TAX-007',
    category: 'INCOME_TAX_REFUND',
    title: 'Income Tax Refund Approval & Banking Credential Lure',
    vernacular_patterns: [
      'Your Income Tax Refund of Rs 28,450 has been approved',
      'Update your bank account number to receive IT refund within 2 hours',
      'IT Department refund pending click link to verify IFSC and PAN'
    ],
    modus_operandi: 'Phishing SMS arrives during tax filing seasons claiming a refund has been credited. The link redirects to a fake Income Tax e-filing portal designed to steal netbanking logins and debit card numbers.',
    i4c_advisory: 'I4C Advisory MHA-2024-TAX-02 (Income Tax Refund Phishing)',
    cert_in_bulletin: 'CERT-In Advisory CI-2024-0078 (Tax Portal Impersonation)',
    legal_sections: ['IT Act 2000 § 66C', 'IT Act 2000 § 66D'],
    action_plan: 'Check tax refunds exclusively on https://eportal.incometax.gov.in. IT Department credits refunds directly to pre-validated bank accounts without SMS link prompts.',
    keywords: ['income tax', 'refund', 'it refund', 'approved', 'pan', 'ifsc', 'tax credit']
  },
  {
    id: 'VEC-LOAN-008',
    category: 'FAKE_LOAN',
    title: 'Instant Pre-Approved Instant Loan & Contact Extortion',
    vernacular_patterns: [
      'Pre-approved instant personal loan of Rs 5,00,000 without CIBIL',
      'Zero interest loan approved download app to disburse cash in 5 mins',
      'Pay Rs 1500 processing fee to unlock instant disbursement'
    ],
    modus_operandi: 'Unlicensed loan apps ask for contacts and gallery permissions, deposit an initial small amount, then demand 300% interest while threatening to harass contacts with morphed photos.',
    i4c_advisory: 'I4C Advisory MHA-2024-LOAN-04 (Illegal Chinese & Predatory Loan Apps)',
    cert_in_bulletin: 'CERT-In Alert CI-2024-0052 (Predatory Loan Malware)',
    legal_sections: ['IT Act 2000 § 66E (Privacy Violation)', 'IT Act § 67', 'BNS § 308 (Extortion)'],
    action_plan: 'Never install unverified loan APKs. Only take loans from RBI-registered NBFCs and banks listed on the RBI Sachet portal.',
    keywords: ['loan', 'instant loan', 'cibil', 'pre-approved', 'disburse', 'processing fee']
  }
];

module.exports = {
  THREAT_KNOWLEDGE_BASE
};
