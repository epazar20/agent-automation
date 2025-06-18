# Environment Configuration Guide

This guide explains how to configure environment variables for different deployment environments.

## 📁 File Structure

```
frontend/
├── .env.example          # Template with all available variables
├── .env.local           # Local development (git-ignored)
├── .env.development     # Development environment (git-ignored)
├── .env.staging         # Staging environment (git-ignored)
├── .env.production      # Production environment (git-ignored)
└── src/config/env.ts    # Environment configuration utility
```

## 🔧 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_MCP_PROVIDER_URL` | MCP Provider API base URL | `http://localhost:8083/mcp-provider` |
| `NEXT_PUBLIC_AI_PROVIDER_URL` | AI Provider API base URL | `http://localhost:8082/ai-provider` |
| `NEXT_PUBLIC_AGENT_PROVIDER_URL` | Agent Provider API base URL | `http://localhost:8081/agent-provider` |

### Optional Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `NEXT_PUBLIC_ENV` | Environment type | `development` | `production` |
| `NEXT_PUBLIC_DEBUG` | Enable debug logging | `true` | `false` |
| `NEXT_PUBLIC_API_TIMEOUT` | API request timeout (ms) | `30000` | `60000` |

## 🚀 Setup Instructions

### 1. Local Development

```bash
# Copy the example file
cp .env.example .env.local

# Edit with your local configuration
vim .env.local
```

**Example `.env.local`:**
```env
NEXT_PUBLIC_MCP_PROVIDER_URL=http://localhost:8083/mcp-provider
NEXT_PUBLIC_AI_PROVIDER_URL=http://localhost:8082/ai-provider
NEXT_PUBLIC_AGENT_PROVIDER_URL=http://localhost:8081/agent-provider
NEXT_PUBLIC_ENV=development
NEXT_PUBLIC_DEBUG=true
NEXT_PUBLIC_API_TIMEOUT=30000
```

### 2. Docker Development

```bash
# Create docker-compose override
cp .env.example .env.development
```

**Example `.env.development`:**
```env
NEXT_PUBLIC_MCP_PROVIDER_URL=http://mcp-provider:8083/mcp-provider
NEXT_PUBLIC_AI_PROVIDER_URL=http://ai-provider:8082/ai-provider
NEXT_PUBLIC_AGENT_PROVIDER_URL=http://agent-provider:8081/agent-provider
NEXT_PUBLIC_ENV=development
NEXT_PUBLIC_DEBUG=true
NEXT_PUBLIC_API_TIMEOUT=45000
```

### 3. Production Deployment

**Example `.env.production`:**
```env
NEXT_PUBLIC_MCP_PROVIDER_URL=https://api.yourdomain.com/mcp-provider
NEXT_PUBLIC_AI_PROVIDER_URL=https://api.yourdomain.com/ai-provider
NEXT_PUBLIC_AGENT_PROVIDER_URL=https://api.yourdomain.com/agent-provider
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_DEBUG=false
NEXT_PUBLIC_API_TIMEOUT=60000
```

## 🏗️ Configuration Utility

The `src/config/env.ts` file provides:

- **Type-safe configuration**: TypeScript interfaces for all config options
- **Validation**: Automatic URL validation on app startup
- **Fallbacks**: Sensible defaults for optional variables
- **Debug logging**: Configuration values logged in development
- **Centralized endpoints**: Pre-built API endpoint configurations

### Usage Example

```typescript
import { config, apiEndpoints } from '@/config/env';

// Access configuration
console.log(config.env); // 'development' | 'production' | 'test'
console.log(config.debug); // boolean
console.log(config.api.timeout); // number

// Use pre-built endpoints
const response = await fetch(apiEndpoints.mcp.workflows);
const customers = await fetch(apiEndpoints.mcp.customers);
```

## 🔒 Security Best Practices

### Development
- ✅ Use `.env.local` for local development
- ✅ Never commit environment files to git
- ✅ Use `localhost` URLs for local services

### Production
- ✅ Use HTTPS URLs in production
- ✅ Set `NEXT_PUBLIC_DEBUG=false` in production
- ✅ Use environment-specific configuration management
- ✅ Validate all URLs are accessible from your deployment network

## 🚨 Troubleshooting

### Common Issues

#### 1. "Invalid API URL" Error
- Check URL format (must be valid URLs)
- Ensure no trailing slashes in environment variables
- Verify the service is running on the specified port

#### 2. CORS Errors
- Ensure backend services have CORS configured for your frontend domain
- Check if URLs are accessible from browser/deployment environment

#### 3. Timeout Errors
- Increase `NEXT_PUBLIC_API_TIMEOUT` value
- Check network connectivity to backend services
- Verify backend services are responding

### Debug Environment Configuration

Add this to any component to debug configuration:

```typescript
import { config } from '@/config/env';

console.log('Environment Configuration:', {
  env: config.env,
  debug: config.debug,
  api: config.api,
});
```

## 🔄 Migration from Hardcoded URLs

If migrating from hardcoded URLs:

1. **Identify all hardcoded URLs** in your codebase
2. **Replace with environment configuration**:
   ```typescript
   // Before
   const response = await fetch('http://localhost:8083/mcp-provider/api/workflows');
   
   // After
   import { apiEndpoints } from '@/config/env';
   const response = await fetch(apiEndpoints.mcp.workflows);
   ```
3. **Update CI/CD pipelines** to set appropriate environment variables
4. **Test in all environments** (development, staging, production)

## 📦 Deployment Examples

### Vercel
```bash
# Set environment variables in Vercel dashboard or CLI
vercel env add NEXT_PUBLIC_MCP_PROVIDER_URL production
vercel env add NEXT_PUBLIC_AI_PROVIDER_URL production
vercel env add NEXT_PUBLIC_AGENT_PROVIDER_URL production
```

### Docker
```dockerfile
ENV NEXT_PUBLIC_MCP_PROVIDER_URL=https://api.yourdomain.com/mcp-provider
ENV NEXT_PUBLIC_AI_PROVIDER_URL=https://api.yourdomain.com/ai-provider
ENV NEXT_PUBLIC_AGENT_PROVIDER_URL=https://api.yourdomain.com/agent-provider
ENV NEXT_PUBLIC_ENV=production
ENV NEXT_PUBLIC_DEBUG=false
```

### Kubernetes
```yaml
env:
  - name: NEXT_PUBLIC_MCP_PROVIDER_URL
    value: "https://api.yourdomain.com/mcp-provider"
  - name: NEXT_PUBLIC_AI_PROVIDER_URL
    value: "https://api.yourdomain.com/ai-provider"
  - name: NEXT_PUBLIC_AGENT_PROVIDER_URL
    value: "https://api.yourdomain.com/agent-provider"
  - name: NEXT_PUBLIC_ENV
    value: "production"
  - name: NEXT_PUBLIC_DEBUG
    value: "false"
``` 