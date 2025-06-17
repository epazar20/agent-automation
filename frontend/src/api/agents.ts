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
    
    // Get accumulated responses from Redux store using proper method
    let accumulatedResponses = null;
    if (typeof window !== 'undefined') {
      try {
        // Try to get store state directly from global store reference
        let storeState = null;
        
        if ((window as any).__REDUX_STORE__) {
          storeState = (window as any).__REDUX_STORE__.getState();
          console.log('✅ MCP Supplier Agent - Accessing store via __REDUX_STORE__');
        }
        
        if (storeState) {
          accumulatedResponses = storeState.customer?.accumulatedResponses;
          console.log('🔍 MCP Supplier Agent - Accumulated responses from Redux:', JSON.stringify(accumulatedResponses, null, 2));
        } else {
          console.log('⚠️ No Redux store state available, will use alternative preprocessing');
        }
      } catch (error) {
        console.warn('⚠️ Could not access Redux store:', error);
      }
    }
    
    // Preprocess accumulated responses to create parameters for current action type
    let parsedParameters = null;
    
    if (accumulatedResponses && accumulatedResponses.responses && config.actionType) {
      console.log('🔄 MCP Supplier Agent - Preprocessing accumulated responses for action type:', config.actionType);
      
      const preprocessedData = preprocessAccumulatedResponses(
        accumulatedResponses.responses,
        config.actionType,
        config.selectedCustomer
      );
      
      if (preprocessedData) {
        console.log('✅ MCP Supplier Agent - Preprocessed data created:', JSON.stringify(preprocessedData, null, 2));
        parsedParameters = preprocessedData;
      }
    }
    
    
    
    // Fallback: try to parse content if no preprocessed data available
    if (!parsedParameters && config.content) {
      console.log('🔄 MCP Supplier Agent - Fallback: parsing content directly');
      parsedParameters = parseMCPContent(config.content);
      console.log('✅ MCP Supplier Agent - Content parsed successfully:', JSON.stringify(parsedParameters, null, 2));
    }
    
    // Fallback: use existing parsed parameters
    if (!parsedParameters && config.parsedParameters) {
      parsedParameters = config.parsedParameters;
      console.log('🔄 MCP Supplier Agent - Using existing parsedParameters:', JSON.stringify(parsedParameters, null, 2));
    }
    
    if (!parsedParameters) {
      throw new Error('No content, accumulated responses, or parsed parameters available for execution');
    }

    // Get customer information - prioritize selectedCustomer from config
    let customerToUse = null;
    
    if (config.selectedCustomer) {
      customerToUse = config.selectedCustomer;
      console.log('✅ MCP Supplier Agent - Using selectedCustomer from config:', customerToUse);
    } else if (parsedParameters) {
      const customerId = extractCustomerIdFromParameters(parsedParameters);
      if (customerId) {
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

    console.log('🔍 MCP Supplier Agent - Final parsedParameters before execution:', JSON.stringify(parsedParameters, null, 2));

    // Execute MCP request
    const response = await executeMCPRequest({
      customer: customerToUse,
      parsedParameters: parsedParameters,
      modelConfig: config.modelConfig,
      content: config.content,
      actionType: config.actionType
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

// New function to preprocess accumulated responses for current action type
function preprocessAccumulatedResponses(
  responses: any[],
  currentActionType: string,
  currentCustomer: any
): any | null {
  try {
    console.log('🔄 Preprocessing accumulated responses:', {
      totalResponses: responses.length,
      currentActionType,
      hasCustomer: !!currentCustomer
    });

    if (!responses || responses.length === 0) {
      console.log('❌ No accumulated responses available for preprocessing');
      return null;
    }

    // Find AI Action Analysis response to get base parameters
    const aiActionAnalysisResponse = responses.find(r => r.nodeType === 'aiActionAnalysis');
    let baseParameters = null;

    if (aiActionAnalysisResponse && aiActionAnalysisResponse.response) {
      console.log('✅ Found AI Action Analysis response:', JSON.stringify(aiActionAnalysisResponse.response, null, 2));
      
      // Parse the AI Action Analysis content to get parameters
      try {
        if (aiActionAnalysisResponse.response.content) {
          const parsedContent = parseMCPContent(aiActionAnalysisResponse.response.content);
          if (parsedContent && parsedContent.parameters && parsedContent.parameters[currentActionType]) {
            baseParameters = parsedContent.parameters[currentActionType];
            console.log('✅ Extracted base parameters from AI Action Analysis:', JSON.stringify(baseParameters, null, 2));
          }
        }
      } catch (error) {
        console.warn('⚠️ Could not parse AI Action Analysis content:', error);
      }
    }

    

    if (!baseParameters) {
      console.log('❌ Could not create base parameters');
      return null;
    }

    let enhancedParams = { ...baseParameters };

    // Enhance parameters based on previous node responses
    console.log('🔄 Enhancing parameters with data from previous responses...');

    if (currentActionType === 'SEND_EMAIL') {
      // For SEND_EMAIL, collect attachment IDs from ALL previous mcpSupplierAgent responses
      const mcpSupplierResponses = responses.filter(r => 
        r.nodeType === 'mcpSupplierAgent'
      );

      // Collect all attachment IDs from all previous nodes
      const allAttachmentIds: number[] = [];
      let emailBodyEnhancements: string[] = [];

      console.log(`🔍 SEND_EMAIL - Found ${mcpSupplierResponses.length} MCP Supplier responses to process`);

      for (const response of mcpSupplierResponses) {
        if (response.response && response.response.data) {
          console.log(`🔄 SEND_EMAIL - Processing response from node ${response.nodeId} (${response.actionType})`);
          
          // Look for attachment IDs in the API response
          const attachmentIds = extractAttachmentIdsFromResponse(response.response.data);
          if (attachmentIds && attachmentIds.length > 0) {
            allAttachmentIds.push(...attachmentIds);
            console.log(`✅ SEND_EMAIL - Added ${attachmentIds.length} attachment IDs from ${response.actionType}: [${attachmentIds.join(', ')}]`);
          }

          // Enhance email body with transaction summary if available
          if (response.response.data.results) {
            const transactionSummary = extractTransactionSummaryFromResponse(response.response.data);
            if (transactionSummary) {
              emailBodyEnhancements.push(`${response.actionType}: ${transactionSummary}`);
              console.log(`✅ SEND_EMAIL - Added transaction summary from ${response.actionType}`);
            }
          }
        }
      }

      // Remove duplicates from attachment IDs
      const uniqueAttachmentIds = [...new Set(allAttachmentIds)];
      
      if (uniqueAttachmentIds.length > 0) {
        enhancedParams.attachmentIds = uniqueAttachmentIds;
        console.log(`✅ SEND_EMAIL - Final merged attachment IDs: [${uniqueAttachmentIds.join(', ')}] (${uniqueAttachmentIds.length} unique attachments from ${mcpSupplierResponses.length} nodes)`);
      } else {
        console.log('⚠️ SEND_EMAIL - No attachment IDs found in any previous responses');
        enhancedParams.attachmentIds = [];
      }

      // Enhance email body with all transaction summaries
      if (emailBodyEnhancements.length > 0 && enhancedParams.body) {
        enhancedParams.body += `\n\n--- İşlem Özetleri ---\n${emailBodyEnhancements.join('\n')}`;
        console.log(`✅ SEND_EMAIL - Enhanced email body with ${emailBodyEnhancements.length} transaction summaries`);
      }

      // Update email subject to reflect multiple attachments
      if (uniqueAttachmentIds.length > 0 && enhancedParams.subject) {
        enhancedParams.subject = `${enhancedParams.subject} (${uniqueAttachmentIds.length} Ek Dosya)`;
      }
    } 

    // Create the final preprocessed structure
    const preprocessedResult = {
      selectedActions: [currentActionType],
      parameters: {
        [currentActionType]: enhancedParams
      },
      metadata: {
        preprocessedFrom: 'accumulatedResponses',
        responseCount: responses.length,
        aiActionAnalysisUsed: !!aiActionAnalysisResponse,
        enhancementsApplied: true,
        timestamp: new Date().toISOString()
      }
    };

    console.log('✅ Successfully preprocessed accumulated responses:', JSON.stringify(preprocessedResult, null, 2));
    return preprocessedResult;

  } catch (error) {
    console.error('❌ Error preprocessing accumulated responses:', error);
    return null;
  }
}

// Helper function to extract attachment IDs from API response
function extractAttachmentIdsFromResponse(responseData: any): number[] | null {
  try {
    if (responseData.results && Array.isArray(responseData.results)) {
      for (const result of responseData.results) {
        if (result.status === 'success' && result.data && result.data.attachmentIds) {
          if (Array.isArray(result.data.attachmentIds)) {
            return result.data.attachmentIds;
          }
        }
      }
    }
    
    // Also check direct attachmentIds property
    if (responseData.attachmentIds && Array.isArray(responseData.attachmentIds)) {
      return responseData.attachmentIds;
    }
    
    return null;
  } catch (error) {
    console.warn('⚠️ Error extracting attachment IDs:', error);
    return null;
  }
}

// Helper function to extract transaction summary from API response
function extractTransactionSummaryFromResponse(responseData: any): string | null {
  try {
    if (responseData.results && Array.isArray(responseData.results)) {
      for (const result of responseData.results) {
        if (result.status === 'success' && result.data && result.data.transactions) {
          const transactions = result.data.transactions;
          if (Array.isArray(transactions)) {
            const count = transactions.length;
            const total = transactions.reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0);
            return `Özet: ${count} işlem tespit edildi, toplam tutar: ${total.toFixed(2)} TL`;
          }
        }
      }
    }
    return null;
  } catch (error) {
    console.warn('⚠️ Error extracting transaction summary:', error);
    return null;
  }
}

// Helper function to extract reference data from API response
function extractReferenceDataFromResponse(responseData: any): any | null {
  try {
    const referenceData: any = {};
    
    if (responseData.results && Array.isArray(responseData.results)) {
      for (const result of responseData.results) {
        if (result.status === 'success' && result.data) {
          // Add balance information if available
          if (result.data.balance) {
            referenceData.availableBalance = result.data.balance;
          }
          
          // Add latest transaction ID as reference
          if (result.data.transactions && Array.isArray(result.data.transactions) && result.data.transactions.length > 0) {
            referenceData.referenceTransactionId = result.data.transactions[0].id;
          }
        }
      }
    }
    
    return Object.keys(referenceData).length > 0 ? referenceData : null;
  } catch (error) {
    console.warn('⚠️ Error extracting reference data:', error);
    return null;
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