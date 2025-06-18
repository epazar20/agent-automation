// Agent Tipleri
export type AgentType = 
  | 'webScraper' 
  | 'webSearcher' 
  | 'codeInterpreter' 
  | 'dataAnalyst' 
  | 'imageGenerator'
  | 'textGenerator'
  | 'translator'
  | 'youtubeSummarizer'
  | 'researchAgent'
  | 'aiActionAnalysis'
  | 'mcpSupplierAgent'
  | 'conditional'
  | 'result';

// LLM Model Tipleri
export type LLMType = 'openai' | 'huggingface' | 'anthropic' | 'google';

// Finance Action Types
export interface FinanceActionType {
  id: number;
  typeCode: string;
  typeName: string;
  description: string;
  samplePrompt: string;
  endpointPath: string;
  jsonSchema: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: number[];
  updatedAt: number[];
}

export interface ActionTypesState {
  actionTypes: FinanceActionType[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
}

// Temel Model Konfigürasyonları
interface BaseModelConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  systemPrompt: string;
}

export interface OpenAIConfig extends BaseModelConfig {
  type: 'openai';
  apiKey: string;
  frequencyPenalty: number;
  presencePenalty: number;
}

export interface GeminiConfig extends BaseModelConfig {
  type: 'gemini';
  apiKey?: string;
  maxOutputTokens?: number;
}

export interface AnthropicConfig extends BaseModelConfig {
  type: 'anthropic';
  apiKey: string;
}

export interface LlamaConfig extends BaseModelConfig {
  type: 'llama2';
  repetitionPenalty: number;
}

export interface HuggingFaceConfig extends BaseModelConfig {
  type: 'huggingface';
  model: 'deepseek/deepseek-v3-0324' | 'google/gemma-3-27b-it';
}

export type ModelConfig = OpenAIConfig | GeminiConfig | AnthropicConfig | LlamaConfig | HuggingFaceConfig;

// Agent Konfigürasyonları
export interface BaseAgentConfig {
  name: string;
  description: string;
  modelConfig?: ModelConfig;
  content?: string;
  specialPrompt?: string;
}

export interface WebScraperConfig extends BaseAgentConfig {
  rules: {
    maxDepth: number;
    maxPages: number;
  };
}

export interface WebSearcherConfig extends BaseAgentConfig {
  maxResults: number;
  filters: {
    language: string;
  };
}

export interface CodeInterpreterConfig extends BaseAgentConfig {
  runtime: {
    python: boolean;
    javascript: boolean;
    r: boolean;
  };
  permissions: {
    fileSystem: boolean;
    network: boolean;
    subprocess: boolean;
  };
  libraries: string[];
  memoryLimit: number;
  timeoutSeconds: number;
}

export interface DataAnalystConfig extends BaseAgentConfig {
  file: File | null;
  content: string;
  xAxis: string;
  yAxis: string;
}

export interface ImageGeneratorConfig extends BaseAgentConfig {
  provider: 'dalle' | 'stable-diffusion' | 'midjourney';
  resolution: string;
  style: string;
  negativePrompt?: string;
  samplingSteps: number;
  seed?: number;
}

export interface TextGeneratorConfig extends BaseAgentConfig {
  maxLength: number;
  stopSequences?: string[];
  format: 'markdown' | 'html' | 'plain';
  style?: {
    tone: 'formal' | 'casual' | 'professional';
    audience: 'general' | 'technical' | 'academic';
  };
}

export interface TranslatorConfig extends BaseAgentConfig {
  targetLang: string;
}

export interface YoutubeSummarizerConfig extends BaseAgentConfig {
  url: string;
}

export interface ResearchAgentConfig extends BaseAgentConfig {
  topic: string;
  numLinks: number;
  depth: 'basic' | 'detailed' | 'comprehensive';
  language: string;
  includeSourceLinks: boolean;
  format: 'text' | 'markdown' | 'bullet';
}

export interface ResultConfig extends BaseAgentConfig {
  displayFormat: 'text' | 'json' | 'markdown' | 'html';
  autoRefresh: boolean;
  refreshInterval?: number;
  maxHistoryLength?: number;
}

export interface ConditionalConfig extends BaseAgentConfig {
  conditions: Array<{
    id: string;
    value1: {
      type: 'variable' | 'static';
      value: string; // variable name or static value
    };
    operator: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'greaterThan' | 'lessThan' | 'greaterThanOrEqual' | 'lessThanOrEqual' | 'startsWith' | 'endsWith' | 'isEmpty' | 'isNotEmpty' | 'like' | 'notLike';
    value2: {
      type: 'variable' | 'static';
      value: string; // variable name or static value
    };
  }>;
  combineOperator: 'AND' | 'OR';
  truePathColor: string;
  falsePathColor: string;
}

// Customer Types
export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string | null;
  updatedAt: string | null;
  fullName: string;
}

// New interface for accumulated node responses
export interface NodeResponse {
  nodeId: string;
  nodeType: string;
  actionType?: string;
  timestamp: string;
  response: any;
  customer?: any;
}

export interface AccumulatedResponses {
  responses: NodeResponse[];
  currentFlowId?: string;
  lastUpdate: string;
}

export interface CustomerState {
  activeCustomer: Customer | null;
  searchResults: Customer[];
  isSearching: boolean;
  financeActionTypes: string[];
  lastActionAnalysisResponse: ActionAnalysisResponse | null;
  actionResultContent: string | null;
  activeFinanceActionTypes: string[];
  accumulatedResponses: AccumulatedResponses;
}

export interface CustomerSearchResponse {
  customers: Customer[];
}

