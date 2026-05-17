'use client';

import React, { memo, useCallback } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { FlowNodeData } from '@/types/workflow';
import { useWorkflowStore } from '@/store/workflowStore';
import * as Icons from 'lucide-react';
import { CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';

// ─────────────────────────────────────────────
// Icon Resolver
// ─────────────────────────────────────────────

function NodeIcon({ name, size = 18 }: { name: string; size?: number }) {
  const IconComp = (Icons as Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>>)[name];
  if (!IconComp) return <Icons.Box size={size} strokeWidth={1.5} />;
  return <IconComp size={size} strokeWidth={1.5} />;
}

// ─────────────────────────────────────────────
// Status Badge
// ─────────────────────────────────────────────

function StatusBadge({ status }: { status?: string }) {
  if (!status || status === 'idle') return null;

  const cfg = {
    running: { icon: <Loader2 size={11} className="animate-spin" />, color: '#00d4ff', label: 'Running' },
    success: { icon: <CheckCircle2 size={11} />, color: '#00e5a0', label: 'Done' },
    error:   { icon: <XCircle size={11} />, color: '#ff4d6d', label: 'Error' },
    skipped: { icon: <AlertCircle size={11} />, color: '#8b8fb3', label: 'Skipped' },
  }[status];

  if (!cfg) return null;

  return (
    <div
      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
      style={{ background: `${cfg.color}22`, color: cfg.color, border: `1px solid ${cfg.color}44` }}
    >
      {cfg.icon}
      {cfg.label}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Flow Node
// ─────────────────────────────────────────────

const FlowNodeComponent = memo(({ id, data, selected }: NodeProps<FlowNodeData>) => {
  const { selectNode, nodes } = useWorkflowStore();

  const node = nodes.find((n) => n.id === id);
  const status = data.status || 'idle';
  const color = data.color || 'var(--accent-primary)';

  const handleClick = useCallback(() => {
    if (node) selectNode(node);
  }, [node, selectNode]);

  const isRunning = status === 'running';
  const isSuccess = status === 'success';
  const isError   = status === 'error';
  const isSkipped = status === 'skipped';

  const borderColor = selected
    ? 'var(--accent-primary)'
    : isError
    ? 'var(--accent-red)'
    : isSuccess
    ? 'var(--accent-green)'
    : isRunning
    ? 'var(--accent-cyan)'
    : isSkipped
    ? 'var(--text-muted)'
    : 'var(--border)';

  return (
    <div
      onClick={handleClick}
      className="relative cursor-pointer select-none group"
      style={{ minWidth: 240, opacity: isSkipped ? 0.5 : 1 }}
    >
      {/* Main card */}
      <div
        className="rounded-xl overflow-hidden transition-all duration-200"
        style={{
          background: 'var(--bg-card)',
          border: `1px solid ${borderColor}`,
          boxShadow: selected || isRunning || isSuccess || isError
            ? `0 0 0 1px ${borderColor}, var(--shadow-md)`
            : 'var(--shadow-sm)',
        }}

      >
        {/* Top color accent line */}
        <div 
          className="h-1 w-full" 
          style={{ background: color, opacity: selected ? 1 : 0.8 }}
        />

        {/* Content */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            {/* Category label */}
            <span
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              {data.category}
            </span>
            <StatusBadge status={status} />
          </div>

          <div className="flex items-center gap-3">
            {/* Icon container */}
            <div
              className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{
                background: selected ? `${color}22` : 'var(--bg-surface)',
                border: `1px solid ${selected ? `${color}44` : 'var(--border)'}`,
                color: color,
              }}
            >
              {isRunning ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <NodeIcon name={data.icon} size={16} />
              )}
            </div>

            {/* Label */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white truncate">{data.label}</div>
              {data.config?.model && (
                <div className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                  {String(data.config.model)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Result preview */}
        {isSuccess && data.result && (
          <div
            className="mx-3 mb-3 px-3 py-2 rounded text-[10px] font-mono truncate"
            style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
          >
            {JSON.stringify((data.result as Record<string, unknown>)?.output ?? data.result).slice(0, 60)}…
          </div>
        )}
        {isError && data.error && (
          <div
            className="mx-3 mb-3 px-3 py-2 rounded text-[10px] truncate"
            style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-red)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
          >
            {data.error}
          </div>
        )}
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          left: -6,
          background: 'var(--bg-card)',
          border: `2px solid ${selected ? 'var(--accent-primary)' : 'var(--text-muted)'}`,
          width: 12,
          height: 12,
        }}
      />
      
      {data.nodeType === 'flow_if' ? (
        <>
          {/* True Handle */}
          <Handle
            id="true"
            type="source"
            position={Position.Right}
            style={{
              top: '35%',
              right: -6,
              background: 'var(--bg-card)',
              border: `2px solid var(--accent-green)`,
              width: 12,
              height: 12,
            }}
          />
          <div className="absolute right-[-28px] top-[30%] text-[9px] font-bold text-green-500">true</div>

          {/* False Handle */}
          <Handle
            id="false"
            type="source"
            position={Position.Right}
            style={{
              top: '65%',
              right: -6,
              background: 'var(--bg-card)',
              border: `2px solid var(--accent-red)`,
              width: 12,
              height: 12,
            }}
          />
          <div className="absolute right-[-32px] top-[60%] text-[9px] font-bold text-red-500">false</div>
        </>
      ) : (
        <Handle
          type="source"
          position={Position.Right}
          style={{
            right: -6,
            background: 'var(--bg-card)',
            border: `2px solid ${selected ? 'var(--accent-primary)' : 'var(--text-muted)'}`,
            width: 12,
            height: 12,
          }}
        />
      )}
    </div>
  );
});

FlowNodeComponent.displayName = 'FlowNode';

export default FlowNodeComponent;
