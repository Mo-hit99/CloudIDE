# Frontend Dockerfile
# Build stage
FROM node:20-alpine as build

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --silent && \
    npm cache clean --force

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine as production

# Set working directory
WORKDIR /app

# Install serve for static file serving
RUN npm install -g serve@14.2.1

# Copy built assets from build stage
COPY --from=build /app/dist ./dist

# Expose port
EXPOSE 5173

# Set environment variables
ENV NODE_ENV=production

# Start the application
CMD ["serve", "-s", "dist", "-l", "5173"]