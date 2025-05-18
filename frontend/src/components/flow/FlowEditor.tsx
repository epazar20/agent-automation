"use client";

import { useCallback } from 'react';
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
import { RootState } from '@/store';
import { addNode, updateNodePosition, addEdge, removeNode, removeEdge, updateExecutionResult } from '@/store/slices/flowSlice';
import { AgentType, AgentNode, NodeType, FlowConnection, McpType, ExecutionResults, AgentConfig } from '@/store/types';
import { createDefaultAgentConfig, createDefaultMcpConfig } from '@/store/defaultConfigs';
import { executeAgent } from '@/api/agents';
import AIAgentNode from './AIAgentNode';
import MCPAgentNode from './MCPAgentNode';
import ResultNode from './ResultNode';
import { Button } from "@/components/ui/button";
import { PlayIcon, GearIcon, PlusIcon } from "@radix-ui/react-icons";
import { toast } from 'sonner';
import 'reactflow/dist/style.css';

const nodeTypes = {
  aiAgent: AIAgentNode,
  mcpNode: MCPAgentNode,
  resultNode: ResultNode,
};

// Edge stil fonksiyonu
const getEdgeStyle = (edge: Edge, executionResults: ExecutionResults) => {
  const sourceResult = executionResults[edge.source];
  
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
};

function Flow() {
  const dispatch = useDispatch();
  const { nodes, edges, executionResults } = useSelector((state: RootState) => state.flow);
  const { project } = useReactFlow();

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
      const mcpType = event.dataTransfer.getData('application/reactflow-mcp') as McpType;
      
      if (!agentType && !mcpType) return;

      const reactFlowBounds = document.querySelector('.react-flow')?.getBoundingClientRect();
      if (!reactFlowBounds) return;

      const position = project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      if (agentType) {
        const newNode: AgentNode = {
          id: `${Date.now()}`,
          type: agentType === 'result' ? 'resultNode' : 'aiAgent',
          position,
          data: {
            type: agentType,
            config: createDefaultAgentConfig(agentType),
          },
        };

        dispatch(addNode(newNode));
      } else if (mcpType) {
        // MCP Node oluştur
        const newNode: AgentNode = {
          id: `mcp-${Date.now()}`,
          type: 'mcpNode', // Yeni eklenen mcpNode tipini kullan
          position,
          data: {
            type: 'webScraper', // Placeholder, ilerde MCP tipi olarak değiştirilecek
            config: createDefaultMcpConfig(mcpType) as unknown as AgentConfig,
          },
        };

        dispatch(addNode(newNode));
        toast.success(`${mcpType.toUpperCase()} MCP Eklendi`);
      }
    },
    [project, dispatch],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleExecute = async () => {
    try {
      // Find all agent nodes (excluding result nodes)
      const agentNodes = nodes.filter((node: Node) => node.type !== 'resultNode');
      
      // Get execution order by following connections
      const executionOrder = getExecutionOrder(agentNodes, edges);
      
      // Create a map to store results
      const resultMap = new Map();
      
      for (const node of executionOrder) {
        // Update node status to 'running'
        dispatch(updateExecutionResult({
          nodeId: node.id,
          status: 'running',
        }));

        try {
          // Get outputs from previous nodes using the result map
          const inputs = [];
          const incomingEdges = edges.filter(edge => edge.target === node.id);
          
          for (const edge of incomingEdges) {
            const sourceResult = resultMap.get(edge.source);
            if (sourceResult?.status === 'completed' && sourceResult.output) {
              inputs.push(sourceResult.output);
            }
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

          // Execute the node
          const result = await executeAgent(node.data.type, configToSend);

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
              dispatch(updateExecutionResult({
                nodeId: resultNode.id,
                status: 'completed',
                output: result,
              }));
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

  // Edge'leri duruma göre güncelle
  const styledEdges = edges.map((edge: Edge) => ({
    ...edge,
    style: getEdgeStyle(edge, executionResults),
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
      <div style={{ height: 'calc(100vh - 48px)' }}>
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
          className="dark:bg-background"
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
          <Controls className="dark:bg-background dark:text-foreground dark:border-border" />
          <MiniMap className="dark:bg-background" />
          <Background gap={12} size={1} className="dark:bg-muted" />
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