// AI Action Analysis Types
export interface AIActionAnalysisConfig extends BaseAgentConfig {
  selectedCustomer?: Customer | null;
}

export interface ActionAnalysisResponse {
  content: string;
  originalContent: string;
  financeActionTypes: string[];
  customer: {
    customerNo: string;
    accountId: string | null;
    name: string;
    surname: string;
    email: string;
  };
}

export type AgentConfig =
  | WebScraperConfig
  | WebSearcherConfig
  | CodeInterpreterConfig
  | DataAnalystConfig
  | ImageGeneratorConfig
  | TextGeneratorConfig
  | TranslatorConfig
  | YoutubeSummarizerConfig
  | ResearchAgentConfig
  | ResultConfig
  | ConditionalConfig
  | AIActionAnalysisConfig
  | MCPSupplierAgentConfig;

// Node Types
export type NodeType = 'general' | 'business';

// Agent Node
export interface AgentNode {
  id: string;
  type: 'aiAgent' | 'resultNode' | 'conditionalNode';
  position: {
    x: number;
    y: number;
  };
  data: {
    type: AgentType;
    config: AgentConfig;
    nodeType: NodeType;
  };
}

// Bağlantı
export interface FlowConnection {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

// Execution Results
export interface ExecutionResult {
  status: 'idle' | 'running' | 'completed' | 'error';
  output?: any;
  error?: string;
  conditionResult?: boolean;
  executionTime?: number;
  tokenUsage?: {
    prompt: number;
    completion: number;
    total: number;
  };
}

export interface ExecutionResults {
  [nodeId: string]: ExecutionResult;
}

// Akış Durumu
export interface FlowState {
  nodes: AgentNode[];
  edges: FlowConnection[];
  executionResults: ExecutionResults;
  selectedNodeId: string | null;
  isRunning: boolean;
}

// Geçmiş
export interface HistoryEntry {
  id: string;
  timestamp: number;
  flowState: FlowState;
  name: string;
  description?: string;
}

// Ayarlar
export interface Settings {
  theme: 'light' | 'dark';
  language: 'tr' | 'en';
  autoSave: boolean;
  saveInterval: number;
  defaultModels: {
    [key in LLMType]: string;
  };
  maxTokenLimits: {
    [key in LLMType]: number;
  };
  agentDefaults: {
    [key in AgentType]: Partial<AgentConfig>;
  };
  security: {
    encryptApiKeys: boolean;
    allowExternalRequests: boolean;
    allowFileSystem: boolean;
  };
}

// MCP Konfigürasyonları
interface BaseMcpConfig {
  name: string;
  description: string;
  toolName: string;
}

export interface SupabaseMcpConfig extends BaseMcpConfig {
  type: 'supabase';
  capabilities: {
    database: boolean;
    auth: boolean;
    storage: boolean;
    functions: boolean;
  };
}

export interface GithubMcpConfig extends BaseMcpConfig {
  type: 'github';
  capabilities: {
    repositories: boolean;
    issues: boolean;
    pullRequests: boolean;
  };
}

export interface FirecrawlMcpConfig extends BaseMcpConfig {
  type: 'firecrawl';
  capabilities: {
    scraping: boolean;
    search: boolean;
    crawling: boolean;
  };
}

export type McpConfig = SupabaseMcpConfig | GithubMcpConfig | FirecrawlMcpConfig;

// MCP Action Types - Keep this as it's still used for typing but now populated from API
export type MCPActionType = string; // Now dynamic instead of literal union

export interface MCPActionConfig {
  type: string;
  label: string;
  endpoint: string;
  description?: string;
  jsonSchema?: string;
}

// MCP Supplier Agent Configuration
export interface MCPSupplierAgentConfig extends BaseAgentConfig {
  actionType: MCPActionType;
  selectedCustomer?: Customer | null;
  parsedParameters?: any;
}

// Transaction Response Types
export interface Transaction {
  id: number;
  accountId: string;
  transactionType: string;
  category: string;
  direction: string;
  amount: number;
  currency: string;
  description: string;
  counterpartyName: string;
  counterpartyIban: string;
  transactionDate: number[];
}

export interface StatementResponse {
  customer: Customer;
  transactions: Transaction[];
  attachmentIds: number[];
}

// Email Attachment Types
export interface EmailAttachment {
  id: number;
  filename: string;
  contentType: string;
  fileSize: number;
  actionType: string;
  customerId: number;
  createdAt: number[];
  updatedAt: number[];
  base64Content: string;
}

// Workflow Types
export interface WorkflowDto {
  id: number;
  name: string;
  description?: string;
  nodesData: string;
  edgesData: string;
  version: number;
  isActive: boolean;
  tags?: string;
  category?: string;
  createdBy?: string;
  lastModifiedBy?: string;
  executionCount: number;
  lastExecutedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowSummaryDto {
  id: number;
  name: string;
  description?: string;
  version: number;
  isActive: boolean;
  tags?: string;
  category?: string;
  createdBy?: string;
  executionCount: number;
  lastExecutedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowCreateDto {
  name: string;
  description?: string;
  nodesData: string;
  edgesData: string;
  tags?: string;
  category?: string;
  createdBy?: string;
}

export interface WorkflowState {
  workflows: WorkflowSummaryDto[];
  currentWorkflow: WorkflowDto | null;
  isLoading: boolean;
  error: string | null;
  searchResults: WorkflowSummaryDto[];
  isSearching: boolean;
  lastFetched: number | null;
}

// Ana State
export interface RootState {
  flow: FlowState;
  history: HistoryEntry[];
  settings: Settings;
  customer: CustomerState;
  actionTypes: ActionTypesState;
  workflow: WorkflowState;
} 