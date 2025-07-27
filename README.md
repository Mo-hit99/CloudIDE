# ☁️ Cloud IDE Editor

A modern, professional-grade web-based Integrated Development Environment (IDE) built with React and Node.js, featuring beautiful responsive design, Docker container integration, and enterprise-ready features for isolated development environments. This Cloud IDE provides a complete development experience with advanced file management, professional code editing, integrated terminal access, and real-time collaboration features.

## ✨ Features

### 💻 **Core IDE Features**
- **📁 Advanced File Management**: Complete CRUD operations with drag-drop, context menus, file tree navigation, and bulk operations
- **✏️ Professional Code Editor**: Monaco Editor with syntax highlighting, IntelliSense, auto-completion, multi-tab support, and code folding
- **🖥️ Integrated Terminal**: Full Linux terminal with real-time command execution, WebSocket communication, and session persistence
- **▶️ Smart Code Execution**: Run JavaScript, Python, Java, and shell scripts directly with execution buttons and keyboard shortcuts
- **🔍 Enhanced File Explorer**: Interactive file tree with search, filtering, context menus, and drag-drop support
- **📋 Code Snippets & Templates**: Built-in snippet library and project templates for faster development
- **🔄 Auto-save & Backup**: Intelligent auto-save with configurable intervals and backup management

### 🔐 **Authentication & Security**
- **👤 Robust User Authentication**: Secure JWT-based login/registration with password hashing and token management
- **🏠 Individual Workspaces**: Each user gets their own isolated Docker container with complete data separation
- **🔒 Advanced Authorization**: Role-based access control with workspace-level permissions
- **🛡️ Enterprise Security**: API rate limiting, CORS protection, input validation, and security headers
- **🔑 Session Management**: Secure session handling with automatic token refresh and logout on inactivity
- **🔐 Data Encryption**: Encrypted data transmission and secure storage practices

### 🐳 **Docker Integration & Container Management**
- **📦 Automatic Container Provisioning**: Dynamic Docker container creation with custom configurations
- **🏗️ Multi-language Support**: Pre-configured containers for Node.js, Python, Java, and general development
- **💾 Persistent Storage**: File changes persist across container restarts with volume mounting
- **⚡ Resource Management**: Configurable memory and CPU limits with monitoring and alerts
- **🌐 Network Isolation**: Secure container networking with custom bridge networks
- **🔧 Container Lifecycle**: Complete container management (start, stop, restart, remove, health checks)

### 🌐 **Real-time Features & Communication**
- **🔄 Live Collaboration**: Real-time file synchronization and multi-user workspace support
- **💬 WebSocket Integration**: Instant terminal output, command execution, and file updates
- **📡 Auto-sync**: Automatic synchronization of file changes across sessions
- **🔔 Smart Notifications**: Real-time alerts for system events, errors, and status changes
- **📊 Live Status Indicators**: Real-time connection, container, and service status monitoring
- **🔌 Auto-reconnection**: Intelligent reconnection handling for network interruptions

### 🎨 **Beautiful User Experience & Design**
- **🌈 Modern Glass Morphism Design**: Beautiful gradient backgrounds with backdrop blur effects and smooth animations
- **🌙 Advanced Theme System**: Seamless dark/light mode switching with system preference detection and custom themes
- **📱 Fully Responsive Design**: Mobile-first approach optimized for phones, tablets, and desktop screens
- **⌨️ Comprehensive Accessibility**: Full keyboard navigation, screen reader support, and WCAG compliance
- **🎯 Intuitive Interface**: Clean, professional UI with contextual menus and smart layouts
- **🎭 Rich Interactions**: Hover effects, loading states, micro-interactions, and smooth transitions
- **📐 Adaptive Layouts**: Dynamic layouts that adjust to screen size, orientation, and user preferences
- **🎯 Quick Actions**: One-click buttons for common operations

## 🛠️ Tech Stack

