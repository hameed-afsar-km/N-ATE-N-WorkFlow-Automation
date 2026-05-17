import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
  Connection,
} from '@xyflow/react';
import { v4 as uuid } from 'uuid';
import {
  FlowNode,
  FlowEdge,
  Workflow,
  ExecutionStatus,
  NodeResult,
  ToastMessage,
} from '@/types/workflow';
import { NodeTypeId, NodeTypeDef } from '@/types/workflow';
import { NODE_DEF_MAP } from '@/lib/nodeDefinitions';
import { api } from '@/lib/api';

// ─────────────────────────────────────────────
// Store Interface
// ─────────────────────────────────────────────

interface WorkflowStore {
  // Canvas
  nodes: FlowNode[];
  edges: FlowEdge[];
  selectedNode: FlowNode | null;

  // History Stacks
  historyStack: { nodes: FlowNode[]; edges: FlowEdge[] }[];
  futureStack: { nodes: FlowNode[]; edges: FlowEdge[] }[];

  // Workflows
  workflows: Workflow[];
  activeWorkflow: Workflow | null;
  workflowName: string;

  // Execution
  executionStatus: ExecutionStatus;
  nodeStatuses: Record<string, 'idle' | 'running' | 'success' | 'error' | 'skipped'>;
  nodeResults: Record<string, NodeResult>;
  executionId: string | null;

  // UI
  isSidebarOpen: boolean;
  isConfigPanelOpen: boolean;
  activeTab: 'nodes' | 'workflows' | 'executions';
  toasts: ToastMessage[];
  ollamaModels: string[];
  ollamaStatus: 'connected' | 'disconnected' | 'checking';
  isLoading: boolean;

  // ── Actions ──────────────────────────────────────

  // Canvas actions
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (typeDef: NodeTypeDef, position?: { x: number; y: number }) => void;
  updateNodeConfig: (nodeId: string, config: Record<string, unknown>) => void;
  deleteNode: (nodeId: string) => void;
  selectNode: (node: FlowNode | null) => void;
  duplicateNode: (nodeId: string) => void;
  
  // History actions
  pushToHistory: () => void;
  undo: () => void;
  redo: () => void;

  // Workflow actions
  loadWorkflows: () => Promise<void>;
  saveWorkflow: () => Promise<void>;
  loadWorkflow: (id: string) => Promise<void>;
  newWorkflow: () => void;
  deleteWorkflow: (id: string) => Promise<void>;
  setWorkflowName: (name: string) => void;

  // Execution
  executeWorkflow: (inputData?: Record<string, unknown>) => Promise<void>;
  clearExecution: () => void;

  // UI actions
  toggleSidebar: () => void;
  setActiveTab: (tab: 'nodes' | 'workflows' | 'executions') => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  loadOllamaModels: () => Promise<void>;
  setIsLoading: (v: boolean) => void;
}

// ─────────────────────────────────────────────
// Default nodes for demo
// ─────────────────────────────────────────────

const DEFAULT_NODES: FlowNode[] = [
  {
    id: 'node-1',
    type: 'flowNode',
    position: { x: 150, y: 200 },
    data: {
      label: 'Manual Trigger',
      nodeType: 'trigger_manual',
      category: 'trigger',
      color: '#7c3aed',
      icon: 'Play',
      config: {},
      status: 'idle',
    },
  },
  {
    id: 'node-2',
    type: 'flowNode',
    position: { x: 450, y: 200 },
    data: {
      label: 'LLM Chat',
      nodeType: 'ai_llm',
      category: 'ai',
      color: '#0284c7',
      icon: 'Brain',
      config: {
        model: 'llama3.2',
        prompt: 'Tell me a fun fact about AI.',
        system_prompt: 'You are a helpful AI assistant.',
        temperature: 0.7,
      },
      status: 'idle',
    },
  },
];

const DEFAULT_EDGES: FlowEdge[] = [
  {
    id: 'edge-1',
    source: 'node-1',
    target: 'node-2',
    type: 'smoothstep',
    animated: false,
  },
];

// ─────────────────────────────────────────────
// Zustand Store
// ─────────────────────────────────────────────

