"use client";

import React, { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDispatch, useSelector } from 'react-redux';
import { updateNode, removeNode } from '@/store/slices/flowSlice';
import { LoadingOverlay } from '@/components/ui/loading';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import { Components } from 'react-markdown';
import {
  Settings,
  FileText,
  BarChart,
  X
} from 'lucide-react';
import {
  AgentType,
  AgentConfig,
  YoutubeSummarizerConfig,
  WebSearcherConfig,
  ResearchAgentConfig,
  WebScraperConfig,
  CodeInterpreterConfig,
  DataAnalystConfig,
  ImageGeneratorConfig,
  TextGeneratorConfig,
  TranslatorConfig,
  ModelConfig,
  BaseAgentConfig,
  NodeType,
  AIActionAnalysisConfig,
  Customer
} from '@/store/types';
import { toast } from 'sonner';
import { defaultAgentConfigs, createDefaultAgentConfig } from '@/store/defaultConfigs';
import ModelConfigForm from './ModelConfigForm';
import { RootState } from '@/store';
import CustomerSearch from '@/components/ui/customer-search';
import { setActiveCustomer, setFinanceActionTypes, setLastActionAnalysisResponse } from '@/store/slices/customerSlice';

type AIAgentNodeProps = {
  id: string;
  data: {
    type: AgentType;
    config: AgentConfig;
    nodeType: NodeType;
  };
};

export interface SupabaseConfig extends BaseAgentConfig {
  apiUrl: string;
  apiKey: string;
  useAnon: boolean;
  capabilities: {
    database: boolean;
    auth: boolean;
    storage: boolean;
    functions: boolean;
  };
}

