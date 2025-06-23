#!/bin/bash

# Security Setup Script for Agent Automation Project
# This script implements the security incident response plan

set -e

echo "🔒 Starting Security Setup for Agent Automation Project"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if running from project root
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ Error: Please run this script from the project root directory${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Phase 1: Environment Setup${NC}"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Creating .env file from template...${NC}"
    cp env.example .env
    echo -e "${GREEN}✅ .env file created. Please edit it with your actual credentials.${NC}"
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

# Create secrets files from examples
echo -e "${BLUE}📋 Phase 2: Creating Secrets Files${NC}"

services=("ai-provider" "agent-provider" "mcp-provider")
for service in "${services[@]}"; do
    secrets_file="$service/src/main/resources/application-secrets.properties"
    example_file="$service/src/main/resources/application-secrets.properties.example"
    
    if [ ! -f "$secrets_file" ]; then
        if [ -f "$example_file" ]; then
            cp "$example_file" "$secrets_file"
            echo -e "${GREEN}✅ Created $secrets_file${NC}"
        else
            echo -e "${YELLOW}⚠️  Example file not found: $example_file${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  $secrets_file already exists${NC}"
    fi
done

echo -e "${BLUE}📋 Phase 3: Pre-commit Hooks Setup${NC}"

# Check if pre-commit is installed
if command -v pre-commit &> /dev/null; then
    echo -e "${GREEN}✅ pre-commit is installed${NC}"
    
    # Install pre-commit hooks
    pre-commit install
    echo -e "${GREEN}✅ Pre-commit hooks installed${NC}"
    
    # Generate secrets baseline
    if [ ! -f ".secrets.baseline" ]; then
        pre-commit run detect-secrets --all-files || true
        echo -e "${GREEN}✅ Secrets baseline generated${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  pre-commit not installed. Installing...${NC}"
    
    # Try to install pre-commit
    if command -v pip &> /dev/null; then
        pip install pre-commit
        pre-commit install
        echo -e "${GREEN}✅ pre-commit installed and configured${NC}"
    elif command -v pip3 &> /dev/null; then
        pip3 install pre-commit
        pre-commit install
        echo -e "${GREEN}✅ pre-commit installed and configured${NC}"
    else
        echo -e "${RED}❌ Cannot install pre-commit. Please install Python and pip first.${NC}"
        echo "Visit: https://pre-commit.com/#installation"
    fi
fi

echo -e "${BLUE}📋 Phase 4: Security Validation${NC}"

# Check for any remaining secrets
echo -e "${YELLOW}🔍 Scanning for potential secrets...${NC}"

# Check if any secrets files contain real values
secrets_found=false

for service in "${services[@]}"; do
    secrets_file="$service/src/main/resources/application-secrets.properties"
    if [ -f "$secrets_file" ]; then
        if grep -q "your_.*_here" "$secrets_file"; then
            echo -e "${GREEN}✅ $service: Template values detected (good)${NC}"
        else
            echo -e "${RED}❌ $service: Potential real values detected - please review!${NC}"
            secrets_found=true
        fi
    fi
done

# Check .env file
if [ -f ".env" ]; then
    if grep -q "your_.*_here" ".env"; then
        echo -e "${GREEN}✅ .env: Template values detected (good)${NC}"
    else
        echo -e "${YELLOW}⚠️  .env: Real values detected - this is expected for local development${NC}"
    fi
fi

echo -e "${BLUE}📋 Phase 5: Development Guidelines${NC}"

echo -e "${GREEN}📚 Security Guidelines:${NC}"
echo "1. Never commit files with real API keys"
echo "2. Always use placeholder values ending with '_here' in example files"
echo "3. Keep .env file for local development only"
echo "4. Use environment variables in production (Fly.io secrets)"
echo "5. Run 'pre-commit run --all-files' before committing"

echo -e "${BLUE}📋 Phase 6: Next Steps${NC}"

echo -e "${YELLOW}🔄 TODO - Manual Steps Required:${NC}"
echo "1. Edit .env file with your actual API keys"
echo "2. Edit each service's application-secrets.properties with real values"
echo "3. Rotate all exposed API keys:"
echo "   - HuggingFace: https://huggingface.co/settings/tokens"
echo "   - RapidAPI: https://rapidapi.com/dashboard"
echo "   - DeepL: https://www.deepl.com/account/usage"
echo "   - Stability AI: https://platform.stability.ai/account/keys"
echo "   - Supabase: Change database password"
echo "   - Gmail: Generate new app password"
echo "4. Update production secrets (fly secrets set)"
echo "5. Test all services locally and in production"

echo -e "${GREEN}🎉 Security setup completed!${NC}"

if [ "$secrets_found" = true ]; then
    echo -e "${RED}⚠️  WARNING: Potential secrets detected. Please review before committing!${NC}"
    exit 1
else
    echo -e "${GREEN}✅ No obvious secrets detected. Good to go!${NC}"
fi 