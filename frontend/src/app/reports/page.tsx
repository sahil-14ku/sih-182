'use client';

import { useState, useEffect } from 'react';
import { casesApi, CaseSummary } from '@/lib/api';
import { 
  FileText, 
  Download, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  Shield, 
  FileCheck,
  Building,
  Target,
  Layers,
  Award
} from 'lucide-react';
import Link from 'next/link';
import { generateReportPdf } from '@/lib/reportPdf';

export default function ReportsPage() {
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [generated, setGenerated] = useState<Record<string, boolean>>({});

  useEffect(() => {
    casesApi.list().then(res => {
      setCases(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleGenerateReport = async (caseId: string) => {
    setGenerating(caseId);
    try {
      const res = await casesApi.report(caseId);
      setGenerated(prev => ({ ...prev, [caseId]: true }));
      if (res.data) {
        const doc = generateReportPdf(res.data);
        doc.save(`VASPTrace_Report_${caseId}.pdf`);
      }
    } catch (err) {
      console.error('Report generation failed', err);
    } finally {
      setGenerating(null);
    }
  };

  const analyzedCases = cases.filter(c => (c.analysisProgress || 0) >= 80 || c.riskScore);

  if (loading) {
    return (
      <div className="page-container space-y-4">
        <div className="skeleton h-12 w-64 rounded-xl" />
        <div className="skeleton h-24 w-full rounded-2xl" />
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="skeleton h-32 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-xs font-mono uppercase tracking-widest text-blue-400 font-semibold">
              Statutory Dossiers
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <FileText className="text-blue-500" size={26} />
            Forensic Intelligence Reports
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Court-ready STR and MLAT investigative dossiers with verified cryptographic audit trails.
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3.5 py-2 font-medium">
          <AlertTriangle size={14} className="shrink-0" />
          <span>Synthetic Demo Data — Not for legal use</span>
        </div>
      </div>

      {/* Info Overview Card */}
      <div className="glass-panel p-5 border-slate-800 bg-[#080d19] flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
          <Shield size={20} className="text-cyan-400" />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-bold text-white mb-1">Standardized Intelligence Export Framework</h2>
          <p className="text-slate-400 text-xs leading-relaxed">
            Every dossier consolidates transaction graph topology, risk factor scoring, VASP heuristic attribution vectors, 
            and chain-of-custody evidence into an MLAT/STR structured format ready for law enforcement submission.
          </p>
        </div>
      </div>

      {/* Case Reports List */}
      <div className="glass-panel overflow-hidden border-slate-800 bg-[#080d19] shadow-2xl">
        <div className="p-4 border-b border-slate-800 bg-[#0c1322] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck size={16} className="text-blue-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Ready Investigation Reports
            </h2>
          </div>
          <span className="text-xs font-mono text-cyan-400 font-semibold">
            {analyzedCases.length} Dossiers Available
          </span>
        </div>

        {analyzedCases.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={40} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-300 font-bold mb-1">No Analyzed Cases Found</p>
            <p className="text-slate-500 text-xs max-w-sm mx-auto mb-4">
              Deploy tracing agents on a suspect wallet and complete analysis to unlock intelligence report generation.
            </p>
            <Link href="/cases" className="btn-primary text-xs inline-flex items-center gap-1.5 py-2 px-4">
              View All Investigations <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {analyzedCases.map(c => {
              const riskLevel = (c.riskScore || 0) >= 80 ? 'critical' : (c.riskScore || 0) >= 60 ? 'high' : 'medium';
              const isGen = generated[c.caseId];

              return (
                <div key={c.caseId} className="p-5 hover:bg-slate-800/30 transition-all group">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    
                    {/* Left: Icon & Meta */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                        isGen 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                          : 'bg-slate-900 border-slate-700/80 text-blue-400 group-hover:border-blue-500/50'
                      }`}>
                        <FileText size={20} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="font-mono text-xs font-bold text-blue-400">{c.caseId}</span>
                          <span className={`risk-badge risk-${riskLevel}`}>
                            {riskLevel.toUpperCase()} ({c.riskScore || 0})
                          </span>
                          {isGen && (
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              <CheckCircle size={11} /> Exported
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-white text-sm group-hover:text-blue-300 transition-colors truncate mb-1">
                          {c.title}
                        </h3>

                        <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                          <span className="wallet-addr text-[11px]">{c.suspectWallet.slice(0, 16)}...</span>
                          <span className="uppercase text-[11px] font-mono">{c.blockchain}</span>
                          {c.likelyVasp && (
                            <span className="text-slate-300 flex items-center gap-1">
                              VASP: <strong className="text-white">{c.likelyVasp}</strong>
                            </span>
                          )}
                          {c.vaspConfidence && (
                            <span className="text-cyan-400 font-mono text-[11px]">
                              {c.vaspConfidence}% Conf.
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Right: Actions */}
                    <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto justify-end">
                      <Link
                        href={`/cases/${c.caseId}/report`}
                        className="btn-secondary text-xs flex items-center gap-1.5 py-2 px-3 hover:border-blue-500/50"
                      >
                        <ArrowRight size={13} /> View Full Report
                      </Link>
                      
                      <button
                        onClick={() => handleGenerateReport(c.caseId)}
                        disabled={generating === c.caseId}
                        className="btn-primary text-xs flex items-center gap-1.5 py-2 px-3.5 shadow-[0_0_15px_rgba(37,99,235,0.3)] disabled:opacity-50"
                      >
                        {generating === c.caseId ? (
                          <><Clock size={13} className="animate-spin" /> Compiling...</>
                        ) : (
                          <><Download size={13} /> Export Report</>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Progress Meter */}
                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center gap-3">
                    <span className="text-[11px] text-slate-400 font-medium w-28">Analysis Fidelity</span>
                    <div className="flex-1 h-1.5 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400"
                        style={{ width: `${c.analysisProgress || 100}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-cyan-400 font-bold">{c.analysisProgress || 100}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cases Pending Analysis */}
      {cases.filter(c => !analyzedCases.includes(c)).length > 0 && (
        <div className="glass-panel overflow-hidden border-slate-800 bg-[#080d19]">
          <div className="p-4 border-b border-slate-800 bg-[#0c1322] flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pending Tracing Execution
            </h2>
            <span className="text-xs text-slate-500">
              Run analysis protocol to unlock report generation
            </span>
          </div>
          <div className="divide-y divide-slate-800">
            {cases.filter(c => !analyzedCases.includes(c)).map(c => (
              <div key={c.caseId} className="p-4 flex items-center justify-between gap-4 opacity-75 hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                    <Clock size={16} />
                  </div>
                  <div>
                    <div className="font-mono text-[11px] text-slate-400">{c.caseId}</div>
                    <div className="font-medium text-white text-xs">{c.title}</div>
                  </div>
                </div>
                <Link href={`/cases/${c.caseId}/analyze`} className="btn-secondary text-xs py-1.5 px-3">
                  Deploy Tracing →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

