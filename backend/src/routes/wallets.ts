import { Router, Request, Response } from 'express';
import { isDatabaseConnected } from '../config/database';
import { Wallet, Transaction, Case } from '../models';
import { DEMO_CASES } from '../data/demoData';
import { logAudit } from './auditLogs';

const router = Router();

// GET /api/wallet/:address
router.get('/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const lowerAddress = address.toLowerCase();

    // Check MongoDB first if connected
    if (isDatabaseConnected()) {
      const dbWallet: any = await Wallet.findOne({ address: lowerAddress }).lean();
      if (dbWallet) {
        return res.json({
          success: true,
          data: {
            address: dbWallet.address,
            blockchain: dbWallet.blockchain,
            label: dbWallet.label,
            type: dbWallet.type,
            riskScore: dbWallet.riskScore,
            totalReceived: dbWallet.totalReceived,
            totalSent: dbWallet.totalSent,
            transactionCount: dbWallet.transactionCount,
            tags: dbWallet.tags,
            isKnownVasp: dbWallet.isKnownVasp,
            isMixer: dbWallet.isMixer,
            isBridge: dbWallet.isBridge,
            vaspAssociation: dbWallet.vaspAssociation,
            caseId: dbWallet.caseId,
            firstSeen: dbWallet.firstSeen,
            lastSeen: dbWallet.lastSeen,
          },
          demoMode: false,
          storage: 'mongodb',
        });
      }
    }

    // Find in demo cases fallback
    for (const demoCase of DEMO_CASES) {
      const wallet = demoCase.wallets.find((w) => w.address.toLowerCase() === lowerAddress);
      if (wallet) {
        return res.json({
          success: true,
          data: {
            ...wallet,
            caseId: demoCase.caseId,
            firstSeen: demoCase.transactions[0]?.timestamp,
            lastSeen: demoCase.transactions[demoCase.transactions.length - 1]?.timestamp,
          },
          demoMode: true,
          storage: 'fallback_demo',
        });
      }
    }

    // Validate address format
    const isEthAddress = /^0x[a-fA-F0-9]{40,}$/.test(address);
    const isTronAddress = /^T[a-zA-Z0-9]{33}$/.test(address);

    if (!isEthAddress && !isTronAddress) {
      return res.status(400).json({ success: false, error: 'Invalid wallet address format' });
    }

    // Return unknown wallet
    res.json({
      success: true,
      data: {
        address,
        blockchain: isEthAddress ? 'Ethereum' : 'Tron',
        label: 'Unknown Wallet',
        type: 'unknown',
        riskScore: 0,
        totalReceived: 0,
        totalSent: 0,
        transactionCount: 0,
        tags: [],
        isKnownVasp: false,
        isMixer: false,
        isBridge: false,
      },
      demoMode: true,
      note: 'This wallet is not yet registered in intelligence records. Initiate an analysis to index it.',
    });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// GET /api/wallet/:address/transactions
router.get('/:address/transactions', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const lowerAddress = address.toLowerCase();

    if (isDatabaseConnected()) {
      const dbTxs = await Transaction.find({
        $or: [{ from: lowerAddress }, { to: lowerAddress }],
      })
        .sort({ timestamp: -1 })
        .lean();

      if (dbTxs.length > 0) {
        return res.json({
          success: true,
          data: dbTxs,
          total: dbTxs.length,
          demoMode: false,
          storage: 'mongodb',
        });
      }
    }

    const transactions: any[] = [];
    for (const demoCase of DEMO_CASES) {
      const txs = demoCase.transactions.filter(
        (t) => t.from.toLowerCase() === lowerAddress || t.to.toLowerCase() === lowerAddress
      );
      transactions.push(...txs);
    }

    res.json({
      success: true,
      data: transactions,
      total: transactions.length,
      demoMode: true,
      storage: 'fallback_demo',
    });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST /api/wallet/analyze
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { address, blockchain } = req.body;

    if (!address || !blockchain) {
      return res.status(400).json({ success: false, error: 'address and blockchain are required' });
    }

    const lowerAddress = address.toLowerCase();

    // Check if an existing case exists in MongoDB
    if (isDatabaseConnected()) {
      const existingCase: any = await Case.findOne({ suspectWallet: lowerAddress }).lean();
      if (existingCase) {
        await logAudit({
          action: 'WALLET_ANALYZED',
          caseId: existingCase.caseId,
          userId: 'demo-investigator',
          userRole: 'investigator',
          details: `Wallet analysis matched existing case ${existingCase.caseId} from MongoDB`,
          resourceType: 'Wallet',
          severity: 'info',
        });

        return res.json({
          success: true,
          data: {
            address,
            blockchain,
            analysisType: 'persistent',
            caseId: existingCase.caseId,
            walletCount: existingCase.wallets ? existingCase.wallets.length : 1,
            transactionCount: existingCase.transactions ? existingCase.transactions.length : 0,
            riskScore: existingCase.riskScore,
            vaspConfidence: existingCase.vaspConfidence,
            likelyVasp: existingCase.likelyVasp,
            isDemoCase: existingCase.isDemoCase,
          },
          demoMode: false,
          message: `Indexed case ${existingCase.caseId} loaded for wallet analysis.`,
        });
      }
    }

    // Fallback: check demo cases
    const demoCase = DEMO_CASES.find((c) => c.suspectWallet.toLowerCase() === lowerAddress);

    if (demoCase) {
      await logAudit({
        action: 'WALLET_ANALYZED',
        caseId: demoCase.caseId,
        userId: 'demo-investigator',
        userRole: 'investigator',
        details: `Wallet analysis loaded demo case ${demoCase.caseId}`,
        resourceType: 'Wallet',
        severity: 'info',
      });

      return res.json({
        success: true,
        data: {
          address,
          blockchain,
          analysisType: 'demo',
          caseId: demoCase.caseId,
          walletCount: demoCase.wallets.length,
          transactionCount: demoCase.transactions.length,
          riskScore: demoCase.riskScore,
          vaspConfidence: demoCase.vaspConfidence,
          likelyVasp: demoCase.likelyVasp,
          isDemoCase: true,
        },
        demoMode: true,
        message: `Demo case ${demoCase.caseId} loaded for wallet analysis.`,
      });
    }

    res.json({
      success: true,
      data: {
        address,
        blockchain,
        analysisType: 'live',
        walletCount: 0,
        transactionCount: 0,
        note: 'Live blockchain analysis requires on-chain provider credentials.',
      },
      demoMode: true,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
