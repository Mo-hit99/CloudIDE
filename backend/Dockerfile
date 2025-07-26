# Backend Dockerfile
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN apk update && apk upgrade && \
    apk add --no-cache wget && \
    npm install && \
    npm cache clean --force

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production

# Start application
CMD ["node", "index.js"]