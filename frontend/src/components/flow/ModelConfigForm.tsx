import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ModelConfig, LLMType, AgentType } from '@/store/types';
import { defaultModelConfig } from '@/store/defaultConfigs';

interface ModelConfigFormProps {
  modelConfig: ModelConfig;
  onChange: (updates: Partial<ModelConfig>) => void;
  agentType?: AgentType;
}

export default function ModelConfigForm({ modelConfig, onChange, agentType }: ModelConfigFormProps) {
  React.useEffect(() => {
    // Set default model type and model on component mount
    if (modelConfig.type !== 'huggingface' || modelConfig.model !== 'deepseek/deepseek-v3-0324') {
      handleModelTypeChange('huggingface');
    }
  }, []);

  const handleModelTypeChange = (type: LLMType) => {
    const defaultConfig = defaultModelConfig[type];
    const newConfig = {
      ...defaultConfig,
      type,
      model: type === 'huggingface' ? 'deepseek/deepseek-v3-0324' : defaultConfig.model
    } as ModelConfig;
    onChange(newConfig);
  };

  const handleModelChange = (model: string) => {
    const newConfig = {
      ...modelConfig,
      model
    } as ModelConfig;
    onChange(newConfig);
  };

  const renderModelOptions = () => {
    switch (modelConfig.type) {
      case 'openai':
        return (
          <>
            <option value="gpt-4">GPT-4</option>
            <option value="gpt-4-turbo">GPT-4 Turbo</option>
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
          </>
        );
      case 'gemini':
        return (
          <>
            <option value="gemini-pro">Gemini Pro</option>
            <option value="gemini-ultra">Gemini Ultra</option>
          </>
        );
      case 'anthropic':
        return (
          <>
            <option value="claude-3-opus">Claude 3 Opus</option>
            <option value="claude-3-sonnet">Claude 3 Sonnet</option>
            <option value="claude-3-haiku">Claude 3 Haiku</option>
          </>
        );
      case 'llama2':
        return (
          <>
            <option value="llama-2-70b-chat">Llama 2 70B Chat</option>
            <option value="llama-2-13b-chat">Llama 2 13B Chat</option>
          </>
        );
      case 'huggingface':
        return (
          <>
            <option value="deepseek/deepseek-v3-0324">Deepseek v3</option>
            <option value="google/gemma-3-27b-it">Gemma 27B</option>
          </>
        );
      default:
        return null;
    }
  };

  // Check if this is the YouTube Summarizer or Translator


  const isTranslator = agentType === 'translator';
  const isDataAnalyst = agentType === 'dataAnalyst';

  const getDefaultSystemPrompt = () => {
    if (isTranslator) {
      return 'Dil bilgisi ve anlam açısından kontrol edicisin sorun varsa ancak düzeltmelisin';
    }
    if (isDataAnalyst) {
      return 'Sen bir veri analizcisin. Verileri detaylı analiz edip istenen bilgileri sağlamalısın';
    }
    return 'Sen bir transkript özetleyicisin. Verilen metni özetleyeceksin';
  };

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label>Model</Label>
        <div className="grid grid-cols-2 gap-2">
          <select
            className="p-2 rounded-md border border-input bg-background"
            value={modelConfig.type}
            onChange={(e) => handleModelTypeChange(e.target.value as LLMType)}
          >
            <option value="huggingface">HuggingFace</option>
            <option value="openai">OpenAI</option>
            <option value="gemini">Gemini</option>
            <option value="anthropic">Anthropic</option>
            <option value="llama2">Llama</option>
          </select>
          
          <select
            className="p-2 rounded-md border border-input bg-background"
            value={modelConfig.model}
            onChange={(e) => handleModelChange(e.target.value)}
          >
            {renderModelOptions()}
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <Label>Sıcaklık (Temperature)</Label>
        <Input
          type="number"
          min="0"
          max="1"
          step="0.1"
          value={modelConfig.temperature}
          onChange={(e) => onChange({ temperature: parseFloat(e.target.value) } as Partial<ModelConfig>)}
        />
      </div>

      <div className="space-y-1">
        <Label>Sistem Prompt</Label>
        <textarea
          className="w-full p-2 rounded-md border border-input bg-background"
          value={modelConfig.systemPrompt || getDefaultSystemPrompt()}
          onChange={(e) => onChange({ systemPrompt: e.target.value } as Partial<ModelConfig>)}
          placeholder={getDefaultSystemPrompt()}
          rows={2}
        />
      </div>
    </div>
  );
} 