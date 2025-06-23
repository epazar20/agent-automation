import { config, apiEndpoints } from '@/config/env';

export default function DebugConfig() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🔧 Environment Configuration Debug</h1>

      <div className="grid gap-6">
        {/* Environment Info */}
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Environment</h2>
          <div className="space-y-2 font-mono text-sm">
            <div>Environment: <span className="text-blue-600">{config.env}</span></div>
            <div>Debug Mode: <span className="text-blue-600">{config.debug ? 'ON' : 'OFF'}</span></div>
            <div>Hostname: <span className="text-blue-600">{typeof window !== 'undefined' ? window.location.hostname : 'N/A'}</span></div>
            <div>NODE_ENV: <span className="text-blue-600">{process.env.NODE_ENV}</span></div>
          </div>
        </div>

        {/* API Configuration */}
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">API Base URLs</h2>
          <div className="space-y-2 font-mono text-sm">
            <div>
              MCP Provider:
              <span className={`ml-2 ${config.api.mcpProvider.includes('localhost') ? 'text-red-600' : 'text-green-600'}`}>
                {config.api.mcpProvider}
              </span>
            </div>
            <div>
              AI Provider:
              <span className={`ml-2 ${config.api.aiProvider.includes('localhost') ? 'text-red-600' : 'text-green-600'}`}>
                {config.api.aiProvider}
              </span>
            </div>
            <div>
              Agent Provider:
              <span className={`ml-2 ${config.api.agentProvider.includes('localhost') ? 'text-red-600' : 'text-green-600'}`}>
                {config.api.agentProvider}
              </span>
            </div>
          </div>
        </div>

        {/* API Endpoints */}
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Full API Endpoints</h2>

          <h3 className="font-medium mb-2">MCP Provider:</h3>
          <div className="space-y-1 font-mono text-xs text-gray-600 dark:text-gray-400 mb-4">
            <div>Workflows: {apiEndpoints.mcp.workflows}</div>
            <div>Customers: {apiEndpoints.mcp.customers}</div>
            <div>Finance Actions: {apiEndpoints.mcp.financeActions}</div>
          </div>

          <h3 className="font-medium mb-2">AI Provider:</h3>
          <div className="space-y-1 font-mono text-xs text-gray-600 dark:text-gray-400 mb-4">
            <div>Generate: {apiEndpoints.ai.generate}</div>
            <div>Models: {apiEndpoints.ai.models}</div>
          </div>

          <h3 className="font-medium mb-2">Agent Provider:</h3>
          <div className="space-y-1 font-mono text-xs text-gray-600 dark:text-gray-400">
            <div>Web Searcher: {apiEndpoints.agent.webSearcher}</div>
            <div>Translator: {apiEndpoints.agent.translator}</div>
            <div>Youtube: {apiEndpoints.agent.youtubeSummarizer}</div>
          </div>
        </div>

        {/* Environment Variables */}
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Environment Variables</h2>
          <div className="space-y-2 font-mono text-xs text-gray-600 dark:text-gray-400">
            <div>NEXT_PUBLIC_MCP_PROVIDER_URL: {process.env.NEXT_PUBLIC_MCP_PROVIDER_URL || 'undefined'}</div>
            <div>NEXT_PUBLIC_AI_PROVIDER_URL: {process.env.NEXT_PUBLIC_AI_PROVIDER_URL || 'undefined'}</div>
            <div>NEXT_PUBLIC_AGENT_PROVIDER_URL: {process.env.NEXT_PUBLIC_AGENT_PROVIDER_URL || 'undefined'}</div>
            <div>NEXT_PUBLIC_ENV: {process.env.NEXT_PUBLIC_ENV || 'undefined'}</div>
            <div>NEXT_PUBLIC_DEBUG: {process.env.NEXT_PUBLIC_DEBUG || 'undefined'}</div>
          </div>
        </div>

        {/* Status Check */}
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Security Status</h2>
          <div className="space-y-2">
            {config.api.mcpProvider.includes('localhost') && (
              <div className="text-red-600 font-semibold">❌ WARNING: Using localhost for MCP Provider!</div>
            )}
            {config.api.aiProvider.includes('localhost') && (
              <div className="text-red-600 font-semibold">❌ WARNING: Using localhost for AI Provider!</div>
            )}
            {config.api.agentProvider.includes('localhost') && (
              <div className="text-red-600 font-semibold">❌ WARNING: Using localhost for Agent Provider!</div>
            )}
            {!config.api.mcpProvider.includes('localhost') &&
             !config.api.aiProvider.includes('localhost') &&
             !config.api.agentProvider.includes('localhost') && (
              <div className="text-green-600 font-semibold">✅ All APIs using production URLs!</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
