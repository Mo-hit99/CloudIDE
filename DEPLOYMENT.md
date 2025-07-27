# Cloud IDE Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed and running
- Docker Compose v2.0+
- Git (for cloning the repository)
- 4GB+ RAM available
- 10GB+ disk space

### One-Command Deployment

```bash
# Development deployment
./deploy.sh dev

# Production deployment
./deploy.sh prod
```

## 📋 Current Docker Images

After cleanup, the project uses only these essential images:

| Image | Size | Purpose |
|-------|------|---------|
| `cloud-ide-frontend:latest` | 710MB | React frontend with Vite |
| `cloud-ide-backend:latest` | 348MB | Node.js API server |
| `mongo:8.0` | 1.22GB | MongoDB database |
| `node:18-alpine` | 181MB | Base image for containers |

**Total Size:** ~2.46GB (optimized from 11GB+)

## 🗂️ Docker Compose Files

### Development (`docker-compose.yml`)
- **Services:** MongoDB, Backend, Frontend
- **Ports:** 27017 (MongoDB), 5000 (Backend), 5173 (Frontend)
- **Features:** Hot reloading, development tools, exposed ports
- **Network:** `cloud-ide-network` (172.20.0.0/16)

### Production (`docker-compose.prod.yml`)
- **Services:** MongoDB, Backend, Frontend, Nginx, Redis (optional)
- **Ports:** 80 (HTTP), 443 (HTTPS)
- **Features:** SSL termination, reverse proxy, caching, logging
- **Network:** `cloud-ide-network-prod` (172.21.0.0/16)
- **Security:** No direct port exposure, resource limits

## 🔧 Environment Configuration

### Required Environment Variables

```bash
# Database
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=password123
MONGO_INITDB_DATABASE=cloudIDE

# Application
NODE_ENV=development
BACKEND_PORT=5000
FRONTEND_PORT=5173

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Docker
DOCKER_HOST=unix:///var/run/docker.sock

# Frontend
VITE_API_URL=http://localhost:5000
```

### Production Additional Variables

```bash
# Domain
DOMAIN=your-domain.com

# SSL
SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
SSL_KEY_PATH=/etc/nginx/ssl/key.pem

# Redis (optional)
REDIS_PASSWORD=secure-redis-password

# Performance
CONTAINER_MEMORY_LIMIT=512m
CONTAINER_CPU_LIMIT=0.5
```

## 🚀 Deployment Commands

### Using Deploy Script

```bash
# Development deployment
./deploy.sh dev

# Production deployment
./deploy.sh prod

# Build images only
./deploy.sh build

# Clean up old containers/images
./deploy.sh cleanup

# Show logs
./deploy.sh logs

# Stop services
./deploy.sh stop

# Restart services
./deploy.sh restart

# Show status
./deploy.sh status
```

### Manual Docker Compose

```bash
# Development
docker-compose up -d

# Production
docker-compose -f docker-compose.prod.yml up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f
```

## 🌐 Access URLs

### Development
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **MongoDB:** localhost:27017
- **Health Check:** http://localhost:5000/health

### Production
- **Application:** http://localhost (via Nginx)
- **HTTPS:** https://localhost (if SSL configured)
- **API:** http://localhost/api
- **Health Check:** http://localhost/health

## 📊 Resource Usage

### Development
- **CPU:** ~1-2 cores
- **Memory:** ~2-3GB
- **Disk:** ~3GB (including images)

### Production
- **CPU:** ~0.5-1 core (with limits)
- **Memory:** ~1.5-2GB (with limits)
- **Disk:** ~3GB (including images)

## 🔒 Security Features

### Development
- Basic authentication
- CORS enabled for localhost
- Development-friendly error messages

### Production
- JWT authentication with secure secrets
- HTTPS/SSL termination
- Reverse proxy (Nginx)
- Resource limits
- No direct port exposure
- Secure headers
- Rate limiting
- Log rotation

## 🗄️ Data Persistence

### Volumes
- `cloud-ide-mongo-data`: MongoDB data
- `cloud-ide-mongo-config`: MongoDB configuration
- `cloud-ide-redis-data-prod`: Redis data (production)
- `cloud-ide-nginx-cache`: Nginx cache (production)

### Backup Strategy
```bash
# Backup MongoDB
docker exec cloud-ide-mongo mongodump --out /backup

# Restore MongoDB
docker exec cloud-ide-mongo mongorestore /backup
```

## 🔧 Maintenance

### Update Images
```bash
# Pull latest base images
docker pull mongo:8.0
docker pull node:18-alpine
docker pull nginx:1.27-alpine

# Rebuild custom images
./deploy.sh build
```

### Clean Up
```bash
# Remove unused images
docker image prune -f

# Remove unused volumes (careful!)
docker volume prune -f

# Complete cleanup
docker system prune -a -f
```

### Monitor Resources
```bash
# Check container stats
docker stats

# Check disk usage
docker system df

# Check logs
docker-compose logs -f [service-name]
```

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Check what's using the port
   netstat -tulpn | grep :5000
   
   # Change port in .env file
   BACKEND_PORT=5001
   ```

2. **Docker socket permission denied**
   ```bash
   # Add user to docker group (Linux)
   sudo usermod -aG docker $USER
   
   # Restart Docker Desktop (Windows/Mac)
   ```

3. **MongoDB connection failed**
   ```bash
   # Check MongoDB logs
   docker logs cloud-ide-mongo
   
   # Verify credentials in .env
   ```

4. **Frontend build fails**
   ```bash
   # Clear node_modules and rebuild
   docker-compose down
   docker volume rm $(docker volume ls -q | grep node_modules)
   ./deploy.sh build
   ```

### Health Checks

```bash
# Backend health
curl http://localhost:5000/health

# Frontend health
curl http://localhost:5173

# MongoDB health
docker exec cloud-ide-mongo mongosh --eval "db.adminCommand('ping')"
```

## 📈 Performance Optimization

### Production Optimizations
- Nginx gzip compression
- Static file caching
- Resource limits
- Connection pooling
- Redis caching (optional)

### Development Optimizations
- Hot module reloading
- Source maps
- Development middleware
- Fast refresh

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Deploy Cloud IDE
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy
        run: ./deploy.sh prod
```

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review Docker logs
3. Check environment configuration
4. Verify Docker and Docker Compose versions
