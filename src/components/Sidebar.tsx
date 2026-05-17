'use client';

import React, { useState, useMemo } from 'react';
import { useWorkflowStore } from '@/store/workflowStore';
import { NODE_DEFINITIONS, NODE_CATEGORIES } from '@/lib/nodeDefinitions';
import { NodeTypeDef, NodeCategory } from '@/types/workflow';
import * as Icons from 'lucide-react';
import {
  Search, ChevronDown, ChevronRight, Zap,
  Plus, Clock, Trash2, Play, FolderOpen, PanelLeftClose, PanelLeft
} from 'lucide-react';

function NodeIcon({ name, size = 16 }: { name: string; size?: number }) {
  const IconComp = (Icons as Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>>)[name];
  if (!IconComp) return <Icons.Box size={size} strokeWidth={1.5} />;
  return <IconComp size={size} strokeWidth={1.5} />;
}

function NodeCard({ def }: { def: NodeTypeDef }) {
  const addNode = useWorkflowStore((s) => s.addNode);
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('nodeType', def.type);
    e.dataTransfer.effectAllowed = 'copy';
  };
  return (
    <div
      draggable onDragStart={handleDragStart}
      onClick={() => addNode(def, { x: 300 + Math.random() * 200, y: 200 + Math.random() * 200 })}
      className="group flex items-center gap-3.5 px-4 py-3 rounded-2xl cursor-grab active:cursor-grabbing transition-all duration-300 mb-1.5 hover:scale-[1.01]"
      style={{ border: '1px solid transparent' }}
      onMouseEnter={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.background = `${def.color}15`; el.style.borderColor = `${def.color}44`; el.style.boxShadow = `0 4px 12px ${def.color}11`; }}
      onMouseLeave={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.background = 'transparent'; el.style.borderColor = 'transparent'; el.style.boxShadow = 'none'; }}
    >
      <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105" style={{ background: `${def.color}22`, color: def.color }}>
        <NodeIcon name={def.icon} size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-white tracking-wide truncate">{def.label}</div>
        <div className="text-[10px] mt-0.5 truncate" style={{ color: '#5b6196' }}>{def.description}</div>
      </div>
      <Plus size={14} className="opacity-0 group-hover:opacity-80 transition-opacity flex-shrink-0" style={{ color: def.color }} />
    </div>
  );
}

function CategorySection({ color, label, nodes }: { categoryId: NodeCategory; color: string; label: string; nodes: NodeTypeDef[] }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-3">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-white/5">
        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
        <span className="text-[11px] font-extrabold uppercase tracking-widest flex-1 text-left" style={{ color }}>{label}</span>
        <span className="text-[10px] font-mono mr-1" style={{ color: '#4a4e78' }}>{nodes.length}</span>
        {open ? <ChevronDown size={14} style={{ color: '#4a4e78' }} /> : <ChevronRight size={14} style={{ color: '#4a4e78' }} />}
      </button>
      {open && <div className="pl-2 mt-1 space-y-1">{nodes.map(def => <NodeCard key={def.type} def={def} />)}</div>}
    </div>
  );
}

