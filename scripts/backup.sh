#!/bin/bash

# Database backup script for Agent Automation
set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="mcp_db_backup_$TIMESTAMP.sql"

echo "💾 Starting database backup..."

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Load environment variables
if [ -f ".env" ]; then
    source .env
else
    echo "❌ .env file not found!"
    exit 1
fi

# Check if database container is running
if ! docker-compose ps postgres | grep -q "Up"; then
    echo "❌ PostgreSQL container is not running!"
    exit 1
fi

echo "📤 Creating database backup..."

# Create backup
docker-compose exec postgres pg_dump -U postgres -d mcp_db > "$BACKUP_DIR/$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Backup created successfully: $BACKUP_DIR/$BACKUP_FILE"
    
    # Compress backup
    gzip "$BACKUP_DIR/$BACKUP_FILE"
    echo "📦 Backup compressed: $BACKUP_DIR/$BACKUP_FILE.gz"
    
    # Keep only last 10 backups
    cd $BACKUP_DIR
    ls -t *.gz | tail -n +11 | xargs -I {} rm -- {}
    echo "🧹 Old backups cleaned up (keeping last 10)"
    
    echo "📊 Current backups:"
    ls -lh *.gz
else
    echo "❌ Backup failed!"
    exit 1
fi

echo "✅ Backup process completed!" 