'use client';

import React, { useState } from 'react';
import { useWorkflowStore } from '@/store/workflowStore';
import {
  Play, Square, Save, Trash2, RotateCcw, Zap, ChevronDown,
  CheckCircle2, XCircle, Loader2, Wifi, WifiOff, Pencil, Check
} from 'lucide-react';

export default function Toolbar() {
  const {
    workflowName, setWorkflowName, saveWorkflow, executeWorkflow, clearExecution,
    executionStatus, isLoading, ollamaStatus, nodes, activeWorkflow, newWorkflow,
  } = useWorkflowStore();

  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState(workflowName);
  const [showRunMenu, setShowRunMenu] = useState(false);

  const handleSaveName = () => {
    setWorkflowName(nameVal);
    setEditingName(false);
  };

  const isRunning = executionStatus === 'running';
  const canRun = nodes.length > 0 && !isRunning;

  return (
    <header className="flex-shrink-0 flex items-center gap-3 px-4 h-14 z-20"
      style={{ background: 'rgba(10,11,20,0.98)', borderBottom: '1px solid rgba(37,40,72,0.8)' }}>

      {/* Logo */}
      <div className="flex items-center gap-2 mr-2">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #6c63ff, #00d4ff)', boxShadow: '0 0 16px rgba(108,99,255,0.5)' }}>
          <Zap size={16} className="text-white" strokeWidth={2.5} />
        </div>
        <span className="text-sm font-black tracking-tight" style={{ background: 'linear-gradient(90deg, #6c63ff, #00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          FlowMind
        </span>
      </div>

      <div className="w-px h-6" style={{ background: 'rgba(37,40,72,0.8)' }} />

      {/* Workflow name */}
      <div className="flex items-center gap-1.5">
        {editingName ? (
          <>
            <input
              autoFocus
              value={nameVal}
              onChange={e => setNameVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
              className="px-2 py-1 rounded-lg text-sm font-semibold outline-none"
              style={{ background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.4)', color: '#f0f1ff', width: 200 }}
            />
            <button onClick={handleSaveName} className="p-1.5 rounded-lg hover:bg-white/5" style={{ color: '#00e5a0' }}>
              <Check size={14} />
            </button>
          </>
        ) : (
          <button onClick={() => { setNameVal(workflowName); setEditingName(true); }}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors group">
            <span className="text-sm font-semibold text-white">{workflowName}</span>
            <Pencil size={11} className="opacity-0 group-hover:opacity-50 transition-opacity" style={{ color: '#6c63ff' }} />
          </button>
        )}
      </div>

      {/* Status pills */}
      <div className="flex items-center gap-1.5 ml-1">
        {activeWorkflow?.id && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]"
            style={{ background: 'rgba(0,229,160,0.08)', border: '1px solid rgba(0,229,160,0.2)', color: '#00e5a0' }}>
            <CheckCircle2 size={9} /> Saved
          </div>
        )}
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]"
          style={{ background: ollamaStatus === 'connected' ? 'rgba(0,229,160,0.08)' : 'rgba(255,77,109,0.08)', border: `1px solid ${ollamaStatus === 'connected' ? 'rgba(0,229,160,0.2)' : 'rgba(255,77,109,0.2)'}`, color: ollamaStatus === 'connected' ? '#00e5a0' : '#ff4d6d' }}>
          {ollamaStatus === 'connected' ? <Wifi size={9} /> : <WifiOff size={9} />}
          Ollama {ollamaStatus}
        </div>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(37,40,72,0.8)', color: '#4a4e78' }}>
          {nodes.length} nodes
        </div>
      </div>

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* New */}
        <button onClick={newWorkflow}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(37,40,72,0.8)', color: '#8b8fb3' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(108,99,255,0.4)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(37,40,72,0.8)')}>
          <RotateCcw size={13} /> New
        </button>

        {/* Save */}
        <button onClick={saveWorkflow} disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
          style={{ background: 'rgba(108,99,255,0.12)', border: '1px solid rgba(108,99,255,0.35)', color: '#6c63ff' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(108,99,255,0.22)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(108,99,255,0.12)')}>
          {isLoading ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          Save
        </button>

        {/* Clear */}
        {executionStatus !== 'idle' && (
          <button onClick={clearExecution}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(37,40,72,0.8)', color: '#8b8fb3' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,77,109,0.4)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(37,40,72,0.8)')}>
            <Square size={13} /> Clear
          </button>
        )}

        {/* Run */}
        <button
          onClick={() => !isRunning && executeWorkflow()}
          disabled={!canRun}
          className="relative flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all overflow-hidden"
          style={{
            background: isRunning
              ? 'linear-gradient(135deg, #00d4ff22, #00d4ff11)'
              : canRun
              ? 'linear-gradient(135deg, #6c63ff, #00d4ff)'
              : 'rgba(255,255,255,0.04)',
            border: isRunning ? '1px solid rgba(0,212,255,0.5)' : canRun ? 'none' : '1px solid rgba(37,40,72,0.8)',
            color: canRun || isRunning ? '#fff' : '#4a4e78',
            boxShadow: canRun && !isRunning ? '0 0 20px rgba(108,99,255,0.4)' : 'none',
          }}>
          {isRunning
            ? <><Loader2 size={13} className="animate-spin" /> Running…</>
            : <><Play size={13} /> Run</>}
        </button>
      </div>
    </header>
  );
}