export default function AIAgentNode({ id, data }: AIAgentNodeProps) {
  const dispatch = useDispatch();
  const [config, setConfig] = useState<AgentConfig>(data.config);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isContentOpen, setIsContentOpen] = useState(false);
  const [isChartOpen, setIsChartOpen] = useState(false);

  // Get edges and executionResults from redux
  const edges = useSelector((state: RootState) => state.flow.edges);
  const executionResults = useSelector((state: RootState) => state.flow.executionResults);

  // Get execution status and result from redux
  const executionStatus = useSelector((state: RootState) =>
    state.flow.executionResults[id]?.status || 'idle'
  );
  const executionResult = useSelector((state: RootState) =>
    state.flow.executionResults[id]?.output || null
  );

  const isProcessing = executionStatus === 'running';
  const hasContent = executionResult?.content;
  const hasChart = data.type === 'dataAnalyst' && executionResult?.base64Image;

  // Find previous node's output content if available
  useEffect(() => {
    if (data.type !== 'youtubeSummarizer') {
      const sourceEdge = edges.find(edge => edge.target === id);
      if (sourceEdge) {
        const prevResult = executionResults[sourceEdge.source];
        if (prevResult && prevResult.output && prevResult.output.content) {
          setConfig(prev => ({ ...prev, content: prevResult.output.content }));
        }
      }
    }
  }, [edges, executionResults, id, data.type]);

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

  const updateModelConfig = (updates: Partial<ModelConfig>) => {
    const updatedConfig = {
      ...config,
      modelConfig: {
        ...config.modelConfig,
        ...updates,
      }
    };
    setConfig(updatedConfig as AgentConfig);
  };

  const updateSupabaseConfig = (updates: Partial<SupabaseConfig>) => {
    const currentConfig = config as unknown as SupabaseConfig;
    setConfig({
      ...currentConfig,
      ...updates,
      capabilities: {
        ...currentConfig.capabilities,
        ...(updates.capabilities || {}),
      },
    });
  };

  const updateAIActionAnalysisConfig = (updates: Partial<AIActionAnalysisConfig>) => {
    const currentConfig = config as unknown as AIActionAnalysisConfig;
    setConfig({
      ...currentConfig,
      ...updates,
    });
  };

  const handleCustomerSelect = (customer: Customer) => {
    updateAIActionAnalysisConfig({ selectedCustomer: customer });
    dispatch(setActiveCustomer(customer));
  };

  const getNodeColor = () => {
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
      case 'supabase':
        return 'bg-pink-100 dark:bg-pink-900';
      case 'aiActionAnalysis':
        return 'bg-amber-100 dark:bg-amber-900';
      default:
        return 'bg-gray-100 dark:bg-gray-800';
    }
  };

  const getNodeIcon = () => {
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
      case 'supabase':
        return '💾';
      case 'aiActionAnalysis':
        return '💼';
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
          nodeType: data.nodeType,
        },
      },
    }));
    setIsConfigOpen(false);
    toast.success('Yapılandırma kaydedildi');
  };

  // Format content for better display
  const formatContent = (content: string) => {
    if (!content) return '';

    // Replace \n with actual newlines
    let formatted = content.replace(/\\n/g, '\n');

    // Fix table formatting if needed
    if (formatted.includes('|')) {
      const lines = formatted.split('\n');
      const formattedLines = lines.map(line => {
        if (line.trim().startsWith('|')) {
          // Ensure proper spacing in table cells
          return line.split('|')
            .map(cell => cell.trim())
            .filter(cell => cell)
            .join(' | ');
        }
        return line;
      });
      formatted = formattedLines.join('\n');
    }

    return formatted;
  };

  return (
    <div className="group relative">
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-muted-foreground dark:!bg-muted-foreground group-hover:!bg-primary"
        id="target"
      />

      {/* Action Buttons */}
      <div className="absolute -top-2 -right-2 z-10 flex space-x-1">
        {/* Settings Button - Always visible */}
        <Button
          size="icon"
          variant="secondary"
          className="h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            setIsConfigOpen(true);
          }}
        >
          <Settings className="h-3 w-3" />
        </Button>

        {/* Content Button - Visible after successful execution */}
        {hasContent && (
          <Button
            size="icon"
            variant="secondary"
            className="h-5 w-5 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              setIsContentOpen(true);
            }}
          >
            <FileText className="h-3 w-3" />
          </Button>
        )}

        {/* Chart Button - Only for DataAnalyst with chart data */}
        {hasChart && (
          <Button
            size="icon"
            variant="secondary"
            className="h-5 w-5 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              setIsChartOpen(true);
            }}
          >
            <BarChart className="h-3 w-3" />
          </Button>
        )}

        {/* Delete Button */}
        <Button
          size="icon"
          variant="destructive"
          className="h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            dispatch(removeNode(id));
            toast.success('Node silindi');
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      {/* Configuration Dialog */}
      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <Card
          className="w-48 cursor-pointer hover:ring-2 hover:ring-primary [&.selected]:ring-2 [&.selected]:ring-primary [&.selected]:shadow-md [&.selected]:shadow-primary/25 [&.selected]:scale-105 transition-all duration-200 relative"
          onClick={(e) => {
            if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 2) {
              return;
            }
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            setIsConfigOpen(true);
          }}
        >
          {isProcessing && <LoadingOverlay />}

          <CardHeader className="p-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <div className={`w-8 h-8 ${getNodeColor()} rounded flex items-center justify-center relative`}>
                <span className="text-base">{getNodeIcon()}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{defaultAgentConfigs[data.type].name}</span>
                <span className="text-xs text-muted-foreground">{defaultAgentConfigs[data.type].description}</span>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>

        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {`${defaultAgentConfigs[data.type].name} Yapılandırması`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2 py-2">
            {/* Model yapılandırması - tüm agent tipleri için ortak */}
            {data.type !== 'webSearcher' && (
              <ModelConfigForm
                modelConfig={(config.modelConfig || defaultAgentConfigs[data.type].modelConfig || createDefaultAgentConfig(data.type).modelConfig) as ModelConfig}
                onChange={updateModelConfig}
                agentType={data.type}
              />
            )}

            {/* Supabase yapılandırması */}
            {data.type === 'supabase' && (
              <>
                <div className="space-y-2">
                  <Label>API URL</Label>
                  <Input
                    value={(config as unknown as SupabaseConfig).apiUrl}
                    onChange={(e) => updateSupabaseConfig({ apiUrl: e.target.value })}
                    placeholder="Supabase API URL"
                  />
                </div>

                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input
                    type="password"
                    value={(config as unknown as SupabaseConfig).apiKey}
                    onChange={(e) => updateSupabaseConfig({ apiKey: e.target.value })}
                    placeholder="Supabase API Key"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="useAnon"
                    checked={(config as unknown as SupabaseConfig).useAnon}
                    onChange={(e) => updateSupabaseConfig({ useAnon: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="useAnon">Anonim Anahtar Kullan</Label>
                </div>

                <div className="space-y-2">
                  <Label>Yetenekler</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="database"
                        checked={(config as unknown as SupabaseConfig).capabilities?.database}
                        onChange={(e) => updateSupabaseConfig({
                          capabilities: { ...(config as unknown as SupabaseConfig).capabilities, database: e.target.checked }
                        })}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="database">Veritabanı</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="auth"
                        checked={(config as unknown as SupabaseConfig).capabilities?.auth}
                        onChange={(e) => updateSupabaseConfig({
                          capabilities: { ...(config as unknown as SupabaseConfig).capabilities, auth: e.target.checked }
                        })}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="auth">Kimlik Doğrulama</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="storage"
                        checked={(config as unknown as SupabaseConfig).capabilities?.storage}
                        onChange={(e) => updateSupabaseConfig({
                          capabilities: { ...(config as unknown as SupabaseConfig).capabilities, storage: e.target.checked }
                        })}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="storage">Depolama</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="functions"
                        checked={(config as unknown as SupabaseConfig).capabilities?.functions}
                        onChange={(e) => updateSupabaseConfig({
                          capabilities: { ...(config as unknown as SupabaseConfig).capabilities, functions: e.target.checked }
                        })}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="functions">Edge Functions</Label>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* AI Action Analysis yapılandırması */}
            {data.type === 'aiActionAnalysis' && (
              <>
                <div className="space-y-2">
                  <CustomerSearch
                    onCustomerSelect={handleCustomerSelect}
                    placeholder="Müşteri ara..."
                    label="Müşteri Seçimi"
                    selectedCustomer={(config as AIActionAnalysisConfig).selectedCustomer}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Sistem Prompt</Label>
                  <textarea
                    className="w-full p-2 rounded-md border border-input bg-background"
                    value={(config as AIActionAnalysisConfig).systemPrompt || ''}
                    onChange={(e) => updateAIActionAnalysisConfig({ systemPrompt: e.target.value })}
                    placeholder="Sistem prompt'unu girin"
                    rows={3}
                  />
                </div>
              </>
            )}

            {/* Content field for all agent types */}
            <div className="space-y-1">
              <Label>İçerik (Content)</Label>
              <textarea
                className="w-full p-2 rounded-md border border-input bg-background"
                value={(config as any).content || ''}
                onChange={e => setConfig(prev => ({ ...prev, content: e.target.value }))}
                placeholder="İçerik girin veya önceki node'dan otomatik alınır"
                rows={3}
              />
            </div>

            {/* YouTube Summarizer yapılandırması */}
            {data.type === 'youtubeSummarizer' && (
              <>
                <div className="space-y-2">
                  <Label>YouTube URL</Label>
                  <Input
                    value={(config as YoutubeSummarizerConfig).url}
                    onChange={(e) => updateConfig<YoutubeSummarizerConfig>({ url: e.target.value })}
                    placeholder="YouTube video URL'sini girin"
                  />
                </div>
              </>
            )}

            {/* Web Searcher yapılandırması */}
            {data.type === 'webSearcher' && (
              <>
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
                    <option value="en-US">English</option>
                    <option value="tr-TR">Türkçe</option>
                    <option value="de-DE">Deutsch</option>
                    <option value="fr-FR">Français</option>
                    <option value="es-ES">Español</option>
                  </select>
                </div>
              </>
            )}

            {/* Research Agent yapılandırması */}
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

            {/* Web Scraper yapılandırması */}
            {data.type === 'webScraper' && (
              <>
                <div className="space-y-2">
                  <Label>Maksimum Derinlik</Label>
                  <Input
                    type="number"
                    min="0"
                    max="5"
                    value={(config as WebScraperConfig).rules.maxDepth ?? 0}
                    onChange={(e) => updateConfig<WebScraperConfig>({
                      rules: {
                        ...(config as WebScraperConfig).rules,
                        maxDepth: isNaN(parseInt(e.target.value)) ? 0 : parseInt(e.target.value),
                      },
                    })}
                    placeholder="Maksimum tarama derinliği"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Maksimum Sayfa Sayısı</Label>
                  <Input
                    type="number"
                    min="1"
                    max="50"
                    value={(config as WebScraperConfig).rules.maxPages ?? 1}
                    onChange={(e) => updateConfig<WebScraperConfig>({
                      rules: {
                        ...(config as WebScraperConfig).rules,
                        maxPages: isNaN(parseInt(e.target.value)) ? 1 : parseInt(e.target.value),
                      },
                    })}
                    placeholder="Maksimum sayfa sayısı"
                  />
                </div>
              </>
            )}

            {/* Code Interpreter yapılandırması */}
            {data.type === 'codeInterpreter' && (
              <>
                <div className="space-y-2">
                  <Label>Runtime Seçenekleri</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="python"
                      checked={(config as CodeInterpreterConfig).runtime.python}
                      onChange={(e) => updateConfig<CodeInterpreterConfig>({
                        runtime: {
                          ...(config as CodeInterpreterConfig).runtime,
                          python: e.target.checked,
                        },
                      })}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="python">Python</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="javascript"
                      checked={(config as CodeInterpreterConfig).runtime.javascript}
                      onChange={(e) => updateConfig<CodeInterpreterConfig>({
                        runtime: {
                          ...(config as CodeInterpreterConfig).runtime,
                          javascript: e.target.checked,
                        },
                      })}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="javascript">JavaScript</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Kütüphaneler</Label>
                  <Input
                    value={(config as CodeInterpreterConfig).libraries.join(', ')}
                    onChange={(e) => updateConfig<CodeInterpreterConfig>({
                      libraries: e.target.value.split(',').map(lib => lib.trim()).filter(Boolean),
                    })}
                    placeholder="Virgülle ayrılmış kütüphane listesi"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Bellek Limiti (MB)</Label>
                  <Input
                    type="number"
                    min="256"
                    max="4096"
                    value={(config as CodeInterpreterConfig).memoryLimit}
                    onChange={(e) => updateConfig<CodeInterpreterConfig>({
                      memoryLimit: parseInt(e.target.value) || 1024,
                    })}
                    placeholder="MB cinsinden bellek limiti"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Zaman Aşımı (saniye)</Label>
                  <Input
                    type="number"
                    min="10"
                    max="300"
                    value={(config as CodeInterpreterConfig).timeoutSeconds}
                    onChange={(e) => updateConfig<CodeInterpreterConfig>({
                      timeoutSeconds: parseInt(e.target.value) || 30,
                    })}
                    placeholder="Saniye cinsinden zaman aşımı"
                  />
                </div>
              </>
            )}

            {/* Data Analyst yapılandırması */}
            {data.type === 'dataAnalyst' && (
              <>
                <div className="space-y-2">
                  <Label>Veri Dosyası</Label>
                  <Input
                    type="file"
                    accept=".csv,.json,.xlsx,.xls"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      updateConfig<DataAnalystConfig>({
                        file: file
                      });
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Grafik X Ekseni</Label>
                  <Input
                    value={(config as DataAnalystConfig).xAxis || ''}
                    onChange={(e) => updateConfig<DataAnalystConfig>({
                      xAxis: e.target.value
                    })}
                    placeholder="Örn: tarih, kategori, bölge"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Grafik Y Ekseni</Label>
                  <Input
                    value={(config as DataAnalystConfig).yAxis || ''}
                    onChange={(e) => updateConfig<DataAnalystConfig>({
                      yAxis: e.target.value
                    })}
                    placeholder="Örn: satış, miktar, kar"
                  />
                </div>
              </>
            )}

            {/* Image Generator yapılandırması */}
            {data.type === 'imageGenerator' && (
              <>
                <div className="space-y-2">
                  <Label>Sağlayıcı</Label>
                  <select
                    className="w-full p-2 rounded-md border border-input bg-background"
                    value={(config as ImageGeneratorConfig).provider}
                    onChange={(e) => updateConfig<ImageGeneratorConfig>({
                      provider: e.target.value as 'dalle' | 'stable-diffusion' | 'midjourney'
                    })}
                  >
                    <option value="dalle">DALL-E</option>
                    <option value="stable-diffusion">Stable Diffusion</option>
                    <option value="midjourney">Midjourney</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Çözünürlük</Label>
                  <select
                    className="w-full p-2 rounded-md border border-input bg-background"
                    value={(config as ImageGeneratorConfig).resolution}
                    onChange={(e) => updateConfig<ImageGeneratorConfig>({ resolution: e.target.value })}
                  >
                    <option value="256x256">256x256</option>
                    <option value="512x512">512x512</option>
                    <option value="1024x1024">1024x1024</option>
                    <option value="1024x1792">1024x1792 (Dikey)</option>
                    <option value="1792x1024">1792x1024 (Yatay)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Stil</Label>
                  <select
                    className="w-full p-2 rounded-md border border-input bg-background"
                    value={(config as ImageGeneratorConfig).style}
                    onChange={(e) => updateConfig<ImageGeneratorConfig>({ style: e.target.value })}
                  >
                    <option value="natural">Doğal</option>
                    <option value="vivid">Canlı</option>
                    <option value="anime">Anime</option>
                    <option value="photographic">Fotoğrafik</option>
                    <option value="3d-render">3D Render</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Örnekleme Adımları</Label>
                  <Input
                    type="number"
                    min="10"
                    max="150"
                    value={(config as ImageGeneratorConfig).samplingSteps}
                    onChange={(e) => updateConfig<ImageGeneratorConfig>({
                      samplingSteps: parseInt(e.target.value) || 20
                    })}
                  />
                </div>
              </>
            )}

            {/* Text Generator yapılandırması */}
            {data.type === 'textGenerator' && (
              <>
                <div className="space-y-2">
                  <Label>Maksimum Uzunluk</Label>
                  <Input
                    type="number"
                    min="100"
                    max="10000"
                    value={(config as TextGeneratorConfig).maxLength}
                    onChange={(e) => updateConfig<TextGeneratorConfig>({
                      maxLength: parseInt(e.target.value) || 2000
                    })}
                    placeholder="Maksimum karakter sayısı"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Format</Label>
                  <select
                    className="w-full p-2 rounded-md border border-input bg-background"
                    value={(config as TextGeneratorConfig).format}
                    onChange={(e) => updateConfig<TextGeneratorConfig>({
                      format: e.target.value as 'markdown' | 'html' | 'plain'
                    })}
                  >
                    <option value="markdown">Markdown</option>
                    <option value="html">HTML</option>
                    <option value="plain">Düz Metin</option>
                  </select>
                </div>
              </>
            )}

            {/* Translator yapılandırması */}
            {data.type === 'translator' && (
              <>
                <div className="space-y-2">
                  <Label>Hedef Dil</Label>
                  <select
                    className="w-full p-2 rounded-md border border-input bg-background"
                    value={(config as TranslatorConfig).targetLang}
                    onChange={(e) => updateConfig<TranslatorConfig>({ targetLang: e.target.value })}
                  >
                    <option value="tr">Türkçe</option>
                    <option value="en">İngilizce</option>
                    <option value="de">Almanca</option>
                    <option value="fr">Fransızca</option>
                    <option value="es">İspanyolca</option>
                  </select>
                </div>
              </>
            )}

            <Button className="w-full" onClick={handleSave}>Kaydet</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Content Preview Dialog */}
      <Dialog open={isContentOpen} onOpenChange={setIsContentOpen}>
        <DialogContent className="sm:max-w-[800px] h-[80vh] flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="text-xl font-semibold">İçerik Görüntüleyici</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  // Style table components
                  table: ({ node, ...props }) => (
                    <div className="my-4 w-full overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-200 dark:border-gray-700" {...props} />
                    </div>
                  ),
                  thead: ({ node, ...props }) => (
                    <thead className="bg-gray-50 dark:bg-gray-800" {...props} />
                  ),
                  th: ({ node, ...props }) => (
                    <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-300" {...props} />
                  ),
                  td: ({ node, ...props }) => (
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-500 dark:text-gray-300" {...props} />
                  ),
                  // Style headings
                  h1: ({ node, ...props }) => (
                    <h1 className="text-2xl font-bold mt-6 mb-4 text-gray-900 dark:text-gray-100 first:mt-0" {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 className="text-xl font-bold mt-6 mb-3 text-gray-800 dark:text-gray-200" {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-800 dark:text-gray-200" {...props} />
                  ),
                  // Style paragraphs and lists
                  p: ({ node, ...props }) => (
                    <p className="my-3 text-gray-600 dark:text-gray-300 leading-relaxed" {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="my-3 ml-6 list-disc text-gray-600 dark:text-gray-300 space-y-2" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="my-3 ml-6 list-decimal text-gray-600 dark:text-gray-300 space-y-2" {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="leading-relaxed" {...props} />
                  ),
                  // Style code blocks
                  code: ({ node, className, children, ...props }: any) => {
                    const match = /language-(\w+)/.exec(className || '');
                    const isInline = !match;
                    return isInline
                      ? <code className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-sm font-mono" {...props}>{children}</code>
                      : (
                        <div className="relative my-4">
                          <code className="block p-4 rounded-md bg-gray-100 dark:bg-gray-800 text-sm font-mono overflow-x-auto" {...props}>
                            {children}
                          </code>
                        </div>
                      );
                  },
                  // Style blockquotes
                  blockquote: ({ node, ...props }) => (
                    <blockquote className="border-l-4 border-gray-200 dark:border-gray-700 pl-4 my-4 italic text-gray-600 dark:text-gray-300" {...props} />
                  ),
                }}
              >
                {formatContent(executionResult?.content || '')}
              </ReactMarkdown>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Chart Preview Dialog */}
      <Dialog open={isChartOpen} onOpenChange={setIsChartOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Grafik Görüntüleyici</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            <img
              src={`data:image/png;base64,${executionResult?.base64Image}`}
              alt="Analiz Grafiği"
              className="max-w-full"
            />
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