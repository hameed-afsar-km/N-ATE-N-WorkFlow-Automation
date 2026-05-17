'use client';

import React, { useState } from 'react';
import { useWorkflowStore } from '@/store/workflowStore';
import {
  Play, Square, Save, Trash2, RotateCcw, Zap, ChevronDown,
  CheckCircle2, XCircle, Loader2, Wifi, WifiOff, Pencil, Check,
  Undo2, Redo2
} from 'lucide-react';

export default function Toolbar() {
  const {
    workflowName, setWorkflowName, saveWorkflow, executeWorkflow, clearExecution,
    executionStatus, isLoading, ollamaStatus, nodes, activeWorkflow, newWorkflow,
    undo, redo, historyStack, futureStack,
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
    <header className="flex-shrink-0 flex items-center gap-5 px-8 h-20 z-20"
      style={{ background: 'rgba(10,11,20,0.98)', borderBottom: '1px solid rgba(37,40,72,0.8)' }}>

      {/* Logo */}
      <div className="flex items-center gap-3.5 mr-4">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #6c63ff, #00d4ff)', boxShadow: '0 0 16px rgba(108,99,255,0.5)' }}>
          <Zap size={18} className="text-white" strokeWidth={2.5} />
        </div>
        <span className="text-base font-black tracking-tight" style={{ background: 'linear-gradient(90deg, #6c63ff, #00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          N-ATE-N
        </span>
      </div>

      <div className="w-px h-8" style={{ background: 'rgba(37,40,72,0.8)' }} />

      {/* Workflow name */}
      <div className="flex items-center gap-2.5">
        {editingName ? (
          <>
            <input
              autoFocus
              value={nameVal}
              onChange={e => setNameVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
              className="px-4 py-2 rounded-2xl text-sm font-semibold outline-none"
              style={{ background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.4)', color: '#f0f1ff', width: 240 }}
            />
            <button onClick={handleSaveName} className="p-3.5 rounded-2xl hover:bg-white/5" style={{ color: '#00e5a0' }}>
              <Check size={16} />
            </button>
          </>
        ) : (
          <button onClick={() => { setNameVal(workflowName); setEditingName(true); }}
            className="flex items-center gap-2.5 rounded-2xl hover:bg-white/5 transition-colors group"
            style={{ padding: '8px 16px' }}>
            <span className="text-sm font-semibold text-white">{workflowName}</span>
            <Pencil size={13} className="opacity-0 group-hover:opacity-50 transition-opacity" style={{ color: '#6c63ff' }} />
          </button>
        )}
      </div>

      {/* Status pills */}
      <div className="flex items-center gap-2.5 ml-1">
        {activeWorkflow?.id && (
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-extrabold tracking-widest"
            style={{ background: 'rgba(0,229,160,0.08)', border: '1px solid rgba(0,229,160,0.2)', color: '#00e5a0' }}>
            <CheckCircle2 size={11} /> SAVED
          </div>
        )}
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-extrabold tracking-widest"
          style={{ background: ollamaStatus === 'connected' ? 'rgba(0,229,160,0.08)' : 'rgba(255,77,109,0.08)', border: `1px solid ${ollamaStatus === 'connected' ? 'rgba(0,229,160,0.2)' : 'rgba(255,77,109,0.2)'}`, color: ollamaStatus === 'connected' ? '#00e5a0' : '#ff4d6d' }}>
          {ollamaStatus === 'connected' ? <Wifi size={11} /> : <WifiOff size={11} />}
          OLLAMA {ollamaStatus.toUpperCase()}
        </div>
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-extrabold tracking-widest"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(37,40,72,0.8)', color: '#4a4e78' }}>
          {nodes.length} NODES
        </div>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        {/* Undo / Redo controls */}
        <div className="flex items-center gap-1 px-1 py-1 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(37,40,72,0.6)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
          <button 
            onClick={undo}
            disabled={historyStack.length === 0}
            className="p-2 rounded-xl transition-all duration-200 enabled:hover:bg-white/5 enabled:hover:text-white disabled:opacity-20 disabled:cursor-not-allowed"
            title="Undo (Ctrl+Z)"
            style={{ color: '#8b8fb3' }}
          >
            <Undo2 size={15} />
          </button>
          <div className="w-px h-4 bg-[rgba(37,40,72,0.5)]" />
          <button 
            onClick={redo}
            disabled={futureStack.length === 0}
            className="p-2 rounded-xl transition-all duration-200 enabled:hover:bg-white/5 enabled:hover:text-white disabled:opacity-20 disabled:cursor-not-allowed"
            title="Redo (Ctrl+Y)"
            style={{ color: '#8b8fb3' }}
          >
            <Redo2 size={15} />
          </button>
        </div>

        {/* New */}
        <button onClick={newWorkflow}
          className="flex items-center gap-2.5 rounded-[20px] text-xs font-bold transition-all duration-300"
          style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(37,40,72,0.8)', color: '#8b8fb3' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(108,99,255,0.4)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(37,40,72,0.8)')}>
          <RotateCcw size={15} /> New Flow
        </button>

        <button onClick={saveWorkflow} disabled={isLoading}
          className="flex items-center gap-2.5 rounded-[20px] text-xs font-bold transition-all duration-300"
          style={{ padding: '10px 20px', background: 'rgba(108,99,255,0.12)', border: '1px solid rgba(108,99,255,0.35)', color: '#6c63ff' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(108,99,255,0.22)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(108,99,255,0.12)')}>
          {isLoading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Save
        </button>

        {/* Clear */}
        {executionStatus !== 'idle' && (
          <button onClick={clearExecution}
            className="flex items-center gap-2.5 rounded-[20px] text-xs font-bold transition-all duration-300"
            style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(37,40,72,0.8)', color: '#8b8fb3' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,77,109,0.4)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(37,40,72,0.8)')}>
            <Square size={15} /> Clear
          </button>
        )}

        <button
          onClick={() => !isRunning && executeWorkflow()}
          disabled={!canRun}
          className="relative flex items-center gap-2.5 rounded-[20px] text-xs font-black transition-all duration-300 overflow-hidden"
          style={{
            padding: '10px 24px',
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
            ? <><Loader2 size={15} className="animate-spin" /> Running…</>
            : <><Play size={15} /> Execute Flow</>}
        </button>
      </div>
    </header>
  );
}
