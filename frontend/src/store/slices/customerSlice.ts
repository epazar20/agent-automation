import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Customer, CustomerState, ActionAnalysisResponse } from '../types';
import { useSelector } from 'react-redux';
import { RootState } from '../types';

const initialState: CustomerState = {
  activeCustomer: null,
  searchResults: [],
  isSearching: false,
  financeActionTypes: [],
  lastActionAnalysisResponse: null,
  actionResultContent: null,
  activeFinanceActionTypes: [],
};

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    setActiveCustomer: (state, action: PayloadAction<Customer | null>) => {
      state.activeCustomer = action.payload;
    },
    setSearchResults: (state, action: PayloadAction<Customer[]>) => {
      state.searchResults = action.payload;
    },
    setIsSearching: (state, action: PayloadAction<boolean>) => {
      state.isSearching = action.payload;
    },
    setFinanceActionTypes: (state, action: PayloadAction<string[]>) => {
      state.financeActionTypes = action.payload;
    },
    setLastActionAnalysisResponse: (state, action: PayloadAction<ActionAnalysisResponse | null>) => {
      state.lastActionAnalysisResponse = action.payload;
      if (action.payload) {
        state.actionResultContent = action.payload.content;
        state.activeFinanceActionTypes = action.payload.financeActionTypes;
      }
    },
    setActionResultContent: (state, action: PayloadAction<string | null>) => {
      state.actionResultContent = action.payload;
    },
    setActiveFinanceActionTypes: (state, action: PayloadAction<string[]>) => {
      state.activeFinanceActionTypes = action.payload;
    },
    clearCustomerData: (state) => {
      state.activeCustomer = null;
      state.searchResults = [];
      state.financeActionTypes = [];
      state.lastActionAnalysisResponse = null;
      state.actionResultContent = null;
      state.activeFinanceActionTypes = [];
    },
  },
});

export const {
  setActiveCustomer,
  setSearchResults,
  setIsSearching,
  setFinanceActionTypes,
  setLastActionAnalysisResponse,
  setActionResultContent,
  setActiveFinanceActionTypes,
  clearCustomerData,
} = customerSlice.actions;

export default customerSlice.reducer;

// Custom hooks for easy access to customer state
export const useCustomerState = () => {
  return useSelector((state: RootState) => state.customer);
};

export const useActiveCustomer = () => {
  return useSelector((state: RootState) => state.customer.activeCustomer);
};

export const useActionResultContent = () => {
  return useSelector((state: RootState) => state.customer.actionResultContent);
};

export const useActiveFinanceActionTypes = () => {
  return useSelector((state: RootState) => state.customer.activeFinanceActionTypes);
};

export const useLastActionAnalysisResponse = () => {
  return useSelector((state: RootState) => state.customer.lastActionAnalysisResponse);
}; 