import axios from 'axios';
import { WebSearcherConfig, YoutubeSummarizerConfig, ResearchAgentConfig, WebScraperConfig, TranslatorConfig, DataAnalystConfig } from '@/store/types';

const API_URL = 'http://localhost:8081/agent-provider/api';
const AXIOS_TIMEOUT = 60000; // 60 seconds

export async function executeYoutubeSummarizer(config: YoutubeSummarizerConfig) {
  try {
    const response = await axios.post(
      `${API_URL}/agent/youtube-summarize`,
      {
        url: config.url,
        content: (config as any).content,
        specialPrompt: (config as any).specialPrompt,
        model: `${config.modelConfig.type}/${config.modelConfig.model}`, 
        maxTokens: config.modelConfig.maxTokens,
        temperature: config.modelConfig.temperature
      },
      { timeout: AXIOS_TIMEOUT }
    );
    return response.data;
  } catch (error) {
    console.error('YouTube API Error:', error);
    throw error;
  }
}

export async function executeWebSearcher(config: any) {
  try {
    const response = await axios.post(
      `${API_URL}/agent/web-searcher`,
      {
        content: config.content,
        language: config.filters?.language || 'en-US',
        maxResult: config.maxResults || 4
      },
      { timeout: AXIOS_TIMEOUT }
    );
    return response.data;
  } catch (error) {
    console.error('Web Searcher API Error:', error);
    throw error;
  }
}

export async function executeResearchAgent(config: ResearchAgentConfig) {
  try {
    const response = await axios.post(
      `${API_URL}/research/analyze`,
      {
        topic: config.topic,
        num_links: config.numLinks,
        language: config.language,
        depth: config.depth,
        include_sources: config.includeSourceLinks,
        format: config.format,
      },
      { timeout: AXIOS_TIMEOUT }
    );
    return response.data;
  } catch (error) {
    console.error('Research API Error:', error);
    throw error;
  }
}

export async function executeWebScraper(config: WebScraperConfig) {
  try {
    const response = await axios.post(
      `${API_URL}/agent/web-scrapper`,
      {
        content: (config as any).content,
        specialPrompt: (config as any).specialPrompt,
        model: `${config.modelConfig.type}/${config.modelConfig.model}`,
        maxLink: (config as any).rules?.maxPages || 1,
        maxDepth: (config as any).rules?.maxDepth || 1,
        maxTokens: config.modelConfig.maxTokens,
        temperature: config.modelConfig.temperature
      },
      { timeout: AXIOS_TIMEOUT }
    );
    return response.data;
  } catch (error) {
    console.error('Web Scraper API Error:', error);
    throw error;
  }
}

export async function executeTranslator(config: TranslatorConfig) {
  try {
    const response = await axios.post(
      `${API_URL}/agent/translator`,
      {
        content: config.content,
        model: `${config.modelConfig.type}/${config.modelConfig.model}`,
        targetLanguage: config.targetLang,
        specialPrompt: config.modelConfig.systemPrompt,
        temperature: config.modelConfig.temperature,
        maxTokens: config.modelConfig.maxTokens
      },
      { timeout: AXIOS_TIMEOUT }
    );
    return response.data;
  } catch (error) {
    console.error('Translator API Error:', error);
    throw error;
  }
}

export async function executeDataAnalyst(config: DataAnalystConfig) {
  try {
    const formData = new FormData();

    if (config.file) {
      formData.append('file', config.file);
    }

    const requestData = {
      content: config.content,
      model: `${config.modelConfig.type}/${config.modelConfig.model}`,
      specialPrompt: config.modelConfig.systemPrompt,
      temperature: config.modelConfig.temperature,
      maxTokens: config.modelConfig.maxTokens,
      xAxis: config.xAxis,
      yAxis: config.yAxis
    };

    formData.append('request', JSON.stringify(requestData));

    const response = await axios.post(
      `${API_URL}/agent/data-analyser`,
      formData,
      {
        timeout: AXIOS_TIMEOUT,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Data Analyst API Error:', error);
    throw error;
  }
}

export async function executeAgent(type: string, config: any) {
  switch (type) {
    case 'youtubeSummarizer':
      return executeYoutubeSummarizer(config);
    case 'webSearcher':
      return executeWebSearcher(config);
    case 'researchAgent':
      return executeResearchAgent(config);
    case 'webScraper':
      return executeWebScraper(config);
    case 'translator':
      return executeTranslator(config);
    case 'dataAnalyst':
      return executeDataAnalyst(config);
    default:
      throw new Error('Desteklenmeyen agent tipi');
  }
} 