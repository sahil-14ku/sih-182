import mongoose, { Schema, Document } from 'mongoose';

export interface IWallet extends Document {
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
  caseId?: string;
  firstSeen?: string;
  lastSeen?: string;
  isSynthetic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema = new Schema<IWallet>(
  {
    address: { type: String, required: true, index: true, lowercase: true, trim: true },
    blockchain: { type: String, required: true, default: 'Ethereum', index: true },
    label: { type: String, default: 'Unlabeled Wallet' },
    type: { type: String, default: 'wallet' },
    riskScore: { type: Number, default: 0, min: 0, max: 100 },
    totalReceived: { type: Number, default: 0 },
    totalSent: { type: Number, default: 0 },
    transactionCount: { type: Number, default: 0 },
    tags: { type: [String], default: [] },
    isKnownVasp: { type: Boolean, default: false },
    isMixer: { type: Boolean, default: false },
    isBridge: { type: Boolean, default: false },
    vaspAssociation: { type: String },
    caseId: { type: String, index: true },
    firstSeen: { type: String },
    lastSeen: { type: String },
    isSynthetic: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Compound index
WalletSchema.index({ address: 1, blockchain: 1 });

export const Wallet = mongoose.models.Wallet || mongoose.model<IWallet>('Wallet', WalletSchema);
export default Wallet;
