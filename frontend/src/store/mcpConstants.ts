import { MCPActionType, MCPActionConfig, FinanceActionType } from './types';
import axios from 'axios';

// Dynamic MCP Action Configurations - populated from API
let dynamicActionConfigs: Record<string, MCPActionConfig> = {};

// Initialize action configs from finance action types
export function initializeMCPActionConfigs(actionTypes: FinanceActionType[]) {
  dynamicActionConfigs = {};
  actionTypes.forEach(actionType => {
    if (actionType.isActive) {
      dynamicActionConfigs[actionType.typeCode] = {
        type: actionType.typeCode,
        label: actionType.typeName,
        endpoint: actionType.endpointPath,
        description: actionType.description,
        jsonSchema: actionType.jsonSchema,
      };
    }
  });
  console.log('🔧 MCP Action Configs initialized:', Object.keys(dynamicActionConfigs));
}

// Helper function to get action config
export function getMCPActionConfig(actionType: MCPActionType): MCPActionConfig {
  const config = dynamicActionConfigs[actionType];
  if (!config) {
    console.warn(`⚠️ MCP Action config not found for type: ${actionType}`);
    return {
      type: actionType,
      label: actionType,
      endpoint: '/api/unknown',
      description: 'Unknown action type',
    };
  }
  return config;
}

// Helper function to get all available actions
export function getAvailableMCPActions(): MCPActionConfig[] {
  return Object.values(dynamicActionConfigs);
}

// Helper function to check if action type exists
export function isValidMCPActionType(actionType: string): boolean {
  return actionType in dynamicActionConfigs;
}

// JSON Parser for content preprocessing
export function parseContentForAction(content: string, actionType: MCPActionType): any {
  if (!content || typeof content !== 'string') return null;

  try {
    let jsonData;
    const trimmedContent = content.trim();
    
    // First, try to extract JSON from markdown code blocks
    const jsonMatch = trimmedContent.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      console.log('🔍 MCP Content Parser - Found JSON in markdown block');
      const jsonString = jsonMatch[1].trim();
      jsonData = JSON.parse(jsonString);
    } else if (trimmedContent.startsWith('{')) {
      // Try to parse as direct JSON
      console.log('🔍 MCP Content Parser - Parsing as direct JSON');
      jsonData = JSON.parse(trimmedContent);
    } else {
      console.log('❌ MCP Content Parser - No valid JSON format found');
      return null;
    }
    
    // Extract parameters for the specific action type from AI Action Analysis response
    if (jsonData.parameters && jsonData.parameters[actionType]) {
      console.log('🎯 MCP Content Parser - Found parameters for action:', actionType, jsonData.parameters[actionType]);
      return jsonData.parameters[actionType];
    }

    // If it's already a direct action object, return it
    if (jsonData.actionType === actionType) {
      console.log('🎯 MCP Content Parser - Found direct action object:', jsonData);
      return jsonData;
    }

    console.log('❌ MCP Content Parser - No matching parameters found for action:', actionType);
    console.log('Available data structure:', Object.keys(jsonData));
    return null;
  } catch (error) {
    console.error('❌ MCP Content Parser - Error parsing content:', error);
    console.error('Content that failed to parse:', content.substring(0, 200) + '...');
    return null;
  }
}

// General MCP content parser (for any action type)
export function parseMCPContent(content: string): any {
  if (!content || typeof content !== 'string') return null;

  try {
    let jsonData;
    const trimmedContent = content.trim();
    
    // First, try to extract JSON from markdown code blocks
    const jsonMatch = trimmedContent.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      console.log('🔍 MCP Content Parser - Found JSON in markdown block');
      const jsonString = jsonMatch[1].trim();
      jsonData = JSON.parse(jsonString);
    } else if (trimmedContent.startsWith('{')) {
      // Try to parse as direct JSON
      console.log('🔍 MCP Content Parser - Parsing as direct JSON');
      jsonData = JSON.parse(trimmedContent);
    } else {
      console.log('❌ MCP Content Parser - No valid JSON format found');
      return null;
    }
    
    // Check if it's AI Action Analysis format (has selectedActions and parameters)
    if (jsonData.selectedActions || jsonData.parameters) {
      console.log('🎯 MCP Content Parser - Found AI Action Analysis format:', jsonData);
      return jsonData;
    }
    
    // Check if it's a direct action object (independent node usage)
    if (jsonData.actionType) {
      console.log('🎯 MCP Content Parser - Found direct action object, converting to MCP format');
      // Convert direct action object to MCP format
      const actionType = jsonData.actionType;
      return {
        selectedActions: [actionType],
        parameters: {
          [actionType]: jsonData
        }
      };
    }

    console.log('❌ MCP Content Parser - No valid MCP structure found');
    return null;
  } catch (error) {
    console.error('❌ MCP Content Parser - Error parsing content:', error);
    console.error('Content that failed to parse:', content.substring(0, 200) + '...');
    return null;
  }
}

