#!/bin/bash

# System monitoring script for Agent Automation
set -e

echo "📊 Agent Automation System Monitor"
echo "=================================="

# Check Docker Compose status
echo "🐳 Docker Compose Status:"
docker-compose ps

echo ""
echo "💾 System Resources:"
echo "CPU Usage: $(top -l 1 | grep "CPU usage" | cut -d':' -f2 | cut -d'%' -f1 | tr -d ' ')%"
echo "Memory: $(top -l 1 | grep PhysMem | cut -d':' -f2 | tr -d ' ')"
echo "Disk: $(df -h / | tail -1 | awk '{print $5}') used"

echo ""
echo "🔍 Service Health Checks:"

# Function to check service health
check_service_health() {
    local service_name=$1
    local url=$2
    
    if curl -f -s "$url" > /dev/null 2>&1; then
        echo "✅ $service_name: Healthy"
    else
        echo "❌ $service_name: Unhealthy"
    fi
}

check_service_health "Frontend" "http://localhost:3000/api/health"
check_service_health "AI Provider" "http://localhost:8082/ai-provider/actuator/health"
check_service_health "Agent Provider" "http://localhost:8081/agent-provider/actuator/health"
check_service_health "MCP Provider" "http://localhost:8083/mcp-provider/actuator/health"
check_service_health "Nginx" "http://localhost/health"
check_service_health "Database" "http://localhost:5432"

echo ""
echo "📈 Container Stats:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"

echo ""
echo "📝 Recent Logs (last 10 lines):"
echo "================================="
services=("ai-provider" "agent-provider" "mcp-provider" "frontend")
for service in "${services[@]}"; do
    echo "--- $service ---"
    docker-compose logs --tail=5 $service | head -5
    echo ""
done

echo "🔄 Auto-refresh in 30 seconds... (Ctrl+C to stop)"
sleep 30
exec "$0" "$@" 