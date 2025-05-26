import { AgentType, AgentConfig, LLMType, ModelConfig } from './types';

export const defaultModelConfig: Record<LLMType, Partial<ModelConfig>> = {
  huggingface: {
    type: 'huggingface',
    model: 'deepseek/deepseek-v3-0324',
    temperature: 0.7,
    maxTokens: 4096,
    topP: 1,
    systemPrompt: '',
  },
  openai: {
    type: 'openai',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 4096,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    systemPrompt: '',
  },
  gemini: {
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
    temperature: 0.7,
    maxTokens: 100000,
    topP: 1,
    systemPrompt: '',
  },
  llama2: {
    type: 'llama2',
    model: 'llama-2-70b-chat',
    temperature: 0.7,
    maxTokens: 4096,
    topP: 1,
    repetitionPenalty: 1.1,
    systemPrompt: '',
  },
};

export const defaultAgentConfigs: Record<AgentType, Partial<AgentConfig>> = {
  webScraper: {
    name: 'Web Scraper',
    description: 'Web sayfalarından veri çıkarma ve analiz etme',
    rules: {
      maxDepth: 2,
      maxPages: 10,
    },
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
    modelConfig: defaultModelConfig
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
  supabase: {
    name: 'Supabase Agent',
    description: 'Veritabanı ve backend işlemleri',
    modelConfig: defaultModelConfig.openai,
    apiUrl: '',
    apiKey: '',
    useAnon: false,
    capabilities: {
      database: true,
      auth: false,
      storage: false,
      functions: false,
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
};

export function createDefaultAgentConfig(type: AgentType, llmType: LLMType = 'openai'): AgentConfig {
  const baseConfig = defaultAgentConfigs[type];
  const modelConfig = defaultModelConfig[llmType];

  return {
    ...baseConfig,
    modelConfig: modelConfig as ModelConfig,
  } as AgentConfig;
} 