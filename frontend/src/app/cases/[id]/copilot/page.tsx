'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { copilotApi, CopilotResponse } from '@/lib/api';
import { 
  MessageSquare, 
  Sparkles, 
  Send, 
  ShieldAlert, 
  Bot, 
  User, 
  Loader2,
  AlertTriangle,
  HelpCircle,
  FileSearch,
  CheckCircle2
} from 'lucide-react';

export default function CopilotPage() {
  const params = useParams();
  const caseId = params.id as string;
  
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<{type: 'user' | 'agent', text: string, data?: CopilotResponse}[]>([]);

  const suggestedQuestions = [
    "Why is this target wallet categorized under High/Critical risk?",
    "Explain the heuristic evidence leading to this VASP attribution.",
    "Which behavioral typologies and peel-chains were detected?",
    "Summarize key findings and next steps for statutory reporting."
  ];

  const handleAsk = async (q: string) => {
    if (!q.trim()) return;
    
    setHistory(prev => [...prev, { type: 'user', text: q }]);
    setQuery('');
    setLoading(true);
    
    try {
      const res = await copilotApi.query(caseId, q);
      setHistory(prev => [...prev, { type: 'agent', text: res.data.answer, data: res.data }]);
    } catch (err) {
      console.error(err);
      setHistory(prev => [...prev, { type: 'agent', text: 'Sorry, I encountered an error retrieving intelligence data from the inference service.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col border border-slate-800 rounded-2xl overflow-hidden bg-[#070b15] shadow-2xl animate-fade-in" style={{ height: 'calc(100vh - 280px)', minHeight: '540px' }}>
      {/* Top Copilot Bar */}
      <div className="bg-[#0b1222] px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.3)]">
            <Sparkles size={20} className="text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-white font-bold text-base">Forensic Intelligence Copilot</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                ASSISTIVE AI
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
              <span>Target Context: <strong className="text-slate-300 font-mono">{caseId}</strong></span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-400/90 font-medium">Non-Binding Forensic Advisory</span>
            </p>
          </div>
        </div>
        
        <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-semibold flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          Engine Online
        </div>
      </div>

      {/* Assistive Warning Banner */}
      <div className="bg-amber-500/10 px-6 py-2 border-b border-amber-500/20 flex items-center justify-between text-[11px] text-amber-300/90">
        <div className="flex items-center gap-2">
          <AlertTriangle size={13} className="text-amber-400 shrink-0" />
          <span>
            <strong>Statutory Notice:</strong> AI Copilot provides investigative insights. All conclusions require human-in-the-loop verification before legal or court submissions.
          </span>
        </div>
      </div>

      {/* Chat Conversation Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#060913]">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto py-8">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5">
              <Sparkles size={28} className="text-cyan-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1.5">How can I assist your investigation?</h3>
            <p className="text-slate-400 text-xs mb-8 leading-relaxed">
              I have ingested the live transaction graph, risk telemetry, clustering indicators, and evidence files for Case <strong className="text-slate-200">{caseId}</strong>.
            </p>

            <div className="w-full space-y-2.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left mb-1 flex items-center gap-1.5">
                <FileSearch size={12} className="text-blue-400" />
                Recommended Forensic Queries
              </div>
              {suggestedQuestions.map((sq, i) => (
                <button 
                  key={i}
                  onClick={() => handleAsk(sq)}
                  className="w-full p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 text-xs text-left hover:border-blue-500/50 hover:bg-slate-800/80 transition-all flex items-center justify-between group shadow-sm"
                >
                  <span className="pr-3 leading-relaxed">{sq}</span>
                  <Send size={13} className="text-slate-600 group-hover:text-cyan-400 transition-colors shrink-0" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          history.map((msg, idx) => (
            <div key={idx} className={`flex gap-3.5 ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              {msg.type === 'agent' && (
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Bot size={16} className="text-cyan-400" />
                </div>
              )}
              
              <div className={`max-w-[82%] rounded-2xl p-4 text-xs leading-relaxed ${
                msg.type === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-sm shadow-md' 
                  : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-sm shadow-lg'
              }`}>
                <div className="whitespace-pre-wrap">{msg.text}</div>
                
                {msg.data?.evidenceIds && msg.data.evidenceIds.length > 0 && (
                  <div className="mt-3.5 pt-3 border-t border-slate-800/80">
                    <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-2 flex items-center gap-1.5">
                      <CheckCircle2 size={11} className="text-cyan-400" />
                      Referenced Evidentiary Records
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.data.evidenceIds.map((eid, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-black/50 border border-slate-700/80 text-[10px] font-mono text-cyan-300">
                          {eid}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {msg.data?.disclaimer && (
                  <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-start gap-1.5 text-[10px] text-amber-400/80">
                    <ShieldAlert size={12} className="shrink-0 mt-0.5 text-amber-400" />
                    <span>{msg.data.disclaimer}</span>
                  </div>
                )}
              </div>
              
              {msg.type === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <User size={15} className="text-slate-300" />
                </div>
              )}
            </div>
          ))
        )}
        
        {loading && (
          <div className="flex gap-3.5 justify-start animate-fade-in">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
              <Loader2 size={16} className="text-cyan-400 animate-spin" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-sm p-4 text-slate-400 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping mr-1" />
              Synthesizing cross-cluster telemetry and evidence correlations...
            </div>
          </div>
        )}
      </div>

      {/* Input Form Bar */}
      <div className="p-4 bg-[#0a0f1d] border-t border-slate-800">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleAsk(query); }}
          className="relative flex items-center max-w-4xl mx-auto"
        >
          <input 
            type="text" 
            placeholder="Type a forensic question regarding this target wallet, VASP attribution, or typologies..." 
            className="w-full bg-[#060913] border border-slate-700/80 rounded-xl py-3.5 pl-4 pr-14 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-colors shadow-inner"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
          />
          <button 
            type="submit" 
            disabled={!query.trim() || loading}
            className="absolute right-2 p-2 rounded-lg text-cyan-400 hover:bg-cyan-500/10 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}