### **Frontend Technologies**
- **⚛️ React 18** - Modern React with hooks, concurrent features, and functional components
- **⚡ Vite** - Lightning-fast build tool with HMR and optimized production builds
- **🎨 Tailwind CSS** - Utility-first CSS framework with custom design system and responsive utilities
- **📝 Monaco Editor** - VS Code's powerful editor with IntelliSense, syntax highlighting, and code completion
- **🔌 Socket.IO Client** - Real-time WebSocket communication for live updates and collaboration
- **🌐 Axios** - HTTP client with interceptors, error handling, and request/response transformation
- **🧭 React Router** - Client-side routing with protected routes and navigation guards
- **🎭 React Context** - State management for authentication, themes, and global application state

### **Backend Technologies**
- **🟢 Node.js 18** - JavaScript runtime with latest features and performance improvements
- **🚀 Express.js** - Fast, unopinionated web framework with comprehensive middleware ecosystem
- **🍃 MongoDB 8.0** - Modern NoSQL database with advanced querying, indexing, and aggregation
- **🐳 Docker SDK (Dockerode)** - Programmatic Docker container management and monitoring
- **🔐 JWT Authentication** - Secure token-based authentication with refresh token support
- **🔒 bcryptjs** - Password hashing with salt for secure user authentication
- **🔌 Socket.IO** - Real-time bidirectional event-based communication
- **🛡️ Security Middleware** - Helmet, CORS, rate limiting, and input validation
- **📊 Mongoose ODM** - Object Document Mapping for MongoDB with schema validation

### **Infrastructure & DevOps**
- **🐳 Docker & Docker Compose** - Containerization with multi-service orchestration
- **🌐 Nginx** - Reverse proxy, load balancer, and SSL termination for production
- **💾 MongoDB** - Persistent data storage with replica set support and backup strategies
- **🔄 Redis** - Caching and session storage for improved performance (optional)
- **🏔️ Alpine Linux** - Lightweight base images for optimized container sizes
- **🔗 Custom Networks** - Isolated container networking for enhanced security
- **📈 Health Checks** - Container and service health monitoring with automatic recovery

### **Development & Build Tools**
- **🔍 ESLint** - Code linting with custom rules and automatic formatting
- **💅 Prettier** - Code formatting for consistent style across the project
- **🔄 Nodemon** - Development server with automatic restart on file changes
- **⚙️ Concurrently** - Run multiple development commands simultaneously
- **🌍 Environment Variables** - Secure configuration management with dotenv
- **📦 npm/yarn** - Package management with lock files for reproducible builds

## 🚀 Getting Started

### **Prerequisites**

- **Docker Desktop** - Latest version with Docker Compose v2.0+
- **Git** - For cloning the repository
- **4GB+ RAM** - Available system memory
- **10GB+ Disk Space** - For Docker images and containers

### **🎯 One-Command Deployment (Recommended)**

1. **Clone the repository:**
```bash
git clone https://github.com/Mo-hit99/CloudIDE.git
cd cloud-ide-editor
```

2. **Deploy with our automated script:**
```bash
# Development deployment (with hot reloading)
./deploy.sh dev

# Production deployment (with Nginx, SSL, caching)
./deploy.sh prod
```

3. **Access your Cloud IDE:**
- **🌐 Frontend**: http://localhost:5173 (beautiful responsive interface)
- **🔧 Backend API**: http://localhost:5000 (RESTful API with documentation)
- **📊 Database**: localhost:27017 (MongoDB with admin interface)
- **❤️ Health Check**: http://localhost:5000/health

### **🛠️ Advanced Deployment Options**

#### **Using Docker Compose Directly**
```bash
# Development environment
docker-compose up -d

# Production environment
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### **Individual Service Management**
```bash
# Build images only
./deploy.sh build

# Clean up old containers/images
./deploy.sh cleanup

# Show service status
./deploy.sh status

# Restart services
./deploy.sh restart

# View real-time logs
./deploy.sh logs
```

### **⚙️ Manual Installation (Development)**

1. **Clone and setup environment:**
```bash
git clone <repository-url>
cd cloud-ide-editor

