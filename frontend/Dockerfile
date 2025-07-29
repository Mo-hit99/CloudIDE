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

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --silent

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine as production

# Install Node.js for serving
RUN apk add --no-cache nodejs npm

# Install serve globally
RUN npm install -g serve@14.2.3

# Copy built assets
COPY --from=build /app/dist /app/dist

WORKDIR /app

# Expose port
EXPOSE 5173

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5173 || exit 1

# Start production server
CMD ["serve", "-s", "dist", "-l", "5173"]