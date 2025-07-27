#!/bin/bash

# Cloud IDE Startup Script
# This script helps you get started with the Docker Cloud IDE

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    print_status "Checking Docker installation..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker Desktop first."
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker Desktop."
        exit 1
    fi
    
    print_success "Docker is running"
}

# Function to check if Docker Compose is available
check_docker_compose() {
    print_status "Checking Docker Compose..."
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed."
        exit 1
    fi
    
    print_success "Docker Compose is available"
}

# Function to setup environment
setup_environment() {
    print_status "Setting up environment..."
    
    if [ ! -f .env ]; then
        print_status "Creating .env file from template..."
        cp .env.example .env
        print_success "Created .env file. You can edit it to customize settings."
    else
        print_warning ".env file already exists. Skipping creation."
    fi
    
    # Create workspace directories
    mkdir -p workspace/{node,python,java,general}
    print_success "Created workspace directories"
}

# Function to start services
start_services() {
    local mode=$1
    
    print_status "Starting Cloud IDE in $mode mode..."
    
    case $mode in
        "dev"|"development")
            docker-compose up -d
            ;;
        "prod"|"production")
            docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
            ;;
        "full")
            docker-compose --profile full up -d
            ;;
        *)
            print_error "Unknown mode: $mode"
            exit 1
            ;;
    esac
    
    print_success "Services started successfully!"
}

# Function to show status
show_status() {
    print_status "Checking service status..."
    docker-compose ps
    
    echo ""
    print_status "Service URLs:"
    echo "  Frontend:  http://localhost:5173"
    echo "  Backend:   http://localhost:5000"
    echo "  MongoDB:   localhost:27017"
    echo ""
}

# Function to show logs
show_logs() {
    print_status "Showing service logs (Ctrl+C to exit)..."
    docker-compose logs -f
}

# Function to stop services
stop_services() {
    print_status "Stopping Cloud IDE services..."
    docker-compose down
    print_success "Services stopped"
}

# Function to clean up
cleanup() {
    print_status "Cleaning up Docker resources..."
    docker-compose down -v --remove-orphans
    docker system prune -f
    print_success "Cleanup completed"
}

# Function to show help
show_help() {
    echo "Cloud IDE Management Script"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  start [mode]    Start the Cloud IDE (modes: dev, prod, full)"
    echo "  stop           Stop all services"
    echo "  restart [mode] Restart services"
    echo "  status         Show service status"
    echo "  logs           Show service logs"
    echo "  cleanup        Stop services and clean up Docker resources"
    echo "  help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start dev     # Start in development mode"
    echo "  $0 start prod    # Start in production mode"
    echo "  $0 status        # Show current status"
    echo "  $0 logs          # Show logs"
    echo ""
}

# Main script logic
main() {
    local command=${1:-"start"}
    local mode=${2:-"dev"}
    
    case $command in
        "start")
            check_docker
            check_docker_compose
            setup_environment
            start_services $mode
            show_status
            ;;
        "stop")
            stop_services
            ;;
        "restart")
            stop_services
            sleep 2
            start_services $mode
            show_status
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs
            ;;
        "cleanup")
            cleanup
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            print_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
