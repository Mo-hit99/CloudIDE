#!/bin/bash

# Cloud IDE Docker Build Script
# Usage: ./build.sh [OPTIONS]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
REGISTRY="mohitkohli007"
IMAGE_NAME="cloud_ide"
VERSION="v1.0"
BUILD_TYPE="development"
PUSH_TO_REGISTRY=false

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

# Function to show help
show_help() {
    echo "Cloud IDE Docker Build Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -r, --registry REGISTRY    Docker registry (default: mohitkohli007)"
    echo "  -n, --name NAME            Image name (default: cloud_ide)"
    echo "  -v, --version VERSION      Image version (default: v1.0)"
    echo "  -t, --type TYPE            Build type: development|production (default: development)"
    echo "  -p, --push                 Push to registry after build"
    echo "  -h, --help                 Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Build development image"
    echo "  $0 -t production -v v2.0             # Build production image with version v2.0"
    echo "  $0 -t production -p                  # Build production and push to registry"
    echo "  $0 --registry myregistry --name myapp # Custom registry and name"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -r|--registry)
            REGISTRY="$2"
            shift 2
            ;;
        -n|--name)
            IMAGE_NAME="$2"
            shift 2
            ;;
        -v|--version)
            VERSION="$2"
            shift 2
            ;;
        -t|--type)
            BUILD_TYPE="$2"
            shift 2
            ;;
        -p|--push)
            PUSH_TO_REGISTRY=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Validate build type
if [[ "$BUILD_TYPE" != "development" && "$BUILD_TYPE" != "production" ]]; then
    print_error "Invalid build type: $BUILD_TYPE. Must be 'development' or 'production'"
    exit 1
fi

# Set image tag
IMAGE_TAG="${REGISTRY}/${IMAGE_NAME}:${VERSION}"
LATEST_TAG="${REGISTRY}/${IMAGE_NAME}:latest"

print_status "Building Cloud IDE Docker Image"
print_status "Registry: $REGISTRY"
print_status "Image Name: $IMAGE_NAME"
print_status "Version: $VERSION"
print_status "Build Type: $BUILD_TYPE"
print_status "Full Tag: $IMAGE_TAG"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Choose Dockerfile based on build type
if [[ "$BUILD_TYPE" == "production" ]]; then
    DOCKERFILE="Dockerfile.prod"
    print_status "Using production Dockerfile"
else
    # Try different Dockerfiles in order of preference
    if [[ -f "Dockerfile.fixed" ]]; then
        DOCKERFILE="Dockerfile.fixed"
        print_status "Using fixed Dockerfile (recommended for Alpine issues)"
    elif [[ -f "Dockerfile" ]]; then
        DOCKERFILE="Dockerfile"
        print_status "Using standard Dockerfile"
    else
        print_error "No suitable Dockerfile found"
        exit 1
    fi
fi

# Check if Dockerfile exists
if [[ ! -f "$DOCKERFILE" ]]; then
    print_error "Dockerfile not found: $DOCKERFILE"
    exit 1
fi

# Build the image
print_status "Building Docker image..."
if docker build -f "$DOCKERFILE" -t "$IMAGE_TAG" -t "$LATEST_TAG" .; then
    print_success "Docker image built successfully: $IMAGE_TAG"
else
    print_error "Failed to build Docker image"
    exit 1
fi

# Show image size
IMAGE_SIZE=$(docker images "$IMAGE_TAG" --format "table {{.Size}}" | tail -n 1)
print_status "Image size: $IMAGE_SIZE"

# Push to registry if requested
if [[ "$PUSH_TO_REGISTRY" == true ]]; then
    print_status "Pushing image to registry..."
    
    if docker push "$IMAGE_TAG"; then
        print_success "Successfully pushed: $IMAGE_TAG"
    else
        print_error "Failed to push image to registry"
        exit 1
    fi
    
    if docker push "$LATEST_TAG"; then
        print_success "Successfully pushed: $LATEST_TAG"
    else
        print_warning "Failed to push latest tag"
    fi
fi

# Show final information
print_success "Build completed successfully!"
echo ""
echo "Image Details:"
echo "  Tag: $IMAGE_TAG"
echo "  Size: $IMAGE_SIZE"
echo "  Type: $BUILD_TYPE"
echo ""
echo "To run the image:"
if [[ "$BUILD_TYPE" == "production" ]]; then
    echo "  docker run -d -p 80:80 -p 5000:5000 --name cloud-ide $IMAGE_TAG"
else
    echo "  docker run -d -p 5173:5173 -p 5000:5000 --name cloud-ide $IMAGE_TAG"
fi
echo ""
echo "To push to registry:"
echo "  docker push $IMAGE_TAG"
