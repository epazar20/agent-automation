/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  compress: true,

  // Environment variables - force production URLs when deploying
  env: {
    NEXT_PUBLIC_AI_PROVIDER_URL: process.env.NODE_ENV === 'production'
      ? 'https://agent-automation-ai-provider.fly.dev/ai-provider'
      : process.env.NEXT_PUBLIC_AI_PROVIDER_URL || 'http://localhost:8082/ai-provider',
    NEXT_PUBLIC_AGENT_PROVIDER_URL: process.env.NODE_ENV === 'production'
      ? 'https://agent-automation-agent-provider.fly.dev/agent-provider'
      : process.env.NEXT_PUBLIC_AGENT_PROVIDER_URL || 'http://localhost:8081/agent-provider',
    NEXT_PUBLIC_MCP_PROVIDER_URL: process.env.NODE_ENV === 'production'
      ? 'https://agent-automation-mcp-provider.fly.dev/mcp-provider'
      : process.env.NEXT_PUBLIC_MCP_PROVIDER_URL || 'http://localhost:8083/mcp-provider',
    NEXT_PUBLIC_ENV: 'production',
    NEXT_PUBLIC_DEBUG: 'false',
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  },

  reactStrictMode: true,

  // Remove localhost proxy in production
  async rewrites() {
    if (process.env.NODE_ENV === 'production') {
      return [];
    }
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8081/:path*',
      },
    ];
  },
};

export default nextConfig;
