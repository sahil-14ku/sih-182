'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { casesApi, FullCase } from '@/lib/api';
import { ShieldAlert, AlertTriangle, ArrowRight, Eye, Shield, CheckCircle2, Target, ShieldCheck, RefreshCw, Activity, Wallet, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function CaseOverview() {
  const params = useParams();
  const caseId = params.id as string;
  const [data, setData] = useState<FullCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCase = () => {
    setLoading(true);
    setError(null);
    casesApi.get(caseId)
      .then(res => {
        if (res.data) {
          setData(res.data);
        } else {
          setError(`Case ${caseId} data was not returned by the server.`);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load case:', err);
        setError(err.message || 'Unable to connect to investigation intelligence server.');
        setLoading(false);
      });
  };

  useEffect(() => { fetchCase(); }, [caseId]);

  if (loading) {
    return (
      <div className="w-full space-y-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-20 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="skeleton h-64 rounded-xl" />
            <div className="skeleton h-40 rounded-xl" />
          </div>
          <div className="space-y-6">
            <div className="skeleton h-72 rounded-xl" />
            <div className="skeleton h-32 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel p-8 max-w-xl mx-auto text-center space-y-4 my-12 border-red-500/30">
        <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
          <AlertTriangle size={24} />
        </div>
        <h3 className="text-lg font-bold text-white">Investigation Data Unavailable</h3>
        <p className="text-sm text-slate-400">{error}</p>
        <div className="flex justify-center gap-3 pt-2">
          <button onClick={fetchCase} className="btn-primary text-xs flex items-center gap-2">
            <RefreshCw size={14} /> Retry Load
          </button>
          <Link href="/cases" className="btn-secondary text-xs">Back to Investigations</Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="glass-panel p-8 max-w-xl mx-auto text-center space-y-4 my-12">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
          <AlertTriangle size={24} />
        </div>
        <h3 className="text-lg font-bold text-white">Case Not Found</h3>
        <p className="text-sm text-slate-400">The requested investigation case ({caseId}) could not be located in active records.</p>
        <Link href="/cases" className="btn-secondary text-xs inline-flex mt-2">Back to Investigations</Link>
      </div>
    );
  }

  const typologiesList = data.risk?.typologies && data.risk.typologies.length > 0
    ? data.risk.typologies : null;

  const riskLevel = (data.riskScore || 0) >= 80 ? 'critical' : (data.riskScore || 0) >= 60 ? 'high' : (data.riskScore || 0) >= 40 ? 'medium' : 'low';
  const riskLabel = riskLevel.toUpperCase();

  const txCount = data.transactions?.length || data.wallets?.[0]?.transactionCount || 0;
  const totalVolume = (data.transactions && data.transactions.length > 0)
    ? data.transactions.reduce((sum, tx) => sum + (tx.valueUsd || 0), 0)
    : (data.wallets?.[0]?.totalReceived || 0) *
      (data.blockchain?.toLowerCase().includes('bitcoin') ? 65000 :
       data.blockchain?.toLowerCase().includes('tron') ? 1 :
       data.blockchain?.toLowerCase().includes('solana') ? 150 :
       data.blockchain?.toLowerCase().includes('bsc') ? 580 : 2600);

  const quickLinks = [
    { label: 'Fund Flow Graph', href: `/cases/${caseId}/graph`, icon: <Activity size={13} className="text-blue-400" />, color: '#3b82f6' },
    { label: 'Attribution Report', href: `/cases/${caseId}/attribution`, icon: <Target size={13} className="text-purple-400" />, color: '#a855f7' },
    { label: 'Evidence Chain', href: `/cases/${caseId}/evidence`, icon: <ShieldCheck size={13} className="text-green-400" />, color: '#10b981' },
    { label: 'Risk Analysis', href: `/cases/${caseId}/risk`, icon: <AlertTriangle size={13} className="text-amber-400" />, color: '#f59e0b' },
  ];

  return (
    <div className="animate-fade-in w-full space-y-6">
      {/* Title row */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-white mb-2">{data.title}</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="tag-chip">{data.blockchain}</span>
            <span className="tag-chip capitalize">{data.type}</span>
            <div className="flex items-center gap-1.5">
              <span className={`status-dot ${data.status === 'completed' ? 'online' : 'warning'}`} />
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">{data.status}</span>
            </div>
          </div>
        </div>
        <Link href={`/cases/${caseId}/graph`} className="btn-primary text-xs">
          Fund Flow Graph <ArrowRight size={14} />
        </Link>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="metric-cell min-w-0">
          <div className="metric-label">Tx Count</div>
          <div className="metric-value">{txCount}</div>
        </div>
        <div className="metric-cell min-w-0">
          <div className="metric-label">Total Volume</div>
          <div className="metric-value text-lg">${totalVolume.toLocaleString()}</div>
        </div>
        <div className="metric-cell min-w-0">
          <div className="metric-label">Risk Score</div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`risk-badge risk-${riskLevel} text-base`}>{data.riskScore}/100</span>
          </div>
        </div>
        <div className="metric-cell min-w-0">
          <div className="metric-label">VASP Confidence</div>
          <div className="metric-value">{data.vaspConfidence}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6 min-w-0">
          {/* Target Intelligence */}
          <div className="glass-panel p-6">
            <div className="flex items-center gap-2 mb-4">
              <Wallet size={14} className="text-blue-400" />
              <h3 className="section-title mb-0">Target Intelligence</h3>
            </div>

            <div className="bg-black/30 rounded-lg p-4 border border-slate-800/60 mb-5">
              <div className="metric-label mb-1">Primary Suspect Wallet</div>
              <div className="font-mono text-sm text-blue-400 break-all leading-relaxed">
                {data.suspectWallet}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-black/20 border border-slate-800/50">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-3">
                  <AlertTriangle size={13} className="text-amber-500" /> Detected Typologies
                </div>
                {typologiesList ? (
                  <ul className="space-y-2">
                    {typologiesList.map((t: any, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <div>
                          <span className="text-xs text-slate-200 font-medium">{t.name}</span>
                          {t.confidence ? (
                            <span className="text-[10px] text-slate-500 ml-1.5">({t.confidence}% conf)</span>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 italic">No specific typologies flagged.</p>
                )}
              </div>

              <div className="p-4 rounded-lg bg-black/20 border border-slate-800/50">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-3">
                  <ShieldAlert size={13} className="text-red-500" /> Primary VASP Destination
                </div>
                <div className="text-lg font-bold text-white mb-1">{data.likelyVasp || 'Unknown'}</div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${data.vaspConfidence}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-slate-400">{data.vaspConfidence}%</span>
                </div>
                <div className="text-[10px] text-slate-600 mt-1">Attribution confidence score</div>
              </div>
            </div>
          </div>

          {/* Investigator Notes */}
          <div className="glass-panel p-6">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} className="text-slate-500" />
              <h3 className="section-title mb-0">Investigator Notes</h3>
            </div>
            <div className="bg-black/30 rounded-lg p-4 border border-slate-800/60 text-slate-300 text-xs whitespace-pre-wrap font-mono leading-relaxed">
              {data.investigatorNotes || 'No notes provided during initialization.'}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6 min-w-0">
          {/* Attribution Summary */}
          <div className="glass-panel p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target size={14} className="text-blue-400" />
              <h3 className="section-title mb-0">Attribution Summary</h3>
            </div>

            {/* Confidence ring */}
            <div className="flex flex-col items-center py-5 border-b border-slate-800/60 mb-4">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg width="128" height="128" viewBox="0 0 128 128" className="-rotate-90 overflow-visible">
                  <defs>
                    <linearGradient id="vaspConfidenceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="100%" stopColor="#2563eb" />
                    </linearGradient>
                  </defs>

                  {/* Dark Track Background */}
                  <circle
                    cx="64"
                    cy="64"
                    r="50"
                    stroke="#10192a"
                    strokeWidth="10"
                    fill="none"
                  />

                  {/* Guide Ring */}
                  <circle
                    cx="64"
                    cy="64"
                    r="50"
                    stroke="rgba(56, 189, 248, 0.12)"
                    strokeWidth="8"
                    fill="none"
                  />

                  {/* Active Gradient Arc */}
                  <circle
                    cx="64"
                    cy="64"
                    r="50"
                    stroke="url(#vaspConfidenceGrad)"
                    strokeWidth="9"
                    fill="none"
                    strokeDasharray={314.16}
                    strokeDashoffset={314.16 - (314.16 * Math.min(Math.max(data.vaspConfidence || 0, 0), 100)) / 100}
                    strokeLinecap="round"
                    style={{
                      filter: 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.45))',
                      transition: 'stroke-dashoffset 0.8s ease-out'
                    }}
                  />
                </svg>

                <div className="absolute inset-0 flex items-center justify-center flex-col select-none">
                  <span className="text-2xl font-black font-mono text-white tracking-tight leading-none">
                    {data.vaspConfidence}%
                  </span>
                  <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest mt-1">
                    CONF.
                  </span>
                </div>
              </div>

              <div className="mt-3.5 text-center">
                <div className="text-base font-bold text-white tracking-tight">{data.likelyVasp || 'Unknown'}</div>
                <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mt-0.5">LIKELY VASP ENTITY</div>
              </div>
            </div>

            {/* Quick links */}
            <div className="space-y-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-900/40 hover:bg-slate-800/50 border border-transparent hover:border-slate-700/50 transition-all group"
                >
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    {link.icon} {link.label}
                  </div>
                  <ArrowRight size={12} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="p-4 rounded-lg border border-amber-500/15 bg-amber-500/5">
            <div className="flex items-start gap-2.5">
              <Eye size={14} className="text-amber-500 shrink-0 mt-0.5" />
              <div className="text-[10px] text-slate-500 leading-relaxed">
                <span className="font-bold text-slate-400 block mb-1">Intelligence Disclaimer</span>
                VASP attribution is an investigative intelligence lead. Requires human verification before legal action.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
