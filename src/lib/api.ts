import { Workflow, Execution, NodeResult } from '@/types/workflow';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─────────────────────────────────────────────
// Workflows
// ─────────────────────────────────────────────

export const api = {
  async getWorkflows(): Promise<{ workflows: Workflow[] }> {
    return request('/api/workflows');
  },

  async getWorkflow(id: string): Promise<Workflow> {
    return request(`/api/workflows/${id}`);
  },

  async createWorkflow(workflow: Omit<Workflow, 'id' | 'created_at' | 'updated_at'>): Promise<Workflow> {
    return request('/api/workflows', {
      method: 'POST',
      body: JSON.stringify(workflow),
    });
  },

  async updateWorkflow(id: string, workflow: Partial<Workflow>): Promise<Workflow> {
    return request(`/api/workflows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(workflow),
    });
  },

  async deleteWorkflow(id: string): Promise<void> {
    return request(`/api/workflows/${id}`, { method: 'DELETE' });
  },

  // ─────────────────────────────────────────────
  // Execution — streaming SSE
  // ─────────────────────────────────────────────

  async executeWorkflow(
    workflowId: string,
    inputData: Record<string, unknown>,
    onNodeComplete: (nodeId: string, result: NodeResult) => void,
    onComplete: (executionId: string, results: Record<string, NodeResult>) => void,
    onError: (error: string) => void,
  ): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workflow_id: workflowId, input_data: inputData }),
    });

    if (!res.ok || !res.body) {
      onError('Failed to start execution');
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value);
      const lines = text.split('\n').filter(Boolean);

      for (const line of lines) {
        try {
          const event = JSON.parse(line);
          if (event.type === 'node_complete') {
            onNodeComplete(event.node_id, event.result);
          } else if (event.type === 'execution_complete') {
            onComplete(event.execution_id, event.results);
          } else if (event.type === 'execution_error') {
            onError(event.error);
          }
        } catch {
          // skip malformed lines
        }
      }
    }
  },

  async getExecution(id: string): Promise<Execution> {
    return request(`/api/executions/${id}`);
  },

  // ─────────────────────────────────────────────
  // Node types & Ollama
  // ─────────────────────────────────────────────

  async getNodeTypes(): Promise<{ categories: unknown[] }> {
    return request('/api/node-types');
  },

  async getOllamaModels(): Promise<{ models: string[]; status: string }> {
    return request('/api/ollama/models');
  },

  async healthCheck(): Promise<{ status: string }> {
    return request('/api/health');
  },
};
