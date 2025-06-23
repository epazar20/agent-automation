# Agent Provider

Agent orchestration service that coordinates between AI Provider and MCP Provider services.

## 🏗️ Architecture

This service acts as an orchestrator that:
- Receives agent requests from frontend
- Coordinates with AI Provider for intelligent processing
- Integrates with MCP Provider for data operations
- Returns processed results to clients

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Maven 3.6+
- AI Provider running on port 8082
- MCP Provider running on port 8083

### Running Locally
```bash
# Using Maven
mvn spring-boot:run

# Using IDE
Run AgentProviderApplication.java main method
```

### Health Check
```bash
curl http://localhost:8081/actuator/health
```

## 📊 API Endpoints

### Health & Status
- `GET /actuator/health` - Service health check
- `GET /api/agent/status` - Agent service status

### Core Operations
- `POST /api/agent/process` - Process agent requests
- `GET /api/agent/tasks` - Get active tasks
- `DELETE /api/agent/tasks/{id}` - Cancel task

## 🔧 Configuration

### Port Configuration
- Default port: **8081**
- Can be changed via `server.port` property

### Service Dependencies
- **AI Provider**: `http://localhost:8082`
- **MCP Provider**: `http://localhost:8083`

### Environment Variables
```bash
# Service URLs (optional, defaults to localhost)
AI_PROVIDER_URL=http://localhost:8082
MCP_PROVIDER_URL=http://localhost:8083

# Logging level
LOGGING_LEVEL_ROOT=INFO
```

## 🐳 Docker

### Build Image
```bash
docker build -t agent-provider .
```

### Run Container
```bash
docker run -p 8081:8081 agent-provider
```

## 📝 Development

### Testing
```bash
# Unit tests
mvn test

# Integration tests
mvn verify
```

### Code Quality
```bash
# Format code
mvn spotless:apply

# Check style
mvn checkstyle:check
```

## 🔄 Service Integration

This service integrates with:

1. **AI Provider** - For intelligent processing and decision making
2. **MCP Provider** - For customer and financial data operations
3. **Frontend** - Provides processed results to user interface

## 📋 Monitoring

### Health Endpoints
- `/actuator/health` - Overall health
- `/actuator/info` - Application info
- `/actuator/metrics` - Performance metrics

### Logging
- Structured logging with JSON format
- Configurable log levels per package
- Request/response tracing available

## 🚀 Deployment

### Fly.io Deployment
```bash
# Deploy to production
fly deploy

# Check status
fly status
```

### Environment Variables (Production)
Set via Fly.io secrets:
```bash
fly secrets set AI_PROVIDER_URL=https://your-ai-provider.fly.dev
fly secrets set MCP_PROVIDER_URL=https://your-mcp-provider.fly.dev
```

## 🛠️ Troubleshooting

### Common Issues

1. **Service Dependencies**
   - Ensure AI Provider and MCP Provider are running
   - Check service URLs in configuration

2. **Port Conflicts**
   - Default port 8081 might be in use
   - Change port via `server.port` property

3. **Connection Timeouts**
   - Check network connectivity to dependent services
   - Verify firewall settings

### Debug Mode
Enable debug logging:
```bash
export LOGGING_LEVEL_COM_EXAMPLE_AGENTPROVIDER=DEBUG
mvn spring-boot:run
```

## 📚 Documentation

For detailed development information, see the `docs/` directory (local only):
- Development setup guides
- API documentation
- Integration patterns
- Troubleshooting guides

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes
4. Add tests
5. Submit pull request

## 📄 License

[License information here] 