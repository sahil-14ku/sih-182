'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { casesApi } from '@/lib/api';
import { 
  Shield, 
  ArrowRight, 
  Wallet, 
  AlertTriangle, 
  Flame, 
  Clock, 
  Lock, 
  Radio, 
  FileText, 
  CheckCircle2,
  Cpu
} from 'lucide-react';

export default function CreateInvestigation() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'hack',
    priority: 'medium',
    suspectWallet: '',
    blockchain: 'Ethereum',
    investigatorNotes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await casesApi.create(formData);
      if (res.success) {
        // Proceed to analysis page
        router.push(`/cases/${res.data.caseId}/analyze`);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to create investigation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container-md animate-fade-in">
      {/* Page Title & Context */}
      <div className="mb-8 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
            Protocol Dispatch
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Cpu className="text-blue-500" size={32} />
          Initiate Forensic Investigation
        </h1>
        <p className="text-slate-400 text-sm mt-1 max-w-2xl">
          Register suspect wallet address and deploy multi-hop tracing agents across indexed blockchain clusters.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Case Parameters & Target Entity */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* General Case Intel */}
            <div className="glass-panel p-6 border-slate-800 bg-[#090e1a]">
              <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
                <FileText size={14} className="text-blue-400" />
                Case Definition
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="vt-label">Case Identifier / Title</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g., Lazarus Group 2026 Bridge Exploit" 
                    className="vt-input text-sm"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Assigned name for multi-agency law enforcement and STR cross-referencing.
                  </span>
                </div>

                <div>
                  <label className="vt-label">Incident Typology</label>
                  <select 
                    className="vt-select text-sm font-medium"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="hack">Exchange Hack / Exploit</option>
                    <option value="ransomware">Ransomware Extortion</option>
                    <option value="scam">Scam / Phishing Campaign</option>
                    <option value="darknet">Darknet Market Activity</option>
                    <option value="sanctions">Sanctions Evasion</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Target Wallet Details */}
            <div className="glass-panel p-6 border-blue-500/30 bg-[#060e1d]">
              <h2 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
                <Wallet size={15} className="text-cyan-400" />
                Primary Suspect Target
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="vt-label">Suspect Wallet Address</label>
                  <input 
                    required
                    type="text" 
                    placeholder="0x... or 1A1zP1... or TX..." 
                    className="vt-input font-mono text-sm tracking-wide bg-slate-950/80 border-slate-700 text-cyan-300 focus:border-cyan-400"
                    value={formData.suspectWallet}
                    onChange={e => setFormData({...formData, suspectWallet: e.target.value})}
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Starting forensic seed node for heuristic graph traversal.
                  </span>
                </div>

                <div>
                  <label className="vt-label">Blockchain Ecosystem</label>
                  <select 
                    className="vt-select text-sm font-mono"
                    value={formData.blockchain}
                    onChange={e => setFormData({...formData, blockchain: e.target.value})}
                  >
                    <option value="Ethereum">Ethereum (ETH / ERC-20)</option>
                    <option value="Bitcoin">Bitcoin (BTC / UTXO)</option>
                    <option value="Tron">Tron (TRX / TRC-20)</option>
                    <option value="BSC">BNB Chain (BEP-20)</option>
                    <option value="Solana">Solana (SOL / SPL)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Priority, Notes & Dispatch Confirmation */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Priority Matrix */}
            <div className="glass-panel p-6 border-slate-800 bg-[#090e1a]">
              <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
                <Clock size={14} className="text-blue-400" />
                Priority Level & SLA
              </h2>

              <div className="space-y-3">
                <select 
                  className="vt-select text-sm"
                  value={formData.priority}
                  onChange={e => setFormData({...formData, priority: e.target.value})}
                >
                  <option value="low">Low Priority — Background indexing</option>
                  <option value="medium">Medium Priority — Standard investigation (2 hr SLA)</option>
                  <option value="high">High Priority — Active flight risk (15 min SLA)</option>
                  <option value="critical">Critical Priority — Live asset extraction / Emergency freeze</option>
                </select>

                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
                  High and Critical cases trigger automated heuristic clustering checks across sanction lists and blacklisted bridges.
                </div>
              </div>
            </div>

            {/* Investigator Notes */}
            <div className="glass-panel p-6 border-slate-800 bg-[#090e1a]">
              <label className="vt-label text-xs uppercase font-bold text-slate-300 mb-2 block">
                Initial Forensic Context / Notes
              </label>
              <textarea 
                placeholder="Include relevant background intel: threat group identifiers, victim exchange, initial ransom note, or subpoena reference..." 
                className="vt-input min-h-[120px] resize-none text-xs leading-relaxed"
                value={formData.investigatorNotes}
                onChange={e => setFormData({...formData, investigatorNotes: e.target.value})}
              />
            </div>

            {/* Audit Trail Badge */}
            <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-400">
              <Lock size={15} className="text-slate-500 shrink-0 mt-0.5" />
              <span>
                Immutable audit logging active. Case initiation event will be digitally signed by current operator credentials.
              </span>
            </div>
          </div>
        </div>

        {/* Action Dispatch Bar */}
        <div className="glass-panel p-5 border-slate-800 bg-[#080d19] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Shield size={16} className="text-cyan-400" />
            <span>Ready for autonomous VASP attribution and risk evaluation</span>
          </div>

          <button 
            type="submit" 
            className="btn-primary py-3.5 px-8 text-sm font-semibold w-full sm:w-auto justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Dispatching Tracing Agents...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Deploy Tracing Agents <ArrowRight size={17} />
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

