import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { FinanceActionType, ActionTypesState } from '../types';
import { 
  getFinanceActionTypes, 
  createFinanceActionType, 
  updateFinanceActionType, 
  deleteFinanceActionType,
  CreateFinanceActionTypeRequest 
} from '../../api/financeActionTypes';

// Async thunk to fetch finance action types
export const fetchFinanceActionTypes = createAsyncThunk(
  'actionTypes/fetchFinanceActionTypes',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getFinanceActionTypes();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// Async thunk to create finance action type
export const createFinanceActionTypeThunk = createAsyncThunk(
  'actionTypes/createFinanceActionType',
  async (data: CreateFinanceActionTypeRequest, { rejectWithValue }) => {
    try {
      const result = await createFinanceActionType(data);
      return result;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// Async thunk to update finance action type
export const updateFinanceActionTypeThunk = createAsyncThunk(
  'actionTypes/updateFinanceActionType',
  async ({ id, data }: { id: number; data: CreateFinanceActionTypeRequest }, { rejectWithValue }) => {
    try {
      const result = await updateFinanceActionType(id, data);
      return result;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// Async thunk to delete finance action type
export const deleteFinanceActionTypeThunk = createAsyncThunk(
  'actionTypes/deleteFinanceActionType',
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteFinanceActionType(id);
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

const initialState: ActionTypesState = {
  actionTypes: [],
  isLoading: false,
  error: null,
  lastFetched: null,
};

const actionTypesSlice = createSlice({
  name: 'actionTypes',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearActionTypes: (state) => {
      state.actionTypes = [];
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch action types
      .addCase(fetchFinanceActionTypes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFinanceActionTypes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.actionTypes = action.payload;
        state.lastFetched = Date.now();
        state.error = null;
      })
      .addCase(fetchFinanceActionTypes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create action type
      .addCase(createFinanceActionTypeThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createFinanceActionTypeThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.actionTypes.push(action.payload);
        state.error = null;
      })
      .addCase(createFinanceActionTypeThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update action type
      .addCase(updateFinanceActionTypeThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateFinanceActionTypeThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.actionTypes.findIndex(type => type.id === action.payload.id);
        if (index !== -1) {
          state.actionTypes[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateFinanceActionTypeThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete action type
      .addCase(deleteFinanceActionTypeThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteFinanceActionTypeThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.actionTypes = state.actionTypes.filter(type => type.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteFinanceActionTypeThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearActionTypes } = actionTypesSlice.actions;

// Selectors
export const selectActionTypes = (state: { actionTypes: ActionTypesState }) => state.actionTypes.actionTypes;
export const selectActionTypesLoading = (state: { actionTypes: ActionTypesState }) => state.actionTypes.isLoading;
export const selectActionTypesError = (state: { actionTypes: ActionTypesState }) => state.actionTypes.error;
export const selectActionTypeByCode = (code: string) => (state: { actionTypes: ActionTypesState }) => 
  state.actionTypes.actionTypes.find(type => type.typeCode === code);

// Helper function to check if data needs refresh (older than 5 minutes)
export const shouldRefreshActionTypes = (state: { actionTypes: ActionTypesState }) => {
  const { lastFetched } = state.actionTypes;
  if (!lastFetched) return true;
  return Date.now() - lastFetched > 5 * 60 * 1000; // 5 minutes
};

export default actionTypesSlice.reducer; 