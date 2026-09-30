'use client';

import { useEffect, useState } from 'react';
import { 
  Server, 
  CheckCircle, 
  AlertTriangle, 
  Database, 
  Activity, 
  Cpu, 
  Shield, 
  RefreshCw, 
  CheckCircle2,
  XCircle,
  Clock,
  Radio
} from 'lucide-react';

interface HealthData {
  status: string;
  timestamp: string;
  database: {
    connected: boolean;
    mode: string;
    readyState: string;
  };
  version: string;
  service: string;
}

interface EndpointStatus {
  name: string;
  path: string;
  status: 'ok' | 'error' | 'checking';
  latency?: number;
}

export default function SystemStatusPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [endpoints, setEndpoints] = useState<EndpointStatus[]>([
    { name: 'Cases API', path: '/api/cases', status: 'checking' },
    { name: 'Dashboard Stats', path: '/api/cases/dashboard/stats', status: 'checking' },
    { name: 'Audit Logs', path: '/api/audit-logs', status: 'checking' },
    { name: 'Attribution Engine', path: '/api/cases/CASE-001/attribution', status: 'checking' },
    { name: 'Risk Engine', path: '/api/cases/CASE-001/risk', status: 'checking' },
    { name: 'Wallet Intelligence', path: '/api/wallet/0x742d35Cc6634C0532925a3b8D4C9F2A4F15B7c8d', status: 'checking' },
    { name: 'Copilot AI', path: '/api/copilot/query', status: 'checking' },
    { name: 'Reports Engine', path: '/api/reports/CASE-001', status: 'checking' },
  ]);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const API_BASE = 'http://localhost:4000';

  const checkHealth = async () => {
    setLoading(true);
    try {
      const start = Date.now();
      const res = await fetch(`${API_BASE}/health`);
      const data = await res.json();
      setHealth({ ...data, latency: Date.now() - start });
    } catch {
      setHealth(null);
    } finally {
      setLoading(false);
    }

    // Check each endpoint
    const checks = await Promise.allSettled(
      endpoints.map(async (ep) => {
        const start = Date.now();
        try {
          const method = ep.path.includes('copilot') || ep.path.includes('reports') ? 'POST' : 'GET';
          const options: RequestInit = method === 'POST'
            ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ caseId: 'CASE-001', query: 'ping' }) }
            : {};
          const res = await fetch(`${API_BASE}${ep.path}`, options);
          return { path: ep.path, status: res.ok ? 'ok' : 'error', latency: Date.now() - start } as const;
        } catch {
          return { path: ep.path, status: 'error', latency: Date.now() - start } as const;
        }
      })
    );

    setEndpoints(prev => prev.map(ep => {
      const result = checks.find(c => c.status === 'fulfilled' && (c.value as any).path === ep.path);
      if (result && result.status === 'fulfilled') {
        const val = result.value as { path: string; status: 'ok' | 'error'; latency: number };
        return { ...ep, status: val.status, latency: val.latency };
      }
      return { ...ep, status: 'error' };
    }));
    setLastChecked(new Date());
  };

  useEffect(() => {
    checkHealth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const okCount = endpoints.filter(e => e.status === 'ok').length;
  const totalCount = endpoints.length;
  const allOk = okCount === totalCount;

  return (
    <div className="page-container-md animate-fade-in space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
              Telemetry Diagnostics
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Server className="text-blue-500" size={26} />
            System Health & Service Matrix
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Real-time ping telemetry across forensic ingestion pipeline, AI copilot inference, and DB clusters.
          </p>
        </div>

        <button
          onClick={checkHealth}
          disabled={loading}
          className="btn-secondary text-xs flex items-center gap-2 py-2 px-3.5 shadow-sm disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin text-blue-400' : ''} />
          {loading ? 'Polling Services...' : 'Refresh Matrix'}
        </button>
      </div>

      {/* Primary Status Banner */}
      <div className={`glass-panel p-5 border rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl ${
        loading ? 'border-slate-800 bg-[#080d19]' :
        health && allOk ? 'border-emerald-500/40 bg-emerald-950/15' : 'border-amber-500/40 bg-amber-950/15'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
            loading ? 'bg-slate-900 border-slate-800 text-slate-400' :
            health && allOk ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 
            'bg-amber-500/10 border-amber-500/30 text-amber-400'
          }`}>
            {loading ? (
              <Activity size={24} className="animate-spin text-slate-400" />
            ) : health && allOk ? (
              <CheckCircle2 size={24} className="text-emerald-400" />
            ) : (
              <AlertTriangle size={24} className="text-amber-400" />
            )}
          </div>
          
          <div>
            <h2 className="text-base font-bold text-white mb-0.5">
              {loading ? 'Polling Forensic Service Matrix...' :
               health && allOk ? 'All Operational Services Online' :
               health ? `${okCount}/${totalCount} Operational Services Online` :
               'Backend Forensic Service Unreachable'}
            </h2>
            <p className="text-xs text-slate-400">
              {health ? (
                <span>
                  Backend v{health.version} • Mode: <strong className={health.database.connected ? 'text-emerald-400' : 'text-amber-400'}>{health.database.mode.toUpperCase()}</strong> • ReadyState: {health.database.readyState}
                </span>
              ) : (
                'Unable to establish TCP handshake with backend on port 4000'
              )}
            </p>
          </div>
        </div>

        {lastChecked && (
          <div className="text-right text-[11px] font-mono text-slate-500 shrink-0">
            Last ping: <span className="text-slate-300">{lastChecked.toLocaleTimeString()}</span>
          </div>
        )}
      </div>

      {/* Triple Component Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Server Status */}
        <div className="glass-panel p-5 border-slate-800 bg-[#080d19]">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-4 pb-2 border-b border-slate-800">
            <span className="flex items-center gap-1.5 text-blue-400">
              <Server size={14} /> Backend Server
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          {health ? (
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Operational State</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> ONLINE
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Service Core</span>
                <span className="font-mono text-white text-[11px]">{health.service}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Version</span>
                <span className="font-mono text-cyan-400 text-[11px] font-bold">{health.version}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Target Port</span>
                <span className="font-mono text-slate-300 text-[11px]">TCP :4000</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-xs text-red-400">
              <AlertTriangle size={20} className="mx-auto mb-1.5" />
              Connection Timeout
            </div>
          )}
        </div>

        {/* Database Status */}
        <div className="glass-panel p-5 border-slate-800 bg-[#080d19]">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-4 pb-2 border-b border-slate-800">
            <span className="flex items-center gap-1.5 text-blue-400">
              <Database size={14} /> Intelligence Store
            </span>
            <span className={`w-2 h-2 rounded-full ${health?.database.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          </div>

          {health ? (
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Connection Mode</span>
                <span className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded border uppercase ${
                  health.database.mode === 'mongodb' 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}>
                  {health.database.mode}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Live Status</span>
                <span className={`font-medium ${health.database.connected ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {health.database.connected ? 'Active Session' : 'Memory Cache Fallback'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Connection State</span>
                <span className="font-mono text-slate-300 text-[11px]">{health.database.readyState}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Persistence</span>
                <span className="text-slate-300 text-[11px]">Synchronous write-through</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-xs text-slate-500">
              Database Unreachable
            </div>
          )}
        </div>

        {/* Intelligence Engines */}
        <div className="glass-panel p-5 border-slate-800 bg-[#080d19]">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-4 pb-2 border-b border-slate-800">
            <span className="flex items-center gap-1.5 text-blue-400">
              <Cpu size={14} /> Analytical Engines
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <div className="space-y-2.5 text-xs">
            {[
              { name: 'Attribution Engine', ok: endpoints.find(e => e.path.includes('attribution'))?.status === 'ok' },
              { name: 'Risk Scoring Engine', ok: endpoints.find(e => e.path.includes('risk'))?.status === 'ok' },
              { name: 'Copilot AI Inference', ok: endpoints.find(e => e.path.includes('copilot'))?.status === 'ok' },
              { name: 'STR/MLAT Report Engine', ok: endpoints.find(e => e.path.includes('reports'))?.status === 'ok' },
            ].map(engine => (
              <div key={engine.name} className="flex justify-between items-center">
                <span className="text-slate-300">{engine.name}</span>
                <span className={`text-[11px] font-semibold flex items-center gap-1.5 ${
                  engine.ok ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${engine.ok ? 'bg-emerald-400' : 'bg-red-400'}`} />
                  {engine.ok ? 'Ready' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* API Endpoint Grid */}
      <div className="glass-panel overflow-hidden border-slate-800 bg-[#080d19] shadow-2xl">
        <div className="p-4 border-b border-slate-800 bg-[#0c1322] flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Shield size={14} className="text-blue-400" /> Monitored API Gateway Endpoints
          </h2>
          <span className="text-xs font-mono text-cyan-400 font-semibold">
            {okCount} / {totalCount} Endpoints Healthy
          </span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {endpoints.map(ep => (
            <div key={ep.path} className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-800/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`status-dot ${ep.status === 'ok' ? 'online' : ep.status === 'checking' ? 'warning' : 'error'}`} />
                <div>
                  <span className="text-xs font-bold text-slate-200">{ep.name}</span>
                  <span className="ml-2.5 font-mono text-[11px] text-slate-400">{ep.path}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-auto">
                {ep.latency !== undefined && (
                  <span className={`font-mono text-xs font-semibold ${
                    ep.latency < 50 ? 'text-emerald-400' : ep.latency < 200 ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {ep.latency}ms
                  </span>
                )}
                
                <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                  ep.status === 'ok' 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                    : ep.status === 'checking' 
                    ? 'bg-slate-800 text-slate-400 border-slate-700' 
                    : 'bg-red-500/10 text-red-400 border-red-500/30'
                }`}>
                  {ep.status === 'ok' ? '200 OK' : ep.status === 'checking' ? 'POLLING' : 'ERROR'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

