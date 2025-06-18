import axios from 'axios';
import { WebSearcherConfig, YoutubeSummarizerConfig, ResearchAgentConfig, WebScraperConfig, TranslatorConfig, AIActionAnalysisConfig, MCPSupplierAgentConfig, StatementResponse } from '@/store/types';
import { executeActionAnalysis } from './customer';
import { getMCPActionConfig, parseContentForAction, parseMCPContent, extractCustomerIdFromParameters, executeMCPRequest, initializeMCPActionConfigs } from '@/store/mcpConstants';
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
      targetLanguage: config.targetLang
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
    
    const response = await axiosInstance.post(`${apiEndpoints.agent.base}/api/agents/research`, {
      topic: config.content || '',
      depth: config.depth || 'medium',
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
      videoUrl: config.content || ''
    });

    return response.data;
  } catch (error) {
    console.error('Youtube summarizer error:', error);
    throw error;
  }
}

export async function executeAIActionAnalysis(config: AIActionAnalysisConfig) {
  try {
    console.log('🎯 executeAIActionAnalysis - Starting execution with config:', JSON.stringify(config, null, 2));
    
    const modelConfig = config.modelConfig;
    console.log('🔧 executeAIActionAnalysis - Model config:', JSON.stringify(modelConfig, null, 2));
    
    const analysisRequest = {
      content: config.content || '',
      model: modelConfig ? `${modelConfig.type}/${modelConfig.model}` : 'huggingface/deepseek/deepseek-v3-0324',
      customerNo: config.selectedCustomer?.id?.toString() || undefined,
      temperature: modelConfig?.temperature || 0.7,
      maxTokens: modelConfig?.maxTokens || 1000,
      // Remove selectedCustomer object - backend doesn't expect it
    };

    console.log('📤 executeAIActionAnalysis - Sending request:', JSON.stringify(analysisRequest, null, 2));
    console.log('🌐 executeAIActionAnalysis - API endpoint:', apiEndpoints.mcp.actionAnalysis);

    // Validate required fields
    if (!analysisRequest.content) {
      console.error('❌ executeAIActionAnalysis - Content is empty');
      throw new Error('Content is required for action analysis');
    }

    const result = await executeActionAnalysis(analysisRequest);
    console.log('✅ executeAIActionAnalysis - Received response:', JSON.stringify(result, null, 2));
    
    return result;
  } catch (error) {
    console.error('❌ executeAIActionAnalysis - Error details:', {
      error,
      errorMessage: (error as any)?.message,
      errorResponse: (error as any)?.response?.data,
      errorStatus: (error as any)?.response?.status,
      config: JSON.stringify(config, null, 2)
    });
    throw error;
  }
}

