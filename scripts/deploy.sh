#!/bin/bash

# Production deployment script for Agent Automation system
set -e

echo "🚀 Starting deployment of Agent Automation system..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found! Please copy .env.example to .env and configure it."
    exit 1
fi

# Load environment variables
source .env

# Validate required environment variables
required_vars=("DB_PASSWORD" "HUGGINGFACE_API_KEY" "RAPIDAPI_YOUTUBE_KEY" "DEEPL_API_KEY" "STABILITY_AI_KEY")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Required environment variable $var is not set!"
        exit 1
    fi
done

echo "✅ Environment variables validated"

# Create necessary directories
mkdir -p nginx/ssl
mkdir -p init-scripts
mkdir -p logs

# Stop existing containers if running
echo "🛑 Stopping existing containers..."
docker-compose down --remove-orphans

# Remove old images (optional, uncomment if needed)
# echo "🗑️  Removing old images..."
# docker-compose down --rmi all

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up --build -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Check service health
services=("postgres" "ai-provider" "agent-provider" "mcp-provider" "frontend")
for service in "${services[@]}"; do
    echo "🔍 Checking $service health..."
    if docker-compose ps $service | grep -q "healthy\|Up"; then
        echo "✅ $service is running"
    else
        echo "❌ $service is not healthy"
        docker-compose logs $service
        exit 1
    fi
done

echo "🎉 Deployment completed successfully!"
echo ""
echo "📊 Service URLs:"
echo "   Frontend:      http://localhost:3000"
echo "   AI Provider:   http://localhost:8082/ai-provider"
echo "   Agent Provider: http://localhost:8081/agent-provider"
echo "   MCP Provider:  http://localhost:8083/mcp-provider"
echo "   Nginx Proxy:   http://localhost:80"
echo ""
echo "📝 To view logs: docker-compose logs -f [service-name]"
echo "🛑 To stop:     docker-compose down" 