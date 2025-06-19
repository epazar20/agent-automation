"use client";

import React, { useState, useEffect, useCallback } from 'react';
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
  X,
  FileImage
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
  MCPSupplierAgentConfig,
  Customer,
  EmailAttachment
} from '@/store/types';
import { toast } from 'sonner';
import { defaultAgentConfigs, createDefaultAgentConfig } from '@/store/defaultConfigs';
import { getMCPActionConfig, parseContentForAction, parseMCPContent, dynamicActionConfigs } from '@/store/mcpConstants';
import ModelConfigForm from './ModelConfigForm';
import { RootState } from '@/store';
import CustomerSearch from '@/components/ui/customer-search';
import ActionTypeSelector from '@/components/ui/action-type-selector';
import { setActiveCustomer, setFinanceActionTypes, setLastActionAnalysisResponse } from '@/store/slices/customerSlice';
import { fetchEmailAttachments } from '@/api/agents';

type AIAgentNodeProps = {
  id: string;
  data: {
    type: AgentType;
    config: AgentConfig;
    nodeType: NodeType;
  };
};

export default function AIAgentNode({ id, data }: AIAgentNodeProps) {
  const dispatch = useDispatch();
  const [config, setConfig] = useState<AgentConfig>(data.config);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isContentOpen, setIsContentOpen] = useState(false);
  const [isChartOpen, setIsChartOpen] = useState(false);
  const [isDocumentOpen, setIsDocumentOpen] = useState(false);
  const [attachments, setAttachments] = useState<EmailAttachment[]>([]);
  const [selectedAttachment, setSelectedAttachment] = useState<EmailAttachment | null>(null);
  const [isLoadingAttachments, setIsLoadingAttachments] = useState(false);

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

  // Get active customer from redux
  const activeCustomer = useSelector((state: RootState) => state.customer.activeCustomer);

  const isProcessing = executionStatus === 'running';
  const hasContent = executionResult?.content;
  const hasChart = data.type === 'dataAnalyst' && executionResult?.base64Image;
  
  // Check if MCP Supplier Agent has attachments
  const hasAttachments = data.type === 'mcpSupplierAgent' && 
    executionResult?.data?.results?.some((result: any) => 
      result.status === 'success' && 
      result.data?.attachmentIds && 
      result.data.attachmentIds.length > 0
    );

  // Function to load attachments
  const loadAttachments = async () => {
    if (!hasAttachments || isLoadingAttachments) return;
    
    setIsLoadingAttachments(true);
    try {
      // Get attachment IDs from execution result
      const attachmentIds: number[] = [];
      executionResult?.data?.results?.forEach((result: any) => {
        if (result.status === 'success' && result.data?.attachmentIds) {
          attachmentIds.push(...result.data.attachmentIds);
        }
      });
      
      if (attachmentIds.length > 0) {
        console.log('📎 Loading attachments:', attachmentIds);
        const fetchedAttachments = await fetchEmailAttachments(attachmentIds);
        setAttachments(fetchedAttachments);
        if (fetchedAttachments.length > 0) {
          setSelectedAttachment(fetchedAttachments[0]);
        }
      }
    } catch (error) {
      console.error('❌ Error loading attachments:', error);
      toast.error('Dokümanlar yüklenirken hata oluştu');
    } finally {
      setIsLoadingAttachments(false);
    }
  };

  // MCP Supplier Agent config update function
  const updateMCPSupplierAgentConfig = useCallback((updates: Partial<MCPSupplierAgentConfig>) => {
    setConfig(prevConfig => {
      const currentConfig = prevConfig as unknown as MCPSupplierAgentConfig;
      const updatedConfig = {
        ...currentConfig,
        ...updates,
      };
      
      return updatedConfig;
    });
  }, []);

  // Persist MCP config changes to Redux store (separate useEffect to avoid render-time dispatch)
  useEffect(() => {
    if (data.type === 'mcpSupplierAgent') {
      const mcpConfig = config as MCPSupplierAgentConfig;
      
      // Only dispatch if there are meaningful changes and not during initial render
      if (mcpConfig.actionType || mcpConfig.selectedCustomer || mcpConfig.content || mcpConfig.parsedParameters) {
        // Use timeout to batch updates and avoid render cycle conflicts
        const timeoutId = setTimeout(() => {
          dispatch(updateNode({
            id,
            updates: {
              data: {
                type: data.type,
                config: mcpConfig,
                nodeType: data.nodeType,
              },
            },
          }));
        }, 0); // Defer to next tick

        return () => clearTimeout(timeoutId);
      }
    }
  }, [
    (config as MCPSupplierAgentConfig).actionType,
    (config as MCPSupplierAgentConfig).selectedCustomer?.id, // Use id to avoid object reference changes
    dispatch,
    id,
    data.type,
    data.nodeType
  ]);

  // Ensure action type is set for loaded MCP Supplier Agent nodes
  useEffect(() => {
    if (data.type === 'mcpSupplierAgent') {
      const mcpConfig = config as MCPSupplierAgentConfig;
      
      if (!mcpConfig.actionType) {
        // Try to extract action type from node title or config if available
        // This is a fallback for corrupted workflows
        if (dynamicActionConfigs.length > 0) {
          const firstActionType = dynamicActionConfigs[0].typeCode;
          console.log('🔧 Setting default actionType for MCP node:', firstActionType);
          updateMCPSupplierAgentConfig({ actionType: firstActionType });
        }
      } else {
        console.log('✅ MCP Supplier Agent loaded with actionType:', mcpConfig.actionType);
      }
    }
  }, [data.type, config, dynamicActionConfigs]);

  // Force re-render when MCP config changes to update node title
  useEffect(() => {
    if (data.type === 'mcpSupplierAgent') {
      const mcpConfig = config as MCPSupplierAgentConfig;
      
      // Log when action type changes for debugging
      if (mcpConfig.actionType) {
        console.log('🏷️ MCP Node title update - actionType:', mcpConfig.actionType, 'nodeId:', id);
      }
    }
  }, [(config as MCPSupplierAgentConfig).actionType, data.type, id]);

  // Initialize model configuration for nodes that need it
  useEffect(() => {
    if (data.type === 'webScraper' && (!config.modelConfig || config.modelConfig.type === 'openai')) {
      console.log('🔧 Initializing Web Scraper model config to HuggingFace default');
      const defaultModelConfig = defaultAgentConfigs[data.type]?.modelConfig || createDefaultAgentConfig(data.type).modelConfig;
      console.log('🔧 Default model config for Web Scraper:', defaultModelConfig);
      
      setConfig(prevConfig => ({
        ...prevConfig,
        modelConfig: defaultModelConfig
      }));
    }
  }, [data.type, config.modelConfig]);

  // **CRITICAL FIX**: Force update existing Web Scraper nodes with wrong config
  useEffect(() => {
    if (data.type === 'webScraper' && config.modelConfig?.type === 'openai') {
      console.log('🚨 CRITICAL FIX - Web Scraper has OpenAI config, forcing HuggingFace update');
      const correctModelConfig = defaultAgentConfigs.webScraper.modelConfig || {
        type: 'huggingface',
        model: 'deepseek/deepseek-v3-0324',
        temperature: 0.7,
        maxTokens: 4096,
        topP: 1,
        systemPrompt: '',
      };
      
      console.log('🔧 CRITICAL FIX - Applying correct model config:', correctModelConfig);
      
      const correctedConfig = {
        ...config,
        modelConfig: correctModelConfig
      };
      
      setConfig(correctedConfig as any);
      
      // Immediately save to Redux store
      dispatch(updateNode({
        id,
        updates: {
          data: {
            type: data.type,
            config: correctedConfig as any,
            nodeType: data.nodeType,
          },
        },
      }));
      
      console.log('✅ CRITICAL FIX - Web Scraper config corrected and saved to Redux');
      toast.success('Web Scraper model konfigürasyonu düzeltildi');
    }
  }, [data.type, config.modelConfig?.type, dispatch, id, data.nodeType]);

  // Find previous node's output content if available
  useEffect(() => {
    if (data.type !== 'youtubeSummarizer') {
      const sourceEdge = edges.find(edge => edge.target === id);
      if (sourceEdge) {
        const prevResult = executionResults[sourceEdge.source];
        if (prevResult && prevResult.output && prevResult.output.content) {
          const contentToSet = prevResult.output.content;
          
          // MCP Supplier Agent için content preprocessing
          if (data.type === 'mcpSupplierAgent') {
            const mcpConfig = config as MCPSupplierAgentConfig;
            
            // If there's an active customer but no selected customer, set it first
            if (activeCustomer && !mcpConfig.selectedCustomer) {
              console.log('🔄 MCP Setting active customer as selected customer from previous node:', activeCustomer);
              updateMCPSupplierAgentConfig({ 
                selectedCustomer: activeCustomer,
                content: contentToSet 
              });
              return; // Don't set content again below
            }
            
            const parsedParams = parseContentForAction(contentToSet);
            
            if (parsedParams) {
              // Add customerId if not present
              if (!parsedParams.customerId) {
                // Use active customer first, then selected customer
                const customerToUse = activeCustomer || mcpConfig.selectedCustomer;
                if (customerToUse && customerToUse.id) {
                  parsedParams.customerId = customerToUse.id.toString();
                  console.log('✅ MCP Added customerId from customer:', parsedParams.customerId, customerToUse.fullName);
                }
              }
              
              // Only update if different
              if (mcpConfig.content !== contentToSet || 
                  JSON.stringify(mcpConfig.parsedParameters) !== JSON.stringify(parsedParams)) {
                updateMCPSupplierAgentConfig({ 
                  parsedParameters: parsedParams,
                  content: contentToSet 
                });
              }
              return; // Don't set content again below
            }
          }
          
          // Only update if content is different
          if ((config as any).content !== contentToSet) {
            setConfig(prev => ({ ...prev, content: contentToSet }));
          }
        }
      }
    }
  }, [edges, executionResults, id, data.type, config, updateMCPSupplierAgentConfig, activeCustomer]);

  useEffect(() => {
    if (data.config) {
      setConfig(data.config);
    }
  }, [data.config]);

  // MCP Supplier Agent için manual content parsing
  useEffect(() => {
    if (data.type === 'mcpSupplierAgent') {
      const mcpConfig = config as MCPSupplierAgentConfig;
      
      // If there's an active customer but no selected customer, set it
      if (activeCustomer && !mcpConfig.selectedCustomer) {
        console.log('🔄 MCP Setting active customer as selected customer:', activeCustomer);
        updateMCPSupplierAgentConfig({ selectedCustomer: activeCustomer });
        return; // Exit early to avoid double processing
      }
      
      console.log('🔍 MCP Manual Content Parsing:', {
        content: mcpConfig.content,
        actionType: mcpConfig.actionType,
        selectedCustomer: mcpConfig.selectedCustomer,
        activeCustomer: activeCustomer
      });
      
      if (mcpConfig.content) {
        const parsedParams = parseContentForAction(mcpConfig.content);
        console.log('🎯 MCP Manual Parsing Result:', parsedParams);
        
        if (parsedParams) {
          // Add customerId if not present
          if (!parsedParams.customerId) {
            // Use active customer first, then selected customer
            const customerToUse = activeCustomer || mcpConfig.selectedCustomer;
            if (customerToUse && customerToUse.id) {
              parsedParams.customerId = customerToUse.id.toString();
              console.log('✅ MCP Added customerId from customer:', parsedParams.customerId, customerToUse.fullName);
            }
          }
          
          // Only update if parsedParameters is different
          if (JSON.stringify(mcpConfig.parsedParameters) !== JSON.stringify(parsedParams)) {
            console.log('🔄 MCP Updating parsedParameters:', parsedParams);
            updateMCPSupplierAgentConfig({ 
              parsedParameters: parsedParams 
            });
          } else {
            console.log('⏭️ MCP parsedParameters unchanged');
          }
        } else {
          // Try parsing with the new general MCP content parser
          const generalParsed = parseMCPContent(mcpConfig.content);
          console.log('🔄 MCP General parsing result:', generalParsed);
          
          if (generalParsed) {
            // Ensure customerId is added to the action parameters
            if (generalParsed.parameters && generalParsed.parameters[mcpConfig.actionType]) {
              const actionParams = generalParsed.parameters[mcpConfig.actionType];
              if (!actionParams.customerId) {
                const customerToUse = activeCustomer || mcpConfig.selectedCustomer;
                if (customerToUse && customerToUse.id) {
                  actionParams.customerId = customerToUse.id.toString();
                  console.log('✅ MCP Added customerId to general parsed params:', actionParams.customerId);
                }
              }
            }
            
            updateMCPSupplierAgentConfig({ 
              parsedParameters: generalParsed 
            });
          } else {
            console.log('❌ MCP No valid parameters found');
          }
        }
      } else {
        console.log('❌ MCP No content to parse');
      }
    }
  }, [config.content, data.type, updateMCPSupplierAgentConfig, activeCustomer]);

  const updateConfig = (updates: Partial<AgentConfig>) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      ...updates,
    }));
  };

  const updateModelConfig = (updates: Partial<ModelConfig>) => {
    // Ensure we have a base model config - use default if not present
    const baseModelConfig = config.modelConfig || 
                            defaultAgentConfigs[data.type]?.modelConfig || 
                            createDefaultAgentConfig(data.type).modelConfig;
    
    const updatedConfig = {
      ...config,
      modelConfig: {
        ...baseModelConfig,
        ...updates,
      }
    };
    
    console.log('🔧 updateModelConfig - Updated config:', {
      type: data.type,
      oldModelConfig: config.modelConfig,
      baseModelConfig,
      updates,
      newModelConfig: updatedConfig.modelConfig
    });
    
    setConfig(updatedConfig as any);
    
    // **FIX**: Automatically save model config changes to Redux store
    // This ensures execution uses the correct model configuration
    console.log('💾 updateModelConfig - Auto-saving to Redux store:', {
      nodeId: id,
      modelConfig: updatedConfig.modelConfig
    });
    
    dispatch(updateNode({
      id,
      updates: {
        data: {
          type: data.type,
          config: updatedConfig as any,
          nodeType: data.nodeType,
        },
      },
    }));
    
    toast.success('Model konfigürasyonu güncellendi');
  };

  const updateAIActionAnalysisConfig = (updates: Partial<AIActionAnalysisConfig>) => {
    const currentConfig = config as unknown as AIActionAnalysisConfig;
    setConfig({
      ...currentConfig,
      ...updates,
    });
  };

  const handleCustomerSelect = (customer: Customer) => {
    if (data.type === 'aiActionAnalysis') {
      updateAIActionAnalysisConfig({ selectedCustomer: customer });
    } else if (data.type === 'mcpSupplierAgent') {
      updateMCPSupplierAgentConfig({ selectedCustomer: customer });
    }
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
      case 'aiActionAnalysis':
        return 'bg-indigo-100 dark:bg-indigo-900';
      case 'mcpSupplierAgent':
        return 'bg-violet-100 dark:bg-violet-900';
      case 'conditional':
        return 'bg-slate-100 dark:bg-slate-900';
      case 'result':
        return 'bg-gray-100 dark:bg-gray-900';
      default:
        return 'bg-gray-100 dark:bg-gray-900';
    }
  };

  const getNodeIcon = () => {
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
        return '🔬';
      case 'aiActionAnalysis':
        return '🎯';
      case 'mcpSupplierAgent':
        return '⚡';
      case 'conditional':
        return '🔀';
      case 'result':
        return '📋';
      default:
        return '🤖';
    }
  };

  // Get dynamic node name based on action type for mcpSupplierAgent
  const getNodeName = () => {
    if (data.type === 'mcpSupplierAgent') {
      const mcpConfig = config as MCPSupplierAgentConfig;
      if (mcpConfig.actionType) {
        try {
          const actionConfig = getMCPActionConfig(mcpConfig.actionType);
          if (actionConfig && actionConfig.typeName) {
            return `${actionConfig.typeName}`;
          }
        } catch (error) {
          console.warn('Error getting MCP action config for node name:', error);
        }
      }
      return 'MCP Supplier Agent';
    }
    return defaultAgentConfigs[data.type]?.name || 'Unknown Agent';
  };

  // Get dynamic node description based on action type for mcpSupplierAgent
  const getNodeDescription = () => {
    if (data.type === 'mcpSupplierAgent') {
      const mcpConfig = config as MCPSupplierAgentConfig;
      if (mcpConfig.actionType) {
        try {
          const actionConfig = getMCPActionConfig(mcpConfig.actionType);
          if (actionConfig) {
            return actionConfig.description || `${actionConfig.typeName} işlemlerini gerçekleştirir`;
          }
        } catch (error) {
          console.warn('Error getting MCP action config for node description:', error);
        }
      }
      return 'MCP protokolü ile tedarikçi entegrasyonu';
    }
    return defaultAgentConfigs[data.type]?.description || 'Agent açıklaması bulunamadı';
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

  const handleActionTypeChange = (selectedType: string) => {
    if (dynamicActionConfigs.length === 0) {
      console.warn('⚠️ No action types available');
      return;
    }

    const actionConfig = dynamicActionConfigs.find(config => config.typeCode === selectedType);
    if (!actionConfig) {
      console.warn(`⚠️ Action type not found: ${selectedType}`);
      return;
    }

    updateMCPSupplierAgentConfig({
      actionType: selectedType
    });
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

        {/* Document Button - Only for MCP Supplier Agent with attachments */}
        {hasAttachments && (
          <Button
            size="icon"
            variant="secondary"
            className="h-5 w-5 rounded-full"
            onClick={async (e) => {
              e.stopPropagation();
              setIsDocumentOpen(true);
              await loadAttachments();
            }}
          >
            <FileImage className="h-3 w-3" />
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
                <span className="text-sm font-medium">{getNodeName()}</span>
                <span className="text-xs text-muted-foreground">{getNodeDescription()}</span>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>

        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {`${getNodeName()} Yapılandırması`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2 py-2">
            {/* Model yapılandırması - tüm agent tipleri için ortak */}
            {data.type !== 'webSearcher' && data.type !== 'mcpSupplierAgent' && (
              <ModelConfigForm
                modelConfig={(config.modelConfig || defaultAgentConfigs[data.type].modelConfig || createDefaultAgentConfig(data.type).modelConfig) as ModelConfig}
                onChange={updateModelConfig}
                agentType={data.type}
              />
            )}

            {/* Supabase yapılandırması */}
            {/* Remove the entire Supabase configuration section */}

            {/* AI Action Analysis yapılandırması */}
            {data.type === 'aiActionAnalysis' && (
              <>
                <div className="space-y-2">
                  <CustomerSearch
                    onCustomerSelect={handleCustomerSelect}
                    placeholder="Müşteri ara..."
                    label="Müşteri Seçimi"
                    selectedCustomer={(config as AIActionAnalysisConfig).selectedCustomer}
                    readonly={false}
                  />
                </div>
              </>
            )}

            {/* MCP Supplier Agent yapılandırması */}
            {data.type === 'mcpSupplierAgent' && (
              <>
                <div className="space-y-2">
                  <ActionTypeSelector
                    onActionTypeSelect={handleActionTypeChange}
                    selectedActionType={(config as MCPSupplierAgentConfig).actionType}
                  />
                </div>

                <div className="space-y-2">
                  <CustomerSearch
                    onCustomerSelect={handleCustomerSelect}
                    placeholder="Müşteri ara..."
                    label="Müşteri Seçimi"
                    selectedCustomer={(config as MCPSupplierAgentConfig).selectedCustomer}
                    readonly={!!activeCustomer}
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
                    onChange={(e) => updateConfig({ url: e.target.value })}
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
                    onChange={(e) => updateConfig({ maxResults: parseInt(e.target.value) || 4 })}
                    placeholder="Kaç sonuç gösterilsin?"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Dil</Label>
                  <select
                    className="w-full p-2 rounded-md border border-input bg-background"
                    value={(config as WebSearcherConfig).filters.language}
                    onChange={(e) => updateConfig({
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
                    onChange={(e) => updateConfig({ topic: e.target.value })}
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
                    onChange={(e) => updateConfig({ numLinks: parseInt(e.target.value) || 5 })}
                    placeholder="Kullanılacak kaynak sayısı"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Derinlik Seviyesi</Label>
                  <select
                    className="w-full p-2 rounded-md border border-input bg-background"
                    value={(config as ResearchAgentConfig).depth}
                    onChange={(e) => updateConfig({
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
                    onChange={(e) => updateConfig({ language: e.target.value })}
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
                    onChange={(e) => updateConfig({
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
                    onChange={(e) => updateConfig({ includeSourceLinks: e.target.checked })}
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
                    onChange={(e) => updateConfig({
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
                    onChange={(e) => updateConfig({
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
                      onChange={(e) => updateConfig({
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
                      onChange={(e) => updateConfig({
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
                    onChange={(e) => updateConfig({
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
                    onChange={(e) => updateConfig({
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
                    onChange={(e) => updateConfig({
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
                      updateConfig({
                        file: file
                      });
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Grafik X Ekseni</Label>
                  <Input
                    value={(config as DataAnalystConfig).xAxis || ''}
                    onChange={(e) => updateConfig({
                      xAxis: e.target.value
                    })}
                    placeholder="Örn: tarih, kategori, bölge"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Grafik Y Ekseni</Label>
                  <Input
                    value={(config as DataAnalystConfig).yAxis || ''}
                    onChange={(e) => updateConfig({
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
                    onChange={(e) => updateConfig({
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
                    onChange={(e) => updateConfig({ resolution: e.target.value })}
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
                    onChange={(e) => updateConfig({ style: e.target.value })}
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
                    onChange={(e) => updateConfig({
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
                    onChange={(e) => updateConfig({
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
                    onChange={(e) => updateConfig({
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
                    onChange={(e) => updateConfig({ targetLang: e.target.value })}
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

      {/* Document Preview Dialog */}
      <Dialog open={isDocumentOpen} onOpenChange={setIsDocumentOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Doküman Görüntüleyici</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col space-y-4">
            {isLoadingAttachments ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2">Dokümanlar yükleniyor...</span>
              </div>
            ) : attachments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Doküman bulunamadı
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Dokümanlar ({attachments.length})</Label>
                  <select
                    className="w-full p-2 rounded-md border border-input bg-background"
                    value={selectedAttachment?.id || ''}
                    onChange={(e) => {
                      const attachmentId = parseInt(e.target.value);
                      const attachment = attachments.find(a => a.id === attachmentId) || null;
                      setSelectedAttachment(attachment);
                    }}
                  >
                    <option value="">Doküman seçin</option>
                    {attachments.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.filename} ({(a.fileSize / 1024).toFixed(1)} KB)
                      </option>
                    ))}
                  </select>
                </div>
                {selectedAttachment && (
                  <div className="flex flex-col space-y-2">
                    <div className="text-sm text-muted-foreground">
                      <strong>Dosya:</strong> {selectedAttachment.filename}<br/>
                      <strong>Tip:</strong> {selectedAttachment.contentType}<br/>
                      <strong>Boyut:</strong> {(selectedAttachment.fileSize / 1024).toFixed(1)} KB
                    </div>
                    <div className="flex justify-center border rounded p-4">
                      {selectedAttachment.contentType === 'application/pdf' ? (
                        <iframe
                          src={`data:${selectedAttachment.contentType};base64,${selectedAttachment.base64Content}`}
                          className="w-full h-96 border rounded"
                          title={selectedAttachment.filename}
                        />
                      ) : selectedAttachment.contentType.startsWith('image/') ? (
                        <img
                          src={`data:${selectedAttachment.contentType};base64,${selectedAttachment.base64Content}`}
                          alt={selectedAttachment.filename}
                          className="max-w-full max-h-96"
                        />
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          Bu dosya türü önizlenemiyor: {selectedAttachment.contentType}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
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