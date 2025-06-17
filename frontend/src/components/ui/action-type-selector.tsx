"use client";

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
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
import { AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface ActionTypeSelectorProps {
  selectedActionType: string;
  onActionTypeSelect: (actionType: string) => void;
  label?: string;
  readonly?: boolean;
}

export default function ActionTypeSelector({
  selectedActionType,
  onActionTypeSelect,
  label = "Action Tipi",
  readonly = false
}: ActionTypeSelectorProps) {
  const dispatch = useDispatch<AppDispatch>();
  const actionTypes = useSelector(selectActionTypes);
  const isLoading = useSelector(selectActionTypesLoading);
  const error = useSelector(selectActionTypesError);
  const needsRefresh = useSelector(shouldRefreshActionTypes);
  const selectedAction = useSelector(selectActionTypeByCode(selectedActionType));

  // Load action types on component mount or when refresh is needed
  useEffect(() => {
    if (actionTypes.length === 0 || needsRefresh) {
      console.log('🔄 ActionTypeSelector - Fetching action types');
      dispatch(fetchFinanceActionTypes())
        .unwrap()
        .then((types) => {
          console.log('✅ ActionTypeSelector - Action types loaded:', types.length);
          initializeMCPActionConfigs(types);
          
          // Auto-select first action type if none selected
          if (!selectedActionType && types.length > 0) {
            const firstActiveType = types.find(type => type.isActive);
            if (firstActiveType) {
              console.log('🎯 ActionTypeSelector - Auto-selecting first action type:', firstActiveType.typeCode);
              onActionTypeSelect(firstActiveType.typeCode);
            }
          }
        })
        .catch((error) => {
          console.error('❌ ActionTypeSelector - Error loading action types:', error);
          toast.error('Action tipleri yüklenirken hata oluştu');
        });
    } else if (actionTypes.length > 0) {
      // Initialize MCP configs if data already exists
      initializeMCPActionConfigs(actionTypes);
    }
  }, [dispatch, actionTypes.length, needsRefresh, selectedActionType, onActionTypeSelect]);

  const handleActionTypeChange = (typeCode: string) => {
    if (!readonly) {
      console.log('🔄 ActionTypeSelector - Action type changed:', typeCode);
      onActionTypeSelect(typeCode);
    }
  };

  const handleRefresh = () => {
    console.log('🔄 ActionTypeSelector - Manual refresh triggered');
    dispatch(fetchFinanceActionTypes())
      .unwrap()
      .then((types) => {
        initializeMCPActionConfigs(types);
        toast.success('Action tipleri güncellendi');
      })
      .catch(() => {
        toast.error('Güncelleme sırasında hata oluştu');
      });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        {!readonly && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>Yükleme hatası: {error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="p-3 rounded-md border border-input bg-muted animate-pulse">
          <div className="text-sm text-muted-foreground">Action tipleri yükleniyor...</div>
        </div>
      ) : readonly && selectedAction ? (
        <div className="p-3 rounded-md border border-input bg-muted">
          <div className="text-sm font-medium">{selectedAction.typeName}</div>
          <div className="text-xs text-muted-foreground mt-1">{selectedAction.typeCode}</div>
          {selectedAction.description && (
            <div className="text-xs text-muted-foreground mt-1">{selectedAction.description}</div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <select
            className="w-full p-2 rounded-md border border-input bg-background"
            value={selectedActionType}
            onChange={(e) => handleActionTypeChange(e.target.value)}
            disabled={readonly}
          >
            <option value="">Action tipi seçin...</option>
            {actionTypes
              .filter(type => type.isActive)
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map(type => (
                <option key={type.id} value={type.typeCode}>
                  {type.typeName}
                </option>
              ))}
          </select>

          {selectedAction && (
            <div className="p-2 rounded-md bg-muted text-xs text-muted-foreground">
              <div className="font-medium">{selectedAction.description}</div>
              <div className="mt-1">Endpoint: {selectedAction.endpointPath}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 