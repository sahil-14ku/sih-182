'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { casesApi, Evidence } from '@/lib/api';
import { ShieldCheck, Database, Link2, Clock, Fingerprint, Hash, AlertCircle } from 'lucide-react';

export default function EvidencePage() {
  const params = useParams();
  const caseId = params.id as string;
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    casesApi.evidence(caseId).then(res => {
      setEvidence(res.data);
      setLoading(false);
    }).catch(console.error);
  }, [caseId]);

  if (loading) return (
    <div className="w-full space-y-4">
      {[1,2,3].map(i => <div key={i} className="skeleton h-36 rounded-xl" />)}
    </div>
  );

  const getIcon = (type: string) => {
    if (type.includes('cluster')) return <Database size={16} className="text-blue-400" />;
    if (type.includes('proximity') || type.includes('temporal')) return <Clock size={16} className="text-amber-400" />;
    if (type.includes('typology')) return <Fingerprint size={16} className="text-red-400" />;
    if (type.includes('hash') || type.includes('transaction')) return <Hash size={16} className="text-cyan-400" />;
    return <Link2 size={16} className="text-slate-400" />;
  };

  const getIconBg = (type: string) => {
    if (type.includes('cluster')) return 'rgba(59, 130, 246, 0.12)';
    if (type.includes('proximity') || type.includes('temporal')) return 'rgba(245, 158, 11, 0.12)';
    if (type.includes('typology')) return 'rgba(239, 68, 68, 0.12)';
    return 'rgba(56, 189, 248, 0.12)';
  };

  const getConfidenceColor = (conf: number) => {
    if (conf >= 85) return '#10b981';
    if (conf >= 65) return '#f59e0b';
    return '#f87171';
  };

  return (
    <div className="animate-fade-in w-full">
      {/* Page Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
            <ShieldCheck size={20} className="text-green-500" />
            Evidentiary Chain
          </h2>
          <p className="text-slate-500 text-sm">
            Cryptographically verifiable evidence artifacts · {evidence.length} items collected
          </p>
        </div>
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-lg">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-green-400 font-semibold font-mono uppercase">Chain Intact</span>
        </div>
      </div>

      {/* Evidence Timeline */}
      <div className="space-y-4">
        {evidence.map((item, idx) => {
          const confColor = getConfidenceColor(item.confidence);
          const circumference = 2 * Math.PI * 14;
          const filled = circumference - (circumference * item.confidence) / 100;
          
          return (
            <div key={item.evidenceId} className="evidence-timeline-item">
              {/* Timeline dot */}
              <div
                className="evidence-timeline-dot"
                style={{ background: getIconBg(item.type) }}
              >
                {getIcon(item.type)}
              </div>

              {/* Card */}
              <div className="flex-1 glass-panel p-5 hover:border-slate-600/50 transition-colors mb-4">
                {/* Top row */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[9px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        #{String(idx + 1).padStart(2, '0')} · {item.evidenceId}
                      </span>
                      <span className="tag-chip-muted text-[9px]">
                        {item.type.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white">{item.title}</h3>
                  </div>

                  {/* Confidence arc */}
                  <div className="flex flex-col items-center shrink-0">
                    <svg className="w-10 h-10 -rotate-90">
                      <circle cx="20" cy="20" r="14" stroke="rgba(255,255,255,0.06)" strokeWidth="3" fill="none" />
                      <circle
                        cx="20" cy="20" r="14"
                        stroke={confColor}
                        strokeWidth="3"
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={filled}
                        strokeLinecap="round"
                        style={{ filter: `drop-shadow(0 0 4px ${confColor}80)` }}
                      />
                    </svg>
                    <div className="text-[9px] font-mono text-slate-500 -mt-0.5">{item.confidence}%</div>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-4">{item.description}</p>

                {/* Metadata row */}
                <div className="grid grid-cols-3 gap-3 p-3 bg-black/20 rounded-lg border border-slate-800/50">
                  <div>
                    <div className="metric-label">Source Tool</div>
                    <div className="text-xs text-slate-300 font-medium">{item.source}</div>
                  </div>
                  <div>
                    <div className="metric-label">Timestamp</div>
                    <div className="text-xs text-slate-300 font-mono">
                      {new Date(item.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="metric-label">Reference Hash</div>
                    <div className="text-[10px] font-mono text-cyan-400 truncate" title={item.transactionHash || item.relatedWallet}>
                      {item.transactionHash || item.relatedWallet || '—'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {evidence.length === 0 && (
          <div className="glass-panel p-12 text-center">
            <AlertCircle size={32} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No evidence items available for this case.</p>
          </div>
        )}
      </div>
    </div>
  );
}
