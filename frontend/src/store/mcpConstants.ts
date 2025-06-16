import { MCPActionType, MCPActionConfig } from './types';

// MCP Action Configurations
export const MCP_ACTION_CONFIGS: Record<MCPActionType, MCPActionConfig> = {
  GENERATE_STATEMENT: {
    type: 'GENERATE_STATEMENT',
    label: 'EKSTRE ÜRETİMİ',
    endpoint: '/transactions/statement'
  }
};

// Helper function to get action config
export function getMCPActionConfig(actionType: MCPActionType): MCPActionConfig {
  return MCP_ACTION_CONFIGS[actionType];
}

// Helper function to get all available actions
export function getAvailableMCPActions(): MCPActionConfig[] {
  return Object.values(MCP_ACTION_CONFIGS);
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
    
    // Return the parsed data as-is for general parsing
    if (jsonData.selectedActions || jsonData.parameters || jsonData.actionType) {
      console.log('🎯 MCP Content Parser - Found direct action object:', jsonData);
      return jsonData;
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

// Execute MCP request
export async function executeMCPRequest(params: {
  customer: any;
  parsedParameters: any;
  modelConfig: any;
  content: string;
}): Promise<any> {
  const { customer, parsedParameters, modelConfig, content } = params;
  
  try {
    console.log('🚀 MCP Request - Executing with params:', {
      customerId: customer.id || customer.customerNo,
      parsedParameters,
      modelConfig
    });

    if (!parsedParameters || !parsedParameters.selectedActions || !parsedParameters.parameters) {
      throw new Error('Invalid parsed parameters: missing selectedActions or parameters');
    }

    const results = [];
    const API_URL = 'http://localhost:8083/mcp-provider';

    // Only process GENERATE_STATEMENT actions for MCP Supplier Agent
    const generateStatementActions = parsedParameters.selectedActions.filter((action: string) => action === 'GENERATE_STATEMENT');
    
    if (generateStatementActions.length === 0) {
      console.warn('⚠️ MCP Request - No GENERATE_STATEMENT actions found');
      return {
        content: 'MCP Supplier Agent sadece GENERATE_STATEMENT işlemlerini destekler.',
        status: 'completed',
        customer: customer,
        results: [],
        summary: { total: 0, successful: 0, failed: 0 }
      };
    }

    // Execute GENERATE_STATEMENT actions
    for (const actionType of generateStatementActions) {
      console.log(`🎯 MCP Request - Executing action: ${actionType}`);
      
      const actionParams = parsedParameters.parameters[actionType];
      if (!actionParams) {
        console.warn(`⚠️ MCP Request - No parameters found for action: ${actionType}`);
        continue;
      }

      console.log(`📤 MCP Request - Action payload for ${actionType}:`, actionParams);

      try {
        console.log('🏦 MCP Request - Calling GENERATE_STATEMENT API');
        
        const response = await fetch(`${API_URL}/api/transactions/statement`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          },
          mode: 'cors',
          body: JSON.stringify(actionParams)
        });
        
        if (!response.ok) {
          throw new Error(`GENERATE_STATEMENT API error: ${response.status} ${response.statusText}`);
        }
        
        const statementData = await response.json();
        console.log('✅ MCP Request - GENERATE_STATEMENT response:', statementData);
        
        results.push({
          actionType: 'GENERATE_STATEMENT',
          status: 'success',
          data: statementData
        });

      } catch (actionError) {
        console.error(`❌ MCP Request - Error executing ${actionType}:`, actionError);
        results.push({
          actionType: actionType,
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
      const statementResult = successfulResults[0];
      if (statementResult.data && statementResult.data.transactions) {
        const transactions = statementResult.data.transactions;
        const customer = statementResult.data.customer;
        
        responseContent = `✅ Ekstre başarıyla oluşturuldu!\n\n`;
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
        
        if (statementResult.data.attachmentIds && statementResult.data.attachmentIds.length > 0) {
          responseContent += `\n📎 Ek dosya ID'leri: ${statementResult.data.attachmentIds.join(', ')}`;
        }
      } else {
        responseContent = 'Ekstre oluşturuldu ancak işlem detayları alınamadı.';
      }
    } else {
      responseContent = 'Ekstre oluşturulurken hata oluştu.';
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