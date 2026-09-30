import mongoose, { Schema, Document } from 'mongoose';

export interface ICase extends Document {
  caseId: string;
  title: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'analyzing' | 'review' | 'completed' | 'archived';
  suspectWallet: string;
  blockchain: string;
  riskScore?: number;
  vaspConfidence?: number;
  likelyVasp?: string;
  analysisProgress: number;
  investigatorNotes: string;
  isDemoCase: boolean;
  isSynthetic: boolean;
  wallets: Array<{
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
  }>;
  transactions: Array<{
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
  }>;
  graph?: {
    nodes: Array<{
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
    }>;
    edges: Array<{
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
    }>;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CaseSchema = new Schema<ICase>(
  {
    caseId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    type: { type: String, required: true },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'analyzing', 'review', 'completed', 'archived'],
      default: 'pending',
    },
    suspectWallet: { type: String, required: true, index: true },
    blockchain: { type: String, required: true, default: 'Ethereum' },
    riskScore: { type: Number, min: 0, max: 100 },
    vaspConfidence: { type: Number, min: 0, max: 100 },
    likelyVasp: { type: String },
    analysisProgress: { type: Number, default: 0, min: 0, max: 100 },
    investigatorNotes: { type: String, default: '' },
    isDemoCase: { type: Boolean, default: false },
    isSynthetic: { type: Boolean, default: false },
    wallets: { type: [Schema.Types.Mixed] as any, default: [] },
    transactions: { type: [Schema.Types.Mixed] as any, default: [] },
    graph: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
);

// Indexes
CaseSchema.index({ status: 1, priority: 1 });
CaseSchema.index({ createdAt: -1 });

export const Case = mongoose.models.Case || mongoose.model<ICase>('Case', CaseSchema);
export default Case;
