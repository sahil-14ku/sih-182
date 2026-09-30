'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { casesApi, GraphData, GraphNode, GraphEdge } from '@/lib/api';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
  Handle,
  Panel,
  Node,
  Edge,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  Network, 
  AlertOctagon, 
  Target, 
  Zap, 
  Shield, 
  Search, 
  Layers, 
  ArrowRight,
  Server,
  DollarSign,
  Clock,
  ExternalLink,
  Filter
} from 'lucide-react';

const CustomWalletNode = ({ data, selected }: { data: any; selected?: boolean }) => {
  const isVasp = data.isVasp;
  const isSuspect = data.label?.includes('Suspect') || data.type === 'suspect';
  
  // Color configuration based on node hierarchy
  let nodeStyle = 'border-slate-700/80 bg-[#0c1322]/95 hover:border-slate-500';
  let badgeColor = 'bg-slate-800 text-slate-300 border-slate-700';
  let icon = <Shield size={14} className="text-slate-400" />;
  let categoryLabel = 'Intermediate Relay';

  if (isSuspect) {
    nodeStyle = 'border-red-500/80 bg-[#19090e]/95 shadow-[0_0_20px_rgba(239,68,68,0.25)] ring-1 ring-red-500/30';
    badgeColor = 'bg-red-500/20 text-red-300 border-red-500/30';
    icon = <AlertOctagon size={14} className="text-red-400" />;
    categoryLabel = 'Suspect Origin';
  } else if (isVasp) {
    nodeStyle = 'border-cyan-500/80 bg-[#051528]/95 shadow-[0_0_20px_rgba(6,182,212,0.25)] ring-1 ring-cyan-500/30';
    badgeColor = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
    icon = <Target size={14} className="text-cyan-400" />;
    categoryLabel = 'VASP Deposit';
  }

  if (selected) {
    nodeStyle += ' ring-2 ring-blue-400 shadow-[0_0_25px_rgba(59,130,246,0.5)]';
  }

  return (
    <div className={`px-4 py-3 rounded-xl border-2 min-w-[210px] max-w-[240px] backdrop-blur-md transition-all ${nodeStyle}`}>
      <Handle 
        type="target" 
        position={Position.Left} 
        className="!w-2.5 !h-2.5 !bg-slate-400 !border-2 !border-slate-900" 
      />
      
      {/* Top Entity Category */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          {icon}
          <span className="font-bold text-[11px] text-white uppercase tracking-wider truncate">
            {data.label || 'Wallet'}
          </span>
        </div>
        <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border font-semibold ${badgeColor}`}>
          {categoryLabel}
        </span>
      </div>
      
      {/* Address */}
      <div className="font-mono text-[10px] text-slate-300 bg-black/40 px-2 py-1 rounded border border-slate-800/80 truncate mb-2.5" title={data.id}>
        {data.id ? `${data.id.slice(0, 10)}...${data.id.slice(-6)}` : 'Unknown'}
      </div>
      
      {/* Footer Info */}
      <div className="flex justify-between items-center pt-2 border-t border-slate-800/80">
        <span className="text-[10px] uppercase text-slate-400 font-mono font-medium">
          {data.blockchain || 'ETH'}
        </span>
        {data.riskScore !== undefined && (
          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
            data.riskScore >= 80 ? 'bg-red-500/20 text-red-400 border-red-500/30' : 
            data.riskScore >= 60 ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
            data.riskScore >= 40 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
            'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
          }`}>
            Risk: {data.riskScore}
          </span>
        )}
      </div>

      <Handle 
        type="source" 
        position={Position.Right} 
        className="!w-2.5 !h-2.5 !bg-slate-400 !border-2 !border-slate-900" 
      />
    </div>
  );
};

const nodeTypes = {
  wallet: CustomWalletNode,
};

