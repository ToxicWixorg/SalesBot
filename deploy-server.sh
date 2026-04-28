#!/bin/bash

# Quick setup script for server deployment
# This script prepares and starts the bot project with Docker

set -e

echo "🚀 Bot Deployment Script"
echo "========================"

# Check Docker installation
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo "✅ Docker installed. Please logout and login again, then run this script."
    exit 0
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production file not found!"
    echo "Please create .env.production with your bot token and configurations."
    exit 1
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Pull latest images
echo "📦 Pulling latest images..."
docker-compose pull postgres redis

# Start services
echo "🚀 Starting services..."
docker-compose up -d

# Wait for services
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check status
if docker ps | grep -q "bot-bot"; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "📊 Running containers:"
    docker ps --filter "name=bot-" --format "table {{.Names}}\t{{.Status}}"
    echo ""
    echo "📝 View logs: docker-compose logs -f"
    echo "🛑 Stop all: docker-compose down"
    echo ""
else
    echo "❌ Deployment failed. Checking logs..."
    docker-compose logs
    exit 1
fi
