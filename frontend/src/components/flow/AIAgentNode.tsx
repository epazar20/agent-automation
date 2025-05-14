"use client";

import { Handle, Position } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useDispatch } from 'react-redux';
import { updateNode, removeNode } from '@/store/slices/flowSlice';
import { AgentType, AgentConfig, YoutubeSummarizerConfig, WebSearcherConfig, ResearchAgentConfig, TextGeneratorConfig, McpType } from '@/store/types';
import { toast } from 'sonner';
import { defaultAgentConfigs, defaultMcpConfigs } from '@/store/defaultConfigs';
import { X } from 'lucide-react';

type AIAgentNodeProps = {
  id: string;
  data: {
    type: AgentType;
    config: AgentConfig;
  };
};

export default function AIAgentNode({ id, data }: AIAgentNodeProps) {
  const dispatch = useDispatch();
  const [config, setConfig] = useState<AgentConfig>(data.config);
  const [isOpen, setIsOpen] = useState(false);
  
  // MCP node olup olmadığını kontrol et
  const isMcpNode = id.startsWith('mcp-');
  const mcpType = isMcpNode && (data.config as any).toolName?.split('_')[1] as McpType;

  useEffect(() => {
    if (data.config) {
      setConfig(data.config);
    }
  }, [data.config]);

  const updateConfig = <T extends AgentConfig>(updates: Partial<T>) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      ...updates,
    }) as T);
  };

  const getNodeColor = () => {
    // MCP node için renk seçimi
    if (isMcpNode && mcpType) {
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
    }
    
    // Normal agent node için standart renk seçimi
    switch (data.type) {
      case 'webScraper':
        return 'bg-purple-100 dark:bg-purple-900';
      case 'webSearcher':
        return 'bg-blue-100 dark:bg-blue-900';
      case 'codeInterpreter':
        return 'bg-green-100 dark:bg-green-900';
      case 'dataAnalyst':
        return 'bg-yellow-100 dark:bg-yellow-900';
      case 'imageGenerator':
        return 'bg-pink-100 dark:bg-pink-900';
      case 'textGenerator':
        return 'bg-orange-100 dark:bg-orange-900';
      case 'translator':
        return 'bg-cyan-100 dark:bg-cyan-900';
      case 'youtubeSummarizer':
        return 'bg-red-100 dark:bg-red-900';
      case 'researchAgent':
        return 'bg-teal-100 dark:bg-teal-900';
      default:
        return 'bg-gray-100 dark:bg-gray-800';
    }
  };

  const getNodeIcon = () => {
    // MCP node için ikon seçimi
    if (isMcpNode && mcpType) {
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
    }
    
    // Normal agent node için standart ikon seçimi
    switch (data.type) {
      case 'webScraper':
        return '🕷️';
      case 'webSearcher':
        return '🔍';
      case 'codeInterpreter':
        return '💻';
      case 'dataAnalyst':
        return '📊';
      case 'imageGenerator':
        return '🎨';
      case 'textGenerator':
        return '📝';
      case 'translator':
        return '🌐';
      case 'youtubeSummarizer':
        return '📺';
      case 'researchAgent':
        return '🔍';
      default:
        return '?';
    }
  };

  const handleSave = () => {
    dispatch(updateNode({
      id,
      updates: {
        data: {
          type: data.type,
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
            // Clicking the node should just select it, not open dialog
            // Dialog will open on double click instead
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
                {isMcpNode && mcpType ? (
                  <>
                    <span className="text-sm font-medium">{defaultMcpConfigs[mcpType]?.name || 'MCP Agent'}</span>
                    <span className="text-xs text-muted-foreground">{defaultMcpConfigs[mcpType]?.description || 'MCP Entegrasyonu'}</span>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-medium">{defaultAgentConfigs[data.type].name}</span>
                    <span className="text-xs text-muted-foreground">{defaultAgentConfigs[data.type].description}</span>
                  </>
                )}
              </div>
            </CardTitle>
          </CardHeader>
        </Card>
        
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {isMcpNode && mcpType 
                ? `${defaultMcpConfigs[mcpType].name} Yapılandırması` 
                : `${defaultAgentConfigs[data.type].name} Yapılandırması`}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* MCP Ajanları için ayrı yapılandırma panelleri */}
            {isMcpNode && mcpType === 'supabase' && (
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

            {isMcpNode && mcpType === 'github' && (
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

            {isMcpNode && mcpType === 'firecrawl' && (
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

            {/* Normal Agent'lar için mevcut yapılandırma panelleri */}
            {!isMcpNode && data.type === 'youtubeSummarizer' && (
              <>
                <div className="space-y-2">
                  <Label>YouTube URL</Label>
                  <Input
                    value={(config as YoutubeSummarizerConfig).youtubeUrl}
                    onChange={(e) => updateConfig<YoutubeSummarizerConfig>({ youtubeUrl: e.target.value })}
                    placeholder="YouTube video URL'sini girin"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Özelleştirilmiş Prompt</Label>
                  <Textarea
                    value={(config as YoutubeSummarizerConfig).customPrompt}
                    onChange={(e) => updateConfig<YoutubeSummarizerConfig>({ customPrompt: e.target.value })}
                    placeholder="Özel prompt girin"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Çıktı Formatı</Label>
                  <select
                    className="w-full p-2 rounded-md border border-input bg-background"
                    value={(config as YoutubeSummarizerConfig).outputFormat}
                    onChange={(e) => updateConfig<YoutubeSummarizerConfig>({ 
                      outputFormat: e.target.value as 'text' | 'bullet' | 'chapters'
                    })}
                  >
                    <option value="text">Düz Metin</option>
                    <option value="bullet">Madde İşaretleri</option>
                    <option value="chapters">Bölümler</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeThumbnail"
                    checked={(config as YoutubeSummarizerConfig).includeThumbnail}
                    onChange={(e) => updateConfig<YoutubeSummarizerConfig>({ includeThumbnail: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="includeThumbnail">Küçük Resim Ekle</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeTimestamps"
                    checked={(config as YoutubeSummarizerConfig).includeTimestamps}
                    onChange={(e) => updateConfig<YoutubeSummarizerConfig>({ includeTimestamps: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="includeTimestamps">Zaman Damgalarını Ekle</Label>
                </div>
              </>
            )}
            
            {data.type === 'webSearcher' && (
              <>
                <div className="space-y-2">
                  <Label>Arama Sorgusu</Label>
                  <Input
                    value={(config as WebSearcherConfig).searchQuery}
                    onChange={(e) => updateConfig<WebSearcherConfig>({ searchQuery: e.target.value })}
                    placeholder="Aramak istediğiniz sorguyu girin"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Sonuç Sayısı</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={(config as WebSearcherConfig).maxResults}
                    onChange={(e) => updateConfig<WebSearcherConfig>({ maxResults: parseInt(e.target.value) || 4 })}
                    placeholder="Kaç sonuç gösterilsin?"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Dil</Label>
                  <select
                    className="w-full p-2 rounded-md border border-input bg-background"
                    value={(config as WebSearcherConfig).filters.language}
                    onChange={(e) => updateConfig<WebSearcherConfig>({
                      filters: {
                        ...(config as WebSearcherConfig).filters,
                        language: e.target.value,
                      },
                    })}
                  >
                    <option value="en">English</option>
                    <option value="tr">Türkçe</option>
                    <option value="de">Deutsch</option>
                    <option value="fr">Français</option>
                    <option value="es">Español</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="safeSearch"
                    checked={(config as WebSearcherConfig).filters.safeSearch}
                    onChange={(e) => updateConfig<WebSearcherConfig>({
                      filters: {
                        ...(config as WebSearcherConfig).filters,
                        safeSearch: e.target.checked,
                      },
                    })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="safeSearch">Güvenli Arama</Label>
                </div>
              </>
            )}

            {data.type === 'researchAgent' && (
              <>
                <div className="space-y-2">
                  <Label>Araştırma Konusu</Label>
                  <Input
                    value={(config as ResearchAgentConfig).topic}
                    onChange={(e) => updateConfig<ResearchAgentConfig>({ topic: e.target.value })}
                    placeholder="Araştırılacak konuyu girin"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Kaynak Sayısı</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={(config as ResearchAgentConfig).numLinks}
                    onChange={(e) => updateConfig<ResearchAgentConfig>({ numLinks: parseInt(e.target.value) || 5 })}
                    placeholder="Kullanılacak kaynak sayısı"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Derinlik Seviyesi</Label>
                  <select
                    className="w-full p-2 rounded-md border border-input bg-background"
                    value={(config as ResearchAgentConfig).depth}
                    onChange={(e) => updateConfig<ResearchAgentConfig>({ 
                      depth: e.target.value as 'basic' | 'detailed' | 'comprehensive' 
                    })}
                  >
                    <option value="basic">Temel</option>
                    <option value="detailed">Detaylı</option>
                    <option value="comprehensive">Kapsamlı</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Dil</Label>
                  <select
                    className="w-full p-2 rounded-md border border-input bg-background"
                    value={(config as ResearchAgentConfig).language}
                    onChange={(e) => updateConfig<ResearchAgentConfig>({ language: e.target.value })}
                  >
                    <option value="tr">Türkçe</option>
                    <option value="en">English</option>
                    <option value="de">Deutsch</option>
                    <option value="fr">Français</option>
                    <option value="es">Español</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Çıktı Formatı</Label>
                  <select
                    className="w-full p-2 rounded-md border border-input bg-background"
                    value={(config as ResearchAgentConfig).format}
                    onChange={(e) => updateConfig<ResearchAgentConfig>({ 
                      format: e.target.value as 'text' | 'markdown' | 'bullet' 
                    })}
                  >
                    <option value="text">Düz Metin</option>
                    <option value="markdown">Markdown</option>
                    <option value="bullet">Madde İşaretleri</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeSourceLinks"
                    checked={(config as ResearchAgentConfig).includeSourceLinks}
                    onChange={(e) => updateConfig<ResearchAgentConfig>({ includeSourceLinks: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="includeSourceLinks">Kaynak Linklerini Ekle</Label>
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