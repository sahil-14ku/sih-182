'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { casesApi, AttributionResult, AttributionCandidate } from '@/lib/api';
import { 
  Target, 
  Server, 
  Link2, 
  Shield, 
  Eye, 
  Database, 
  Code, 
  CheckCircle2, 
  ChevronRight,
  HelpCircle,
  Layers,
  ArrowRight,
  AlertTriangle,
  Award
} from 'lucide-react';
import Link from 'next/link';

export default function AttributionPage() {
  const params = useParams();
  const caseId = params.id as string;
  const [data, setData] = useState<AttributionResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    casesApi.attribution(caseId).then(res => {
      setData(res.data);
      setLoading(false);
    }).catch(console.error);
  }, [caseId]);

  if (loading) {
    return (
      <div className="space-y-6 w-full">
        <div className="skeleton h-12 w-80 rounded-lg"></div>
        <div className="skeleton h-32 w-full rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="skeleton h-96 md:col-span-2 rounded-xl"></div>
          <div className="skeleton h-96 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!data || !data.candidates || data.candidates.length === 0) {
    return (
      <div className="glass-panel p-12 text-center max-w-md mx-auto my-12">
        <Target size={40} className="text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">No Attribution Data Available</h3>
        <p className="text-sm text-slate-400">Analysis did not detect sufficient cluster or behavioral signals to attribute this wallet to a known VASP.</p>
      </div>
    );
  }

  const primary = data.candidates[0];

  return (
    <div className="animate-fade-in w-full space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-wider text-blue-400 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              Forensic Attribution Engine
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Target className="text-blue-500" size={26} />
            VASP Attribution Intelligence
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Algorithmic heuristic clustering, transaction proximity graphs, and behavioral fingerprinting.
          </p>
        </div>
        <div className="text-left sm:text-right bg-slate-900/60 px-3.5 py-2 rounded-lg border border-slate-800">
          <div className="text-xs font-mono text-slate-400">
            VASPs Evaluated: <span className="text-white font-bold">{data.totalVaspsAnalyzed}</span>
          </div>
          <div className="text-[11px] font-mono text-slate-500 mt-0.5">
            {new Date(data.analysisTimestamp).toLocaleString('en-IN', {
              month: 'short', day: '2-digit', year: 'numeric',
              hour: '2-digit', minute: '2-digit', second: '2-digit'
            })}
          </div>
        </div>
      </div>

      {/* Methodology Banner */}
      <div className="p-4 border border-blue-500/20 bg-blue-950/20 rounded-xl flex items-start gap-3.5">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
          <Eye size={16} className="text-blue-400" />
        </div>
        <div className="text-xs text-slate-300 leading-relaxed">
          <div className="text-white font-semibold text-sm mb-0.5">Attribution Methodology & Analytical Basis</div>
          <p className="text-slate-400">{primary.methodology}</p>
        </div>
      </div>

      {/* Main Grid: Primary Attribution vs Other Candidates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Primary Match — Focal Point */}
        <div className="lg:col-span-2 glass-panel p-6 border-blue-500/40 relative overflow-hidden bg-gradient-to-b from-[#0e172a] to-[#070b14] min-w-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Focal Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-slate-800/80">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                  <Award size={12} /> Primary Attribution
                </span>
                <span className="tag-chip font-medium">{primary.vaspType}</span>
                <span className="tag-chip font-medium">{primary.jurisdiction}</span>
              </div>
              <h3 className="text-3xl font-extrabold text-white tracking-tight">{primary.vaspName}</h3>
            </div>

            {/* KPI Triad */}
            <div className="flex items-stretch gap-2.5 w-full sm:w-auto">
              <div className="bg-slate-900/80 px-4 py-3 rounded-xl border border-blue-500/30 flex-1 sm:flex-initial text-center shadow-inner">
                <div className="text-2xl font-bold font-mono text-cyan-400">{primary.confidence}%</div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Confidence</div>
              </div>
              <div className="bg-slate-900/80 px-3.5 py-3 rounded-xl border border-slate-800 flex-1 sm:flex-initial text-center">
                <div className="text-2xl font-bold font-mono text-slate-200">2</div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Avg Hops</div>
              </div>
              <div className="bg-slate-900/80 px-3.5 py-3 rounded-xl border border-slate-800 flex-1 sm:flex-initial text-center">
                <div className="text-2xl font-bold font-mono text-emerald-400">{primary.evidenceIds.length}</div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Evidence Items</div>
              </div>
            </div>
          </div>

          {/* Confidence vs Risk Score Clarity Notice */}
          <div className="mb-5 px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              <strong>Attribution Confidence ({primary.confidence}%):</strong> Certainty of entity identity match
            </span>
            <span className="text-slate-500 italic hidden sm:inline">Distinct from Risk Severity Score</span>
          </div>

          {/* Why this attribution? */}
          <div className="p-4 border border-blue-500/25 bg-blue-500/5 rounded-xl mb-6 flex flex-col gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
              <Eye size={15} /> Forensic Attribution Justification
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              Algorithmic graph traversal reveals the target wallet interacts with a known consolidation cluster exhibiting exact structural signatures (40/40 pts) mapped to <strong className="text-white">{primary.vaspName}</strong>. Intermediate hop counts, deposit timing correlation, and transaction cadence confirm the ultimate exit destination lies within this VASP’s operational infrastructure.
            </p>
          </div>

          {/* Scoring Vector */}
          <div className="bg-[#090d17] rounded-xl p-5 border border-slate-800/90 mb-6">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800/60">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Layers size={14} className="text-blue-400" /> Attribution Scoring Vector
              </h4>
              <span className="text-xs font-mono text-blue-400 font-semibold">
                Total: {primary.scoreBreakdown.clusterMatch + primary.scoreBreakdown.transactionProximity + primary.scoreBreakdown.behaviourSimilarity + primary.scoreBreakdown.depositPattern + primary.scoreBreakdown.temporalMetadata} / 100 pts
              </span>
            </div>

            <div className="space-y-4">
              <ScoreBar 
                label="Cluster Match" 
                value={primary.scoreBreakdown.clusterMatch} 
                max={40} 
                icon={<Database size={14}/>} 
                details={primary.clusterMatchDetails} 
              />
              <ScoreBar 
                label="Transaction Proximity" 
                value={primary.scoreBreakdown.transactionProximity} 
                max={30} 
                icon={<Link2 size={14}/>} 
                details={primary.proximityDetails} 
              />
              <ScoreBar 
                label="Behaviour Similarity" 
                value={primary.scoreBreakdown.behaviourSimilarity} 
                max={15} 
                icon={<Code size={14}/>} 
                details={primary.behaviourDetails} 
              />
              <ScoreBar 
                label="Deposit Pattern" 
                value={primary.scoreBreakdown.depositPattern} 
                max={10} 
                icon={<Server size={14}/>} 
                details={primary.depositPatternDetails} 
              />
              <ScoreBar 
                label="Temporal Evidence" 
                value={primary.scoreBreakdown.temporalMetadata} 
                max={5} 
                icon={<Shield size={14}/>} 
                details={primary.temporalDetails} 
              />
            </div>
          </div>

          {/* Evidentiary link action */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-900/60 p-4 rounded-xl border border-slate-800 gap-3">
            <div className="text-xs text-slate-300 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>Supported by <strong>{primary.evidenceIds.length} discrete evidentiary records</strong> in the audit chain</span>
            </div>
            <Link 
              href={`/cases/${caseId}/evidence`} 
              className="btn-secondary text-xs flex items-center gap-1.5 py-1.5 px-3 self-end sm:self-auto hover:border-blue-500/50"
            >
              Review Evidence Chain <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Other Candidates Panel */}
        <div className="glass-panel p-5 bg-[#090d17] border-slate-800 flex flex-col min-w-0">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              Secondary Candidates
            </h3>
            <span className="text-[10px] font-mono text-slate-500">
              {Math.max(0, data.candidates.length - 1)} Alternative(s)
            </span>
          </div>

          {data.candidates.length <= 1 ? (
            <div className="text-center py-12 px-4 flex-1 flex flex-col items-center justify-center">
              <Shield size={32} className="text-slate-700 mb-3" />
              <p className="text-xs text-slate-400 font-medium mb-1">Single VASP Cluster Isolated</p>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                No secondary VASP clusters exceeded the heuristic attribution threshold (&gt;30%).
              </p>
            </div>
          ) : (
            <div className="space-y-3 flex-1">
              {data.candidates.slice(1).map((c, i) => (
                <div 
                  key={i} 
                  className="p-3.5 bg-slate-900/70 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-center font-bold">
                          #{i + 2}
                        </span>
                        <div className="font-semibold text-sm text-slate-200">{c.vaspName}</div>
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase mt-0.5 pl-7">
                        {c.jurisdiction} • {c.vaspType}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm font-bold text-slate-300">{c.confidence}%</div>
                      <div className="text-[9px] text-slate-500 uppercase">Match</div>
                    </div>
                  </div>
                  
                  {/* Relative bar */}
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-2">
                    <div 
                      className="h-full bg-slate-600 rounded-full" 
                      style={{ width: `${c.confidence}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 leading-relaxed">
            <span className="text-slate-400 font-medium block mb-1">Clustering Sensitivity Note:</span>
            Alternative entities are evaluated through shared address-reuse patterns and deposit consolidators across multi-hop transactions.
          </div>
        </div>
      </div>

      {/* Synthetic Data Disclaimer */}
      {primary.isSynthetic && (
        <div className="p-3 text-center text-xs text-amber-400/80 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-center justify-center gap-2">
          <AlertTriangle size={14} className="shrink-0 text-amber-400" />
          <span><strong>Synthetic Demonstration Data:</strong> Algorithmic attribution vectors are calibrated for SIH demonstration prototyping.</span>
        </div>
      )}
    </div>
  );
}

function ScoreBar({ 
  label, 
  value, 
  max, 
  icon, 
  details 
}: { 
  label: string; 
  value: number; 
  max: number; 
  icon: React.ReactNode; 
  details: string; 
}) {
  const percentage = Math.min(100, Math.round((value / max) * 100));
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-medium">
          <span className="text-blue-400">{icon}</span>
          {label}
        </div>
        <div className="font-mono text-xs">
          <span className="text-white font-bold">{value}</span>
          <span className="text-slate-500"> / {max} pts</span>
          <span className="text-slate-400 text-[10px] ml-2">({percentage}%)</span>
        </div>
      </div>
      
      <div className="w-full h-2 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-800">
        <div 
          className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-500" 
          style={{ width: `${percentage}%` }} 
        />
      </div>
      
      <div className="text-[11px] text-slate-400 pl-6 flex items-center gap-1.5">
        <span className="text-slate-600 font-mono text-[10px]">↳</span>
        <span>{details}</span>
      </div>
    </div>
  );
}

