import mongoose, { Schema, Document } from 'mongoose';

export interface IRiskFactor {
  name: string;
  key: string;
  score: number;
  maxScore: number;
  description: string;
  evidenceIds: string[];
  detected: boolean;
}

export interface ITypology {
  name: string;
  code: string;
  description: string;
  confidence: number;
  indicators: string[];
}

export interface IWalletPriority {
  address: string;
  label: string;
  riskScore: number;
  vaspConfidence: number;
  transactionVolume: number;
  typologies: string[];
  priority: string;
  reason: string;
}

export interface IRiskAssessment extends Document {
  caseId: string;
  suspectWallet: string;
  overallScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  methodology: string;
  disclaimer: string;
  factors: IRiskFactor[];
  typologies: ITypology[];
  walletPriority: IWalletPriority[];
  isSynthetic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RiskAssessmentSchema = new Schema<IRiskAssessment>(
  {
    caseId: { type: String, required: true, unique: true, index: true },
    suspectWallet: { type: String, required: true, index: true },
    overallScore: { type: Number, required: true, min: 0, max: 100 },
    riskLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
    },
    methodology: { type: String, default: 'VASPTrace Multi-Factor Risk Assessment Engine' },
    disclaimer: { type: String, default: 'Decision-support intelligence only — requires human investigator review' },
    factors: { type: [Schema.Types.Mixed] as any, default: [] },
    typologies: { type: [Schema.Types.Mixed] as any, default: [] },
    walletPriority: { type: [Schema.Types.Mixed] as any, default: [] },
    isSynthetic: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const RiskAssessment =
  mongoose.models.RiskAssessment ||
  mongoose.model<IRiskAssessment>('RiskAssessment', RiskAssessmentSchema);
export default RiskAssessment;
