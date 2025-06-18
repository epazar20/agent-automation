import { FinanceActionType } from './types';
import { apiEndpoints, config } from '@/config/env';

// Dynamic action configurations
export let dynamicActionConfigs: FinanceActionType[] = [];

// Initialize action configurations from API or use provided data
export async function initializeMCPActionConfigs(actionTypes?: FinanceActionType[]): Promise<void> {
  try {
    if (actionTypes && actionTypes.length > 0) {
      // Use provided action types (from ActionTypeSelector)
      dynamicActionConfigs = actionTypes;
      
      if (config.debug) {
        console.log('🔧 MCP Action Configs initialized from provided data:', dynamicActionConfigs.length);
      }
      return;
    }

    // Fallback: fetch from API
    const response = await fetch(apiEndpoints.mcp.financeActionTypes, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch finance action types: ${response.status}`);
    }
    
    dynamicActionConfigs = await response.json();
    
    if (config.debug) {
      console.log('🔧 MCP Action Configs initialized from API:', dynamicActionConfigs.length);
    }
  } catch (error) {
    console.error('❌ Failed to initialize MCP action configs:', error);
    dynamicActionConfigs = []; // Fallback to empty array
  }
}

// Get MCP action configuration by type
export function getMCPActionConfig(actionType: string): FinanceActionType | undefined {
  if (config.debug) {
    console.log('🔍 getMCPActionConfig - Looking for actionType:', actionType);
    console.log('🔍 getMCPActionConfig - Available configs:', dynamicActionConfigs.map(c => ({
      typeCode: c.typeCode,
      typeName: c.typeName,
      endpointPath: c.endpointPath,
      description: c.description
    })));
  }
  
  const result = dynamicActionConfigs.find(config => config.typeCode === actionType);
  
  if (config.debug) {
    console.log('🔍 getMCPActionConfig - Result:', result ? 'Found' : 'Not found', result);
  }
  
  return result;
}

// Parse content for action analysis
export function parseContentForAction(content: string): any {
  if (!content) return null;
  
  try {
    // Try to parse as JSON first
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
  } catch {
    // If JSON parsing fails, try to extract structured data from text
  }
  
  // Fallback: create a simple structure
  return {
    selectedActions: [],
    parameters: {},
    rawContent: content
  };
}

// Parse MCP content for execution
export function parseMCPContent(content: string): {
  selectedActions: string[];
  parameters: Record<string, any>;
} {
  const defaultResult = {
    selectedActions: [],
    parameters: {}
  };

  if (!content || typeof content !== 'string') {
    return defaultResult;
  }

  try {
    // First, handle markdown code blocks (```json ... ```)
    let cleanContent = content.trim();
    
    // Extract content from markdown code blocks
    const codeBlockMatch = cleanContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch && codeBlockMatch[1]) {
      cleanContent = codeBlockMatch[1].trim();
      console.log('🧹 Extracted content from markdown code block:', cleanContent.substring(0, 200) + '...');
    }

    // Try to parse as JSON
    const parsed = JSON.parse(cleanContent);
    if (parsed && typeof parsed === 'object') {
      const result = {
        selectedActions: Array.isArray(parsed.selectedActions) ? parsed.selectedActions : [],
        parameters: parsed.parameters && typeof parsed.parameters === 'object' ? parsed.parameters : {}
      };
      
      console.log('✅ Successfully parsed MCP content:', {
        selectedActionsCount: result.selectedActions.length,
        parametersKeys: Object.keys(result.parameters),
        selectedActions: result.selectedActions
      });
      
      return result;
    }
  } catch (error) {
    console.warn('⚠️ JSON parsing failed, trying pattern matching:', error);
  }

  // Try to extract actions and parameters from text using more flexible patterns
  let selectedActions: string[] = [];
  let parameters: Record<string, any> = {};

  // Look for selectedActions with more flexible regex
  const actionMatches = content.match(/["']?selectedActions["']?\s*:\s*\[(.*?)\]/);
  if (actionMatches && actionMatches[1]) {
    try {
      selectedActions = JSON.parse(`[${actionMatches[1]}]`);
    } catch {
      // Extract simple string array - handle both quoted and unquoted strings
      selectedActions = actionMatches[1]
        .split(',')
        .map(s => s.trim().replace(/^["']|["']$/g, ''))
        .filter(s => s.length > 0);
    }
  }

  // Look for parameters with more flexible regex  
  const paramMatches = content.match(/["']?parameters["']?\s*:\s*\{([\s\S]*?)\}(?:\s*[,}]|$)/);
  if (paramMatches && paramMatches[1]) {
    try {
      parameters = JSON.parse(`{${paramMatches[1]}}`);
    } catch (error) {
      console.warn('⚠️ Parameters parsing failed:', error);
      // Try to extract nested object structure
      parameters = tryExtractNestedParameters(paramMatches[1]);
    }
  }

  const result = {
    selectedActions,
    parameters
  };

  console.log('📝 Pattern matching result:', {
    selectedActionsCount: result.selectedActions.length,
    parametersKeys: Object.keys(result.parameters),
    selectedActions: result.selectedActions
  });

  return result;
}

// Helper function to extract nested parameters structure
function tryExtractNestedParameters(paramContent: string): Record<string, any> {
  const parameters: Record<string, any> = {};
  
  try {
    // Look for action-specific parameter blocks like "GENERATE_STATEMENT": {...}
    const actionParamRegex = /["']?([A-Z_]+)["']?\s*:\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g;
    let match;
    
    while ((match = actionParamRegex.exec(paramContent)) !== null) {
      const actionType = match[1];
      const actionParams = match[2];
      
      try {
        parameters[actionType] = JSON.parse(`{${actionParams}}`);
        console.log(`✅ Extracted parameters for ${actionType}`);
      } catch {
        // Basic key-value extraction for this action
        const actionParamObj: Record<string, any> = {};
        const pairs = actionParams.split(',');
        
        for (const pair of pairs) {
          const colonIndex = pair.indexOf(':');
          if (colonIndex > 0) {
            const key = pair.substring(0, colonIndex).trim().replace(/^["']|["']$/g, '');
            const value = pair.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
            
            // Try to parse as number, boolean, or keep as string
            if (value === 'null') {
              actionParamObj[key] = null;
            } else if (value === 'true') {
              actionParamObj[key] = true;
            } else if (value === 'false') {
              actionParamObj[key] = false;
            } else if (!isNaN(Number(value))) {
              actionParamObj[key] = Number(value);
            } else {
              actionParamObj[key] = value;
            }
          }
        }
        
        if (Object.keys(actionParamObj).length > 0) {
          parameters[actionType] = actionParamObj;
          console.log(`✅ Extracted basic parameters for ${actionType}:`, Object.keys(actionParamObj));
        }
      }
    }
  } catch (error) {
    console.warn('⚠️ Nested parameter extraction failed:', error);
  }
  
  return parameters;
}

// Extract customer ID from parameters
export function extractCustomerIdFromParameters(parsedParameters: any, customer: any): string | null {
  // Try multiple sources for customer ID
  const sources = [
    parsedParameters?.parameters?.customerId,
    parsedParameters?.customerId,
    customer?.id,
    customer?.customerNo,
    customer?.customerId
  ];

  for (const source of sources) {
    if (source !== null && source !== undefined) {
      return String(source);
    }
  }

  return null;
}

// Map action types to their specific API endpoints (REMOVED - now using dynamic endpointPath)
// function getActionEndpoint(actionType: string): string { ... } - REMOVED

// Execute MCP request with dynamic endpoint
export async function executeMCPRequest(params: {
  customer: any;
  parsedParameters: any;
  modelConfig: any;
  content: string;
  actionType: string;
}): Promise<any> {
  const { customer, parsedParameters, modelConfig, content, actionType } = params;
  
  try {
    if (config.debug) {
      console.log('🚀 MCP Request - Executing with params:', {
        customerId: customer.id || customer.customerNo,
        parsedParameters,
        modelConfig,
        actionType
      });
    }

    if (!parsedParameters || !parsedParameters.parameters) {
      if (config.debug) {
        console.error('❌ MCP Request - Validation failed:', {
          hasParsedParameters: !!parsedParameters,
          hasParameters: !!(parsedParameters && parsedParameters.parameters),
          actualValue: parsedParameters
        });
      }
      throw new Error('Invalid parsed parameters: missing parameters');
    }

    const results = [];
    const customerId = extractCustomerIdFromParameters(parsedParameters, customer);
    if (!customerId) {
      throw new Error('Customer ID could not be determined');
    }

    // **CRITICAL FIX**: Only execute the current node's action type, not all selectedActions
    // This ensures each MCP Supplier Agent node only calls its own action
    if (!actionType) {
      throw new Error('Current action type not specified');
    }

    console.log('🎯 MCP Request - Executing ONLY current action type:', actionType);

    // Get action configuration from backend data
    const actionConfig = getMCPActionConfig(actionType);
    if (!actionConfig) {
      throw new Error(`Unknown action type: ${actionType}. Please ensure action type is loaded from backend.`);
    }

    // **ENDPOINT FIX**: Properly construct endpoint URL
    // Remove leading slash if exists and handle api/ prefix properly
    let endpointPath = actionConfig.endpointPath.trim();
    
    // Remove leading slash if exists
    if (endpointPath.startsWith('/')) {
      endpointPath = endpointPath.substring(1);
    }
    
    // If endpointPath already starts with 'api/', use it as is
    // If not, add 'api/' prefix
    if (!endpointPath.startsWith('api/')) {
      endpointPath = `api/${endpointPath}`;
    }
    
    // Construct final endpoint - make sure there's no double slash
    const baseUrl = apiEndpoints.mcp.base.endsWith('/') ? 
      apiEndpoints.mcp.base.slice(0, -1) : 
      apiEndpoints.mcp.base;
    
    const endpoint = `${baseUrl}/${endpointPath}`;
    
    console.log('🔧 Endpoint Construction Debug:', {
      originalEndpointPath: actionConfig.endpointPath,
      cleanedEndpointPath: endpointPath,
      baseUrl,
      finalEndpoint: endpoint
    });

    // Get action-specific parameters from the parsed parameters
    const actionSpecificParams = parsedParameters.parameters[actionType] || {};
    
    const requestBody = {
      actionType: actionType,
      customerId: parseInt(customerId),
      ...actionSpecificParams
    };

    console.log('🎯 MCP Request - Executing action:', {
      action: actionType,
      actionConfig: {
        typeCode: actionConfig.typeCode,
        typeName: actionConfig.typeName,
        endpointPath: actionConfig.endpointPath,
        fixedEndpointPath: endpointPath
      },
      endpoint,
      baseEndpoint: apiEndpoints.mcp.base,
      fullURL: endpoint,
      actionSpecificParams,
      requestBody,
      customerId: parseInt(customerId),
      allParameters: parsedParameters.parameters
    });

    try {
      console.log('📡 MCP Request - Making fetch request to:', endpoint);
      console.log('📋 MCP Request - Request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📡 MCP Request - Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ MCP Request - HTTP Error Response:', {
          status: response.status,
          statusText: response.statusText,
          errorText,
          endpoint
        });
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      
      // **DEBUG**: Log the raw backend response before wrapping
      console.log('📡 MCP Request - Raw backend response:', JSON.stringify(result, null, 2));
      console.log('📡 MCP Request - Backend response type:', typeof result);
      console.log('📡 MCP Request - Backend response keys:', Object.keys(result || {}));
      console.log('📡 MCP Request - Backend attachmentIds exists:', !!result?.attachmentIds);
      console.log('📡 MCP Request - Backend attachmentIds value:', result?.attachmentIds);
      
      results.push({
        action: actionType,
        success: true,
        data: result
      });

      console.log('✅ MCP Request - Action completed successfully:', { action: actionType, result });
    } catch (actionError) {
      console.error(`❌ MCP Request - Action failed: ${actionType}:`, {
        error: actionError,
        message: actionError instanceof Error ? actionError.message : String(actionError),
        stack: actionError instanceof Error ? actionError.stack : undefined,
        endpoint,
        requestBody,
        type: actionError instanceof TypeError ? 'Network/CORS Error' : 'Other Error'
      });
      
      // Additional debug info for fetch failures
      if (actionError instanceof TypeError && actionError.message.includes('Failed to fetch')) {
        console.error('🌐 Network Diagnostic:', {
          mcpProviderBase: config.api.mcpProvider,
          isLocalhost: endpoint.includes('localhost'),
          possibleCauses: [
            'Backend not running on port 8083',
            'CORS configuration issue',
            'Network connectivity problem',
            'Firewall blocking request'
          ]
        });
      }
      
      results.push({
        action: actionType,
        success: false,
        error: actionError instanceof Error ? actionError.message : String(actionError)
      });
    }

    const overallSuccess = results.every(r => r.success);
    const summary = {
      success: overallSuccess,
      totalActions: 1, // Only one action executed per node
      successfulActions: results.filter(r => r.success).length,
      failedActions: results.filter(r => !r.success).length,
      results: results
    };

    if (config.debug) {
      console.log('📊 MCP Request - Execution summary:', summary);
    }

    return summary;
  } catch (error) {
    console.error('❌ MCP Request - Fatal error:', error);
    throw error;
  }
} 