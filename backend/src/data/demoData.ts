// ─────────────────────────────────────────────────────────────────────────────
// VASPTrace Demo / Synthetic Data Layer
// Investigative Intelligence — Requires Human Verification (Synthetic Demo Data)
// ─────────────────────────────────────────────────────────────────────────────

export interface DemoVasp {
  id: string;
  vaspId: string;
  name: string;
  type: string;
  jurisdiction: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  complianceScore: number;
  website: string;
  operationalStatus: string;
}

export const DEMO_VASPS: DemoVasp[] = [
  {
    id: 'v-1',
    vaspId: 'v-1',
    name: 'Binance',
    type: 'Exchange',
    jurisdiction: 'Global',
    riskLevel: 'LOW',
    complianceScore: 90,
    website: 'https://binance.com',
    operationalStatus: 'Active',
  },
  {
    id: 'v-2',
    vaspId: 'v-2',
    name: 'Kraken',
    type: 'Exchange',
    jurisdiction: 'US',
    riskLevel: 'LOW',
    complianceScore: 95,
    website: 'https://kraken.com',
    operationalStatus: 'Active',
  },
  {
    id: 'v-3',
    vaspId: 'v-3',
    name: 'Garantex',
    type: 'Exchange',
    jurisdiction: 'Russia',
    riskLevel: 'HIGH',
    complianceScore: 35,
    website: 'https://garantex.org',
    operationalStatus: 'Sanctioned',
  },
];

