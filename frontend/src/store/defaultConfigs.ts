import { AgentType, AgentConfig, LLMType, ModelConfig } from './types';

export const defaultModelConfig: Record<LLMType, ModelConfig> = {
  openai: {
    type: 'openai',
    model: 'gpt-4o',
    apiKey: '',
    temperature: 0.7,
    maxTokens: 4096,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    systemPrompt: '',
  },
  google: {
    type: 'gemini',
    model: 'gemini-pro',
    temperature: 0.7,
    maxTokens: 32768,
    topP: 0.95,
    maxOutputTokens: 2048,
    systemPrompt: '',
  },
  anthropic: {
    type: 'anthropic',
    model: 'claude-3-opus',
    apiKey: '',
    temperature: 0.7,
    maxTokens: 100000,
    topP: 1,
    systemPrompt: '',
  },
  huggingface: {
    type: 'huggingface',
    model: 'deepseek/deepseek-v3-0324',
    temperature: 0.7,
    maxTokens: 4096,
    topP: 1,
    systemPrompt: '',
  },
};

export const defaultAgentConfigs: Record<AgentType, Partial<AgentConfig>> = {
  webScraper: {
    name: 'Web Scraper',
    description: 'Web sayfalarından veri çıkarma ve analiz etme',
    specialPrompt: 'Sen bir web içerik özetleyicisin. Verilen metni özetleyeceksin',
    rules: {
      maxDepth: 0,
      maxPages: 1,
    },
    modelConfig: defaultModelConfig.huggingface,
  },
  webSearcher: {
    name: 'Web Searcher',
    description: 'İnternet üzerinde arama ve bilgi toplama',
    maxResults: 4,
    filters: {
      language: 'tr',
    },
  },
  codeInterpreter: {
    name: 'Code Interpreter',
    description: 'Kod çalıştırma ve programlama asistanı',
    runtime: {
      python: true,
      javascript: true,
      r: false,
    },
    permissions: {
      fileSystem: true,
      network: false,
      subprocess: false,
    },
    libraries: ['numpy', 'pandas', 'matplotlib'],
    memoryLimit: 1024,
    timeoutSeconds: 30,
  },
  dataAnalyst: {
    name: 'Veri Analisti',
    description: 'Veri analizi ve görselleştirme yapar',
    file: null,
    content: '',
    xAxis: '',
    yAxis: '',
    modelConfig: defaultModelConfig.huggingface
  },
  imageGenerator: {
    name: 'Image Generator',
    description: 'AI destekli görsel içerik oluşturma',
    provider: 'dalle',
    resolution: '1024x1024',
    style: 'natural',
    samplingSteps: 20,
  },
  textGenerator: {
    name: 'Text Generator',
    description: 'İçerik ve metin üretimi',
    maxLength: 2000,
    format: 'markdown',
    style: {
      tone: 'professional',
      audience: 'general',
    },
  },
  translator: {
    name: 'Translator',
    description: 'Çoklu dil çeviri asistanı',
    targetLang: 'tr',
    modelConfig: {
      type: 'huggingface',
      model: 'deepseek/deepseek-v3-0324',
      temperature: 0.7,
      maxTokens: 4096,
      topP: 1,
      systemPrompt: 'Dil bilgisi ve anlam açısından kontrol edicisin sorun varsa ancak düzeltmelisin',
    },
  },
  youtubeSummarizer: {
    name: 'YouTube Summarizer',
    description: 'YouTube video içeriklerini özetleme ve analiz',
    url: '',
    specialPrompt: 'Sen bir transkript özetleyicisin. Verilen metni özetleyeceksin',
    modelConfig: {
      type: 'huggingface',
      model: 'deepseek/deepseek-v3-0324',
      temperature: 0.7,
      maxTokens: 4096,
      topP: 1,
      systemPrompt: '',
    },
  },
  result: {
    name: 'Sonuç Görüntüleyici',
    description: 'Agent çıktılarını görüntüleme ve analiz',
    displayFormat: 'text',
    autoRefresh: true,
    refreshInterval: 5000,
    maxHistoryLength: 10,
  },
  researchAgent: {
    name: 'Research Agent',
    description: 'Kapsamlı araştırma ve analiz yapma',
    topic: '',
    numLinks: 5,
    depth: 'detailed',
    language: 'tr',
    includeSourceLinks: true,
    format: 'markdown',
  },
  mcpSupplierAgent: {
    name: 'MCP Supplier Agent',
    description: 'MCP protokolü ile tedarikçi entegrasyonu',
    actionType: '',
    selectedCustomer: undefined,
    modelConfig: {
      type: 'huggingface',
      model: 'deepseek/deepseek-v3-0324',
      temperature: 0.7,
      maxTokens: 1000,
      topP: 1,
      systemPrompt: 'Sen bir MCP tedarikçi asistanısın. Müşteri verilerini analiz edip tedarikçi önerilerinde bulunursun.',
    },
  },
  conditional: {
    name: 'Koşul Kontrolü',
    description: 'Önceki node çıktısına göre akışı yönlendirir',
    conditions: [
      {
        id: '1',
        value1: {
          type: 'variable',
          value: 'result'
        },
        operator: 'equals',
        value2: {
          type: 'static',
          value: ''
        }
      }
    ],
    combineOperator: 'AND',
    truePathColor: '#22c55e',  // Yeşil
    falsePathColor: '#ef4444', // Kırmızı
  },
  aiActionAnalysis: {
    name: 'AI Action Analysis',
    description: 'Finansal işlem analizi ve aksiyon tespiti',
    selectedCustomer: undefined,
    modelConfig: {
      type: 'huggingface',
      model: 'deepseek/deepseek-v3-0324',
      temperature: 0.7,
      maxTokens: 1000,
      topP: 1,
      systemPrompt: 'Sen bir finansal işlem analizcisin. Verileri prompt\'u analiz edip alınacak aksiyonları tespit etmelisin',
    },
  },
};

export function createDefaultAgentConfig(type: AgentType, llmType: LLMType = 'huggingface'): AgentConfig {
  const baseConfig = defaultAgentConfigs[type];
  const modelConfig = defaultModelConfig[llmType];

  return {
    ...baseConfig,
    modelConfig: modelConfig as ModelConfig,
  } as AgentConfig;
} 