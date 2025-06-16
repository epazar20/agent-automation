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
  | 'supabase'
  | 'result'
  | 'conditional'
  | 'aiActionAnalysis';

// LLM Model Tipleri
export type LLMType = 'openai' | 'huggingface' | 'anthropic' | 'google';

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

export interface SupabaseConfig extends BaseAgentConfig {
  apiUrl: string;
  apiKey: string;
  useAnon: boolean;
  capabilities: {
    database: boolean;
    auth: boolean;
    storage: boolean;
    functions: boolean;
  };
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
  createdAt: number[];
  updatedAt: number[];
  fullName: string;
}

export interface CustomerSearchResponse {
  customers: Customer[];
}

// AI Action Analysis Types
export interface AIActionAnalysisConfig extends BaseAgentConfig {
  selectedCustomer?: Customer;
  systemPrompt: string;
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
  | SupabaseConfig
  | ConditionalConfig
  | AIActionAnalysisConfig;

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

// Customer State
export interface CustomerState {
  activeCustomer: Customer | null;
  searchResults: Customer[];
  isSearching: boolean;
  financeActionTypes: string[];
  lastActionAnalysisResponse: ActionAnalysisResponse | null;
  actionResultContent: string | null;
  activeFinanceActionTypes: string[];
}

// Ana State
export interface RootState {
  flow: FlowState;
  history: HistoryEntry[];
  settings: Settings;
  customer: CustomerState;
} 