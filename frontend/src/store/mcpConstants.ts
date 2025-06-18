import { FinanceActionType } from './types';
import { apiEndpoints, config } from '@/config/env';

// Dynamic action configurations
export let dynamicActionConfigs: FinanceActionType[] = [];

// Initialize action configurations from API
export async function initializeMCPActionConfigs(): Promise<void> {
  try {
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
      console.log('🔧 MCP Action Configs initialized:', dynamicActionConfigs);
    }
  } catch (error) {
    console.error('❌ Failed to initialize MCP action configs:', error);
    dynamicActionConfigs = []; // Fallback to empty array
  }
}

// Get MCP action configuration by type
export function getMCPActionConfig(actionType: string): FinanceActionType | undefined {
  return dynamicActionConfigs.find(config => config.typeCode === actionType);
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
    // First try to parse as JSON
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed === 'object') {
      return {
        selectedActions: Array.isArray(parsed.selectedActions) ? parsed.selectedActions : [],
        parameters: parsed.parameters && typeof parsed.parameters === 'object' ? parsed.parameters : {}
      };
    }
  } catch {
    // JSON parsing failed, try pattern matching
  }

  // Try to extract actions and parameters from text
  const actionMatches = content.match(/selectedActions[\s]*:[\s]*\[(.*?)\]/s);
  const paramMatches = content.match(/parameters[\s]*:[\s]*\{(.*?)\}/s);

  let selectedActions: string[] = [];
  let parameters: Record<string, any> = {};

  if (actionMatches && actionMatches[1]) {
    try {
      selectedActions = JSON.parse(`[${actionMatches[1]}]`);
    } catch {
      // Extract simple string array
      selectedActions = actionMatches[1]
        .split(',')
        .map(s => s.trim().replace(/['"]/g, ''))
        .filter(s => s.length > 0);
    }
  }

  if (paramMatches && paramMatches[1]) {
    try {
      parameters = JSON.parse(`{${paramMatches[1]}}`);
    } catch {
      // Basic key-value extraction
      const pairs = paramMatches[1].split(',');
      for (const pair of pairs) {
        const [key, ...valueParts] = pair.split(':');
        if (key && valueParts.length > 0) {
          const cleanKey = key.trim().replace(/['"]/g, '');
          const cleanValue = valueParts.join(':').trim().replace(/['"]/g, '');
          parameters[cleanKey] = cleanValue;
        }
      }
    }
  }

  return {
    selectedActions,
    parameters
  };
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

    if (!parsedParameters || !parsedParameters.selectedActions || !parsedParameters.parameters) {
      if (config.debug) {
        console.error('❌ MCP Request - Validation failed:', {
          hasParsedParameters: !!parsedParameters,
          hasSelectedActions: !!(parsedParameters && parsedParameters.selectedActions),
          hasParameters: !!(parsedParameters && parsedParameters.parameters),
          actualValue: parsedParameters
        });
      }
      throw new Error('Invalid parsed parameters: missing selectedActions or parameters');
    }

    const results = [];

    // Get the endpoint for this action type
    const actionConfig = getMCPActionConfig(actionType);
    if (!actionConfig) {
      throw new Error(`Unknown action type: ${actionType}`);
    }

    const customerId = extractCustomerIdFromParameters(parsedParameters, customer);
    if (!customerId) {
      throw new Error('Customer ID could not be determined');
    }

    // Execute each selected action
    for (const action of parsedParameters.selectedActions) {
      const endpoint = `${apiEndpoints.mcp.financeActions}/${action}`;
      
      const requestBody = {
        customerId: parseInt(customerId),
        ...parsedParameters.parameters
      };

      if (config.debug) {
        console.log('🎯 MCP Request - Executing action:', {
          action,
          endpoint,
          requestBody
        });
      }

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        results.push({
          action,
          success: true,
          data: result
        });

        if (config.debug) {
          console.log('✅ MCP Request - Action completed:', { action, result });
        }
      } catch (actionError) {
        console.error(`❌ MCP Request - Action failed: ${action}:`, actionError);
        results.push({
          action,
          success: false,
          error: actionError instanceof Error ? actionError.message : String(actionError)
        });
      }
    }

    const overallSuccess = results.every(r => r.success);
    const summary = {
      success: overallSuccess,
      totalActions: parsedParameters.selectedActions.length,
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