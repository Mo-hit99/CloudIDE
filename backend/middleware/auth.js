import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware to authenticate JWT token
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access token is required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Check if user still exists and is active
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Invalid or expired token'
      });
    }

    // Add user info to request
    req.user = {
      userId: user._id,
      username: user.username,
      email: user.email,
      workspaceId: user.workspaceId,
      containerId: user.containerId
    };

    next();
  } catch (error) {
    console.error('Token authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired'
      });
    }

    res.status(500).json({
      error: 'Internal server error during authentication'
    });
  }
};

// Middleware to check if user owns the resource (workspace/container)
export const authorizeWorkspace = (req, res, next) => {
  try {
    const { containerId, workspaceId } = req.params;
    const userContainerId = req.user.containerId;
    const userWorkspaceId = req.user.workspaceId;

    // Check container access
    if (containerId && containerId !== userContainerId) {
      return res.status(403).json({
        error: 'Access denied: You do not have permission to access this container'
      });
    }

    // Check workspace access
    if (workspaceId && workspaceId !== userWorkspaceId) {
      return res.status(403).json({
        error: 'Access denied: You do not have permission to access this workspace'
      });
    }

    next();
  } catch (error) {
    console.error('Authorization error:', error);
    res.status(500).json({
      error: 'Internal server error during authorization'
    });
  }
};

// Optional authentication - doesn't fail if no token provided
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId);
    
    if (user && user.isActive) {
      req.user = {
        userId: user._id,
        username: user.username,
        email: user.email,
        workspaceId: user.workspaceId,
        containerId: user.containerId
      };
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    // For optional auth, we don't fail on token errors
    req.user = null;
    next();
  }
};

// Middleware to ensure user has a container
export const ensureContainer = async (req, res, next) => {
  try {
    if (!req.user.containerId) {
      return res.status(400).json({
        error: 'User container not available. Please contact support.'
      });
    }
    next();
  } catch (error) {
    console.error('Container check error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Admin role check (for future use)
export const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user || !user.isAdmin) {
      return res.status(403).json({
        error: 'Admin access required'
      });
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};
