'use client';

import React, { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';
import { authApi } from '@/lib/api';

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const done = () => setLoading(false);

    // Hard timeout — never block the app for more than 3s
    const timeout = setTimeout(done, 3000);

    const initAuth = async () => {
      const token = localStorage.getItem('vasptrace_token');
      if (!token) {
        try {
          const res = await authApi.demoLogin();
          if (res.success && res.data.token) {
            localStorage.setItem('vasptrace_token', res.data.token);
          }
        } catch {
          // Backend may be starting up — continue in demo mode
        }
      }
      clearTimeout(timeout);
      done();
    };

    initAuth();
    return () => clearTimeout(timeout);
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-6 bg-[#080c14]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Shield size={22} className="text-white" />
          </div>
          <div>
            <div className="text-lg font-bold text-white tracking-wide">VASPTrace</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest">Intelligence Platform</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse [animation-delay:150ms]" />
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse [animation-delay:300ms]" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
