import { Router, Request, Response } from 'express';
import { isDatabaseConnected } from '../config/database';
import {
  Case,
  Wallet,
  Transaction,
  Attribution,
  RiskAssessment,
  Evidence,
} from '../models';
import {
  DEMO_CASES,
  getDemoWalletGraph,
  getDemoEvidence,
  getCaseFromMemory,
  saveCaseToMemory,
  getAllSessionCases,
  generateSyntheticCaseData,
  inMemoryCases,
  sanitizeAttributionScores,
} from '../data/demoData';
import { runAttributionEngine } from '../engines/attributionEngine';
import { runRiskEngine } from '../engines/riskEngine';
import { logAudit } from './auditLogs';

const router = Router();

/** Helper: look up a case from all available stores */
const findCase = async (id: string): Promise<any | null> => {
  // 1. MongoDB (if connected)
  if (isDatabaseConnected()) {
    const dbCase = await Case.findOne({ caseId: id }).lean();
    if (dbCase) return dbCase;
  }
  // 2. In-memory store (new cases created this session)
  const mem = getCaseFromMemory(id);
  if (mem) return mem;
  // 3. Static demo dataset
  const demo = DEMO_CASES.find((c) => c.caseId === id);
  if (demo) return demo;
  return null;
};

// GET /api/cases — list all cases
router.get('/', async (_req: Request, res: Response) => {
  try {
    if (isDatabaseConnected()) {
      const dbCases = await Case.find().sort({ createdAt: -1 }).lean();
      if (dbCases.length > 0) {
        const mapped = dbCases.map((c: any) => ({
          caseId: c.caseId,
          title: c.title,
          type: c.type,
          priority: c.priority,
          status: c.status,
          suspectWallet: c.suspectWallet,
          blockchain: c.blockchain,
          riskScore: c.riskScore,
          vaspConfidence: c.vaspConfidence,
          likelyVasp: c.likelyVasp,
          analysisProgress: c.analysisProgress,
          createdAt: c.createdAt || new Date(),
          updatedAt: c.updatedAt || new Date(),
        }));

        return res.json({
          success: true,
          data: mapped,
          total: mapped.length,
          demoMode: false,
          storage: 'mongodb',
        });
      }
    }

    // Fallback demo mode — combine static demo cases + in-memory new cases
    const demoCases = DEMO_CASES.map((c) => ({
      caseId: c.caseId,
      title: c.title,
      type: c.type,
      priority: c.priority,
      status: c.status,
      suspectWallet: c.suspectWallet,
      blockchain: c.blockchain,
      riskScore: c.riskScore,
      vaspConfidence: c.vaspConfidence,
      likelyVasp: c.likelyVasp,
      analysisProgress: c.analysisProgress,
      createdAt: new Date('2026-09-15T10:00:00Z'),
      updatedAt: new Date(),
    }));

    // Include any cases created this session
    const sessionCases = getAllSessionCases().map((c) => ({
      caseId: c.caseId,
      title: c.title,
      type: c.type,
      priority: c.priority,
      status: c.status,
      suspectWallet: c.suspectWallet,
      blockchain: c.blockchain,
      riskScore: c.riskScore,
      vaspConfidence: c.vaspConfidence,
      likelyVasp: c.likelyVasp,
      analysisProgress: c.analysisProgress,
      createdAt: c.createdAt || new Date(),
      updatedAt: c.updatedAt || new Date(),
    }));

    const cases = [...demoCases, ...sessionCases];

    res.json({
      success: true,
      data: cases,
      total: cases.length,
      demoMode: true,
      storage: 'fallback_demo',
    });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST /api/cases — create new case
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, type, priority, suspectWallet, blockchain, investigatorNotes } = req.body;

    if (!title || !type || !suspectWallet || !blockchain) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, type, suspectWallet, blockchain',
      });
    }

    // Check if it's a known demo case wallet
    const demoCase = DEMO_CASES.find(
      (c) => c.suspectWallet.toLowerCase() === suspectWallet.toLowerCase()
    );

    const newCaseId = demoCase?.caseId || `CASE-${Date.now()}`;

    let caseDataToSave: any;
    let graphData: any;
    let attributionData: any;
    let riskData: any;
    let evidenceData: any;

    if (demoCase) {
      attributionData = runAttributionEngine(newCaseId);
      riskData = runRiskEngine(newCaseId);
      graphData = getDemoWalletGraph(newCaseId);
      evidenceData = getDemoEvidence(newCaseId);
      caseDataToSave = {
        ...demoCase,
        title,
        priority: priority || demoCase.priority,
        investigatorNotes: investigatorNotes || demoCase.investigatorNotes,
        graph: graphData,
        attribution: attributionData,
        risk: riskData,
        evidence: evidenceData,
      };
    } else {
      const synthetic = generateSyntheticCaseData({
        caseId: newCaseId,
        title,
        type,
        priority,
        suspectWallet,
        blockchain,
        investigatorNotes,
      });
      caseDataToSave = synthetic.caseData;
      graphData = synthetic.graph;
      attributionData = synthetic.attribution;
      riskData = synthetic.risk;
      evidenceData = synthetic.evidence;
    }

    const likelyVasp = caseDataToSave.likelyVasp;
    const vaspConfidence = caseDataToSave.vaspConfidence;
    const riskScore = caseDataToSave.riskScore;

    let savedCase: any = null;

    if (isDatabaseConnected()) {
      try {
        // Persist to MongoDB
        savedCase = await Case.findOneAndUpdate(
          { caseId: newCaseId },
          {
            ...caseDataToSave,
            isDemoCase: !!demoCase,
            isSynthetic: true,
          },
          { upsert: true, new: true }
        );

        // Store Attribution in MongoDB
        await Attribution.findOneAndUpdate(
          { caseId: newCaseId },
          {
            ...attributionData,
            caseId: newCaseId,
            isSynthetic: true,
          },
          { upsert: true }
        );

        // Store Risk Assessment in MongoDB
        await RiskAssessment.findOneAndUpdate(
          { caseId: newCaseId },
          {
            ...riskData,
            caseId: newCaseId,
            isSynthetic: true,
          },
          { upsert: true }
        );

        // Store Evidence items
        for (const ev of evidenceData) {
          await Evidence.findOneAndUpdate(
            { evidenceId: ev.evidenceId },
            { ...ev, caseId: newCaseId, isSynthetic: true },
            { upsert: true }
          );
        }
      } catch (dbErr: any) {
        console.error('⚠️ [Cases] Error persisting case to MongoDB:', dbErr.message);
      }
    }

    // Always store in centralized in-memory store so it survives across routes
    saveCaseToMemory(caseDataToSave);

    await logAudit({
      action: 'CASE_CREATED',
      caseId: newCaseId,
      userId: 'demo-investigator',
      userRole: 'investigator',
      details: `Investigation case created: ${title} for wallet ${suspectWallet} on ${blockchain}`,
      resourceType: 'Case',
      resourceId: newCaseId,
      severity: 'info',
    });

    res.status(201).json({
      success: true,
      data: caseDataToSave,
      demoMode: !isDatabaseConnected(),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// GET /api/cases/:id — get case details
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Use findCase helper (MongoDB → DEMO_CASES → inMemoryCases)
    const caseData = await findCase(id);

    if (!caseData) {
      return res.status(404).json({ success: false, error: `Case ${id} not found` });
    }

    const isFromMongo = isDatabaseConnected() && !!(caseData as any)._id;
    const isFromMemory = inMemoryCases.has(id);

    await logAudit({
      action: 'CASE_VIEWED',
      caseId: id,
      userId: 'demo-investigator',
      userRole: 'investigator',
      details: `Case ${id} details viewed`,
      resourceType: 'Case',
      resourceId: id,
      severity: 'info',
    });

    res.json({
      success: true,
      data: caseData,
      demoMode: !isFromMongo,
      storage: isFromMongo ? 'mongodb' : isFromMemory ? 'session_memory' : 'fallback_demo',
    });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST /api/cases/:id/analyze — trigger analysis
router.post('/:id/analyze', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Use helper that checks MongoDB → DEMO_CASES → inMemoryCases
    const caseData = await findCase(id);

    if (!caseData) {
      console.error(`[Analyze] Case not found: ${id}.`);
      return res.status(404).json({ success: false, error: `Case ${id} not found. Ensure the case was created before calling analyze.` });
    }

    const attribution = runAttributionEngine(id);
    const risk = runRiskEngine(id);

    const topCandidate = attribution.candidates?.[0];
    const resolvedConfidence =
      topCandidate?.confidence ??
      (caseData.vaspConfidence !== undefined ? caseData.vaspConfidence : 0);
    const resolvedLikelyVasp =
      topCandidate?.vaspName ??
      (caseData.likelyVasp || (attribution.candidates?.length === 0 ? 'None Identified' : 'Unknown'));

    // Update the in-memory case to 'completed' so subsequent GET /:id returns updated status
    const memCase = getCaseFromMemory(id) || DEMO_CASES.find((c) => c.caseId === id);
    if (memCase) {
      memCase.status = 'completed';
      memCase.analysisProgress = 100;
      memCase.riskScore = risk.overallScore ?? memCase.riskScore ?? 0;
      memCase.vaspConfidence = resolvedConfidence;
      memCase.likelyVasp = resolvedLikelyVasp;
      memCase.updatedAt = new Date();
      saveCaseToMemory(memCase);
    }

    // Update case status if in MongoDB
    if (isDatabaseConnected() && (caseData as any)._id) {
      // findCase returns a .lean() plain object — use findOneAndUpdate instead of .save()
      await Case.findOneAndUpdate(
        { caseId: id },
        {
          status: 'completed',
          analysisProgress: 100,
          riskScore: risk.overallScore ?? caseData.riskScore ?? 0,
          vaspConfidence: resolvedConfidence,
          likelyVasp: resolvedLikelyVasp,
          updatedAt: new Date(),
        }
      );

      // Persist Attribution & Risk
      await Attribution.findOneAndUpdate(
        { caseId: id },
        {
          caseId: id,
          suspectWallet: caseData.suspectWallet,
          blockchain: caseData.blockchain,
          candidates: attribution.candidates,
          totalVaspsAnalyzed: attribution.totalVaspsAnalyzed,
          analysisTimestamp: attribution.analysisTimestamp,
          disclaimer: attribution.disclaimer,
          isSynthetic: true,
        },
        { upsert: true }
      );

      await RiskAssessment.findOneAndUpdate(
        { caseId: id },
        {
          caseId: id,
          suspectWallet: caseData.suspectWallet,
          overallScore: risk.overallScore,
          riskLevel: risk.riskLevel,
          methodology: risk.methodology,
          disclaimer: risk.disclaimer,
          factors: risk.factors,
          typologies: risk.typologies,
          walletPriority: risk.walletPriority,
          isSynthetic: true,
        },
        { upsert: true }
      );
    }

    // Log analysis audit
    await logAudit({
      action: 'WALLET_ANALYZED',
      caseId: id,
      userId: 'demo-investigator',
      userRole: 'investigator',
      details: `Full multi-hop analysis triggered and computed for case ${id}`,
      resourceType: 'Case',
      resourceId: id,
      severity: 'info',
    });

    const steps = [
      { step: 1, name: 'Wallet Validation', status: 'complete', progress: 10 },
      { step: 2, name: 'Transaction Retrieval', status: 'complete', progress: 20 },
      { step: 3, name: 'Data Normalization', status: 'complete', progress: 30 },
      { step: 4, name: 'Graph Construction', status: 'complete', progress: 45 },
      { step: 5, name: 'Multi-hop Analysis', status: 'complete', progress: 60 },
      { step: 6, name: 'VASP Cluster Analysis', status: 'complete', progress: 70 },
      { step: 7, name: 'Typology Detection', status: 'complete', progress: 80 },
      { step: 8, name: 'Risk Calculation', status: 'complete', progress: 88 },
      { step: 9, name: 'VASP Ranking', status: 'complete', progress: 95 },
      { step: 10, name: 'Evidence Generation', status: 'complete', progress: 100 },
    ];

    res.json({
      success: true,
      data: {
        caseId: id,
        status: 'completed',
        analysisProgress: 100,
        steps,
        riskScore: risk.overallScore ?? caseData.riskScore ?? 0,
        vaspConfidence: resolvedConfidence,
        likelyVasp: resolvedLikelyVasp,
      },
      demoMode: !isDatabaseConnected(),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// GET /api/cases/:id/attribution
router.get('/:id/attribution', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (isDatabaseConnected()) {
      const dbAttribution = await Attribution.findOne({ caseId: id }).lean();
      if (dbAttribution) {
        await logAudit({
          action: 'ATTRIBUTION_VIEWED',
          caseId: id,
          userId: 'demo-investigator',
          userRole: 'investigator',
          details: `VASP attribution results viewed from MongoDB for case ${id}`,
          resourceType: 'Attribution',
          resourceId: id,
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

    // Check in-memory store
    const memCase = getCaseFromMemory(id);
    if (memCase?.attribution) {
      return res.json({ success: true, data: sanitizeAttributionScores(memCase.attribution), demoMode: true, storage: 'session_memory' });
    }

    // Independent business logic engine calculation
    const result = sanitizeAttributionScores(runAttributionEngine(id));

    // Save to DB if connected
    if (isDatabaseConnected()) {
      await Attribution.findOneAndUpdate(
        { caseId: id },
        { ...result, isSynthetic: true },
        { upsert: true }
      ).catch(() => {});
    }

    await logAudit({
      action: 'ATTRIBUTION_VIEWED',
      caseId: id,
      userId: 'demo-investigator',
      userRole: 'investigator',
      details: `VASP attribution results reviewed for case ${id}`,
      resourceType: 'Attribution',
      resourceId: id,
      severity: 'info',
    });

    res.json({ success: true, data: result, demoMode: true });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// GET /api/cases/:id/risk
router.get('/:id/risk', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (isDatabaseConnected()) {
      const dbRisk = await RiskAssessment.findOne({ caseId: id }).lean();
      if (dbRisk) {
        return res.json({
          success: true,
          data: dbRisk,
          demoMode: false,
          storage: 'mongodb',
        });
      }
    }

    // Check in-memory store
    const memCase = getCaseFromMemory(id);
    if (memCase?.risk) {
      return res.json({ success: true, data: memCase.risk, demoMode: true, storage: 'session_memory' });
    }

    const result = runRiskEngine(id);

    if (isDatabaseConnected()) {
      await RiskAssessment.findOneAndUpdate(
        { caseId: id },
        { ...result, isSynthetic: true },
        { upsert: true }
      ).catch(() => {});
    }

    res.json({ success: true, data: result, demoMode: true });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// GET /api/cases/:id/evidence
router.get('/:id/evidence', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (isDatabaseConnected()) {
      const dbEvidence = await Evidence.find({ caseId: id }).lean();
      if (dbEvidence.length > 0) {
        await logAudit({
          action: 'EVIDENCE_VIEWED',
          caseId: id,
          userId: 'demo-investigator',
          userRole: 'investigator',
          details: `Evidence chain reviewed from MongoDB for case ${id} (${dbEvidence.length} items)`,
          resourceType: 'Evidence',
          resourceId: id,
          severity: 'info',
        });

        return res.json({
          success: true,
          data: dbEvidence,
          total: dbEvidence.length,
          demoMode: false,
          storage: 'mongodb',
        });
      }
    }

    // Check in-memory store
    const memCase = getCaseFromMemory(id);
    if (memCase?.evidence) {
      return res.json({
        success: true,
        data: memCase.evidence,
        total: memCase.evidence.length,
        demoMode: true,
        storage: 'session_memory',
      });
    }

    // Fallback evidence from demo engine
    const evidence = getDemoEvidence(id);

    await logAudit({
      action: 'EVIDENCE_VIEWED',
      caseId: id,
      userId: 'demo-investigator',
      userRole: 'investigator',
      details: `Evidence chain reviewed for case ${id} (${evidence.length} items)`,
      resourceType: 'Evidence',
      resourceId: id,
      severity: 'info',
    });

    res.json({
      success: true,
      data: evidence,
      total: evidence.length,
      demoMode: true,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// GET /api/cases/:id/graph
router.get('/:id/graph', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (isDatabaseConnected()) {
      const dbCase = await Case.findOne({ caseId: id }).select('graph').lean();
      if (dbCase && (dbCase as any).graph?.nodes?.length > 0) {
        await logAudit({
          action: 'GRAPH_VIEWED',
          caseId: id,
          userId: 'demo-investigator',
          userRole: 'investigator',
          details: `Fund flow graph viewed from MongoDB for case ${id}`,
          resourceType: 'FundFlowGraph',
          resourceId: id,
          severity: 'info',
        });

        return res.json({
          success: true,
          data: (dbCase as any).graph,
          demoMode: false,
          storage: 'mongodb',
        });
      }
    }

    // Check in-memory store
    const memCase = getCaseFromMemory(id);
    if (memCase?.graph) {
      return res.json({
        success: true,
        data: memCase.graph,
        demoMode: true,
        storage: 'session_memory',
      });
    }

    const graph = getDemoWalletGraph(id);

    await logAudit({
      action: 'GRAPH_VIEWED',
      caseId: id,
      userId: 'demo-investigator',
      userRole: 'investigator',
      details: `Fund flow graph viewed for case ${id}`,
      resourceType: 'FundFlowGraph',
      resourceId: id,
      severity: 'info',
    });

    res.json({ success: true, data: graph, demoMode: true });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// GET /api/cases/dashboard/stats
router.get('/dashboard/stats', async (_req: Request, res: Response) => {
  try {
    if (isDatabaseConnected()) {
      const cases = await Case.find().lean();
      if (cases.length > 0) {
        const stats = {
          activeInvestigations: cases.filter(
            (c: any) => c.status === 'analyzing' || c.status === 'review'
          ).length,
          totalCases: cases.length,
          highRiskWallets: cases.reduce(
            (sum: number, c: any) =>
              sum + (c.wallets ? c.wallets.filter((w: any) => w.riskScore >= 61).length : 0),
            0
          ),
          vaspMatches: cases.filter((c: any) => (c.vaspConfidence || 0) >= 70).length,
          pendingReviews: cases.filter((c: any) => c.status === 'review').length,
          completedCases: cases.filter((c: any) => c.status === 'completed').length,
          criticalCases: cases.filter((c: any) => (c.riskScore || 0) >= 81).length,
          avgRiskScore: Math.round(
            cases.reduce((s: number, c: any) => s + (c.riskScore || 0), 0) / cases.length
          ),
          avgVaspConfidence: Math.round(
            cases.reduce((s: number, c: any) => s + (c.vaspConfidence || 0), 0) / cases.length
          ),
        };

        return res.json({
          success: true,
          data: stats,
          demoMode: false,
          storage: 'mongodb',
        });
      }
    }

    // Fallback stats
    const stats = {
      activeInvestigations: DEMO_CASES.filter(
        (c) => c.status === 'analyzing' || c.status === 'review'
      ).length,
      totalCases: DEMO_CASES.length,
      highRiskWallets: DEMO_CASES.reduce(
        (sum, c) => sum + c.wallets.filter((w) => w.riskScore >= 61).length,
        0
      ),
      vaspMatches: DEMO_CASES.filter((c) => c.vaspConfidence >= 70).length,
      pendingReviews: DEMO_CASES.filter((c) => c.status === 'review').length,
      completedCases: DEMO_CASES.filter((c) => c.status === 'completed').length,
      criticalCases: DEMO_CASES.filter((c) => c.riskScore >= 81).length,
      avgRiskScore: Math.round(
        DEMO_CASES.reduce((s, c) => s + c.riskScore, 0) / DEMO_CASES.length
      ),
      avgVaspConfidence: Math.round(
        DEMO_CASES.reduce((s, c) => s + c.vaspConfidence, 0) / DEMO_CASES.length
      ),
    };

    res.json({ success: true, data: stats, demoMode: true });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
