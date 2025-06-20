/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  
  // Environment variables for Docker
  env: {
    NEXT_PUBLIC_AI_PROVIDER_URL: process.env.NEXT_PUBLIC_AI_PROVIDER_URL,
    NEXT_PUBLIC_AGENT_PROVIDER_URL: process.env.NEXT_PUBLIC_AGENT_PROVIDER_URL,
    NEXT_PUBLIC_MCP_PROVIDER_URL: process.env.NEXT_PUBLIC_MCP_PROVIDER_URL,
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
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8081/:path*',
      },
    ];
  },
};

export default nextConfig;
