"use client";

import { Handle, Position } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDispatch } from 'react-redux';
import { updateNode, removeNode } from '@/store/slices/flowSlice';
import { McpType, AgentConfig } from '@/store/types';
import { toast } from 'sonner';
import { defaultMcpConfigs } from '@/store/defaultConfigs';
import { X } from 'lucide-react';

type MCPAgentNodeProps = {
  id: string;
  data: {
    type: string;
    config: AgentConfig;
  };
};

export default function MCPAgentNode({ id, data }: MCPAgentNodeProps) {
  const dispatch = useDispatch();
  const [config, setConfig] = useState<any>(data.config);
  const [isOpen, setIsOpen] = useState(false);
  
  // MCP tipini belirle (ID'den veya config'den)
  const mcpType = (data.config as any).toolName?.split('_')[1] as McpType;

  useEffect(() => {
    if (data.config) {
      setConfig(data.config);
    }
  }, [data.config]);

  const updateConfig = <T extends any>(updates: Partial<T>) => {
    setConfig((prevConfig: any) => ({
      ...prevConfig,
      ...updates,
    }) as T);
  };

  const getNodeColor = () => {
    switch (mcpType) {
      case 'supabase':
        return 'bg-emerald-100 dark:bg-emerald-900';
      case 'github':
        return 'bg-violet-100 dark:bg-violet-900';
      case 'firecrawl':
        return 'bg-orange-100 dark:bg-orange-900';
      default:
        return 'bg-gray-100 dark:bg-gray-800';
    }
  };

  const getNodeIcon = () => {
    switch (mcpType) {
      case 'supabase':
        return '🔷';
      case 'github':
        return '🐙';
      case 'firecrawl':
        return '🔥';
      default:
        return '?';
    }
  };

  const handleSave = () => {
    dispatch(updateNode({
      id,
      updates: {
        data: {
          type: data.type as any,
          config,
        },
      },
    }));
    setIsOpen(false);
    toast.success('Yapılandırma kaydedildi');
  };

  return (
    <div className="group relative">
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-muted-foreground dark:!bg-muted-foreground group-hover:!bg-primary"
        id="target"
      />
      
      <div className="absolute -top-2 -right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="icon"
          variant="destructive"
          className="h-5 w-5 rounded-full"
          onClick={(e) => {
            e.stopPropagation();
            dispatch(removeNode(id));
            toast.success('Node silindi');
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <Card 
          className="w-48 cursor-pointer hover:ring-2 hover:ring-primary [&.selected]:ring-2 [&.selected]:ring-primary [&.selected]:shadow-md [&.selected]:shadow-primary/25 [&.selected]:scale-105 transition-all duration-200"
          onClick={(e) => {
            if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 2) {
              return;
            }
            // Tıklama ile sadece seçim yapılsın, dialog açılmasın
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
        >
          <CardHeader className="p-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <div className={`w-8 h-8 ${getNodeColor()} rounded flex items-center justify-center`}>
                <span className="text-base">{getNodeIcon()}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{defaultMcpConfigs[mcpType]?.name || 'MCP Agent'}</span>
                <span className="text-xs text-muted-foreground">{defaultMcpConfigs[mcpType]?.description || 'MCP Entegrasyonu'}</span>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>
        
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {`${defaultMcpConfigs[mcpType].name} Yapılandırması`}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Supabase MCP Konfigürasyonu */}
            {mcpType === 'supabase' && (
              <>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    Supabase MCP entegrasyonu aşağıdaki özellikleri destekler:
                  </p>
                  <ul className="mt-2 space-y-1 list-disc list-inside text-sm text-blue-600 dark:text-blue-400">
                    <li>Veritabanı işlemleri</li>
                    <li>Kimlik doğrulama</li>
                    <li>Depolama yönetimi</li>
                    <li>Edge fonksiyonları</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <Label>API URL</Label>
                  <Input
                    value={(config as any).apiUrl || ''}
                    onChange={(e) => updateConfig<any>({ apiUrl: e.target.value })}
                    placeholder="Supabase API URL"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>API Anahtarı</Label>
                  <Input
                    type="password"
                    value={(config as any).apiKey || ''}
                    onChange={(e) => updateConfig<any>({ apiKey: e.target.value })}
                    placeholder="Supabase API Anahtarı"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="useAnon"
                    checked={(config as any).useAnon || false}
                    onChange={(e) => updateConfig<any>({ useAnon: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="useAnon">Anonim Anahtar Kullan</Label>
                </div>
              </>
            )}

            {/* GitHub MCP Konfigürasyonu */}
            {mcpType === 'github' && (
              <>
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-md">
                  <p className="text-sm text-purple-600 dark:text-purple-400">
                    GitHub MCP entegrasyonu aşağıdaki özellikleri destekler:
                  </p>
                  <ul className="mt-2 space-y-1 list-disc list-inside text-sm text-purple-600 dark:text-purple-400">
                    <li>Depo yönetimi</li>
                    <li>Issue ve PR işlemleri</li>
                    <li>Kod arama ve güncelleme</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <Label>GitHub Token</Label>
                  <Input
                    type="password"
                    value={(config as any).token || ''}
                    onChange={(e) => updateConfig<any>({ token: e.target.value })}
                    placeholder="GitHub API Token"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>GitHub Kullanıcı Adı</Label>
                  <Input
                    value={(config as any).username || ''}
                    onChange={(e) => updateConfig<any>({ username: e.target.value })}
                    placeholder="GitHub Kullanıcı Adı"
                  />
                </div>
              </>
            )}

            {/* Firecrawl MCP Konfigürasyonu */}
            {mcpType === 'firecrawl' && (
              <>
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-md">
                  <p className="text-sm text-orange-600 dark:text-orange-400">
                    Firecrawl MCP entegrasyonu aşağıdaki özellikleri destekler:
                  </p>
                  <ul className="mt-2 space-y-1 list-disc list-inside text-sm text-orange-600 dark:text-orange-400">
                    <li>Web scraping ve içerik çıkarma</li>
                    <li>Web içeriği arama</li>
                    <li>Otomatik site tarama</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <Label>API Anahtarı</Label>
                  <Input
                    type="password"
                    value={(config as any).apiKey || ''}
                    onChange={(e) => updateConfig<any>({ apiKey: e.target.value })}
                    placeholder="Firecrawl API Anahtarı"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Çıktı Formatı</Label>
                  <select
                    className="w-full p-2 rounded-md border border-input bg-background"
                    value={(config as any).outputFormat || 'markdown'}
                    onChange={(e) => updateConfig<any>({ outputFormat: e.target.value })}
                  >
                    <option value="markdown">Markdown</option>
                    <option value="html">HTML</option>
                    <option value="json">JSON</option>
                  </select>
                </div>
              </>
            )}

            <Button className="w-full" onClick={handleSave}>Kaydet</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-muted-foreground dark:!bg-muted-foreground group-hover:!bg-primary"
        id="source"
      />
    </div>
  );
} 