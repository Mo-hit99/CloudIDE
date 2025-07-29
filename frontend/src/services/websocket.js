import { io } from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.eventHandlers = new Map();
  }

  connect(url = null) {
    const socketUrl = url || import.meta.env.VITE_API_URL || 'http://localhost:5000';

    if (this.socket && this.socket.connected) {
      console.log('WebSocket already connected');
      return this.socket;
    }

    if (this.socket) {
      this.disconnect();
    }

    console.log('Connecting to WebSocket server:', socketUrl);

    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      forceNew: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
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
