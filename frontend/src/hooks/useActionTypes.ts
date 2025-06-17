import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect } from 'react';
import { RootState, AppDispatch } from '@/store';
import { 
  fetchFinanceActionTypes, 
  selectActionTypes, 
  selectActionTypesLoading, 
  selectActionTypesError,
  selectActionTypeByCode,
  shouldRefreshActionTypes 
} from '@/store/slices/actionTypesSlice';
import { initializeMCPActionConfigs } from '@/store/mcpConstants';

export function useActionTypes() {
  const dispatch = useDispatch<AppDispatch>();
  const actionTypes = useSelector(selectActionTypes);
  const isLoading = useSelector(selectActionTypesLoading);
  const error = useSelector(selectActionTypesError);
  const needsRefresh = useSelector(shouldRefreshActionTypes);

  // Fetch action types if needed
  const fetchActionTypes = useCallback(async () => {
    try {
      const result = await dispatch(fetchFinanceActionTypes()).unwrap();
      initializeMCPActionConfigs(result);
      return result;
    } catch (error) {
      console.error('Error fetching action types:', error);
      throw error;
    }
  }, [dispatch]);

  // Get specific action type by code
  const getActionTypeByCode = useCallback((code: string) => {
    return actionTypes.find(type => type.typeCode === code);
  }, [actionTypes]);

  // Get active action types only
  const getActiveActionTypes = useCallback(() => {
    return actionTypes.filter(type => type.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
  }, [actionTypes]);

  // Auto-fetch on mount if needed
  useEffect(() => {
    if (actionTypes.length === 0 || needsRefresh) {
      fetchActionTypes();
    } else if (actionTypes.length > 0) {
      // Initialize MCP configs if data already exists
      initializeMCPActionConfigs(actionTypes);
    }
  }, [actionTypes.length, needsRefresh, fetchActionTypes]);

  return {
    actionTypes,
    activeActionTypes: getActiveActionTypes(),
    isLoading,
    error,
    needsRefresh,
    fetchActionTypes,
    getActionTypeByCode,
    getActiveActionTypes,
  };
}

export default useActionTypes; 