import { Node, Edge } from '@xyflow/react';

// ─────────────────────────────────────────────
// Node Categories & Types
// ─────────────────────────────────────────────

export type NodeCategory = 'trigger' | 'ai' | 'data' | 'integration' | 'flow';

export type NodeTypeId =
  | 'trigger_manual' | 'trigger_schedule' | 'trigger_webhook'
  | 'ai_llm' | 'ai_agent' | 'ai_summarize' | 'ai_extract' | 'ai_classify'
  | 'data_set' | 'data_filter' | 'data_merge' | 'data_split' | 'data_code'
  | 'http_request' | 'email_send' | 'slack_message' | 'file_read' | 'file_write'
  | 'flow_if' | 'flow_switch' | 'flow_loop' | 'flow_wait';

export interface NodeTypeDef {
  type: NodeTypeId;
  label: string;
  icon: string;
  description: string;
  category: NodeCategory;
  color: string;
  defaultData: Record<string, unknown>;
}

// ─────────────────────────────────────────────
// Workflow Node Data
// ─────────────────────────────────────────────

export interface FlowNodeData {
  label: string;
  nodeType: NodeTypeId;
  category: NodeCategory;
  color: string;
  icon: string;
  config: Record<string, unknown>;
  status?: 'idle' | 'running' | 'success' | 'error' | 'skipped';
  result?: unknown;
  error?: string;
  [key: string]: unknown;
}

export type FlowNode = Node<FlowNodeData>;
export type FlowEdge = Edge;

// ─────────────────────────────────────────────
// Workflow
// ─────────────────────────────────────────────

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

// ─────────────────────────────────────────────
// Execution
// ─────────────────────────────────────────────

export type ExecutionStatus = 'idle' | 'running' | 'success' | 'error';

export interface NodeResult {
  status: 'success' | 'error' | 'skipped';
  output?: unknown;
  error?: string;
  [key: string]: unknown;
}

export interface Execution {
  id: string;
  workflow_id: string;
  status: ExecutionStatus;
  started_at?: string;
  finished_at?: string;
  node_results: Record<string, NodeResult>;
  input_data?: Record<string, unknown>;
}

// ─────────────────────────────────────────────
// UI State
// ─────────────────────────────────────────────

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}
