@echo off
setlocal enabledelayedexpansion

:: Docker Compose helper script for Windows

:: Function to display help message
:show_help
  echo Usage: docker-compose.bat [OPTION]
  echo Helper script for Docker Compose operations.
  echo.
  echo Options:
  echo   up          Start all services in development mode
  echo   down        Stop all services
  echo   build       Rebuild all services
  echo   prod        Start all services in production mode
  echo   prod-down   Stop production services
  echo   logs        View logs from all services
  echo   restart     Restart all services
  echo   clean       Remove all containers, volumes, and images
  echo   help        Display this help message
  echo.
  goto :eof

:: Check if Docker is running
docker info > nul 2>&1
if %ERRORLEVEL% neq 0 (
  echo Error: Docker is not running. Please start Docker and try again.
  exit /b 1
)

:: Process command line arguments
if "%1"=="" goto show_help

if "%1"=="up" (
  echo Starting services in development mode...
  docker-compose up -d
  goto :eof
)

if "%1"=="down" (
  echo Stopping services...
  docker-compose down
  goto :eof
)

if "%1"=="build" (
  echo Rebuilding services...
  docker-compose build --no-cache
  docker-compose up -d
  goto :eof
)

if "%1"=="prod" (
  echo Starting services in production mode...
  docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
  goto :eof
)

if "%1"=="prod-down" (
  echo Stopping production services...
  docker-compose -f docker-compose.yml -f docker-compose.prod.yml down
  goto :eof
)

if "%1"=="logs" (
  echo Viewing logs...
  docker-compose logs -f
  goto :eof
)

if "%1"=="restart" (
  echo Restarting services...
  docker-compose restart
  goto :eof
)

if "%1"=="clean" (
  echo Removing all containers, volumes, and images...
  docker-compose down -v
  docker system prune -af --volumes
  goto :eof
)

if "%1"=="help" (
  call :show_help
  goto :eof
)

call :show_help
exit /b 1