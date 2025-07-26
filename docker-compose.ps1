# Docker Compose helper script for PowerShell

# Function to display help message
function Show-Help {
    Write-Host "Usage: .\docker-compose.ps1 [OPTION]"
    Write-Host "Helper script for Docker Compose operations."
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  up          Start all services in development mode"
    Write-Host "  down        Stop all services"
    Write-Host "  build       Rebuild all services"
    Write-Host "  prod        Start all services in production mode"
    Write-Host "  prod-down   Stop production services"
    Write-Host "  logs        View logs from all services"
    Write-Host "  restart     Restart all services"
    Write-Host "  clean       Remove all containers, volumes, and images"
    Write-Host "  help        Display this help message"
    Write-Host ""
}

# Check if Docker is running
try {
    $null = docker info
} catch {
    Write-Host "Error: Docker is not running. Please start Docker and try again." -ForegroundColor Red
    exit 1
}

# Process command line arguments
if ($args.Count -eq 0) {
    Show-Help
    exit 1
}

switch ($args[0]) {
    "up" {
        Write-Host "Starting services in development mode..." -ForegroundColor Green
        docker-compose up -d
    }
    "down" {
        Write-Host "Stopping services..." -ForegroundColor Yellow
        docker-compose down
    }
    "build" {
        Write-Host "Rebuilding services..." -ForegroundColor Cyan
        docker-compose build --no-cache
        docker-compose up -d
    }
    "prod" {
        Write-Host "Starting services in production mode..." -ForegroundColor Green
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
    }
    "prod-down" {
        Write-Host "Stopping production services..." -ForegroundColor Yellow
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml down
    }
    "logs" {
        Write-Host "Viewing logs..." -ForegroundColor Blue
        docker-compose logs -f
    }
    "restart" {
        Write-Host "Restarting services..." -ForegroundColor Magenta
        docker-compose restart
    }
    "clean" {
        Write-Host "Removing all containers, volumes, and images..." -ForegroundColor Red
        docker-compose down -v
        docker system prune -af --volumes
    }
    "help" {
        Show-Help
    }
    default {
        Show-Help
        exit 1
    }
}

exit 0