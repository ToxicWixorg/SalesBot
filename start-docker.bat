@echo off
REM Script to start Docker containers for the bot project
REM Redis + PostgreSQL + Bot

echo 🚀 Starting Docker containers...

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    echo Visit: https://docs.docker.com/desktop/install/windows-install/
    pause
    exit /b 1
)

REM Stop any existing containers
echo 🛑 Stopping existing containers...
docker-compose down 2>nul

REM Start containers
echo 📦 Starting Redis and PostgreSQL...
docker-compose up -d postgres redis

REM Wait for databases to be ready
echo ⏳ Waiting for databases to be ready...
timeout /t 5 /nobreak >nul

REM Check if containers are running
docker ps | findstr "bot-postgres" >nul 2>&1
set POSTGRES_RUNNING=%errorlevel%

docker ps | findstr "bot-redis" >nul 2>&1
set REDIS_RUNNING=%errorlevel%

if %POSTGRES_RUNNING%==0 if %REDIS_RUNNING%==0 (
    echo ✅ Redis and PostgreSQL are running!
    echo.
    echo 📊 Container Status:
    docker ps --filter "name=bot-"
    echo.
    echo 🔗 Connection Info:
    echo   PostgreSQL: localhost:5432 ^(inside Docker network: bot-postgres:5432^)
    echo   Redis: localhost:6379 ^(inside Docker network: bot-redis:6379^)
    echo.
    echo 💡 Next Steps:
    echo   1. To start the bot in Docker: docker-compose up -d bot
    echo   2. To view logs: docker-compose logs -f
    echo   3. To stop all: docker-compose down
) else (
    echo ❌ Failed to start containers. Check Docker logs:
    docker-compose logs
    exit /b 1
)

pause
