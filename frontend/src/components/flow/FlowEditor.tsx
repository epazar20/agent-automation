"use client";

import { useCallback, useMemo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  Connection,
  Edge,
  Node,
  useReactFlow,
  ReactFlowProvider,
  NodeChange,
} from 'reactflow';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/types';
import { addNode, updateNodePosition, addEdge, removeNode, removeEdge, updateExecutionResult } from '@/store/slices/flowSlice';
import { setFinanceActionTypes, setLastActionAnalysisResponse, setActionResultContent, setActiveFinanceActionTypes, setActiveCustomer, addNodeResponse, clearAccumulatedResponses } from '@/store/slices/customerSlice';
import { AgentType, AgentNode, NodeType, FlowConnection, ExecutionResults, AgentConfig } from '@/store/types';
import { createDefaultAgentConfig, defaultAgentConfigs } from '@/store/defaultConfigs';
import { executeAgent } from '@/api/agents';
import AIAgentNode from './AIAgentNode';
import ResultNode from './ResultNode';
import ConditionalNode from './ConditionalNode';
import { Button } from "@/components/ui/button";
import { PlayIcon, GearIcon, PlusIcon } from "@radix-ui/react-icons";
import { toast } from 'sonner';
import 'reactflow/dist/style.css';

const nodeTypes = {
  aiAgent: AIAgentNode,
  resultNode: ResultNode,
  conditionalNode: ConditionalNode,
};

// Helper function to evaluate conditional node - moved outside component
const evaluateConditionalNode = (config: any, data: any) => {
  console.log('🔍 Evaluating ConditionalNode:', { config, data });
  
  if (!config.conditions || config.conditions.length === 0) {
    console.log('❌ No conditions found');
    return false;
  }

  const getValue = (valueConfig: { type: 'variable' | 'static'; value: string }, inputData: any) => {
    if (valueConfig.type === 'variable') {
      // Navigate through nested object properties
      const keys = valueConfig.value.split('.');
      let result = inputData;
      for (const key of keys) {
        if (result && typeof result === 'object' && key in result) {
          result = result[key];
        } else {
          return undefined;
        }
      }
      return result;
    }
    return valueConfig.value;
  };

  const evaluateCondition = (condition: any, inputData: any) => {
    const value1 = getValue(condition.value1, inputData);
    const value2 = getValue(condition.value2, inputData);

    console.log('🔍 Condition Evaluation:', {
      value1,
      value2,
      operator: condition.operator,
      value1Type: typeof value1,
      value2Type: typeof value2
    });

    switch (condition.operator) {
      case 'equals':
        // Handle boolean comparison specially
        if (typeof value1 === 'boolean' || typeof value2 === 'boolean' || 
            value1 === 'true' || value1 === 'false' || 
            value2 === 'true' || value2 === 'false') {
          const bool1 = value1 === true || value1 === 'true';
          const bool2 = value2 === true || value2 === 'true';
          console.log('🔍 Boolean Comparison:', { value1, value2, bool1, bool2, result: bool1 === bool2 });
          return bool1 === bool2;
        }
        return value1 === value2;
      case 'notEquals':
        // Handle boolean comparison specially
        if (typeof value1 === 'boolean' || typeof value2 === 'boolean' || 
            value1 === 'true' || value1 === 'false' || 
            value2 === 'true' || value2 === 'false') {
          const bool1 = value1 === true || value1 === 'true';
          const bool2 = value2 === true || value2 === 'true';
          return bool1 !== bool2;
        }
        return value1 !== value2;
      case 'contains':
        return String(value1).includes(String(value2));
      case 'notContains':
        return !String(value1).includes(String(value2));
      case 'greaterThan':
        return Number(value1) > Number(value2);
      case 'lessThan':
        return Number(value1) < Number(value2);
      case 'greaterThanOrEqual':
        return Number(value1) >= Number(value2);
      case 'lessThanOrEqual':
        return Number(value1) <= Number(value2);
      case 'startsWith':
        return String(value1).startsWith(String(value2));
      case 'endsWith':
        return String(value1).endsWith(String(value2));
      case 'isEmpty':
        return !value1 || value1 === '' || (Array.isArray(value1) && value1.length === 0);
      case 'isNotEmpty':
        return value1 && value1 !== '' && (!Array.isArray(value1) || value1.length > 0);
      case 'like':
        const likePattern = String(value2).replace(/%/g, '.*');
        return new RegExp(likePattern, 'i').test(String(value1));
      case 'notLike':
        const notLikePattern = String(value2).replace(/%/g, '.*');
        return !new RegExp(notLikePattern, 'i').test(String(value1));
      default:
        return false;
    }
  };

  const results = config.conditions.map((condition: any) => evaluateCondition(condition, data));
  
  if (config.combineOperator === 'AND') {
    return results.every((result: boolean) => result);
  } else {
    return results.some((result: boolean) => result);
  }
};