# Copy environment configuration
cp .env.example .env
# Edit .env with your preferred settings
```

2. **Backend setup:**
```bash
cd backend
npm install
cp .env.example .env
# Configure backend-specific settings
npm run dev
```

3. **Frontend setup:**
```bash
cd frontend
npm install
npm run dev
```

4. **Database setup:**
```bash
# Start MongoDB with Docker
docker run -d --name cloud-ide-mongo \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password123 \
  -e MONGO_INITDB_DATABASE=cloudIDE \
  mongo:8.0
```
```bash
cd frontend
npm run dev
```

## 📁 Project Structure

```
cloud-ide-editor/
├── 📂 frontend/                    # React frontend application
│   ├── 📂 src/
│   │   ├── 📂 Components/          # React components
│   │   │   ├── 📂 Auth/            # Authentication components
│   │   │   │   ├── LoginPage.jsx   # Beautiful login interface
│   │   │   │   └── SignupPage.jsx  # User registration interface
│   │   │   ├── EnhancedCodeEditor.jsx    # Monaco editor integration
│   │   │   ├── EnhancedTerminal.jsx      # WebSocket terminal
│   │   │   ├── EnhancedFolderTree.jsx    # File tree with drag-drop
│   │   │   ├── WorkspaceManager.jsx      # Container management
│   │   │   └── UserProfile.jsx           # User profile management
│   │   ├── 📂 services/            # API and WebSocket services
│   │   │   ├── api.js              # HTTP API client
│   │   │   ├── authAPI.js          # Authentication API
│   │   │   └── websocket.js        # WebSocket communication
│   │   ├── 📂 contexts/            # React contexts
│   │   │   ├── AuthContext.jsx     # Authentication state
│   │   │   └── ThemeContext.jsx    # Theme management
│   │   ├── 📂 styles/              # CSS and styling
│   │   │   ├── scrollbar.css       # Custom scrollbars
│   │   │   └── responsive.css      # Responsive utilities
│   │   ├── 📄 App.jsx              # Main application component
│   │   ├── 📄 AuthenticatedApp.jsx # Authenticated user interface
│   │   └── 📄 main.jsx             # Application entry point
│   ├── 📂 public/                  # Static assets
│   ├── 📄 package.json             # Frontend dependencies
│   ├── 📄 vite.config.js           # Vite configuration
│   ├── 📄 tailwind.config.js       # Tailwind CSS configuration
│   ├── 📄 Dockerfile               # Frontend container image
│   └── 📄 README.md                # Frontend documentation
├── 📂 backend/                     # Node.js backend application
│   ├── 📂 routes/                  # Express routes
│   │   ├── auth.js                 # Authentication & user management
│   │   ├── files.js                # File operations & management
│   │   ├── docker.js               # Container lifecycle management
│   │   └── health.js               # Health check endpoints
│   ├── 📂 models/                  # MongoDB models
│   │   ├── User.js                 # User schema & methods
│   │   └── File.js                 # File metadata schema
│   ├── 📂 middleware/              # Express middleware
│   │   ├── auth.js                 # JWT authentication middleware
│   │   ├── rateLimiter.js          # Rate limiting middleware
│   │   └── errorHandler.js         # Global error handling
│   ├── 📂 services/                # Business logic services
│   │   ├── dockerService.js        # Docker container management
│   │   ├── fileService.js          # File system operations
│   │   └── authService.js          # Authentication logic
│   ├── 📄 package.json             # Backend dependencies
│   ├── 📄 index.js                 # Server entry point
│   ├── 📄 Dockerfile               # Backend container image
│   └── 📄 README.md                # Backend documentation
├── 📂 workspace/                   # User workspace directories
│   ├── 📂 general/                 # General development files
│   ├── 📂 node/                    # Node.js projects
│   ├── 📂 python/                  # Python projects
│   └── 📂 java/                    # Java projects
├── 📄 docker-compose.yml           # Development environment
├── 📄 docker-compose.prod.yml      # Production environment
├── 📄 .env.example                 # Environment configuration template
├── 📄 deploy.sh                    # Automated deployment script
├── 📄 DEPLOYMENT.md                # Deployment documentation
├── 📄 README.md                    # Main project documentation
└── 📄 package.json                 # Root package configuration
```

## 📚 API Documentation

### **🔐 Authentication Endpoints**
| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `POST` | `/api/auth/register` | User registration with automatic workspace creation | `{username, email, password, firstName, lastName}` | `{user, token, containerId}` |
| `POST` | `/api/auth/login` | User login with JWT token generation | `{identifier, password}` | `{user, token, containerId}` |
| `GET` | `/api/auth/me` | Get current authenticated user profile | Headers: `Authorization: Bearer <token>` | `{user, containerId}` |
| `POST` | `/api/auth/logout` | User logout and token invalidation | Headers: `Authorization: Bearer <token>` | `{message}` |
| `PUT` | `/api/auth/change-password` | Change user password securely | `{currentPassword, newPassword}` | `{message}` |
| `POST` | `/api/auth/create-container` | Create development container for user | Headers: `Authorization: Bearer <token>` | `{containerId, status}` |

### **📁 File Management Endpoints**
| Method | Endpoint | Description | Parameters | Response |
|--------|----------|-------------|------------|----------|
| `GET` | `/api/files/tree/:containerId` | Get complete file tree structure with metadata | `containerId` | `{tree: [...]}` |
| `GET` | `/api/files/content/:containerId` | Get file content by path | `containerId`, `?path=<filepath>` | `{content, encoding, size}` |
| `POST` | `/api/files/content/:containerId` | Create or update file content | `{path, content, encoding?}` | `{message, size}` |
| `POST` | `/api/files/create/:containerId` | Create new file or folder | `{path, type: 'file'|'folder', content?}` | `{message, path}` |
| `DELETE` | `/api/files/delete/:containerId` | Delete file or folder recursively | `{path}` | `{message}` |
| `PUT` | `/api/files/rename/:containerId` | Rename or move file/folder | `{oldPath, newPath}` | `{message}` |
| `POST` | `/api/files/execute/:containerId` | Execute file in container | `{path, args?}` | `{output, exitCode}` |
| `GET` | `/api/files/search/:containerId` | Search files by name or content | `?query=<term>&type=<name|content>` | `{results: [...]}` |
### **🐳 Docker Management Endpoints**
| Method | Endpoint | Description | Parameters | Response |
|--------|----------|-------------|------------|----------|
| `GET` | `/api/docker/containers` | List all user containers with status | Headers: `Authorization: Bearer <token>` | `{containers: [...]}` |
| `POST` | `/api/docker/create` | Create new development container | `{image?, name?, resources?}` | `{containerId, status}` |
| `POST` | `/api/docker/start/:containerId` | Start stopped container | `containerId` | `{status, message}` |
| `POST` | `/api/docker/stop/:containerId` | Stop running container gracefully | `containerId` | `{status, message}` |
| `POST` | `/api/docker/restart/:containerId` | Restart container | `containerId` | `{status, message}` |
| `DELETE` | `/api/docker/remove/:containerId` | Remove container and cleanup | `containerId` | `{message}` |
| `GET` | `/api/docker/status/:containerId` | Get detailed container status | `containerId` | `{status, health, resources}` |
| `POST` | `/api/docker/execute/:containerId` | Execute command in container | `{command, workingDir?, env?}` | `{output, exitCode, duration}` |
| `GET` | `/api/docker/logs/:containerId` | Get container logs | `containerId`, `?tail=<lines>&follow=<bool>` | `{logs: [...]}` |

### **⚡ WebSocket Events**
| Event | Direction | Description | Payload |
|-------|-----------|-------------|---------|
| `terminal:input` | Client → Server | Send command to terminal | `{containerId, command, sessionId}` |
| `terminal:output` | Server → Client | Receive terminal output | `{output, type: 'stdout'|'stderr', sessionId}` |
| `terminal:resize` | Client → Server | Resize terminal dimensions | `{cols, rows, sessionId}` |
| `file:change` | Server → Client | File content changed notification | `{path, type: 'created'|'modified'|'deleted'}` |
| `container:status` | Server → Client | Container status update | `{containerId, status, health}` |
| `user:join` | Client → Server | User joined workspace | `{workspaceId, userId}` |
| `user:leave` | Client → Server | User left workspace | `{workspaceId, userId}` |
| `collaboration:cursor` | Bidirectional | Real-time cursor position | `{file, position, userId}` |
| `system:notification` | Server → Client | System notifications | `{type, message, level: 'info'|'warning'|'error'}` |

### **🔍 Health & Monitoring Endpoints**
| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| `GET` | `/health` | Application health check | `{status: 'ok', timestamp, services: {...}}` |
| `GET` | `/api/health/detailed` | Detailed system health | `{database, docker, memory, disk, containers}` |
| `GET` | `/api/metrics` | Application metrics | `{users, containers, files, uptime}` |

## 🎯 Usage Guide & Examples

### **🚀 Getting Started**
1. **🌐 Access**: Navigate to http://localhost:5173 in your browser
2. **📝 Register**: Create a new account with username, email, and password
3. **🔑 Login**: Sign in with your credentials to access your workspace
4. **🐳 Container**: Your personal Docker container is created automatically
5. **💻 Code**: Start creating and editing files in your isolated workspace
6. **▶️ Execute**: Run your code using the integrated terminal or run buttons

### **📁 File Management Examples**

#### **Creating Files & Folders**
```bash
# Through the beautiful UI:
# - Right-click in file tree → "New File" or "New Folder"
# - Use the + button in the file explorer
# - Drag and drop files to organize

