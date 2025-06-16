import axios from 'axios';
import { WebSearcherConfig, YoutubeSummarizerConfig, ResearchAgentConfig, WebScraperConfig, TranslatorConfig, AIActionAnalysisConfig } from '@/store/types';
import { executeActionAnalysis } from './customer';

const API_URL = 'http://localhost:8083/mcp-provider';
const AXIOS_TIMEOUT = 30000;

export async function executeWebScraper(config: WebScraperConfig) {
  try {
    const modelConfig = config.modelConfig;
    const response = await axios.post(`${API_URL}/agents/web-scraper`, {
      url: config.content || '',
      rules: config.rules,
      model: modelConfig ? `${modelConfig.type}/${modelConfig.model}` : 'huggingface/deepseek/deepseek-v3-0324',
      maxTokens: modelConfig?.maxTokens || 1000,
      temperature: modelConfig?.temperature || 0.7
    });

    return response.data;
  } catch (error) {
    console.error('Web scraper error:', error);
    throw error;
  }
}

export async function executeWebSearcher(config: WebSearcherConfig) {
  try {
    const modelConfig = config.modelConfig;
    const response = await axios.post(
      `${API_URL}/agent/web-searcher`,
      {
        content: (config as any).content,
        specialPrompt: (config as any).specialPrompt,
        model: modelConfig ? `${modelConfig.type}/${modelConfig.model}` : 'huggingface/deepseek/deepseek-v3-0324',
        maxLink: config.maxResults,
        language: config.filters.language,
        maxTokens: modelConfig?.maxTokens || 1000,
        temperature: modelConfig?.temperature || 0.7
      },
      { timeout: AXIOS_TIMEOUT }
    );

    return response.data;
  } catch (error) {
    console.error('Web Searcher API Error:', error);
    throw error;
  }
}

export async function executeCodeInterpreter(config: any) {
  try {
    const response = await axios.post(
      `${API_URL}/agent/code-interpreter`,
      {
        content: config.content,
        language: config.runtime?.python ? 'python' : 'javascript',
        libraries: config.libraries || [],
        memoryLimit: config.memoryLimit || 1024,
        timeout: config.timeoutSeconds || 30
      },
      { timeout: AXIOS_TIMEOUT }
    );

    return response.data;
  } catch (error) {
    console.error('Code Interpreter API Error:', error);
    throw error;
  }
}

export async function executeDataAnalyst(config: any) {
  try {
    const response = await axios.post(
      `${API_URL}/agent/data-analyst`,
      {
        content: config.content,
        xAxis: config.xAxis,
        yAxis: config.yAxis,
        file: config.file
      },
      { timeout: AXIOS_TIMEOUT }
    );

    return response.data;
  } catch (error) {
    console.error('Data Analyst API Error:', error);
    throw error;
  }
}

export async function executeImageGenerator(config: any) {
  try {
    const response = await axios.post(
      `${API_URL}/agent/image-generator`,
      {
        prompt: config.content,
        provider: config.provider || 'dalle',
        resolution: config.resolution || '1024x1024',
        style: config.style || 'natural'
      },
      { timeout: AXIOS_TIMEOUT }
    );

    return response.data;
  } catch (error) {
    console.error('Image Generator API Error:', error);
    throw error;
  }
}

export async function executeTextGenerator(config: any) {
  try {
    const response = await axios.post(
      `${API_URL}/agent/text-generator`,
      {
        content: config.content,
        maxLength: config.maxLength || 2000,
        format: config.format || 'markdown'
      },
      { timeout: AXIOS_TIMEOUT }
    );

    return response.data;
  } catch (error) {
    console.error('Text Generator API Error:', error);
    throw error;
  }
}

export async function executeTranslator(config: TranslatorConfig) {
  try {
    const response = await axios.post(
      `${API_URL}/agent/translator`,
      {
        content: config.content,
        targetLang: config.targetLang
      },
      { timeout: AXIOS_TIMEOUT }
    );

    return response.data;
  } catch (error) {
    console.error('Translator API Error:', error);
    throw error;
  }
}

export async function executeResearchAgent(config: ResearchAgentConfig) {
  try {
    const modelConfig = config.modelConfig;
    const response = await axios.post(
      `${API_URL}/agent/research-agent`,
      {
        topic: config.topic,
        model: modelConfig ? `${modelConfig.type}/${modelConfig.model}` : 'huggingface/deepseek/deepseek-v3-0324',
        numLinks: config.numLinks,
        specialPrompt: modelConfig?.systemPrompt || '',
        temperature: modelConfig?.temperature || 0.7,
        maxTokens: modelConfig?.maxTokens || 1000
      },
      { timeout: AXIOS_TIMEOUT }
    );

    return response.data;
  } catch (error) {
    console.error('Research Agent API Error:', error);
    throw error;
  }
}

export async function executeYoutubeSummarizer(config: YoutubeSummarizerConfig) {
  try {
    const modelConfig = config.modelConfig;
    const response = await axios.post(`${API_URL}/agent/youtube-summarizer`, {
      url: config.url,
      model: modelConfig ? `${modelConfig.type}/${modelConfig.model}` : 'huggingface/deepseek/deepseek-v3-0324',
      specialPrompt: modelConfig?.systemPrompt || '',
      temperature: modelConfig?.temperature || 0.7,
      maxTokens: modelConfig?.maxTokens || 1000,
    });

    return response.data;
  } catch (error) {
    console.error('YouTube Summarizer API Error:', error);
    throw error;
  }
}

export async function executeSupabase(config: any) {
  try {
    const response = await axios.post(
      `${API_URL}/agent/supabase`,
      {
        content: config.content,
        apiUrl: config.apiUrl,
        apiKey: config.apiKey,
        useAnon: config.useAnon,
        capabilities: config.capabilities
      },
      { timeout: AXIOS_TIMEOUT }
    );

    return response.data;
  } catch (error) {
    console.error('Supabase API Error:', error);
    throw error;
  }
}

export async function executeAIActionAnalysis(config: AIActionAnalysisConfig) {
  try {
    if (!config.selectedCustomer) {
      throw new Error('Müşteri seçilmemiş');
    }

    const modelConfig = config.modelConfig;
    const response = await executeActionAnalysis(
      config.content || '',
      modelConfig ? `${modelConfig.type}/${modelConfig.model}` : 'huggingface/deepseek/deepseek-v3-0324',
      modelConfig?.maxTokens || 1000,
      modelConfig?.temperature || 0.7,
      config.selectedCustomer.id.toString()
    );

    return response;
  } catch (error) {
    console.error('AI Action Analysis error:', error);
    throw error;
  }
}

export async function executeAgent(agentType: string, config: any) {
  switch (agentType) {
    case 'webScraper':
      return executeWebScraper(config);
    case 'webSearcher':
      return executeWebSearcher(config);
    case 'codeInterpreter':
      return executeCodeInterpreter(config);
    case 'dataAnalyst':
      return executeDataAnalyst(config);
    case 'imageGenerator':
      return executeImageGenerator(config);
    case 'textGenerator':
      return executeTextGenerator(config);
    case 'translator':
      return executeTranslator(config);
    case 'youtubeSummarizer':
      return executeYoutubeSummarizer(config);
    case 'researchAgent':
      return executeResearchAgent(config);
    case 'supabase':
      return executeSupabase(config);
    case 'aiActionAnalysis':
      return executeAIActionAnalysis(config);
    default:
      throw new Error(`Unknown agent type: ${agentType}`);
  }
} 