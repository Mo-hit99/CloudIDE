# Cloud IDE Frontend

The frontend application for the Cloud IDE Editor, built with React, Vite, and Tailwind CSS. This modern web application provides a complete IDE experience with code editing, file management, terminal integration, and real-time collaboration features.

## 🚀 Features

### 💻 **Core IDE Interface**
- **📝 Advanced Code Editor**: Monaco Editor with syntax highlighting and IntelliSense
- **📁 File Explorer**: Interactive file tree with drag-drop and context menus
- **🖥️ Integrated Terminal**: Full-featured terminal with WebSocket communication
- **📑 Multi-tab Editor**: Work with multiple files simultaneously
- **🔍 Search & Replace**: Powerful search functionality across files

### 🎨 **User Experience**
- **🌙 Dark/Light Mode**: Automatic theme detection with manual toggle
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **⌨️ Keyboard Shortcuts**: Comprehensive shortcuts for power users
- **🎯 Quick Actions**: One-click buttons for common operations
- **💾 Auto-save**: Automatic file saving with configurable intervals

### 🔐 **Authentication & Security**
- **👤 User Authentication**: Secure login and registration forms
- **🔒 Protected Routes**: Route-based authentication and authorization
- **🎫 Token Management**: Automatic JWT token handling and refresh
- **👥 User Profile**: User profile management and settings

### 🌐 **Real-time Features**
- **🔄 Live Updates**: Real-time file tree and content synchronization
- **💬 WebSocket Integration**: Instant terminal output and command execution
- **📡 Auto-sync**: Automatic synchronization of file changes
- **🔔 Status Indicators**: Real-time connection and execution status

### ⚡ **Performance & Optimization**
- **🚀 Fast Loading**: Vite for lightning-fast development and builds
- **📦 Code Splitting**: Lazy loading of components for optimal performance
- **🗜️ Asset Optimization**: Optimized images, fonts, and static assets
- **💨 Hot Reloading**: Instant updates during development

## 🛠️ Tech Stack

- **⚛️ React 18**: Modern React with Hooks and Context API
- **⚡ Vite**: Next-generation frontend build tool
- **🎨 Tailwind CSS**: Utility-first CSS framework
- **📝 Monaco Editor**: Microsoft's VS Code editor for the web
- **🔌 Socket.IO Client**: Real-time WebSocket communication
- **🌐 Axios**: HTTP client for API requests
- **🧭 React Router**: Client-side routing and navigation
- **🎭 React Context**: State management for authentication and themes

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+**
- **npm or yarn**

### Installation

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start the development server:**
```bash
npm run dev
```

4. **Access the application:**
- **Development**: http://localhost:5173
- **Network**: Available on local network
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Docker Development
```bash
# Run with Docker Compose (recommended)
docker-compose up frontend

# Access at http://localhost:5173
```

## Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── CodeEditor.jsx   # Main code editor
│   │   ├── FolderTree.jsx   # File tree navigation
│   │   ├── Terminal.jsx     # Terminal interface
│   │   └── ContainerSelector.jsx # Container management
│   ├── services/            # API and service layers
│   │   ├── api.js          # HTTP API client
│   │   └── socket.js       # WebSocket client
│   ├── App.jsx             # Main application component
│   ├── main.jsx            # Application entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── index.html             # HTML template
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── package.json           # Dependencies and scripts
└── Dockerfile             # Container configuration
```

## Configuration

### Environment Variables
```bash
VITE_API_URL=http://localhost:5000  # Backend API URL
VITE_WS_URL=http://localhost:5000   # WebSocket URL
```

### Vite Configuration
The project uses Vite with React plugin and optimized for development and production builds.

### Tailwind CSS
Configured with dark mode support and custom color schemes for the IDE interface.

## API Integration

The frontend communicates with the backend through:
- **REST API**: File operations, container management
- **WebSocket**: Real-time terminal communication, live updates

### Key API Endpoints
- `GET /api/containers` - List available containers
- `GET /api/files/:containerId/*` - Browse file system
- `POST /api/files/:containerId/*` - Create files/folders
- `PUT /api/files/:containerId/*` - Update file content
- `DELETE /api/files/:containerId/*` - Delete files/folders

## Features in Detail

### Code Editor
- Multi-language syntax highlighting
- Auto-completion and IntelliSense
- Find and replace functionality
- Customizable themes (light/dark)
- Keyboard shortcuts support

### File Management
- Real-time file tree updates
- Context menu operations
- Drag and drop support
- File type detection
- Path breadcrumb navigation

### Terminal Integration
- Multiple terminal sessions
- Command history
- Ctrl+C and Ctrl+D support
- Real-time output streaming
- Terminal resizing

### Container Management
- Live container status monitoring
- Easy switching between environments
- Container health checks
- Start/stop container operations

## Build and Deployment

### Development Build
```bash
npm run dev
```
Starts development server with hot reloading at `http://localhost:5173`

### Production Build
```bash
npm run build
```
Creates optimized production build in `dist/` directory

### Docker Deployment
```bash
# Development
docker-compose up frontend

# Production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up frontend
```

## ⌨️ Keyboard Shortcuts

### Global Shortcuts
- **Ctrl/Cmd + S**: Save current file
- **Ctrl/Cmd + O**: Open file
- **Ctrl/Cmd + N**: New file
- **Ctrl/Cmd + W**: Close current tab
- **Ctrl/Cmd + R**: Run current file
- **Ctrl/Cmd + `**: Toggle terminal
- **Ctrl/Cmd + B**: Toggle file explorer

### Editor Shortcuts
- **Ctrl/Cmd + F**: Find in file
- **Ctrl/Cmd + H**: Find and replace
- **Ctrl/Cmd + G**: Go to line
- **Ctrl/Cmd + /**: Toggle comment
- **Alt + Up/Down**: Move line up/down

## 🐛 Troubleshooting

### Common Issues

**Development Server Won't Start:**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check port availability
lsof -i :5173
```

**API Connection Issues:**
```bash
# Check backend server status
curl http://localhost:5000/health

# Verify VITE_API_URL in .env file
echo $VITE_API_URL
```

**Build Failures:**
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Update dependencies
npm update
```

## 🤝 Contributing

### Development Guidelines
1. Follow React best practices and hooks patterns
2. Write unit tests for new components
3. Follow the established folder structure
4. Use conventional commit messages

### Code Standards
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Conventional Commits**: Commit message format

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Follow React best practices
2. Use functional components with hooks
3. Implement proper error handling
4. Add TypeScript types where beneficial
5. Test across different browsers
6. Ensure responsive design

## Troubleshooting

### Common Issues

**Hot reloading not working:**
- Check if Vite dev server is running
- Verify file watching permissions
- Restart the development server

**API connection errors:**
- Ensure backend is running on port 5000
- Check CORS configuration
- Verify environment variables

**WebSocket connection issues:**
- Check browser console for errors
- Verify Socket.IO server is running
- Check firewall settings

**Build errors:**
- Clear node_modules and reinstall
- Check for dependency conflicts
- Verify Node.js version compatibility

