"use client";

import { Handle, Position } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useDispatch, useSelector } from 'react-redux';
import { updateNode, removeNode } from '@/store/slices/flowSlice';
import { AgentType, ResultConfig } from '@/store/types';
import { toast } from 'sonner';
import { defaultAgentConfigs } from '@/store/defaultConfigs';
import { RootState } from '@/store';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Loader2, X, Copy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

type ResultNodeProps = {
  id: string;
  data: {
    type: AgentType;
    config: ResultConfig;
  };
};

export default function ResultNode({ id, data }: ResultNodeProps) {
  const dispatch = useDispatch();
  const [config, setConfig] = useState<ResultConfig>(data.config);
  const [jsonDialogOpen, setJsonDialogOpen] = useState(false);

  const executionResults = useSelector((state: RootState) => state.flow.executionResults);
  const edges = useSelector((state: RootState) => state.flow.edges);

  useEffect(() => {
    if (data.config) {
      setConfig(data.config);
    }
  }, [data.config]);

  // Bağlı olan kaynak node'un sonucunu al
  const sourceEdge = edges.find(edge => edge.target === id);
  const result = sourceEdge ? executionResults[sourceEdge.source] : null;

  // JSON preview and dialog logic
  const jsonString = result && typeof result.output !== 'undefined' ? JSON.stringify(result.output, null, 2) : '';
  const jsonPreview = jsonString.slice(0, 200) + (jsonString.length > 200 ? '...' : '');

  const getStatusColor = () => {
    if (!result) return 'bg-gray-500';
    switch (result.status) {
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'running':
        return 'bg-orange-500 animate-pulse';
      default:
        return 'bg-gray-500';
    }
  };

  // Card click handler: only open dialog if result and completed
  const handleCardClick = () => {
    if (result?.status === 'completed' && jsonString) {
      setJsonDialogOpen(true);
    }
  };

  const handleSave = () => {
    dispatch(updateNode({
      id,
      updates: {
        data: {
          ...data,
          config,
        },
      },
    }));
    toast.success('Yapılandırma kaydedildi');
  };

  return (
    <div className="group relative">
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-muted-foreground dark:!bg-muted-foreground group-hover:!bg-primary"
        id="target"
        isConnectable={true}
      />
      
      <div className="absolute -top-2 -right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="icon"
          variant="destructive"
          className="h-5 w-5 rounded-full"
          onClick={(e) => {
            e.stopPropagation();
            dispatch(removeNode(id));
            toast.success('Sonuç node silindi');
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      
      <Card
        className="w-[300px] p-4 cursor-pointer [&.selected]:ring-2 [&.selected]:ring-primary [&.selected]:shadow-md [&.selected]:shadow-primary/25 [&.selected]:scale-105 transition-all duration-200"
        onClick={handleCardClick}
        title={result?.status === 'completed' && jsonString ? 'Tıkla: Tam JSON' : ''}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
              <h3 className="font-medium">Sonuç</h3>
            </div>
            {result?.status === 'running' && (
              <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
            )}
          </div>

          {/* Show JSON preview if result exists and is completed */}
          {result?.status === 'completed' && jsonString && (
            <div className="max-h-[150px] overflow-hidden rounded-md bg-muted p-3 cursor-pointer hover:bg-muted-foreground/10 transition">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap break-all text-xs">{jsonPreview}</pre>
              </div>
              <div className="text-xs text-right text-muted-foreground">Tıkla: Tam JSON</div>
            </div>
          )}

          {/* Show error if result is error */}
          {result?.status === 'error' && (
            <div className="rounded-md bg-red-100 dark:bg-red-900/20 p-3">
              <p className="text-sm text-red-600 dark:text-red-400">
                {result.error || 'Bir hata oluştu.'}
              </p>
            </div>
          )}

          {/* Show info if no result yet or not completed */}
          {(!result || (!jsonString && result.status !== 'error')) && (
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm text-muted-foreground">
                Henüz sonuç yok...
              </p>
            </div>
          )}
        </div>
      </Card>
      {/* Dialog for full JSON */}
      <Dialog open={jsonDialogOpen} onOpenChange={setJsonDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>JSON Sonuç (Tüm Detay)</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[600px] w-full rounded-md border p-4">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap break-all text-xs">{jsonString}</pre>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
} 