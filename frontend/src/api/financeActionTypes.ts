import axios from 'axios';
import { FinanceActionType } from '@/store/types';
import { apiEndpoints, config } from '@/config/env';

// Configure axios with timeout
const axiosInstance = axios.create({
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export interface UpdateFinanceActionTypeRequest extends Partial<CreateFinanceActionTypeRequest> {
  id: number;
}

// Finance Action Types API functions
export const financeActionTypesApi = {
  // Get all finance action types
  getAll: async (): Promise<FinanceActionType[]> => {
    const response = await axiosInstance.get(apiEndpoints.mcp.financeActionTypes);
    return response.data;
  },

  // Get active finance action types only
  getActive: async (): Promise<FinanceActionType[]> => {
    const response = await axiosInstance.get(`${apiEndpoints.mcp.financeActionTypes}/active`);
    return response.data;
  },

  // Get finance action type by ID
  getById: async (id: number): Promise<FinanceActionType> => {
    const response = await axiosInstance.get(`${apiEndpoints.mcp.financeActionTypes}/${id}`);
    return response.data;
  },

  // Create new finance action type
  create: async (actionType: CreateFinanceActionTypeRequest): Promise<FinanceActionType> => {
    const response = await axiosInstance.post(apiEndpoints.mcp.financeActionTypes, actionType);
    return response.data;
  },

  // Update finance action type
  update: async (id: number, actionType: UpdateFinanceActionTypeRequest): Promise<FinanceActionType> => {
    const response = await axiosInstance.put(`${apiEndpoints.mcp.financeActionTypes}/${id}`, actionType);
    return response.data;
  },

  // Delete finance action type
  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`${apiEndpoints.mcp.financeActionTypes}/${id}`);
  },

  // Toggle active status
  toggleActive: async (id: number): Promise<FinanceActionType> => {
    const response = await axiosInstance.patch(`${apiEndpoints.mcp.financeActionTypes}/${id}/toggle`);
    return response.data;
  },

  // Bulk update sort orders
  updateSortOrders: async (updates: Array<{ id: number; sortOrder: number }>): Promise<FinanceActionType[]> => {
    const response = await axiosInstance.patch(`${apiEndpoints.mcp.financeActionTypes}/sort-orders`, { updates });
    return response.data;
  },
};

// Legacy functions for backward compatibility (deprecated - use financeActionTypesApi instead)
export async function getFinanceActionTypes(): Promise<FinanceActionType[]> {
  return financeActionTypesApi.getAll();
}

export async function createFinanceActionType(actionType: CreateFinanceActionTypeRequest): Promise<FinanceActionType> {
  return financeActionTypesApi.create(actionType);
}

export async function updateFinanceActionType(id: number, actionType: UpdateFinanceActionTypeRequest): Promise<FinanceActionType> {
  return financeActionTypesApi.update(id, actionType);
}

export async function deleteFinanceActionType(id: number): Promise<void> {
  return financeActionTypesApi.delete(id);
} 