# Frontend Dockerfile - Multi-stage build for React application
ARG NODE_VERSION=20-alpine

# Development stage
FROM node:${NODE_VERSION} as development

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache wget curl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --silent

# Copy source code
COPY . .

# Expose port
EXPOSE 5173

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5173 || exit 1

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

# Build stage
FROM node:${NODE_VERSION} as build

# Accept build arguments
ARG VITE_API_URL=""
ARG VITE_PROD="true"
ARG NODE_ENV=production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for build)
RUN npm ci --silent --include=dev

# Copy source code
COPY . .

# Set environment variables for build
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_PROD=${VITE_PROD}
ENV NODE_ENV=${NODE_ENV}

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine as production

# Copy built assets
COPY --from=build /app/dist /app/dist

# Copy nginx configuration template
COPY nginx.conf /etc/nginx/nginx.conf.template

# Create startup script to substitute environment variables
RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo 'set -e' >> /docker-entrypoint.sh && \
    echo 'echo "BACKEND_URL: $BACKEND_URL"' >> /docker-entrypoint.sh && \
    echo 'if [ -z "$BACKEND_URL" ]; then' >> /docker-entrypoint.sh && \
    echo '  BACKEND_URL="https://cloud-ide-backend.onrender.com"' >> /docker-entrypoint.sh && \
    echo '  echo "BACKEND_URL not set, using default: $BACKEND_URL"' >> /docker-entrypoint.sh && \
    echo 'else' >> /docker-entrypoint.sh && \
    echo '  echo "Using BACKEND_URL: $BACKEND_URL"' >> /docker-entrypoint.sh && \
    echo 'fi' >> /docker-entrypoint.sh && \
    echo 'sed "s|BACKEND_URL_PLACEHOLDER|$BACKEND_URL|g" /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf' >> /docker-entrypoint.sh && \
    echo 'echo "Generated nginx.conf:"' >> /docker-entrypoint.sh && \
    echo 'cat /etc/nginx/nginx.conf' >> /docker-entrypoint.sh && \
    echo 'exec nginx -g "daemon off;"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

# Expose port
EXPOSE 5173

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5173 || exit 1

# Start nginx with environment variable substitution
CMD ["/docker-entrypoint.sh"]