#!/bin/bash

# Script to start Docker containers for the bot project
# Redis + PostgreSQL + Bot

echo "🚀 Starting Docker containers..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/engine/install/"
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed."
    exit 1
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down 2>/dev/null || docker compose down 2>/dev/null || true

# Start containers
echo "📦 Starting Redis and PostgreSQL..."
docker-compose up -d postgres redis

# Wait for databases to be ready
echo "⏳ Waiting for databases to be ready..."
sleep 5

# Check if containers are running
if docker ps | grep -q "bot-postgres" && docker ps | grep -q "bot-redis"; then
    echo "✅ Redis and PostgreSQL are running!"
    echo ""
    echo "📊 Container Status:"
    docker ps --filter "name=bot-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    echo "🔗 Connection Info:"
    echo "  PostgreSQL: localhost:5432 (inside Docker network: bot-postgres:5432)"
    echo "  Redis: localhost:6379 (inside Docker network: bot-redis:6379)"
    echo ""
    echo "💡 Next Steps:"
    echo "  1. To start the bot in Docker: docker-compose up -d bot"
    echo "  2. To view logs: docker-compose logs -f"
    echo "  3. To stop all: docker-compose down"
else
    echo "❌ Failed to start containers. Check Docker logs:"
    docker-compose logs
    exit 1
fi
