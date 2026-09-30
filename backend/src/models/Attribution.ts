import mongoose, { Schema, Document } from 'mongoose';

export interface IAttributionCandidate {
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

export interface IAttribution extends Document {
  caseId: string;
  suspectWallet: string;
  blockchain: string;
  candidates: IAttributionCandidate[];
  totalVaspsAnalyzed: number;
  analysisTimestamp: string;
  disclaimer: string;
  isSynthetic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AttributionSchema = new Schema<IAttribution>(
  {
    caseId: { type: String, required: true, unique: true, index: true },
    suspectWallet: { type: String, required: true, index: true },
    blockchain: { type: String, required: true, default: 'Ethereum' },
    candidates: { type: [Schema.Types.Mixed] as any, default: [] },
    totalVaspsAnalyzed: { type: Number, default: 0 },
    analysisTimestamp: { type: String, required: true },
    disclaimer: { type: String, default: 'Investigative intelligence — requires human verification' },
    isSynthetic: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const Attribution =
  mongoose.models.Attribution || mongoose.model<IAttribution>('Attribution', AttributionSchema);
export default Attribution;
