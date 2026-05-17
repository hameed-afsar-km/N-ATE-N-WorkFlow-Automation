'use client';

import React, { useState } from 'react';
import { useWorkflowStore } from '@/store/workflowStore';
import { NODE_DEF_MAP } from '@/lib/nodeDefinitions';
import * as Icons from 'lucide-react';
import { X, ChevronRight, Trash2, Copy, Settings2, Cpu } from 'lucide-react';

function NodeIcon({ name, size = 18 }: { name: string; size?: number }) {
  const IconComp = (Icons as Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>>)[name];
  if (!IconComp) return <Icons.Box size={size} strokeWidth={1.5} />;
  return <IconComp size={size} strokeWidth={1.5} />;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#4a4e78' }}>{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded-xl text-xs outline-none transition-all"
      style={{ background: 'rgba(21,23,41,0.8)', border: '1px solid rgba(37,40,72,0.8)', color: '#f0f1ff' }}
      onFocus={e => (e.currentTarget.style.borderColor = 'rgba(108,99,255,0.6)')}
      onBlur={e => (e.currentTarget.style.borderColor = 'rgba(37,40,72,0.8)')}
    />
  );
}

function Textarea({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2 rounded-xl text-xs outline-none resize-none font-mono transition-all"
      style={{ background: 'rgba(21,23,41,0.8)', border: '1px solid rgba(37,40,72,0.8)', color: '#f0f1ff' }}
      onFocus={e => (e.currentTarget.style.borderColor = 'rgba(108,99,255,0.6)')}
      onBlur={e => (e.currentTarget.style.borderColor = 'rgba(37,40,72,0.8)')}
    />
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-xl text-xs outline-none cursor-pointer"
      style={{ background: 'rgba(21,23,41,0.8)', border: '1px solid rgba(37,40,72,0.8)', color: '#f0f1ff' }}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

// ─── Config forms per node type ─────────────────────────────────

function LLMConfig({ config, update, models }: { config: Record<string, unknown>; update: (k: string, v: unknown) => void; models: string[] }) {
  return (
    <>
      <Field label="Model">
        <Select value={String(config.model ?? 'llama3.2')} onChange={v => update('model', v)}
          options={models.map(m => ({ value: m, label: m }))} />
      </Field>
      <Field label="System Prompt">
        <Textarea value={String(config.system_prompt ?? '')} onChange={v => update('system_prompt', v)} placeholder="You are a helpful assistant." rows={2} />
      </Field>
      <Field label="User Prompt (use {{input}} for input)">
        <Textarea value={String(config.prompt ?? '')} onChange={v => update('prompt', v)} placeholder="{{input}}" rows={3} />
      </Field>
      <Field label="Temperature">
        <div className="flex items-center gap-3">
          <input type="range" min="0" max="1" step="0.05" value={Number(config.temperature ?? 0.7)}
            onChange={e => update('temperature', parseFloat(e.target.value))}
            className="flex-1 accent-purple-500" />
          <span className="text-xs font-mono w-8 text-right" style={{ color: '#6c63ff' }}>{Number(config.temperature ?? 0.7).toFixed(2)}</span>
        </div>
      </Field>
    </>
  );
}

function AgentConfig({ config, update, models }: { config: Record<string, unknown>; update: (k: string, v: unknown) => void; models: string[] }) {
  return (
    <>
      <Field label="Model">
        <Select value={String(config.model ?? 'llama3.2')} onChange={v => update('model', v)} options={models.map(m => ({ value: m, label: m }))} />
      </Field>
      <Field label="Agent Goal">
        <Textarea value={String(config.goal ?? '')} onChange={v => update('goal', v)} placeholder="Complete the task: {{input}}" rows={4} />
      </Field>
    </>
  );
}

function HttpConfig({ config, update }: { config: Record<string, unknown>; update: (k: string, v: unknown) => void }) {
  return (
    <>
      <Field label="Method">
        <Select value={String(config.method ?? 'GET')} onChange={v => update('method', v)}
          options={['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(m => ({ value: m, label: m }))} />
      </Field>
      <Field label="URL"><Input value={String(config.url ?? '')} onChange={v => update('url', v)} placeholder="https://api.example.com/data" /></Field>
    </>
  );
}

function ScheduleConfig({ config, update }: { config: Record<string, unknown>; update: (k: string, v: unknown) => void }) {
  return (
    <Field label="Cron Expression"><Input value={String(config.cron ?? '*/5 * * * *')} onChange={v => update('cron', v)} placeholder="*/5 * * * *" /></Field>
  );
}

function ManualTriggerConfig({ config, update }: { config: Record<string, unknown>; update: (k: string, v: unknown) => void }) {
  return (
    <Field label="Mock Input Payload (JSON)">
      <Textarea
        value={String(config.payload ?? '{\n  "message": ""\n}')}
        onChange={v => update('payload', v)}
        placeholder='{\n  "message": "test"\n}'
        rows={10}
      />
    </Field>
  );
}

function FilterConfig({ config, update }: { config: Record<string, unknown>; update: (k: string, v: unknown) => void }) {
  return (
    <>
      <Field label="Field"><Input value={String(config.field ?? '')} onChange={v => update('field', v)} placeholder="value" /></Field>
      <Field label="Operator">
        <Select value={String(config.operator ?? 'exists')} onChange={v => update('operator', v)}
          options={['exists', 'equals', 'contains', 'not_empty', 'greater_than', 'less_than'].map(o => ({ value: o, label: o }))} />
      </Field>
      <Field label="Value"><Input value={String(config.value ?? '')} onChange={v => update('value', v)} placeholder="Compare value" /></Field>
    </>
  );
}

function WaitConfig({ config, update }: { config: Record<string, unknown>; update: (k: string, v: unknown) => void }) {
  return (
    <Field label="Wait (seconds)">
      <Input type="number" value={String(config.seconds ?? 1)} onChange={v => update('seconds', parseFloat(v))} placeholder="1" />
    </Field>
  );
}

function CodeConfig({ config, update }: { config: Record<string, unknown>; update: (k: string, v: unknown) => void }) {
  return (
    <Field label="Python Code (use 'inputs' dict, set 'output')">
      <Textarea value={String(config.code ?? 'output = inputs')} onChange={v => update('code', v)} rows={8} />
    </Field>
  );
}

function GenericConfig({ config, update }: { config: Record<string, unknown>; update: (k: string, v: unknown) => void }) {
  return (
    <>
      {Object.entries(config).map(([key, val]) => (
        <Field key={key} label={key}>
          {typeof val === 'string' && val.length > 60
            ? <Textarea value={val} onChange={v => update(key, v)} />
            : <Input value={String(val ?? '')} onChange={v => update(key, v)} />}
        </Field>
      ))}
    </>
  );
}

// ─── Main Config Panel ──────────────────────────────────────────

export default function ConfigPanel() {
  const { selectedNode, isConfigPanelOpen, selectNode, updateNodeConfig, deleteNode, duplicateNode, ollamaModels } = useWorkflowStore();
  const [panelTab, setPanelTab] = useState<'config' | 'output'>('config');

  if (!isConfigPanelOpen || !selectedNode) return null;

  const def = NODE_DEF_MAP[selectedNode.data.nodeType];
  const config = selectedNode.data.config ?? {};
  const update = (key: string, val: unknown) => updateNodeConfig(selectedNode.id, { [key]: val });

  const renderConfig = () => {
    const t = selectedNode.data.nodeType;
    if (t === 'ai_llm') return <LLMConfig config={config} update={update} models={ollamaModels} />;
    if (t === 'ai_agent') return <AgentConfig config={config} update={update} models={ollamaModels} />;
    if (t === 'ai_summarize' || t === 'ai_extract' || t === 'ai_classify') return <LLMConfig config={config} update={update} models={ollamaModels} />;
    if (t === 'http_request') return <HttpConfig config={config} update={update} />;
    if (t === 'trigger_schedule') return <ScheduleConfig config={config} update={update} />;
    if (t === 'trigger_manual') return <ManualTriggerConfig config={config} update={update} />;
    if (t === 'data_filter' || t === 'flow_if') return <FilterConfig config={config} update={update} />;
    if (t === 'flow_wait') return <WaitConfig config={config} update={update} />;
    if (t === 'data_code') return <CodeConfig config={config} update={update} />;
    if (Object.keys(config).length === 0) return <p className="text-xs text-center py-6" style={{ color: '#4a4e78' }}>No configuration needed for this node.</p>;
    return <GenericConfig config={config} update={update} />;
  };

  const renderOutput = () => {
    const status = selectedNode.data.status;
    const result = selectedNode.data.result;

    if (!status) {
      return (
        <div className="flex flex-col items-center justify-center h-48 text-center px-4">
          <Icons.Play size={20} className="mb-2" style={{ color: '#4a4e78' }} />
          <p className="text-xs" style={{ color: '#4a4e78' }}>Node has not run yet.</p>
          <p className="text-[10px] mt-1" style={{ color: '#2b2e50' }}>Trigger the workflow to view execution data.</p>
        </div>
      );
    }

    if (status === 'running') {
      return (
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <div className="w-5 h-5 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin mb-2" />
          <p className="text-xs" style={{ color: '#f0f1ff' }}>Executing node...</p>
        </div>
      );
    }

    if (status === 'skipped') {
      return (
        <div className="flex flex-col items-center justify-center h-48 text-center px-4">
          <Icons.CornerDownRight size={20} className="mb-2" style={{ color: '#4a4e78' }} />
          <p className="text-xs font-semibold text-gray-400">Node Skipped</p>
          <p className="text-[10px] mt-1" style={{ color: '#4a4e78' }}>This branch was skipped due to routing logic.</p>
        </div>
      );
    }

    if (status === 'error') {
      return (
        <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-xs text-red-400 font-mono whitespace-pre-wrap break-all">
          <div className="font-bold uppercase tracking-wider text-[10px] text-red-500 mb-1">Execution Error:</div>
          {String(selectedNode.data.error || 'Unknown error occurred')}
        </div>
      );
    }

    // Success Output
    const outputData = (result as Record<string, unknown>)?.output ?? result;
    const jsonString = JSON.stringify(outputData, null, 2);

    // Check if there is a main text/markdown content to display prominently (like LLM output)
    let textValue = '';
    if (outputData && typeof outputData === 'object') {
      const obj = outputData as Record<string, unknown>;
      if (typeof obj.text === 'string') textValue = obj.text;
      else if (typeof obj.summary === 'string') textValue = obj.summary;
      else if (typeof obj.result === 'string') textValue = obj.result;
      else if (typeof obj.category === 'string') textValue = `Category: ${obj.category}`;
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-500">Success</span>
          <button
            onClick={() => navigator.clipboard.writeText(textValue || jsonString)}
            className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] text-white transition-colors"
          >
            <Icons.Copy size={11} /> Copy
          </button>
        </div>

        {textValue && (
          <div className="space-y-1.5">
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#4a4e78]">Response Content</label>
            <div className="p-3 rounded-xl border text-xs leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap font-sans"
                 style={{ background: 'rgba(21,23,41,0.8)', borderColor: 'rgba(37,40,72,0.8)', color: '#f0f1ff' }}>
              {textValue}
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#4a4e78]">JSON Result</label>
          <pre className="p-3 rounded-xl border text-[10px] font-mono overflow-auto max-h-64"
               style={{ background: 'rgba(10,11,20,0.8)', borderColor: 'rgba(37,40,72,0.8)', color: '#c0c5ff' }}>
            {jsonString}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-shrink-0 flex flex-col h-full animate-slide-right"
      style={{ width: 300, background: 'rgba(10,11,20,0.98)', borderLeft: '1px solid rgba(37,40,72,0.8)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid rgba(37,40,72,0.8)', background: `${selectedNode.data.color}11` }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${selectedNode.data.color}22`, color: selectedNode.data.color }}>
          <NodeIcon name={selectedNode.data.icon} size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-white truncate">{selectedNode.data.label}</div>
          <div className="text-[10px]" style={{ color: '#4a4e78' }}>{def?.description}</div>
        </div>
        <button onClick={() => selectNode(null)} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" style={{ color: '#4a4e78' }}>
          <X size={15} />
        </button>
      </div>

      {/* Node ID */}
      <div className="flex items-center gap-2 px-4 py-2" style={{ borderBottom: '1px solid rgba(37,40,72,0.6)', background: 'rgba(21,23,41,0.4)' }}>
        <Settings2 size={11} style={{ color: '#4a4e78' }} />
        <span className="text-[10px] font-mono" style={{ color: '#4a4e78' }}>ID: {selectedNode.id.slice(0, 18)}</span>
      </div>

      {/* Tabs */}
      <div className="flex px-4" style={{ borderBottom: '1px solid rgba(37,40,72,0.6)', background: 'rgba(21,23,41,0.2)' }}>
        <button
          onClick={() => setPanelTab('config')}
          className="flex-1 py-2 text-center text-xs font-semibold border-b-2 transition-all"
          style={{
            borderColor: panelTab === 'config' ? '#6c63ff' : 'transparent',
            color: panelTab === 'config' ? '#f0f1ff' : '#4a4e78'
          }}
        >
          Parameters
        </button>
        <button
          onClick={() => setPanelTab('output')}
          className="flex-1 py-2 text-center text-xs font-semibold border-b-2 transition-all relative"
          style={{
            borderColor: panelTab === 'output' ? '#6c63ff' : 'transparent',
            color: panelTab === 'output' ? '#f0f1ff' : '#4a4e78'
          }}
        >
          Output
          {selectedNode.data.status === 'success' && (
            <span className="absolute top-2.5 right-6 w-1.5 h-1.5 rounded-full bg-emerald-500" />
          )}
          {selectedNode.data.status === 'error' && (
            <span className="absolute top-2.5 right-6 w-1.5 h-1.5 rounded-full bg-rose-500" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {panelTab === 'config' ? renderConfig() : renderOutput()}
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-4 py-3" style={{ borderTop: '1px solid rgba(37,40,72,0.8)' }}>
        <button onClick={() => duplicateNode(selectedNode.id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all"
          style={{ background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.25)', color: '#6c63ff' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(108,99,255,0.2)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(108,99,255,0.1)')}>
          <Copy size={13} /> Duplicate
        </button>
        <button onClick={() => { deleteNode(selectedNode.id); selectNode(null); }}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
          style={{ background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.25)', color: '#ff4d6d' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,77,109,0.2)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,77,109,0.1)')}>
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