# Through terminal commands:
touch app.js                 # Create JavaScript file
touch styles.css             # Create CSS file
mkdir src components         # Create multiple folders
mkdir -p src/components/ui   # Create nested folders
```

#### **File Operations**
```bash
# Copy files
cp app.js app.backup.js

# Move/rename files
mv old-name.js new-name.js

# Delete files (use with caution)
rm unwanted-file.js
rm -rf unwanted-folder/
```

### **💻 Code Editing Features**

#### **Multi-tab Editing**
- **Open Multiple Files**: Click files in the tree to open in new tabs
- **Switch Tabs**: Click tab headers or use `Ctrl+Tab` / `Cmd+Tab`
- **Close Tabs**: Click the × on tab headers or use `Ctrl+W` / `Cmd+W`
- **Auto-save**: Files save automatically every 2 seconds

#### **Advanced Editor Features**
- **IntelliSense**: Auto-completion for JavaScript, Python, HTML, CSS
- **Syntax Highlighting**: Support for 50+ programming languages
- **Code Folding**: Collapse/expand code blocks
- **Find & Replace**: `Ctrl+F` / `Cmd+F` for search, `Ctrl+H` / `Cmd+H` for replace
- **Multi-cursor**: `Alt+Click` to place multiple cursors

### **🖥️ Terminal Usage Examples**

#### **Basic Linux Commands**
```bash
# Navigation
ls -la                       # List files with details
pwd                         # Show current directory
cd /workspace               # Change to workspace directory
cd ..                       # Go up one directory
find . -name "*.js"         # Find all JavaScript files

