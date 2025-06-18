import axios from 'axios';
import { FinanceActionType } from '@/store/types';

const API_BASE_URL = 'http://localhost:8083/mcp-provider';

export interface CreateFinanceActionTypeRequest {
  typeCode: string;
  typeName: string;
  description: string;
  samplePrompt: string;
  endpointPath: string;
  jsonSchema: string;
  isActive: boolean;
  sortOrder: number;
}

export interface UpdateFinanceActionTypeRequest extends CreateFinanceActionTypeRequest {
  id: number;
}

export async function getFinanceActionTypes(): Promise<FinanceActionType[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/finance-action-types`);
    return response.data;
  } catch (error) {
    console.error('Finance action types fetch error:', error);
    throw error;
  }
}

export async function createFinanceActionType(data: CreateFinanceActionTypeRequest): Promise<FinanceActionType> {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/finance-action-types`, data);
    return response.data;
  } catch (error) {
    console.error('Finance action type creation error:', error);
    throw error;
  }
}

export async function updateFinanceActionType(id: number, data: CreateFinanceActionTypeRequest): Promise<FinanceActionType> {
  try {
    const response = await axios.put(`${API_BASE_URL}/api/finance-action-types/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Finance action type update error:', error);
    throw error;
  }
}

export async function deleteFinanceActionType(id: number): Promise<void> {
  try {
    await axios.delete(`${API_BASE_URL}/api/finance-action-types/${id}`);
  } catch (error) {
    console.error('Finance action type deletion error:', error);
    throw error;
  }
}

export async function toggleFinanceActionTypeActive(id: number): Promise<FinanceActionType> {
  try {
    const response = await axios.patch(`${API_BASE_URL}/api/finance-action-types/${id}/toggle-active`);
    return response.data;
  } catch (error) {
    console.error('Finance action type toggle error:', error);
    throw error;
  }
} 