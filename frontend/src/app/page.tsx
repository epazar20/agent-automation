"use client";

import { useState, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AgentType } from '@/store/types';
import { defaultAgentConfigs } from '@/store/defaultConfigs';
import FlowEditor from '@/components/flow/FlowEditor';
import { AgentCard } from '@/components';
import { Separator } from "@/components/ui/separator";
import FinanceActionTypeModal from '@/components/FinanceActionTypeModal';

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFinanceActionModalOpen, setIsFinanceActionModalOpen] = useState(false);

  const filteredAgents = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return (Object.keys(defaultAgentConfigs) as AgentType[]).filter(agentType => {
      const config = defaultAgentConfigs[agentType];
      const isBusinessAgent = agentType === 'aiActionAnalysis' || agentType === 'mcpSupplierAgent';
      const isCommonNode = agentType === 'result' || agentType === 'conditional';
      const matchesActiveTab = (activeTab === 'business' && isBusinessAgent) || (activeTab === 'general' && !isBusinessAgent);
      
      return !isCommonNode && matchesActiveTab && (
        (config?.name || '').toLowerCase().includes(query) ||
        (config?.description || '').toLowerCase().includes(query)
      );
    });
  }, [activeTab]);

  const commonNodes: AgentType[] = ['result', 'conditional'];

  return (
    <main className="flex h-screen overflow-hidden">
      <div className="flex flex-1">
        {/* Sol Panel */}
        <div className="w-80 border-r flex flex-col h-full">
          {/* Arama Alanı - Fixed at Top */}
          <div className="p-4 border-b shrink-0">
            <Input
              type="search"
              placeholder="Agent ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Tabs Section - Flexible Height */}
          <div className="flex flex-col min-h-0 flex-1">
            <Tabs 
              defaultValue="general" 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="flex flex-col h-full"
            >
              {/* Tab Headers - Fixed */}
              <div className="px-4 py-2 border-b shrink-0">
                <TabsList className="w-full">
                  <TabsTrigger value="general" className="flex-1">Genel Agentler</TabsTrigger>
                  <TabsTrigger value="business" className="flex-1">İş Agentleri</TabsTrigger>
                </TabsList>
              </div>

              {/* Add Action Button - Only for Business Tab */}
              {activeTab === 'business' && (
                <div className="px-4 py-2 border-b shrink-0">
                  <Button
                    onClick={() => setIsFinanceActionModalOpen(true)}
                    className="w-full"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Yeni Action Ekle/Düzenle
                  </Button>
                </div>
              )}

              {/* Tab Content - Scrollable */}
              <div className="flex-1 overflow-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-track]:bg-muted/10 hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30">
                <div className="p-4 space-y-4">
                  {filteredAgents.map((agentType) => (
                    <AgentCard
                      key={agentType}
                      type={agentType}
                      config={defaultAgentConfigs[agentType]}
                    />
                  ))}
                </div>
              </div>
            </Tabs>
          </div>

          {/* Separator */}
          <Separator className="shrink-0" />

          {/* Common Section - Fixed at Bottom */}
          <div className="p-4 border-t shrink-0 bg-background">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Ortak Bileşenler</h3>
            <div className="space-y-4">
              {commonNodes.map((nodeType) => (
                <AgentCard
                  key={nodeType}
                  type={nodeType}
                  config={defaultAgentConfigs[nodeType]}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Sağ Panel - Flow Editor */}
        <div className="flex-1 overflow-hidden">
          <FlowEditor />
        </div>
      </div>

      {/* Finance Action Type Modal */}
      <FinanceActionTypeModal
        isOpen={isFinanceActionModalOpen}
        onClose={() => setIsFinanceActionModalOpen(false)}
      />
    </main>
  );
}