export default function FundFlowGraph() {
  const params = useParams();
  const caseId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [graphData, setGraphData] = useState<GraphData | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [highlightMode, setHighlightMode] = useState<string | null>(null);

  useEffect(() => {
    casesApi.graph(caseId).then(res => {
      setGraphData(res.data);
      
      const rfNodes = res.data.nodes.map(n => ({
        id: n.id,
        type: 'wallet',
        position: n.position || { x: Math.random() * 500, y: Math.random() * 500 },
        data: { ...n },
      }));

      const rfEdges = res.data.edges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        animated: true,
        label: `${e.value} ${e.tokenSymbol}`,
        labelStyle: { fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace', fontWeight: 600 },
        labelBgStyle: { fill: '#0a0f1d', fillOpacity: 0.9, stroke: e.isSuspicious ? '#ef4444' : '#334155', strokeWidth: 1, rx: 4, ry: 4 },
        labelBgPadding: [6, 3] as [number, number],
        data: { ...e },
        style: { stroke: e.isSuspicious ? '#ef4444' : '#475569', strokeWidth: e.isSuspicious ? 2.5 : 1.5 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: e.isSuspicious ? '#ef4444' : '#475569',
        },
      }));

      setNodes(rfNodes as any);
      setEdges(rfEdges as any);
      setLoading(false);
    }).catch(console.error);
  }, [caseId, setNodes, setEdges]);

  const onNodeClick = (_: any, node: any) => setSelectedElement({ type: 'node', data: node.data });
  const onEdgeClick = (_: any, edge: any) => setSelectedElement({ type: 'edge', data: edge.data });
  const onPaneClick = () => setSelectedElement(null);

  const toggleHighlight = (mode: string) => {
    if (highlightMode === mode) {
      setHighlightMode(null);
      setNodes((nds: any[]) => nds.map((n: any) => ({ ...n, style: { opacity: 1 } })));
      setEdges((eds: any[]) => eds.map((e: any) => ({ ...e, style: { ...(e.style || {}), opacity: 1 } })));
    } else {
      setHighlightMode(mode);
      if (mode === 'vasp') {
        setNodes((nds: any[]) => nds.map((n: any) => ({ 
          ...n, 
          style: { opacity: n.data?.isVasp || n.data?.label?.includes('Suspect') ? 1 : 0.25 } 
        })));
        setEdges((eds: any[]) => eds.map((e: any) => ({ 
          ...e, 
          style: { ...(e.style || {}), opacity: 0.2 } 
        })));
      } else if (mode === 'suspicious') {
        setEdges((eds: any[]) => eds.map((e: any) => ({ 
          ...e, 
          style: { ...(e.style || {}), opacity: e.data?.isSuspicious ? 1 : 0.15 } 
        })));
        setNodes((nds: any[]) => nds.map((n: any) => ({ ...n, style: { opacity: 0.4 } })));
      }
    }
  };

  if (loading) return <div className="skeleton h-[650px] w-full rounded-2xl"></div>;

  return (
    <div className="flex flex-col gap-4 animate-fade-in -mx-7 px-7">
      {/* Forensic Metrics Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#090e1a] p-4 rounded-xl border border-slate-800 gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Network size={20} className="text-blue-500" />
            Fund Flow Forensic Topology
          </h2>
          <p className="text-xs text-slate-400">
            Multi-hop transaction graph with automated cluster attribution and risk tagging.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="bg-slate-900/80 px-3.5 py-1.5 rounded-lg border border-slate-800 text-center min-w-[85px]">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Max Depth</div>
            <div className="font-mono text-sm font-bold text-white">4 Hops</div>
          </div>
          <div className="bg-slate-900/80 px-3.5 py-1.5 rounded-lg border border-slate-800 text-center min-w-[85px]">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Nodes</div>
            <div className="font-mono text-sm font-bold text-white">{graphData?.nodes.length || 0}</div>
          </div>
          <div className="bg-slate-900/80 px-3.5 py-1.5 rounded-lg border border-slate-800 text-center min-w-[85px]">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Transactions</div>
            <div className="font-mono text-sm font-bold text-white">{graphData?.edges.length || 0}</div>
          </div>
          <div className="bg-slate-900/80 px-3.5 py-1.5 rounded-lg border border-blue-500/30 text-center min-w-[85px]">
            <div className="text-[10px] text-blue-400 uppercase font-semibold">Confidence</div>
            <div className="font-mono text-sm font-bold text-cyan-400">92%</div>
          </div>
          <div className="bg-slate-900/80 px-3.5 py-1.5 rounded-lg border border-red-500/30 text-center min-w-[85px]">
            <div className="text-[10px] text-red-400 uppercase font-semibold">Peak Risk</div>
            <div className="font-mono text-sm font-bold text-red-400">89/100</div>
          </div>
        </div>
      </div>

      {/* Main Graph Canvas and Inspector */}
      <div className="flex flex-col lg:flex-row gap-4" style={{ height: 'calc(100vh - 280px)', minHeight: '520px' }}>
        {/* Canvas */}
        <div className="flex-1 glass-panel relative overflow-hidden rounded-2xl border border-slate-800 shadow-2xl bg-[#060a14]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.1}
            maxZoom={3.5}
            className="bg-[#050811]"
          >
            <Background color="#1e293b" gap={20} size={1} variant={BackgroundVariant.Dots} />
            <Controls className="!bg-slate-900 !border !border-slate-800 !rounded-xl !shadow-lg [&>button]:!border-slate-800 [&>button]:!fill-slate-300 hover:[&>button]:!bg-slate-800" />
            <MiniMap 
              nodeColor={(n: any) => {
                if (n.data?.label?.includes('Suspect') || n.data?.type === 'suspect') return '#ef4444';
                if (n.data?.isVasp) return '#06b6d4';
                return '#64748b';
              }}
              maskColor="rgba(5, 8, 17, 0.85)"
              className="!bg-slate-950 !border !border-slate-800 !rounded-xl overflow-hidden"
            />
            
            {/* Legend Overlay */}
            <Panel position="top-left" className="!m-4 bg-slate-900/85 backdrop-blur-md p-3.5 rounded-xl border border-slate-800 shadow-xl text-xs space-y-2">
              <div className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Network size={14} className="text-blue-400" />
                Topology Legend
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                <span>Suspect Origin</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span>Intermediate Relay</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                <span>VASP Deposit</span>
              </div>
              <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center gap-1.5">
                <span className="w-4 h-0.5 bg-red-500" />
                <span>Suspicious Hop</span>
              </div>
            </Panel>
          </ReactFlow>
        </div>

        {/* Forensic Inspector Sidebar */}
        <div className="w-full lg:w-84 glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col bg-[#090d18] shadow-xl">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Search size={14} className="text-blue-400" />
              Intelligence Inspector
            </h3>
            {selectedElement && (
              <button 
                onClick={() => setSelectedElement(null)}
                className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto pr-1">
            {!selectedElement ? (
              <div className="flex flex-col items-center justify-center h-48 text-center text-slate-500 px-4">
                <Search size={32} className="mb-3 text-slate-700 opacity-60" />
                <p className="text-xs font-medium text-slate-400 mb-1">No Entity Selected</p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Click any wallet node or transaction link to view forensic details, cluster metrics, and timestamps.
                </p>
              </div>
            ) : selectedElement.type === 'node' ? (
              <div className="space-y-4 animate-fade-in text-xs">
                <div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                    selectedElement.data.label?.includes('Suspect') ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                    selectedElement.data.isVasp ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 
                    'bg-slate-800 text-slate-300 border-slate-700'
                  }`}>
                    {selectedElement.data.label?.includes('Suspect') ? 'Suspect Origin' :
                     selectedElement.data.isVasp ? 'VASP Cluster' : 'Intermediate Relay'}
                  </span>
                  <h4 className="text-white font-bold text-sm mt-1.5">{selectedElement.data.label}</h4>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold mb-1">Wallet Address</div>
                  <div className="font-mono text-[11px] text-blue-400 break-all bg-blue-500/10 p-2.5 rounded-lg border border-blue-500/20">
                    {selectedElement.data.id}
                  </div>
                </div>
                
                <div className="space-y-2.5 bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Blockchain</span>
                    <span className="text-white font-semibold uppercase">{selectedElement.data.blockchain || 'Ethereum'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Risk Assessment</span>
                    <span className={`font-mono font-bold ${
                      (selectedElement.data.riskScore || 0) >= 80 ? 'text-red-400' :
                      (selectedElement.data.riskScore || 0) >= 60 ? 'text-orange-400' :
                      'text-emerald-400'
                    }`}>
                      {selectedElement.data.riskScore !== undefined ? `${selectedElement.data.riskScore}/100` : 'N/A'}
                    </span>
                  </div>
                  {selectedElement.data.vaspAssociation && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">VASP Cluster</span>
                      <span className="text-cyan-300 font-semibold">{selectedElement.data.vaspAssociation}</span>
                    </div>
                  )}
                  {selectedElement.data.type && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Node Type</span>
                      <span className="text-slate-200 capitalize">{selectedElement.data.type}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in text-xs">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                      Transaction Edge
                    </span>
                    {selectedElement.data.isSuspicious && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1">
                        <Zap size={10} /> Suspicious
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold mb-1">Tx Hash</div>
                  <div className="font-mono text-[11px] text-blue-400 break-all bg-blue-500/10 p-2.5 rounded-lg border border-blue-500/20">
                    {selectedElement.data.hash || selectedElement.data.id}
                  </div>
                </div>
                
                <div className="bg-slate-900/80 rounded-xl p-3.5 space-y-2 border border-slate-800">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-xs">Transferred Value</span>
                    <span className="text-white font-bold text-sm font-mono">
                      {selectedElement.data.value} {selectedElement.data.tokenSymbol || 'ETH'}
                    </span>
                  </div>
                  {selectedElement.data.valueUsd && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-xs">Estimated USD</span>
                      <span className="text-emerald-400 font-mono font-semibold">
                        ${selectedElement.data.valueUsd.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Hop Distance</span>
                    <span className="text-white font-mono font-semibold">Hop #{selectedElement.data.hopNumber || 1}</span>
                  </div>
                  {selectedElement.data.timestamp && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Timestamp</span>
                      <span className="text-slate-300 text-[11px] font-mono">
                        {new Date(selectedElement.data.timestamp).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Quick Filters */}
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
            <button 
              onClick={() => toggleHighlight('vasp')}
              className={`w-full py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                highlightMode === 'vasp' 
                  ? 'bg-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]' 
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-700/50'
              }`}
            >
              <Target size={13} />
              {highlightMode === 'vasp' ? 'Reset VASP Paths' : 'Highlight VASP Paths'}
            </button>
            <button 
              onClick={() => toggleHighlight('suspicious')}
              className={`w-full py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                highlightMode === 'suspicious' 
                  ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' 
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-700/50'
              }`}
            >
              <Zap size={13} />
              {highlightMode === 'suspicious' ? 'Reset Suspicious Paths' : 'Highlight Suspicious Paths'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
