import { NodeTypeId, NodeCategory, NodeTypeDef } from '@/types/workflow';

export const NODE_CATEGORY_COLORS: Record<NodeCategory, string> = {
  trigger:     '#7c3aed',
  ai:          '#0284c7',
  data:        '#059669',
  integration: '#d97706',
  flow:        '#dc2626',
};

export const NODE_DEFINITIONS: NodeTypeDef[] = [
  // ── Triggers ───────────────────────────────────────
  {
    type: 'trigger_manual',
    label: 'Manual Trigger',
    icon: 'Play',
    description: 'Start workflow manually',
    category: 'trigger',
    color: '#7c3aed',
    defaultData: {
      payload: '{\n  "message": "I want to buy 50 enterprise licenses..."\n}',
    },
  },
  {
    type: 'trigger_schedule',
    label: 'Schedule',
    icon: 'Clock',
    description: 'Run on a cron schedule',
    category: 'trigger',
    color: '#7c3aed',
    defaultData: { cron: '*/5 * * * *' },
  },
  {
    type: 'trigger_webhook',
    label: 'Webhook',
    icon: 'Webhook',
    description: 'HTTP webhook trigger',
    category: 'trigger',
    color: '#7c3aed',
    defaultData: { path: '/webhook', method: 'POST' },
  },

  // ── AI / LLM ───────────────────────────────────────
  {
    type: 'ai_llm',
    label: 'LLM Chat',
    icon: 'Brain',
    description: 'Chat with local Ollama LLM',
    category: 'ai',
    color: '#0284c7',
    defaultData: {
      model: 'llama3.2',
      prompt: '{{input}}',
      system_prompt: 'You are a helpful AI assistant.',
      temperature: 0.7,
    },
  },
  {
    type: 'ai_agent',
    label: 'AI Agent',
    icon: 'Bot',
    description: 'LangGraph autonomous agent',
    category: 'ai',
    color: '#0284c7',
    defaultData: { model: 'llama3.2', goal: 'Complete the task: {{input}}' },
  },
  {
    type: 'ai_summarize',
    label: 'Summarizer',
    icon: 'FileText',
    description: 'Summarize text with AI',
    category: 'ai',
    color: '#0284c7',
    defaultData: { model: 'llama3.2', max_length: '3 sentences' },
  },
  {
    type: 'ai_extract',
    label: 'Data Extractor',
    icon: 'Scissors',
    description: 'Extract structured data',
    category: 'ai',
    color: '#0284c7',
    defaultData: { model: 'llama3.2', fields: 'name, email, phone' },
  },
  {
    type: 'ai_classify',
    label: 'Classifier',
    icon: 'Tag',
    description: 'Classify input text',
    category: 'ai',
    color: '#0284c7',
    defaultData: { model: 'llama3.2', categories: 'positive, negative, neutral' },
  },

  // ── Data ───────────────────────────────────────────
  {
    type: 'data_set',
    label: 'Set Data',
    icon: 'Database',
    description: 'Set or transform data',
    category: 'data',
    color: '#059669',
    defaultData: { assignments: {} },
  },
  {
    type: 'data_filter',
    label: 'Filter',
    icon: 'Filter',
    description: 'Filter items by condition',
    category: 'data',
    color: '#059669',
    defaultData: { field: 'value', operator: 'exists', value: '' },
  },
  {
    type: 'data_merge',
    label: 'Merge',
    icon: 'Merge',
    description: 'Merge data from branches',
    category: 'data',
    color: '#059669',
    defaultData: { strategy: 'combine' },
  },
  {
    type: 'data_split',
    label: 'Split',
    icon: 'Split',
    description: 'Split data into branches',
    category: 'data',
    color: '#059669',
    defaultData: { field: 'items' },
  },
  {
    type: 'data_code',
    label: 'Code',
    icon: 'Code2',
    description: 'Run custom Python code',
    category: 'data',
    color: '#059669',
    defaultData: { code: 'output = inputs' },
  },

  // ── Integrations ───────────────────────────────────
  {
    type: 'http_request',
    label: 'HTTP Request',
    icon: 'Globe',
    description: 'Make HTTP API calls',
    category: 'integration',
    color: '#d97706',
    defaultData: { method: 'GET', url: 'https://api.example.com/data', headers: {} },
  },
  {
    type: 'email_send',
    label: 'Send Email',
    icon: 'Mail',
    description: 'Send email via SMTP',
    category: 'integration',
    color: '#d97706',
    defaultData: { 
      to: '', 
      subject: 'Automated Email', 
      body: '{{output}}',
      smtp_host: 'smtp.gmail.com',
      smtp_port: '587',
      smtp_user: '',
      smtp_password: ''
    },
  },
  {
    type: 'gmail_send',
    label: 'Gmail',
    icon: 'Mail',
    description: 'Send email via Google Mail',
    category: 'integration',
    color: '#ea4335',
    defaultData: { 
      to: '', 
      subject: 'Automated Email', 
      body: '{{output}}',
      user_email: '',
      app_password: ''
    },
  },
  {
    type: 'slack_message',
    label: 'Slack',
    icon: 'MessageSquare',
    description: 'Send Slack message',
    category: 'integration',
    color: '#d97706',
    defaultData: { webhook_url: '', channel: '#general', message: '{{output}}' },
  },
  {
    type: 'file_read',
    label: 'Read File',
    icon: 'FolderOpen',
    description: 'Read from filesystem',
    category: 'integration',
    color: '#d97706',
    defaultData: { path: '' },
  },
  {
    type: 'file_write',
    label: 'Write File',
    icon: 'Save',
    description: 'Write to filesystem',
    category: 'integration',
    color: '#d97706',
    defaultData: { path: 'output.txt' },
  },

  // ── Control Flow ───────────────────────────────────
  {
    type: 'flow_if',
    label: 'IF Condition',
    icon: 'GitBranch',
    description: 'Branch based on condition',
    category: 'flow',
    color: '#dc2626',
    defaultData: { field: 'value', operator: 'equals', value: '' },
  },
  {
    type: 'flow_switch',
    label: 'Switch',
    icon: 'ToggleLeft',
    description: 'Multi-branch switch',
    category: 'flow',
    color: '#dc2626',
    defaultData: { field: 'value', cases: {} },
  },
  {
    type: 'flow_loop',
    label: 'Loop',
    icon: 'RotateCw',
    description: 'Loop over items',
    category: 'flow',
    color: '#dc2626',
    defaultData: { type: 'for_each' },
  },
  {
    type: 'flow_wait',
    label: 'Wait',
    icon: 'Pause',
    description: 'Add a delay',
    category: 'flow',
    color: '#dc2626',
    defaultData: { seconds: 1 },
  },
];

export const NODE_DEF_MAP: Record<NodeTypeId, NodeTypeDef> = Object.fromEntries(
  NODE_DEFINITIONS.map(d => [d.type, d])
) as Record<NodeTypeId, NodeTypeDef>;

export const NODE_CATEGORIES = [
  { id: 'trigger' as NodeCategory,     label: 'Triggers',      color: '#7c3aed' },
  { id: 'ai' as NodeCategory,          label: 'AI & LLM',      color: '#0284c7' },
  { id: 'data' as NodeCategory,        label: 'Data',          color: '#059669' },
  { id: 'integration' as NodeCategory, label: 'Integrations',  color: '#d97706' },
  { id: 'flow' as NodeCategory,        label: 'Control Flow',  color: '#dc2626' },
];
