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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Workflow, Calendar, User, Play, FileText, Tag, Clock, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { RootState } from '@/store/types';
import { 
  fetchActiveWorkflows,
  searchWorkflowsThunk,
  clearSearchResults,
  fetchWorkflowById,
  incrementWorkflowExecutionCountThunk,
  deleteWorkflowThunk
} from '@/store/slices/workflowSlice';
import { setNodes, setEdges, clearExecutionResults } from '@/store/slices/flowSlice';

interface WorkflowSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

const WorkflowSelector: React.FC<WorkflowSelectorProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [deletingWorkflowId, setDeletingWorkflowId] = useState<number | null>(null);

  const { 
    workflows,
    searchResults,
    isLoading,
    error 
  } = useSelector((state: RootState) => state.workflow);

  // Load active workflows on mount
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchActiveWorkflows() as any);
    }
  }, [dispatch, isOpen]);

  // Handle search
  const handleSearch = useCallback(
    debounce((query: string) => {
      if (query.trim()) {
        setIsSearching(true);
        dispatch(searchWorkflowsThunk({ query }) as any)
          .finally(() => setIsSearching(false));
      } else {
        dispatch(clearSearchResults());
      }
    }, 300),
    [dispatch]
  );

  useEffect(() => {
    handleSearch(searchQuery);
  }, [searchQuery, handleSearch]);

  // Handle workflow selection
  const handleWorkflowSelect = useCallback(async (workflowId: number) => {
    try {
      const result = await dispatch(fetchWorkflowById(workflowId) as any).unwrap();
      
      if (result) {
        // Parse nodes and edges data
        const nodes = JSON.parse(result.nodesData);
        const edges = JSON.parse(result.edgesData);
        
        // Update the flow state
        dispatch(setNodes(nodes));
        dispatch(setEdges(edges));
        dispatch(clearExecutionResults());
        
        // Increment execution count
        dispatch(incrementWorkflowExecutionCountThunk(workflowId) as any);
        
        toast.success(`Workflow "${result.name}" yüklendi`);
        onClose();
      }
    } catch (error) {
      console.error('Workflow yükleme hatası:', error);
      toast.error('Workflow yüklenirken hata oluştu');
    }
  }, [dispatch, onClose]);

  // Handle workflow deletion
  const handleWorkflowDelete = useCallback(async (workflowId: number, workflowName: string) => {
    if (!confirm(`"${workflowName}" workflow'unu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      return;
    }

    try {
      setDeletingWorkflowId(workflowId);
      await dispatch(deleteWorkflowThunk(workflowId) as any).unwrap();
      toast.success(`Workflow "${workflowName}" başarıyla silindi`);
    } catch (error) {
      console.error('Workflow silme hatası:', error);
      toast.error('Workflow silinirken hata oluştu');
    } finally {
      setDeletingWorkflowId(null);
    }
  }, [dispatch]);

  // Get workflows to display (search results or all workflows)
  const workflowsToShow = searchQuery.trim() ? searchResults : workflows;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTags = (tags: string) => {
    if (!tags) return [];
    return tags.split(',').map(tag => tag.trim()).filter(Boolean);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            Workflow Seç
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Workflow ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Workflow'lar yükleniyor...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-destructive mb-2">Hata: {error}</p>
                <Button 
                  onClick={() => dispatch(fetchActiveWorkflows() as any)}
                  variant="outline"
                  size="sm"
                >
                  Tekrar Dene
                </Button>
              </div>
            </div>
          ) : workflowsToShow.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Workflow className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {searchQuery.trim() ? 'Arama sonucu bulunamadı' : 'Henüz workflow bulunmuyor'}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-auto space-y-3 pr-2">
              {workflowsToShow.map((workflow) => (
                <div
                  key={workflow.id}
                  className="border rounded-lg p-4 hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => handleWorkflowSelect(workflow.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{workflow.name}</h3>
                        <Badge variant={workflow.isActive ? "default" : "secondary"}>
                          v{workflow.version}
                        </Badge>
                        {workflow.category && (
                          <Badge variant="outline">{workflow.category}</Badge>
                        )}
                      </div>

                      {workflow.description && (
                        <p className="text-muted-foreground mb-3 line-clamp-2">
                          {workflow.description}
                        </p>
                      )}

                      {/* Tags */}
                      {workflow.tags && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {formatTags(workflow.tags).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Meta info */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(workflow.createdAt)}
                        </div>
                        
                        {workflow.createdBy && (
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {workflow.createdBy}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1">
                          <Play className="h-4 w-4" />
                          {workflow.executionCount} çalıştırma
                        </div>

                        {workflow.lastExecutedAt && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Son: {formatDate(workflow.lastExecutedAt)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWorkflowSelect(workflow.id);
                        }}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Yükle
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWorkflowDelete(workflow.id, workflow.name);
                        }}
                        disabled={deletingWorkflowId === workflow.id}
                        className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 hover:text-red-800"
                      >
                        {deletingWorkflowId === workflow.id ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-1" />
                        )}
                        Sil
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            İptal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default WorkflowSelector; 