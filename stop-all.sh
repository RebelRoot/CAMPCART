#!/bin/zsh

# CampCart All-in-One Stop Script
export PATH=$PATH:/usr/local/bin

echo "🛑 Stopping CampCart Ecosystem..."

# 1. Stop PM2 processes
npx pm2 stop ecosystem.config.js

# 2. Stop Docker containers
echo "🗄️ Stopping Database..."
docker-compose -f ferretdb-docker-compose.yml stop

echo "✅ Everything stopped!"