# File operations
cat app.js                  # Display file content
head -n 10 large-file.txt   # Show first 10 lines
tail -f logs/app.log        # Follow log file
grep "error" logs/*.log     # Search for errors in logs
```

#### **Development Commands**
```bash
# Node.js Development
npm init -y                 # Initialize package.json
npm install express         # Install Express.js
npm install -D nodemon      # Install dev dependencies
node app.js                 # Run JavaScript file
npm start                   # Run npm start script

# Python Development
python3 --version           # Check Python version
pip install requests        # Install Python packages
python script.py            # Run Python script
python -m http.server 8000  # Start simple HTTP server

# Git Operations
git init                    # Initialize repository
git add .                   # Stage all changes
git commit -m "Initial commit"  # Commit changes
git status                  # Check repository status
git log --oneline           # View commit history
```

### **▶️ Code Execution Examples**

#### **JavaScript Execution**
```javascript
// app.js
console.log('Hello, Cloud IDE!');
const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('Hello from Cloud IDE!');
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
```
**Run**: Click ▶️ button or press `Ctrl+R` / `Cmd+R`

#### **Python Execution**
```python
# script.py
import requests
import json

def fetch_data():
    response = requests.get('https://api.github.com/users/octocat')
    return response.json()

if __name__ == "__main__":
    data = fetch_data()
    print(json.dumps(data, indent=2))
```
**Run**: Click ▶️ button or use terminal: `python script.py`

#### **Shell Script Execution**
```bash
#!/bin/bash
# deploy.sh
echo "Starting deployment..."
npm install
npm run build
echo "Deployment complete!"
```
**Run**: `chmod +x deploy.sh && ./deploy.sh`

### **⌨️ Keyboard Shortcuts**

| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| **File Operations** |
| New File | `Ctrl+N` | `Cmd+N` |
| Save File | `Ctrl+S` | `Cmd+S` |
| Open File | `Ctrl+O` | `Cmd+O` |
| Close Tab | `Ctrl+W` | `Cmd+W` |
| **Editor** |
| Find | `Ctrl+F` | `Cmd+F` |
| Replace | `Ctrl+H` | `Cmd+H` |
| Go to Line | `Ctrl+G` | `Cmd+G` |
| Comment Line | `Ctrl+/` | `Cmd+/` |
| **Code Execution** |
| Run File | `Ctrl+R` | `Cmd+R` |
| **Terminal** |
| Focus Terminal | `Ctrl+`` | `Cmd+`` |
| Clear Terminal | `Ctrl+L` | `Cmd+L` |

## 🔧 Environment Configuration

### **📋 Complete Environment Setup**

Copy `.env.example` to `.env` and configure the following variables:

```bash
# =============================================================================
# GENERAL CONFIGURATION
# =============================================================================
NODE_ENV=development                    # Environment: development, production, test
DOMAIN=localhost                        # Application domain (for production)

# =============================================================================
# APPLICATION PORTS
# =============================================================================
BACKEND_PORT=5000                       # Backend API port
FRONTEND_PORT=5173                      # Frontend development port

# =============================================================================
# DATABASE CONFIGURATION
# =============================================================================
MONGO_INITDB_ROOT_USERNAME=admin        # MongoDB admin username
MONGO_INITDB_ROOT_PASSWORD=password123  # MongoDB admin password (CHANGE IN PRODUCTION!)
MONGO_INITDB_DATABASE=cloudIDE          # Default database name

# =============================================================================
# AUTHENTICATION & SECURITY
# =============================================================================
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production  # JWT signing key
JWT_EXPIRES_IN=7d                       # Token expiration time
SESSION_SECRET=your-session-secret-change-this-in-production    # Session secret

# =============================================================================
# DOCKER CONFIGURATION
# =============================================================================
DOCKER_HOST=unix:///var/run/docker.sock # Docker socket path

# =============================================================================
# FRONTEND CONFIGURATION
# =============================================================================
VITE_API_URL=http://localhost:5000      # API URL for frontend

# =============================================================================
# PERFORMANCE & SECURITY
# =============================================================================
LOG_LEVEL=info                          # Logging level
CORS_ORIGINS=http://localhost:5173,http://localhost:3000  # Allowed origins
MAX_FILE_SIZE=10485760                  # Max file upload size (10MB)
CONTAINER_MEMORY_LIMIT=512m             # Container memory limit
CONTAINER_CPU_LIMIT=0.5                 # Container CPU limit
```

## 🚀 Deployment Options

### **⚡ Quick Deployment (Recommended)**

```bash
# Clone repository
git clone <repository-url>
cd cloud-ide-editor

# One-command deployment
./deploy.sh dev     # Development with hot reloading
./deploy.sh prod    # Production with Nginx, SSL, caching
```

### **🐳 Docker Compose Deployment**

#### **Development Environment**
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### **Production Environment**
```bash
# Production deployment with optimizations
docker-compose -f docker-compose.prod.yml up -d

# Scale services (if needed)
docker-compose -f docker-compose.prod.yml up -d --scale backend=2
```

# Start production services
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

### **🎯 Environment-specific Configurations**

| Environment | Features | Use Case |
|-------------|----------|----------|
| **Development** | Hot reloading, debug logging, development tools, exposed ports | Local development and testing |
| **Production** | Optimized builds, SSL termination, caching, resource limits | Live deployment with security |
| **Testing** | Isolated test databases, mock services, test containers | Automated testing and CI/CD |

## 🔒 Security Features

### **🛡️ Authentication & Authorization**
- **🔐 JWT Authentication**: Secure token-based authentication with refresh tokens
- **🔑 Password Security**: bcrypt hashing with salt for secure password storage
- **👥 Role-based Access**: User permissions and workspace-level authorization
- **🎫 Session Management**: Automatic token refresh and secure session handling

### **🚨 API Security**
- **⚡ Rate Limiting**: Configurable rate limits to prevent abuse and DDoS attacks
- **🌐 CORS Protection**: Cross-origin request security with whitelist configuration
- **🔍 Input Validation**: Comprehensive input sanitization and validation
- **🛡️ Security Headers**: Helmet.js for security headers (CSP, HSTS, etc.)

### **🐳 Container Security**
- **🔒 Container Isolation**: Each user has completely isolated Docker workspace
- **🌐 Network Isolation**: Custom Docker networks for secure communication
- **📊 Resource Limits**: Memory and CPU limits to prevent resource exhaustion
- **🔧 Privilege Management**: Minimal privileges for container operations

## 🐛 Troubleshooting & Support

### **🔧 Common Issues & Solutions**

#### **🐳 Docker Issues**
```bash
# Check Docker daemon status
docker info
docker version

# Pull required images
docker pull node:18-alpine
docker pull mongo:8.0

# Clean up Docker system
docker system prune -f
docker volume prune -f
```

#### **🍃 MongoDB Connection Issues**
```bash
# Check MongoDB container status
docker logs cloud-ide-mongo

# Restart MongoDB service
docker restart cloud-ide-mongo

# Connect to MongoDB directly
docker exec -it cloud-ide-mongo mongosh

# Check database connectivity
curl http://localhost:5000/health
```

#### **🌐 Frontend Issues**
```bash
# Clear browser cache and cookies
# Check console for JavaScript errors

# Restart frontend service
docker restart cloud-ide-frontend

# Check frontend logs
docker logs cloud-ide-frontend

# Verify API connectivity
curl http://localhost:5000/health
```

#### **🔧 Backend API Issues**
```bash
# Check backend logs
docker logs cloud-ide-backend

# Verify environment variables
docker exec cloud-ide-backend env | grep -E "(MONGO|JWT|DOCKER)"

# Test API endpoints
curl http://localhost:5000/health
curl http://localhost:5000/api/auth/health
```

### **📊 Health Checks**
```bash
# Application health
curl http://localhost:5000/health

# Detailed system health
curl http://localhost:5000/api/health/detailed

# Container status
./deploy.sh status

# View real-time logs
./deploy.sh logs
```
docker restart cloud-ide-mongo

# Verify MongoDB connection
docker exec -it cloud-ide-mongo mongosh --eval "db.adminCommand('ping')"
```

#### **🔧 Performance Issues**
```bash
# Monitor resource usage
docker stats

# Check disk space
docker system df

# Clean up unused resources
./deploy.sh cleanup

# Optimize container resources
# Edit .env file to adjust CONTAINER_MEMORY_LIMIT and CONTAINER_CPU_LIMIT
```

## 📈 Performance Optimization

### **🚀 Application Performance**
- **⚡ Fast Loading**: Vite for lightning-fast development builds and HMR
- **📦 Code Splitting**: Lazy loading of components for optimal bundle sizes
- **🗜️ Asset Optimization**: Compressed images, fonts, and static assets
- **💨 Caching**: Browser caching and service worker for offline support

### **🐳 Container Performance**
- **📊 Resource Limits**: Configurable memory and CPU constraints per container
- **🔄 Health Monitoring**: Automatic container health checks and restart policies
- **🌐 Network Optimization**: Custom Docker networks for efficient communication
- **💾 Volume Management**: Optimized volume mounting for file operations

### **🍃 Database Performance**
- **📈 Indexing**: Optimized MongoDB queries with proper indexing
- **🔄 Connection Pooling**: Efficient database connection management
- **📊 Query Optimization**: Aggregation pipelines for complex operations
- **💾 Data Compression**: MongoDB compression for storage efficiency

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### **🔧 Development Setup**
```bash
# Fork and clone the repository
git clone https://github.com/your-username/cloud-ide-editor.git
cd cloud-ide-editor

# Create a feature branch
git checkout -b feature/amazing-feature

# Make your changes and test
./deploy.sh dev

# Commit and push
git commit -m 'feat: add amazing feature'
git push origin feature/amazing-feature
```

### **📋 Development Guidelines**
- **🎨 Code Style**: Follow ESLint and Prettier configurations
- **🧪 Testing**: Write unit tests for new features and bug fixes
- **📚 Documentation**: Update README and inline documentation
- **💬 Commit Messages**: Use conventional commit format
- **🔍 Code Review**: All changes require review before merging

### **🐛 Bug Reports**
When reporting bugs, please include:
- Operating system and version
- Docker version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots or logs if applicable

### **💡 Feature Requests**
For new features, please:
- Check existing issues first
- Describe the use case
- Provide mockups or examples
- Consider implementation complexity

## 📊 Project Statistics

| Metric | Value |
|--------|-------|
| **Languages** | JavaScript, HTML, CSS |
| **Framework** | React 18, Node.js 18 |
| **Database** | MongoDB 8.0 |
| **Container** | Docker with Alpine Linux |
| **Build Tool** | Vite |
| **Testing** | Jest, React Testing Library |
| **Code Quality** | ESLint, Prettier |

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### **📜 License Summary**
- ✅ Commercial use allowed
- ✅ Modification allowed
- ✅ Distribution allowed
- ✅ Private use allowed
- ❌ No warranty provided
- ❌ No liability accepted

## 🆘 Support & Community

### **📞 Getting Help**
- **📖 Documentation**: Comprehensive guides in this README
- **🐛 Issues**: [GitHub Issues](https://github.com/your-repo/issues) for bugs and feature requests
- **💬 Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions) for questions
- **📧 Email**: support@cloudide.dev (for enterprise support)

### **🌟 Community**
- **⭐ Star** this repository if you find it useful
- **🍴 Fork** to contribute or customize for your needs
- **📢 Share** with other developers who might benefit
- **🐦 Follow** us on social media for updates

## 🙏 Acknowledgments

### **🛠️ Core Technologies**
- **[Monaco Editor](https://microsoft.github.io/monaco-editor/)** - Microsoft's powerful code editor
- **[Docker](https://www.docker.com/)** - Containerization platform for isolation
- **[React](https://reactjs.org/)** - Frontend library for building user interfaces
- **[Node.js](https://nodejs.org/)** - JavaScript runtime for backend services
- **[MongoDB](https://www.mongodb.com/)** - NoSQL database for data persistence
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework

### **🎨 Design & UX**
- **[Heroicons](https://heroicons.com/)** - Beautiful SVG icons
- **[Google Fonts](https://fonts.google.com/)** - Web fonts for typography
- **[Unsplash](https://unsplash.com/)** - High-quality images and backgrounds

### **🔧 Development Tools**
- **[Vite](https://vitejs.dev/)** - Next-generation frontend build tool
- **[ESLint](https://eslint.org/)** - Code linting and quality assurance
- **[Prettier](https://prettier.io/)** - Code formatting and style consistency

---

<div align="center">

**🌟 Built with ❤️ for developers, by developers 🌟**

*Empowering creativity through accessible, powerful development tools*

[![GitHub stars](https://img.shields.io/github/stars/your-repo/cloud-ide-editor?style=social)](https://github.com/your-repo/cloud-ide-editor)
[![GitHub forks](https://img.shields.io/github/forks/your-repo/cloud-ide-editor?style=social)](https://github.com/your-repo/cloud-ide-editor)
[![GitHub issues](https://img.shields.io/github/issues/your-repo/cloud-ide-editor)](https://github.com/your-repo/cloud-ide-editor/issues)
[![GitHub license](https://img.shields.io/github/license/your-repo/cloud-ide-editor)](https://github.com/your-repo/cloud-ide-editor/blob/main/LICENSE)

</div>