'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { casesApi, Report } from '@/lib/api';
import { generateReportPdf } from '@/lib/reportPdf';
import { 
  FileText, 
  Download, 
  Share2, 
  CheckCircle2, 
  Lock, 
  ShieldAlert, 
  AlertTriangle, 
  Check, 
  FileCheck,
  Building,
  Target,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';

export default function ReportPage() {
  const params = useParams();
  const caseId = params.id as string;

  const [template, setTemplate] = useState('Standard Investigative Summary');
  const [classification, setClassification] = useState('LAW ENFORCEMENT SENSITIVE (LES)');
  const [includeGraph, setIncludeGraph] = useState(true);
  const [includeEvidence, setIncludeEvidence] = useState(true);
  const [includeAttribution, setIncludeAttribution] = useState(true);

  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [reportData, setReportData] = useState<Report | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [shared, setShared] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await casesApi.report(caseId, {
        template,
        classification,
        includeGraph,
        includeEvidence,
        includeAttribution,
      });
      setReportData(res.data);
      setGenerated(true);
    } catch (err: any) {
      console.error('Report compilation failed:', err);
      setError(err.message || 'Failed to generate report from intelligence server.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!reportData) return;
    setDownloading(true);
    try {
      const doc = generateReportPdf(reportData, {
        template,
        classification,
        includeGraph,
        includeEvidence,
        includeAttribution,
      });

      const filename = `VASPTrace_Report_${caseId}.pdf`;
      doc.save(filename);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err: any) {
      console.error('PDF export failed:', err);
      setError(err.message || 'Failed to generate PDF document.');
    } finally {
      setDownloading(false);
    }
  };

  const handleSecureShare = () => {
    const reportRef = reportData?.reportId || `RPT-${caseId}`;
    const shareText = `VASPTrace Investigation Intelligence Report\nCase ID: ${caseId}\nReport Ref: ${reportRef}\nClassification: ${classification}\nStatus: Verified Synthetic Telemetry`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
    }
    setShared(true);
    setTimeout(() => setShared(false), 3000);
  };

  return (
    <div className="animate-fade-in w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-xs font-mono uppercase tracking-widest text-blue-400 font-semibold">
              Forensic Intelligence Export
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <FileText className="text-blue-500" size={26} />
            Evidentiary Intelligence Dossier
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Generate standardized MLAT and STR compliant intelligence reports with digital audit trails.
          </p>
        </div>
        
        <div className="text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
          Target: <span className="text-blue-400 font-bold">{caseId}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Report Controls */}
        <div className="lg:col-span-6 space-y-6 min-w-0">
          <div className="glass-panel p-6 border-slate-800 bg-[#090e1a]">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 pb-2 border-b border-slate-800 flex items-center gap-2">
              <FileCheck size={15} className="text-blue-400" />
              Report Specifications
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Investigation Template</label>
                <select
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  className="vt-select w-full text-xs font-medium"
                >
                  <option>Standard Investigative Summary</option>
                  <option>Suspicious Transaction Report (STR)</option>
                  <option>MLAT Request Annex</option>
                  <option>Subpoena Justification Matrix</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Security Classification Level</label>
                <select
                  value={classification}
                  onChange={(e) => setClassification(e.target.value)}
                  className="vt-select w-full text-amber-400 font-bold bg-amber-950/20 text-xs border-amber-500/30"
                >
                  <option>LAW ENFORCEMENT SENSITIVE (LES)</option>
                  <option>UNCLASSIFIED // FOR OFFICIAL USE ONLY</option>
                  <option>SECRET // NOFORN</option>
                </select>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Evidentiary Annexes Included
                </div>
                
                <label className="flex items-center gap-3 cursor-pointer p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={includeGraph}
                    onChange={(e) => setIncludeGraph(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-300">High-Resolution Fund Flow Graph & Hop Matrices</span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={includeEvidence}
                    onChange={(e) => setIncludeEvidence(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-300">Full Chain-of-Custody Raw Evidence (.JSON & Hashes)</span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={includeAttribution}
                    onChange={(e) => setIncludeAttribution(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-300">VASP Heuristic Scoring Vector & Cluster Breakdown</span>
                </label>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-xs text-red-400">
                <AlertTriangle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-800">
              {!generated ? (
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="w-full btn-primary py-3.5 justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                >
                  {generating ? (
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> 
                      Compiling Dossier...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      <FileText size={17} /> Compile Official Report
                    </span>
                  )}
                </button>
              ) : (
                <div className="space-y-3 animate-fade-in">
                  <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30 text-xs">
                    <CheckCircle2 size={16} /> Report Dossier Compiled Successfully
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleDownloadPdf}
                      disabled={downloading}
                      className="btn-primary justify-center font-semibold text-xs py-3"
                    >
                      {downloadSuccess ? (
                        <>
                          <Check size={15} className="mr-1.5 text-green-300" /> Exported!
                        </>
                      ) : downloading ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-1.5" /> Building PDF...
                        </>
                      ) : (
                        <>
                          <Download size={15} className="mr-1.5" /> Download PDF
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleSecureShare}
                      className="btn-secondary justify-center font-semibold text-xs py-3"
                    >
                      {shared ? (
                        <>
                          <Check size={15} className="mr-1.5 text-emerald-400" /> Copied Ref!
                        </>
                      ) : (
                        <>
                          <Share2 size={15} className="mr-1.5" /> Secure Share
                        </>
                      )}
                    </button>
                  </div>

                  <button
                    onClick={() => setGenerated(false)}
                    className="w-full text-center text-[11px] text-slate-500 hover:text-slate-300 transition-colors pt-1"
                  >
                    Adjust Parameters & Recompile
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Briefing Summary & Audit Stream */}
        <div className="lg:col-span-6 space-y-6 min-w-0">
          
          {/* Briefing Summary */}
          {generated && reportData ? (
            <div className="glass-panel p-5 border-blue-500/30 bg-[#061022] animate-fade-in space-y-4">
              <div className="flex justify-between items-start pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                    Intelligence Briefing Summary
                  </span>
                  <h4 className="text-base font-bold text-white mt-0.5">
                    {String((reportData.caseInformation as any)?.title || caseId)}
                  </h4>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {classification}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Attributed Entity</span>
                  <div className="font-bold text-white text-sm">
                    {String((reportData.vaspAttribution as any)?.likelyVasp || 'Analyzed Cluster')}
                  </div>
                  <div className="text-[11px] text-cyan-400 font-mono mt-0.5">
                    {Number((reportData.vaspAttribution as any)?.confidence || 0)}% Confidence
                  </div>
                </div>

                <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Risk Severity</span>
                  <div className={`font-bold text-sm ${
                    Number((reportData.riskAssessment as any)?.overallScore || 0) >= 80 ? 'text-red-400' : 'text-orange-400'
                  }`}>
                    {Number((reportData.riskAssessment as any)?.overallScore || 0)}/100 Rating
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {Array.isArray((reportData.riskAssessment as any)?.typologies) 
                      ? `${(reportData.riskAssessment as any).typologies.length} Typologies Flagged` 
                      : 'Verified Heuristic Traces'}
                  </div>
                </div>
              </div>

              {Boolean((reportData.caseInformation as any)?.investigatorNotes) && (
                <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                  <span className="text-white font-semibold block mb-1">Investigator Context:</span>
                  {String((reportData.caseInformation as any)?.investigatorNotes)}
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <div className="flex items-start gap-3">
                <ShieldAlert size={18} className="text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-200/90 leading-relaxed">
                  <strong>Strict Audit Logging Active:</strong> All intelligence report generation, cryptographic exports, and distribution attempts are permanently signed in the tamper-evident audit ledger.
                </p>
              </div>
            </div>
          )}

          {/* Audit Terminal Log */}
          <div className="border border-slate-800 rounded-xl bg-[#050811] p-4 font-mono text-[10px] text-slate-400 relative overflow-hidden shadow-inner">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800/80 text-xs font-bold text-slate-400">
              <span className="flex items-center gap-1.5">
                <Lock size={12} className="text-slate-500" />
                AUDIT_STREAM_CONSOLE
              </span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ACTIVE
              </span>
            </div>
            
            <div className="space-y-1.5 text-[10px]">
              <div>[10:14:22] SESSION_START Operator: DEMO_OFFICER IP: 127.0.0.1</div>
              <div>[10:15:04] VIEW_CASE Target: {caseId} Graph: RENDERED</div>
              <div>[10:18:12] HEURISTIC_CLUSTER Evaluated: 24 VASPs Target: {caseId}</div>
              <div>[10:21:45] EVIDENCE_CHAIN Validated: SHA-256 Merkle root locked</div>
              {generating && (
                <div className="text-amber-400">
                  [10:25:01] REPORT_COMPILE_START Target: {caseId} Template: {template.slice(0, 15)}...
                </div>
              )}
              {generated && (
                <div className="text-emerald-400">
                  [10:25:03] REPORT_READY ID: {reportData?.reportId?.slice(0, 18) || 'RPT-VALID'} Status: SIGNED
                </div>
              )}
              {downloadSuccess && (
                <div className="text-cyan-400">
                  [10:25:10] ARTIFACT_EXPORT Format: PDF Target: {caseId}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

