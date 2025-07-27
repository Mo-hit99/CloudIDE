@echo off
REM Cloud IDE Startup Script for Windows
REM This script helps you get started with the Docker Cloud IDE

setlocal enabledelayedexpansion

REM Set colors (if supported)
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

REM Function to print status messages
:print_status
echo %BLUE%[INFO]%NC% %~1
goto :eof

:print_success
echo %GREEN%[SUCCESS]%NC% %~1
goto :eof

:print_warning
echo %YELLOW%[WARNING]%NC% %~1
goto :eof

:print_error
echo %RED%[ERROR]%NC% %~1
goto :eof

REM Function to check if Docker is running
:check_docker
call :print_status "Checking Docker installation..."

docker --version >nul 2>&1
if errorlevel 1 (
    call :print_error "Docker is not installed. Please install Docker Desktop first."
    exit /b 1
)

docker info >nul 2>&1
if errorlevel 1 (
    call :print_error "Docker is not running. Please start Docker Desktop."
    exit /b 1
)

call :print_success "Docker is running"
goto :eof

REM Function to check if Docker Compose is available
:check_docker_compose
call :print_status "Checking Docker Compose..."

docker-compose --version >nul 2>&1
if errorlevel 1 (
    call :print_error "Docker Compose is not installed."
    exit /b 1
)

call :print_success "Docker Compose is available"
goto :eof

REM Function to setup environment
:setup_environment
call :print_status "Setting up environment..."

if not exist .env (
    call :print_status "Creating .env file from template..."
    copy .env.example .env >nul
    call :print_success "Created .env file. You can edit it to customize settings."
) else (
    call :print_warning ".env file already exists. Skipping creation."
)

REM Create workspace directories
if not exist workspace mkdir workspace
if not exist workspace\node mkdir workspace\node
if not exist workspace\python mkdir workspace\python
if not exist workspace\java mkdir workspace\java
if not exist workspace\general mkdir workspace\general

call :print_success "Created workspace directories"
goto :eof

REM Function to start services
:start_services
set mode=%~1
call :print_status "Starting Cloud IDE in %mode% mode..."

if "%mode%"=="dev" (
    docker-compose up -d
) else if "%mode%"=="development" (
    docker-compose up -d
) else if "%mode%"=="prod" (
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
) else if "%mode%"=="production" (
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
) else if "%mode%"=="full" (
    docker-compose --profile full up -d
) else (
    call :print_error "Unknown mode: %mode%"
    exit /b 1
)

call :print_success "Services started successfully!"
goto :eof

REM Function to show status
:show_status
call :print_status "Checking service status..."
docker-compose ps

echo.
call :print_status "Service URLs:"
echo   Frontend:  http://localhost:5173
echo   Backend:   http://localhost:5000
echo   MongoDB:   localhost:27017
echo.
goto :eof

REM Function to show logs
:show_logs
call :print_status "Showing service logs (Ctrl+C to exit)..."
docker-compose logs -f
goto :eof

REM Function to stop services
:stop_services
call :print_status "Stopping Cloud IDE services..."
docker-compose down
call :print_success "Services stopped"
goto :eof

REM Function to clean up
:cleanup
call :print_status "Cleaning up Docker resources..."
docker-compose down -v --remove-orphans
docker system prune -f
call :print_success "Cleanup completed"
goto :eof

REM Function to show help
:show_help
echo Cloud IDE Management Script for Windows
echo.
echo Usage: %~nx0 [COMMAND] [OPTIONS]
echo.
echo Commands:
echo   start [mode]    Start the Cloud IDE (modes: dev, prod, full)
echo   stop           Stop all services
echo   restart [mode] Restart services
echo   status         Show service status
echo   logs           Show service logs
echo   cleanup        Stop services and clean up Docker resources
echo   help           Show this help message
echo.
echo Examples:
echo   %~nx0 start dev     # Start in development mode
echo   %~nx0 start prod    # Start in production mode
echo   %~nx0 status        # Show current status
echo   %~nx0 logs          # Show logs
echo.
goto :eof

REM Main script logic
:main
set command=%~1
set mode=%~2

if "%command%"=="" set command=start
if "%mode%"=="" set mode=dev

if "%command%"=="start" (
    call :check_docker
    if errorlevel 1 exit /b 1
    call :check_docker_compose
    if errorlevel 1 exit /b 1
    call :setup_environment
    call :start_services %mode%
    call :show_status
) else if "%command%"=="stop" (
    call :stop_services
) else if "%command%"=="restart" (
    call :stop_services
    timeout /t 2 /nobreak >nul
    call :start_services %mode%
    call :show_status
) else if "%command%"=="status" (
    call :show_status
) else if "%command%"=="logs" (
    call :show_logs
) else if "%command%"=="cleanup" (
    call :cleanup
) else if "%command%"=="help" (
    call :show_help
) else if "%command%"=="-h" (
    call :show_help
) else if "%command%"=="--help" (
    call :show_help
) else (
    call :print_error "Unknown command: %command%"
    call :show_help
    exit /b 1
)

goto :eof

REM Call main function
call :main %*
