"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { initializeMCPActionConfigs } from '@/store/mcpConstants';
import { 
  fetchFinanceActionTypes,
  createFinanceActionTypeThunk,
  updateFinanceActionTypeThunk,
  deleteFinanceActionTypeThunk,
  selectActionTypes,
  selectActionTypesLoading,
  selectActionTypesError
} from '@/store/slices/actionTypesSlice';
import { FinanceActionType } from '@/store/types';
import { CreateFinanceActionTypeRequest } from '@/api/financeActionTypes';

interface FinanceActionTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FinanceActionTypeModal: React.FC<FinanceActionTypeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const dispatch = useDispatch();
  const actionTypes = useSelector(selectActionTypes);
  const isLoading = useSelector(selectActionTypesLoading);
  const error = useSelector(selectActionTypesError);

  const [selectedActionType, setSelectedActionType] = useState<FinanceActionType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<CreateFinanceActionTypeRequest>({
    typeCode: '',
    typeName: '',
    description: '',
    samplePrompt: '',
    endpointPath: '',
    jsonSchema: '',
    isActive: true,
    sortOrder: 1,
  });

  const resetForm = useCallback(() => {
    setFormData({
      typeCode: '',
      typeName: '',
      description: '',
      samplePrompt: '',
      endpointPath: '',
      jsonSchema: '',
      isActive: true,
      sortOrder: actionTypes.length + 1,
    });
    setSelectedActionType(null);
    setIsEditing(false);
  }, [actionTypes.length]);

  // Load action types on modal open
  useEffect(() => {
    if (isOpen) {
      // Reset form every time modal opens
      resetForm();
      dispatch(fetchFinanceActionTypes() as any);
    }
  }, [isOpen, dispatch, resetForm]);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const handleSelectActionType = (actionTypeId: string) => {
    if (actionTypeId === 'new') {
      resetForm();
      setIsEditing(true);
      return;
    }

    const actionType = actionTypes.find(at => at.id.toString() === actionTypeId);
    if (actionType) {
      setSelectedActionType(actionType);
      setFormData({
        typeCode: actionType.typeCode,
        typeName: actionType.typeName,
        description: actionType.description,
        samplePrompt: actionType.samplePrompt,
        endpointPath: actionType.endpointPath,
        jsonSchema: actionType.jsonSchema,
        isActive: actionType.isActive,
        sortOrder: actionType.sortOrder,
      });
      setIsEditing(false);
    }
  };

  const handleInputChange = (field: keyof CreateFinanceActionTypeRequest, value: string | boolean | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      if (selectedActionType && isEditing) {
        // Update existing
        await dispatch(updateFinanceActionTypeThunk({
          id: selectedActionType.id,
          data: formData
        }) as any);
        toast.success('Action type başarıyla güncellendi');
      } else {
        // Create new
        await dispatch(createFinanceActionTypeThunk(formData) as any);
        toast.success('Action type başarıyla oluşturuldu');
      }
      
      // Reload action types and reinitialize MCP configs
      const updatedActionTypes = await dispatch(fetchFinanceActionTypes() as any).unwrap();
      initializeMCPActionConfigs(updatedActionTypes);
      
      resetForm();
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('İşlem sırasında bir hata oluştu');
    }
  };

  const handleDelete = async () => {
    if (selectedActionType && window.confirm('Bu action type\'ı silmek istediğinizden emin misiniz?')) {
      try {
        await dispatch(deleteFinanceActionTypeThunk(selectedActionType.id) as any);
        toast.success('Action type başarıyla silindi');
        
        // Reload action types and reinitialize MCP configs
        const updatedActionTypes = await dispatch(fetchFinanceActionTypes() as any).unwrap();
        initializeMCPActionConfigs(updatedActionTypes);
        
        resetForm();
        onClose();
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('İşlem sırasında bir hata oluştu');
      }
    }
  };

  const isValidForm = formData.typeCode && formData.typeName && formData.description && formData.endpointPath;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto modern-scrollbar">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Yeni Action Ekle/Düzenle
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Action Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="actionTypeSelect">Mevcut Action Type Seç</Label>
            <Select 
              key={isOpen ? 'modal-open' : 'modal-closed'}
              value={selectedActionType ? selectedActionType.id.toString() : (isEditing ? 'new' : undefined)} 
              onValueChange={handleSelectActionType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Yeni oluştur veya mevcut olanı seç..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">+ Yeni Action Type Oluştur</SelectItem>
                {actionTypes.map((actionType) => (
                  <SelectItem key={actionType.id} value={actionType.id.toString()}>
                    {actionType.typeName} ({actionType.typeCode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="typeCode">Type Code *</Label>
              <Input
                id="typeCode"
                value={formData.typeCode}
                onChange={(e) => handleInputChange('typeCode', e.target.value)}
                placeholder="CREATE_INVOICES"
                disabled={!!(selectedActionType && !isEditing)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="typeName">Type Name *</Label>
              <Input
                id="typeName"
                value={formData.typeName}
                onChange={(e) => handleInputChange('typeName', e.target.value)}
                placeholder="FATURA OLUŞTURMA"
                disabled={!!(selectedActionType && !isEditing)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Açıklama *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Belirli bir müşteri veya işlem için fatura oluştur ve maille ilet."
              rows={3}
              disabled={!!(selectedActionType && !isEditing)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="samplePrompt">Örnek Prompt</Label>
            <Textarea
              id="samplePrompt"
              value={formData.samplePrompt}
              onChange={(e) => handleInputChange('samplePrompt', e.target.value)}
              placeholder="Ahmet için son işlemlere ait fatura hazırla."
              rows={2}
              disabled={!!(selectedActionType && !isEditing)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endpointPath">Endpoint Path *</Label>
            <Input
              id="endpointPath"
              value={formData.endpointPath}
              onChange={(e) => handleInputChange('endpointPath', e.target.value)}
              placeholder="finance-actions/invoice"
              disabled={!!(selectedActionType && !isEditing)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="jsonSchema">JSON Schema</Label>
            <Textarea
              id="jsonSchema"
              value={formData.jsonSchema}
              onChange={(e) => handleInputChange('jsonSchema', e.target.value)}
              placeholder='{"recipientName":"?","invoiceId":"?"}'
              rows={3}
              disabled={!!(selectedActionType && !isEditing)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                disabled={!!(selectedActionType && !isEditing)}
              />
              <Label htmlFor="isActive">Aktif</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortOrder">Sıralama</Label>
              <Input
                id="sortOrder"
                type="number"
                value={formData.sortOrder}
                onChange={(e) => handleInputChange('sortOrder', parseInt(e.target.value) || 1)}
                min={1}
                disabled={!!(selectedActionType && !isEditing)}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-sm mt-2">
            Hata: {error}
          </div>
        )}

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            {selectedActionType && !isEditing && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  disabled={isLoading}
                >
                  Düzenle
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Sil
                </Button>
              </>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              İptal
            </Button>
            <Button
              onClick={handleSave}
              disabled={!isValidForm || isLoading}
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              {selectedActionType && isEditing ? 'Güncelle' : 'Kaydet'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FinanceActionTypeModal; 