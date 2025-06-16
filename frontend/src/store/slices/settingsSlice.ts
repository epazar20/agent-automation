import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Settings } from '../types';

const initialState: Settings = {
  theme: 'light',
  language: 'tr',
  autoSave: true,
  saveInterval: 30000,
  defaultModels: {
    openai: 'gpt-4o',
    huggingface: 'deepseek/deepseek-v3-0324',
    anthropic: 'claude-3-opus',
    google: 'gemini-pro',
  },
  maxTokenLimits: {
    openai: 128000,
    huggingface: 32768,
    anthropic: 200000,
    google: 32768,
  },
  agentDefaults: {
    webScraper: {},
    webSearcher: {},
    codeInterpreter: {},
    dataAnalyst: {},
    imageGenerator: {},
    textGenerator: {},
    translator: {},
    youtubeSummarizer: {},
    researchAgent: {},
    result: {},
    supabase: {},
    conditional: {},
    aiActionAnalysis: {},
  },
  security: {
    encryptApiKeys: true,
    allowExternalRequests: true,
    allowFileSystem: false,
  },
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    // Tema değiştirme
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },

    // Dil değiştirme
    setLanguage: (state, action: PayloadAction<'tr' | 'en'>) => {
      state.language = action.payload;
    },

    // Otomatik kaydetme ayarları
    setAutoSave: (state, action: PayloadAction<boolean>) => {
      state.autoSave = action.payload;
    },
    setSaveInterval: (state, action: PayloadAction<number>) => {
      state.saveInterval = action.payload;
    },

    // Varsayılan model ayarları
    setDefaultModel: (state, action: PayloadAction<{ agentType: keyof typeof state.defaultModels; model: string }>) => {
      state.defaultModels[action.payload.agentType] = action.payload.model;
    },

    // Token limitleri
    setMaxTokenLimit: (state, action: PayloadAction<{ agentType: keyof typeof state.maxTokenLimits; limit: number }>) => {
      state.maxTokenLimits[action.payload.agentType] = action.payload.limit;
    },

    // Tüm ayarları sıfırlama
    resetSettings: (state) => {
      Object.assign(state, initialState);
    },

    // Ayarları içe aktarma
    importSettings: (state, action: PayloadAction<Settings>) => {
      Object.assign(state, action.payload);
    },
  },
});

export const {
  setTheme,
  setLanguage,
  setAutoSave,
  setSaveInterval,
  setDefaultModel,
  setMaxTokenLimit,
  resetSettings,
  importSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer; 