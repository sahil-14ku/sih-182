import { Router, Request, Response } from 'express';
import { isDatabaseConnected } from '../config/database';
import { AuditLog } from '../models/AuditLog';

const router = Router();

// In-memory audit log store for fallback/demo mode
const inMemoryAuditLogs: AuditEntry[] = [];

export interface AuditEntry {
  id?: string;
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
  timestamp?: Date;
}

export const logAudit = async (entry: AuditEntry): Promise<void> => {
  const logId = entry.id || `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const now = entry.timestamp || new Date();

  const formattedEntry = {
    ...entry,
    id: logId,
    timestamp: now,
  };

  // Always update in-memory buffer for instant fallback
  inMemoryAuditLogs.unshift(formattedEntry);
  if (inMemoryAuditLogs.length > 500) inMemoryAuditLogs.pop();

  // If MongoDB is connected, persist it
  if (isDatabaseConnected()) {
    try {
      await AuditLog.create({
        id: logId,
        action: entry.action,
        caseId: entry.caseId,
        userId: entry.userId,
        userRole: entry.userRole,
        details: entry.details,
        ipAddress: entry.ipAddress,
        resourceType: entry.resourceType,
        resourceId: entry.resourceId,
        severity: entry.severity,
        metadata: entry.metadata,
        timestamp: now,
        isSynthetic: false,
      });
    } catch (err: any) {
      console.error('⚠️ [AuditLog] Error persisting audit entry to MongoDB:', err.message);
    }
  }
};

// Seed initial in-memory demo audit logs
const seedDemoLogs = () => {
  const demoLogs: AuditEntry[] = [
    { action: 'CASE_CREATED', caseId: 'CASE-001', userId: 'demo-investigator', userRole: 'investigator', details: 'Case CASE-001 created: Project Phantom', resourceType: 'Case', resourceId: 'CASE-001', severity: 'info' },
    { action: 'WALLET_ANALYZED', caseId: 'CASE-001', userId: 'demo-investigator', userRole: 'investigator', details: 'Wallet analysis initiated for 0x1234567890123456789012345678901234567890', resourceType: 'Wallet', severity: 'info' },
    { action: 'GRAPH_VIEWED', caseId: 'CASE-001', userId: 'demo-investigator', userRole: 'investigator', details: 'Fund flow graph rendered for CASE-001', resourceType: 'FundFlowGraph', severity: 'info' },
    { action: 'ATTRIBUTION_REVIEWED', caseId: 'CASE-001', userId: 'demo-investigator', userRole: 'investigator', details: 'VASP attribution reviewed: Garantex, 92% confidence', resourceType: 'Attribution', severity: 'warning' },
    { action: 'EVIDENCE_VIEWED', caseId: 'CASE-001', userId: 'demo-investigator', userRole: 'investigator', details: 'Evidence chain reviewed (5 items)', resourceType: 'Evidence', severity: 'info' },
    { action: 'REPORT_GENERATED', caseId: 'CASE-001', userId: 'demo-investigator', userRole: 'investigator', details: 'Investigation report generated: RPT-CASE-001-demo', resourceType: 'Report', severity: 'info' },
    { action: 'CASE_CREATED', caseId: 'CASE-002', userId: 'demo-investigator', userRole: 'investigator', details: 'Case CASE-002 created: Operation Harvest', resourceType: 'Case', resourceId: 'CASE-002', severity: 'info' },
    { action: 'CASE_CREATED', caseId: 'CASE-003', userId: 'demo-investigator', userRole: 'investigator', details: 'Case CASE-003 created: Operation Hydra', resourceType: 'Case', resourceId: 'CASE-003', severity: 'critical' },
    { action: 'USER_LOGIN', userId: 'demo-investigator', userRole: 'investigator', details: 'Investigator authenticated successfully', resourceType: 'Auth', severity: 'info' },
    { action: 'REPORT_GENERATED', caseId: 'CASE-003', userId: 'demo-investigator', userRole: 'investigator', details: 'High-priority report generated for cross-chain laundering case', resourceType: 'Report', severity: 'warning' },
  ];

  const now = Date.now();
  demoLogs.forEach((log, i) => {
    inMemoryAuditLogs.push({
      ...log,
      id: `LOG-DEMO-00${i + 1}`,
      timestamp: new Date(now - (demoLogs.length - i) * 3600000),
    });
  });
};

seedDemoLogs();

// GET /api/audit-logs
router.get('/', async (req: Request, res: Response) => {
  try {
    const { caseId, action, severity, limit = '50', page = '1' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit as string) || 50));
    const skip = (pageNum - 1) * limitNum;

    // Use MongoDB if connected
    if (isDatabaseConnected()) {
      const filter: Record<string, unknown> = {};
      if (caseId) filter.caseId = String(caseId);
      if (action) filter.action = String(action);
      if (severity) filter.severity = String(severity);

      const [docs, total] = await Promise.all([
        AuditLog.find(filter).sort({ timestamp: -1 }).skip(skip).limit(limitNum).lean(),
        AuditLog.countDocuments(filter),
      ]);

      if (docs.length > 0 || Object.keys(filter).length > 0) {
        return res.json({
          success: true,
          data: docs,
          total,
          page: pageNum,
          limit: limitNum,
          demoMode: false,
          storage: 'mongodb',
        });
      }
    }

    // Fallback mode
    let filtered = [...inMemoryAuditLogs];
    if (caseId) filtered = filtered.filter((l) => l.caseId === caseId);
    if (action) filtered = filtered.filter((l) => l.action === action);
    if (severity) filtered = filtered.filter((l) => l.severity === severity);

    const paginated = filtered.slice(skip, skip + limitNum);

    res.json({
      success: true,
      data: paginated,
      total: filtered.length,
      page: pageNum,
      limit: limitNum,
      demoMode: true,
      storage: 'fallback_memory',
    });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
