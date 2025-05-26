import { Card, CardContent } from "@/components/ui/card";
import { AgentType, AgentConfig } from "@/store/types";

// Agent ikonları
const agentIcons: Record<AgentType, string> = {
  webScraper: '🕷️',
  webSearcher: '🔍',
  codeInterpreter: '💻',
  dataAnalyst: '📊',
  imageGenerator: '🎨',
  textGenerator: '📝',
  translator: '🌐',
  youtubeSummarizer: '📺',
  researchAgent: '📚',
  result: '📋',
  supabase: '🔷',
};

// Agent renkleri
const agentColors: Record<AgentType, string> = {
  webScraper: 'bg-purple-100 dark:bg-purple-900',
  webSearcher: 'bg-blue-100 dark:bg-blue-900',
  codeInterpreter: 'bg-green-100 dark:bg-green-900',
  dataAnalyst: 'bg-yellow-100 dark:bg-yellow-900',
  imageGenerator: 'bg-pink-100 dark:bg-pink-900',
  textGenerator: 'bg-orange-100 dark:bg-orange-900',
  translator: 'bg-cyan-100 dark:bg-cyan-900',
  youtubeSummarizer: 'bg-red-100 dark:bg-red-900',
  researchAgent: 'bg-indigo-100 dark:bg-indigo-900',
  result: 'bg-gray-100 dark:bg-gray-900',
  supabase: 'bg-emerald-100 dark:bg-emerald-900',
};

interface AgentCardProps {
  type: AgentType;
  config: Partial<AgentConfig>;
}

export default function AgentCard({ type, config }: AgentCardProps) {
  const onDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('application/reactflow', type);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Card 
      className="cursor-grab hover:bg-accent transition-colors" 
      draggable 
      onDragStart={onDragStart}
    >
      <CardContent className="p-3 flex items-center space-x-2">
        <div className={`w-8 h-8 ${agentColors[type]} rounded flex items-center justify-center transition-colors`}>
          <span className="text-base">{agentIcons[type]}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{config.name}</span>
          <span className="text-xs text-muted-foreground">{config.description}</span>
        </div>
      </CardContent>
    </Card>
  );
} 