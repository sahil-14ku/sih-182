'use client';

import { usePathname, useParams } from 'next/navigation';
import Link from 'next/link';
import { LayoutTemplate, GitFork, Target, FileText, AlertTriangle, MessageSquare, ShieldCheck } from 'lucide-react';

export default function CaseLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const caseId = params.id as string;

  if (pathname.includes('/analyze')) {
    return <>{children}</>;
  }

  const tabs = [
    { name: 'Overview', path: `/cases/${caseId}`, icon: <LayoutTemplate size={14} /> },
    { name: 'Fund Flow', path: `/cases/${caseId}/graph`, icon: <GitFork size={14} /> },
    { name: 'Attribution', path: `/cases/${caseId}/attribution`, icon: <Target size={14} /> },
    { name: 'Evidence', path: `/cases/${caseId}/evidence`, icon: <ShieldCheck size={14} /> },
    { name: 'Risk', path: `/cases/${caseId}/risk`, icon: <AlertTriangle size={14} /> },
    { name: 'AI Copilot', path: `/cases/${caseId}/copilot`, icon: <MessageSquare size={14} /> },
    { name: 'Report', path: `/cases/${caseId}/report`, icon: <FileText size={14} /> },
  ];

  return (
    <div className="flex flex-col h-full min-w-0 overflow-x-hidden">
      {/* Workspace Header */}
      <div className="scan-header flex-shrink-0">
        <div className="scan-header-inner">
          <div className="flex items-center gap-4 mb-3">
            <Link href="/cases" className="text-slate-600 hover:text-slate-400 text-xs font-mono transition-colors shrink-0">
              ← Cases
            </Link>
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-700/50 text-slate-300 px-2.5 py-1 rounded text-xs font-mono shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
                {caseId}
              </div>
              <h1 className="text-sm font-semibold text-slate-300 uppercase tracking-widest truncate">
                Investigation Workspace
              </h1>
            </div>
          </div>

          {/* Tab Bar */}
          <div className="workspace-tab-bar">
            {tabs.map(tab => {
              const isActive = pathname === tab.path;
              return (
                <Link
                  key={tab.path}
                  href={tab.path}
                  className={`workspace-tab ${isActive ? 'active' : ''}`}
                >
                  {tab.icon}
                  {tab.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content — scrollable, overflow-x hidden */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="page-container">
          {children}
        </div>
      </div>
    </div>
  );
}