function WorkflowsTab() {
  const { workflows, activeWorkflow, loadWorkflow, newWorkflow, deleteWorkflow } = useWorkflowStore();
  return (
    <div className="flex flex-col gap-2 p-2">
      <button onClick={newWorkflow} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all"
        style={{ background: 'rgba(108,99,255,0.12)', border: '1px solid rgba(108,99,255,0.3)', color: '#6c63ff' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(108,99,255,0.2)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(108,99,255,0.12)')}>
        <Plus size={14} /> New Workflow
      </button>
      {workflows.length === 0 && (
        <div className="text-center py-10">
          <FolderOpen size={32} className="mx-auto mb-2 opacity-20" />
          <p className="text-xs" style={{ color: '#4a4e78' }}>No saved workflows yet.</p>
        </div>
      )}
      {workflows.map(wf => (
        <div key={wf.id} onClick={() => loadWorkflow(wf.id)} className="group flex items-center gap-2 px-3 py-3 rounded-xl cursor-pointer transition-all"
          style={{ background: activeWorkflow?.id === wf.id ? 'rgba(108,99,255,0.12)' : 'rgba(255,255,255,0.02)', border: `1px solid ${activeWorkflow?.id === wf.id ? 'rgba(108,99,255,0.4)' : 'rgba(37,40,72,0.6)'}` }}>
          <Zap size={14} style={{ color: '#6c63ff', flexShrink: 0 }} />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">{wf.name}</div>
            <div className="text-[10px]" style={{ color: '#4a4e78' }}>{wf.nodes?.length ?? 0} nodes</div>
          </div>
          <button onClick={e => { e.stopPropagation(); deleteWorkflow(wf.id); }} className="opacity-0 group-hover:opacity-60 p-1 rounded" style={{ color: '#ff4d6d' }}>
            <Trash2 size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}

function ExecutionsTab() {
  const { executionStatus, nodeResults, executionId } = useWorkflowStore();
  const entries = Object.entries(nodeResults);
  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="flex items-center gap-2 px-3 py-3 rounded-xl"
        style={{ background: executionStatus === 'success' ? 'rgba(0,229,160,0.08)' : executionStatus === 'error' ? 'rgba(255,77,109,0.08)' : executionStatus === 'running' ? 'rgba(0,212,255,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${executionStatus === 'success' ? 'rgba(0,229,160,0.3)' : executionStatus === 'error' ? 'rgba(255,77,109,0.3)' : executionStatus === 'running' ? 'rgba(0,212,255,0.3)' : 'rgba(37,40,72,0.6)'}` }}>
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: executionStatus === 'success' ? '#00e5a0' : executionStatus === 'error' ? '#ff4d6d' : executionStatus === 'running' ? '#00d4ff' : '#4a4e78' }} />
        <div className="flex-1">
          <div className="text-xs font-semibold text-white capitalize">{executionStatus}</div>
          {executionId && <div className="text-[10px]" style={{ color: '#4a4e78' }}>{executionId.slice(0, 8)}…</div>}
        </div>
      </div>
      {entries.length === 0 && executionStatus === 'idle' && (
        <div className="text-center py-10"><Play size={32} className="mx-auto mb-2 opacity-20" /><p className="text-xs" style={{ color: '#4a4e78' }}>Run a workflow to see results.</p></div>
      )}
      {entries.map(([nodeId, result]) => (
        <div key={nodeId} className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(37,40,72,0.6)', background: 'rgba(21,23,41,0.6)' }}>
          <div className="flex items-center gap-2 px-3 py-2" style={{ background: result.status === 'success' ? 'rgba(0,229,160,0.06)' : 'rgba(255,77,109,0.06)', borderBottom: '1px solid rgba(37,40,72,0.4)' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: result.status === 'success' ? '#00e5a0' : '#ff4d6d' }} />
            <span className="text-[10px] font-mono font-bold flex-1" style={{ color: '#8b8fb3' }}>{nodeId.slice(0, 14)}</span>
            <span className="text-[10px] font-semibold" style={{ color: result.status === 'success' ? '#00e5a0' : '#ff4d6d' }}>{result.status}</span>
          </div>
          <pre className="px-3 py-2 text-[10px] font-mono whitespace-pre-wrap break-all max-h-24 overflow-y-auto" style={{ color: '#8b8fb3' }}>
            {JSON.stringify(result.output ?? result.error, null, 2)}
          </pre>
        </div>
      ))}
    </div>
  );
}

export default function Sidebar() {
  const { isSidebarOpen, toggleSidebar, activeTab, setActiveTab } = useWorkflowStore();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return NODE_DEFINITIONS;
    const q = search.toLowerCase();
    return NODE_DEFINITIONS.filter(n => n.label.toLowerCase().includes(q) || n.description.toLowerCase().includes(q));
  }, [search]);

  const TABS = [
    { id: 'nodes' as const, label: 'Nodes', icon: <Zap size={13} /> },
    { id: 'workflows' as const, label: 'Flows', icon: <FolderOpen size={13} /> },
    { id: 'executions' as const, label: 'Runs', icon: <Clock size={13} /> },
  ];

  return (
    <>
      {!isSidebarOpen && (
        <button onClick={toggleSidebar} className="absolute top-20 left-0 z-30 flex items-center justify-center w-8 h-8 rounded-r-xl"
          style={{ background: 'rgba(21,23,41,0.95)', border: '1px solid rgba(37,40,72,0.8)', borderLeft: 'none', color: '#6c63ff' }}>
          <PanelLeft size={16} />
        </button>
      )}
      <aside className="flex-shrink-0 flex flex-col h-full transition-all duration-300 overflow-hidden"
        style={{ width: isSidebarOpen ? 340 : 0, background: 'rgba(10,11,20,0.98)', borderRight: '1px solid rgba(37,40,72,0.8)' }}>
        {isSidebarOpen && (
          <>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(37,40,72,0.8)' }}>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#4a4e78' }}>Dashboard Panel</span>
              <button onClick={toggleSidebar} className="p-2 rounded-xl hover:bg-white/5 transition-all duration-200" style={{ color: '#4a4e78' }}><PanelLeftClose size={16} /></button>
            </div>
            <div className="flex gap-1.5 p-3.5" style={{ borderBottom: '1px solid rgba(37,40,72,0.8)' }}>
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-bold tracking-wide transition-all duration-300"
                  style={{ background: activeTab === tab.id ? 'rgba(108,99,255,0.12)' : 'transparent', color: activeTab === tab.id ? '#6c63ff' : '#4a4e78', border: activeTab === tab.id ? '1px solid rgba(108,99,255,0.25)' : '1px solid transparent', boxShadow: activeTab === tab.id ? '0 2px 10px rgba(108,99,255,0.05)' : 'none' }}>
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'nodes' && (
                <div>
                  <div className="p-4">
                    <div className="relative">
                      <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#4a4e78' }} />
                      <input type="text" placeholder="Search workflow nodes…" value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs outline-none transition-all duration-300"
                        style={{ background: 'rgba(21,23,41,0.8)', border: '1px solid rgba(37,40,72,0.8)', color: '#f0f1ff' }}
                        onFocus={e => (e.currentTarget.style.borderColor = 'rgba(108,99,255,0.5)')}
                        onBlur={e => (e.currentTarget.style.borderColor = 'rgba(37,40,72,0.8)')} />
                    </div>
                  </div>
                  <div className="mx-4 mb-3 px-4 py-2.5 rounded-xl text-[10px] font-semibold text-center tracking-wide"
                    style={{ background: 'rgba(108,99,255,0.05)', color: '#6c63ff', border: '1px solid rgba(108,99,255,0.15)', boxShadow: '0 2px 8px rgba(108,99,255,0.02)' }}>
                    Drag onto canvas or click to add
                  </div>
                  <div className="px-3 pb-6">
                    {search.trim() ? (
                      filtered.length === 0 ? <div className="text-center py-10 text-xs" style={{ color: '#4a4e78' }}>No nodes found matching search</div>
                        : filtered.map(def => <NodeCard key={def.type} def={def} />)
                    ) : (
                      NODE_CATEGORIES.map(cat => (
                        <CategorySection key={cat.id} categoryId={cat.id} color={cat.color} label={cat.label}
                          nodes={NODE_DEFINITIONS.filter(n => n.category === cat.id)} />
                      ))
                    )}
                  </div>
                </div>
              )}
              {activeTab === 'workflows' && <WorkflowsTab />}
              {activeTab === 'executions' && <ExecutionsTab />}
            </div>
          </>
        )}
      </aside>
    </>
  );
}
