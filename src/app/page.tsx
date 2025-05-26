"use client";

import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AgentType } from '@/store/types';
import { defaultAgentConfigs } from '@/store/defaultConfigs';
import FlowEditor from '@/components/flow/FlowEditor';
import AgentCard from '@/components/AgentCard';

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('general');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAgents = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return (Object.keys(defaultAgentConfigs) as AgentType[]).filter(agentType => {
      const config = defaultAgentConfigs[agentType];
      const isBusinessAgent = agentType === 'supabase';
      const matchesActiveTab = (activeTab === 'business' && isBusinessAgent) || (activeTab === 'general' && !isBusinessAgent);
      
      return matchesActiveTab && (
        (config?.name || '').toLowerCase().includes(query) ||
        (config?.description || '').toLowerCase().includes(query)
      );
    });
  }, [searchQuery, activeTab]);

  return (
    <main className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        {/* Sol Panel */}
        <div className="w-80 border-r p-4 flex flex-col">
          <Input
            type="search"
            placeholder="Agent ara..."
            className="mb-4"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          <Tabs defaultValue="general" className="flex-1 flex flex-col" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="general" className="flex-1">Genel Agentler</TabsTrigger>
              <TabsTrigger value="business" className="flex-1">İş Agentleri</TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1">
              <div className="grid gap-4">
                {filteredAgents.map((agentType) => (
                  <AgentCard
                    key={agentType}
                    type={agentType}
                    config={defaultAgentConfigs[agentType]}
                  />
                ))}
              </div>
            </ScrollArea>
          </Tabs>
        </div>

        {/* Sağ Panel - Flow Editor */}
        <div className="flex-1">
          <FlowEditor />
        </div>
      </div>
    </main>
  );
} 