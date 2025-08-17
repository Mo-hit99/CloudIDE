# Cloud IDE Docker Deployment Guide

This guide explains how to deploy the Cloud IDE application using the pre-built Docker images from Docker Hub.

## Quick Start

### Option 1: Using the deployment script (Recommended)

```bash
./deploy.sh
```

### Option 2: Manual deployment

```bash
# Pull the latest images
docker pull mohitkohli007/cloud-ide-backend:latest
docker pull mohitkohli007/cloud-ide-frontend:latest

# Start the application
docker-compose -f docker-compose.prod.yml up -d
```

## Docker Images

- **Backend**: `mohitkohli007/cloud-ide-backend:latest`
- **Frontend**: `mohitkohli007/cloud-ide-frontend:latest`

## Services

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## Environment Variables

### Backend
- `MONGO_URI`: MongoDB connection string (default: mongodb://localhost:27017/cloudIDE)
- `NODE_ENV`: Environment (default: production)
- `PORT`: Port to run on (default: 5000)

### Frontend
- `BACKEND_URL`: Backend API URL (default: https://cloud-ide-backend.onrender.com)

## Docker Compose Commands

```bash
# Start services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down

# Check status
docker-compose -f docker-compose.prod.yml ps
```

## Manual Docker Commands

### Backend
```bash
docker run -d \
  --name cloud-ide-backend \
  -p 5000:5000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v ./workspace:/app/workspace \
  -e NODE_ENV=production \
  mohitkohli007/cloud-ide-backend:latest
```

### Frontend
```bash
docker run -d \
  --name cloud-ide-frontend \
  -p 5173:5173 \
  -e BACKEND_URL=https://cloud-ide-backend.onrender.com \
  mohitkohli007/cloud-ide-frontend:latest
```

## Troubleshooting

### Check container logs
```bash
docker logs cloud-ide-backend
docker logs cloud-ide-frontend
```

### Check container status
```bash
docker ps -a
```

### Restart containers
```bash
docker restart cloud-ide-backend cloud-ide-frontend
```

### Health checks
```bash
curl http://localhost:5000/health
curl http://localhost:5173
```

## Production Considerations

1. **Database**: Set up a proper MongoDB instance and update `MONGO_URI`
2. **SSL**: Use a reverse proxy (nginx/traefik) for SSL termination
3. **Monitoring**: Set up monitoring and logging
4. **Backup**: Implement regular backups for the workspace directory
5. **Security**: Review and update security settings as needed

## Recent Changes

- Fixed CORS configuration to allow frontend domain
- Updated URL detection logic to use `VITE_PROD` environment variable
- Added proper environment variable handling in Docker builds
- Improved error handling and logging

