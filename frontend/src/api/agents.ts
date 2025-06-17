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
    
    // Parse content to get parameters - always parse fresh from content
    let parsedParameters = null;
    
    if (config.content) {
      console.log('🔄 MCP Supplier Agent - Parsing content:', config.content);
      parsedParameters = parseMCPContent(config.content);
      console.log('✅ MCP Supplier Agent - Content parsed successfully:', parsedParameters);
    } else if (config.parsedParameters) {
      // Fallback to existing parsed parameters if no content
      parsedParameters = config.parsedParameters;
      console.log('🔄 MCP Supplier Agent - Using existing parsedParameters:', parsedParameters);
    } else if (config.actionType) {
      // If no content or parsed parameters, but we have an action type, create default parameters
      console.log('🔧 MCP Supplier Agent - Creating default parameters for action type:', config.actionType);
      
      // Get customer information first
      let customerToUse = null;
      
      // First try to get activeCustomer from store
      if (typeof window !== 'undefined') {
        const storeState = (window as any).__REDUX_STORE__?.getState();
        if (storeState?.customer?.activeCustomer) {
          customerToUse = storeState.customer.activeCustomer;
          console.log('✅ MCP Supplier Agent - Using activeCustomer from store for default params:', customerToUse);
        }
      }
      
      // If no activeCustomer, try selectedCustomer from config
      if (!customerToUse && config.selectedCustomer) {
        customerToUse = config.selectedCustomer;
        console.log('✅ MCP Supplier Agent - Using selectedCustomer from config for default params:', customerToUse);
      }
      
      if (customerToUse) {
        // Create default parameters based on action type
        const defaultParams = createDefaultMCPParameters(config.actionType, customerToUse);
        parsedParameters = {
          selectedActions: [config.actionType],
          parameters: {
            [config.actionType]: defaultParams
          }
        };
        console.log('✅ MCP Supplier Agent - Created default parameters:', parsedParameters);
      } else {
        console.log('❌ MCP Supplier Agent - No customer available for default parameters');
      }
    }

    if (!parsedParameters) {
      throw new Error('No content or parsed parameters available for execution');
    }

    // Get customer information - prioritize activeCustomer from store
    let customerToUse = null;
    
    // First try to get activeCustomer from store
    if (typeof window !== 'undefined') {
      const storeState = (window as any).__REDUX_STORE__?.getState();
      if (storeState?.customer?.activeCustomer) {
        customerToUse = storeState.customer.activeCustomer;
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

    // Ensure customerId is present in the action parameters
    if (parsedParameters && parsedParameters.parameters && config.actionType) {
      const actionParams = parsedParameters.parameters[config.actionType];
      if (actionParams && !actionParams.customerId) {
        actionParams.customerId = customerToUse.id.toString();
        console.log('✅ MCP Supplier Agent - Added customerId to action parameters:', actionParams.customerId);
      }
    }

    console.log('🔍 MCP Supplier Agent - Final parsedParameters before execution:', parsedParameters);

    // Execute MCP request
    const response = await executeMCPRequest({
      customer: customerToUse,
      parsedParameters: parsedParameters,
      modelConfig: config.modelConfig,
      content: config.content,
      actionType: config.actionType || 'GENERATE_STATEMENT' // Default fallback
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

// Helper function to create default MCP parameters based on action type
function createDefaultMCPParameters(actionType: string, customer: any): any {
  const currentDate = new Date();
  const oneYearAgo = new Date(currentDate);
  oneYearAgo.setFullYear(currentDate.getFullYear() - 1);
  
  const baseParams = {
    actionType: actionType,
    customerId: customer.id.toString(),
    startDate: oneYearAgo.toISOString().split('T')[0] + 'T00:00:00',
    endDate: currentDate.toISOString().split('T')[0] + 'T23:59:59',
  };

  switch (actionType) {
    case 'GENERATE_STATEMENT':
      return {
        ...baseParams,
        direction: 'out',
        transactionType: 'purchase',
        category: null,
        descriptionContains: null,
        limit: null,
        order: 'desc',
        currency: null,
        emailFlag: true
      };
    
    case 'SEND_EMAIL':
      return {
        ...baseParams,
        to: customer.email || '',
        subject: 'Finansal Rapor',
        body: 'Sayın müşterimiz, finansal raporunuz ektedir.',
        attachmentIds: []
      };
    
    case 'PROCESS_PAYMENT':
      return {
        ...baseParams,
        amount: 0,
        currency: 'TRY',
        description: 'Ödeme işlemi',
        paymentMethod: 'bank_transfer'
      };
    
    default:
      return {
        ...baseParams,
        description: `${actionType} işlemi`,
        metadata: {}
      };
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

export async function fetchEmailAttachments(attachmentIds: number[]) {
  try {
    console.log('📎 Fetching email attachments:', attachmentIds);
    
    const response = await axios.post(
      `${API_URL}/api/email-attachments/by-ids/with-content`,
      attachmentIds,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: AXIOS_TIMEOUT
      }
    );

    console.log('✅ Email attachments fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Email Attachments API Error:', error);
    throw error;
  }
} 