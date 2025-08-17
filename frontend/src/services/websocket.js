import { io } from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.eventHandlers = new Map();
    this.socketUrl = null;
  }

  connect(url = null) {
    // Auto-detect API URL based on environment
    const getAPIBaseURL = () => {
      // If VITE_API_URL is set, use it
      if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
      }
      
      // In production (built app), use the deployed backend URL
      if (import.meta.env.VITE_PROD) {
        return 'https://cloud-ide-backend.onrender.com';
      }
      
      // In development, default to localhost
      return 'http://localhost:5000';
    };

    // Convert HTTP URL to WebSocket URL
    const getWebSocketURL = (httpUrl) => {
      if (!httpUrl) return null;
      
      // Convert https:// to wss:// and http:// to ws://
      if (httpUrl.startsWith('https://')) {
        return httpUrl.replace('https://', 'wss://');
      } else if (httpUrl.startsWith('http://')) {
        return httpUrl.replace('http://', 'ws://');
      }
      
      return httpUrl;
    };

    // Set WebSocket URL based on environment
    if (url) {
      this.socketUrl = getWebSocketURL(url);
    } else {
      // Convert HTTP URL to WebSocket URL
      const httpUrl = getAPIBaseURL();
      this.socketUrl = getWebSocketURL(httpUrl);
    }

    if (this.socket && this.socket.connected) {
      console.log('WebSocket already connected');
      return this.socket;
    }

    if (this.socket) {
      this.disconnect();
    }

    console.log('Connecting to WebSocket server:', this.socketUrl);
    console.log('WebSocket connection details:', {
      url: this.socketUrl,
      transports: ['websocket', 'polling'],
      timeout: 20000,
      withCredentials: true
    });

    this.socket = io(this.socketUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      upgrade: true,
      rememberUpgrade: true,
      withCredentials: true,
      extraHeaders: {
        'Access-Control-Allow-Origin': '*'
      }
    });

    this.setupEventHandlers();
    return this.socket;
  }

  setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connection:status', { connected: true });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.isConnected = false;
      this.emit('connection:status', { connected: false, reason });
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, don't reconnect
        return;
      }
      
      this.handleReconnect();
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      console.error('WebSocket connection details:', {
        url: this.socketUrl,
        error: error.message,
        type: error.type,
        description: error.description,
        context: error.context,
        code: error.code
      });
      
      // Log additional debugging information
      console.log('Connection attempt details:', {
        socketUrl: this.socketUrl,
        transports: this.socket.io.opts.transports,
        timeout: this.socket.io.opts.timeout,
        withCredentials: this.socket.io.opts.withCredentials
      });
      
      this.emit('connection:error', { error: error.message });
      this.handleReconnect();
    });

    // Terminal event handlers
    this.socket.on('terminal:connected', (data) => {
      console.log('Terminal connected:', data);
      this.emit('terminal:connected', data);
    });

    this.socket.on('terminal:output', (data) => {
      this.emit('terminal:output', data);
    });

    this.socket.on('terminal:error', (data) => {
      console.error('Terminal error:', data);
      this.emit('terminal:error', data);
    });

    this.socket.on('terminal:disconnected', () => {
      console.log('Terminal disconnected');
      this.emit('terminal:disconnected');
    });

    // File watching event handlers
    this.socket.on('file:watch:started', (data) => {
      this.emit('file:watch:started', data);
    });

    this.socket.on('file:watch:stopped', (data) => {
      this.emit('file:watch:stopped', data);
    });

    this.socket.on('file:changed', (data) => {
      this.emit('file:changed', data);
    });
  }

  handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      this.emit('connection:failed');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      if (!this.isConnected && this.socket) {
        this.socket.connect();
      }
    }, delay);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.reconnectAttempts = 0;
  }

  // Event handling methods
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event).add(handler);
  }

  off(event, handler) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).delete(handler);
    }
  }

  emit(event, data) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error('Error in event handler:', error);
        }
      });
    }
  }

  // Terminal methods
  connectTerminal(containerId, workingDir = '/app', workspaceId = null) {
    if (!this.socket || !this.isConnected) {
      throw new Error('WebSocket not connected');
    }

    console.log('Connecting to terminal for container:', containerId);
    this.socket.emit('terminal:connect', { containerId, workingDir, workspaceId });
  }

  sendTerminalInput(input) {
    if (!this.socket || !this.isConnected) {
      throw new Error('WebSocket not connected');
    }

    console.log('Sending terminal input:', input);
    this.socket.emit('terminal:input', input);
  }

  resizeTerminal(rows, cols) {
    if (!this.socket || !this.isConnected) {
      return;
    }
    
    this.socket.emit('terminal:resize', { rows, cols });
  }

  disconnectTerminal() {
    if (!this.socket || !this.isConnected) {
      return;
    }
    
    this.socket.emit('terminal:disconnect');
  }

  // File watching methods
  watchFile(containerId, filePath) {
    if (!this.socket || !this.isConnected) {
      throw new Error('WebSocket not connected');
    }
    
    this.socket.emit('file:watch', { containerId, filePath });
  }

  unwatchFile(filePath) {
    if (!this.socket || !this.isConnected) {
      return;
    }
    
    this.socket.emit('file:unwatch', { filePath });
  }

  // Utility methods
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;
