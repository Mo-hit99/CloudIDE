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
COPY --chown=nodejs:nodejs . .

# Create simple entrypoint script using echo instead of heredoc
RUN echo '#!/bin/sh' > /entrypoint.sh && \
    echo 'set -e' >> /entrypoint.sh && \
    echo '' >> /entrypoint.sh && \
    echo '# Handle Docker socket permissions' >> /entrypoint.sh && \
    echo 'if [ -S "/var/run/docker.sock" ]; then' >> /entrypoint.sh && \
    echo '    echo "Docker socket found at /var/run/docker.sock"' >> /entrypoint.sh && \
    echo '    DOCKER_SOCK_GID=$(stat -c "%g" /var/run/docker.sock 2>/dev/null || echo "999")' >> /entrypoint.sh && \
    echo '    echo "Docker socket GID: $DOCKER_SOCK_GID"' >> /entrypoint.sh && \
    echo '    if ! getent group docker > /dev/null 2>&1; then' >> /entrypoint.sh && \
    echo '        addgroup -g "$DOCKER_SOCK_GID" docker 2>/dev/null || addgroup -S docker' >> /entrypoint.sh && \
    echo '    fi' >> /entrypoint.sh && \
    echo '    adduser nodejs docker 2>/dev/null || true' >> /entrypoint.sh && \
    echo 'else' >> /entrypoint.sh && \
    echo '    echo "Warning: Docker socket not found at /var/run/docker.sock"' >> /entrypoint.sh && \
    echo 'fi' >> /entrypoint.sh && \
    echo '' >> /entrypoint.sh && \
    echo '# Start the application' >> /entrypoint.sh && \
    echo 'exec "$@"' >> /entrypoint.sh && \
    chmod +x /entrypoint.sh

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

# Start application
CMD ["node", "index.js"]