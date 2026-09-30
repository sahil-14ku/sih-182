import { Router, Request, Response } from 'express';
import { isDatabaseConnected } from '../config/database';
import { Attribution } from '../models/Attribution';
import { runAttributionEngine } from '../engines/attributionEngine';
import { sanitizeAttributionScores } from '../data/demoData';
import { logAudit } from './auditLogs';

const router = Router();

// GET /api/attribution/:caseId
router.get('/:caseId', async (req: Request, res: Response) => {
  try {
    const { caseId } = req.params;

    if (isDatabaseConnected()) {
      const dbAttribution = await Attribution.findOne({ caseId }).lean();
      if (dbAttribution) {
        await logAudit({
          action: 'ATTRIBUTION_VIEWED',
          caseId,
          userId: 'demo-investigator',
          userRole: 'investigator',
          details: `VASP attribution fetched from database for case ${caseId}`,
          resourceType: 'Attribution',
          resourceId: caseId,
          severity: 'info',
        });

        return res.json({
          success: true,
          data: sanitizeAttributionScores(dbAttribution),
          demoMode: false,
          storage: 'mongodb',
        });
      }
    }

    const result = sanitizeAttributionScores(runAttributionEngine(caseId));

    // Save to database if connected
    if (isDatabaseConnected()) {
      await Attribution.findOneAndUpdate(
        { caseId },
        { ...result, isSynthetic: true },
        { upsert: true }
      ).catch(() => {});
    }

    await logAudit({
      action: 'ATTRIBUTION_VIEWED',
      caseId,
      userId: 'demo-investigator',
      userRole: 'investigator',
      details: `VASP attribution computed via attribution engine for case ${caseId}`,
      resourceType: 'Attribution',
      resourceId: caseId,
      severity: 'info',
    });

    res.json({
      success: true,
      data: result,
      demoMode: !isDatabaseConnected(),
      storage: isDatabaseConnected() ? 'mongodb' : 'fallback_demo',
    });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
