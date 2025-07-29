# Backend Dockerfile - Multi-stage build for Node.js application
ARG NODE_VERSION=20-alpine

# Base stage
FROM node:${NODE_VERSION} AS base

WORKDIR /app

# Install system dependencies including Docker CLI
RUN apk update && apk upgrade && \
    apk add --no-cache \
    wget \
    curl \
    docker-cli \
    shadow \
    && rm -rf /var/cache/apk/*

# Create non-root user and docker group
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    addgroup -g 995 -S docker && \
    adduser nodejs docker

# Copy package files
COPY package*.json ./

# Development stage
FROM base AS development

# Install all dependencies (including dev dependencies)
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Change ownership to nodejs user
RUN chown -R nodejs:nodejs /app

# Production stage
FROM base AS production

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Change ownership to nodejs user
RUN chown -R nodejs:nodejs /app

# Create entrypoint script to handle Docker socket permissions
COPY <<EOF /entrypoint.sh
#!/bin/sh
set -e

# Check if Docker socket exists and adjust permissions
if [ -S /var/run/docker.sock ]; then
    echo "Docker socket found, adjusting permissions..."
    DOCKER_SOCK_GID=\$(stat -c "%g" /var/run/docker.sock)
    echo "Docker socket group ID: \$DOCKER_SOCK_GID"

    if [ "\$DOCKER_SOCK_GID" != "0" ]; then
        if getent group docker > /dev/null 2>&1; then
            CURRENT_DOCKER_GID=\$(getent group docker | cut -d: -f3)
            if [ "\$CURRENT_DOCKER_GID" != "\$DOCKER_SOCK_GID" ]; then
                echo "Updating docker group GID from \$CURRENT_DOCKER_GID to \$DOCKER_SOCK_GID"
                groupmod -g \$DOCKER_SOCK_GID docker
            fi
        else
            echo "Creating docker group with GID \$DOCKER_SOCK_GID"
            addgroup -g \$DOCKER_SOCK_GID docker
        fi

        if ! groups nodejs | grep -q docker; then
            echo "Adding nodejs user to docker group"
            adduser nodejs docker
        fi
    fi

    echo "Docker client initialized successfully"
else
    echo "Warning: Docker socket not found at /var/run/docker.sock"
fi

# Execute the main command
exec "\$@"
EOF

RUN chmod +x /entrypoint.sh

# Set entrypoint
ENTRYPOINT ["/entrypoint.sh"]

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# Default environment
ENV NODE_ENV=development
ENV PORT=5000

# Start application (can be overridden for development)
CMD ["node", "index.js"]