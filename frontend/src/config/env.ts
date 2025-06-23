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
 * Detect if we're in production environment
 */
function isProduction(): boolean {
  if (typeof window !== 'undefined') {
    // Client-side: check hostname
    return window.location.hostname.includes('fly.dev');
  }
  // Server-side: check NODE_ENV
  return process.env.NODE_ENV === 'production';
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
 * Get production URLs - NEVER use localhost in production
 */
function getProductionApiUrls() {
  return {
    mcpProvider: 'https://agent-automation-mcp-provider.fly.dev/mcp-provider',
    aiProvider: 'https://agent-automation-ai-provider.fly.dev/ai-provider',
    agentProvider: 'https://agent-automation-agent-provider.fly.dev/agent-provider',
  };
}

/**
 * Get development URLs
 */
function getDevelopmentApiUrls() {
  return {
    mcpProvider: 'http://localhost:8083/mcp-provider',
    aiProvider: 'http://localhost:8082/ai-provider',
    agentProvider: 'http://localhost:8081/agent-provider',
  };
}

/**
 * Main application configuration
 */
export const config: AppConfig = (() => {
  const production = isProduction();
  const apiUrls = production ? getProductionApiUrls() : getDevelopmentApiUrls();

  // Force production URLs if we detect production environment
  const mcpProvider = production
    ? apiUrls.mcpProvider
    : normalizeUrl(getEnvVar('NEXT_PUBLIC_MCP_PROVIDER_URL', apiUrls.mcpProvider));

  const aiProvider = production
    ? apiUrls.aiProvider
    : normalizeUrl(getEnvVar('NEXT_PUBLIC_AI_PROVIDER_URL', apiUrls.aiProvider));

  const agentProvider = production
    ? apiUrls.agentProvider
    : normalizeUrl(getEnvVar('NEXT_PUBLIC_AGENT_PROVIDER_URL', apiUrls.agentProvider));

  return {
    env: production ? 'production' : 'development',
    debug: getBoolEnvVar('NEXT_PUBLIC_DEBUG', !production),

    api: {
      mcpProvider,
      aiProvider,
      agentProvider,
      timeout: getNumberEnvVar('NEXT_PUBLIC_API_TIMEOUT', 30000),
    }
  };
})();

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

  // SECURITY: Never allow localhost in production
  if (config.env === 'production') {
    const hasLocalhost = requiredUrls.some(url => url.includes('localhost'));
    if (hasLocalhost) {
      throw new Error('🚨 SECURITY ERROR: Localhost URLs detected in production environment!');
    }
  }

  if (config.debug) {
    console.log('🔧 Environment Configuration:', {
      env: config.env,
      debug: config.debug,
      api: config.api,
      hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
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
    webScraper: `${config.api.agentProvider}/api/agent/web-scrapper`,
    webSearcher: `${config.api.agentProvider}/api/agent/web-searcher`,
    translator: `${config.api.agentProvider}/api/agent/translator`,
    dataAnalyser: `${config.api.agentProvider}/api/agent/data-analyser`,
    imageGenerator: `${config.api.agentProvider}/api/agent/image-generator`,
    youtubeSummarizer: `${config.api.agentProvider}/api/agent/youtube-summarize`,
  }
};

// Initialize and validate configuration
if (typeof window !== 'undefined') {
  validateConfig();
}