export const useWorkflowStore = create<WorkflowStore>()(
  subscribeWithSelector((set, get) => ({
    nodes: DEFAULT_NODES,
    edges: DEFAULT_EDGES,
    selectedNode: null,
    workflows: [],
    activeWorkflow: null,
    workflowName: 'My First Workflow',
    executionStatus: 'idle',
    nodeStatuses: {},
    nodeResults: {},
    executionId: null,
    isSidebarOpen: true,
    isConfigPanelOpen: false,
    activeTab: 'nodes',
    toasts: [],
    ollamaModels: ['llama3.2', 'mistral', 'phi3'],
    ollamaStatus: 'checking',
    isLoading: false,
    historyStack: [],
    futureStack: [],

    // ── Canvas ─────────────────────────────────────

    onNodesChange: (changes) => {
      const hasRemove = changes.some((c) => c.type === 'remove');
      if (hasRemove) {
        get().pushToHistory();
      }
      set((s) => ({ nodes: applyNodeChanges(changes, s.nodes) as FlowNode[] }));
    },

    onEdgesChange: (changes) => {
      const hasRemove = changes.some((c) => c.type === 'remove');
      if (hasRemove) {
        get().pushToHistory();
      }
      set((s) => ({ edges: applyEdgeChanges(changes, s.edges) as FlowEdge[] }));
    },

    onConnect: (connection) => {
      get().pushToHistory();
      set((s) => ({
        edges: addEdge(
          { ...connection, type: 'smoothstep', animated: false },
          s.edges
        ) as FlowEdge[],
      }));
    },

    addNode: (typeDef, position = { x: 300, y: 300 }) => {
      get().pushToHistory();
      const id = `node-${uuid()}`;
      const newNode: FlowNode = {
        id,
        type: 'flowNode',
        position,
        data: {
          label: typeDef.label,
          nodeType: typeDef.type,
          category: typeDef.category,
          color: typeDef.color,
          icon: typeDef.icon,
          config: { ...typeDef.defaultData },
          status: 'idle',
        },
      };
      set((s) => ({ nodes: [...s.nodes, newNode], selectedNode: newNode }));
    },

    updateNodeConfig: (nodeId, config) => {
      get().pushToHistory();
      set((s) => ({
        nodes: s.nodes.map((n) =>
          n.id === nodeId
            ? { ...n, data: { ...n.data, config: { ...n.data.config, ...config } } }
            : n
        ),
        selectedNode:
          s.selectedNode?.id === nodeId
            ? { ...s.selectedNode, data: { ...s.selectedNode.data, config: { ...s.selectedNode.data.config, ...config } } }
            : s.selectedNode,
      }));
    },

    deleteNode: (nodeId) => {
      get().pushToHistory();
      set((s) => ({
        nodes: s.nodes.filter((n) => n.id !== nodeId),
        edges: s.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
        selectedNode: s.selectedNode?.id === nodeId ? null : s.selectedNode,
      }));
    },

    selectNode: (node) => {
      set({ selectedNode: node, isConfigPanelOpen: !!node });
    },

    duplicateNode: (nodeId) => {
      get().pushToHistory();
      const node = get().nodes.find((n) => n.id === nodeId);
      if (!node) return;
      const id = `node-${uuid()}`;
      const newNode: FlowNode = {
        ...node,
        id,
        position: { x: node.position.x + 50, y: node.position.y + 50 },
        data: { ...node.data, status: 'idle', result: undefined },
      };
      set((s) => ({ nodes: [...s.nodes, newNode] }));
    },

    // ── History actions ───────────────────────────

    pushToHistory: () => {
      const { nodes, edges } = get();
      const currentSnapshot = {
        nodes: JSON.parse(JSON.stringify(nodes)),
        edges: JSON.parse(JSON.stringify(edges))
      };
      set((s) => ({
        historyStack: [...s.historyStack, currentSnapshot].slice(-50),
        futureStack: []
      }));
    },

    undo: () => {
      const { historyStack, futureStack, nodes, edges } = get();
      if (historyStack.length === 0) return;
      
      const newHistory = [...historyStack];
      const previous = newHistory.pop()!;
      const currentSnapshot = {
        nodes: JSON.parse(JSON.stringify(nodes)),
        edges: JSON.parse(JSON.stringify(edges))
      };
      
      set({
        nodes: previous.nodes,
        edges: previous.edges,
        historyStack: newHistory,
        futureStack: [currentSnapshot, ...futureStack].slice(0, 50)
      });
    },

    redo: () => {
      const { historyStack, futureStack, nodes, edges } = get();
      if (futureStack.length === 0) return;
      
      const newFuture = [...futureStack];
      const next = newFuture.shift()!;
      const currentSnapshot = {
        nodes: JSON.parse(JSON.stringify(nodes)),
        edges: JSON.parse(JSON.stringify(edges))
      };
      
      set({
        nodes: next.nodes,
        edges: next.edges,
        futureStack: newFuture,
        historyStack: [...historyStack, currentSnapshot].slice(-50)
      });
    },

    // ── Workflows ─────────────────────────────────

    loadWorkflows: async () => {
      try {
        const { workflows } = await api.getWorkflows();
        set({ workflows });
      } catch {
        // Backend may not be running yet
      }
    },

    saveWorkflow: async () => {
      const { nodes, edges, activeWorkflow, workflowName } = get();
      set({ isLoading: true });
      try {
        const payload = {
          name: workflowName,
          description: '',
          nodes,
          edges,
          active: false,
        };
        let saved: Workflow;
        if (activeWorkflow?.id) {
          saved = await api.updateWorkflow(activeWorkflow.id, payload);
        } else {
          saved = await api.createWorkflow(payload);
        }
        set((s) => ({
          activeWorkflow: saved,
          workflows: s.workflows.some((w) => w.id === saved.id)
            ? s.workflows.map((w) => (w.id === saved.id ? saved : w))
            : [...s.workflows, saved],
        }));
        get().addToast({ type: 'success', title: 'Workflow saved!' });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        get().addToast({ type: 'error', title: 'Save failed', message: msg });
      } finally {
        set({ isLoading: false });
      }
    },

    loadWorkflow: async (id) => {
      set({ isLoading: true });
      try {
        const wf = await api.getWorkflow(id);
        set({
          nodes: wf.nodes,
          edges: wf.edges,
          activeWorkflow: wf,
          workflowName: wf.name,
          selectedNode: null,
          isConfigPanelOpen: false,
          nodeStatuses: {},
          nodeResults: {},
          executionStatus: 'idle',
        });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        get().addToast({ type: 'error', title: 'Load failed', message: msg });
      } finally {
        set({ isLoading: false });
      }
    },

    newWorkflow: () => {
      set({
        nodes: [],
        edges: [],
        activeWorkflow: null,
        workflowName: 'New Workflow',
        selectedNode: null,
        isConfigPanelOpen: false,
        nodeStatuses: {},
        nodeResults: {},
        executionStatus: 'idle',
      });
    },

    deleteWorkflow: async (id) => {
      try {
        await api.deleteWorkflow(id);
        set((s) => ({
          workflows: s.workflows.filter((w) => w.id !== id),
          activeWorkflow: s.activeWorkflow?.id === id ? null : s.activeWorkflow,
        }));
        get().addToast({ type: 'success', title: 'Workflow deleted' });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        get().addToast({ type: 'error', title: 'Delete failed', message: msg });
      }
    },

    setWorkflowName: (name) => set({ workflowName: name }),

    // ── Execution ─────────────────────────────────

    executeWorkflow: async (inputData = {}) => {
      const { activeWorkflow, nodes, edges, workflowName } = get();

      // Auto-save/create first to ensure backend has the latest layout and recovers from restarts
      set({ isLoading: true });
      let workflowId = activeWorkflow?.id;
      try {
        const payload = {
          name: workflowName,
          description: '',
          nodes,
          edges,
          active: false,
        };
        let saved: Workflow;
        if (workflowId) {
          try {
            saved = await api.updateWorkflow(workflowId, payload);
          } catch {
            // Re-create if backend restarted and lost the in-memory workflow
            saved = await api.createWorkflow(payload);
          }
        } else {
          saved = await api.createWorkflow(payload);
        }
        workflowId = saved.id;
        set({ activeWorkflow: saved });
      } catch {
        get().addToast({ type: 'error', title: 'Cannot run: backend not connected' });
        set({ isLoading: false });
        return;
      }
      set({ isLoading: false });

      // Reset statuses
      const resetStatuses: Record<string, 'running'> = {};
      nodes.forEach((n) => { resetStatuses[n.id] = 'running'; });
      set({
        executionStatus: 'running',
        nodeStatuses: resetStatuses,
        nodeResults: {},
        executionId: null,
      });

      // Update node display to running
      set((s) => ({
        nodes: s.nodes.map((n) => ({
          ...n,
          data: { ...n.data, status: 'running', result: undefined },
        })),
      }));

      await api.executeWorkflow(
        workflowId,
        inputData,
        (nodeId, result) => {
          const status = result.status === 'error' ? 'error' : result.status === 'skipped' ? 'skipped' : 'success';
          set((s) => ({
            nodeStatuses: { ...s.nodeStatuses, [nodeId]: status },
            nodeResults: { ...s.nodeResults, [nodeId]: result },
            nodes: s.nodes.map((n) =>
              n.id === nodeId
                ? { ...n, data: { ...n.data, status, result } }
                : n
            ),
          }));
        },
        (executionId, results) => {
          const allOk = Object.values(results).every((r) => r.status !== 'error');
          set({
            executionStatus: allOk ? 'success' : 'error',
            executionId,
          });
          get().addToast({
            type: allOk ? 'success' : 'error',
            title: allOk ? '✅ Workflow completed!' : '❌ Workflow failed',
          });
        },
        (error) => {
          set({ executionStatus: 'error' });
          get().addToast({ type: 'error', title: 'Execution error', message: error });
        }
      );
    },

    clearExecution: () => {
      set((s) => ({
        executionStatus: 'idle',
        nodeStatuses: {},
        nodeResults: {},
        executionId: null,
        nodes: s.nodes.map((n) => ({
          ...n,
          data: { ...n.data, status: 'idle', result: undefined },
        })),
      }));
    },

    // ── UI ────────────────────────────────────────

    toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),

    setActiveTab: (tab) => set({ activeTab: tab }),

    addToast: (toast) => {
      const id = uuid();
      set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
      setTimeout(() => {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
      }, 4000);
    },

    removeToast: (id) => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    },

    loadOllamaModels: async () => {
      set({ ollamaStatus: 'checking' });
      try {
        const { models, status } = await api.getOllamaModels();
        set({ ollamaModels: models, ollamaStatus: status as 'connected' | 'disconnected' });
      } catch {
        set({ ollamaStatus: 'disconnected' });
      }
    },

    setIsLoading: (v) => set({ isLoading: v }),
  }))
);