export async function executeMCPSupplierAgent(config: any) {
  try {
    console.log('🎯 MCP Supplier Agent - Starting execution:', config);

    // Ensure MCP action configs are initialized before execution
    try {
      await initializeMCPActionConfigs();
      console.log('✅ MCP Supplier Agent - Action configs initialized successfully');
    } catch (initError) {
      console.warn('⚠️ MCP Supplier Agent - Failed to initialize action configs:', initError);
      // Continue execution as configs might already be loaded
    }

    // Access Redux store for accumulated responses
    if (typeof window !== 'undefined' && (window as any).__REDUX_STORE__) {
      console.log('✅ MCP Supplier Agent - Accessing store via __REDUX_STORE__');
      
      const store = (window as any).__REDUX_STORE__;
      const accumulatedData = store.getState().customer.accumulatedResponses;
      
      console.log('🔍 MCP Supplier Agent - Accumulated responses from Redux:', JSON.stringify(accumulatedData, null, 2));

      // Preprocess accumulated responses to get parameters for current action type
      let preprocessedData = null;
      
      if (accumulatedData && accumulatedData.responses && accumulatedData.responses.length > 0) {
        console.log('🔄 MCP Supplier Agent - Preprocessing accumulated responses for action type:', config.actionType);
        
        preprocessedData = preprocessAccumulatedResponses(
          accumulatedData.responses,
          config.actionType,
          config.selectedCustomer
        );
        
        if (preprocessedData) {
          console.log('✅ MCP Supplier Agent - Preprocessed data created:', JSON.stringify(preprocessedData, null, 2));
        } else {
          console.log('❌ MCP Supplier Agent - No preprocessed data available');
        }
      } else {
        console.log('⚠️ MCP Supplier Agent - No accumulated responses available');
      }

      // If we have preprocessed data, use it directly for MCP execution
      if (!preprocessedData) {
        console.log('🔄 MCP Supplier Agent - No preprocessed data, fallback: parsing content directly');
        
        const fallbackParsed = parseMCPContent(config.content || '');
        console.log('✅ MCP Supplier Agent - Content parsed successfully:', fallbackParsed);
        
        preprocessedData = fallbackParsed;
      }

      // Determine which customer to use
      let customerToUse = config.selectedCustomer;
      
      if (!customerToUse && accumulatedData?.responses) {
        // Try to get customer from the last AI Action Analysis response
        const aiActionResponse = accumulatedData.responses.find((r: any) => r.nodeType === 'aiActionAnalysis');
        if (aiActionResponse?.customer) {
          customerToUse = aiActionResponse.customer;
          console.log('✅ MCP Supplier Agent - Using customer from AI Action Analysis:', customerToUse);
        }
      }
      
      if (!customerToUse) {
        console.log('✅ MCP Supplier Agent - Using selectedCustomer from config:', config.selectedCustomer);
        customerToUse = config.selectedCustomer;
      }

      // Prepare parameters for execution - ONLY for current action type
      let parsedParameters = preprocessedData;
      
      // **CRITICAL FIX**: Ensure we only execute THIS node's action type
      // Get parameters specifically for this action type
      let finalParameters: Record<string, any> = {};
      
      if (parsedParameters && parsedParameters.parameters && parsedParameters.parameters[config.actionType]) {
        finalParameters = {
          [config.actionType]: parsedParameters.parameters[config.actionType]
        };
        console.log('✅ MCP Supplier Agent - Using action-specific parameters:', finalParameters);
      } else {
        console.log('⚠️ MCP Supplier Agent - No parameters found for action type:', config.actionType);
        // Create empty parameters for this action type
        finalParameters = {
          [config.actionType]: {}
        };
      }

      // Ensure customer ID is added to the parameters if not present
      if (finalParameters[config.actionType] && !finalParameters[config.actionType].customerId) {
        if (customerToUse && customerToUse.id) {
          finalParameters[config.actionType].customerId = customerToUse.id.toString();
          console.log('✅ MCP Supplier Agent - Added customerId to parameters:', customerToUse.id);
        }
      }

      const finalParsedParameters = {
        selectedActions: [config.actionType], // Only this action
        parameters: finalParameters
      };

      console.log('🔍 MCP Supplier Agent - Final parsedParameters before execution:', JSON.stringify(finalParsedParameters, null, 2));

      // Execute MCP request
      const result = await executeMCPRequest({
        customer: customerToUse,
        parsedParameters: finalParsedParameters,
        modelConfig: config.modelConfig,
        content: config.content || '',
        actionType: config.actionType
      });

      console.log('✅ MCP Supplier Agent - Response received:', result);
      return result;

    } else {
      console.error('❌ MCP Supplier Agent - Redux store not available');
      throw new Error('Redux store not accessible');
    }

  } catch (error) {
    console.error('❌ MCP Supplier Agent API Error:', error);
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
    
    // **DEBUG**: Log the complete responses array structure
    console.log('🔍 COMPLETE RESPONSES ARRAY STRUCTURE:');
    responses.forEach((response, index) => {
      console.log(`🔍 Response ${index}:`, {
        nodeId: response.nodeId,
        nodeType: response.nodeType,
        actionType: response.actionType,
        hasResponse: !!response.response,
        responseKeys: response.response ? Object.keys(response.response) : 'N/A',
        responseType: typeof response.response,
        hasResponseData: !!(response.response && response.response.data),
        hasResponseResults: !!(response.response && response.response.results),
        hasResponseContent: !!(response.response && response.response.content),
        fullResponse: JSON.stringify(response, null, 2)
      });
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
      // For SEND_EMAIL, collect attachment IDs from ALL previous node responses
      // Not just mcpSupplierAgent - any node could generate attachments
      const allPreviousResponses = responses.filter(r => 
        r.response && (r.response.data || r.response.results || r.response.content) // Check for any response content
      );

      // Collect all attachment IDs from all previous nodes
      const allAttachmentIds: number[] = [];
      let emailBodyEnhancements: string[] = [];

      console.log(`🔍 SEND_EMAIL - Found ${allPreviousResponses.length} total responses to process (all node types)`);

      for (const response of allPreviousResponses) {
        console.log(`🔄 SEND_EMAIL - Processing response from node ${response.nodeId || 'unknown'} (${response.nodeType || 'unknown'}) action: ${response.actionType || 'N/A'}`);
        console.log(`🔄 SEND_EMAIL - Response structure:`, JSON.stringify(response, null, 2));
        
        // Look for attachment IDs in the response - check multiple locations
        let attachmentIds: number[] | null = null;
        
        // Check response.data first (for some API responses)
        if (response.response && response.response.data) {
          attachmentIds = extractAttachmentIdsFromResponse(response.response.data);
        }
        
        // If not found in data, check response.results (for MCP responses)
        if (!attachmentIds && response.response && response.response.results) {
          attachmentIds = extractAttachmentIdsFromResponse(response.response);
        }
        
        // If still not found, check the entire response structure
        if (!attachmentIds && response.response) {
          attachmentIds = extractAttachmentIdsFromResponse(response.response);
        }
        
        if (attachmentIds && attachmentIds.length > 0) {
          allAttachmentIds.push(...attachmentIds);
          console.log(`✅ SEND_EMAIL - Added ${attachmentIds.length} attachment IDs from ${response.nodeType}/${response.actionType}: [${attachmentIds.join(', ')}]`);
        } else {
          console.log(`⚠️ SEND_EMAIL - No attachment IDs found in response from ${response.nodeType}/${response.actionType}`);
        }

        // Enhance email body with transaction summary if available (from any node)
        if (response.response && (response.response.data?.results || response.response.results)) {
          const transactionSummary = extractTransactionSummaryFromResponse(response.response.data || response.response);
          if (transactionSummary) {
            emailBodyEnhancements.push(`${response.actionType || response.nodeType}: ${transactionSummary}`);
            console.log(`✅ SEND_EMAIL - Added transaction summary from ${response.nodeType}/${response.actionType}`);
          }
        }
      }

      // Remove duplicates from attachment IDs
      const uniqueAttachmentIds = [...new Set(allAttachmentIds)];
      
      console.log(`🔍 SEND_EMAIL - All collected attachment IDs: [${allAttachmentIds.join(', ')}]`);
      console.log(`🔍 SEND_EMAIL - Unique attachment IDs: [${uniqueAttachmentIds.join(', ')}]`);
      
      if (uniqueAttachmentIds.length > 0) {
        enhancedParams.attachmentIds = uniqueAttachmentIds;
        console.log(`✅ SEND_EMAIL - Final merged attachment IDs: [${uniqueAttachmentIds.join(', ')}] (${uniqueAttachmentIds.length} unique attachments from ${allPreviousResponses.length} nodes)`);
      } else {
        console.log('⚠️ SEND_EMAIL - No attachment IDs found in any previous responses - using empty array');
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
    console.log('🔍 Extracting attachment IDs from response:', JSON.stringify(responseData, null, 2));
    
    // **DEBUG**: Log the complete response structure to understand what we're working with
    console.log('🔍 Response type:', typeof responseData);
    console.log('🔍 Response keys:', Object.keys(responseData || {}));
    console.log('🔍 Response.attachmentIds exists:', !!responseData?.attachmentIds);
    console.log('🔍 Response.results exists:', !!responseData?.results);
    
    const foundAttachmentIds: number[] = [];
    
    // Method 1: Check direct attachmentIds property
    if (responseData.attachmentIds && Array.isArray(responseData.attachmentIds)) {
      console.log('✅ Found direct attachmentIds:', responseData.attachmentIds);
      foundAttachmentIds.push(...responseData.attachmentIds);
    }
    
    // Method 2: Check in results array for successful responses (MCP format)
    if (responseData.results && Array.isArray(responseData.results)) {
      console.log('🔍 Processing results array with', responseData.results.length, 'items');
      for (const result of responseData.results) {
        console.log('🔍 Checking result:', JSON.stringify(result, null, 2));
        console.log('🔍 Result type:', typeof result);
        console.log('🔍 Result keys:', Object.keys(result || {}));
        
        if (result.success && result.data) {
          console.log('🔍 Result.data type:', typeof result.data);
          console.log('🔍 Result.data keys:', Object.keys(result.data || {}));
          console.log('🔍 Result.data.attachmentIds exists:', !!result.data.attachmentIds);
          console.log('🔍 Result.data.attachmentIds value:', result.data.attachmentIds);
          
          // Check if attachment IDs are in result.data.attachmentIds
          if (result.data.attachmentIds && Array.isArray(result.data.attachmentIds)) {
            console.log('✅ Found attachmentIds in result.data:', result.data.attachmentIds);
            foundAttachmentIds.push(...result.data.attachmentIds);
          }
          
          // Check for attachment IDs in nested response structures
          if (result.data.response && result.data.response.attachmentIds && Array.isArray(result.data.response.attachmentIds)) {
            console.log('✅ Found attachmentIds in result.data.response:', result.data.response.attachmentIds);
            foundAttachmentIds.push(...result.data.response.attachmentIds);
          }
          
          // Check for attachment IDs in result.data.results (nested results)
          if (result.data.results && Array.isArray(result.data.results)) {
            for (const nestedResult of result.data.results) {
              if (nestedResult.attachmentIds && Array.isArray(nestedResult.attachmentIds)) {
                console.log('✅ Found attachmentIds in nested result:', nestedResult.attachmentIds);
                foundAttachmentIds.push(...nestedResult.attachmentIds);
              }
            }
          }
        }
        
        // Also check direct result properties (in case attachmentIds is at result level)
        if (result.attachmentIds && Array.isArray(result.attachmentIds)) {
          console.log('✅ Found attachmentIds in result:', result.attachmentIds);
          foundAttachmentIds.push(...result.attachmentIds);
        }
      }
    }
    
    // Method 3: Check if it's a nested response structure (e.g., from different API formats)
    if (responseData.data && typeof responseData.data === 'object') {
      if (responseData.data.attachmentIds && Array.isArray(responseData.data.attachmentIds)) {
        console.log('✅ Found attachmentIds in nested data:', responseData.data.attachmentIds);
        foundAttachmentIds.push(...responseData.data.attachmentIds);
      }
    }
    
    // Method 4: Check if response has content with attachment references
    if (responseData.content && typeof responseData.content === 'string') {
      // Look for attachment ID patterns in content (e.g., "attachmentId: 67" or "attachment_id: 67")
      const attachmentIdMatches = responseData.content.match(/attachment[_\s]*id[s]?[:\s]*(\d+)/gi);
      if (attachmentIdMatches) {
        const extractedIds = attachmentIdMatches.map((match: string) => {
          const idMatch = match.match(/(\d+)/);
          return idMatch ? parseInt(idMatch[1]) : null;
        }).filter((id: number | null) => id !== null);
        
        if (extractedIds.length > 0) {
          console.log('✅ Found attachment IDs in content:', extractedIds);
          foundAttachmentIds.push(...extractedIds);
        }
      }
    }
    
    // Method 5: Deep search in any nested objects for attachment-related fields
    const deepSearch = (obj: any, visited = new Set()): number[] => {
      if (!obj || typeof obj !== 'object' || visited.has(obj)) return [];
      visited.add(obj);
      
      const ids: number[] = [];
      
      for (const [key, value] of Object.entries(obj)) {
        // Check if key suggests attachment IDs
        if (key.toLowerCase().includes('attachment') && key.toLowerCase().includes('id') && Array.isArray(value)) {
          const validIds = value.filter((id: any) => typeof id === 'number');
          if (validIds.length > 0) {
            console.log(`✅ Found attachment IDs via deep search in key "${key}":`, validIds);
            ids.push(...validIds);
          }
        }
        // Recursively search nested objects
        else if (typeof value === 'object' && value !== null) {
          ids.push(...deepSearch(value, visited));
        }
      }
      
      return ids;
    };
    
    const deepSearchIds = deepSearch(responseData);
    if (deepSearchIds.length > 0) {
      console.log('✅ Found attachment IDs via deep search:', deepSearchIds);
      foundAttachmentIds.push(...deepSearchIds);
    }
    
    // Remove duplicates and return
    const uniqueIds = [...new Set(foundAttachmentIds)];
    
    if (uniqueIds.length > 0) {
      console.log(`✅ Total unique attachment IDs found: [${uniqueIds.join(', ')}]`);
      return uniqueIds;
    }
    
    console.log('⚠️ No attachment IDs found in response structure');
    console.log('🔍 Final debug - response structure summary:', {
      hasAttachmentIds: !!responseData?.attachmentIds,
      hasResults: !!responseData?.results,
      hasData: !!responseData?.data,
      hasContent: !!responseData?.content,
      topLevelKeys: Object.keys(responseData || {}),
      responseType: typeof responseData
    });
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