#!/bin/bash

# Cloud IDE Deployment Script
# This script helps deploy the Cloud IDE in different environments

set -e  # Exit on any error

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
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to check if docker-compose is available
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        print_error "docker-compose is not installed. Please install docker-compose and try again."
        exit 1
    fi
    print_success "docker-compose is available"
}

# Function to create .env file if it doesn't exist
setup_env() {
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from .env.example..."
        cp .env.example .env
        print_success ".env file created. Please review and update the values as needed."
    else
        print_success ".env file exists"
    fi
}

# Function to clean up old containers and images
cleanup() {
    print_status "Cleaning up old containers and images..."
    
    # Stop and remove existing containers
    docker-compose down --remove-orphans 2>/dev/null || true
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused volumes (optional - uncomment if needed)
    # docker volume prune -f
    
    print_success "Cleanup completed"
}

# Function to build images
build_images() {
    print_status "Building Docker images..."
    
    # Build backend
    print_status "Building backend image..."
    docker build -t cloud-ide-backend ./backend
    
    # Build frontend
    print_status "Building frontend image..."
    docker build -t cloud-ide-frontend ./frontend
    
    print_success "All images built successfully"
}

# Function to deploy in development mode
deploy_development() {
    print_status "Deploying Cloud IDE in development mode..."
    
    # Start services
    docker-compose up -d
    
    # Wait for services to be healthy
    print_status "Waiting for services to be ready..."
    sleep 10
    
    # Check service health
    check_services_health
    
    print_success "Development deployment completed!"
    print_status "Frontend: http://localhost:5173"
    print_status "Backend API: http://localhost:5000"
    print_status "MongoDB: localhost:27017"
}

# Function to deploy in production mode
deploy_production() {
    print_status "Deploying Cloud IDE in production mode..."
    
    # Check if production environment file exists
    if [ ! -f .env.prod ]; then
        print_warning ".env.prod file not found. Creating from .env..."
        cp .env .env.prod
        print_warning "Please review .env.prod and update for production settings!"
    fi
    
    # Start services with production configuration
    docker-compose -f docker-compose.prod.yml up -d
    
    # Wait for services to be healthy
    print_status "Waiting for services to be ready..."
    sleep 15
    
    print_success "Production deployment completed!"
    print_status "Application: http://localhost (via Nginx)"
    print_status "HTTPS: https://localhost (if SSL configured)"
}

# Function to check service health
check_services_health() {
    print_status "Checking service health..."
    
    # Check backend health
    for i in {1..30}; do
        if curl -f http://localhost:5000/health > /dev/null 2>&1; then
            print_success "Backend is healthy"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "Backend health check failed"
            return 1
        fi
        sleep 2
    done
    
    # Check frontend
    for i in {1..30}; do
        if curl -f http://localhost:5173 > /dev/null 2>&1; then
            print_success "Frontend is healthy"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "Frontend health check failed"
            return 1
        fi
        sleep 2
    done
}

# Function to show logs
show_logs() {
    print_status "Showing application logs..."
    docker-compose logs -f
}

# Function to stop services
stop_services() {
    print_status "Stopping Cloud IDE services..."
    docker-compose down
    print_success "Services stopped"
}

# Function to restart services
restart_services() {
    print_status "Restarting Cloud IDE services..."
    docker-compose restart
    print_success "Services restarted"
}

# Function to show status
show_status() {
    print_status "Cloud IDE Service Status:"
    docker-compose ps
}

# Function to show help
show_help() {
    echo "Cloud IDE Deployment Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  dev         Deploy in development mode (default)"
    echo "  prod        Deploy in production mode"
    echo "  build       Build Docker images"
    echo "  cleanup     Clean up old containers and images"
    echo "  logs        Show application logs"
    echo "  stop        Stop all services"
    echo "  restart     Restart all services"
    echo "  status      Show service status"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev      # Deploy in development mode"
    echo "  $0 prod     # Deploy in production mode"
    echo "  $0 cleanup  # Clean up old containers"
    echo "  $0 logs     # Show logs"
}

# Main script logic
main() {
    local command=${1:-dev}
    
    print_status "Cloud IDE Deployment Script"
    print_status "Command: $command"
    
    # Check prerequisites
    check_docker
    check_docker_compose
    
    case $command in
        "dev"|"development")
            setup_env
            cleanup
            build_images
            deploy_development
            ;;
        "prod"|"production")
            setup_env
            cleanup
            build_images
            deploy_production
            ;;
        "build")
            build_images
            ;;
        "cleanup")
            cleanup
            ;;
        "logs")
            show_logs
            ;;
        "stop")
            stop_services
            ;;
        "restart")
            restart_services
            ;;
        "status")
            show_status
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
