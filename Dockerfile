# Multi-stage Dockerfile for Cloud IDE
# This builds both frontend and backend in a single image

# =============================================================================
# Stage 1: Build Frontend (using standard Node.js to avoid Alpine issues)
# =============================================================================
FROM node:18 AS frontend-builder

# Set working directory
WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy frontend source code
COPY frontend/ ./

# Set environment variables for build
ENV NODE_ENV=production
ENV VITE_API_URL=/api

# Build frontend for production
RUN npm run build

# =============================================================================
# Stage 2: Build Backend
# =============================================================================
FROM node:18-alpine AS backend-builder

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy backend source code
COPY backend/ ./

# =============================================================================
# Stage 3: Production Image
# =============================================================================
FROM node:18-alpine AS production

# Install system dependencies
RUN apk add --no-cache \
    docker-cli \
    curl \
    bash \
    dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy backend from builder stage
COPY --from=backend-builder --chown=nodejs:nodejs /app/backend ./backend

# Copy frontend build from builder stage
COPY --from=frontend-builder --chown=nodejs:nodejs /app/frontend/dist ./frontend/dist

# Copy configuration files
COPY --chown=nodejs:nodejs docker-compose.yml ./
COPY --chown=nodejs:nodejs .env.example ./

# Create necessary directories
RUN mkdir -p /app/workspace && \
    chown -R nodejs:nodejs /app/workspace

# Expose ports
EXPOSE 5000 5173

# Switch to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Default command (can be overridden)
CMD ["node", "backend/index.js"]
