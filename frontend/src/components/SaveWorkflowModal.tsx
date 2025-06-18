"use client";

import React, { useState, useCallback } from 'react';
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
import { Loader2, Save, Workflow } from "lucide-react";
import { toast } from "sonner";
import { RootState } from '@/store/types';
import { workflowApi } from '@/api/workflows';

interface SaveWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SaveWorkflowModal: React.FC<SaveWorkflowModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState('general');
  const [isLoading, setIsLoading] = useState(false);

  const { nodes, edges } = useSelector((state: RootState) => state.flow);

  const resetForm = useCallback(() => {
    setName('');
    setDescription('');
    setTags('');
    setCategory('general');
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

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
      const workflowData = {
        name: name.trim(),
        description: description.trim() || undefined,
        nodesData: JSON.stringify(nodes),
        edgesData: JSON.stringify(edges),
        tags: tags.trim() || undefined,
        category: category.trim() || 'general'
      };

      await workflowApi.create(workflowData);
      
      toast.success(`Workflow "${name}" başarıyla kaydedildi`);
      handleClose();
    } catch (error) {
      console.error('Workflow kaydetme hatası:', error);
      toast.error('Workflow kaydedilirken hata oluştu');
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
            Workflow Kaydet
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="workflow-name">
              Workflow Adı <span className="text-destructive">*</span>
            </Label>
            <Input
              id="workflow-name"
              placeholder="Workflow adını girin..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
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
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Kaydet
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveWorkflowModal; 