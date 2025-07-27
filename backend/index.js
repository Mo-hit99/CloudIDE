import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Import routes
import dockerRoutes from './routes/docker.js';
import fileRoutes from './routes/files.js';
import authRoutes from './routes/auth.js';
import { setupWebSocketHandlers } from './services/websocket.js';

// Import security middleware
import {
  securityHeaders,
  corsOptions,
  createRateLimit,
  errorHandler
} from './middleware/security.js';

// Load environment variables early
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: corsOptions
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/cloudIDE';

// Security middleware
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(createRateLimit()); // General rate limiting
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
  res.send('Cloud IDE API is running');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/docker', dockerRoutes);
app.use('/api/files', fileRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Setup WebSocket handlers
setupWebSocketHandlers(io);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log('WebSocket server ready for terminal connections');
  console.log('Security middleware enabled');
});