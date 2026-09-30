import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {
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
  isSynthetic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    reportId: { type: String, required: true, unique: true, index: true },
    caseId: { type: String, required: true, index: true },
    generatedAt: { type: String, required: true },
    caseInformation: { type: Schema.Types.Mixed, required: true },
    walletSummary: { type: Schema.Types.Mixed, required: true },
    transactionSummary: { type: Schema.Types.Mixed, required: true },
    vaspAttribution: { type: Schema.Types.Mixed, required: true },
    riskAssessment: { type: Schema.Types.Mixed, required: true },
    timeline: { type: [Schema.Types.Mixed] as any, default: [] },
    disclaimer: { type: String, required: true },
    syntheticDataNotice: { type: String, required: true },
    isSynthetic: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

ReportSchema.index({ caseId: 1, generatedAt: -1 });

export const Report = mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);
export default Report;
