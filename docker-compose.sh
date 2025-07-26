#!/bin/bash

# Docker Compose helper script

# Function to display help message
show_help() {
  echo "Usage: ./docker-compose.sh [OPTION]"
  echo "Helper script for Docker Compose operations."
  echo ""
  echo "Options:"
  echo "  up          Start all services in development mode"
  echo "  down        Stop all services"
  echo "  build       Rebuild all services"
  echo "  prod        Start all services in production mode"
  echo "  prod-down   Stop production services"
  echo "  logs        View logs from all services"
  echo "  restart     Restart all services"
  echo "  clean       Remove all containers, volumes, and images"
  echo "  help        Display this help message"
  echo ""
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "Error: Docker is not running. Please start Docker and try again."
  exit 1
}

# Process command line arguments
case "$1" in
  up)
    echo "Starting services in development mode..."
    docker-compose up -d
    ;;
  down)
    echo "Stopping services..."
    docker-compose down
    ;;
  build)
    echo "Rebuilding services..."
    docker-compose build --no-cache
    docker-compose up -d
    ;;
  prod)
    echo "Starting services in production mode..."
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
    ;;
  prod-down)
    echo "Stopping production services..."
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml down
    ;;
  logs)
    echo "Viewing logs..."
    docker-compose logs -f
    ;;
  restart)
    echo "Restarting services..."
    docker-compose restart
    ;;
  clean)
    echo "Removing all containers, volumes, and images..."
    docker-compose down -v
    docker system prune -af --volumes
    ;;
  help)
    show_help
    ;;
  *)
    show_help
    exit 1
    ;;
esac

exit 0