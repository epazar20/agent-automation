import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Customer, CustomerState, ActionAnalysisResponse, NodeResponse, AccumulatedResponses } from '../types';
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
  // New accumulated responses state
  accumulatedResponses: {
    responses: [],
    lastUpdate: new Date().toISOString()
  }
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
    // New actions for accumulated responses
    addNodeResponse: (state, action: PayloadAction<NodeResponse>) => {
      if (!state.accumulatedResponses) {
        state.accumulatedResponses = { responses: [], lastUpdate: new Date().toISOString() };
      }
      
      // Check if response for this node already exists and update or add
      const existingIndex = state.accumulatedResponses.responses.findIndex(
        (r: NodeResponse) => r.nodeId === action.payload.nodeId
      );
      
      if (existingIndex >= 0) {
        // Update existing response
        state.accumulatedResponses.responses[existingIndex] = action.payload;
      } else {
        // Add new response
        state.accumulatedResponses.responses.push(action.payload);
      }
      
      state.accumulatedResponses.lastUpdate = new Date().toISOString();
    },
    clearAccumulatedResponses: (state, action: PayloadAction<string | undefined>) => {
      // Clear responses for a specific flow or all if no flowId provided
      if (action.payload) {
        if (state.accumulatedResponses) {
          state.accumulatedResponses.responses = state.accumulatedResponses.responses.filter(
            (r: NodeResponse) => r.nodeId !== action.payload
          );
        }
      } else {
        state.accumulatedResponses = {
          responses: [],
          lastUpdate: new Date().toISOString()
        };
      }
    },
    setCurrentFlowId: (state, action: PayloadAction<string>) => {
      if (!state.accumulatedResponses) {
        state.accumulatedResponses = { responses: [], lastUpdate: new Date().toISOString() };
      }
      state.accumulatedResponses.currentFlowId = action.payload;
    },
    clearCustomerData: (state) => {
      state.activeCustomer = null;
      state.searchResults = [];
      state.financeActionTypes = [];
      state.lastActionAnalysisResponse = null;
      state.actionResultContent = null;
      state.activeFinanceActionTypes = [];
      state.accumulatedResponses = {
        responses: [],
        lastUpdate: new Date().toISOString()
      };
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
  addNodeResponse,
  clearAccumulatedResponses,
  setCurrentFlowId,
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

// Selectors
export const useSearchResults = () => {
  return useSelector((state: RootState) => state.customer.searchResults);
};

export const useFinanceActionTypes = () => {
  return useSelector((state: RootState) => state.customer.financeActionTypes);
};

// New selectors for accumulated responses
export const useAccumulatedResponses = () => {
  return useSelector((state: RootState) => state.customer.accumulatedResponses);
};

export const useNodeResponsesByType = (nodeType: string) => {
  return useSelector((state: RootState) => 
    state.customer.accumulatedResponses?.responses.filter((r: NodeResponse) => r.nodeType === nodeType) || []
  );
};

export const useNodeResponseByActionType = (actionType: string) => {
  return useSelector((state: RootState) => 
    state.customer.accumulatedResponses?.responses.find((r: NodeResponse) => r.actionType === actionType)
  );
}; 