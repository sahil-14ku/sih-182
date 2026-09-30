'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { casesApi, RiskResult } from '@/lib/api';
import { AlertTriangle, AlertOctagon, CheckCircle2, ShieldAlert, Fingerprint, ListOrdered, TrendingUp } from 'lucide-react';

function RiskGauge({ score, level }: { score: number; level: string }) {
  const clampedScore = Math.min(Math.max(score || 0, 0), 100);
  
  // Semicircle parameters: Center: (100, 90), Radius: 68
  // Arc length = PI * 68 = 213.63
  const arcLength = 213.63;
  const strokeOffset = arcLength * (1 - clampedScore / 100);

  const levelColor = 
    level === 'CRITICAL' ? '#ef4444' :
    level === 'HIGH' ? '#f97316' :
    level === 'MEDIUM' ? '#f59e0b' : '#10b981';

  return (
    <div className="flex flex-col items-center">
      <svg width="200" height="115" viewBox="0 0 200 115" className="overflow-visible">
        <defs>
          <linearGradient id="riskTrackGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
            <stop offset="35%" stopColor="#f59e0b" stopOpacity="0.25" />
            <stop offset="70%" stopColor="#f97316" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.25" />
          </linearGradient>
        </defs>

        {/* Outer subtle guide track */}
        <path
          d="M 32 90 A 68 68 0 0 1 168 90"
          stroke="#111a2d"
          strokeWidth="14"
          fill="none"
          strokeLinecap="round"
        />

        {/* 4-Zone colored background track */}
        <path
          d="M 32 90 A 68 68 0 0 1 168 90"
          stroke="url(#riskTrackGrad)"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
        />

        {/* Active Progress Arc */}
        <path
          d="M 32 90 A 68 68 0 0 1 168 90"
          stroke={levelColor}
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={arcLength}
          strokeDashoffset={strokeOffset}
          style={{
            filter: `drop-shadow(0 0 8px ${levelColor}90)`,
            transition: 'stroke-dashoffset 0.8s ease-out'
          }}
        />

        {/* Center Score Text */}
        <text
          x="100"
          y="72"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="36"
          fontWeight="900"
          fontFamily="JetBrains Mono, monospace"
          className="tracking-tight"
        >
          {clampedScore}
        </text>
        <text
          x="100"
          y="90"
          textAnchor="middle"
          fill="#64748b"
          fontSize="10"
          fontWeight="700"
          fontFamily="JetBrains Mono, monospace"
          letterSpacing="1.5"
        >
          / 100
        </text>
      </svg>

      <span
        className="px-5 py-1.5 rounded-full text-xs font-bold font-mono uppercase tracking-widest mt-2"
        style={{
          background: `${levelColor}15`,
          color: levelColor,
          border: `1px solid ${levelColor}40`,
          boxShadow: `0 0 14px ${levelColor}25`
        }}
      >
        {level}
      </span>
    </div>
  );
}

