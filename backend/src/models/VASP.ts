import mongoose, { Schema, Document } from 'mongoose';

export interface IVASP extends Document {
  vaspId: string;
  name: string;
  type: string;
  jurisdiction: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  complianceScore?: number;
  website?: string;
  operationalStatus?: string;
  isSynthetic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VASPSchema = new Schema<IVASP>(
  {
    vaspId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, index: true },
    type: { type: String, required: true, default: 'Exchange' },
    jurisdiction: { type: String, required: true, default: 'Global' },
    riskLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'LOW',
    },
    complianceScore: { type: Number, min: 0, max: 100, default: 85 },
    website: { type: String },
    operationalStatus: { type: String, default: 'Active' },
    isSynthetic: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const VASP = mongoose.models.VASP || mongoose.model<IVASP>('VASP', VASPSchema);
export default VASP;
