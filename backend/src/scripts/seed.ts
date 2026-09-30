import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase, isDatabaseConnected } from '../config/database';
import {
  Case,
  Wallet,
  Transaction,
  VASP,
  VASPCluster,
  Attribution,
  RiskAssessment,
  Evidence,
  AuditLog,
} from '../models';
import {
  DEMO_CASES,
  DEMO_VASPS,
  DEMO_VASP_CLUSTERS,
  getDemoWalletGraph,
  getDemoAttribution,
  getDemoRisk,
  getDemoEvidence,
} from '../data/demoData';

dotenv.config();

export const seedDatabase = async () => {
  console.log('🌱 ==========================================');
  console.log('🌱 Starting VASPTrace MongoDB Demo Seeder');
  console.log('🌱 ==========================================');

  const connected = await connectDatabase();

  if (!connected) {
    console.error('❌ Could not connect to MongoDB for seeding.');
    console.error('👉 Make sure MONGODB_URI is correctly configured in .env (e.g. mongodb://localhost:27017/vasptrace)');
    console.error('👉 If running in standalone Demo Mode, database seeding is optional as fallback data is always active.');
    process.exit(1);
  }

  try {
    console.log('🧹 Purging existing synthetic demo records...');
    await Promise.all([
      Case.deleteMany({ isSynthetic: true }),
      Wallet.deleteMany({ isSynthetic: true }),
      Transaction.deleteMany({ isSynthetic: true }),
      VASP.deleteMany({ isSynthetic: true }),
      VASPCluster.deleteMany({ isSynthetic: true }),
      Attribution.deleteMany({ isSynthetic: true }),
      RiskAssessment.deleteMany({ isSynthetic: true }),
      Evidence.deleteMany({ isSynthetic: true }),
      AuditLog.deleteMany({ isSynthetic: true }),
    ]);

    // 1. Seed VASPs
    console.log(`🏦 Seeding ${DEMO_VASPS.length} VASPs...`);
    const vasps = await VASP.insertMany(
      DEMO_VASPS.map((v) => ({
        ...v,
        isSynthetic: true,
      }))
    );

    // 2. Seed VASP Clusters
    console.log(`🔗 Seeding ${DEMO_VASP_CLUSTERS.length} VASP Clusters...`);
    const clusters = await VASPCluster.insertMany(
      DEMO_VASP_CLUSTERS.map((c) => ({
        ...c,
        isSynthetic: true,
      }))
    );

    // 3. Seed Cases, Wallets, Transactions, Graphs, Attributions, Risk, Evidence
    console.log(`📁 Seeding ${DEMO_CASES.length} Demo Cases with full graph topology & intelligence...`);

    let totalWallets = 0;
    let totalTxs = 0;
    let totalEvidence = 0;

    for (const c of DEMO_CASES) {
      const graph = getDemoWalletGraph(c.caseId);
      const attributionData = getDemoAttribution(c.caseId);
      const riskData = getDemoRisk(c.caseId);
      const evidenceData = getDemoEvidence(c.caseId);

      // Save Case document
      await Case.create({
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
        investigatorNotes: c.investigatorNotes,
        isDemoCase: true,
        isSynthetic: true,
        wallets: c.wallets,
        transactions: c.transactions,
        graph,
      });

      // Save individual Wallets
      for (const w of c.wallets) {
        await Wallet.create({
          address: w.address,
          blockchain: w.blockchain,
          label: w.label,
          type: w.type,
          riskScore: w.riskScore,
          totalReceived: w.totalReceived,
          totalSent: w.totalSent,
          transactionCount: w.transactionCount,
          tags: w.tags,
          isKnownVasp: w.isKnownVasp,
          isMixer: w.isMixer,
          isBridge: w.isBridge,
          vaspAssociation: w.vaspAssociation,
          caseId: c.caseId,
          firstSeen: c.transactions[0]?.timestamp,
          lastSeen: c.transactions[c.transactions.length - 1]?.timestamp,
          isSynthetic: true,
        });
        totalWallets++;
      }

      // Save individual Transactions
      for (const tx of c.transactions) {
        await Transaction.create({
          hash: tx.hash,
          blockchain: tx.blockchain,
          blockNumber: tx.blockNumber,
          timestamp: tx.timestamp,
          from: tx.from,
          to: tx.to,
          value: tx.value,
          valueUsd: tx.valueUsd,
          tokenSymbol: tx.tokenSymbol,
          hopNumber: tx.hopNumber,
          isSuspicious: tx.isSuspicious,
          flagReasons: tx.flagReasons,
          status: tx.status,
          caseId: c.caseId,
          isSynthetic: true,
        });
        totalTxs++;
      }

      // Save Attribution record
      await Attribution.create({
        caseId: c.caseId,
        suspectWallet: attributionData.suspectWallet,
        blockchain: attributionData.blockchain,
        candidates: attributionData.candidates,
        totalVaspsAnalyzed: attributionData.totalVaspsAnalyzed,
        analysisTimestamp: attributionData.analysisTimestamp,
        disclaimer: attributionData.disclaimer,
        isSynthetic: true,
      });

      // Save Risk Assessment record
      await RiskAssessment.create({
        caseId: c.caseId,
        suspectWallet: riskData.suspectWallet,
        overallScore: riskData.overallScore,
        riskLevel: riskData.riskLevel,
        methodology: riskData.methodology,
        disclaimer: riskData.disclaimer,
        factors: riskData.factors,
        typologies: riskData.typologies,
        walletPriority: riskData.walletPriority,
        isSynthetic: true,
      });

      // Save Evidence items
      for (const ev of evidenceData) {
        await Evidence.create({
          ...ev,
          isSynthetic: true,
        });
        totalEvidence++;
      }
    }

    // 4. Seed Audit Logs
    console.log('📜 Seeding initial audit logs...');
    const demoLogs = [
      { action: 'CASE_CREATED', caseId: 'CASE-001', userId: 'demo-investigator', userRole: 'investigator', details: 'Case CASE-001 created: Project Phantom', resourceType: 'Case', resourceId: 'CASE-001', severity: 'info' as const },
      { action: 'WALLET_ANALYZED', caseId: 'CASE-001', userId: 'demo-investigator', userRole: 'investigator', details: 'Wallet analysis initiated for 0x1234567890123456789012345678901234567890', resourceType: 'Wallet', severity: 'info' as const },
      { action: 'GRAPH_VIEWED', caseId: 'CASE-001', userId: 'demo-investigator', userRole: 'investigator', details: 'Fund flow graph rendered for CASE-001', resourceType: 'FundFlowGraph', severity: 'info' as const },
      { action: 'ATTRIBUTION_REVIEWED', caseId: 'CASE-001', userId: 'demo-investigator', userRole: 'investigator', details: 'VASP attribution reviewed: Garantex, 92% confidence', resourceType: 'Attribution', severity: 'warning' as const },
      { action: 'EVIDENCE_VIEWED', caseId: 'CASE-001', userId: 'demo-investigator', userRole: 'investigator', details: 'Evidence chain reviewed (5 items)', resourceType: 'Evidence', severity: 'info' as const },
      { action: 'REPORT_GENERATED', caseId: 'CASE-001', userId: 'demo-investigator', userRole: 'investigator', details: 'Investigation report generated: RPT-CASE-001-demo', resourceType: 'Report', severity: 'info' as const },
      { action: 'CASE_CREATED', caseId: 'CASE-002', userId: 'demo-investigator', userRole: 'investigator', details: 'Case CASE-002 created: Operation Harvest', resourceType: 'Case', resourceId: 'CASE-002', severity: 'info' as const },
      { action: 'CASE_CREATED', caseId: 'CASE-003', userId: 'demo-investigator', userRole: 'investigator', details: 'Case CASE-003 created: Operation Hydra', resourceType: 'Case', resourceId: 'CASE-003', severity: 'critical' as const },
      { action: 'USER_LOGIN', userId: 'demo-investigator', userRole: 'investigator', details: 'Investigator authenticated successfully', resourceType: 'Auth', severity: 'info' as const },
      { action: 'REPORT_GENERATED', caseId: 'CASE-003', userId: 'demo-investigator', userRole: 'investigator', details: 'High-priority report generated for cross-chain laundering case', resourceType: 'Report', severity: 'warning' as const },
    ];

    const now = Date.now();
    for (let i = 0; i < demoLogs.length; i++) {
      const log = demoLogs[i];
      await AuditLog.create({
        id: `LOG-DEMO-00${i + 1}`,
        ...log,
        timestamp: new Date(now - (demoLogs.length - i) * 3600000),
        isSynthetic: true,
      });
    }

    console.log('✅ ==========================================');
    console.log('✅ MongoDB Seed Completed Successfully!');
    console.log(`✅ Cases: ${DEMO_CASES.length}`);
    console.log(`✅ Wallets: ${totalWallets}`);
    console.log(`✅ Transactions: ${totalTxs}`);
    console.log(`✅ VASPs: ${vasps.length}`);
    console.log(`✅ VASP Clusters: ${clusters.length}`);
    console.log(`✅ Evidence Records: ${totalEvidence}`);
    console.log(`✅ Audit Logs: ${demoLogs.length}`);
    console.log('✅ ==========================================');
  } catch (err: any) {
    console.error('❌ Error during database seeding:', err.message || err);
  } finally {
    await disconnectDatabase();
    process.exit(0);
  }
};

// Run if called directly
if (require.main === module) {
  seedDatabase();
}