export default function RiskPage() {
  const params = useParams();
  const caseId = params.id as string;
  const [data, setData] = useState<RiskResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    casesApi.risk(caseId).then(res => {
      setData(res.data);
      setLoading(false);
    }).catch(console.error);
  }, [caseId]);

  if (loading) return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-3 gap-6">
        <div className="skeleton h-56 rounded-xl" />
        <div className="col-span-2 skeleton h-56 rounded-xl" />
      </div>
    </div>
  );
  if (!data) return <div>No risk data available.</div>;

  const riskLevelClass = 
    data.riskLevel === 'CRITICAL' ? 'risk-critical' :
    data.riskLevel === 'HIGH' ? 'risk-high' :
    data.riskLevel === 'MEDIUM' ? 'risk-medium' : 'risk-low';

  const meterClass = data.riskLevel?.toLowerCase() || 'low';

  return (
    <div className="animate-fade-in w-full space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
            <AlertTriangle size={20} className="text-amber-500" />
            Risk & Typologies Analysis
          </h2>
          <p className="text-slate-500 text-sm">Heuristic scoring of behavioral risk vectors and AML pattern detection.</p>
        </div>
      </div>

      {/* Top Section: Gauge + Factors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Gauge */}
        <div className="glass-panel p-6 flex flex-col items-center justify-center min-w-0">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 font-mono">Overall Risk Rating</div>
          <RiskGauge score={data.overallScore} level={data.riskLevel} />
          
          <div className="w-full mt-6 space-y-1.5">
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1">
              <span>RISK METER</span>
              <span>{data.overallScore}%</span>
            </div>
            <div className="risk-meter-bar">
              <div
                className={`risk-meter-fill ${meterClass}`}
                style={{ width: `${data.overallScore}%` }}
              />
            </div>
          </div>

          <div className="w-full mt-4 pt-4 border-t border-slate-800">
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono text-slate-500">
              <div>
                <div className="text-green-400">LOW</div>
                <div>0–39</div>
              </div>
              <div>
                <div className="text-amber-400">MED</div>
                <div>40–69</div>
              </div>
              <div>
                <div className="text-red-400">HIGH+</div>
                <div>70–100</div>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Factors */}
        <div className="md:col-span-2 glass-panel p-6 min-w-0">
          <h3 className="section-title mb-4 flex items-center gap-2">
            <TrendingUp size={14} /> Risk Factor Matrix
          </h3>
          <div className="space-y-3">
            {data.factors.map((factor, i) => (
              <div key={i} className="p-4 rounded-lg border border-slate-800/60 bg-black/20">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {factor.detected
                      ? <AlertOctagon size={14} className="text-red-400 shrink-0" />
                      : <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                    }
                    <span className="text-sm font-semibold text-white">{factor.name}</span>
                    {factor.detected && (
                      <span className="risk-badge risk-high text-[9px]">DETECTED</span>
                    )}
                  </div>
                  <div className="text-xs font-mono text-slate-400 shrink-0">
                    <span className={factor.detected ? 'text-red-400' : 'text-slate-600'}>
                      +{factor.score}
                    </span>
                    <span className="text-slate-700"> pts</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 pl-5">{factor.description}</p>
                {factor.detected && (
                  <div className="mt-2 pl-5">
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500/60 rounded-full"
                        style={{ width: `${Math.min(100, (factor.score / 25) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Typologies */}
      <div className="glass-panel p-6">
        <h3 className="section-title mb-4 flex items-center gap-2">
          <Fingerprint size={14} /> Detected AML Typologies
        </h3>
        {data.typologies.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            <CheckCircle2 size={28} className="text-green-600 mx-auto mb-2" />
            No AML typologies detected for this case.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.typologies.map((t, i) => {
              const levelColor = t.confidence >= 80 ? '#ef4444' : t.confidence >= 60 ? '#f97316' : '#f59e0b';
              return (
                <div key={i} className="p-4 rounded-lg border border-slate-800 bg-[#0a0f1a] relative overflow-hidden">
                  <div
                    className="absolute left-0 top-0 bottom-0 w-0.5"
                    style={{ background: levelColor }}
                  />
                  <div className="flex justify-between items-start mb-2 pl-3">
                    <div className="font-bold text-slate-100 text-sm">{t.name}</div>
                    <div
                      className="text-[10px] font-mono font-bold px-2 py-0.5 rounded"
                      style={{ color: levelColor, background: `${levelColor}18`, border: `1px solid ${levelColor}35` }}
                    >
                      {t.confidence}% CONF
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mb-3 pl-3">{t.description}</p>
                  <div className="flex flex-wrap gap-1.5 pl-3">
                    {t.indicators.map((ind, idx) => (
                      <span key={idx} className="tag-chip-muted text-[9px]">
                        {ind}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Priority Matrix */}
      <div className="glass-panel overflow-hidden">
        <div className="p-5 border-b border-slate-800 bg-[#0a0f1a]/60 flex items-center gap-2">
          <ListOrdered size={15} className="text-slate-500" />
          <h3 className="section-title mb-0">Target Prioritization Matrix</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="vt-table">
            <thead>
              <tr>
                <th>Priority</th>
                <th>Wallet / Label</th>
                <th>Risk Score</th>
                <th>VASP Conf</th>
                <th>Volume</th>
                <th>Rationale</th>
              </tr>
            </thead>
            <tbody>
              {data.walletPriority.map((w, i) => (
                <tr key={i}>
                  <td>
                    <span className={`priority-badge priority-${w.priority}`}>
                      {w.priority}
                    </span>
                  </td>
                  <td>
                    <div className="font-medium text-white text-xs mb-0.5">{w.label}</div>
                    <div className="wallet-addr text-[10px] truncate max-w-[160px]" title={w.address}>{w.address}</div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className={`risk-badge ${riskLevelClass} text-[9px]`}>{w.riskScore}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${w.vaspConfidence}%` }} />
                      </div>
                      <span className="text-xs font-mono text-slate-400">{w.vaspConfidence}%</span>
                    </div>
                  </td>
                  <td className="font-mono text-xs">${w.transactionVolume.toLocaleString()}</td>
                  <td className="text-xs text-slate-400 max-w-[200px] truncate">{w.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
