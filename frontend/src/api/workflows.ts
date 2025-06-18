import axios from 'axios';
import { apiEndpoints, config } from '@/config/env';

// Configure axios with timeout
const axiosInstance = axios.create({
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface WorkflowDto {
  id: number;
  name: string;
  description?: string;
  nodesData: string;
  edgesData: string;
  version: number;
  isActive: boolean;
  tags?: string;
  category?: string;
  createdBy?: string;
  lastModifiedBy?: string;
  executionCount: number;
  lastExecutedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowSummaryDto {
  id: number;
  name: string;
  description?: string;
  version: number;
  isActive: boolean;
  tags?: string;
  category?: string;
  executionCount: number;
  lastExecutedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowCreateDto {
  name: string;
  description?: string;
  nodesData: string;
  edgesData: string;
  tags?: string;
  category?: string;
}

export interface WorkflowSearchResponse {
  workflows: WorkflowSummaryDto[];
}

// Workflow API functions
export const workflowApi = {
  // Get all workflows
  getAll: async (): Promise<WorkflowSummaryDto[]> => {
    const response = await axiosInstance.get(apiEndpoints.mcp.workflows);
    return response.data;
  },

  // Get active workflows only
  getActive: async (): Promise<WorkflowSummaryDto[]> => {
    const response = await axiosInstance.get(`${apiEndpoints.mcp.workflows}/active`);
    return response.data;
  },

  // Search workflows
  search: async (query: string): Promise<WorkflowSummaryDto[]> => {
    const response = await axiosInstance.get(`${apiEndpoints.mcp.workflows}/search`, {
      params: { q: query }
    });
    return response.data;
  },

  // Get workflow by ID
  getById: async (id: number): Promise<WorkflowDto> => {
    const response = await axiosInstance.get(`${apiEndpoints.mcp.workflows}/${id}`);
    return response.data;
  },

  // Create new workflow
  create: async (workflow: WorkflowCreateDto): Promise<WorkflowDto> => {
    const response = await axiosInstance.post(apiEndpoints.mcp.workflows, workflow);
    return response.data;
  },

  // Update workflow
  update: async (id: number, workflow: Partial<WorkflowCreateDto>): Promise<WorkflowDto> => {
    console.log('🔄 Workflow Update - Request:', {
      id,
      workflow,
      endpoint: `${apiEndpoints.mcp.workflows}/${id}`
    });
    
    try {
      const response = await axiosInstance.put(`${apiEndpoints.mcp.workflows}/${id}`, workflow);
      console.log('✅ Workflow Update - Success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Workflow Update - Error:', {
        error: (error as any).response?.data || (error as any).message,
        status: (error as any).response?.status,
        statusText: (error as any).response?.statusText,
        requestData: workflow,
      });
      throw error;
    }
  },

  // Delete workflow
  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`${apiEndpoints.mcp.workflows}/${id}`);
  },

  // Toggle active status
  toggleActive: async (id: number): Promise<WorkflowDto> => {
    const response = await axiosInstance.patch(`${apiEndpoints.mcp.workflows}/${id}/toggle-active`);
    return response.data;
  },

  // Increment execution count
  incrementExecution: async (id: number): Promise<WorkflowDto> => {
    const response = await axiosInstance.patch(`${apiEndpoints.mcp.workflows}/${id}/increment-execution`);
    return response.data;
  },
};

// Get recent workflows
export async function getRecentWorkflows(): Promise<WorkflowSummaryDto[]> {
  try {
    const response = await axios.get(`${apiEndpoints.mcp.workflows}/recent`);
    return response.data;
  } catch (error) {
    console.error('Get recent workflows error:', error);
    throw error;
  }
}

// Get popular workflows
export async function getPopularWorkflows(): Promise<WorkflowSummaryDto[]> {
  try {
    const response = await axios.get(`${apiEndpoints.mcp.workflows}/popular`);
    return response.data;
  } catch (error) {
    console.error('Get popular workflows error:', error);
    throw error;
  }
}

// Get workflow by name
export async function getWorkflowByName(name: string): Promise<WorkflowDto> {
  try {
    const response = await axios.get(`${apiEndpoints.mcp.workflows}/name/${encodeURIComponent(name)}`);
    return response.data;
  } catch (error) {
    console.error('Get workflow by name error:', error);
    throw error;
  }
}

// Get workflows by category
export async function getWorkflowsByCategory(category: string): Promise<WorkflowSummaryDto[]> {
  try {
    const response = await axios.get(`${apiEndpoints.mcp.workflows}/category/${encodeURIComponent(category)}`);
    return response.data;
  } catch (error) {
    console.error('Get workflows by category error:', error);
    throw error;
  }
}

// Check if workflow name exists
export async function checkWorkflowNameExists(name: string): Promise<boolean> {
  try {
    const response = await axios.get(`${apiEndpoints.mcp.workflows}/check/name/${encodeURIComponent(name)}`);
    return response.data;
  } catch (error) {
    console.error('Check workflow name exists error:', error);
    throw error;
  }
} 