export const DEMO_VASP_CLUSTERS = [
  {
    clusterId: 'CLU-GAR-001',
    vaspId: 'v-3',
    vaspName: 'Garantex',
    blockchain: 'Ethereum',
    depositAddresses: [
      '0x0987654321098765432109876543210987654321',
      '0x5555666677778888999900001111222233334444',
    ],
    hotWallets: ['0x1111222233334444555566667777888899990000'],
    coldWallets: ['0x9999888877776666555544443333222211110000'],
    clusterSignature: 'GARANTEX-CONSOLIDATION-SIG-0x88F',
    confidence: 94,
    isSynthetic: true,
  },
  {
    clusterId: 'CLU-BIN-001',
    vaspId: 'v-1',
    vaspName: 'Binance',
    blockchain: 'Ethereum',
    depositAddresses: [
      '0x7777888899990000111122223333444455556666',
      '0x3333444455556666777788889999000011112222',
    ],
    hotWallets: ['0x2222333344445555666677778888999900001111'],
    coldWallets: ['0x4444555566667777888899990000111122223333'],
    clusterSignature: 'BINANCE-DEPOSIT-FORWARD-SIG-0x12A',
    confidence: 96,
    isSynthetic: true,
  },
  {
    clusterId: 'CLU-KRA-001',
    vaspId: 'v-2',
    vaspName: 'Kraken',
    blockchain: 'Tron',
    depositAddresses: [
      'TRX9999888877776666555544443333222211110000',
      'TRX1111222233334444555566667777888899990000',
    ],
    hotWallets: ['TRX2222333344445555666677778888999900001111'],
    coldWallets: ['TRX3333444455556666777788889999000011112222'],
    clusterSignature: 'KRAKEN-INSTITUTIONAL-SWEEP-SIG-0x99B',
    confidence: 92,
    isSynthetic: true,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Score clamping helper — enforces awarded ≤ maximum for every sub-score
// ─────────────────────────────────────────────────────────────────────────────
export const clampScore = (value: number, max: number): number =>
  Math.max(0, Math.min(Math.round(value), max));

export const sanitizeAttributionScores = (attribution: any): any => {
  if (!attribution || !Array.isArray(attribution.candidates)) return attribution;
  for (const c of attribution.candidates) {
    if (c?.scoreBreakdown) {
      c.scoreBreakdown.clusterMatch = clampScore(c.scoreBreakdown.clusterMatch ?? 0, 40);
      c.scoreBreakdown.transactionProximity = clampScore(c.scoreBreakdown.transactionProximity ?? 0, 30);
      c.scoreBreakdown.behaviourSimilarity = clampScore(c.scoreBreakdown.behaviourSimilarity ?? 0, 15);
      c.scoreBreakdown.depositPattern = clampScore(c.scoreBreakdown.depositPattern ?? 0, 10);
      c.scoreBreakdown.temporalMetadata = clampScore(c.scoreBreakdown.temporalMetadata ?? 0, 5);
      c.scoreBreakdown.total = clampScore(
        c.scoreBreakdown.clusterMatch +
        c.scoreBreakdown.transactionProximity +
        c.scoreBreakdown.behaviourSimilarity +
        c.scoreBreakdown.depositPattern +
        c.scoreBreakdown.temporalMetadata,
        100
      );
    }
  }
  return attribution;
};

// ─────────────────────────────────────────────────────────────────────────────
// Deterministic Risk Profile Engine
// Returns a profile object that drives ALL analysis for a case.
// Input: caseType, priority, investigatorNotes → output: deterministic profile
// ─────────────────────────────────────────────────────────────────────────────
export interface RiskProfile {
  tier: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskScore: number;          // overall 0-100
  vaspConfidence: number;     // 0-100
  likelyVasp: string;         // VASP name or 'Unknown'
  vaspId: string;             // VASP internal ID
  vaspJurisdiction: string;
  vaspType: string;
  hopDistance: number;
  hasVaspInteraction: boolean;
  hasMixerExposure: boolean;
  hasLayering: boolean;
  hasPeelChain: boolean;
  hasRapidSweep: boolean;
  hasVelocityAnomaly: boolean;
  isSanctioned: boolean;
}

/** Keywords that drive a LOW-risk profile */
const LOW_RISK_KEYWORDS = [
  'low-risk', 'low risk', 'routine', 'personal wallet', 'no vasp', 'no suspicious',
  'no mixer', 'no tumbler', 'no layering', 'no peel', 'expected to produce a low',
  'single.*transaction', 'test-low',
];

/** Keywords that drive a MEDIUM-risk profile */
const MEDIUM_RISK_KEYWORDS = [
  'medium', 'partial', 'uncertain', 'limited evidence', 'possible',
  'unconfirmed', 'moderate', 'test-med',
];

/** Keywords that drive a HIGH / CRITICAL profile */
const HIGH_RISK_KEYWORDS = [
  'ransomware', 'darknet', 'hack', 'launder', 'sanctioned', 'garantex',
  'lazarus', 'drainer', 'phishing', 'mixer', 'tumbler', 'tornado',
  'rapid consolidation', 'peel-chain', 'layering', 'test-high',
];

function matchesAny(text: string, patterns: string[]): boolean {
  const lower = text.toLowerCase();
  return patterns.some((p) => {
    try {
      return new RegExp(p, 'i').test(lower);
    } catch {
      return lower.includes(p);
    }
  });
}

export const deriveRiskProfile = (params: {
  caseId: string;
  title: string;
  type: string;
  priority?: string;
  investigatorNotes?: string;
}): RiskProfile => {
  const { caseId, title, type, priority, investigatorNotes } = params;
  const corpus = `${caseId} ${title} ${type} ${priority || ''} ${investigatorNotes || ''}`;

  // Explicit test-case IDs take top priority
  if (/TEST-LOW/i.test(caseId) || /TEST-LOW/i.test(title)) {
    return buildLowProfile();
  }
  if (/TEST-HIGH/i.test(caseId) || /TEST-HIGH/i.test(title)) {
    return buildHighProfile();
  }
  if (/TEST-MED/i.test(caseId) || /TEST-MED/i.test(title)) {
    return buildMediumProfile();
  }

  // Investigator notes are a strong signal — check them first
  const notes = (investigatorNotes || '').toLowerCase();
  if (matchesAny(notes, LOW_RISK_KEYWORDS)) return buildLowProfile();
  if (matchesAny(corpus, HIGH_RISK_KEYWORDS)) {
    // Priority can push to CRITICAL or keep at HIGH
    if (priority === 'critical' || type === 'ransomware' || type === 'darknet') {
      return buildCriticalProfile();
    }
    return buildHighProfile();
  }
  if (matchesAny(corpus, MEDIUM_RISK_KEYWORDS)) return buildMediumProfile();

  // Priority-based fallback
  if (priority === 'critical') return buildCriticalProfile();
  if (priority === 'high') return buildHighProfile();
  if (priority === 'low') return buildLowProfile();
  return buildMediumProfile();
};

function buildLowProfile(): RiskProfile {
  return {
    tier: 'LOW',
    riskScore: 12,
    vaspConfidence: 8,
    likelyVasp: 'Unknown',
    vaspId: 'none',
    vaspJurisdiction: 'N/A',
    vaspType: 'Unknown',
    hopDistance: 0,
    hasVaspInteraction: false,
    hasMixerExposure: false,
    hasLayering: false,
    hasPeelChain: false,
    hasRapidSweep: false,
    hasVelocityAnomaly: false,
    isSanctioned: false,
  };
}

function buildMediumProfile(): RiskProfile {
  return {
    tier: 'MEDIUM',
    riskScore: 55,
    vaspConfidence: 48,
    likelyVasp: 'Binance',
    vaspId: 'v-1',
    vaspJurisdiction: 'Global',
    vaspType: 'Exchange',
    hopDistance: 3,
    hasVaspInteraction: true,
    hasMixerExposure: false,
    hasLayering: false,
    hasPeelChain: false,
    hasRapidSweep: false,
    hasVelocityAnomaly: false,
    isSanctioned: false,
  };
}

function buildHighProfile(): RiskProfile {
  return {
    tier: 'HIGH',
    riskScore: 82,
    vaspConfidence: 78,
    likelyVasp: 'Garantex',
    vaspId: 'v-3',
    vaspJurisdiction: 'Russia',
    vaspType: 'Exchange',
    hopDistance: 2,
    hasVaspInteraction: true,
    hasMixerExposure: false,
    hasLayering: true,
    hasPeelChain: true,
    hasRapidSweep: true,
    hasVelocityAnomaly: true,
    isSanctioned: true,
  };
}

function buildCriticalProfile(): RiskProfile {
  return {
    tier: 'CRITICAL',
    riskScore: 95,
    vaspConfidence: 92,
    likelyVasp: 'Garantex',
    vaspId: 'v-3',
    vaspJurisdiction: 'Russia',
    vaspType: 'Exchange',
    hopDistance: 2,
    hasVaspInteraction: true,
    hasMixerExposure: false,
    hasLayering: true,
    hasPeelChain: true,
    hasRapidSweep: true,
    hasVelocityAnomaly: true,
    isSanctioned: true,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Static DEMO_CASES (pre-seeded high-fidelity scenarios)
// ─────────────────────────────────────────────────────────────────────────────
export const DEMO_CASES = [
  // CASE-001: Project Phantom (CRITICAL)
  {
    caseId: 'CASE-001',
    title: 'Project Phantom: Ransomware Fund Movement',
    type: 'ransomware',
    priority: 'high',
    status: 'completed',
    suspectWallet: '0x1234567890123456789012345678901234567890',
    blockchain: 'Ethereum',
    riskScore: 95,
    vaspConfidence: 92,
    likelyVasp: 'Garantex',
    analysisProgress: 100,
    investigatorNotes: 'Suspect wallet traces directly to a Garantex deposit cluster through rapid consolidation.',
    isDemoCase: true,
    isSynthetic: true,
    wallets: [
      {
        address: '0x1234567890123456789012345678901234567890',
        blockchain: 'Ethereum',
        label: 'Suspect Origin (Extortion)',
        type: 'origin',
        riskScore: 95,
        totalReceived: 5000,
        totalSent: 5000,
        transactionCount: 15,
        tags: ['ransomware', 'lazarus-linked'],
        isKnownVasp: false,
        isMixer: false,
        isBridge: false,
      },
      {
        address: '0x2222444466668888aaaa0000cccc222244446666',
        blockchain: 'Ethereum',
        label: 'Intermediate Peel Wallet',
        type: 'intermediate',
        riskScore: 70,
        totalReceived: 2500,
        totalSent: 2500,
        transactionCount: 45,
        tags: ['peel-chain'],
        isKnownVasp: false,
        isMixer: false,
        isBridge: false,
      },
      {
        address: '0x0987654321098765432109876543210987654321',
        blockchain: 'Ethereum',
        label: 'VASP Deposit Wallet',
        type: 'deposit',
        riskScore: 80,
        totalReceived: 5000,
        totalSent: 5000,
        transactionCount: 200,
        tags: ['vasp', 'deposit'],
        isKnownVasp: true,
        isMixer: false,
        isBridge: false,
        vaspAssociation: 'Garantex',
      },
    ],
    transactions: [
      {
        hash: '0xabc1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab01',
        blockchain: 'Ethereum',
        blockNumber: 15000000,
        timestamp: '2026-09-20T14:32:00.000Z',
        from: '0x1234567890123456789012345678901234567890',
        to: '0x2222444466668888aaaa0000cccc222244446666',
        value: 50,
        valueUsd: 125000,
        tokenSymbol: 'ETH',
        hopNumber: 1,
        isSuspicious: true,
        flagReasons: ['Rapid split transfer', 'High velocity'],
        status: 'confirmed',
      },
      {
        hash: '0xdef9876543210fedcba9876543210fedcba9876543210fedcba9876543210fe02',
        blockchain: 'Ethereum',
        blockNumber: 15000020,
        timestamp: '2026-09-20T14:48:00.000Z',
        from: '0x2222444466668888aaaa0000cccc222244446666',
        to: '0x0987654321098765432109876543210987654321',
        value: 50,
        valueUsd: 125000,
        tokenSymbol: 'ETH',
        hopNumber: 2,
        isSuspicious: true,
        flagReasons: ['Direct transfer to high risk VASP'],
        status: 'confirmed',
      },
    ],
  },

  // CASE-002: Operation Harvest (HIGH)
  {
    caseId: 'CASE-002',
    title: 'Operation Harvest: Phishing Syndicate Drainer',
    type: 'hack',
    priority: 'medium',
    status: 'review',
    suspectWallet: '0x888877776666555544443333222211110000aaaa',
    blockchain: 'Ethereum',
    riskScore: 74,
    vaspConfidence: 84,
    likelyVasp: 'Binance',
    analysisProgress: 100,
    investigatorNotes: 'Automated sweep draining victim ERC20 balances directly to exchange hot cluster.',
    isDemoCase: true,
    isSynthetic: true,
    wallets: [
      {
        address: '0x888877776666555544443333222211110000aaaa',
        blockchain: 'Ethereum',
        label: 'Victim Drainer Contract',
        type: 'origin',
        riskScore: 78,
        totalReceived: 3200,
        totalSent: 3200,
        transactionCount: 88,
        tags: ['phishing', 'permit2-exploit'],
        isKnownVasp: false,
        isMixer: false,
        isBridge: false,
      },
      {
        address: '0x7777888899990000111122223333444455556666',
        blockchain: 'Ethereum',
        label: 'Binance Sweeper Deposit',
        type: 'deposit',
        riskScore: 50,
        totalReceived: 3200,
        totalSent: 3200,
        transactionCount: 512,
        tags: ['vasp', 'deposit'],
        isKnownVasp: true,
        isMixer: false,
        isBridge: false,
        vaspAssociation: 'Binance',
      },
    ],
    transactions: [
      {
        hash: '0x9999aaaa8888bbbb7777cccc6666dddd5555eeee4444ffff3333000022221111',
        blockchain: 'Ethereum',
        blockNumber: 15120000,
        timestamp: '2026-09-22T08:15:00.000Z',
        from: '0x888877776666555544443333222211110000aaaa',
        to: '0x7777888899990000111122223333444455556666',
        value: 120,
        valueUsd: 310000,
        tokenSymbol: 'USDT',
        hopNumber: 1,
        isSuspicious: true,
        flagReasons: ['Unusual drain frequency', 'VASP consolidation'],
        status: 'confirmed',
      },
    ],
  },

  // CASE-003: Operation Hydra (CRITICAL)
  {
    caseId: 'CASE-003',
    title: 'Operation Hydra: Cross-Chain Darknet Liquidation',
    type: 'darknet',
    priority: 'critical',
    status: 'completed',
    suspectWallet: '0x44443333222211110000ffffaaaabbbbccccdddd',
    blockchain: 'Tron',
    riskScore: 98,
    vaspConfidence: 91,
    likelyVasp: 'Kraken',
    analysisProgress: 100,
    investigatorNotes: 'High-volume narcotics vendor revenue liquidated across Tron USDT to Kraken institutional gateway.',
    isDemoCase: true,
    isSynthetic: true,
    wallets: [
      {
        address: '0x44443333222211110000ffffaaaabbbbccccdddd',
        blockchain: 'Tron',
        label: 'Darknet Market Vendor',
        type: 'origin',
        riskScore: 98,
        totalReceived: 85000,
        totalSent: 85000,
        transactionCount: 420,
        tags: ['darknet', 'sanctioned-entity'],
        isKnownVasp: false,
        isMixer: false,
        isBridge: false,
      },
      {
        address: 'TRX9999888877776666555544443333222211110000',
        blockchain: 'Tron',
        label: 'Kraken Institutional Deposit',
        type: 'deposit',
        riskScore: 40,
        totalReceived: 85000,
        totalSent: 85000,
        transactionCount: 1200,
        tags: ['vasp', 'deposit'],
        isKnownVasp: true,
        isMixer: false,
        isBridge: false,
        vaspAssociation: 'Kraken',
      },
    ],
    transactions: [
      {
        hash: '0x11113333555577779999bbbbddddeeee00002222444466668888aaaaccccffff',
        blockchain: 'Tron',
        blockNumber: 38200100,
        timestamp: '2026-09-24T18:20:00.000Z',
        from: '0x44443333222211110000ffffaaaabbbbccccdddd',
        to: 'TRX9999888877776666555544443333222211110000',
        value: 250000,
        valueUsd: 250000,
        tokenSymbol: 'USDT',
        hopNumber: 1,
        isSuspicious: true,
        flagReasons: ['Darknet vendor cashout', 'Structuring pattern'],
        status: 'confirmed',
      },
    ],
  },

  // CASE-1704067200000: Legacy demo alias
  {
    caseId: 'CASE-1704067200000',
    title: 'Lazarus Group Fund Movement',
    type: 'hack',
    priority: 'high',
    status: 'completed',
    suspectWallet: '0x1234567890123456789012345678901234567890',
    blockchain: 'Ethereum',
    riskScore: 95,
    vaspConfidence: 92,
    likelyVasp: 'Garantex',
    analysisProgress: 100,
    investigatorNotes: 'Suspect wallet traces directly to a Garantex deposit cluster.',
    isDemoCase: true,
    isSynthetic: true,
    wallets: [
      {
        address: '0x1234567890123456789012345678901234567890',
        blockchain: 'Ethereum',
        label: 'Suspect Origin',
        type: 'origin',
        riskScore: 95,
        totalReceived: 5000,
        totalSent: 5000,
        transactionCount: 15,
        tags: ['hack', 'lazarus'],
        isKnownVasp: false,
        isMixer: false,
        isBridge: false,
      },
      {
        address: '0x0987654321098765432109876543210987654321',
        blockchain: 'Ethereum',
        label: 'VASP Deposit Wallet',
        type: 'deposit',
        riskScore: 80,
        totalReceived: 5000,
        totalSent: 5000,
        transactionCount: 200,
        tags: ['vasp', 'deposit'],
        isKnownVasp: true,
        isMixer: false,
        isBridge: false,
        vaspAssociation: 'Garantex',
      },
    ],
    transactions: [
      {
        hash: '0xabc123...',
        blockchain: 'Ethereum',
        blockNumber: 15000000,
        timestamp: '2026-09-20T14:32:00.000Z',
        from: '0x1234567890123456789012345678901234567890',
        to: '0x0987654321098765432109876543210987654321',
        value: 100,
        valueUsd: 200000,
        tokenSymbol: 'ETH',
        hopNumber: 1,
        isSuspicious: true,
        flagReasons: ['Direct transfer to high risk VASP'],
        status: 'confirmed',
      },
    ],
  },

  // TEST-LOW-001: Deterministic Low-Risk Test Case
  {
    caseId: 'TEST-LOW-001',
    title: 'TEST-LOW-001: Routine Personal Wallet Transfer',
    type: 'routine',
    priority: 'low',
    status: 'completed',
    suspectWallet: '0x111122223333444455556666777788889999aaaa',
    blockchain: 'Ethereum',
    riskScore: 12,
    vaspConfidence: 8,
    likelyVasp: 'None Identified',
    analysisProgress: 100,
    investigatorNotes:
      'Routine low-risk transaction test case. Single Ethereum transaction involving a personal wallet. No known VASP interaction, no mixer or tumbler exposure, no rapid fund movement, no layering, no peel-chain behaviour, and no suspicious transaction pattern observed. Expected to produce a low risk score with no strong VASP attribution.',
    isDemoCase: true,
    isSynthetic: true,
    wallets: [
      {
        address: '0x111122223333444455556666777788889999aaaa',
        blockchain: 'Ethereum',
        label: 'Subject Wallet (Personal)',
        type: 'origin',
        riskScore: 12,
        totalReceived: 2.5,
        totalSent: 2.5,
        transactionCount: 3,
        tags: ['personal-wallet', 'low-velocity'],
        isKnownVasp: false,
        isMixer: false,
        isBridge: false,
      },
      {
        address: '0xRecipientWalletPersonalAddress0000000000',
        blockchain: 'Ethereum',
        label: 'Counterparty Wallet (Personal)',
        type: 'recipient',
        riskScore: 10,
        totalReceived: 2.5,
        totalSent: 0,
        transactionCount: 1,
        tags: ['personal-wallet'],
        isKnownVasp: false,
        isMixer: false,
        isBridge: false,
      },
    ],
    transactions: [
      {
        hash: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa01',
        blockchain: 'Ethereum',
        blockNumber: 15000000,
        timestamp: '2026-09-20T14:32:00.000Z',
        from: '0x111122223333444455556666777788889999aaaa',
        to: '0xRecipientWalletPersonalAddress0000000000',
        value: 2.5,
        valueUsd: 5000,
        tokenSymbol: 'ETH',
        hopNumber: 1,
        isSuspicious: false,
        flagReasons: [],
        status: 'confirmed',
      },
    ],
  },

  // TEST-MED-001: Deterministic Medium-Risk Test Case
  {
    caseId: 'TEST-MED-001',
    title: 'TEST-MED-001: Unverified Merchant Flow',
    type: 'money_laundering',
    priority: 'medium',
    status: 'completed',
    suspectWallet: '0x5555666677778888999900001111222233334444',
    blockchain: 'Ethereum',
    riskScore: 55,
    vaspConfidence: 48,
    likelyVasp: 'Binance',
    analysisProgress: 100,
    investigatorNotes:
      'Medium-risk test case. Moderate volume transactions showing partial correlation with Binance deposit cluster. Inconclusive peel-chain behavior.',
    isDemoCase: true,
    isSynthetic: true,
    wallets: [
      {
        address: '0x5555666677778888999900001111222233334444',
        blockchain: 'Ethereum',
        label: 'Suspect Origin',
        type: 'origin',
        riskScore: 55,
        totalReceived: 25,
        totalSent: 25,
        transactionCount: 12,
        tags: ['unverified-merchant'],
        isKnownVasp: false,
        isMixer: false,
        isBridge: false,
      },
      {
        address: '0x2222444466668888aaaa0000cccc222244446666',
        blockchain: 'Ethereum',
        label: 'Intermediate Relay Wallet',
        type: 'intermediate',
        riskScore: 50,
        totalReceived: 25,
        totalSent: 25,
        transactionCount: 20,
        tags: ['relay'],
        isKnownVasp: false,
        isMixer: false,
        isBridge: false,
      },
      {
        address: '0x28c6c06298d514db089934071355e5743bf21d60',
        blockchain: 'Ethereum',
        label: 'Binance Hot Wallet',
        type: 'deposit',
        riskScore: 45,
        totalReceived: 50000,
        totalSent: 49000,
        transactionCount: 5000,
        tags: ['vasp', 'deposit'],
        isKnownVasp: true,
        isMixer: false,
        isBridge: false,
        vaspAssociation: 'Binance',
      },
    ],
    transactions: [
      {
        hash: '0xmed1111111111111111111111111111111111111111111111111111111111101',
        blockchain: 'Ethereum',
        blockNumber: 15000000,
        timestamp: '2026-09-20T14:32:00.000Z',
        from: '0x5555666677778888999900001111222233334444',
        to: '0x2222444466668888aaaa0000cccc222244446666',
        value: 25,
        valueUsd: 50000,
        tokenSymbol: 'ETH',
        hopNumber: 1,
        isSuspicious: false,
        flagReasons: [],
        status: 'confirmed',
      },
      {
        hash: '0xmed2222222222222222222222222222222222222222222222222222222222202',
        blockchain: 'Ethereum',
        blockNumber: 15000020,
        timestamp: '2026-09-20T15:10:00.000Z',
        from: '0x2222444466668888aaaa0000cccc222244446666',
        to: '0x28c6c06298d514db089934071355e5743bf21d60',
        value: 25,
        valueUsd: 50000,
        tokenSymbol: 'ETH',
        hopNumber: 2,
        isSuspicious: true,
        flagReasons: ['Rapid forwarding to centralized exchange'],
        status: 'confirmed',
      },
    ],
  },

  // TEST-HIGH-001: Deterministic High-Risk Test Case
  {
    caseId: 'TEST-HIGH-001',
    title: 'TEST-HIGH-001: High-Velocity Ransomware Infiltration',
    type: 'hack',
    priority: 'high',
    status: 'completed',
    suspectWallet: '0x7777888899990000aaaabbbbccccddddeeeeffff',
    blockchain: 'Ethereum',
    riskScore: 82,
    vaspConfidence: 78,
    likelyVasp: 'Garantex',
    analysisProgress: 100,
    investigatorNotes:
      'High-risk test case. Ransomware extortion proceeds structured through multi-hop peel-chain ending at Garantex deposit address.',
    isDemoCase: true,
    isSynthetic: true,
    wallets: [
      {
        address: '0x7777888899990000aaaabbbbccccddddeeeeffff',
        blockchain: 'Ethereum',
        label: 'Suspect Extortion Wallet',
        type: 'origin',
        riskScore: 88,
        totalReceived: 100,
        totalSent: 100,
        transactionCount: 25,
        tags: ['hack', 'extortion'],
        isKnownVasp: false,
        isMixer: false,
        isBridge: false,
      },
      {
        address: '0x2222444466668888aaaa0000cccc222244446666',
        blockchain: 'Ethereum',
        label: 'Intermediate Peel Wallet',
        type: 'intermediate',
        riskScore: 75,
        totalReceived: 100,
        totalSent: 100,
        transactionCount: 50,
        tags: ['peel-chain'],
        isKnownVasp: false,
        isMixer: false,
        isBridge: false,
      },
      {
        address: '0x0987654321098765432109876543210987654321',
        blockchain: 'Ethereum',
        label: 'Garantex Deposit Cluster',
        type: 'deposit',
        riskScore: 80,
        totalReceived: 5000,
        totalSent: 5000,
        transactionCount: 300,
        tags: ['vasp', 'deposit', 'sanctioned'],
        isKnownVasp: true,
        isMixer: false,
        isBridge: false,
        vaspAssociation: 'Garantex',
      },
    ],
    transactions: [
      {
        hash: '0xhigh111111111111111111111111111111111111111111111111111111111101',
        blockchain: 'Ethereum',
        blockNumber: 15000000,
        timestamp: '2026-09-20T14:32:00.000Z',
        from: '0x7777888899990000aaaabbbbccccddddeeeeffff',
        to: '0x2222444466668888aaaa0000cccc222244446666',
        value: 100,
        valueUsd: 200000,
        tokenSymbol: 'ETH',
        hopNumber: 1,
        isSuspicious: true,
        flagReasons: ['Rapid split transfer', 'High velocity'],
        status: 'confirmed',
      },
      {
        hash: '0xhigh222222222222222222222222222222222222222222222222222222222202',
        blockchain: 'Ethereum',
        blockNumber: 15000020,
        timestamp: '2026-09-20T14:48:00.000Z',
        from: '0x2222444466668888aaaa0000cccc222244446666',
        to: '0x0987654321098765432109876543210987654321',
        value: 100,
        valueUsd: 200000,
        tokenSymbol: 'ETH',
        hopNumber: 2,
        isSuspicious: true,
        flagReasons: ['Direct transfer to high risk VASP', 'Sanctioned entity destination'],
        status: 'confirmed',
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// In-memory case store
// ─────────────────────────────────────────────────────────────────────────────
export const inMemoryCases = new Map<string, any>();

export const saveCaseToMemory = (caseData: any) => {
  inMemoryCases.set(caseData.caseId, caseData);
};

export const getCaseFromMemory = (caseId: string) => {
  return inMemoryCases.get(caseId);
};

export const getAllSessionCases = () => {
  return Array.from(inMemoryCases.values());
};

export const getBlockchainToken = (chain: string): string => {
  const c = (chain || '').toLowerCase();
  if (c.includes('bitcoin') || c === 'btc') return 'BTC';
  if (c.includes('tron') || c === 'trx') return 'USDT';
  if (c.includes('solana') || c === 'sol') return 'SOL';
  if (c.includes('bsc') || c === 'bnb') return 'BNB';
  return 'ETH';
};

export const getBlockchainPricing = (chain: string): { perTxAmount: number; usdRate: number } => {
  const c = (chain || '').toLowerCase();
  if (c.includes('bitcoin') || c === 'btc') return { perTxAmount: 2.5, usdRate: 65000 };
  if (c.includes('tron') || c === 'trx') return { perTxAmount: 125000, usdRate: 1 };
  if (c.includes('solana') || c === 'sol') return { perTxAmount: 800, usdRate: 150 };
  if (c.includes('bsc') || c === 'bnb') return { perTxAmount: 250, usdRate: 580 };
  return { perTxAmount: 50, usdRate: 2600 };
};

export const getSyntheticWallets = (
  chain: string,
  suspectWallet: string,
  likelyVasp: string
): { intermediate: string; deposit: string; txHash1: string; txHash2: string } => {
  const c = (chain || '').toLowerCase();
  if (c.includes('bitcoin') || c === 'btc') {
    return {
      intermediate: 'bc1q9x3d8u52y68h4p9m7f2n0w1e3r4t5y6u7i8o9p',
      deposit: `3VaspCluster${likelyVasp}SweepDeposit888x999y77`,
      txHash1: '7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b',
      txHash2: '4f5e6d7c8b9a0f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b3a4f5e',
    };
  }
  if (c.includes('tron') || c === 'trx') {
    return {
      intermediate: 'TRX7777888899990000111122223333444455556666',
      deposit: `TRX${likelyVasp.toUpperCase()}DEPOSITCLUSTER888899990000`,
      txHash1: '0x11113333555577779999bbbbddddeeee00002222444466668888aaaaccccffff',
      txHash2: '0x2222444466668888aaaa0000cccc2222444466668888aaaa0000cccc22224444',
    };
  }
  if (c.includes('solana') || c === 'sol') {
    return {
      intermediate: 'SolPeel7xHopIntermediateWallet8889991112223334',
      deposit: `Sol${likelyVasp}DepositClusterSweep8889991112223334`,
      txHash1: '5KjPqY8Xw7VzN4m2L1k9J8h7G6f5D4s3A2q1W0e9R8t7Y6u5I4o3P2a1S0d9F8g',
      txHash2: '3A2q1W0e9R8t7Y6u5I4o3P2a1S0d9F8g5KjPqY8Xw7VzN4m2L1k9J8h7G6f5D4s',
    };
  }
  if (c.includes('bsc') || c === 'bnb') {
    return {
      intermediate: '0x3333555577779999bbbbddddeeee000022224444',
      deposit: '0x555577779999bbbbddddeeee0000222244446666',
      txHash1: '0xbbb1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab01',
      txHash2: '0xccc9876543210fedcba9876543210fedcba9876543210fedcba9876543210fe02',
    };
  }
  return {
    intermediate: '0x2222444466668888aaaa0000cccc222244446666',
    deposit: '0x0987654321098765432109876543210987654321',
    txHash1: '0xabc1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab01',
    txHash2: '0xdef9876543210fedcba9876543210fedcba9876543210fedcba9876543210fe02',
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Build attribution result from a risk profile — fully clamped scores
// ─────────────────────────────────────────────────────────────────────────────
function buildAttribution(
  caseId: string,
  suspectWallet: string,
  chainName: string,
  profile: RiskProfile,
  vaspPath: string[]
) {
  const DISCLAIMER =
    'Investigative intelligence — requires human verification (Synthetic Demo Data)';

  if (!profile.hasVaspInteraction) {
    // LOW risk — no attribution candidate
    return {
      caseId,
      suspectWallet,
      blockchain: chainName,
      totalVaspsAnalyzed: 120,
      analysisTimestamp: new Date().toISOString(),
      disclaimer: DISCLAIMER,
      candidates: [],
    };
  }

  // Score breakdown — each component is individually clamped to its max
  const MAX_CLUSTER    = 35;
  const MAX_PROXIMITY  = 25;
  const MAX_BEHAVIOUR  = 15;
  const MAX_DEPOSIT    = 10;
  const MAX_TEMPORAL   = 5; // BUG 2 fix: max was being shown as 5 but value was 7
  const TOTAL_MAX      = MAX_CLUSTER + MAX_PROXIMITY + MAX_BEHAVIOUR + MAX_DEPOSIT + MAX_TEMPORAL; // 90

  const confidence = clampScore(profile.vaspConfidence, 100);
  // Distribute confidence across the 5 components proportionally, clamped
  const ratio = confidence / 100;
  const clusterMatch       = clampScore(MAX_CLUSTER * ratio, MAX_CLUSTER);
  const transactionProximity = clampScore(MAX_PROXIMITY * ratio, MAX_PROXIMITY);
  const behaviourSimilarity  = clampScore(MAX_BEHAVIOUR * ratio, MAX_BEHAVIOUR);
  const depositPattern       = clampScore(MAX_DEPOSIT * ratio, MAX_DEPOSIT);
  const temporalMetadata     = clampScore(MAX_TEMPORAL * ratio, MAX_TEMPORAL);
  const total = clampScore(
    clusterMatch + transactionProximity + behaviourSimilarity + depositPattern + temporalMetadata,
    TOTAL_MAX
  );

  return {
    caseId,
    suspectWallet,
    blockchain: chainName,
    totalVaspsAnalyzed: 120,
    analysisTimestamp: new Date().toISOString(),
    disclaimer: DISCLAIMER,
    candidates: [
      {
        rank: 1,
        vaspId: profile.vaspId,
        vaspName: profile.likelyVasp,
        vaspType: profile.vaspType,
        jurisdiction: profile.vaspJurisdiction,
        confidence,
        scoreBreakdown: {
          clusterMatch,
          transactionProximity,
          behaviourSimilarity,
          depositPattern,
          temporalMetadata,
          total,
        },
        hopDistance: profile.hopDistance,
        vaspPath,
        evidenceIds: [
          `EVD-${caseId}-CLU-001`,
          `EVD-${caseId}-PRX-001`,
          `EVD-${caseId}-BEH-001`,
        ],
        clusterMatchDetails: `Address structure matches known ${profile.likelyVasp} deposit aggregation cluster on ${chainName}`,
        behaviourDetails: `Consolidation pattern consistent with ${profile.likelyVasp} operational behaviour on ${chainName}`,
        depositPatternDetails: profile.hasRapidSweep
          ? 'Deterministic deposit sweep intervals detected'
          : 'Standard deposit pattern — no sweep anomaly',
        temporalDetails: profile.hasVelocityAnomaly
          ? 'Aligned with active clearing window'
          : 'Temporal pattern within normal transaction range',
        proximityDetails: `${profile.hopDistance}-hop proximity from suspect wallet origin on ${chainName}`,
        methodology: 'Heuristic clustering and transaction graph traversal',
        isSynthetic: true,
        disclaimer: 'Investigative intelligence — requires human verification',
      },
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Build risk result from a risk profile — fully clamped scores
// ─────────────────────────────────────────────────────────────────────────────
function buildRisk(
  caseId: string,
  suspectWallet: string,
  chainName: string,
  tokenSymbol: string,
  profile: RiskProfile,
  depositAddress: string
) {
  const DISCLAIMER = 'Decision-support intelligence only — requires human investigator review';
  const score = clampScore(profile.riskScore, 100);
  const riskLevel =
    score >= 85 ? 'CRITICAL' : score >= 70 ? 'HIGH' : score >= 40 ? 'MEDIUM' : 'LOW';

  if (profile.tier === 'LOW') {
    // Low risk: no factors detected, no suspicious typologies
    return {
      caseId,
      suspectWallet,
      overallScore: score,
      riskLevel: 'LOW' as const,
      methodology: 'Proprietary multi-factor VASP risk scoring model',
      disclaimer: DISCLAIMER,
      factors: [
        {
          name: 'High Risk Entity Interaction',
          key: 'vasp_exposure',
          score: 0,
          maxScore: 40,
          description: 'No interaction with flagged VASP cluster detected',
          evidenceIds: [],
          detected: false,
        },
        {
          name: 'Velocity Anomaly',
          key: 'velocity',
          score: 0,
          maxScore: 30,
          description: 'No rapid multi-hop disbursement pattern detected',
          evidenceIds: [],
          detected: false,
        },
        {
          name: 'Layering Typology Match',
          key: 'layering',
          score: 0,
          maxScore: 30,
          description: 'No peel-chain or layering behaviour detected',
          evidenceIds: [],
          detected: false,
        },
      ],
      typologies: [],
      walletPriority: [
        {
          address: suspectWallet,
          label: 'Subject Wallet (Low Risk)',
          riskScore: score,
          vaspConfidence: profile.vaspConfidence,
          transactionVolume: 0,
          typologies: [],
          priority: 'low',
          reason: 'No suspicious activity detected. Routine transaction profile.',
        },
      ],
    };
  }

  // Medium / High / Critical — factors are conditionally populated
  const vaspScore     = profile.hasVaspInteraction ? clampScore(Math.round(score * 0.42), 40) : 0;
  const velScore      = profile.hasVelocityAnomaly ? clampScore(Math.round(score * 0.32), 30) : 0;
  const layerScore    = profile.hasLayering        ? clampScore(Math.round(score * 0.26), 30) : 0;

  const factors = [
    {
      name: 'High Risk Entity Interaction',
      key: 'vasp_exposure',
      score: vaspScore,
      maxScore: 40,
      description: profile.hasVaspInteraction
        ? `Interaction with flagged cluster (${profile.likelyVasp}) on ${chainName}`
        : 'No interaction with flagged VASP cluster detected',
      evidenceIds: profile.hasVaspInteraction ? [`EVD-${caseId}-CLU-001`] : [],
      detected: profile.hasVaspInteraction,
    },
    {
      name: 'Velocity Anomaly',
      key: 'velocity',
      score: velScore,
      maxScore: 30,
      description: profile.hasVelocityAnomaly
        ? `Rapid multi-hop disbursement executed within 90 minutes on ${chainName}`
        : 'No velocity anomaly detected',
      evidenceIds: profile.hasVelocityAnomaly ? [`EVD-${caseId}-TMP-001`] : [],
      detected: profile.hasVelocityAnomaly,
    },
    {
      name: 'Layering Typology Match',
      key: 'layering',
      score: layerScore,
      maxScore: 30,
      description: profile.hasLayering
        ? `Peel-chain structuring detected across intermediate ${chainName} addresses`
        : 'No layering pattern detected',
      evidenceIds: profile.hasLayering ? [`EVD-${caseId}-TYP-001`] : [],
      detected: profile.hasLayering,
    },
  ];

  const typologies = [];
  if (profile.hasPeelChain) {
    typologies.push({
      name: 'Peel Chain Structuring',
      code: 'TYP-001',
      description: `Rapid disbursement of ${tokenSymbol} through multiple hops in peeling increments`,
      confidence: clampScore(88, 100),
      indicators: ['High velocity', 'Systematic remainder retention', 'Forward sweep'],
    });
  }
  if (profile.hasRapidSweep) {
    typologies.push({
      name: 'Rapid Exchange Deposit Sweep',
      code: 'TYP-002',
      description: `Direct aggregation into centralized exchange sweep deposit hot-wallet on ${chainName}`,
      confidence: clampScore(91, 100),
      indicators: ['Deterministic fee forwarding', 'Exchange address match'],
    });
  }

  return {
    caseId,
    suspectWallet,
    overallScore: score,
    riskLevel: riskLevel as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    methodology: 'Proprietary multi-factor VASP risk scoring model',
    disclaimer: DISCLAIMER,
    factors,
    typologies,
    walletPriority: [
      {
        address: depositAddress || suspectWallet,
        label: profile.hasVaspInteraction
          ? `${profile.likelyVasp} Deposit Gateway`
          : 'Subject Wallet',
        riskScore: clampScore(profile.riskScore - 10, 100),
        vaspConfidence: clampScore(profile.vaspConfidence, 100),
        transactionVolume: 5000,
        typologies: typologies.map((t) => t.code),
        priority: score >= 85 ? 'critical' : score >= 70 ? 'high' : 'medium',
        reason: profile.hasVaspInteraction
          ? 'Direct exit gateway requiring immediate freezing or MLAT inquiry'
          : 'Monitor for further activity',
      },
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Build evidence chain from a risk profile
// ─────────────────────────────────────────────────────────────────────────────
function buildEvidence(
  caseId: string,
  suspectWallet: string,
  chainName: string,
  tokenSymbol: string,
  profile: RiskProfile,
  txHash1: string,
  txHash2: string,
  depositAddress: string
) {
  const DISCLAIMER_SRC = 'VASPTrace Analysis Engine (Synthetic Demo Data)';

  if (profile.tier === 'LOW') {
    return [
      {
        evidenceId: `EVD-${caseId}-CLEAN-001`,
        caseId,
        type: 'routine_transaction',
        title: 'Routine Transaction — No Suspicious Activity',
        description: `Single ${tokenSymbol} transaction on ${chainName}. No VASP interaction, no mixer exposure, no layering pattern, no peel-chain behaviour, and no velocity anomaly detected. Consistent with a standard personal wallet transfer.`,
        source: DISCLAIMER_SRC,
        timestamp: new Date().toISOString(),
        transactionHash: txHash1,
        relatedWallet: suspectWallet,
        confidence: 95,
        weight: 5,
        isSynthetic: true,
      },
    ];
  }

  const items: any[] = [];

  if (profile.hasVaspInteraction) {
    items.push({
      evidenceId: `EVD-${caseId}-CLU-001`,
      caseId,
      type: 'cluster_match',
      title: `VASP Cluster Address Match (${chainName})`,
      description: `Deposit wallet address pattern matches known ${profile.likelyVasp} cluster signature on ${chainName}. Co-spending heuristics confirmed high confidence.`,
      source: 'VASPTrace Cluster Intelligence Database (Synthetic Demo Data)',
      timestamp: new Date().toISOString(),
      transactionHash: txHash2,
      relatedWallet: depositAddress,
      confidence: clampScore(profile.vaspConfidence, 100),
      weight: 40,
      isSynthetic: true,
    });

    items.push({
      evidenceId: `EVD-${caseId}-PRX-001`,
      caseId,
      type: 'transaction_proximity',
      title: `Transaction Proximity to VASP (${chainName})`,
      description: `${profile.hopDistance}-hop transaction chain traced from suspect wallet to ${profile.likelyVasp} deposit address on ${chainName}.`,
      source: 'Transaction Graph Analysis Engine',
      timestamp: new Date().toISOString(),
      transactionHash: txHash1,
      relatedWallet: suspectWallet,
      confidence: clampScore(profile.vaspConfidence - 8, 100),
      weight: 25,
      isSynthetic: true,
    });

    items.push({
      evidenceId: `EVD-${caseId}-BEH-001`,
      caseId,
      type: 'behaviour_similarity',
      title: `Behaviour Pattern Match (${tokenSymbol})`,
      description: `Transaction pattern matches known ${profile.likelyVasp} deposit behaviour: consolidation of ${tokenSymbol} and batch forwarding.`,
      source: 'Behavioural Intelligence Engine',
      timestamp: new Date().toISOString(),
      transactionHash: txHash1,
      relatedWallet: suspectWallet,
      confidence: clampScore(profile.vaspConfidence - 12, 100),
      weight: 15,
      isSynthetic: true,
    });
  }

  if (profile.hasVelocityAnomaly) {
    items.push({
      evidenceId: `EVD-${caseId}-TMP-001`,
      caseId,
      type: 'temporal',
      title: 'Temporal Activity Velocity',
      description: 'Transaction execution window completed within 90 minutes, demonstrating coordinated laundering velocity.',
      source: 'Temporal Analysis Engine',
      timestamp: new Date().toISOString(),
      transactionHash: txHash1,
      relatedWallet: suspectWallet,
      confidence: clampScore(76, 100),
      weight: 10,
      isSynthetic: true,
    });
  }

  if (profile.hasPeelChain) {
    items.push({
      evidenceId: `EVD-${caseId}-TYP-001`,
      caseId,
      type: 'typology',
      title: 'Typology: Peel Chain Structuring',
      description: `Systematic peeling of ${tokenSymbol} funds through intermediate hops prior to VASP cashout.`,
      source: 'Typology Detection Engine',
      timestamp: new Date().toISOString(),
      transactionHash: txHash2,
      relatedWallet: suspectWallet,
      confidence: clampScore(88, 100),
      weight: 10,
      isSynthetic: true,
    });
  }

  return items;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main synthetic case generator — now deterministic and profile-driven
// ─────────────────────────────────────────────────────────────────────────────
export const generateSyntheticCaseData = (params: {
  caseId: string;
  title: string;
  type: string;
  priority?: string;
  suspectWallet: string;
  blockchain: string;
  investigatorNotes?: string;
}) => {
  const { caseId, title, type, priority, suspectWallet, blockchain, investigatorNotes } = params;

  const c = (blockchain || 'Ethereum').toLowerCase();
  const chainName =
    c.includes('bitcoin') || c === 'btc' ? 'Bitcoin' :
    c.includes('tron')    || c === 'trx' ? 'Tron' :
    c.includes('solana')  || c === 'sol' ? 'Solana' :
    c.includes('bsc')     || c === 'bnb' ? 'BSC' :
    'Ethereum';

  const tokenSymbol = getBlockchainToken(chainName);
  const { perTxAmount, usdRate } = getBlockchainPricing(chainName);

  // ── Derive deterministic profile from case metadata ─────────────────────
  const profile = deriveRiskProfile({ caseId, title, type, priority, investigatorNotes });

  const { intermediate, deposit, txHash1, txHash2 } = profile.hasVaspInteraction
    ? getSyntheticWallets(chainName, suspectWallet, profile.likelyVasp)
    : {
        intermediate: suspectWallet,
        deposit: suspectWallet,
        txHash1: `0x${'a'.repeat(62)}01`,
        txHash2: `0x${'b'.repeat(62)}02`,
      };

  // ── Transactions ─────────────────────────────────────────────────────────
  const transactions: any[] = [];
  if (profile.hasVaspInteraction) {
    transactions.push(
      {
        hash: txHash1,
        blockchain: chainName,
        blockNumber: chainName === 'Bitcoin' ? 850000 : 15000000,
        timestamp: '2026-09-20T14:32:00.000Z',
        from: suspectWallet,
        to: intermediate,
        value: perTxAmount,
        valueUsd: perTxAmount * usdRate,
        tokenSymbol,
        hopNumber: 1,
        isSuspicious: true,
        flagReasons: ['Rapid split transfer', 'High velocity'],
        status: 'confirmed',
      },
      {
        hash: txHash2,
        blockchain: chainName,
        blockNumber: chainName === 'Bitcoin' ? 850002 : 15000020,
        timestamp: '2026-09-20T14:48:00.000Z',
        from: intermediate,
        to: deposit,
        value: perTxAmount,
        valueUsd: perTxAmount * usdRate,
        tokenSymbol,
        hopNumber: 2,
        isSuspicious: true,
        flagReasons: ['Direct transfer to high risk VASP'],
        status: 'confirmed',
      }
    );
  } else {
    // Low risk — single clean transaction
    transactions.push({
      hash: txHash1,
      blockchain: chainName,
      blockNumber: chainName === 'Bitcoin' ? 850000 : 15000000,
      timestamp: '2026-09-20T14:32:00.000Z',
      from: suspectWallet,
      to: '0xRecipientWalletPersonalAddress0000000000',
      value: perTxAmount * 0.1,
      valueUsd: perTxAmount * usdRate * 0.1,
      tokenSymbol,
      hopNumber: 1,
      isSuspicious: false,
      flagReasons: [],
      status: 'confirmed',
    });
  }

  // ── Wallets ───────────────────────────────────────────────────────────────
  const wallets: any[] = [
    {
      address: suspectWallet,
      blockchain: chainName,
      label: profile.hasVaspInteraction
        ? `Suspect Origin (${chainName})`
        : `Subject Wallet (${chainName})`,
      type: 'origin',
      riskScore: clampScore(profile.riskScore, 100),
      totalReceived: perTxAmount * (profile.hasVaspInteraction ? 2 : 0.1),
      totalSent: perTxAmount * (profile.hasVaspInteraction ? 2 : 0.1),
      transactionCount: profile.hasVaspInteraction ? 2 : 1,
      tags: profile.hasVaspInteraction ? [type || 'hack', 'suspect-origin'] : ['personal', 'routine'],
      isKnownVasp: false,
      isMixer: false,
      isBridge: false,
    },
  ];

  if (profile.hasVaspInteraction && intermediate !== suspectWallet) {
    wallets.push({
      address: intermediate,
      blockchain: chainName,
      label: 'Intermediate Relay Wallet',
      type: 'intermediate',
      riskScore: 70,
      totalReceived: perTxAmount,
      totalSent: perTxAmount,
      transactionCount: 2,
      tags: ['intermediate'],
      isKnownVasp: false,
      isMixer: false,
      isBridge: false,
    });
    wallets.push({
      address: deposit,
      blockchain: chainName,
      label: `${profile.likelyVasp} Deposit Wallet`,
      type: 'deposit',
      riskScore: 80,
      totalReceived: perTxAmount,
      totalSent: perTxAmount,
      transactionCount: 200,
      tags: ['vasp', 'deposit'],
      isKnownVasp: true,
      isMixer: false,
      isBridge: false,
      vaspAssociation: profile.likelyVasp,
    });
  }

  // ── Graph ─────────────────────────────────────────────────────────────────
  const graphNodes: any[] = [
    {
      id: 'n1',
      label: profile.hasVaspInteraction ? `Suspect (${chainName})` : `Subject Wallet (${chainName})`,
      type: 'wallet',
      blockchain: chainName,
      riskScore: clampScore(profile.riskScore, 100),
      isVasp: false,
      isMixer: false,
      isBridge: false,
      position: { x: 50, y: 150 },
      address: suspectWallet,
    },
  ];
  const graphEdges: any[] = [];

  if (profile.hasVaspInteraction) {
    graphNodes.push(
      {
        id: 'n2',
        label: 'Intermediate Relay',
        type: 'wallet',
        blockchain: chainName,
        riskScore: 65,
        isVasp: false,
        isMixer: false,
        isBridge: false,
        position: { x: 300, y: 150 },
        address: intermediate,
      },
      {
        id: 'n3',
        label: `${profile.likelyVasp} Deposit Cluster`,
        type: 'wallet',
        blockchain: chainName,
        riskScore: 80,
        isVasp: true,
        vaspAssociation: profile.likelyVasp,
        isMixer: false,
        isBridge: false,
        position: { x: 550, y: 150 },
        address: deposit,
      }
    );
    graphEdges.push(
      {
        id: 'e1',
        source: 'n1',
        target: 'n2',
        value: perTxAmount,
        valueUsd: perTxAmount * usdRate,
        tokenSymbol,
        hopNumber: 1,
        isSuspicious: true,
        timestamp: '2026-09-20T14:32:00.000Z',
        hash: txHash1,
      },
      {
        id: 'e2',
        source: 'n2',
        target: 'n3',
        value: perTxAmount,
        valueUsd: perTxAmount * usdRate,
        tokenSymbol,
        hopNumber: 2,
        isSuspicious: true,
        timestamp: '2026-09-20T14:48:00.000Z',
        hash: txHash2,
      }
    );
  }

  const graph = {
    nodes: graphNodes,
    edges: graphEdges,
    caseId,
    walletCount: graphNodes.length,
    transactionCount: graphEdges.length,
  };

  // ── Attribution, Risk, Evidence ───────────────────────────────────────────
  const vaspPath = profile.hasVaspInteraction
    ? [suspectWallet, intermediate, deposit]
    : [];

  const attribution = buildAttribution(caseId, suspectWallet, chainName, profile, vaspPath);
  const risk        = buildRisk(caseId, suspectWallet, chainName, tokenSymbol, profile, deposit);
  const evidence    = buildEvidence(
    caseId, suspectWallet, chainName, tokenSymbol, profile, txHash1, txHash2, deposit
  );

  const fullCase = {
    caseId,
    title,
    type,
    priority: priority || 'medium',
    status: 'pending',
    suspectWallet,
    blockchain: chainName,
    investigatorNotes: investigatorNotes || '',
    analysisProgress: 0,
    riskScore: profile.riskScore,
    vaspConfidence: profile.vaspConfidence,
    likelyVasp: profile.likelyVasp,
    isDemoCase: false,
    isSynthetic: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    wallets,
    transactions,
    graph,
    attribution,
    risk,
    evidence,
  };

  return { caseData: fullCase, wallets, transactions, graph, attribution, risk, evidence };
};

// ─────────────────────────────────────────────────────────────────────────────
// getDemoWalletGraph — serve from memory/DB first, generate from profile otherwise
// ─────────────────────────────────────────────────────────────────────────────
export const getDemoWalletGraph = (caseId: string) => {
  const memCase = inMemoryCases.get(caseId);
  if (memCase?.graph) return memCase.graph;

  const foundCase = DEMO_CASES.find((c) => c.caseId === caseId);
  if (foundCase) {
    const likelyVasp = foundCase.likelyVasp || 'Garantex';
    const token = getBlockchainToken(foundCase.blockchain);
    const tx1 = foundCase.transactions?.[0];
    const tx2 = foundCase.transactions?.[1];
    return {
      nodes: [
        {
          id: 'n1', label: `Suspect (${foundCase.blockchain})`, type: 'wallet',
          blockchain: foundCase.blockchain, riskScore: foundCase.riskScore || 90,
          isVasp: false, isMixer: false, isBridge: false,
          position: { x: 50, y: 150 }, address: foundCase.suspectWallet,
        },
        {
          id: 'n2', label: 'Intermediate Relay', type: 'wallet',
          blockchain: foundCase.blockchain, riskScore: 65,
          isVasp: false, isMixer: false, isBridge: false,
          position: { x: 300, y: 150 },
          address: foundCase.wallets?.[1]?.address || '0x2222444466668888aaaa0000cccc222244446666',
        },
        {
          id: 'n3', label: `${likelyVasp} Deposit Cluster`, type: 'wallet',
          blockchain: foundCase.blockchain, riskScore: 80,
          isVasp: true, vaspAssociation: likelyVasp, isMixer: false, isBridge: false,
          position: { x: 550, y: 150 },
          address: foundCase.wallets?.[foundCase.wallets.length - 1]?.address || '0x0987654321098765432109876543210987654321',
        },
      ],
      edges: [
        {
          id: 'e1', source: 'n1', target: 'n2',
          value: tx1?.value || 50, valueUsd: tx1?.valueUsd || 125000,
          tokenSymbol: tx1?.tokenSymbol || token, hopNumber: 1, isSuspicious: true,
          timestamp: tx1?.timestamp || '2026-09-20T14:32:00.000Z', hash: tx1?.hash || '0xhash1',
        },
        {
          id: 'e2', source: 'n2', target: 'n3',
          value: tx2?.value || tx1?.value || 50, valueUsd: tx2?.valueUsd || tx1?.valueUsd || 125000,
          tokenSymbol: tx2?.tokenSymbol || token, hopNumber: 2, isSuspicious: true,
          timestamp: tx2?.timestamp || '2026-09-20T14:48:00.000Z', hash: tx2?.hash || '0xhash2',
        },
      ],
      caseId,
      walletCount: 3,
      transactionCount: foundCase.transactions?.length || 2,
    };
  }

  // Unknown case — return minimal single-node graph
  return {
    nodes: [{ id: 'n1', label: 'Subject Wallet', type: 'wallet', blockchain: 'Ethereum', riskScore: 0, isVasp: false, isMixer: false, isBridge: false, position: { x: 50, y: 150 }, address: 'unknown' }],
    edges: [],
    caseId,
    walletCount: 1,
    transactionCount: 0,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// getDemoAttribution — memory/DB first, then deterministic by case profile
// ─────────────────────────────────────────────────────────────────────────────
export const getDemoAttribution = (caseId: string) => {
  const memCase = inMemoryCases.get(caseId);
  if (memCase?.attribution) return memCase.attribution;

  const foundCase = DEMO_CASES.find((c) => c.caseId === caseId);
  if (foundCase) {
    // Use the static case data directly for known cases
    const profile = deriveRiskProfile({
      caseId: foundCase.caseId,
      title: foundCase.title,
      type: foundCase.type,
      priority: foundCase.priority,
      investigatorNotes: foundCase.investigatorNotes,
    });
    const vaspPath = foundCase.wallets.map((w) => w.address);
    return buildAttribution(foundCase.caseId, foundCase.suspectWallet, foundCase.blockchain, profile, vaspPath);
  }

  // Completely unknown case — produce a minimal low-confidence placeholder
  return {
    caseId,
    suspectWallet: 'unknown',
    blockchain: 'Ethereum',
    totalVaspsAnalyzed: 120,
    analysisTimestamp: new Date().toISOString(),
    disclaimer: 'Investigative intelligence — requires human verification (Synthetic Demo Data)',
    candidates: [],
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// getDemoRisk — memory/DB first, then deterministic by case profile
// ─────────────────────────────────────────────────────────────────────────────
export const getDemoRisk = (caseId: string) => {
  const memCase = inMemoryCases.get(caseId);
  if (memCase?.risk) return memCase.risk;

  const foundCase = DEMO_CASES.find((c) => c.caseId === caseId);
  if (foundCase) {
    const profile = deriveRiskProfile({
      caseId: foundCase.caseId,
      title: foundCase.title,
      type: foundCase.type,
      priority: foundCase.priority,
      investigatorNotes: foundCase.investigatorNotes,
    });
    const depositAddress = foundCase.wallets.find((w) => w.type === 'deposit')?.address || foundCase.suspectWallet;
    const token = getBlockchainToken(foundCase.blockchain);
    return buildRisk(foundCase.caseId, foundCase.suspectWallet, foundCase.blockchain, token, profile, depositAddress);
  }

  // Unknown case — return low-risk placeholder
  const profile = buildLowProfile();
  return buildRisk(caseId, 'unknown', 'Ethereum', 'ETH', profile, 'unknown');
};

// ─────────────────────────────────────────────────────────────────────────────
// getDemoEvidence — memory/DB first, then deterministic by case profile
// ─────────────────────────────────────────────────────────────────────────────
export const getDemoEvidence = (caseId: string) => {
  const memCase = inMemoryCases.get(caseId);
  if (memCase?.evidence) return memCase.evidence;

  const foundCase = DEMO_CASES.find((c) => c.caseId === caseId);
  if (foundCase) {
    const profile = deriveRiskProfile({
      caseId: foundCase.caseId,
      title: foundCase.title,
      type: foundCase.type,
      priority: foundCase.priority,
      investigatorNotes: foundCase.investigatorNotes,
    });
    const token = getBlockchainToken(foundCase.blockchain);
    const tx1 = foundCase.transactions[0];
    const tx2 = foundCase.transactions[foundCase.transactions.length - 1];
    const deposit = foundCase.wallets.find((w) => w.type === 'deposit')?.address || foundCase.suspectWallet;
    return buildEvidence(
      foundCase.caseId, foundCase.suspectWallet, foundCase.blockchain, token, profile,
      tx1?.hash || '', tx2?.hash || '', deposit
    );
  }

  // Unknown case — single clean placeholder
  return [
    {
      evidenceId: `EVD-${caseId}-CLEAN-001`,
      caseId,
      type: 'routine_transaction',
      title: 'No Evidence of Suspicious Activity',
      description: 'No matching VASP cluster, mixer exposure, or typology pattern detected for this case.',
      source: 'VASPTrace Analysis Engine (Synthetic Demo Data)',
      timestamp: new Date().toISOString(),
      transactionHash: undefined,
      relatedWallet: undefined,
      confidence: 90,
      weight: 5,
      isSynthetic: true,
    },
  ];
};
