import mongoose, { Schema, Document } from 'mongoose';

export interface IEvidence extends Document {
  evidenceId: string;
  caseId: string;
  type: string;
  title: string;
  description: string;
  source: string;
  timestamp: string;
  transactionHash?: string;
  relatedWallet?: string;
  confidence: number;
  weight: number;
  isSynthetic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EvidenceSchema = new Schema<IEvidence>(
  {
    evidenceId: { type: String, required: true, unique: true, index: true },
    caseId: { type: String, required: true, index: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    source: { type: String, required: true },
    timestamp: { type: String, required: true },
    transactionHash: { type: String },
    relatedWallet: { type: String },
    confidence: { type: Number, required: true, min: 0, max: 100 },
    weight: { type: Number, required: true, min: 0, max: 100 },
    isSynthetic: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

EvidenceSchema.index({ caseId: 1, type: 1 });

export const Evidence =
  mongoose.models.Evidence || mongoose.model<IEvidence>('Evidence', EvidenceSchema);
export default Evidence;
