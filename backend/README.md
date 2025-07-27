# Cloud IDE Backend

The backend service for the Cloud IDE Editor, built with Node.js, Express, and MongoDB. This service provides authentication, file management, Docker container integration, and real-time WebSocket communication.

## 🚀 Features

### 🔐 **Authentication & Authorization**
- **JWT-based Authentication**: Secure token-based user authentication
- **User Registration & Login**: Complete user management system
- **Password Security**: bcrypt hashing with salt for secure password storage
- **Session Management**: Automatic token refresh and session handling
- **Workspace Authorization**: Users can only access their own containers and files

### 📁 **File Management**
- **CRUD Operations**: Create, read, update, delete files and folders
- **File Tree API**: Hierarchical file structure with metadata
- **File Content Management**: Read and write file contents with encoding support
- **File Operations**: Rename, move, copy files and directories
- **Path Validation**: Security validation for file paths and operations

### 🐳 **Docker Integration**
- **Container Management**: Automatic container creation and lifecycle management
- **Workspace Isolation**: Each user gets their own Docker container
- **Command Execution**: Execute commands in user containers
- **Resource Management**: Memory and CPU limits for containers
- **Container Health Monitoring**: Health checks and status monitoring

### 🌐 **Real-time Communication**
- **WebSocket Support**: Socket.IO for real-time terminal and file updates
- **Terminal Integration**: Interactive terminal sessions with TTY support
- **Live File Updates**: Real-time file tree and content synchronization
- **Command Execution**: Real-time command output streaming

### 🛡️ **Security & Performance**
- **Rate Limiting**: Configurable rate limits for API endpoints
- **Input Validation**: Comprehensive input sanitization and validation
- **CORS Protection**: Cross-origin request security
- **Security Headers**: Helmet.js for security headers
- **Error Handling**: Structured error responses and logging

## 🛠️ Tech Stack

- **🟢 Node.js 18+**: JavaScript runtime
- **⚡ Express.js**: Web application framework
- **🍃 MongoDB**: NoSQL database with Mongoose ODM
- **🐳 Docker**: Container management with Dockerode
- **🔌 Socket.IO**: Real-time WebSocket communication
- **🔐 JWT**: JSON Web Tokens for authentication
- **🛡️ bcrypt**: Password hashing and security
- **📊 Winston**: Logging and monitoring

## 📁 Project Structure

```
backend/
├── 📂 routes/                   # Express route handlers
│   ├── auth.js                  # Authentication routes
│   ├── files.js                 # File management routes
│   └── docker.js                # Container management routes
├── 📂 models/                   # MongoDB models
│   └── User.js                  # User model with workspace
├── 📂 middleware/               # Express middleware
│   ├── auth.js                  # Authentication middleware
│   └── security.js              # Security and validation middleware
├── 📂 services/                 # Business logic services
│   ├── containerService.js      # Docker container management
│   └── websocket.js             # WebSocket event handlers
├── 📄 index.js                  # Main application entry point
├── 📄 package.json              # Dependencies and scripts
├── 📄 .env.example              # Environment variables template
└── 📄 Dockerfile               # Docker container configuration
```

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+**
- **MongoDB** (local or Docker)
- **Docker** (for container management)

### Installation

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start MongoDB:**
```bash
# Using Docker
docker run -d --name mongodb -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password123 \
  mongo:8.0

# Or use existing MongoDB installation
```

4. **Start the development server:**
```bash
npm run dev
```

5. **Access the API:**
- **API Base URL**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 🔧 Environment Configuration

### Required Environment Variables

