import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { WorkflowDto, WorkflowSummaryDto, WorkflowState, WorkflowCreateDto } from '../types';
import { workflowApi } from '../../api/workflows';

// Async thunks
export const fetchAllWorkflows = createAsyncThunk(
  'workflow/fetchAllWorkflows',
  async (_, { rejectWithValue }) => {
    try {
      const data = await workflowApi.getAll();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchActiveWorkflows = createAsyncThunk(
  'workflow/fetchActiveWorkflows',
  async (_, { rejectWithValue }) => {
    try {
      const data = await workflowApi.getActive();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchWorkflowById = createAsyncThunk(
  'workflow/fetchWorkflowById',
  async (id: number, { rejectWithValue }) => {
    try {
      const data = await workflowApi.getById(id);
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const searchWorkflowsThunk = createAsyncThunk(
  'workflow/searchWorkflows',
  async ({ query }: { query: string }, { rejectWithValue }) => {
    try {
      const data = await workflowApi.search(query);
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const createWorkflowThunk = createAsyncThunk(
  'workflow/createWorkflow',
  async (workflowData: WorkflowCreateDto, { rejectWithValue }) => {
    try {
      const data = await workflowApi.create(workflowData);
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const updateWorkflowThunk = createAsyncThunk(
  'workflow/updateWorkflow',
  async ({ id, workflowData }: { id: number; workflowData: Partial<WorkflowCreateDto> }, { rejectWithValue }) => {
    try {
      const data = await workflowApi.update(id, workflowData);
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const deleteWorkflowThunk = createAsyncThunk(
  'workflow/deleteWorkflow',
  async (id: number, { rejectWithValue }) => {
    try {
      await workflowApi.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const toggleWorkflowActiveStatusThunk = createAsyncThunk(
  'workflow/toggleActiveStatus',
  async (id: number, { rejectWithValue }) => {
    try {
      const data = await workflowApi.toggleActive(id);
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const incrementWorkflowExecutionCountThunk = createAsyncThunk(
  'workflow/incrementExecutionCount',
  async (id: number, { rejectWithValue }) => {
    try {
      const data = await workflowApi.incrementExecution(id);
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// Initial state
const initialState: WorkflowState = {
  workflows: [],
  currentWorkflow: null,
  isLoading: false,
  error: null,
  searchResults: [],
  isSearching: false,
  lastFetched: null,
};

// Workflow slice
const workflowSlice = createSlice({
  name: 'workflow',
  initialState,
  reducers: {
    clearCurrentWorkflow: (state) => {
      state.currentWorkflow = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.isSearching = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    setCurrentWorkflow: (state, action: PayloadAction<WorkflowDto>) => {
      state.currentWorkflow = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch all workflows
    builder
      .addCase(fetchAllWorkflows.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllWorkflows.fulfilled, (state, action) => {
        state.isLoading = false;
        state.workflows = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchAllWorkflows.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch active workflows
    builder
      .addCase(fetchActiveWorkflows.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActiveWorkflows.fulfilled, (state, action) => {
        state.isLoading = false;
        state.workflows = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchActiveWorkflows.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch workflow by ID
    builder
      .addCase(fetchWorkflowById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWorkflowById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentWorkflow = action.payload;
      })
      .addCase(fetchWorkflowById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Search workflows
    builder
      .addCase(searchWorkflowsThunk.pending, (state) => {
        state.isSearching = true;
        state.error = null;
      })
      .addCase(searchWorkflowsThunk.fulfilled, (state, action) => {
        state.isSearching = false;
        state.searchResults = action.payload;
      })
      .addCase(searchWorkflowsThunk.rejected, (state, action) => {
        state.isSearching = false;
        state.error = action.payload as string;
      });

    // Create workflow
    builder
      .addCase(createWorkflowThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createWorkflowThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentWorkflow = action.payload;
        // Add to workflows list (as summary)
        const newWorkflowSummary: WorkflowSummaryDto = {
          id: action.payload.id,
          name: action.payload.name,
          description: action.payload.description,
          version: action.payload.version,
          isActive: action.payload.isActive,
          tags: action.payload.tags,
          category: action.payload.category,
          createdBy: action.payload.createdBy,
          executionCount: action.payload.executionCount,
          lastExecutedAt: action.payload.lastExecutedAt,
          createdAt: action.payload.createdAt,
          updatedAt: action.payload.updatedAt,
        };
        state.workflows.unshift(newWorkflowSummary);
      })
      .addCase(createWorkflowThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update workflow
    builder
      .addCase(updateWorkflowThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateWorkflowThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentWorkflow = action.payload;
        // Update in workflows list
        const index = state.workflows.findIndex(w => w.id === action.payload.id);
        if (index !== -1) {
          const updatedWorkflowSummary: WorkflowSummaryDto = {
            id: action.payload.id,
            name: action.payload.name,
            description: action.payload.description,
            version: action.payload.version,
            isActive: action.payload.isActive,
            tags: action.payload.tags,
            category: action.payload.category,
            createdBy: action.payload.createdBy,
            executionCount: action.payload.executionCount,
            lastExecutedAt: action.payload.lastExecutedAt,
            createdAt: action.payload.createdAt,
            updatedAt: action.payload.updatedAt,
          };
          state.workflows[index] = updatedWorkflowSummary;
        }
      })
      .addCase(updateWorkflowThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete workflow
    builder
      .addCase(deleteWorkflowThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteWorkflowThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.workflows = state.workflows.filter(w => w.id !== action.payload);
        if (state.currentWorkflow?.id === action.payload) {
          state.currentWorkflow = null;
        }
      })
      .addCase(deleteWorkflowThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Toggle active status
    builder
      .addCase(toggleWorkflowActiveStatusThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleWorkflowActiveStatusThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentWorkflow?.id === action.payload.id) {
          state.currentWorkflow = action.payload;
        }
        // Update in workflows list
        const index = state.workflows.findIndex(w => w.id === action.payload.id);
        if (index !== -1) {
          state.workflows[index].isActive = action.payload.isActive;
          state.workflows[index].version = action.payload.version;
        }
      })
      .addCase(toggleWorkflowActiveStatusThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Increment execution count
    builder
      .addCase(incrementWorkflowExecutionCountThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(incrementWorkflowExecutionCountThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentWorkflow?.id === action.payload.id) {
          state.currentWorkflow = action.payload;
        }
        // Update in workflows list
        const index = state.workflows.findIndex(w => w.id === action.payload.id);
        if (index !== -1) {
          state.workflows[index].executionCount = action.payload.executionCount;
          state.workflows[index].lastExecutedAt = action.payload.lastExecutedAt;
        }
      })
      .addCase(incrementWorkflowExecutionCountThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentWorkflow, clearSearchResults, clearError, setCurrentWorkflow } = workflowSlice.actions;

// Selectors
export const selectWorkflows = (state: { workflow: WorkflowState }) => state.workflow.workflows;
export const selectCurrentWorkflow = (state: { workflow: WorkflowState }) => state.workflow.currentWorkflow;
export const selectWorkflowLoading = (state: { workflow: WorkflowState }) => state.workflow.isLoading;
export const selectWorkflowError = (state: { workflow: WorkflowState }) => state.workflow.error;
export const selectWorkflowSearchResults = (state: { workflow: WorkflowState }) => state.workflow.searchResults;
export const selectWorkflowSearching = (state: { workflow: WorkflowState }) => state.workflow.isSearching;

export default workflowSlice.reducer; 