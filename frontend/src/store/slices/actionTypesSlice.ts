import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { FinanceActionType, ActionTypesState } from '../types';

const API_URL = 'http://localhost:8083/mcp-provider';

// Async thunk to fetch finance action types
export const fetchFinanceActionTypes = createAsyncThunk(
  'actionTypes/fetchFinanceActionTypes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/finance-action-types`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: FinanceActionType[] = await response.json();
      return data;
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