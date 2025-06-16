import { Customer, ActionAnalysisResponse } from '@/store/types';

const API_BASE_URL = 'http://localhost:8083/mcp-provider';

export async function searchCustomers(searchText: string): Promise<Customer[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/customers/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ searchText }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const customers = await response.json();
    return customers;
  } catch (error) {
    console.error('Customer search error:', error);
    throw error;
  }
}

export async function executeActionAnalysis(
  content: string,
  model: string,
  maxTokens: number,
  temperature: number,
  customerNo: string
): Promise<ActionAnalysisResponse> {
  try {
    console.log('🔥 executeActionAnalysis - Starting API call:', {
      endpoint: `${API_BASE_URL}/action-analysis`,
      payload: {
        content,
        model,
        maxTokens,
        temperature,
        customerNo,
      }
    });

    const response = await fetch(`${API_BASE_URL}/action-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        model,
        maxTokens,
        temperature,
        customerNo,
      }),
    });

    console.log('📡 executeActionAnalysis - Response status:', response.status);

    if (!response.ok) {
      console.error('❌ executeActionAnalysis - HTTP error:', response.status, response.statusText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ executeActionAnalysis - Success response:', result);
    return result;
  } catch (error) {
    console.error('❌ executeActionAnalysis - Error:', error);
    throw error;
  }
} 