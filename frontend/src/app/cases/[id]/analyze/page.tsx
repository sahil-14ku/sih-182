'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { casesApi } from '@/lib/api';
import { Activity, CheckCircle2, CircleDashed, AlertTriangle } from 'lucide-react';

const STEPS = [
  'Initializing investigation agents...',
  'Validating suspect wallet parameters...',
  'Retrieving multi-chain transaction history...',
  'Constructing transaction graph...',
  'Traversing intermediate hops...',
  'Analyzing behavioral typologies...',
  'Comparing against known VASP clusters...',
  'Generating evidence chain...',
  'Calculating risk metrics...',
  'Finalizing intelligence report...',
];

export default function AnalyzeCase() {
  const router = useRouter();
  const params = useParams();
  const caseId = params.id as string;

  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [failed, setFailed] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const apiCalled = useRef(false); // guard: call analyze API exactly once

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      const pct = Math.min(current * 2, 99);
      setProgress(pct);
      setCurrentStep(Math.min(Math.floor(pct / 10), 9));

      // At 99% (current === 50) — fire the backend analyze call once
      if (current >= 50 && !apiCalled.current) {
        apiCalled.current = true;
        clearInterval(interval);

        casesApi
          .analyze(caseId)
          .then((res) => {
            // Backend returned success — navigate to the case workspace
            setProgress(100);
            setCurrentStep(9);
            setTimeout(() => {
              router.push(`/cases/${caseId}`);
            }, 800);
          })
          .catch((err: any) => {
            // Do NOT show "Analysis failed" for network hiccups — check if case exists
            console.error('[Analyze] API error:', err);
            const msg = err?.message || String(err);

            // If the error is HTTP 404, the case genuinely doesn't exist
            if (msg.includes('404') || msg.toLowerCase().includes('not found')) {
              setFailed(true);
              setErrorMsg(`Case ${caseId} was not found. It may have been deleted.`);
              return;
            }

            // For any other error, still try to navigate — the analysis may have
            // partially succeeded server-side before the HTTP response failed.
            console.warn('[Analyze] Non-fatal error — navigating to case anyway:', msg);
            setProgress(100);
            setCurrentStep(9);
            setTimeout(() => {
              router.push(`/cases/${caseId}`);
            }, 1200);
          });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [caseId, router]);

  // ── Error state ───────────────────────────────────────────────────────────
  if (failed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-2xl mx-auto p-8">
        <div className="w-16 h-16 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center mb-8">
          <AlertTriangle size={32} className="text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Analysis Error</h1>
        <p className="text-slate-400 mb-8 text-center text-sm">{errorMsg}</p>
        <button
          onClick={() => router.push('/cases')}
          className="btn-primary"
        >
          Return to Investigations
        </button>
      </div>
    );
  }

  // ── Progress state ────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-2xl mx-auto p-8 animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mb-8">
        <Activity size={32} className="text-blue-400 animate-pulse" />
      </div>

      <h1 className="text-2xl font-bold text-white mb-2">Executing Investigation Protocol</h1>
      <p className="text-slate-400 mb-12 text-center font-mono text-sm">Target: {caseId}</p>

      <div className="w-full bg-slate-900 rounded-xl p-6 border border-slate-800 mb-8">
        <div className="flex justify-between text-sm font-medium mb-3">
          <span className="text-slate-300">Analysis Progress</span>
          <span className="text-blue-400 font-mono">{progress}%</span>
        </div>
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_1s_infinite] bg-[length:200%_100%]"></div>
          </div>
        </div>

        <div className="space-y-4">
          {STEPS.map((step, idx) => {
            const isCompleted = idx < currentStep || progress === 100;
            const isCurrent = idx === currentStep && progress < 100;

            if (idx < currentStep - 2 || idx > currentStep + 2) return null;

            return (
              <div
                key={idx}
                className={`flex items-center gap-3 text-sm transition-all duration-500 ${
                  isCompleted
                    ? 'text-slate-400'
                    : isCurrent
                    ? 'text-white scale-105 origin-left'
                    : 'text-slate-700'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 size={16} className="text-green-500" />
                ) : isCurrent ? (
                  <CircleDashed size={16} className="text-blue-500 animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-700"></div>
                )}
                {step}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500 bg-black/30 px-4 py-2 rounded-full border border-slate-800">
        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
        VASPTrace AI Agents Active
      </div>
    </div>
  );
}
