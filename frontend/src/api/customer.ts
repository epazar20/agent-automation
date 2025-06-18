import { Customer, ActionAnalysisResponse } from '@/store/types';
import { apiEndpoints, config } from '@/config/env';

// Configure fetch with timeout
const fetchWithTimeout = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.api.timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

export async function searchCustomers(searchText: string): Promise<Customer[]> {
  try {
    const response = await fetchWithTimeout(`${apiEndpoints.mcp.customers}/search`, {
      method: 'POST',
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

export async function executeActionAnalysis(request: {
  content: string;
  model?: string;
  customerNo?: string;
  selectedCustomer?: Customer;
}): Promise<ActionAnalysisResponse> {
  try {
    const response = await fetchWithTimeout(apiEndpoints.mcp.actionAnalysis, {
      method: 'POST',
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Action analysis error:', error);
    throw error;
  }
} 