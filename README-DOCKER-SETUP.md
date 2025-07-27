# 🐳 Docker Cloud IDE - Complete Setup Guide

## 🎉 **Complete Docker Compose Configuration Updated!**

I've completely modernized your `docker-compose.yml` file with the latest stable versions and best practices. Here's what's been implemented:

### 🔧 **Key Improvements:**

1. **Latest Stable Versions:**
   - **MongoDB**: 8.0 (latest stable)
   - **Node.js**: 20-alpine (LTS)
   - **Redis**: 7.4-alpine
   - **Nginx**: 1.27-alpine

2. **Enhanced Architecture:**
   - **Custom network** with subnet configuration
   - **Named volumes** for better data management
   - **Health checks** for all services
   - **Security hardening** with non-root users

3. **Multiple Environment Support:**
   - **Development** (default): Hot reloading, exposed ports, debug support
   - **Production**: Optimized builds, reverse proxy, security hardening
   - **Full stack**: All optional services enabled

4. **Development Containers:**
   - **Ubuntu multi-language** container
   - **Node.js 20** container
   - **Python 3.12** container
   - **Java 21** container

## 📋 Prerequisites
- **Docker Desktop** 4.20+ installed and running
- **Docker Compose** v2.20+ (included with Docker Desktop)
- **Node.js** 20+ (for local development)
- **Git** (for version control)

## 🚀 Quick Start Commands

### Using the Startup Scripts (Recommended)
```bash
# Development mode (recommended)
./start-cloud-ide.sh start dev
# or on Windows:
start-cloud-ide.bat start dev

# Production mode
./start-cloud-ide.sh start prod

# Full stack with all services
./start-cloud-ide.sh start full

# Check status
./start-cloud-ide.sh status

# View logs
./start-cloud-ide.sh logs

# Stop everything
./start-cloud-ide.sh stop
```

### Manual Docker Compose Commands
```bash
# 1. Environment Setup
cp .env.example .env
# Edit environment variables as needed

# 2. Development Mode (Default)
docker-compose up -d

# 3. Production Mode
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 4. Full Stack Mode
docker-compose --profile full up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Access the IDE
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017
- Select a development container from the dropdown
- Start coding with real-time file sync!

## 🎯 Available Configurations

### Development Mode (Default)
```bash
# Uses docker-compose.yml + docker-compose.override.yml
docker-compose up -d

# Includes:
# - Hot reloading for frontend/backend
# - All development containers enabled
# - MongoDB exposed on port 27017
# - Debug ports exposed
```

### Production Mode
```bash
# Uses docker-compose.yml + docker-compose.prod.yml
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Includes:
# - Optimized builds
# - Nginx reverse proxy
# - Redis caching
# - Security hardening
# - No exposed ports (except 80/443)
```

### Full Stack with All Services
```bash
# Enable all optional services
docker-compose --profile full up -d

