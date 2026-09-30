import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
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
  caseId?: string;
  isSynthetic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    hash: { type: String, required: true, index: true, trim: true },
    blockchain: { type: String, required: true, default: 'Ethereum', index: true },
    blockNumber: { type: Number, default: 0 },
    timestamp: { type: String, required: true },
    from: { type: String, required: true, index: true, lowercase: true, trim: true },
    to: { type: String, required: true, index: true, lowercase: true, trim: true },
    value: { type: Number, required: true, default: 0 },
    valueUsd: { type: Number, required: true, default: 0 },
    tokenSymbol: { type: String, default: 'ETH' },
    hopNumber: { type: Number, default: 1 },
    isSuspicious: { type: Boolean, default: false, index: true },
    flagReasons: { type: [String], default: [] },
    status: { type: String, default: 'confirmed' },
    caseId: { type: String, index: true },
    isSynthetic: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

TransactionSchema.index({ from: 1, to: 1 });
TransactionSchema.index({ caseId: 1, hopNumber: 1 });

export const Transaction = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);
export default Transaction;
