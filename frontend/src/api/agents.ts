import axios from 'axios';
import { WebSearcherConfig, YoutubeSummarizerConfig, ResearchAgentConfig, WebScraperConfig, TranslatorConfig, AIActionAnalysisConfig, MCPSupplierAgentConfig, StatementResponse } from '@/store/types';
import { executeActionAnalysis } from './customer';
import { getMCPActionConfig, parseContentForAction, parseMCPContent, extractCustomerIdFromParameters, executeMCPRequest } from '@/store/mcpConstants';
import { apiEndpoints, config } from '@/config/env';

// Configure axios with timeout and interceptors
const axiosInstance = axios.create({
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging in development
if (config.debug) {
  axiosInstance.interceptors.request.use(
    (config) => {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
      });
      return config;
    },
    (error) => {
      console.error('❌ API Request Error:', error);
      return Promise.reject(error);
    }
  );

  axiosInstance.interceptors.response.use(
    (response) => {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
      return response;
    },
    (error) => {
      console.error('❌ API Response Error:', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message,
      });
      return Promise.reject(error);
    }
  );
}

export async function executeWebScraper(config: WebScraperConfig) {
  try {
    const modelConfig = config.modelConfig;
    const response = await axiosInstance.post(apiEndpoints.agent.webScraper, {
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
    
    const response = await axiosInstance.post(apiEndpoints.agent.webSearcher, {
      query: config.content || '',
      model: modelConfig ? `${modelConfig.type}/${modelConfig.model}` : 'huggingface/deepseek/deepseek-v3-0324',
      maxTokens: modelConfig?.maxTokens || 1000,
      temperature: modelConfig?.temperature || 0.7
    });

    return response.data;
  } catch (error) {
    console.error('Web searcher error:', error);
    throw error;
  }
}

export async function executeCodeInterpreter(config: any) {
  try {
    // Code interpreter functionality
    const response = await axiosInstance.post(`${apiEndpoints.agent.base}/code-interpreter`, {
      code: config.content || '',
      language: config.language || 'python',
      timeout: config.timeout || 30
    });

    return response.data;
  } catch (error) {
    console.error('Code interpreter error:', error);
    throw error;
  }
}

export async function executeDataAnalyst(config: any) {
  try {
    console.log('🔍 Data Analyst - Starting execution with config:', config);
    
    // Check if we have a file to upload
    if (!config.file) {
      console.error('❌ Data Analyst - No file provided:', config);
      throw new Error('Veri analizi için bir dosya yüklenmesi gerekiyor');
    }

    console.log('📁 Data Analyst - File details:', {
      name: config.file.name,
      size: config.file.size,
      type: config.file.type
    });

    // Create FormData for multipart/form-data request
    const formData = new FormData();
    
    // Add the file
    formData.append('file', config.file);
    
    // Create the request object matching the API expectation
    const requestData = {
      content: config.content || '',
      model: config.modelConfig ? `${config.modelConfig.type}/${config.modelConfig.model}` : 'huggingface/deepseek/deepseek-v3-0324',
      specialPrompt: config.specialPrompt || 'Sen bir veri analizcisin. Alınan JSON verinin prompt\'a uygun analiz etmelisin',
      temperature: config.modelConfig?.temperature || 0.7,
      maxTokens: config.modelConfig?.maxTokens || 1000,
      xAxis: config.xAxis || '',
      yAxis: config.yAxis || ''
    };
    
    console.log('📊 Data Analyst - Request data:', requestData);
    
    // Add the request as JSON string
    formData.append('request', JSON.stringify(requestData));

    console.log('🚀 Data Analyst - Making request to:', apiEndpoints.agent.dataAnalyser);

    // Make the request with multipart/form-data
    const response = await fetch(apiEndpoints.agent.dataAnalyser, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type header - let the browser set it with boundary
      },
    });

    console.log('📡 Data Analyst - Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Data Analyst - API error:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Data Analyst - Success:', result);
    return result;
  } catch (error) {
    console.error('❌ Data Analyst - Fatal error:', error);
    throw error;
  }
}

export async function executeImageGenerator(config: any) {
  try {
    const response = await axiosInstance.post(apiEndpoints.agent.imageGenerator, {
      prompt: config.content || '',
      style: config.style || 'realistic',
      size: config.size || '1024x1024',
      quality: config.quality || 'standard'
    });

    return response.data;
  } catch (error) {
    console.error('Image generator error:', error);
    throw error;
  }
}

export async function executeTextGenerator(config: any) {
  try {
    const modelConfig = config.modelConfig;
    
    const response = await axiosInstance.post(`${apiEndpoints.ai.generate}`, {
      prompt: config.content || '',
      model: modelConfig ? `${modelConfig.type}/${modelConfig.model}` : 'huggingface/deepseek/deepseek-v3-0324',
      maxTokens: modelConfig?.maxTokens || 1000,
      temperature: modelConfig?.temperature || 0.7
    });

    return response.data;
  } catch (error) {
    console.error('Text generator error:', error);
    throw error;
  }
}

export async function executeTranslator(config: TranslatorConfig) {
  try {
    const response = await axiosInstance.post(apiEndpoints.agent.translator, {
      text: config.content || '',
      targetLanguage: config.targetLanguage,
      sourceLanguage: config.sourceLanguage || 'auto'
    });

    return response.data;
  } catch (error) {
    console.error('Translator error:', error);
    throw error;
  }
}

export async function executeResearchAgent(config: ResearchAgentConfig) {
  try {
    const modelConfig = config.modelConfig;
    
    const response = await axiosInstance.post(`${apiEndpoints.agent.base}/research`, {
      topic: config.content || '',
      depth: config.depth || 'medium',
      sources: config.sources || [],
      model: modelConfig ? `${modelConfig.type}/${modelConfig.model}` : 'huggingface/deepseek/deepseek-v3-0324',
      maxTokens: modelConfig?.maxTokens || 2000,
      temperature: modelConfig?.temperature || 0.7
    });

    return response.data;
  } catch (error) {
    console.error('Research agent error:', error);
    throw error;
  }
}

export async function executeYoutubeSummarizer(config: YoutubeSummarizerConfig) {
  try {
    const response = await axiosInstance.post(apiEndpoints.agent.youtubeSummarizer, {
      videoUrl: config.content || '',
      summaryLength: config.summaryLength || 'medium',
      language: config.language || 'tr'
    });

    return response.data;
  } catch (error) {
    console.error('Youtube summarizer error:', error);
    throw error;
  }
}

export async function executeAIActionAnalysis(config: AIActionAnalysisConfig) {
  try {
    const modelConfig = config.modelConfig;
    
    const analysisRequest = {
      content: config.content || '',
      model: modelConfig ? `${modelConfig.type}/${modelConfig.model}` : 'huggingface/deepseek/deepseek-v3-0324',
      customerNo: config.selectedCustomer?.customerNo,
      selectedCustomer: config.selectedCustomer,
    };

    return await executeActionAnalysis(analysisRequest);
  } catch (error) {
    console.error('AI Action Analysis error:', error);
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
      `${apiEndpoints.agent.base}/api/email-attachments/by-ids/with-content`,
      attachmentIds,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: config.api.timeout
      }
    );

    console.log('✅ Email attachments fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Email Attachments API Error:', error);
    throw error;
  }
} 