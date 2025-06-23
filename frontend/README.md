# Frontend - Agent Automation UI

Modern Next.js frontend application providing user interface for the Agent Automation system.

## 🏗️ Architecture

This frontend application provides:
- **Chat Interface** - Interactive AI chat functionality
- **Agent Dashboard** - Monitor and control agent operations
- **Analytics** - View performance metrics and insights
- **Configuration** - Manage system settings

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or later
- npm, yarn, or pnpm
- Backend services running (ports 8081, 8082, 8083)

### Installation
```bash
# Install dependencies
npm install
# or
yarn install
# or
pnpm install
```

### Running Locally
```bash
# Development server
npm run dev
# or
yarn dev
# or
pnpm dev

# Production build
npm run build
npm start
```

### Health Check
```bash
curl http://localhost:3000/api/health
```

## 📊 Features

### Core Functionality
- **Real-time Chat** - Interactive conversation with AI agents
- **Dashboard** - Monitor system health and performance
- **File Upload** - Support for document processing
- **Export/Import** - Data management capabilities

### User Interface
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Dark/Light Mode** - Theme switching support
- **Accessibility** - WCAG compliant interface
- **Modern UI** - Tailwind CSS with Shadcn/ui components

## 🔧 Configuration

### Environment Variables
Create `.env.local` file for local development:
```bash
# Backend service URLs
NEXT_PUBLIC_AGENT_PROVIDER_URL=http://localhost:8081
NEXT_PUBLIC_AI_PROVIDER_URL=http://localhost:8082
NEXT_PUBLIC_MCP_PROVIDER_URL=http://localhost:8083

# Application settings
NEXT_PUBLIC_APP_NAME=Agent Automation
NEXT_PUBLIC_APP_VERSION=1.0.0

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

### Service Dependencies
- **Agent Provider**: `http://localhost:8081` - Main orchestration service
- **AI Provider**: `http://localhost:8082` - AI processing service
- **MCP Provider**: `http://localhost:8083` - Data management service

## 📱 Pages & Routes

### Main Pages
- `/` - Home page with overview
- `/chat` - Interactive chat interface
- `/dashboard` - System monitoring dashboard
- `/analytics` - Performance metrics
- `/settings` - Configuration management

### API Routes
- `/api/health` - Application health check
- `/api/chat` - Chat endpoint proxy
- `/api/upload` - File upload handling

## 🎨 Tech Stack

### Framework & Core
- **Next.js 15** - React framework with App Router
- **React 18** - User interface library
- **TypeScript** - Type-safe JavaScript

### Styling & UI
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Modern component library
- **Lucide Icons** - Beautiful icon set

### State Management & Data
- **React Query** - Server state management
- **Zustand** - Client state management
- **React Hook Form** - Form handling

## 🐳 Docker

### Build Image
```bash
docker build -t frontend .
```

### Run Container
```bash
docker run -p 3000:3000 frontend
```

## 📝 Development

### Code Quality
```bash
# Linting
npm run lint

# Type checking
npm run type-check

# Format code
npm run format
```

### Testing
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

### Build & Deploy
```bash
# Production build
npm run build

# Start production server
npm start

# Export static site
npm run export
```

## 🔄 Service Integration

This frontend integrates with:

1. **Agent Provider** - Main service orchestration
2. **AI Provider** - AI chat and processing
3. **MCP Provider** - Data retrieval and management

### API Communication
- RESTful APIs for data operations
- WebSocket for real-time chat
- Error handling and retry logic
- Request/response logging

## 📋 Monitoring & Analytics

### Performance Monitoring
- Core Web Vitals tracking
- Real User Monitoring (RUM)
- Error boundary implementation
- Performance metrics dashboard

### User Analytics
- Page view tracking
- User interaction events
- Conversion funnel analysis
- A/B testing support

## 🚀 Deployment

### Fly.io Deployment
```bash
# Deploy to production
fly deploy

# Check deployment status
fly status

# View logs
fly logs
```

### Environment Variables (Production)
Set via Fly.io secrets:
```bash
fly secrets set NEXT_PUBLIC_AGENT_PROVIDER_URL=https://your-agent-provider.fly.dev
fly secrets set NEXT_PUBLIC_AI_PROVIDER_URL=https://your-ai-provider.fly.dev
fly secrets set NEXT_PUBLIC_MCP_PROVIDER_URL=https://your-mcp-provider.fly.dev
```

### CDN & Performance
- Automatic static optimization
- Image optimization with Next.js
- Code splitting and lazy loading
- Progressive Web App (PWA) features

## 🛠️ Troubleshooting

### Common Issues

1. **Backend Connection**
   - Verify backend services are running
   - Check service URLs in environment variables
   - Confirm CORS settings

2. **Build Errors**
   - Clear `.next` directory: `rm -rf .next`
   - Delete node_modules: `rm -rf node_modules && npm install`
   - Check TypeScript errors: `npm run type-check`

3. **Performance Issues**
   - Enable React DevTools Profiler
   - Check Network tab for slow requests
   - Monitor Core Web Vitals

### Debug Mode
Enable debug logging:
```bash
export DEBUG=*
npm run dev
```

## 📚 Documentation

For detailed development information, see the `docs/` directory (local only):
- Component documentation
- API integration guides
- Styling guidelines
- Testing strategies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Run quality checks
5. Submit pull request

### Development Guidelines
- Follow TypeScript best practices
- Write unit tests for components
- Use conventional commit messages
- Follow component naming conventions

## 📄 License

[License information here] 