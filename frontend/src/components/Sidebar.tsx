'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Shield, 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  Activity, 
  Server, 
  AlertTriangle, 
  Cpu, 
  Radio, 
  Lock,
  ChevronRight,
  Terminal
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Command Center', path: '/', icon: <LayoutDashboard size={16} /> },
    { name: 'Investigations', path: '/cases', icon: <Briefcase size={16} /> },
    { name: 'Reports', path: '/reports', icon: <FileText size={16} /> },
    { name: 'Audit Logs', path: '/audit-logs', icon: <Activity size={16} /> },
    { name: 'System Status', path: '/status', icon: <Server size={16} /> },
  ];

  return (
    <aside className="w-[260px] min-w-[260px] max-w-[260px] flex-shrink-0 h-screen sticky top-0 bg-[#070c18] border-r border-[#151f32] flex flex-col justify-between select-none z-30 shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
      {/* Top Header & Navigation */}
      <div className="flex flex-col">
        {/* Branding Logo Area */}
        <div className="p-5 border-b border-[#141f33] bg-[#090f1e]/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              <Shield size={18} className="text-cyan-400" />
            </div>
            <div>
              <div className="text-base font-black text-white tracking-wider font-mono flex items-center gap-1.5">
                VASPTrace
              </div>
              <div className="text-[9px] text-cyan-400/80 uppercase font-mono tracking-widest font-semibold">
                Intelligence Platform
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span className="text-[8px] font-mono text-emerald-400 uppercase font-bold mt-1">LIVE</span>
          </div>
        </div>

        {/* Operational Context Strip */}
        <div className="px-5 py-2.5 bg-[#050914] border-b border-[#121c2e] flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
          <Terminal size={11} className="text-slate-500" />
          NODE: <span className="text-slate-200 font-bold">ALPHA-SOC</span>
        </div>

        {/* Main Navigation List */}
        <nav className="p-3 space-y-1 mt-2">
          <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">
            Tactical Operations
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive 
                    ? 'bg-[#0e172a] text-white border-l-2 border-l-cyan-400 border border-[#1e2f4d] shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#0b1322] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                    {item.icon}
                  </span>
                  <span className="tracking-wide uppercase text-[11px] font-medium font-sans">
                    {item.name}
                  </span>
                </div>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Structured Bottom Area */}
      <div className="p-3 border-t border-[#141f33] bg-[#060a14] space-y-2.5">
        {/* Real-time System Indicators */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#090f1d] p-2 rounded-lg border border-[#16233b] flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 font-semibold">
              <Radio size={11} className="text-emerald-400" />
              ENGINE
            </div>
            <span className="text-[9px] font-mono font-bold text-emerald-400">ONLINE</span>
          </div>

          <div className="bg-[#090f1d] p-2 rounded-lg border border-[#16233b] flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 font-semibold">
              <Cpu size={11} className="text-cyan-400" />
              AI COPILOT
            </div>
            <span className="text-[9px] font-mono font-bold text-cyan-400">READY</span>
          </div>
        </div>

        {/* Demo Data Disclaimer */}
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2 text-amber-300/90">
          <AlertTriangle size={13} className="text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[10px] leading-tight">
            <strong>Synthetic Intelligence:</strong> Demonstration prototype data. Not certified for statutory filings.
          </p>
        </div>

        {/* Investigator Identity Card */}
        <div className="p-2.5 rounded-xl bg-[#090f1d] border border-[#16233b] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-mono text-xs font-bold text-cyan-400 shadow-inner">
              INV
            </div>
            <div>
              <div className="text-xs font-bold text-white leading-tight">Demo Investigator</div>
              <div className="text-[10px] font-mono text-slate-400 leading-tight">Badge: INV-001 // SEC-L3</div>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>
    </aside>
  );
}

