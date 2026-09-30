import { jsPDF } from 'jspdf';

export interface GeneratePdfOptions {
  template?: string;
  classification?: string;
  includeGraph?: boolean;
  includeEvidence?: boolean;
  includeAttribution?: boolean;
}

export function generateReportPdf(report: any, options: GeneratePdfOptions = {}): jsPDF {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const classification = options.classification || report.classification || 'LAW ENFORCEMENT SENSITIVE (LES)';
  const template = options.template || report.template || 'Standard Investigative Summary';
  const includeGraph = options.includeGraph ?? report.options?.includeGraph ?? true;
  const includeEvidence = options.includeEvidence ?? report.options?.includeEvidence ?? true;
  const includeAttribution = options.includeAttribution ?? report.options?.includeAttribution ?? true;

  const caseInfo = report.caseInformation || {};
  const walletSummary = report.walletSummary || {};
  const txSummary = report.transactionSummary || {};
  const vaspAttr = report.vaspAttribution || {};
  const topCandidate = vaspAttr.topCandidate || {};
  const riskAssess = report.riskAssessment || {};

  const checkPage = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 20) {
      doc.addPage();
      y = margin + 12;
      drawRunningHeaderFooter();
    }
  };

  const drawRunningHeaderFooter = () => {
    // Top banner
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(margin, 8, contentWidth, 7, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(239, 68, 68); // red-500
    doc.text(classification, margin + 3, 13);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('PROTOTYPE MOCK — SYNTHETIC DATA ONLY', pageWidth - margin - 3, 13, { align: 'right' });

    // Bottom footer line
    const pageCount = (doc as any).internal.getNumberOfPages();
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('VASPTrace™ Blockchain Intelligence Platform • SIH 2026', margin, pageHeight - 8);
    doc.text(`Page ${pageCount}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  };

  // First page banner
  drawRunningHeaderFooter();
  y = 22;

  // Title section
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('VASPTrace™ Intelligence Report', margin, y);
  y += 6;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Template: ${template}  |  Generated: ${new Date(report.generatedAt || Date.now()).toUTCString()}`, margin, y);
  y += 8;

  // Prototype Disclaimer Notice Box
  doc.setFillColor(254, 242, 242); // red-50
  doc.setDrawColor(252, 165, 165); // red-300
  doc.rect(margin, y, contentWidth, 12, 'FD');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(185, 28, 28); // red-700
  doc.text('PROTOTYPE MOCK NOTICE & INTELLIGENCE DISCLAIMER', margin + 3, y + 4.5);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'This report contains synthetic simulated telemetry generated for SIH 2026. For decision-support only; not a legal affidavit.',
    margin + 3,
    y + 8.5
  );
  y += 16;

  // Case Summary Box
  checkPage(40);
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.rect(margin, y, contentWidth, 34, 'FD');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('CASE IDENTIFICATION & TARGET INTELLIGENCE', margin + 3, y + 6);
  doc.setLineWidth(0.2);
  doc.line(margin + 3, y + 8, margin + contentWidth - 3, y + 8);

  doc.setFontSize(8.5);
  const leftColX = margin + 3;
  const midColX = margin + 70;
  const rightColX = margin + 130;

  // Row 1
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('Case ID:', leftColX, y + 14);
  doc.setTextColor(15, 23, 42);
  doc.text(String(caseInfo.caseId || report.caseId || 'N/A'), leftColX + 22, y + 14);

  doc.setTextColor(100, 116, 139);
  doc.text('Status:', midColX, y + 14);
  doc.setTextColor(15, 23, 42);
  doc.text(String(caseInfo.status || 'Active').toUpperCase(), midColX + 16, y + 14);

  doc.setTextColor(100, 116, 139);
  doc.text('Priority:', rightColX, y + 14);
  doc.setTextColor(15, 23, 42);
  doc.text(String(caseInfo.priority || 'High').toUpperCase(), rightColX + 16, y + 14);

  // Row 2
  doc.setTextColor(100, 116, 139);
  doc.text('Case Title:', leftColX, y + 20);
  doc.setTextColor(15, 23, 42);
  const titleText = doc.splitTextToSize(String(caseInfo.title || 'Untitled Case'), 140);
  doc.text(titleText, leftColX + 22, y + 20);

  // Row 3
  doc.setTextColor(100, 116, 139);
  doc.text('Blockchain:', leftColX, y + 26);
  doc.setTextColor(15, 23, 42);
  doc.text(String(walletSummary.blockchain || 'N/A'), leftColX + 22, y + 26);

  doc.setTextColor(100, 116, 139);
  doc.text('Suspect Wallet:', midColX, y + 26);
  doc.setFont('courier', 'bold');
  doc.setTextColor(30, 58, 138); // blue-900
  const walletStr = String(walletSummary.suspectWallet || 'N/A');
  doc.text(walletStr.length > 28 ? `${walletStr.slice(0, 16)}...${walletStr.slice(-10)}` : walletStr, midColX + 25, y + 26);
  doc.setFont('helvetica', 'normal');

  y += 38;

  // 3 Key KPI Metric Blocks
  checkPage(24);
  const boxWidth = (contentWidth - 6) / 3;

  // KPI 1: Risk
  const riskScore = riskAssess.overallScore ?? 85;
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(254, 202, 202);
  doc.rect(margin, y, boxWidth, 18, 'FD');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(153, 27, 27);
  doc.text('RISK SCORE', margin + 3, y + 5);
  doc.setFontSize(13);
  doc.text(`${riskScore}/100 [${riskAssess.riskLevel || 'HIGH'}]`, margin + 3, y + 13);

  // KPI 2: Primary VASP
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(191, 219, 254);
  doc.rect(margin + boxWidth + 3, y, boxWidth, 18, 'FD');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 64, 175);
  doc.text('PRIMARY VASP ATTRIBUTION', margin + boxWidth + 6, y + 5);
  doc.setFontSize(13);
  doc.text(String(topCandidate.vaspName || 'Unknown VASP'), margin + boxWidth + 6, y + 13);

  // KPI 3: Confidence
  const confScore = topCandidate.confidence ?? 92;
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.rect(margin + (boxWidth + 3) * 2, y, boxWidth, 18, 'FD');
  doc.setFontSize(7.5);
  doc.setTextColor(22, 101, 52);
  doc.text('CONFIDENCE SCORE', margin + (boxWidth + 3) * 2 + 3, y + 5);
  doc.setFontSize(13);
  doc.text(`${confScore}% Confidence`, margin + (boxWidth + 3) * 2 + 3, y + 13);

  y += 24;

  // Investigator Notes / Summary
  checkPage(24);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('INVESTIGATION SUMMARY & NOTES', margin, y);
  y += 4;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  const notes = caseInfo.investigatorNotes || 'Standard preliminary multi-hop blockchain tracing initialized.';
  const wrappedNotes = doc.splitTextToSize(notes, contentWidth);
  doc.text(wrappedNotes, margin, y);
  y += wrappedNotes.length * 4.5 + 5;

  // Section: VASP Attribution Analysis
  checkPage(35);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('1. VASP ATTRIBUTION & CLUSTERING INTELLIGENCE', margin, y);
  y += 4;
  doc.setLineWidth(0.2);
  doc.line(margin, y, margin + contentWidth, y);
  y += 5;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Primary Destination: ${topCandidate.vaspName || 'Garantex'} (${topCandidate.confidence || 92}% Confidence)`, margin, y);
  doc.text(`Methodology: ${topCandidate.methodology || 'Heuristic clustering and transaction graph traversal'}`, margin, y + 4.5);
  doc.text(`Hop Distance: ${topCandidate.hopDistance || 2} hops from origin suspect wallet`, margin, y + 9);
  y += 14;

  if (includeAttribution && topCandidate.scoreBreakdown) {
    checkPage(30);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Attribution Scoring Vector Breakdown:', margin, y);
    y += 5;

    const breakdown = topCandidate.scoreBreakdown;
    const scores = [
      { name: 'Cluster Match', score: `${breakdown.clusterMatch || 35}/40` },
      { name: 'Tx Proximity', score: `${breakdown.transactionProximity || 25}/30` },
      { name: 'Behaviour Similarity', score: `${breakdown.behaviourSimilarity || 15}/15` },
      { name: 'Deposit Pattern', score: `${breakdown.depositPattern || 10}/10` },
      { name: 'Temporal Correlation', score: `${breakdown.temporalMetadata || 5}/5` },
    ];

    scores.forEach((s, idx) => {
      const colX = margin + idx * 36;
      doc.setFillColor(241, 245, 249);
      doc.rect(colX, y, 34, 10, 'F');
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 116, 139);
      doc.text(s.name, colX + 2, y + 4);
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(s.score, colX + 2, y + 8.5);
    });
    y += 15;
  }

  // Section: Risk Assessment & Laundering Typologies
  checkPage(35);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('2. RISK ASSESSMENT & DETECTED TYPOLOGIES', margin, y);
  y += 4;
  doc.line(margin, y, margin + contentWidth, y);
  y += 5;

  const typologies = riskAssess.typologies || [];
  if (typologies.length > 0) {
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Identified AML / Typology Signatures:', margin, y);
    y += 5;

    typologies.forEach((typ: any) => {
      checkPage(12);
      doc.setFillColor(254, 243, 199); // amber-100
      doc.rect(margin, y, 4, 8, 'F');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(180, 83, 9); // amber-700
      doc.text(`[${typ.code || 'TYP'}] ${typ.name || 'Typology'} (${typ.confidence || 88}% Confidence)`, margin + 6, y + 3.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(String(typ.description || 'Structured peeling and layering pattern identified.'), margin + 6, y + 7);
      y += 10;
    });
  }

  // Section: Transaction Telemetry & Fund Flow Traversal
  if (includeGraph) {
    checkPage(35);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('3. FUND FLOW GRAPH & TRANSACTION TRAVERSAL', margin, y);
    y += 4;
    doc.line(margin, y, margin + contentWidth, y);
    y += 5;

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(
      `Total Transactions: ${txSummary.totalTransactions || 2}  |  Total Value: $${(txSummary.totalValueUsd || 0).toLocaleString()} USD  |  Flagged Suspicious: ${txSummary.suspiciousTransactions || 2}`,
      margin,
      y
    );
    y += 6;

    const txList = txSummary.transactions || [];
    if (txList.length > 0) {
      // Table header
      doc.setFillColor(30, 41, 59);
      doc.rect(margin, y, contentWidth, 6, 'F');
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('Hop #', margin + 2, y + 4.2);
      doc.text('From', margin + 14, y + 4.2);
      doc.text('To', margin + 58, y + 4.2);
      doc.text('Amount', margin + 102, y + 4.2);
      doc.text('USD Value', margin + 128, y + 4.2);
      doc.text('Tx Hash', margin + 152, y + 4.2);
      y += 6;

      txList.forEach((tx: any, idx: number) => {
        checkPage(8);
        doc.setFillColor(idx % 2 === 0 ? 248 : 255, idx % 2 === 0 ? 250 : 255, idx % 2 === 0 ? 252 : 255);
        doc.rect(margin, y, contentWidth, 6, 'F');
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(15, 23, 42);
        doc.text(String(tx.hopNumber || idx + 1), margin + 4, y + 4.2);

        const fromStr = String(tx.from || '');
        doc.text(fromStr.length > 16 ? `${fromStr.slice(0, 8)}...${fromStr.slice(-6)}` : fromStr, margin + 14, y + 4.2);

        const toStr = String(tx.to || '');
        doc.text(toStr.length > 16 ? `${toStr.slice(0, 8)}...${toStr.slice(-6)}` : toStr, margin + 58, y + 4.2);

        doc.text(`${tx.value} ${tx.tokenSymbol || ''}`, margin + 102, y + 4.2);
        doc.text(`$${(tx.valueUsd || 0).toLocaleString()}`, margin + 128, y + 4.2);

        const hashStr = String(tx.hash || '');
        doc.text(hashStr.length > 16 ? `${hashStr.slice(0, 8)}...${hashStr.slice(-6)}` : hashStr, margin + 152, y + 4.2);
        y += 6;
      });
      y += 6;
    }
  }

  // Section: Evidentiary Chain (if includeEvidence)
  if (includeEvidence) {
    checkPage(35);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('4. EVIDENTIARY CHAIN & ARTIFACT METADATA', margin, y);
    y += 4;
    doc.line(margin, y, margin + contentWidth, y);
    y += 5;

    const evidenceItems = report.evidence || (topCandidate.evidenceIds ? topCandidate.evidenceIds.map((id: string) => ({
      evidenceId: id,
      title: 'Corroborating Blockchain Telemetry Artifact',
      source: 'Transaction Graph & Cluster Engine',
      confidence: 90,
    })) : []);

    if (evidenceItems.length > 0) {
      doc.setFillColor(30, 41, 59);
      doc.rect(margin, y, contentWidth, 6, 'F');
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('Evidence ID', margin + 2, y + 4.2);
      doc.text('Evidence Description', margin + 45, y + 4.2);
      doc.text('Source Engine', margin + 130, y + 4.2);
      doc.text('Conf.', margin + 172, y + 4.2);
      y += 6;

      evidenceItems.forEach((ev: any, idx: number) => {
        checkPage(8);
        doc.setFillColor(idx % 2 === 0 ? 248 : 255, idx % 2 === 0 ? 250 : 255, idx % 2 === 0 ? 252 : 255);
        doc.rect(margin, y, contentWidth, 6, 'F');
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(15, 23, 42);
        doc.text(String(ev.evidenceId || `EVD-00${idx + 1}`), margin + 2, y + 4.2);
        const titleStr = doc.splitTextToSize(String(ev.title || 'Telemetry Artifact'), 80);
        doc.text(titleStr[0] || '', margin + 45, y + 4.2);
        doc.text(String(ev.source || 'Graph Engine').slice(0, 24), margin + 130, y + 4.2);
        doc.text(`${ev.confidence || 90}%`, margin + 172, y + 4.2);
        y += 6;
      });
      y += 6;
    }
  }

  // Final Sign-off Box
  checkPage(28);
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, contentWidth, 22, 'FD');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('INVESTIGATIVE OFFICER SIGN-OFF & CERTIFICATION', margin + 3, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Generated by: Demo Investigator (Badge #LEO-4091)', margin + 3, y + 10);
  doc.text(`Digital Verification Hash: SHA-256 [${Math.random().toString(16).slice(2, 10).toUpperCase()}...]`, margin + 3, y + 14);
  doc.text('Classification: ' + classification + '  |  Form: SIH-VASP-2026', margin + 3, y + 18);

  return doc;
}
