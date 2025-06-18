"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Workflow, Search, Plus, Edit } from "lucide-react";
import { toast } from "sonner";
import { RootState } from '@/store/types';
import { workflowApi } from '@/api/workflows';

interface SaveWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WorkflowSearchResult {
  id: number;
  name: string;
  description?: string;
  category?: string;
  tags?: string;
}

const SaveWorkflowModal: React.FC<SaveWorkflowModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<WorkflowSearchResult[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowSearchResult | null>(null);
  const [isUpdateMode, setIsUpdateMode] = useState(false);

  const { nodes, edges } = useSelector((state: RootState) => state.flow);

  const resetForm = useCallback(() => {
    setName('');
    setDescription('');
    setTags('');
    setCategory('general');
    setSearchResults([]);
    setSelectedWorkflow(null);
    setIsUpdateMode(false);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  // Search workflows when name changes
  useEffect(() => {
    const searchWorkflows = async () => {
      if (name.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await workflowApi.search(name.trim());
        setSearchResults(results.map(workflow => ({
          id: workflow.id,
          name: workflow.name,
          description: workflow.description,
          category: workflow.category,
          tags: workflow.tags
        })));
      } catch (error) {
        console.error('Workflow search error:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchWorkflows, 300);
    return () => clearTimeout(timeoutId);
  }, [name]);

  // Handle workflow selection from search results
  const handleWorkflowSelect = useCallback((workflow: WorkflowSearchResult) => {
    setSelectedWorkflow(workflow);
    setName(workflow.name);
    setDescription(workflow.description || '');
    setCategory(workflow.category || 'general');
    setTags(workflow.tags || '');
    setIsUpdateMode(true);
    setSearchResults([]);
  }, []);

  // Handle creating new workflow (clear selection)
  const handleCreateNew = useCallback(() => {
    setSelectedWorkflow(null);
    setIsUpdateMode(false);
    setSearchResults([]);
    // Keep the current name but clear other fields
    setDescription('');
    setCategory('general');
    setTags('');
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Workflow adı gereklidir');
      return;
    }

    if (nodes.length === 0) {
      toast.error('En az bir node eklemeden workflow kaydedemezsiniz');
      return;
    }

    setIsLoading(true);

    try {
      if (isUpdateMode && selectedWorkflow) {
        console.log('🔄 SaveWorkflowModal - Starting update process for ID:', selectedWorkflow.id);
        
        // Validate required fields for update
        if (!selectedWorkflow.id || typeof selectedWorkflow.id !== 'number') {
          throw new Error('Geçersiz workflow ID');
        }

        // First, get the complete workflow data to preserve version and other fields
        console.log('📥 SaveWorkflowModal - Fetching current workflow data...');
        const currentWorkflow = await workflowApi.getById(selectedWorkflow.id);
        
        // Create update data with preserved fields
        const updateData = {
          name: name.trim(),
          description: description.trim() || undefined,
          nodesData: JSON.stringify(nodes),
          edgesData: JSON.stringify(edges),
          tags: tags.trim() || undefined,
          category: category.trim() || 'general',
          version: currentWorkflow.version, // Preserve existing version
          isActive: currentWorkflow.isActive // Preserve existing active status
        };

        console.log('🔄 SaveWorkflowModal - Update data prepared:', updateData);

        // Update existing workflow
        const result = await workflowApi.update(selectedWorkflow.id, updateData);
        console.log('✅ SaveWorkflowModal - Update successful:', result);
        toast.success(`Workflow "${name}" başarıyla güncellendi`);
      } else {
        console.log('➕ SaveWorkflowModal - Starting create process');
        
        // Create new workflow
        const workflowData = {
          name: name.trim(),
          description: description.trim() || undefined,
          nodesData: JSON.stringify(nodes),
          edgesData: JSON.stringify(edges),
          tags: tags.trim() || undefined,
          category: category.trim() || 'general',
        };

        const result = await workflowApi.create(workflowData);
        console.log('✅ SaveWorkflowModal - Create successful:', result);
        toast.success(`Workflow "${name}" başarıyla kaydedildi`);
      }
      
      handleClose();
    } catch (error: any) {
      console.error('❌ SaveWorkflowModal - Fatal error:', {
        error,
        errorMessage: error?.message,
        errorResponse: error?.response?.data,
        errorStatus: error?.response?.status,
        isUpdateMode,
        selectedWorkflow
      });
      
      // More specific error messages
      if (error?.response?.status === 400) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          toast.error(`API Hatası: ${errorData}`);
        } else if (errorData?.message) {
          toast.error(`API Hatası: ${errorData.message}`);
        } else {
          toast.error('Geçersiz veri formatı. Lütfen tüm alanları kontrol edin.');
        }
      } else {
        toast.error(isUpdateMode ? 'Workflow güncellenirken hata oluştu' : 'Workflow kaydedilirken hata oluştu');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            {isUpdateMode ? 'Workflow Güncelle' : 'Workflow Kaydet'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name with search */}
          <div className="space-y-2">
            <Label htmlFor="workflow-name">
              Workflow Adı <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="workflow-name"
                placeholder="Workflow adını girin veya arayın..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                className="pr-10"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <Search className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="border rounded-md bg-popover p-2 space-y-1 max-h-32 overflow-y-auto">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground">Mevcut workflow&apos;lar:</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCreateNew}
                    className="h-6 px-2 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Yeni Oluştur
                  </Button>
                </div>
                {searchResults.map((workflow) => (
                  <div
                    key={workflow.id}
                    className="p-2 hover:bg-accent rounded cursor-pointer text-sm"
                    onClick={() => handleWorkflowSelect(workflow)}
                  >
                    <div className="font-medium">{workflow.name}</div>
                    {workflow.description && (
                      <div className="text-xs text-muted-foreground truncate">
                        {workflow.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Update Mode Indicator */}
            {isUpdateMode && selectedWorkflow && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-2 flex items-center gap-2">
                <Edit className="h-4 w-4 text-blue-600" />
                <span className="text-blue-700 text-sm">
                  Güncelleme modu: Mevcut workflow üzerine yazılacak
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="workflow-description">Açıklama</Label>
            <Textarea
              id="workflow-description"
              placeholder="Workflow açıklaması..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="workflow-category">Kategori</Label>
            <Input
              id="workflow-category"
              placeholder="general, business, automation..."
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="workflow-tags">Etiketler</Label>
            <Input
              id="workflow-tags"
              placeholder="etiket1, etiket2, etiket3..."
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Etiketleri virgül ile ayırın
            </p>
          </div>

          {/* Info */}
          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm text-muted-foreground">
              Bu workflow {nodes.length} node ve {edges.length} bağlantı içeriyor.
              {isUpdateMode && (
                <span className="block mt-1 text-orange-600">
                  ⚠️ Güncelleme yapılırsa mevcut workflow yapısı tamamen değiştirilecek.
                </span>
              )}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            İptal
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isUpdateMode ? 'Güncelleniyor...' : 'Kaydediliyor...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isUpdateMode ? 'Güncelle' : 'Kaydet'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveWorkflowModal; 