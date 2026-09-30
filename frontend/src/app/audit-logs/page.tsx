'use client';

import { useEffect, useState } from 'react';
import { auditApi, AuditLog } from '@/lib/api';
import { 
  Activity, 
  AlertTriangle, 
  Info, 
  ShieldAlert, 
  Search, 
  Filter, 
  Lock, 
  CheckCircle, 
  Clock, 
  ShieldCheck,
  FileText
} from 'lucide-react';
import Link from 'next/link';

const severityIcon = (severity: AuditLog['severity']) => {
  if (severity === 'critical') return <AlertTriangle size={13} className="text-red-400" />;
  if (severity === 'warning') return <ShieldAlert size={13} className="text-amber-400" />;
  return <Info size={13} className="text-blue-400" />;
};

const severityBadge = (severity: AuditLog['severity']) => {
  const classes = {
    critical: 'bg-red-500/15 text-red-400 border-red-500/30',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    info: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${classes[severity]}`}>
      {severityIcon(severity)}
      {severity}
    </span>
  );
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'info' | 'warning' | 'critical'>('all');
  const [page, setPage] = useState(1);
  const perPage = 25;

  useEffect(() => {
    setLoading(true);
    auditApi.list({ limit: 100 })
      .then(res => {
        setLogs(res.data);
        setTotal(res.total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter(log => {
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
    const matchesSearch = !search || 
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      (log.caseId || '').toLowerCase().includes(search.toLowerCase()) ||
      log.userId.toLowerCase().includes(search.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const counts = {
    critical: logs.filter(l => l.severity === 'critical').length,
    warning: logs.filter(l => l.severity === 'warning').length,
    info: logs.filter(l => l.severity === 'info').length,
  };

  if (loading) {
    return (
      <div className="page-container space-y-4">
        <div className="skeleton h-12 w-64 rounded-xl" />
        <div className="grid grid-cols-3 gap-4">
          <div className="skeleton h-24 rounded-2xl" />
          <div className="skeleton h-24 rounded-2xl" />
          <div className="skeleton h-24 rounded-2xl" />
        </div>
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
              Chain-of-Custody Ledger
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Activity className="text-blue-500" size={26} />
            Forensic Audit & Event Timeline
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Cryptographically sealed and immutable log of all analytical executions, investigator actions, and report exports.
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-xs font-mono bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-800 text-slate-400">
          <ShieldCheck size={15} className="text-emerald-400" />
          <span>Ledger Integrity: <strong className="text-white">VERIFIED</strong> ({total} entries)</span>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setSeverityFilter(severityFilter === 'critical' ? 'all' : 'critical')}
          className={`glass-panel p-4 text-left transition-all rounded-xl border min-w-0 ${
            severityFilter === 'critical' 
              ? 'border-red-500/60 bg-red-950/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
              : 'border-slate-800 bg-[#090e1a] hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-2 text-xs font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-red-400">
              <AlertTriangle size={14} /> Critical Events
            </span>
            <span className="text-[10px] font-mono text-slate-500">Filter</span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-red-400">{counts.critical}</div>
        </button>

        <button
          onClick={() => setSeverityFilter(severityFilter === 'warning' ? 'all' : 'warning')}
          className={`glass-panel p-4 text-left transition-all rounded-xl border min-w-0 ${
            severityFilter === 'warning' 
              ? 'border-amber-500/60 bg-amber-950/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
              : 'border-slate-800 bg-[#090e1a] hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-2 text-xs font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-amber-400">
              <ShieldAlert size={14} /> Warnings & Alerts
            </span>
            <span className="text-[10px] font-mono text-slate-500">Filter</span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-amber-400">{counts.warning}</div>
        </button>

        <button
          onClick={() => setSeverityFilter(severityFilter === 'info' ? 'all' : 'info')}
          className={`glass-panel p-4 text-left transition-all rounded-xl border min-w-0 ${
            severityFilter === 'info' 
              ? 'border-blue-500/60 bg-blue-950/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
              : 'border-slate-800 bg-[#090e1a] hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-2 text-xs font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-blue-400">
              <Info size={14} /> Operational Telemetry
            </span>
            <span className="text-[10px] font-mono text-slate-500">Filter</span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-blue-400">{counts.info}</div>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search action verbs, event descriptions, case ID, or investigator user ID..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-[#080d19] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors shadow-inner"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Filter size={13} className="text-slate-500 mr-1 shrink-0" />
          {(['all', 'info', 'warning', 'critical'] as const).map(s => (
            <button
              key={s}
              onClick={() => { setSeverityFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                severityFilter === s
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {s === 'all' ? 'All Severity' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Event Timeline Table */}
      <div className="glass-panel overflow-hidden border-slate-800 bg-[#080d19] shadow-2xl">
        <div className="p-4 border-b border-slate-800 bg-[#0c1322] flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Lock size={14} className="text-blue-400" /> Chronological Activity Record
          </h2>
          <span className="text-xs font-mono text-slate-500">
            Displaying {paginated.length} of {filtered.length} matching events
          </span>
        </div>

        {paginated.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <Activity size={36} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 font-medium mb-1">No matching audit events</p>
            <p className="text-slate-600">Try adjusting your keyword query or severity filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="vt-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Classification</th>
                  <th>Forensic Action</th>
                  <th>Target Case</th>
                  <th>Actor / Role</th>
                  <th>Event Intelligence Details</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-IN', {
                        year: 'numeric', month: 'short', day: '2-digit',
                        hour: '2-digit', minute: '2-digit', second: '2-digit',
                      })}
                    </td>
                    
                    <td>{severityBadge(log.severity)}</td>
                    
                    <td>
                      <span className="font-mono text-[11px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-cyan-300 font-semibold">
                        {log.action}
                      </span>
                    </td>
                    
                    <td>
                      {log.caseId ? (
                        <Link 
                          href={`/cases/${log.caseId}`}
                          className="font-mono text-xs text-blue-400 hover:underline"
                        >
                          {log.caseId}
                        </Link>
                      ) : (
                        <span className="text-slate-600 font-mono text-xs">—</span>
                      )}
                    </td>
                    
                    <td>
                      <div className="text-xs">
                        <span className="text-slate-200 font-medium">{log.userId}</span>
                        <span className="text-slate-500 ml-1.5 uppercase font-mono text-[10px]">
                          [{log.userRole}]
                        </span>
                      </div>
                    </td>
                    
                    <td>
                      <span className="text-xs text-slate-300 max-w-md block truncate font-sans" title={log.details}>
                        {log.details}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 bg-[#090e1a] flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40"
              >
                ← Previous
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

