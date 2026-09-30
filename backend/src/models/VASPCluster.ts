import mongoose, { Schema, Document } from 'mongoose';

export interface IVASPCluster extends Document {
  clusterId: string;
  vaspId: string;
  vaspName: string;
  blockchain: string;
  depositAddresses: string[];
  hotWallets: string[];
  coldWallets: string[];
  clusterSignature: string;
  confidence: number;
  isSynthetic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VASPClusterSchema = new Schema<IVASPCluster>(
  {
    clusterId: { type: String, required: true, unique: true, index: true },
    vaspId: { type: String, required: true, index: true },
    vaspName: { type: String, required: true },
    blockchain: { type: String, required: true, default: 'Ethereum' },
    depositAddresses: { type: [String], default: [] },
    hotWallets: { type: [String], default: [] },
    coldWallets: { type: [String], default: [] },
    clusterSignature: { type: String, default: '' },
    confidence: { type: Number, default: 90, min: 0, max: 100 },
    isSynthetic: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

VASPClusterSchema.index({ vaspId: 1, blockchain: 1 });

export const VASPCluster =
  mongoose.models.VASPCluster || mongoose.model<IVASPCluster>('VASPCluster', VASPClusterSchema);
export default VASPCluster;
