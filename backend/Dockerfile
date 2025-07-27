# Backend Dockerfile - Latest stable Node.js
ARG NODE_VERSION=20-alpine
FROM node:${NODE_VERSION}

# Set working directory
WORKDIR /app

# Create non-root user for security and add to docker group
# Use dynamic docker group ID detection for better compatibility
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Install system dependencies including Docker CLI
RUN apk update && apk upgrade && \
    apk add --no-cache \
    wget \
    curl \
    docker-cli \
    shadow \
    && rm -rf /var/cache/apk/*

# Create docker group and add nodejs user to it
# Use a different GID initially, will be adjusted at runtime
RUN if ! getent group docker > /dev/null 2>&1; then \
        addgroup -g 995 -S docker; \
    fi && \
    adduser nodejs docker

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy application code
COPY . .

# Change ownership to nodejs user
RUN chown -R nodejs:nodejs /app

# Create entrypoint script to handle Docker socket permissions
RUN echo '#!/bin/sh' > /entrypoint.sh && \
    echo 'set -e' >> /entrypoint.sh && \
    echo '' >> /entrypoint.sh && \
    echo '# Check if Docker socket exists and adjust permissions' >> /entrypoint.sh && \
    echo 'if [ -S /var/run/docker.sock ]; then' >> /entrypoint.sh && \
    echo '    echo "Docker socket found, adjusting permissions..."' >> /entrypoint.sh && \
    echo '    ' >> /entrypoint.sh && \
    echo '    # Get the group ID of the Docker socket' >> /entrypoint.sh && \
    echo '    DOCKER_SOCK_GID=$(stat -c "%g" /var/run/docker.sock)' >> /entrypoint.sh && \
    echo '    echo "Docker socket group ID: $DOCKER_SOCK_GID"' >> /entrypoint.sh && \
    echo '    ' >> /entrypoint.sh && \
    echo '    # Check if docker group exists and update its GID if needed' >> /entrypoint.sh && \
    echo '    if [ "$DOCKER_SOCK_GID" = "0" ]; then' >> /entrypoint.sh && \
    echo '        echo "Docker socket owned by root group (GID 0), running as root"' >> /entrypoint.sh && \
    echo '    elif getent group docker > /dev/null 2>&1; then' >> /entrypoint.sh && \
    echo '        CURRENT_DOCKER_GID=$(getent group docker | cut -d: -f3)' >> /entrypoint.sh && \
    echo '        if [ "$CURRENT_DOCKER_GID" != "$DOCKER_SOCK_GID" ]; then' >> /entrypoint.sh && \
    echo '            echo "Updating docker group GID from $CURRENT_DOCKER_GID to $DOCKER_SOCK_GID"' >> /entrypoint.sh && \
    echo '            groupmod -g $DOCKER_SOCK_GID docker' >> /entrypoint.sh && \
    echo '        fi' >> /entrypoint.sh && \
    echo '    else' >> /entrypoint.sh && \
    echo '        echo "Creating docker group with GID $DOCKER_SOCK_GID"' >> /entrypoint.sh && \
    echo '        addgroup -g $DOCKER_SOCK_GID docker' >> /entrypoint.sh && \
    echo '    fi' >> /entrypoint.sh && \
    echo '    ' >> /entrypoint.sh && \
    echo '    # Add nodejs user to docker group if not already a member and not root group' >> /entrypoint.sh && \
    echo '    if [ "$DOCKER_SOCK_GID" != "0" ] && ! groups nodejs | grep -q docker; then' >> /entrypoint.sh && \
    echo '        echo "Adding nodejs user to docker group"' >> /entrypoint.sh && \
    echo '        adduser nodejs docker' >> /entrypoint.sh && \
    echo '    fi' >> /entrypoint.sh && \
    echo '    ' >> /entrypoint.sh && \
    echo '    # Test Docker access' >> /entrypoint.sh && \
    echo '    echo "Testing Docker access..."' >> /entrypoint.sh && \
    echo '    if docker version > /dev/null 2>&1; then' >> /entrypoint.sh && \
    echo '        echo "Docker access successful"' >> /entrypoint.sh && \
    echo '    else' >> /entrypoint.sh && \
    echo '        echo "Warning: Docker access test failed, but continuing..."' >> /entrypoint.sh && \
    echo '    fi' >> /entrypoint.sh && \
    echo 'else' >> /entrypoint.sh && \
    echo '    echo "Warning: Docker socket not found at /var/run/docker.sock"' >> /entrypoint.sh && \
    echo 'fi' >> /entrypoint.sh && \
    echo '' >> /entrypoint.sh && \
    echo '# Execute the main command' >> /entrypoint.sh && \
    echo 'exec "$@"' >> /entrypoint.sh

RUN chmod +x /entrypoint.sh

# Set entrypoint
ENTRYPOINT ["/entrypoint.sh"]

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Start application
CMD ["node", "index.js"]