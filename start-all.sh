#!/bin/zsh

# CampCart All-in-One Startup Script
# This script starts Docker, the Database, API, Client, Chat, and Tunnel.

# Ensure /usr/local/bin is in PATH for docker, npm, etc.
export PATH=$PATH:/usr/local/bin

echo "🚀 Starting CampCart Ecosystem..."

# 1. Start Docker Desktop if not running (macOS)
if ! docker ps >/dev/null 2>&1; then
    echo "🐳 Starting Docker Desktop..."
    open -a Docker
    echo "⏳ Waiting for Docker to be ready..."
    while ! docker ps >/dev/null 2>&1; do
        sleep 2
    done
fi

# 2. Start FerretDB/PostgreSQL
echo "🗄️  Starting Database (FerretDB)..."
docker-compose -f ferretdb-docker-compose.yml up -d

# 3. Kill any processes currently occupying our ports (to prevent EADDRINUSE)
echo "🧹 Cleaning up ports (8800, 5173, 8801)..."
lsof -ti :8800,5173,8801 | xargs kill -9 2>/dev/null || true

# 4. Start all services via PM2
echo "📦 Launching Services via PM2..."
npx pm2 start ecosystem.config.js --update-env

echo "✅ All services are starting up!"
echo "------------------------------------------------"
npx pm2 status
echo "------------------------------------------------"
echo "🌐 Access your site at: https://campcart.online"
echo "📝 View logs with: npx pm2 logs"
echo "🛑 Stop everything with: npx pm2 stop all && docker-compose -f ferretdb-docker-compose.yml stop"
