/**
 * VASPTrace API Client
 * Centralized HTTP client for all backend API calls
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const getHeaders = (): HeadersInit => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('vasptrace_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...getHeaders(), ...(options.headers || {}) },
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
  return json;
};

// ─── Auth ────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    request<{ success: boolean; data: { token: string; user: User } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  demoLogin: () =>
    request<{ success: boolean; data: { token: string; user: User }; message: string }>('/auth/demo-login', { method: 'POST' }),
  me: () => request<{ success: boolean; data: User }>('/auth/me'),
};

// ─── Cases ───────────────────────────────────────────
export const casesApi = {
  list: () => request<{ success: boolean; data: CaseSummary[]; total: number }>('/cases'),
  get: (id: string) => request<{ success: boolean; data: FullCase }>(`/cases/${id}`),
  create: (payload: CreateCasePayload) =>
    request<{ success: boolean; data: CaseSummary }>('/cases', { method: 'POST', body: JSON.stringify(payload) }),
  analyze: (id: string) => request<{ success: boolean; data: AnalysisResult }>(`/cases/${id}/analyze`, { method: 'POST' }),
  attribution: (id: string) => request<{ success: boolean; data: AttributionResult }>(`/cases/${id}/attribution`),
  risk: (id: string) => request<{ success: boolean; data: RiskResult }>(`/cases/${id}/risk`),
  evidence: (id: string) => request<{ success: boolean; data: Evidence[] }>(`/cases/${id}/evidence`),
  graph: (id: string) => request<{ success: boolean; data: GraphData }>(`/cases/${id}/graph`),
  dashboardStats: () => request<{ success: boolean; data: DashboardStats }>('/cases/dashboard/stats'),
  report: (id: string, payload?: Record<string, any>) =>
    request<{ success: boolean; data: Report }>(`/reports/${id}`, {
      method: 'POST',
      body: payload ? JSON.stringify(payload) : undefined,
    }),
};

// ─── Wallet ───────────────────────────────────────────
export const walletApi = {
  get: (address: string) => request<{ success: boolean; data: WalletData }>(`/wallet/${address}`),
  transactions: (address: string) => request<{ success: boolean; data: Transaction[] }>(`/wallet/${address}/transactions`),
};

// ─── Copilot ─────────────────────────────────────────
export const copilotApi = {
  query: (caseId: string, query: string) =>
    request<{ success: boolean; data: CopilotResponse }>('/copilot/query', {
      method: 'POST',
      body: JSON.stringify({ caseId, query }),
    }),
};

// ─── Audit Logs ──────────────────────────────────────
export const auditApi = {
  list: (params?: { caseId?: string; limit?: number; page?: number }) => {
    const qs = new URLSearchParams();
    if (params?.caseId) qs.set('caseId', params.caseId);
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.page) qs.set('page', String(params.page));
    return request<{ success: boolean; data: AuditLog[]; total: number }>(`/audit-logs?${qs}`);
  },
};

// ─── Types ───────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'investigator' | 'admin';
  badge: string;
}

export interface CaseSummary {
  caseId: string;
  title: string;
  type: string;
  priority: string;
  status: string;
  suspectWallet: string;
  blockchain: string;
  riskScore?: number;
  vaspConfidence?: number;
  likelyVasp?: string;
  analysisProgress: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateCasePayload {
  title: string;
  type: string;
  priority: string;
  suspectWallet: string;
  blockchain: string;
  investigatorNotes?: string;
}

export interface FullCase extends CaseSummary {
  investigatorNotes: string;
  wallets: WalletData[];
  transactions: Transaction[];
  isDemoCase?: boolean;
  risk?: any;
  attribution?: any;
  graph?: any;
  evidence?: any;
}

export interface WalletData {
  address: string;
  blockchain: string;
  label: string;
  type: string;
  riskScore: number;
  totalReceived: number;
  totalSent: number;
  transactionCount: number;
  tags: string[];
  isKnownVasp: boolean;
  isMixer: boolean;
  isBridge: boolean;
  vaspAssociation?: string;
}

export interface Transaction {
  hash: string;
  blockchain: string;
  blockNumber: number;
  timestamp: string;
  from: string;
  to: string;
  value: number;
  valueUsd: number;
  tokenSymbol: string;
  hopNumber: number;
  isSuspicious: boolean;
  flagReasons: string[];
  status: string;
}

export interface AttributionCandidate {
  rank: number;
  vaspId: string;
  vaspName: string;
  vaspType: string;
  jurisdiction: string;
  confidence: number;
  scoreBreakdown: {
    clusterMatch: number;
    transactionProximity: number;
    behaviourSimilarity: number;
    depositPattern: number;
    temporalMetadata: number;
    total: number;
  };
  hopDistance: number;
  vaspPath: string[];
  evidenceIds: string[];
  clusterMatchDetails: string;
  behaviourDetails: string;
  depositPatternDetails: string;
  temporalDetails: string;
  proximityDetails: string;
  methodology: string;
  isSynthetic: boolean;
  disclaimer: string;
}

export interface AttributionResult {
  caseId: string;
  suspectWallet: string;
  blockchain: string;
  candidates: AttributionCandidate[];
  totalVaspsAnalyzed: number;
  analysisTimestamp: string;
  disclaimer: string;
}

export interface RiskFactor {
  name: string;
  key: string;
  score: number;
  maxScore: number;
  description: string;
  evidenceIds: string[];
  detected: boolean;
}

export interface Typology {
  name: string;
  code: string;
  description: string;
  confidence: number;
  indicators: string[];
}

export interface WalletPriority {
  address: string;
  label: string;
  riskScore: number;
  vaspConfidence: number;
  transactionVolume: number;
  typologies: string[];
  priority: string;
  reason: string;
}

export interface RiskResult {
  caseId: string;
  suspectWallet: string;
  overallScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  factors: RiskFactor[];
  typologies: Typology[];
  walletPriority: WalletPriority[];
  methodology: string;
  disclaimer: string;
}

export interface Evidence {
  evidenceId: string;
  type: string;
  title: string;
  description: string;
  source: string;
  timestamp: string;
  transactionHash?: string;
  relatedWallet?: string;
  confidence: number;
  weight: number;
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  blockchain: string;
  riskScore: number;
  isVasp: boolean;
  isMixer: boolean;
  isBridge: boolean;
  vaspAssociation?: string;
  position: { x: number; y: number };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  value: number;
  valueUsd: number;
  tokenSymbol: string;
  hopNumber: number;
  isSuspicious: boolean;
  timestamp: string;
  hash: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  caseId: string;
  walletCount: number;
  transactionCount: number;
}

export interface DashboardStats {
  activeInvestigations: number;
  totalCases: number;
  highRiskWallets: number;
  vaspMatches: number;
  pendingReviews: number;
  completedCases: number;
  criticalCases: number;
  avgRiskScore: number;
  avgVaspConfidence: number;
}

export interface AnalysisResult {
  caseId: string;
  status: string;
  analysisProgress: number;
  steps: { step: number; name: string; status: string; progress: number }[];
  riskScore?: number;
  vaspConfidence?: number;
  likelyVasp?: string;
}

export interface CopilotResponse {
  query: string;
  queryType: string;
  answer: string;
  evidenceIds: string[];
  confidence: number;
  disclaimer: string;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  action: string;
  caseId?: string;
  userId: string;
  userRole: string;
  details: string;
  resourceType: string;
  resourceId?: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
}

export interface Report {
  reportId: string;
  caseId: string;
  generatedAt: string;
  caseInformation: Record<string, unknown>;
  walletSummary: Record<string, unknown>;
  transactionSummary: Record<string, unknown>;
  vaspAttribution: Record<string, unknown>;
  riskAssessment: Record<string, unknown>;
  timeline: Array<Record<string, unknown>>;
  disclaimer: string;
  syntheticDataNotice: string;
}
