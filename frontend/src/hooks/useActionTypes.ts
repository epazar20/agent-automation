import { useState, useEffect } from 'react';
import { FinanceActionType } from '@/store/types';
import { initializeMCPActionConfigs, dynamicActionConfigs } from '@/store/mcpConstants';
import { financeActionTypesApi } from '@/api/financeActionTypes';

export function useActionTypes() {
  const [actionTypes, setActionTypes] = useState<FinanceActionType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadActionTypes = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Initialize MCP action configs
        await initializeMCPActionConfigs();
        
        // Get action types using the new API
        const types = await financeActionTypesApi.getActive();
        setActionTypes(types);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load action types';
        setError(errorMessage);
        console.error('❌ useActionTypes - Error loading action types:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadActionTypes();
  }, []);

  return {
    actionTypes: actionTypes.length > 0 ? actionTypes : dynamicActionConfigs,
    isLoading,
    error,
    refetch: async () => {
      const types = await financeActionTypesApi.getActive();
      setActionTypes(types);
      return types;
    }
  };
}

export default useActionTypes; 