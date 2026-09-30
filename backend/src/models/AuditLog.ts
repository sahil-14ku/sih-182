import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  id: string;
  action: string;
  caseId?: string;
  userId: string;
  userRole: string;
  details: string;
  ipAddress?: string;
  resourceType: string;
  resourceId?: string;
  severity: 'info' | 'warning' | 'critical';
  metadata?: Record<string, unknown>;
  timestamp: Date;
  isSynthetic?: boolean;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    id: { type: String, required: true, unique: true, index: true },
    action: { type: String, required: true, index: true },
    caseId: { type: String, index: true },
    userId: { type: String, required: true, index: true },
    userRole: { type: String, required: true },
    details: { type: String, required: true },
    ipAddress: { type: String },
    resourceType: { type: String, required: true },
    resourceId: { type: String },
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical'],
      default: 'info',
      index: true,
    },
    metadata: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now, index: true },
    isSynthetic: { type: Boolean, default: false },
  },
  {
    timestamps: false,
  }
);

AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ caseId: 1, timestamp: -1 });

export const AuditLog =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
export default AuditLog;
