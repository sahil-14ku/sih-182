'use client';

import { useEffect, useState, useMemo } from 'react';
import { casesApi, DashboardStats, CaseSummary } from '@/lib/api';
import { 
  Activity, 
  ShieldAlert, 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  Shield, 
  Zap, 
  Radio, 
  PieChart, 
  Cpu, 
  Database,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Layers
} from 'lucide-react';
import Link from 'next/link';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  accent: string;
  sub: string;
}

function StatCard({ label, value, icon, accent, sub }: StatCardProps) {
  return (
    <div 
      className="relative rounded-xl p-5 overflow-hidden transition-all duration-200 group hover:translate-y-[-1px] flex flex-col justify-between h-full min-h-[145px]"
      style={{ 
        background: 'linear-gradient(180deg, #0d1424 0%, #080d19 100%)',
        border: '1px solid #17243c',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)'
      }}
    >
      {/* Top accent line */}
      <div 
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ 
          background: `linear-gradient(90deg, ${accent}, transparent)`,
        }}
      />
      
      {/* Ambient glow in corner */}
      <div 
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-15 pointer-events-none group-hover:opacity-25 transition-opacity"
        style={{ background: accent }}
      />

      <div className="flex items-start justify-between mb-3 relative z-10">
        <div 
          className="w-9 h-9 rounded-md flex items-center justify-center transition-transform group-hover:scale-105"
          style={{ 
            background: `${accent}15`, 
            border: `1px solid ${accent}35`,
            color: accent 
          }}
        >
          {icon}
        </div>
        <span className="text-[10px] font-mono font-semibold tracking-wider text-slate-500 uppercase px-2 py-0.5 rounded bg-black/30 border border-slate-800">
          METRIC
        </span>
      </div>

      <div className="relative z-10">
        <div className="text-3xl font-extrabold font-mono text-white mb-1 tracking-tight">
          {value}
        </div>
        <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-mono mb-1">
          {label}
        </div>
        <div className="text-[11px] text-slate-500 leading-tight">
          {sub}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      casesApi.dashboardStats(),
      casesApi.list()
    ]).then(([statsRes, casesRes]) => {
      setStats(statsRes.data);
      setCases(casesRes.data);
      setLoading(false);
    }).catch(console.error);
  }, []);

  // Compute Risk Distribution strictly from real existing cases
  const riskDistribution = useMemo(() => {
    if (!cases.length) return { critical: 0, high: 0, medium: 0, low: 0, total: 0 };
    const counts = { critical: 0, high: 0, medium: 0, low: 0, total: cases.length };
    cases.forEach(c => {
      const score = c.riskScore ?? 0;
      if (score >= 80) counts.critical += 1;
      else if (score >= 60) counts.high += 1;
      else if (score >= 40) counts.medium += 1;
      else counts.low += 1;
    });
    return counts;
  }, [cases]);

  // Compute VASP Attribution distribution strictly from real existing cases
  const vaspDistribution = useMemo(() => {
    if (!cases.length) return [];
    const counts: Record<string, number> = {};
    cases.forEach(c => {
      const vasp = c.likelyVasp?.trim() || 'Unattributed';
      counts[vasp] = (counts[vasp] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / cases.length) * 100)
      }))
      .sort((a, b) => b.count - a.count);
  }, [cases]);

  // Compute Blockchain distribution strictly from real existing cases
  const blockchainDistribution = useMemo(() => {
    if (!cases.length) return [];
    const counts: Record<string, number> = {};
    cases.forEach(c => {
      const chain = c.blockchain?.toUpperCase() || 'ETH';
      counts[chain] = (counts[chain] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([chain, count]) => ({ chain, count }))
      .sort((a, b) => b.count - a.count);
  }, [cases]);

  // Recent 4 investigations sorted by createdAt descending
  const recentCases = useMemo(() => {
    return [...cases]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);
  }, [cases]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="skeleton h-4 w-48 mb-2 rounded" />
            <div className="skeleton h-8 w-64 mb-1 rounded" />
            <div className="skeleton h-4 w-56 rounded" />
          </div>
          <div className="skeleton h-9 w-44 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton h-32 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          <div className="xl:col-span-8 skeleton h-80 rounded-lg" />
          <div className="xl:col-span-4 skeleton h-80 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in text-slate-200">
      
      {/* ── 1. COMMAND CENTER HEADER ───────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-[#152033]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Shield size={14} className="text-cyan-400" />
            <span className="text-[10px] text-cyan-400/90 uppercase tracking-widest font-mono font-bold">
              VASPTrace Intelligence Platform
            </span>
            <span className="text-slate-600 text-xs">•</span>
            <span className="text-[10px] text-slate-400 font-mono">
              ALPHA-SOC FORENSICS
            </span>
          </div>

          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            COMMAND CENTER
          </h1>

          <p className="text-slate-400 text-xs font-mono mt-1 flex items-center gap-2">
            <span>Operational intelligence overview</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-500">
              {new Date().toLocaleDateString('en-GB', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Subtle System Operational Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#091322] border border-[#162740] shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-mono font-semibold text-emerald-400 uppercase tracking-wider">
              SYSTEM OPERATIONAL
            </span>
          </div>

          {/* New Investigation Button */}
          <Link 
            href="/cases/new" 
            className="btn-primary !px-4 !py-2 shadow-lg shadow-blue-500/20 text-xs font-semibold flex items-center gap-2"
          >
            <Zap size={14} className="fill-current text-white" />
            <span>+ New Investigation</span>
          </Link>
        </div>
      </div>

      {/* ── 2. KPI SECTION ────────────────────────────────────────── */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            label="Active Cases"
            value={stats.activeInvestigations}
            icon={<Clock size={18} />}
            accent="#3b82f6"
            sub="Ongoing intelligence operations"
          />
          <StatCard
            label="High Risk Wallets"
            value={stats.highRiskWallets}
            icon={<ShieldAlert size={18} />}
            accent="#f97316"
            sub="Addresses scoring ≥ 60 / 100"
          />
          <StatCard
            label="VASP Matches"
            value={stats.vaspMatches}
            icon={<Activity size={18} />}
            accent="#ef4444"
            sub="Attributed exchange entities"
          />
          <StatCard
            label="Completed Cases"
            value={stats.completedCases}
            icon={<CheckCircle size={18} />}
            accent="#10b981"
            sub="Finalized forensic dossiers"
          />
        </div>
      )}

      {/* ── 3 & 4 & 5. TWO-COLUMN SPLIT ─────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.85fr)] gap-6 mb-8">
        
        {/* LEFT COLUMN: Investigation Priority Queue */}
        <div className="flex flex-col min-w-0">
          <div 
            className="rounded-xl overflow-hidden flex-1 flex flex-col min-w-0"
            style={{
              background: '#090e1a',
              border: '1px solid #162238',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)'
            }}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-[#162238] flex justify-between items-center bg-[#070b15]">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Investigation Priority Queue
                </h2>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded border border-slate-700">
                  {cases.length} Records
                </span>
              </div>
              <Link 
                href="/cases" 
                className="text-cyan-400 hover:text-cyan-300 text-xs font-mono font-medium flex items-center gap-1.5 transition-colors"
              >
                <span>View All Cases</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            {/* Table — wrapped for overflow-x */}
            <div className="overflow-x-auto flex-1 min-w-0">
              <table className="w-full border-separate border-spacing-0">
                <thead>
                  <tr className="bg-[#060a14] border-b border-[#152033] text-left">
                    <th className="py-3 px-4 font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      CASE
                    </th>
                    <th className="py-3 px-4 font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      TARGET WALLET
                    </th>
                    <th className="py-3 px-4 font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      RISK
                    </th>
                    <th className="py-3 px-4 font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      VASP
                    </th>
                    <th className="py-3 px-4 font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      CONFIDENCE
                    </th>
                    <th className="py-3 px-4 font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      STATUS
                    </th>
                    <th className="py-3 px-4 font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#131d2e]">
                  {cases.slice(0, 6).map((c) => {
                    const score = c.riskScore ?? 0;
                    const isCritical = score >= 80;
                    const isHigh = score >= 60 && score < 80;
                    const isMedium = score >= 40 && score < 60;

                    const riskLabel = isCritical ? 'CRITICAL' : isHigh ? 'HIGH' : isMedium ? 'MEDIUM' : 'LOW';
                    const riskBadgeStyle = isCritical
                      ? 'bg-red-500/10 text-red-400 border-red-500/30'
                      : isHigh
                      ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                      : isMedium
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';

                    return (
                      <tr 
                        key={c.caseId}
                        className={`transition-colors hover:bg-cyan-500/[0.03] group ${
                          isCritical ? 'border-l-2 border-l-red-500/80 bg-red-500/[0.015]' : ''
                        }`}
                      >
                        {/* CASE column */}
                        <td className="py-3.5 px-4 border-b border-[#131d2e]">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-200 text-xs truncate max-w-[180px]" title={c.title}>
                              {c.title || c.caseId}
                            </span>
                            <span className="font-mono text-[10px] text-slate-500">
                              {c.caseId}
                            </span>
                          </div>
                        </td>

                        {/* TARGET WALLET column */}
                        <td className="py-3.5 px-4 border-b border-[#131d2e]">
                          <div className="flex flex-col gap-0.5">
                            <span 
                              className="wallet-address text-xs text-cyan-400 font-medium"
                              title={c.suspectWallet}
                            >
                              {c.suspectWallet 
                                ? `${c.suspectWallet.slice(0, 6)}...${c.suspectWallet.slice(-4)}`
                                : '—'}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#101a2d] text-slate-400 border border-slate-800">
                                {c.blockchain || 'ETH'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* RISK column */}
                        <td className="py-3.5 px-4 border-b border-[#131d2e]">
                          {c.riskScore !== undefined ? (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border ${riskBadgeStyle}`}>
                              <span>{riskLabel}</span>
                              <span className="opacity-80">({c.riskScore})</span>
                            </span>
                          ) : (
                            <span className="text-slate-600 text-xs font-mono">—</span>
                          )}
                        </td>

                        {/* VASP column */}
                        <td className="py-3.5 px-4 border-b border-[#131d2e]">
                          <span className="text-xs font-bold text-slate-200 tracking-tight">
                            {c.likelyVasp || 'Unattributed'}
                          </span>
                        </td>

                        {/* CONFIDENCE column */}
                        <td className="py-3.5 px-4 border-b border-[#131d2e]">
                          {c.vaspConfidence ? (
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                                <div 
                                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500" 
                                  style={{ width: `${c.vaspConfidence}%` }} 
                                />
                              </div>
                              <span className="text-[11px] font-mono font-semibold text-slate-300">
                                {c.vaspConfidence}%
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-600 text-xs font-mono">—</span>
                          )}
                        </td>

                        {/* STATUS column */}
                        <td className="py-3.5 px-4 border-b border-[#131d2e]">
                          <div className="flex items-center gap-1.5">
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              c.status === 'completed' 
                                ? 'bg-emerald-400' 
                                : c.status === 'analyzing' || c.status === 'pending'
                                ? 'bg-amber-400 animate-pulse'
                                : 'bg-blue-400'
                            }`} />
                            <span className="font-mono text-[10px] uppercase font-semibold text-slate-300 tracking-wider">
                              {c.status}
                            </span>
                          </div>
                        </td>

                        {/* ACTION column */}
                        <td className="py-3.5 px-4 text-right border-b border-[#131d2e]">
                          <Link 
                            href={`/cases/${c.caseId}`}
                            className="inline-flex items-center gap-1 text-xs font-mono font-medium text-cyan-400 hover:text-cyan-300 transition-colors group-hover:translate-x-0.5"
                          >
                            <span>Open Investigation</span>
                            <ArrowRight size={11} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {cases.length === 0 && (
                <div className="py-16 text-center">
                  <Shield size={32} className="text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm font-medium">No active investigations logged.</p>
                  <Link href="/cases/new" className="btn-primary inline-flex mt-4 text-xs font-semibold">
                    <Zap size={13} /> Initialize First Case
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Visual Intelligence Panels */}
        <div className="flex flex-col gap-6 min-w-0">
          
          {/* PANEL 1: Risk Distribution (Calculated from real data) */}
          <div 
            className="rounded-xl p-6"
            style={{
              background: '#090e1a',
              border: '1px solid #162238',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)'
            }}
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#162238]">
              <div className="flex items-center gap-2">
                <PieChart size={15} className="text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Risk Distribution
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {cases.length} Evaluated
              </span>
            </div>

            <div className="space-y-3.5">
              {/* Critical */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-mono text-[11px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    Critical
                  </span>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="font-bold text-white">{riskDistribution.critical}</span>
                    <span className="text-slate-500">
                      ({riskDistribution.total ? Math.round((riskDistribution.critical / riskDistribution.total) * 100) : 0}%)
                    </span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-[#111a2c] overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-red-500 transition-all duration-500"
                    style={{ 
                      width: `${riskDistribution.total ? (riskDistribution.critical / riskDistribution.total) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>

              {/* High */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-mono text-[11px] font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    High
                  </span>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="font-bold text-white">{riskDistribution.high}</span>
                    <span className="text-slate-500">
                      ({riskDistribution.total ? Math.round((riskDistribution.high / riskDistribution.total) * 100) : 0}%)
                    </span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-[#111a2c] overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-orange-500 transition-all duration-500"
                    style={{ 
                      width: `${riskDistribution.total ? (riskDistribution.high / riskDistribution.total) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>

              {/* Medium */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-mono text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Medium
                  </span>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="font-bold text-white">{riskDistribution.medium}</span>
                    <span className="text-slate-500">
                      ({riskDistribution.total ? Math.round((riskDistribution.medium / riskDistribution.total) * 100) : 0}%)
                    </span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-[#111a2c] overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-amber-500 transition-all duration-500"
                    style={{ 
                      width: `${riskDistribution.total ? (riskDistribution.medium / riskDistribution.total) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>

              {/* Low */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-mono text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Low
                  </span>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="font-bold text-white">{riskDistribution.low}</span>
                    <span className="text-slate-500">
                      ({riskDistribution.total ? Math.round((riskDistribution.low / riskDistribution.total) * 100) : 0}%)
                    </span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-[#111a2c] overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ 
                      width: `${riskDistribution.total ? (riskDistribution.low / riskDistribution.total) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Bottom summary bar */}
            {stats && (
              <div className="mt-4 pt-3 border-t border-[#162238] flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Avg Risk Score:</span>
                <span className="font-bold text-cyan-400">{stats.avgRiskScore} / 100</span>
              </div>
            )}
          </div>

          {/* PANEL 2: VASP Attribution (Calculated from real data) */}
          <div 
            className="rounded-xl p-6"
            style={{
              background: '#090e1a',
              border: '1px solid #162238',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)'
            }}
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#162238]">
              <div className="flex items-center gap-2">
                <Layers size={15} className="text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  VASP Attribution
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Entity Share
              </span>
            </div>

            <div className="space-y-3">
              {vaspDistribution.slice(0, 4).map((item) => (
                <div key={item.name}>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-semibold text-slate-200 truncate max-w-[160px]">
                      {item.name}
                    </span>
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <span className="font-bold text-cyan-400">{item.count}</span>
                      <span className="text-slate-500">({item.percentage}%)</span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#111a2c] overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-500" 
                      style={{ width: `${item.percentage}%` }} 
                    />
                  </div>
                </div>
              ))}

              {vaspDistribution.length === 0 && (
                <div className="py-4 text-center text-slate-500 text-xs font-mono">
                  No attributed VASPs yet.
                </div>
              )}
            </div>

            {/* Bottom summary bar */}
            {stats && (
              <div className="mt-4 pt-3 border-t border-[#162238] flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Avg Confidence:</span>
                <span className="font-bold text-cyan-400">{stats.avgVaspConfidence}%</span>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── 6. SECOND INTELLIGENCE ROW ─────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.85fr)] gap-6 mb-8">
        
        {/* RECENT INVESTIGATION ACTIVITY */}
        <div 
          className="rounded-xl p-6 min-w-0"
          style={{
            background: '#090e1a',
            border: '1px solid #162238',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)'
          }}
        >
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#162238]">
            <div className="flex items-center gap-2">
              <Radio size={15} className="text-cyan-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Recent Investigation Activity
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              Live Audit Trail
            </span>
          </div>

          <div className="space-y-3">
            {recentCases.map((c) => (
              <div 
                key={c.caseId}
                className="flex items-center justify-between p-2.5 rounded bg-[#070c17] border border-[#142033] hover:border-[#1d2d48] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-mono text-xs font-bold">
                    {c.blockchain ? c.blockchain.slice(0, 2).toUpperCase() : 'EV'}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-slate-200">
                        {c.caseId}
                      </span>
                      <span className="text-slate-600 text-[10px]">•</span>
                      <span className="text-[11px] text-slate-400 font-medium truncate max-w-[180px]">
                        {c.title}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-cyan-400/80">
                      {c.suspectWallet ? `${c.suspectWallet.slice(0, 10)}...${c.suspectWallet.slice(-6)}` : 'No wallet'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
                    c.status === 'completed'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {c.status}
                  </span>
                  <Link 
                    href={`/cases/${c.caseId}`}
                    className="p-1 rounded text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                    title="Open Case"
                  >
                    <ChevronRight size={15} />
                  </Link>
                </div>
              </div>
            ))}

            {recentCases.length === 0 && (
              <div className="py-6 text-center text-slate-500 text-xs font-mono">
                No recent activity records.
              </div>
            )}
          </div>
        </div>

        {/* SYSTEM INTELLIGENCE & COVERAGE */}
        <div 
          className="rounded-xl p-6 min-w-0"
          style={{
            background: '#090e1a',
            border: '1px solid #162238',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)'
          }}
        >
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#162238]">
            <div className="flex items-center gap-2">
              <Cpu size={15} className="text-cyan-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                System Intelligence
              </h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              OPERATIONAL
            </span>
          </div>

          <div className="space-y-4">
            {/* Blockchain Network Breakdown */}
            <div>
              <div className="text-[11px] font-mono text-slate-400 uppercase font-semibold mb-2 flex items-center justify-between">
                <span>Network Coverage</span>
                <span className="text-slate-500 font-normal">Active Ledgers</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {blockchainDistribution.map((item) => (
                  <div 
                    key={item.chain} 
                    className="p-2.5 rounded bg-[#070c17] border border-[#142033] text-center"
                  >
                    <div className="text-xs font-bold text-white font-mono">{item.chain}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {item.count} {item.count === 1 ? 'Case' : 'Cases'}
                    </div>
                  </div>
                ))}
                {blockchainDistribution.length === 0 && (
                  <div className="col-span-3 text-center py-2 text-slate-500 text-xs font-mono">
                    No active network data
                  </div>
                )}
              </div>
            </div>

            {/* Resolution Efficiency Ratio */}
            {stats && (
              <div className="p-3 rounded bg-[#070c17] border border-[#142033] flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[11px] font-mono text-slate-400 font-semibold uppercase">
                    Resolution Rate
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Completed vs Total Cases
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold font-mono text-cyan-400">
                    {stats.totalCases ? Math.round((stats.completedCases / stats.totalCases) * 100) : 0}%
                  </span>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {stats.completedCases} of {stats.totalCases}
                  </div>
                </div>
              </div>
            )}

            {/* High-Risk Ratio */}
            {stats && (
              <div className="p-3 rounded bg-[#070c17] border border-[#142033] flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[11px] font-mono text-slate-400 font-semibold uppercase">
                    High Risk Ratio
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Flagged Wallets (Score ≥ 60)
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold font-mono text-orange-400">
                    {stats.highRiskWallets}
                  </span>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Wallets flagged
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
