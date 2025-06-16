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

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Action analysis error:', error);
    throw error;
  }
} 