import axios from 'axios';
import { WebSearcherConfig, YoutubeSummarizerConfig, ResearchAgentConfig } from '@/store/types';

const API_URL = 'http://localhost:8081/agent-provider/api';
const AXIOS_TIMEOUT = 60000; // 60 seconds

export async function executeYoutubeSummarizer(config: YoutubeSummarizerConfig) {
  try {
    const response = await axios.post(
      `${API_URL}/agent/youtube-summarize`,
      {
        url: config.url,
        specialPrompt: config.specialPrompt,
        model: `${config.modelConfig.type}/${config.modelConfig.model}`
      },
      { timeout: AXIOS_TIMEOUT }
    );
    return response.data;
  } catch (error) {
    console.error('YouTube API Error:', error);
    throw error;
  }
}

export async function executeWebSearcher(config: WebSearcherConfig) {
  try {
    const response = await axios.post(
      `${API_URL}/websearch/search`,
      {
        query: config.searchQuery,
        num_results: config.maxResults,
        languages: [config.filters.language || 'en'],
      },
      { timeout: AXIOS_TIMEOUT }
    );
    return response.data;
  } catch (error) {
    console.error('Web Search API Error:', error);
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

export async function executeAgent(type: string, config: any) {
  switch (type) {
    case 'youtubeSummarizer':
      return executeYoutubeSummarizer(config);
    case 'webSearcher':
      return executeWebSearcher(config);
    case 'researchAgent':
      return executeResearchAgent(config);
    default:
      throw new Error('Desteklenmeyen agent tipi');
  }
} 