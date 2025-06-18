/**
 * Environment Configuration Utility
 * Centralized configuration for all API endpoints and environment variables
 */

export interface ApiConfig {
  mcpProvider: string;
  aiProvider: string;
  agentProvider: string;
  timeout: number;
}

export interface AppConfig {
  env: 'development' | 'production' | 'test';
  debug: boolean;
  api: ApiConfig;
}

/**
 * Get environment variable with fallback
 */
function getEnvVar(key: string, fallback: string): string {
  if (typeof window !== 'undefined') {
    // Client-side
    return process.env[key] || fallback;
  }
  // Server-side
  return process.env[key] || fallback;
}

/**
 * Get boolean environment variable
 */
function getBoolEnvVar(key: string, fallback: boolean): boolean {
  const value = getEnvVar(key, fallback.toString());
  return value === 'true' || value === '1';
}

/**
 * Get number environment variable
 */
function getNumberEnvVar(key: string, fallback: number): number {
  const value = getEnvVar(key, fallback.toString());
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Remove trailing slash from URL
 */
function normalizeUrl(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

/**
 * Main application configuration
 */
export const config: AppConfig = {
  env: (getEnvVar('NEXT_PUBLIC_ENV', 'development') as AppConfig['env']),
  debug: getBoolEnvVar('NEXT_PUBLIC_DEBUG', true),
  
  api: {
    mcpProvider: normalizeUrl(getEnvVar('NEXT_PUBLIC_MCP_PROVIDER_URL', 'http://localhost:8083/mcp-provider')),
    aiProvider: normalizeUrl(getEnvVar('NEXT_PUBLIC_AI_PROVIDER_URL', 'http://localhost:8082/ai-provider')),
    agentProvider: normalizeUrl(getEnvVar('NEXT_PUBLIC_AGENT_PROVIDER_URL', 'http://localhost:8081/agent-provider')),
    timeout: getNumberEnvVar('NEXT_PUBLIC_API_TIMEOUT', 30000),
  }
};

/**
 * Validate configuration on app startup
 */
export function validateConfig(): void {
  const requiredUrls = [
    config.api.mcpProvider,
    config.api.aiProvider,
    config.api.agentProvider,
  ];

  for (const url of requiredUrls) {
    try {
      new URL(url);
    } catch (error) {
      throw new Error(`Invalid API URL: ${url}`);
    }
  }

  if (config.debug) {
    console.log('🔧 Environment Configuration:', {
      env: config.env,
      debug: config.debug,
      api: config.api,
    });
  }
}

/**
 * Helper functions for specific API endpoints
 */
export const apiEndpoints = {
  // MCP Provider endpoints
  mcp: {
    base: config.api.mcpProvider,
    workflows: `${config.api.mcpProvider}/api/workflows`,
    customers: `${config.api.mcpProvider}/api/customers`,
    financeActionTypes: `${config.api.mcpProvider}/api/finance-action-types`,
    actionAnalysis: `${config.api.mcpProvider}/action-analysis`,
    financeActions: `${config.api.mcpProvider}/api/finance-actions`,
  },
  
  // AI Provider endpoints
  ai: {
    base: config.api.aiProvider,
    generate: `${config.api.aiProvider}/api/ai/generate`,
    models: `${config.api.aiProvider}/api/ai/models`,
  },
  
  // Agent Provider endpoints
  agent: {
    base: config.api.agentProvider,
    webScraper: `${config.api.agentProvider}/api/agents/web-scraper`,
    webSearcher: `${config.api.agentProvider}/api/agents/web-searcher`,
    translator: `${config.api.agentProvider}/api/agents/translator`,
    dataAnalyser: `${config.api.agentProvider}/api/agent/data-analyser`,
    imageGenerator: `${config.api.agentProvider}/api/agents/image-generator`,
    youtubeSummarizer: `${config.api.agentProvider}/api/agents/youtube-summarize`,
  }
};

// Initialize and validate configuration
if (typeof window !== 'undefined') {
  validateConfig();
} 