# Nginx Reverse Proxy

Nginx reverse proxy configuration for Agent Automation system in Docker Compose environment.

## 🏗️ Architecture

This Nginx configuration serves as a single entry point for all microservices:

```
Client → Nginx (Port 80) → Backend Services
                         ├── Frontend (3000)
                         ├── Agent Provider (8081)
                         ├── AI Provider (8082)
                         └── MCP Provider (8083)
```

## 🔧 Configuration Overview

### Services Routing
- **Frontend**: `/` → `frontend:3000`
- **Agent Provider**: `/agent-provider/` → `agent-provider:8081`
- **AI Provider**: `/ai-provider/` → `ai-provider:8082`
- **MCP Provider**: `/mcp-provider/` → `mcp-provider:8083`
- **Health Check**: `/health` → Direct nginx response

### Security Features
- **Rate Limiting**: 
  - API endpoints: 100 requests/minute
  - Frontend: 300 requests/minute
- **Security Headers**: XSS, CSRF, Content-Type protection
- **CORS**: Cross-origin request handling

### Performance Features
- **Gzip Compression**: Text, CSS, JS, JSON compression
- **Caching**: Static file caching
- **Keep-Alive**: Connection reuse
- **Load Balancing**: Ready for multiple instances

## 🚀 Usage

### Docker Compose
This configuration is automatically used when running:
```bash
docker-compose up
```

### Access Points
- **Main Application**: http://localhost
- **Health Check**: http://localhost/health
- **Agent API**: http://localhost/agent-provider/api/
- **AI API**: http://localhost/ai-provider/api/
- **MCP API**: http://localhost/mcp-provider/api/

## 🔐 SSL Configuration

### Setup HTTPS (Optional)
1. Place SSL certificates in `ssl/` directory:
   ```
   ssl/
   ├── cert.pem
   └── key.pem
   ```

2. Uncomment HTTPS server block in `nginx.conf`

3. Restart nginx container:
   ```bash
   docker-compose restart nginx
   ```

### Self-Signed Certificate (Development)
```bash
# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem \
  -out ssl/cert.pem \
  -subj "/C=TR/ST=Istanbul/L=Istanbul/O=Agent-Automation/CN=localhost"
```

## 📊 Monitoring

### Log Access
```bash
# Access logs
docker-compose logs nginx

# Real-time monitoring
docker-compose logs -f nginx

# Nginx access logs
docker exec nginx-proxy tail -f /var/log/nginx/access.log

# Nginx error logs
docker exec nginx-proxy tail -f /var/log/nginx/error.log
```

### Health Checking
```bash
# Check nginx status
curl http://localhost/health

# Test all endpoints
curl http://localhost/agent-provider/actuator/health
curl http://localhost/ai-provider/actuator/health
curl http://localhost/mcp-provider/actuator/health
```

## 🛠️ Configuration Details

### Rate Limiting
- **API Zone**: 10MB memory, 100 requests/minute
- **Frontend Zone**: 10MB memory, 300 requests/minute
- **Burst**: Allows temporary spikes (20-50 requests)

### Timeouts
- **Connect**: 30-60 seconds
- **Send**: 30-60 seconds  
- **Read**: 30-60 seconds

### Body Size
- **Max Upload**: 50MB
- **Suitable for**: File uploads, large API requests

## 🔄 Load Balancing

### Multiple Instances
To add load balancing for multiple instances:

```nginx
upstream frontend {
    server frontend-1:3000;
    server frontend-2:3000;
    server frontend-3:3000;
}

upstream ai-provider {
    server ai-provider-1:8082;
    server ai-provider-2:8082;
}
```

### Health Checks
Built-in upstream health checking:
```nginx
upstream backend {
    server backend1:8080 max_fails=3 fail_timeout=30s;
    server backend2:8080 max_fails=3 fail_timeout=30s;
}
```

## 🐛 Troubleshooting

### Common Issues

1. **502 Bad Gateway**
   ```bash
   # Check if backend services are running
   docker-compose ps
   
   # Check nginx error logs
   docker-compose logs nginx
   ```

2. **Rate Limiting (429 Too Many Requests)**
   ```bash
   # Adjust rate limits in nginx.conf
   limit_req_zone $binary_remote_addr zone=api:10m rate=200r/m;
   ```

3. **SSL Certificate Issues**
   ```bash
   # Check certificate validity
   openssl x509 -in ssl/cert.pem -text -noout
   
   # Test SSL connection
   openssl s_client -connect localhost:443
   ```

4. **Upstream Connection Errors**
   ```bash
   # Check network connectivity
   docker exec nginx-proxy nslookup frontend
   docker exec nginx-proxy nslookup ai-provider
   ```

### Debug Mode
Enable debug logging in `nginx.conf`:
```nginx
error_log /var/log/nginx/error.log debug;
```

## 📝 Customization

### Adding New Service
1. Add upstream definition:
   ```nginx
   upstream new-service {
       server new-service:8084;
   }
   ```

2. Add location block:
   ```nginx
   location /new-service/ {
       limit_req zone=api burst=20 nodelay;
       proxy_pass http://new-service/new-service/;
       # ... proxy headers ...
   }
   ```

3. Restart nginx:
   ```bash
   docker-compose restart nginx
   ```

### Custom Headers
Add custom headers in server block:
```nginx
add_header X-Custom-Header "Agent-Automation" always;
add_header X-Version "1.0.0" always;
```

## 🌐 Production Considerations

### Performance Tuning
- **Worker Processes**: Set to CPU core count
- **Worker Connections**: Increase for high traffic
- **Keepalive Timeout**: Optimize for connection reuse

### Security Hardening
- **Hide Nginx Version**: `server_tokens off;`
- **Limit Methods**: Only allow GET, POST, PUT, DELETE
- **IP Whitelisting**: Restrict admin endpoints

### Monitoring Integration
- **Access Log Format**: JSON format for log aggregation
- **Health Check Endpoint**: Custom health endpoint
- **Metrics Export**: Prometheus nginx exporter

## 📄 Files Structure

```
docker/nginx/
├── README.md          # This documentation
├── nginx.conf         # Main configuration
└── ssl/              # SSL certificates (optional)
    ├── cert.pem
    └── key.pem
```

## 🤝 Development

This configuration is optimized for:
- **Local Development**: Easy service access via single port
- **Team Collaboration**: Consistent development environment
- **Integration Testing**: All services behind single proxy
- **Production Simulation**: Similar to production setup 