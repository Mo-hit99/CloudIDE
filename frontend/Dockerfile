# Frontend Dockerfile - Latest stable Node.js with multi-stage build
ARG NODE_VERSION=20-alpine

# Build stage
FROM node:${NODE_VERSION} as build

# Set working directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Install system dependencies
RUN apk update && apk upgrade && \
    apk add --no-cache \
    wget \
    curl \
    && rm -rf /var/cache/apk/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --silent && \
    npm cache clean --force

# Copy application code
COPY . .

# Change ownership to nodejs user
RUN chown -R nodejs:nodejs /app
USER nodejs

# Build the application
RUN npm run build

# Production stage
FROM nginx:1.27-alpine as production

# Install Node.js for development mode
RUN apk add --no-cache nodejs npm

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy built assets from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./

# For development mode, copy source files
COPY --from=build /app/src ./src
COPY --from=build /app/public ./public
COPY --from=build /app/*.config.js ./
COPY --from=build /app/index.html ./

# Install serve for static file serving and dev dependencies
RUN npm install -g serve@14.2.3 && \
    npm ci --silent

# Change ownership to nodejs user
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 5173

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5173 || exit 1

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5173

# Start script that handles both dev and production modes
COPY --chown=nodejs:nodejs <<EOF /app/start.sh
#!/bin/sh
if [ "\$NODE_ENV" = "development" ]; then
    echo "Starting in development mode..."
    npm run dev -- --host 0.0.0.0 --port 5173
else
    echo "Starting in production mode..."
    serve -s dist -l 5173
fi
EOF

RUN chmod +x /app/start.sh

# Start the application
CMD ["/app/start.sh"]