function Flow() {
  const dispatch = useDispatch();
  const { nodes, edges, executionResults } = useSelector((state: RootState) => state.flow);
  const { screenToFlowPosition } = useReactFlow();
  const { activeCustomer, lastActionAnalysisResponse } = useSelector((state: RootState) => state.customer);

  // Cache conditional evaluation results to prevent multiple evaluations
  const conditionalResults = useMemo(() => {
    const cache = new Map();
    
    nodes.forEach(node => {
      if (node.data.type === 'conditional') {
        const result = executionResults[node.id];
        if (result?.status === 'completed' && result.output) {
          const conditionResult = evaluateConditionalNode(node.data.config, result.output);
          cache.set(node.id, conditionResult);
        }
      }
    });
    
    return cache;
  }, [nodes, executionResults]);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    changes.forEach((change) => {
      if (change.type === 'position' && change.position) {
        dispatch(updateNodePosition({
          id: change.id,
          position: change.position,
        }));
      }
    });
  }, [dispatch]);

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      if (!params.source || !params.target) return;
      
      // Result node'a sadece diğer node'lardan bağlantı yapılabilir
      const targetNode = nodes.find((n: Node) => n.id === params.target);
      if (targetNode?.type === 'resultNode') {
        const sourceNode = nodes.find((n: Node) => n.id === params.source);
        if (sourceNode?.type === 'resultNode') {
          return; // Result node'dan result node'a bağlantı yapılamaz
        }
      }
      
      dispatch(addEdge({
        id: `e${Date.now()}`,
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle || undefined,
        targetHandle: params.targetHandle || undefined,
      }));
    },
    [dispatch, nodes],
  );

  const onNodeDelete = useCallback((nodes: Node[]) => {
    nodes.forEach((node) => {
      dispatch(removeNode(node.id));
    });
  }, [dispatch]);

  const onEdgesDelete = useCallback((edges: Edge[]) => {
    edges.forEach((edge) => {
      dispatch(removeEdge(edge.id));
    });
  }, [dispatch]);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const agentType = event.dataTransfer.getData('application/reactflow') as AgentType;
      if (!agentType) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: AgentNode = {
        id: `${Date.now()}`,
        type: agentType === 'conditional' ? 'conditionalNode' : agentType === 'result' ? 'resultNode' : 'aiAgent',
        position,
        data: {
          type: agentType,
          config: createDefaultAgentConfig(agentType),
          nodeType: ( agentType === 'aiActionAnalysis' || agentType === 'mcpSupplierAgent') ? 'business' : 'general',
        },
      };

      dispatch(addNode(newNode));
      toast.success(`${defaultAgentConfigs[agentType].name} eklendi`);
    },
    [screenToFlowPosition, dispatch],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleExecute = async () => {
    try {
      // Clear accumulated responses at the start of new execution
      dispatch(clearAccumulatedResponses());
      console.log('🧹 FlowEditor - Cleared accumulated responses for new execution');
      
      // Find all nodes (including result nodes for conditional handling)
      const allNodes = nodes;
      const agentNodes = nodes.filter((node: Node) => node.type !== 'resultNode');
      
      // Get execution order by following connections
      const executionOrder = getExecutionOrder(agentNodes, edges);
      
      console.log('🚀 Execution Order:', executionOrder.map(n => ({ id: n.id, type: n.data.type })));
      
      // Create a map to store results
      const resultMap = new Map();
      
      // Get active customer from Redux store
      const currentActiveCustomer = activeCustomer;
      console.log('🔍 FlowEditor - Current active customer from store:', currentActiveCustomer);
      
      // Clear all ResultNodes at the start
      const resultNodes = nodes.filter((node: Node) => node.type === 'resultNode');
      for (const resultNode of resultNodes) {
        dispatch(updateExecutionResult({
          nodeId: resultNode.id,
          status: 'idle',
          output: null,
        }));
        console.log(`🧹 Cleared ResultNode: ${resultNode.id}`);
      }
      
      // First, handle all ResultNodes connected to ConditionalNodes
      for (const resultNode of resultNodes) {
        const incomingEdges = edges.filter(edge => edge.target === resultNode.id);
        
        for (const edge of incomingEdges) {
          const sourceNode = nodes.find(n => n.id === edge.source);
          if (sourceNode?.data.type === 'conditional') {
            // This ResultNode is connected to a ConditionalNode
            // We'll handle it after the ConditionalNode executes
            console.log(`📋 ResultNode ${resultNode.id} connected to ConditionalNode ${sourceNode.id} via ${edge.sourceHandle} handle`);
          }
        }
      }
      
      for (const node of executionOrder) {
        console.log(`🔄 Executing node: ${node.id} (${node.data.type})`);
        
        // Get outputs from previous nodes using the result map FIRST
        const inputs = [];
        const incomingEdges = edges.filter(edge => edge.target === node.id);
        
        // ENHANCED: Wait for ALL prerequisite nodes to complete before executing
        const prerequisiteNodeIds = incomingEdges.map(edge => edge.source);
        const uncompletedPrerequisites = prerequisiteNodeIds.filter(nodeId => {
          const result = resultMap.get(nodeId);
          return !result || result.status !== 'completed';
        });
        
        if (uncompletedPrerequisites.length > 0) {
          console.log(`⏸️ Node ${node.id} (${node.data.type}) waiting for prerequisites:`, uncompletedPrerequisites);
          // This should not happen with proper topological sort, but adding safety check
          throw new Error(`Node ${node.id} has uncompleted prerequisites: ${uncompletedPrerequisites.join(', ')}`);
        }
        
        // Special handling for SEND_EMAIL to ensure all MCP nodes are completed
        if (node.data.type === 'mcpSupplierAgent' && (node.data.config as any).actionType === 'SEND_EMAIL') {
          console.log('📧 SEND_EMAIL node detected - verifying all prerequisite MCP nodes are completed');
          
          // Find all MCP nodes that should have completed before this SEND_EMAIL
          const allMcpNodes = executionOrder.filter(n => 
            n.data.type === 'mcpSupplierAgent' && 
            n.id !== node.id && 
            executionOrder.indexOf(n) < executionOrder.indexOf(node)
          );
          
          const incompleteMcpNodes = allMcpNodes.filter(mcpNode => {
            const result = resultMap.get(mcpNode.id);
            return !result || result.status !== 'completed';
          });
          
          if (incompleteMcpNodes.length > 0) {
            console.error('❌ SEND_EMAIL cannot execute - incomplete MCP nodes:', incompleteMcpNodes.map(n => n.id));
            throw new Error(`SEND_EMAIL node cannot execute until all prerequisite MCP nodes complete: ${incompleteMcpNodes.map(n => n.id).join(', ')}`);
          }
          
          console.log(`✅ SEND_EMAIL prerequisites verified - ${allMcpNodes.length} MCP nodes completed successfully`);
        }
        
        for (const edge of incomingEdges) {
          const sourceResult = resultMap.get(edge.source);
          if (sourceResult?.status === 'completed' && sourceResult.output) {
            // Check if the source is a conditional node
            const sourceNode = nodes.find(n => n.id === edge.source);
            if (sourceNode?.data.type === 'conditional') {
              // For conditional nodes, only add input if this edge should receive data
              const conditionalConfig = sourceNode.data.config;
              const conditionResult = evaluateConditionalNode(conditionalConfig, sourceResult.output);
              
              console.log('🔍 ConditionalNode Routing:', {
                nodeId: node.id,
                sourceNodeId: edge.source,
                edgeHandle: edge.sourceHandle,
                conditionResult,
              });
              
              const shouldReceiveData = (edge.sourceHandle === 'true' && conditionResult) || 
                                      (edge.sourceHandle === 'false' && !conditionResult);
              
              if (shouldReceiveData) {
                inputs.push(sourceResult.output);
              }
            } else {
              // For non-conditional nodes, always add the input
              inputs.push(sourceResult.output);
            }
          }
        }
        
        // Skip execution if this node has incoming conditional edges but no valid inputs
        const hasConditionalInputs = incomingEdges.some(edge => {
          const sourceNode = nodes.find(n => n.id === edge.source);
          return sourceNode?.data.type === 'conditional';
        });
        
        if (hasConditionalInputs && inputs.length === 0) {
          console.log(`⏭️ Skipping node ${node.id} - no valid conditional inputs`);
          // Set status to idle instead of running
          dispatch(updateExecutionResult({
            nodeId: node.id,
            status: 'idle',
          }));
          continue;
        }
        
        // Only set to running if we're actually going to execute
        dispatch(updateExecutionResult({
          nodeId: node.id,
          status: 'running',
        }));

        try {
          // Handle ConditionalNode specially
          if (node.data.type === 'conditional') {
            // For conditional nodes, just pass through the input data
            const inputData = inputs.length > 0 ? inputs[0] : null;
            
            // Handle ResultNodes connected to this ConditionalNode
            const connectedResultNodes = edges
              .filter((edge: Edge) => edge.source === node.id)
              .map((edge: Edge) => ({ 
                node: nodes.find((n: Node) => n.id === edge.target),
                edge: edge
              }))
              .filter((item) => item.node?.type === 'resultNode');

            console.log(`🔄 ConditionalNode ${node.id} has ${connectedResultNodes.length} connected ResultNodes`);

            const conditionalConfig = node.data.config;
            const conditionResult = evaluateConditionalNode(conditionalConfig, inputData);

            console.log(`🎯 ConditionalNode ${node.id} evaluation result: ${conditionResult}`);

            // Store the result in our map with condition result
            resultMap.set(node.id, {
              status: 'completed',
              output: inputData,
              conditionResult: conditionResult
            });

            // Update Redux state with condition result
            dispatch(updateExecutionResult({
              nodeId: node.id,
              status: 'completed',
              output: inputData,
              conditionResult: conditionResult
            }));

            // Update all connected ResultNodes based on condition result
            for (const { node: resultNode, edge } of connectedResultNodes) {
              if (resultNode) {
                const shouldRoute = (edge.sourceHandle === 'true' && conditionResult) || 
                                  (edge.sourceHandle === 'false' && !conditionResult);
                
                console.log(`📋 ResultNode ${resultNode.id}: ${shouldRoute ? 'Activated' : 'Deactivated'} (${edge.sourceHandle} handle)`);

                if (shouldRoute) {
                  dispatch(updateExecutionResult({
                    nodeId: resultNode.id,
                    status: 'completed',
                    output: inputData,
                  }));
                } else {
                  // Explicitly set to idle with null output for inactive paths
                  dispatch(updateExecutionResult({
                    nodeId: resultNode.id,
                    status: 'idle',
                    output: null,
                  }));
                }
              }
            }
            
            continue; // Skip normal execution for conditional nodes
          }
          
          // Prepare configuration with content from previous nodes
          let configToSend = { ...node.data.config } as any;
          
          // Get content from previous node's response
          if (inputs.length > 0) {
            const previousResponse = inputs[0];
            let content;
            
            if (previousResponse?.content) {
              // Handle standard content
              content = previousResponse.content;
            } else {
              // Fallback to entire response if no specific content field
              content = previousResponse;
            }
            
            // Set the content in config
            configToSend.content = typeof content === 'object' ? JSON.stringify(content) : content;
          }

          // Ensure customer information is available for nodes that need it
          if (node.data.type === 'aiActionAnalysis') {
            // For AI Action Analysis, ensure selectedCustomer is set from activeCustomer if not already set
            if (!configToSend.selectedCustomer && currentActiveCustomer) {
              configToSend.selectedCustomer = currentActiveCustomer;
              console.log('✅ FlowEditor - Added activeCustomer to AI Action Analysis config:', currentActiveCustomer);
            }
            
            // If still no customer, check if there's a selectedCustomer in the original config
            if (!configToSend.selectedCustomer) {
              console.warn('⚠️ FlowEditor - AI Action Analysis has no customer selected');
            }
          } else if (node.data.type === 'mcpSupplierAgent') {
            // For MCP Supplier Agent, ensure selectedCustomer is set from activeCustomer if not already set
            if (!configToSend.selectedCustomer && currentActiveCustomer) {
              configToSend.selectedCustomer = currentActiveCustomer;
              console.log('✅ FlowEditor - Added activeCustomer to MCP Supplier Agent config:', currentActiveCustomer);
            }
            
            // Pass accumulated responses to MCP Supplier Agent instead of lastActionAnalysisResponse
            // The MCP Supplier Agent will use Redux selector to get accumulated responses
            console.log('✅ FlowEditor - MCP Supplier Agent will use accumulated responses from Redux');
            
            // If still no customer, check if there's a selectedCustomer in the original config
            if (!configToSend.selectedCustomer) {
              console.warn('⚠️ FlowEditor - MCP Supplier Agent has no customer selected');
            }
          }

          // Execute the node
          console.log(`🚀 FlowEditor - About to execute node:`, {
            nodeId: node.id,
            nodeType: node.data.type,
            configToSend
          });
          
          const result = await executeAgent(node.data.type, configToSend);
          
          console.log(`✅ FlowEditor - Node execution completed:`, {
            nodeId: node.id,
            nodeType: node.data.type,
            result
          });

          // Save node response to accumulated responses in Redux
          dispatch(addNodeResponse({
            nodeId: node.id,
            nodeType: node.data.type,
            actionType: configToSend.actionType || null,
            timestamp: new Date().toISOString(),
            response: result,
            customer: configToSend.selectedCustomer || currentActiveCustomer
          }));
          console.log(`💾 FlowEditor - Saved ${node.data.type} response to accumulated responses`);

          // Handle special processing for aiActionAnalysis
          if (node.data.type === 'aiActionAnalysis' && result) {
            // Update Redux with finance action types and customer info
            if (result.financeActionTypes) {
              dispatch(setFinanceActionTypes(result.financeActionTypes));
              dispatch(setActiveFinanceActionTypes(result.financeActionTypes));
            }
            if (result.content) {
              dispatch(setActionResultContent(result.content));
            }
            if (result.customer) {
              dispatch(setLastActionAnalysisResponse(result));
              // Set active customer for subsequent nodes
              dispatch(setActiveCustomer(result.customer));
              console.log('✅ FlowEditor - Set active customer from AI Action Analysis:', result.customer);
            }
          }

          // Handle special processing for mcpSupplierAgent
          if (node.data.type === 'mcpSupplierAgent' && result) {
            // Update Redux with customer info if available
            if (result.customer) {
              dispatch(setActiveCustomer(result.customer));
            }
            // Store transaction results
            if (result.transactions) {
              dispatch(setActionResultContent(JSON.stringify(result, null, 2)));
            }
          }

          // Store the result in our map
          resultMap.set(node.id, {
            status: 'completed',
            output: result
          });

          // Update Redux state
          dispatch(updateExecutionResult({
            nodeId: node.id,
            status: 'completed',
            output: result,
          }));

          // Update connected result nodes
          const connectedResults = edges
            .filter((edge: Edge) => edge.source === node.id)
            .map((edge: Edge) => nodes.find((n: Node) => n.id === edge.target))
            .filter((n: Node | undefined) => n?.type === 'resultNode');

          for (const resultNode of connectedResults) {
            if (resultNode) {
              // Check if this ResultNode is connected to a ConditionalNode
              const hasConditionalSource = edges.some(edge => {
                if (edge.target === resultNode.id) {
                  const sourceNode = nodes.find(n => n.id === edge.source);
                  return sourceNode?.data.type === 'conditional';
                }
                return false;
              });

              if (!hasConditionalSource) {
                // Only update ResultNodes that are NOT connected to ConditionalNodes
                console.log(`📋 Updating non-conditional ResultNode: ${resultNode.id}`);
                dispatch(updateExecutionResult({
                  nodeId: resultNode.id,
                  status: 'completed',
                  output: result,
                }));
              } else {
                console.log(`⏭️ Skipping conditional ResultNode update: ${resultNode.id}`);
              }
            }
          }

        } catch (error) {
          console.error(`Error executing node ${node.id}:`, error);
          
          // Store error in our map
          resultMap.set(node.id, {
            status: 'error',
            error: error instanceof Error ? error.message : 'An error occurred'
          });
          
          dispatch(updateExecutionResult({
            nodeId: node.id,
            status: 'error',
            error: error instanceof Error ? error.message : 'An error occurred',
          }));
        }
      }

      toast.success('İşlem tamamlandı');
    } catch (error) {
      console.error('Error in workflow execution:', error);
      toast.error('Workflow execution failed');
    }
  };

  // Node'ları sıralı çalıştırmak için sıralama fonksiyonu
  const getExecutionOrder = (nodes: AgentNode[], edges: FlowConnection[]) => {
    const visited = new Set<string>();
    const order: AgentNode[] = [];

    const visit = (node: AgentNode) => {
      if (visited.has(node.id)) return;
      
      // Önce bu node'a gelen bağlantıları bul
      const incomingEdges = edges.filter(edge => edge.target === node.id);
      
      // Gelen bağlantıların kaynak node'larını ziyaret et
      for (const edge of incomingEdges) {
        const sourceNode = nodes.find(n => n.id === edge.source);
        if (sourceNode && !visited.has(sourceNode.id)) {
          visit(sourceNode);
        }
      }

      visited.add(node.id);
      order.push(node);
    };

    // Tüm node'ları ziyaret et
    nodes.forEach(node => visit(node));
    return order;
  };

  // Edge stil fonksiyonu - optimized to use cache
  const getEdgeStyle = useCallback((edge: Edge) => {
    const sourceResult = executionResults[edge.source];
    
    // Check if source is a conditional node and handle special styling
    const sourceNode = nodes.find(n => n.id === edge.source);
    if (sourceNode?.data?.type === 'conditional' && sourceResult?.status === 'completed') {
      const conditionResult = conditionalResults.get(edge.source);
      
      if (conditionResult !== undefined) {
        const isActiveEdge = (edge.sourceHandle === 'true' && conditionResult) || 
                            (edge.sourceHandle === 'false' && !conditionResult);
        
        if (isActiveEdge) {
          return {
            stroke: '#22c55e', // Yeşil - aktif edge
            strokeWidth: 3,
            transition: 'stroke 0.3s ease',
          };
        } else {
          return {
            stroke: '#64748b', // Gri - inaktif edge
            strokeWidth: 1,
            opacity: 0.3,
            transition: 'stroke 0.3s ease',
          };
        }
      }
    }
    
    if (!sourceResult) {
      return {
        stroke: '#64748b', // Gri (default)
        strokeWidth: 2,
        transition: 'stroke 0.3s ease',
      };
    }

    switch (sourceResult.status) {
      case 'running':
        return {
          stroke: '#f97316', // Turuncu
          strokeWidth: 2,
          animation: 'flowEdgePulse 1.5s infinite',
          transition: 'stroke 0.3s ease',
        };
      case 'completed':
        return {
          stroke: '#22c55e', // Yeşil
          strokeWidth: 2,
          transition: 'stroke 0.3s ease',
        };
      case 'error':
        return {
          stroke: '#ef4444', // Kırmızı
          strokeWidth: 2,
          transition: 'stroke 0.3s ease',
        };
      default:
        return {
          stroke: '#64748b', // Gri
          strokeWidth: 2,
          transition: 'stroke 0.3s ease',
        };
    }
  }, [executionResults, nodes, conditionalResults]);

  // Edge'leri duruma göre güncelle
  const styledEdges = edges.map((edge: Edge) => ({
    ...edge,
    style: getEdgeStyle(edge),
    animated: executionResults[edge.source]?.status === 'running',
    type: 'smoothstep',
  }));

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Üst Toolbar */}
      <div className="h-12 border-b flex items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleExecute}
            disabled={nodes.length === 0}
          >
            <PlayIcon className="mr-2 h-4 w-4" />
            Çalıştır
          </Button>
        </div>
        <div className="text-sm font-medium">AI Agent Akışı</div>
        <div className="flex items-center space-x-2">
          <Button 
            size="sm" 
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => {
              console.log('Yeni Agent Ekle butonuna tıklandı');
            }}
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Yeni Agent Ekle
          </Button>
        </div>
      </div>

      {/* Flow Alanı */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={styledEdges}
          onNodesChange={onNodesChange}
          onNodesDelete={onNodeDelete}
          onEdgesDelete={onEdgesDelete}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
          className="h-full"
          deleteKeyCode={['Backspace', 'Delete']}
          multiSelectionKeyCode={['Control', 'Meta']}
          selectionKeyCode={['Shift']}
          selectNodesOnDrag={false}
          elementsSelectable={true}
          defaultEdgeOptions={{
            type: 'smoothstep',
            style: { strokeWidth: 2 },
          }}
        >
          <Controls />
          <MiniMap />
          <Background gap={12} size={1} />
        </ReactFlow>
      </div>

      <style jsx global>{`
        @keyframes flowEdgePulse {
          0% {
            stroke-opacity: 1;
          }
          50% {
            stroke-opacity: 0.5;
          }
          100% {
            stroke-opacity: 1;
          }
        }

        .react-flow__edge-path {
          transition: stroke 0.3s ease, stroke-opacity 0.3s ease;
        }
        
        .react-flow__node.selected {
          z-index: 10;
        }
      `}</style>
    </div>
  );
}

export default function FlowEditor() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}