```bash
# Server Configuration
PORT=5000                        # Server port
NODE_ENV=development             # Environment (development/production)

# Database Configuration
MONGO_URI=mongodb://admin:password123@localhost:27017/cloudIDE?authSource=admin

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d               # Token expiration time

# Docker Configuration
DOCKER_HOST=unix:///var/run/docker.sock  # Docker daemon socket

# Security (Optional)
SESSION_SECRET=your-session-secret-change-this-in-production
BCRYPT_ROUNDS=12                # bcrypt hashing rounds
```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com", 
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <jwt-token>
```

### File Management Endpoints

#### Get File Tree
```http
GET /api/files/tree/:containerId?path=/workspace
Authorization: Bearer <jwt-token>
```

#### Get File Content
```http
GET /api/files/content/:containerId?path=/workspace/file.js
Authorization: Bearer <jwt-token>
```

#### Create File/Folder
```http
POST /api/files/create/:containerId
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "path": "/workspace/newfile.js",
  "type": "file",
  "content": "console.log('Hello World');"
}
```

#### Execute File
```http
POST /api/files/execute/:containerId
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "filePath": "/workspace/script.js",
  "workingDir": "/workspace"
}
```

### Docker Management Endpoints

#### List Containers
```http
GET /api/docker/containers
Authorization: Bearer <jwt-token>
```

#### Execute Command
```http
POST /api/docker/containers/:id/exec
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "command": "ls -la",
  "workingDir": "/workspace"
}
```

## 🔌 WebSocket Events

### Terminal Events
- `terminal:connect` - Connect to container terminal
- `terminal:input` - Send input to terminal
- `terminal:output` - Receive terminal output
- `terminal:disconnect` - Disconnect from terminal
- `terminal:resize` - Resize terminal

### File Events
- `file:watch` - Watch file changes
- `file:update` - File content updated
- `file:create` - File created
- `file:delete` - File deleted

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Structure
```
tests/
├── unit/                       # Unit tests
├── integration/                # Integration tests
└── fixtures/                   # Test data and fixtures
```

## 🚀 Deployment

### Production Build
```bash
# Build Docker image
docker build -t cloud-ide-backend .

# Run production container
docker run -d \
  --name cloud-ide-backend \
  -p 5000:5000 \
  --privileged \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -e NODE_ENV=production \
  -e MONGO_URI=mongodb://... \
  -e JWT_SECRET=... \
  cloud-ide-backend
```

### Health Monitoring
- **Health Check Endpoint**: `GET /health`
- **Metrics Endpoint**: `GET /metrics` (if enabled)
- **Docker Health Check**: Built into Dockerfile

## 🔒 Security Considerations

### Authentication Security
- JWT tokens with configurable expiration
- bcrypt password hashing with salt
- Rate limiting on authentication endpoints
- Session management and token refresh

### Container Security
- User workspace isolation
- Resource limits (memory, CPU)
- Restricted container capabilities
- Secure Docker socket access

### API Security
- Input validation and sanitization
- CORS protection
- Security headers (Helmet.js)
- Rate limiting per endpoint
- Error message sanitization

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Failed:**
```bash
# Check MongoDB status
docker logs mongodb

# Verify connection string
echo $MONGO_URI
```

**Docker Socket Permission Denied:**
```bash
# Add user to docker group (Linux)
sudo usermod -aG docker $USER

# Or run with sudo (not recommended for production)
sudo npm run dev
```

**Container Creation Failed:**
```bash
# Check Docker daemon
docker info

# Pull required images
docker pull node:18-alpine
```

**Port Already in Use:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill process or change PORT in .env
export PORT=5001
```

## 📊 Performance Optimization

### Database Optimization
- MongoDB indexing for frequently queried fields
- Connection pooling and optimization
- Query optimization and aggregation

### Container Management
- Container resource limits
- Container lifecycle optimization
- Image caching and optimization

### API Performance
- Response caching where appropriate
- Efficient file streaming
- Optimized WebSocket communication

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Install dependencies: `npm install`
4. Start development server: `npm run dev`
5. Run tests: `npm test`
6. Submit pull request

### Code Standards
- ESLint configuration for code quality
- Prettier for code formatting
- Conventional commits for commit messages
- Unit tests for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.
