"use client";

import { Handle, Position } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDispatch, useSelector } from 'react-redux';
import { updateNode, removeNode } from '@/store/slices/flowSlice';
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
  ModelConfig
} from '@/store/types';
import { toast } from 'sonner';
import { defaultAgentConfigs, createDefaultAgentConfig } from '@/store/defaultConfigs';
import { X } from 'lucide-react';
import ModelConfigForm from './ModelConfigForm';
import { RootState } from '@/store';

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

  // Get edges and executionResults from redux
  const edges = useSelector((state: RootState) => state.flow.edges);
  const executionResults = useSelector((state: RootState) => state.flow.executionResults);

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
                modelConfig={config.modelConfig} 
                onChange={updateModelConfig}
                agentType={data.type}
              />
            )}

            {/* Content field for all except youtubeSummarizer */}
            {data.type !== 'youtubeSummarizer' && (
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
            )}

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

                <div className="space-y-2">
                  <Label>Özel Prompt</Label>
                  <Textarea
                    value={(config as YoutubeSummarizerConfig).specialPrompt}
                    onChange={(e) => updateConfig<YoutubeSummarizerConfig>({ specialPrompt: e.target.value })}
                    placeholder="Özel prompt girin (örn: Sen bir transkript özetleyicisin. Verilen metni özetleyeceksin)"
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
                  <Label>Desteklenen Formatlar</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['csv', 'json', 'excel', 'sql'].map(format => (
                      <div key={format} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={format}
                          checked={(config as DataAnalystConfig).supportedFormats.includes(format as any)}
                          onChange={(e) => {
                            const currentFormats = [...(config as DataAnalystConfig).supportedFormats];
                            if (e.target.checked) {
                              if (!currentFormats.includes(format as any)) {
                                currentFormats.push(format as any);
                              }
                            } else {
                              const index = currentFormats.indexOf(format as any);
                              if (index > -1) {
                                currentFormats.splice(index, 1);
                              }
                            }
                            updateConfig<DataAnalystConfig>({
                              supportedFormats: currentFormats,
                            });
                          }}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={format}>{format.toUpperCase()}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Görselleştirme</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="visualization"
                      checked={(config as DataAnalystConfig).visualization.enabled}
                      onChange={(e) => updateConfig<DataAnalystConfig>({
                        visualization: {
                          ...(config as DataAnalystConfig).visualization,
                          enabled: e.target.checked,
                        },
                      })}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="visualization">Görselleştirmeyi Etkinleştir</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Görselleştirme Kütüphaneleri</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {['matplotlib', 'plotly', 'seaborn'].map(lib => (
                      <div key={lib} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={lib}
                          checked={(config as DataAnalystConfig).visualization.libraries.includes(lib as any)}
                          onChange={(e) => {
                            const currentLibs = [...(config as DataAnalystConfig).visualization.libraries];
                            if (e.target.checked) {
                              if (!currentLibs.includes(lib as any)) {
                                currentLibs.push(lib as any);
                              }
                            } else {
                              const index = currentLibs.indexOf(lib as any);
                              if (index > -1) {
                                currentLibs.splice(index, 1);
                              }
                            }
                            updateConfig<DataAnalystConfig>({
                              visualization: {
                                ...(config as DataAnalystConfig).visualization,
                                libraries: currentLibs,
                              },
                            });
                          }}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={lib}>{lib}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="caching"
                    checked={(config as DataAnalystConfig).caching}
                    onChange={(e) => updateConfig<DataAnalystConfig>({
                      caching: e.target.checked,
                    })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="caching">Önbelleğe Alma</Label>
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

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-muted-foreground dark:!bg-muted-foreground group-hover:!bg-primary"
        id="source"
      />
    </div>
  );
}