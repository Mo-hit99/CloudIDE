import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// Rate limiting middleware - Increased default limits
export const createRateLimit = (windowMs = 15 * 60 * 1000, max = 1000) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Docker operations rate limit (increased)
export const dockerRateLimit = createRateLimit(5 * 60 * 1000, 200); // Increased from 50 to 200 requests per 5 minutes

// File operations rate limit (increased)
export const fileRateLimit = createRateLimit(1 * 60 * 1000, 500); // Increased from 100 to 500 requests per minute

// Terminal operations rate limit (increased)
export const terminalRateLimit = createRateLimit(1 * 60 * 1000, 1000); // Increased from 200 to 1000 requests per minute

// Input validation middleware
export const validateContainerId = (req, res, next) => {
  const { containerId, id } = req.params;
  const containerIdToValidate = containerId || id;

  if (!containerIdToValidate) {
    return res.status(400).json({ error: 'Container ID is required' });
  }

  // Validate container ID format - support both Docker IDs and simulated IDs
  const isDockerFormat = /^[a-f0-9]{12,64}$/i.test(containerIdToValidate);
  const isSimulatedFormat = /^sim_/.test(containerIdToValidate);

  if (!isDockerFormat && !isSimulatedFormat) {
    return res.status(400).json({
      error: 'Invalid container ID format',
      details: 'Container ID must be either a Docker container ID or a simulated workspace ID'
    });
  }

  next();
};

// Path validation middleware
export const validatePath = (req, res, next) => {
  const { path } = req.query || req.body;
  
  if (!path) {
    return res.status(400).json({ error: 'Path is required' });
  }
  
  // Prevent directory traversal attacks
  if (path.includes('..') || path.includes('~')) {
    return res.status(400).json({ error: 'Invalid path: directory traversal not allowed' });
  }
  
  // Ensure path starts with /
  if (!path.startsWith('/')) {
    return res.status(400).json({ error: 'Path must be absolute (start with /)' });
  }
  
  // Prevent access to sensitive system directories
  const forbiddenPaths = ['/etc/passwd', '/etc/shadow', '/root', '/proc', '/sys'];
  if (forbiddenPaths.some(forbidden => path.startsWith(forbidden))) {
    return res.status(403).json({ error: 'Access to this path is forbidden' });
  }
  
  next();
};

// Command validation middleware
export const validateCommand = (req, res, next) => {
  const { command } = req.body;
  
  if (!command) {
    return res.status(400).json({ error: 'Command is required' });
  }
  
  if (typeof command !== 'string') {
    return res.status(400).json({ error: 'Command must be a string' });
  }
  
  // Prevent dangerous commands
  const dangerousCommands = [
    'rm -rf /',
    'dd if=',
    'mkfs',
    'fdisk',
    'format',
    'shutdown',
    'reboot',
    'halt',
    'poweroff'
  ];
  
  const lowerCommand = command.toLowerCase();
  if (dangerousCommands.some(dangerous => lowerCommand.includes(dangerous))) {
    return res.status(403).json({ error: 'Command contains forbidden operations' });
  }
  
  next();
};

// File content validation middleware
export const validateFileContent = (req, res, next) => {
  const { content } = req.body;
  
  if (content === undefined || content === null) {
    return res.status(400).json({ error: 'Content is required' });
  }
  
  if (typeof content !== 'string') {
    return res.status(400).json({ error: 'Content must be a string' });
  }
  
  // Limit file size (10MB)
  const maxSize = 10 * 1024 * 1024;
  if (Buffer.byteLength(content, 'utf8') > maxSize) {
    return res.status(413).json({ error: 'File content too large (max 10MB)' });
  }
  
  next();
};

// Container creation validation
export const validateContainerConfig = (req, res, next) => {
  const { image, name, cmd, workingDir, volumes } = req.body;
  
  if (!image) {
    return res.status(400).json({ error: 'Image is required' });
  }
  
  if (name && !/^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(name)) {
    return res.status(400).json({ error: 'Invalid container name format' });
  }
  
  if (workingDir && !workingDir.startsWith('/')) {
    return res.status(400).json({ error: 'Working directory must be absolute' });
  }
  
  if (volumes && !Array.isArray(volumes)) {
    return res.status(400).json({ error: 'Volumes must be an array' });
  }
  
  if (cmd && !Array.isArray(cmd)) {
    return res.status(400).json({ error: 'Command must be an array' });
  }
  
  next();
};

// Error handling middleware
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Docker API errors
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.reason || err.message || 'Docker operation failed'
    });
  }
  
  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: err.message
    });
  }
  
  // Default error
  res.status(500).json({
    error: 'Internal server error'
  });
};

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// CORS configuration
export const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost and development origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:8080',
      'https://cloud-ide-frontend.onrender.com',
      'https://cloud-ide-frontend-render.onrender.com',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
