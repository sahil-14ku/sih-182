import { Router, Request, Response } from 'express';
import { isDatabaseConnected } from '../config/database';
import { Case, Report, Attribution, RiskAssessment } from '../models';
import { DEMO_CASES, getCaseFromMemory } from '../data/demoData';
import { runAttributionEngine } from '../engines/attributionEngine';
import { runRiskEngine } from '../engines/riskEngine';
import { logAudit } from './auditLogs';

const router = Router();

export const inMemoryReports = new Map<string, any>();

// GET /api/reports/:caseId — retrieve latest report
router.get('/:caseId', async (req: Request, res: Response) => {
  try {
    const { caseId } = req.params;

    if (isDatabaseConnected()) {
      const dbReport = await Report.findOne({ caseId }).sort({ createdAt: -1 }).lean();
      if (dbReport) {
        return res.json({
          success: true,
          data: dbReport,
          demoMode: false,
          storage: 'mongodb',
        });
      }
    }

    const memReport = inMemoryReports.get(caseId);
    if (memReport) {
      return res.json({
        success: true,
        data: memReport,
        demoMode: true,
        storage: 'session_memory',
      });
    }

    res.status(404).json({ success: false, error: `No generated report found for case ${caseId}` });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST /api/reports/:caseId — generate report
router.post('/:caseId', async (req: Request, res: Response) => {
  try {
    const { caseId } = req.params;
    const { template, classification, includeGraph, includeEvidence, includeAttribution } = req.body || {};

    let targetCase: any = null;
    let attribution: any = null;
    let risk: any = null;

    if (isDatabaseConnected()) {
      targetCase = await Case.findOne({ caseId }).lean();
      attribution = await Attribution.findOne({ caseId }).lean();
      risk = await RiskAssessment.findOne({ caseId }).lean();
    }

    if (!targetCase) {
      targetCase = getCaseFromMemory(caseId) || DEMO_CASES.find((c) => c.caseId === caseId);
    }

    if (!targetCase) {
      return res.status(404).json({ success: false, error: `Case ${caseId} not found` });
    }

    if (!attribution) {
      attribution = targetCase.attribution || runAttributionEngine(caseId);
    }

    if (!risk) {
      risk = targetCase.risk || runRiskEngine(caseId);
    }

    const topCandidate = attribution.candidates?.[0] || {
      vaspName: targetCase.likelyVasp || 'Unknown VASP',
      confidence: targetCase.vaspConfidence || 90,
      hopDistance: 2,
      scoreBreakdown: { clusterMatch: 35, transactionProximity: 25, behaviourSimilarity: 15, depositPattern: 10, temporalMetadata: 5, total: 90 },
      methodology: 'Heuristic clustering and transaction graph traversal',
    };

    const wallets = targetCase.wallets || [];
    const transactions = targetCase.transactions || [];

    const reportData = {
      reportId: `RPT-${caseId}-${Date.now()}`,
      caseId,
      generatedAt: new Date().toISOString(),
      caseInformation: {
        caseId: targetCase.caseId,
        title: targetCase.title,
        type: targetCase.type,
        priority: targetCase.priority,
        status: targetCase.status,
        investigatorNotes: targetCase.investigatorNotes || '',
      },
      walletSummary: {
        suspectWallet: targetCase.suspectWallet,
        blockchain: targetCase.blockchain,
        totalWalletsInChain: wallets.length,
        wallets: wallets.map((w: any) => ({
          address: w.address,
          label: w.label,
          type: w.type,
          riskScore: w.riskScore,
        })),
      },
      transactionSummary: {
        totalTransactions: transactions.length,
        totalValueUsd: transactions.reduce((s: number, t: any) => s + (t.valueUsd || 0), 0),
        suspiciousTransactions: transactions.filter((t: any) => t.isSuspicious).length,
        blockchains: [...new Set(wallets.map((w: any) => w.blockchain))],
        transactions,
      },
      vaspAttribution: {
        topCandidate: {
          vaspName: topCandidate.vaspName,
          confidence: topCandidate.confidence,
          hopDistance: topCandidate.hopDistance || 2,
          scoreBreakdown: topCandidate.scoreBreakdown,
        },
        allCandidates: (attribution.candidates || []).map((c: any) => ({
          rank: c.rank,
          vaspName: c.vaspName,
          confidence: c.confidence,
          isSynthetic: c.isSynthetic,
        })),
        methodology: topCandidate.methodology || 'Heuristic clustering',
      },
      riskAssessment: {
        overallScore: risk.overallScore || targetCase.riskScore || 85,
        riskLevel: risk.riskLevel || 'HIGH',
        activeFactors: (risk.factors || [])
          .filter((f: any) => f.detected)
          .map((f: any) => ({
            name: f.name,
            score: f.score,
            description: f.description,
          })),
        typologies: (risk.typologies || []).map((t: any) => ({
          name: t.name,
          code: t.code,
          confidence: t.confidence,
          description: t.description,
        })),
      },
      timeline: transactions.map((tx: any) => ({
        timestamp: tx.timestamp,
        event: `Transfer: ${tx.value} ${tx.tokenSymbol || 'ETH'} from ...${(tx.from || '').slice(-8)} to ...${(tx.to || '').slice(-8)}`,
        hash: tx.hash,
        hopNumber: tx.hopNumber,
        isSuspicious: tx.isSuspicious,
      })),
      template: template || 'Standard Investigative Summary',
      classification: classification || 'LAW ENFORCEMENT SENSITIVE (LES)',
      options: {
        includeGraph: includeGraph ?? true,
        includeEvidence: includeEvidence ?? true,
        includeAttribution: includeAttribution ?? true,
      },
      disclaimer:
        'INTELLIGENCE LEAD — FOR INVESTIGATIVE USE ONLY. This report is generated by automated analysis and does NOT constitute legal evidence. VASP data is entirely synthetic for demonstration. All findings require human investigator verification. This tool is a decision-support system, not a legal instrument.',
      syntheticDataNotice:
        'All VASP names, wallet addresses, and attribution data in this report are ENTIRELY SYNTHETIC and generated for SIH 2026 demonstration purposes only.',
      isSynthetic: true,
    };

    // Save to in-memory store for fallback demo mode
    inMemoryReports.set(caseId, reportData);

    // Save report to MongoDB if connected
    if (isDatabaseConnected()) {
      try {
        await Report.create(reportData);
      } catch (dbErr: any) {
        console.error('⚠️ [Reports] Error persisting report to MongoDB:', dbErr.message);
      }
    }

    await logAudit({
      action: 'REPORT_GENERATED',
      caseId,
      userId: 'demo-investigator',
      userRole: 'investigator',
      details: `Investigation report generated for case ${caseId}: ${reportData.reportId}`,
      resourceType: 'Report',
      resourceId: reportData.reportId,
      severity: 'info',
    });

    res.json({
      success: true,
      data: reportData,
      demoMode: !isDatabaseConnected(),
      storage: isDatabaseConnected() ? 'mongodb' : 'fallback_memory',
    });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
