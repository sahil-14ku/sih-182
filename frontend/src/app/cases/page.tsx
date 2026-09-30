'use client';

import { useEffect, useState } from 'react';
import { casesApi, CaseSummary } from '@/lib/api';
import { Search, Filter, Briefcase, Plus, ArrowRight, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export default function Investigations() {
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'critical'>('all');

  useEffect(() => {
    casesApi.list().then(res => {
      setCases(res.data);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const filtered = cases.filter(c => {
    const matchesSearch = 
      c.caseId.toLowerCase().includes(search.toLowerCase()) || 
      c.suspectWallet.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.likelyVasp || '').toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    if (statusFilter === 'completed') return c.status === 'completed';
    if (statusFilter === 'pending') return c.status === 'pending';
    if (statusFilter === 'critical') return (c.riskScore || 0) >= 80;
    return true;
  });

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-xs font-mono uppercase tracking-widest text-blue-400 font-semibold">
              Forensic Docket
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Briefcase size={26} className="text-blue-500" />
            Active Blockchain Investigations
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Comprehensive repository of registered suspect targets, heuristic tracings, and VASP attributions.
          </p>
        </div>
        
        <Link href="/cases/new" className="btn-primary flex items-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.4)]">
          <Plus size={16} /> Initiate Investigation
        </Link>
      </div>

      {/* Main Container */}
      <div className="glass-panel overflow-hidden border-slate-800 bg-[#080d19] shadow-2xl">
        
        {/* Search & Filter Toolbar */}
        <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row gap-3 bg-[#0d1527]/70 justify-between items-stretch md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Search by Case ID, title, suspect wallet, or attributed VASP..." 
              className="vt-input pl-10 bg-slate-950/60 border-slate-800 w-full text-xs placeholder:text-slate-500 focus:border-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          {/* Quick Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <Filter size={14} className="text-slate-500 mr-1 shrink-0" />
            {(['all', 'completed', 'pending', 'critical'] as const).map((filterKey) => (
              <button
                key={filterKey}
                onClick={() => setStatusFilter(filterKey)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                  statusFilter === filterKey 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {filterKey === 'all' ? 'All Cases' : filterKey}
              </button>
            ))}
          </div>
        </div>
        
        {loading ? (
          <div className="p-8 space-y-4">
            <div className="skeleton h-10 w-full" />
            <div className="skeleton h-14 w-full" />
            <div className="skeleton h-14 w-full" />
            <div className="skeleton h-14 w-full" />
          </div>
        ) : (
          <div className="vt-table-wrap">
            <table className="vt-table">
              <thead>
                <tr>
                  <th className="w-1/4">Case Intelligence</th>
                  <th>Target Wallet Address</th>
                  <th>Network & Type</th>
                  <th>Risk Rating</th>
                  <th>Likely VASP</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => {
                  const riskLevel = (c.riskScore || 0) >= 80 ? 'critical' : (c.riskScore || 0) >= 60 ? 'high' : (c.riskScore || 0) >= 40 ? 'medium' : 'low';
                  
                  return (
                    <tr key={c.caseId} className="hover:bg-slate-800/40 transition-colors group">
                      <td>
                        <Link href={`/cases/${c.caseId}`} className="block">
                          <div className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">
                            {c.title}
                          </div>
                          <div className="font-mono text-[11px] text-blue-400/80 mt-0.5">
                            {c.caseId}
                          </div>
                        </Link>
                      </td>
                      
                      <td>
                        <div className="flex items-center gap-1.5">
                          <span className="wallet-addr block max-w-[170px] truncate" title={c.suspectWallet}>
                            {c.suspectWallet}
                          </span>
                        </div>
                      </td>
                      
                      <td>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="tag-chip font-mono">{c.blockchain}</span>
                          <span className="tag-chip capitalize">{c.type}</span>
                        </div>
                      </td>
                      
                      <td>
                        {c.riskScore !== undefined ? (
                          <span className={`risk-badge risk-${riskLevel}`}>
                            {riskLevel.toUpperCase()} ({c.riskScore})
                          </span>
                        ) : (
                          <span className="text-slate-500 text-xs font-mono">Analyzing...</span>
                        )}
                      </td>
                      
                      <td>
                        {c.likelyVasp ? (
                          <div>
                            <div className="text-sm font-semibold text-slate-200">{c.likelyVasp}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-cyan-400 rounded-full" 
                                  style={{ width: `${c.vaspConfidence || 0}%` }} 
                                />
                              </div>
                              <span className="text-[10px] font-mono text-cyan-400 font-bold">
                                {c.vaspConfidence}%
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-xs italic">Pending Match</span>
                        )}
                      </td>
                      
                      <td>
                        <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold">
                          <div className={`status-dot ${c.status === 'completed' ? 'online' : c.status === 'pending' ? 'warning' : 'error'}`}></div>
                          <span className={c.status === 'completed' ? 'text-emerald-400' : 'text-amber-400'}>
                            {c.status}
                          </span>
                        </div>
                      </td>

                      <td className="text-right">
                        <Link 
                          href={`/cases/${c.caseId}`}
                          className="btn-secondary text-xs py-1.5 px-3 inline-flex items-center gap-1 group-hover:border-blue-500/50"
                        >
                          Open <ArrowRight size={13} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {filtered.length === 0 && (
              <div className="p-12 text-center text-slate-500 text-sm">
                <Briefcase size={36} className="mx-auto mb-3 text-slate-700" />
                <p className="text-slate-400 font-medium mb-1">No investigations found</p>
                <p className="text-xs text-slate-600">No cases match the query &quot;{search}&quot; or the active filter.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

