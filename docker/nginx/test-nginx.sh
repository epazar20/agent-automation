#!/bin/bash

# Nginx Configuration Test Script
echo "🧪 Testing Nginx Configuration..."

# Test nginx config syntax
echo "📝 Testing nginx.conf syntax:"
docker run --rm -v "$(pwd)/docker/nginx/nginx.conf:/etc/nginx/nginx.conf:ro" nginx:alpine nginx -t

echo ""
echo "🚀 Quick Start Commands:"
echo "  docker-compose up nginx                     # Start only nginx"
echo "  docker-compose up                           # Start all services"
echo "  curl http://localhost/health                # Test nginx health"
echo "  docker-compose logs nginx                   # View nginx logs"

echo ""
echo "📊 Monitoring URLs (when running):"
echo "  http://localhost                            # Frontend"
echo "  http://localhost/health                     # Nginx health"
echo "  http://localhost/nginx-status               # Nginx stats (local only)"
echo "  http://localhost/agent-provider/actuator/health"
echo "  http://localhost/ai-provider/actuator/health"  
echo "  http://localhost/mcp-provider/actuator/health"

echo ""
echo "✅ Nginx configuration test completed!"