# Includes:
# - Redis caching
# - All development containers
# - Enhanced monitoring
```

## 🛠 Development Containers

The setup includes pre-configured development containers:

### 🐧 Ubuntu Multi-Language Container
- **Container**: `cloud-ide-dev-ubuntu`
- **Languages**: Python, Node.js, Java, Git, Vim, Nano
- **Workspace**: `/workspace`

### 🟢 Node.js Container
- **Container**: `cloud-ide-dev-node`
- **Image**: `node:20-alpine`
- **Workspace**: `/workspace`

### 🐍 Python Container
- **Container**: `cloud-ide-dev-python`
- **Image**: `python:3.12-alpine`
- **Workspace**: `/workspace`

### ☕ Java Container
- **Container**: `cloud-ide-dev-java`
- **Image**: `openjdk:21-jdk-slim`
- **Workspace**: `/workspace`

## ✨ Features

### 📁 File Operations
- ✅ Browse directory structure in real-time
- ✅ Create/delete files and folders
- ✅ Edit files with multi-language syntax highlighting
- ✅ Auto-save functionality (2-second delay)
- ✅ Manual save with Ctrl+S
- ✅ Right-click context menus
- ✅ File type detection

### 💻 Terminal Operations
- ✅ Real-time terminal access to containers
- ✅ Command execution with live output
- ✅ Command history (Up/Down arrows)
- ✅ Ctrl+C and Ctrl+D support
- ✅ Terminal resizing
- ✅ Multiple terminal sessions

### 🐳 Container Management
- ✅ List all containers with status
- ✅ Start/stop containers
- ✅ View container details
- ✅ Switch between containers
- ✅ Container health monitoring
- ✅ Real-time status updates

## 📁 **Files Updated:**

1. **`docker-compose.yml`** - Main configuration with latest versions
2. **`docker-compose.override.yml`** - Development overrides
3. **`docker-compose.prod.yml`** - Production configuration
4. **`.env.example`** - Comprehensive environment template
5. **`backend/Dockerfile`** - Optimized with security
6. **`frontend/Dockerfile`** - Multi-stage build with dev/prod modes
7. **`README-DOCKER-SETUP.md`** - Complete documentation
8. **`start-cloud-ide.sh`** - Linux/Mac startup script
9. **`start-cloud-ide.bat`** - Windows startup script

## 🔒 **Security Features:**

- **Non-root users** in containers
- **Rate limiting** and input validation
- **Docker socket** access control
- **Production-ready** reverse proxy
- **Comprehensive logging**
- **Path traversal** protection
- **Command injection** prevention
- **CORS configuration**
- **Security headers**

## 🎯 **Ready to Use:**

Your Cloud IDE now supports:
- **Real-time file editing** in Docker containers
- **Live terminal access** to containers
- **Multi-language development** environments
- **Production-ready deployment**
- **Comprehensive monitoring** and logging

**Simply run `./start-cloud-ide.sh start dev` and access your IDE at http://localhost:5173!**

## API Endpoints

### Docker API
- `GET /api/docker/containers` - List containers
- `GET /api/docker/containers/:id` - Get container details
- `POST /api/docker/containers/:id/start` - Start container
- `POST /api/docker/containers/:id/stop` - Stop container
- `POST /api/docker/containers/:id/exec` - Execute command

### File API
- `GET /api/files/tree/:containerId` - Get directory tree
- `GET /api/files/content/:containerId` - Read file content
- `POST /api/files/content/:containerId` - Write file content
- `POST /api/files/create/:containerId` - Create file/directory
- `DELETE /api/files/delete/:containerId` - Delete file/directory

## WebSocket Events

### Terminal Events
- `terminal:connect` - Connect to container terminal
- `terminal:input` - Send input to terminal
- `terminal:output` - Receive terminal output
- `terminal:disconnect` - Disconnect from terminal

## Security Features
- Rate limiting on all endpoints
- Input validation and sanitization
- Path traversal protection
- Command injection prevention
- CORS configuration

## Troubleshooting

### Docker Issues
- Ensure Docker Desktop is running
- Check container status: `docker ps -a`
- View container logs: `docker logs <container-name>`

### Connection Issues
- Backend should run on http://localhost:5000
- Frontend should run on http://localhost:5173
- Check browser console for WebSocket errors

### File Permission Issues
- Ensure container has proper file permissions
- Use `chmod` commands in terminal if needed

## Development

### Adding New Languages
1. Install ACE editor mode: `npm install ace-builds`
2. Import mode in `CodeEditor.jsx`
3. Add file extension mapping in `getFileMode()`

### Extending Container Support
1. Add new container configurations in `docker-compose.yml`
2. Update security middleware for new paths
3. Test with different base images

## Production Deployment
- Set environment variables for production
- Use reverse proxy (nginx) for HTTPS
- Configure proper CORS origins
- Set up container orchestration (Docker Swarm/Kubernetes)
