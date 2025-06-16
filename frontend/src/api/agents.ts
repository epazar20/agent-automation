import axios from 'axios';
import { WebSearcherConfig, YoutubeSummarizerConfig, ResearchAgentConfig, WebScraperConfig, TranslatorConfig, AIActionAnalysisConfig, MCPSupplierAgentConfig, StatementResponse } from '@/store/types';
import { executeActionAnalysis } from './customer';
import { getMCPActionConfig, parseContentForAction, parseMCPContent, extractCustomerIdFromParameters, executeMCPRequest } from '@/store/mcpConstants';

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

export async function executeAIActionAnalysis(config: AIActionAnalysisConfig) {
  try {
    console.log('🎯 AI Action Analysis - Starting execution:', config);
    
    if (!config.selectedCustomer) {
      console.error('❌ AI Action Analysis - No customer selected');
      throw new Error('Müşteri seçilmemiş');
    }

    console.log('✅ AI Action Analysis - Customer found:', config.selectedCustomer);

    const modelConfig = config.modelConfig;
    console.log('🔧 AI Action Analysis - Model config:', modelConfig);
    
    const requestParams = {
      content: config.content || '',
      model: modelConfig ? `${modelConfig.type}/${modelConfig.model}` : 'huggingface/deepseek/deepseek-v3-0324',
      maxTokens: modelConfig?.maxTokens || 1000,
      temperature: modelConfig?.temperature || 0.7,
      customerNo: config.selectedCustomer.id.toString()
    };
    
    console.log('🚀 AI Action Analysis - Request params:', requestParams);
    
    const response = await executeActionAnalysis(
      requestParams.content,
      requestParams.model,
      requestParams.maxTokens,
      requestParams.temperature,
      requestParams.customerNo
    );

    console.log('✅ AI Action Analysis - Response received:', response);
    return response;
  } catch (error) {
    console.error('❌ AI Action Analysis error:', error);
    throw error;
  }
}

export async function executeMCPSupplierAgent(config: any) {
  try {
    console.log('🎯 MCP Supplier Agent - Starting execution:', config);
    
    // Parse content to get parameters
    const parsedParameters = config.parsedParameters || parseMCPContent(config.content);
    console.log('🔍 MCP Supplier Agent - Initial parsedParameters:', parsedParameters);
    
    if (config.content) {
      console.log('🔄 MCP Supplier Agent - Parsing content:', config.content);
      const parsed = parseMCPContent(config.content);
      console.log('✅ MCP Supplier Agent - Content parsed successfully:', parsed);
    }

    // Get customer information - prioritize activeCustomer from store
    let customerToUse = null;
    
    // First try to get activeCustomer from store
    if (typeof window !== 'undefined') {
      const storeState = (window as any).__REDUX_STORE__?.getState();
      if (storeState?.settings?.activeCustomer) {
        customerToUse = storeState.settings.activeCustomer;
        console.log('✅ MCP Supplier Agent - Using activeCustomer from store:', customerToUse);
      }
    }
    
    // If no activeCustomer, try selectedCustomer from config
    if (!customerToUse && config.selectedCustomer) {
      customerToUse = config.selectedCustomer;
      console.log('✅ MCP Supplier Agent - Using selectedCustomer from config:', customerToUse);
    }
    
    // If still no customer, try to extract from parsedParameters
    if (!customerToUse && parsedParameters) {
      const customerId = extractCustomerIdFromParameters(parsedParameters);
      if (customerId) {
        // Create a minimal customer object with the ID
        customerToUse = { id: customerId, customerNo: customerId };
        console.log('✅ MCP Supplier Agent - Using customerId from parameters:', customerToUse);
      }
    }

    if (!customerToUse) {
      console.log('❌ MCP Supplier Agent - No customer information available');
      throw new Error('Müşteri bilgisi bulunamadı. Müşteri seçin veya JSON verisinde customerId bulundurun.');
    }

    // Execute MCP request
    const response = await executeMCPRequest({
      customer: customerToUse,
      parsedParameters: parsedParameters,
      modelConfig: config.modelConfig,
      content: config.content
    });

    console.log('✅ MCP Supplier Agent - Response received:', response);
    
    return {
      content: response.content || 'MCP işlemi tamamlandı',
      status: 'completed',
      customer: customerToUse,
      data: response
    };

  } catch (error) {
    console.log('❌ MCP Supplier Agent API Error:', error);
    throw new Error(`MCP Supplier Agent hatası: ${error}`);
  }
}

export async function executeConditional(config: any) {
  try {
    // Conditional nodes are handled specially in FlowEditor
    return {
      content: 'Conditional evaluation completed',
      status: 'completed'
    };
  } catch (error) {
    throw new Error(`Conditional execution error: ${error}`);
  }
}

export async function executeResult(config: any) {
  try {
    // Result nodes just display data, no execution needed
    return {
      content: 'Result node ready',
      status: 'completed'
    };
  } catch (error) {
    throw new Error(`Result execution error: ${error}`);
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
    case 'aiActionAnalysis':
      return executeAIActionAnalysis(config);
    case 'mcpSupplierAgent':
      return executeMCPSupplierAgent(config);
    case 'conditional':
      return executeConditional(config);
    case 'result':
      return executeResult(config);
    default:
      throw new Error(`Bilinmeyen agent tipi: ${agentType}`);
  }
} 