// Extract customer ID from parsed parameters
export function extractCustomerIdFromParameters(parsedParameters: any): string | null {
  if (!parsedParameters) return null;
  
  // Check if it's a direct action with customerId
  if (parsedParameters.customerId) {
    return parsedParameters.customerId.toString();
  }
  
  // Check if it has parameters object with actions
  if (parsedParameters.parameters) {
    for (const actionKey in parsedParameters.parameters) {
      const actionData = parsedParameters.parameters[actionKey];
      if (actionData && actionData.customerId) {
        return actionData.customerId.toString();
      }
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
    console.log('🚀 MCP Request - Executing with params:', {
      customerId: customer.id || customer.customerNo,
      parsedParameters,
      modelConfig,
      actionType
    });

    // Detailed debugging of parsedParameters structure
    console.log('🔍 MCP Request - Detailed parsedParameters analysis:', {
      parsedParameters: parsedParameters,
      type: typeof parsedParameters,
      isNull: parsedParameters === null,
      isUndefined: parsedParameters === undefined,
      hasSelectedActions: parsedParameters && parsedParameters.selectedActions,
      hasParameters: parsedParameters && parsedParameters.parameters,
      selectedActionsType: parsedParameters && typeof parsedParameters.selectedActions,
      parametersType: parsedParameters && typeof parsedParameters.parameters,
      keys: parsedParameters ? Object.keys(parsedParameters) : 'No keys'
    });

    if (!parsedParameters || !parsedParameters.selectedActions || !parsedParameters.parameters) {
      console.error('❌ MCP Request - Validation failed:', {
        hasParsedParameters: !!parsedParameters,
        hasSelectedActions: !!(parsedParameters && parsedParameters.selectedActions),
        hasParameters: !!(parsedParameters && parsedParameters.parameters),
        actualValue: parsedParameters
      });
      throw new Error('Invalid parsed parameters: missing selectedActions or parameters');
    }

    const results = [];
    const API_URL = 'http://localhost:8083/mcp-provider';

    // Get the endpoint for this action type
    const actionConfig = getMCPActionConfig(actionType);
    
    // Filter actions that match the current action type
    const matchingActions = parsedParameters.selectedActions.filter((action: string) => action === actionType);
    
    if (matchingActions.length === 0) {
      console.warn(`⚠️ MCP Request - No ${actionType} actions found`);
      return {
        content: `MCP Supplier Agent bu durumda ${actionType} işlemlerini bulamadı.`,
        status: 'completed',
        customer: customer,
        results: [],
        summary: { total: 0, successful: 0, failed: 0 }
      };
    }

    // Execute actions of the specified type
    for (const currentActionType of matchingActions) {
      console.log(`🎯 MCP Request - Executing action: ${currentActionType}`);
      
      const actionParams = parsedParameters.parameters[currentActionType];
      if (!actionParams) {
        console.warn(`⚠️ MCP Request - No parameters found for action: ${currentActionType}`);
        continue;
      }

      console.log(`📤 MCP Request - Action payload for ${currentActionType}:`, actionParams);

      try {
        // Fix endpoint to include /api prefix and use axios instead of fetch for better CORS handling
        const fullEndpoint = `${API_URL}/api${actionConfig.endpoint}`;
        console.log(`🏦 MCP Request - Calling ${currentActionType} API at ${fullEndpoint}`);
        
        const response = await axios.post(fullEndpoint, actionParams, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 30000
        });
        
        const actionData = response.data;
        console.log(`✅ MCP Request - ${currentActionType} response:`, actionData);
        
        results.push({
          actionType: currentActionType,
          status: 'success',
          data: actionData
        });

      } catch (actionError) {
        console.error(`❌ MCP Request - Error executing ${currentActionType}:`, actionError);
        results.push({
          actionType: currentActionType,
          status: 'error',
          error: actionError instanceof Error ? actionError.message : 'Unknown error'
        });
      }
    }

    console.log('🎉 MCP Request - All actions completed:', results);

    // Format the response content based on results
    let responseContent = '';
    const successfulResults = results.filter(r => r.status === 'success');
    
    if (successfulResults.length > 0) {
      const actionResult = successfulResults[0];
      const actionConfig = getMCPActionConfig(actionType);
      
      responseContent = `✅ ${actionConfig.label} başarıyla tamamlandı!\n\n`;
      
      // Generic response formatting for different action types
      if (actionResult.data) {
        if (actionResult.data.transactions) {
          // Handle transaction-based responses (like GENERATE_STATEMENT)
          const transactions = actionResult.data.transactions;
          const customer = actionResult.data.customer;
          
          responseContent += `👤 Müşteri: ${customer.fullName} (${customer.email})\n`;
          responseContent += `📊 Toplam ${transactions.length} işlem bulundu\n\n`;
          
          if (transactions.length > 0) {
            responseContent += `💰 İşlem Özeti:\n`;
            transactions.slice(0, 5).forEach((tx: any, index: number) => {
              const date = new Date(tx.transactionDate[0], tx.transactionDate[1] - 1, tx.transactionDate[2]);
              responseContent += `${index + 1}. ${tx.description} - ${tx.amount} ${tx.currency} (${date.toLocaleDateString('tr-TR')})\n`;
            });
            
            if (transactions.length > 5) {
              responseContent += `... ve ${transactions.length - 5} işlem daha\n`;
            }
          }
          
          if (actionResult.data.attachmentIds && actionResult.data.attachmentIds.length > 0) {
            responseContent += `\n📎 Ek dosya ID'leri: ${actionResult.data.attachmentIds.join(', ')}`;
          }
        } else {
          // Generic response for other action types
          responseContent += `📋 İşlem detayları:\n${JSON.stringify(actionResult.data, null, 2)}`;
        }
      } else {
        responseContent = `${actionConfig.label} tamamlandı ancak detaylar alınamadı.`;
      }
    } else {
      const actionConfig = getMCPActionConfig(actionType);
      responseContent = `${actionConfig.label} işlemi sırasında hata oluştu.`;
    }

    return {
      content: responseContent,
      status: 'completed',
      customer: customer,
      results: results,
      summary: {
        total: results.length,
        successful: results.filter(r => r.status === 'success').length,
        failed: results.filter(r => r.status === 'error').length
      }
    };
  } catch (error) {
    console.error('❌ MCP Request - Error:', error);
    throw error;
  }
} 