import express from 'express';
import Docker from 'dockerode';
import {
  dockerRateLimit,
  validateContainerId,
  validateCommand,
  validateContainerConfig
} from '../middleware/security.js';

const router = express.Router();

// Initialize Docker with better error handling
let docker;
try {
  docker = new Docker();
  console.log('Docker client initialized successfully');
} catch (error) {
  console.error('Failed to initialize Docker client:', error);
  docker = null;
}

// Middleware to check Docker connection
const checkDockerConnection = async (req, res, next) => {
  if (!docker) {
    return res.status(503).json({
      error: 'Docker service unavailable - client not initialized'
    });
  }

  try {
    // Test Docker connection
    await docker.ping();
    next();
  } catch (error) {
    console.error('Docker connection test failed:', error);
    return res.status(503).json({
      error: 'Docker daemon not accessible',
      details: error.message
    });
  }
};

// Get list of all containers
router.get('/containers', dockerRateLimit, checkDockerConnection, async (req, res) => {
  try {
    const containers = await docker.listContainers({ all: true });
    const formattedContainers = containers.map(container => ({
      id: container.Id,
      name: container.Names[0].replace('/', ''),
      image: container.Image,
      state: container.State,
      status: container.Status,
      created: container.Created,
      ports: container.Ports
    }));
    res.json(formattedContainers);
  } catch (error) {
    console.error('Error listing containers:', error);

    // Provide more detailed error information
    if (error.code === 'EACCES') {
      res.status(500).json({
        error: 'Permission denied accessing Docker socket',
        details: 'The backend container does not have permission to access the Docker daemon. Please check Docker socket permissions.',
        code: 'DOCKER_PERMISSION_DENIED'
      });
    } else if (error.code === 'ENOENT') {
      res.status(500).json({
        error: 'Docker socket not found',
        details: 'The Docker socket file does not exist or is not accessible.',
        code: 'DOCKER_SOCKET_NOT_FOUND'
      });
    } else {
      res.status(500).json({
        error: 'Failed to list containers',
        details: error.message,
        code: error.code || 'UNKNOWN_ERROR'
      });
    }
  }
});

// Docker health check endpoint
router.get('/health', async (req, res) => {
  try {
    if (!docker) {
      return res.status(503).json({
        status: 'error',
        message: 'Docker client not initialized',
        docker_available: false
      });
    }

    // Test Docker daemon connection
    const info = await docker.info();
    const version = await docker.version();

    res.json({
      status: 'healthy',
      message: 'Docker daemon accessible',
      docker_available: true,
      docker_info: {
        version: version.Version,
        api_version: version.ApiVersion,
        containers: info.Containers,
        images: info.Images,
        server_version: info.ServerVersion
      }
    });
  } catch (error) {
    console.error('Docker health check failed:', error);
    res.status(503).json({
      status: 'error',
      message: 'Docker daemon not accessible',
      docker_available: false,
      error: error.message,
      error_code: error.code
    });
  }
});

// Get container details
router.get('/containers/:id', dockerRateLimit, validateContainerId, async (req, res) => {
  try {
    const container = docker.getContainer(req.params.id);
    const info = await container.inspect();
    res.json(info);
  } catch (error) {
    console.error('Error getting container details:', error);
    res.status(500).json({ error: 'Failed to get container details' });
  }
});

// Start a container
router.post('/containers/:id/start', dockerRateLimit, validateContainerId, async (req, res) => {
  try {
    const container = docker.getContainer(req.params.id);
    await container.start();
    res.json({ message: 'Container started successfully' });
  } catch (error) {
    console.error('Error starting container:', error);
    res.status(500).json({ error: 'Failed to start container' });
  }
});

// Stop a container
router.post('/containers/:id/stop', dockerRateLimit, validateContainerId, async (req, res) => {
  try {
    const container = docker.getContainer(req.params.id);
    await container.stop();
    res.json({ message: 'Container stopped successfully' });
  } catch (error) {
    console.error('Error stopping container:', error);
    res.status(500).json({ error: 'Failed to stop container' });
  }
});

// Execute command in container
router.post('/containers/:id/exec', dockerRateLimit, validateContainerId, validateCommand, async (req, res) => {
  try {
    const { command, workingDir = '/app' } = req.body;
    const container = docker.getContainer(req.params.id);
    
    const exec = await container.exec({
      Cmd: command.split(' '),
      AttachStdout: true,
      AttachStderr: true,
      WorkingDir: workingDir
    });
    
    const stream = await exec.start();
    let output = '';
    
    stream.on('data', (chunk) => {
      output += chunk.toString();
    });
    
    stream.on('end', () => {
      res.json({ output: output.trim() });
    });
    
  } catch (error) {
    console.error('Error executing command:', error);
    res.status(500).json({ error: 'Failed to execute command' });
  }
});

// Create a new container
router.post('/containers', async (req, res) => {
  try {
    const { image, name, cmd, workingDir = '/app', volumes = [] } = req.body;
    
    const container = await docker.createContainer({
      Image: image,
      name: name,
      Cmd: cmd,
      WorkingDir: workingDir,
      HostConfig: {
        Binds: volumes
      },
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      Tty: true,
      OpenStdin: true
    });
    
    res.json({ 
      id: container.id,
      message: 'Container created successfully' 
    });
  } catch (error) {
    console.error('Error creating container:', error);
    res.status(500).json({ error: 'Failed to create container' });
  }
});

// Get list of images
router.get('/images', async (req, res) => {
  try {
    const images = await docker.listImages();
    const formattedImages = images.map(image => ({
      id: image.Id,
      tags: image.RepoTags,
      created: image.Created,
      size: image.Size
    }));
    res.json(formattedImages);
  } catch (error) {
    console.error('Error listing images:', error);
    res.status(500).json({ error: 'Failed to list images' });
  }
});

export default router;
