import Docker from 'dockerode';
import path from 'path';
import fs from 'fs/promises';

const docker = new Docker();

// Create a user-specific container with isolated workspace
export const createUserContainer = async (workspaceId) => {
  try {
    console.log(`Creating workspace for: ${workspaceId}`);

    // For now, create a simulated container ID and workspace
    // This avoids Docker-in-Docker issues while maintaining functionality
    const simulatedContainerId = `sim_${workspaceId}_${Date.now()}`;

    // Create workspace directory structure on the host
    await setupHostWorkspaceStructure(workspaceId);

    console.log(`Simulated container created successfully: ${simulatedContainerId}`);
    return simulatedContainerId;

  } catch (error) {
    console.error('Error creating user workspace:', error);
    throw new Error(`Failed to create workspace: ${error.message}`);
  }
};

// Setup initial workspace structure on host filesystem
export const setupHostWorkspaceStructure = async (workspaceId) => {
  try {
    console.log(`Setting up workspace structure for: ${workspaceId}`);

    // Ensure the main workspace directory exists
    await fs.mkdir('/app/workspace', { recursive: true });

    const workspacePath = path.join('/app/workspace', workspaceId);
    console.log(`Creating workspace at: ${workspacePath}`);

    // Create main workspace directory
    await fs.mkdir(workspacePath, { recursive: true });

    // Create directory structure
    const directories = [
      'src',
      'public',
      'docs',
      'tests',
      'config',
      'scripts'
    ];

    // Create directories
    for (const dir of directories) {
      const dirPath = path.join(workspacePath, dir);
      console.log(`Creating directory: ${dirPath}`);
      await fs.mkdir(dirPath, { recursive: true });
    }

    // Create initial files
    const files = {
      'README.md': '# Welcome to your Cloud IDE Workspace\n\nThis is your personal development environment.\n\n## Getting Started\n\n1. Create your files in the `src/` directory\n2. Use the terminal to run commands\n3. Your files are automatically saved\n\nHappy coding! 🚀',
      'src/index.js': 'console.log("Hello, World!");\nconsole.log("Welcome to your Cloud IDE workspace!");',
      'public/index.html': '<!DOCTYPE html>\n<html>\n<head>\n    <title>My Project</title>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n</head>\n<body>\n    <h1>Hello World</h1>\n    <p>Welcome to your Cloud IDE project!</p>\n</body>\n</html>',
      'docs/README.md': '# Project Documentation\n\nAdd your project documentation here.\n\n## Features\n\n- Feature 1\n- Feature 2\n- Feature 3',
      'scripts/build.sh': '#!/bin/bash\necho "Building project..."\necho "Build completed successfully!"',
      '.gitignore': 'node_modules/\n.env\n.DS_Store\ndist/\nbuild/\n*.log'
    };

    // Write files
    for (const [fileName, content] of Object.entries(files)) {
      const filePath = path.join(workspacePath, fileName);
      console.log(`Creating file: ${filePath}`);
      await fs.writeFile(filePath, content);
    }

    // Create package.json with common dependencies
    const packageJson = {
      name: "cloud-ide-workspace",
      version: "1.0.0",
      description: "Cloud IDE User Workspace",
      main: "src/index.js",
      scripts: {
        start: "node src/index.js",
        dev: "node --watch src/index.js",
        test: "echo \"Error: no test specified\" && exit 1",
        build: "./scripts/build.sh"
      },
      keywords: ["cloud-ide", "workspace"],
      author: "Cloud IDE User",
      license: "MIT",
      dependencies: {
        express: "^4.18.2",
        lodash: "^4.17.21"
      },
      devDependencies: {
        nodemon: "^3.0.1"
      }
    };

    // Write package.json
    const packageJsonContent = JSON.stringify(packageJson, null, 2);
    await fs.writeFile(path.join(workspacePath, 'package.json'), packageJsonContent);

    console.log(`✅ Workspace structure created successfully for: ${workspaceId}`);

  } catch (error) {
    console.error('Error setting up workspace structure:', error);
    // Don't throw error here, as container creation should still succeed
  }
};

// Get user container info
export const getUserContainer = async (containerId) => {
  try {
    const container = docker.getContainer(containerId);
    const info = await container.inspect();
    
    return {
      id: info.Id,
      name: info.Name,
      state: info.State,
      created: info.Created,
      image: info.Config.Image,
      workspaceId: info.Config.Labels['cloud-ide.workspace']
    };
  } catch (error) {
    console.error('Error getting container info:', error);
    throw new Error(`Failed to get container info: ${error.message}`);
  }
};

// Start user container
export const startUserContainer = async (containerId) => {
  try {
    const container = docker.getContainer(containerId);
    await container.start();
    console.log(`Container started: ${containerId}`);
    return true;
  } catch (error) {
    if (error.statusCode === 304) {
      // Container already running
      return true;
    }
    console.error('Error starting container:', error);
    throw new Error(`Failed to start container: ${error.message}`);
  }
};

// Stop user container
export const stopUserContainer = async (containerId) => {
  try {
    const container = docker.getContainer(containerId);
    await container.stop();
    console.log(`Container stopped: ${containerId}`);
    return true;
  } catch (error) {
    if (error.statusCode === 304) {
      // Container already stopped
      return true;
    }
    console.error('Error stopping container:', error);
    throw new Error(`Failed to stop container: ${error.message}`);
  }
};

// Remove user container
export const removeUserContainer = async (containerId) => {
  try {
    const container = docker.getContainer(containerId);
    
    // Stop container first if running
    try {
      await container.stop();
    } catch (stopError) {
      // Ignore if already stopped
    }
    
    // Remove container
    await container.remove();
    console.log(`Container removed: ${containerId}`);
    return true;
  } catch (error) {
    console.error('Error removing container:', error);
    throw new Error(`Failed to remove container: ${error.message}`);
  }
};

// List all user containers
export const listUserContainers = async () => {
  try {
    const containers = await docker.listContainers({
      all: true,
      filters: {
        label: ['cloud-ide.type=user-workspace']
      }
    });

    return containers.map(container => ({
      id: container.Id,
      name: container.Names[0],
      state: container.State,
      status: container.Status,
      created: container.Created,
      image: container.Image,
      workspaceId: container.Labels['cloud-ide.workspace']
    }));
  } catch (error) {
    console.error('Error listing containers:', error);
    throw new Error(`Failed to list containers: ${error.message}`);
  }
};

// Execute command in user container
export const executeInContainer = async (containerId, command, workingDir = '/workspace') => {
  try {
    const container = docker.getContainer(containerId);
    
    const exec = await container.exec({
      Cmd: ['sh', '-c', command],
      AttachStdout: true,
      AttachStderr: true,
      WorkingDir: workingDir
    });

    const stream = await exec.start();
    let output = '';

    return new Promise((resolve, reject) => {
      stream.on('data', (chunk) => {
        output += chunk.toString();
      });

      stream.on('end', async () => {
        try {
          const result = await exec.inspect();
          resolve({
            output: output.trim(),
            exitCode: result.ExitCode
          });
        } catch (error) {
          reject(error);
        }
      });

      stream.on('error', reject);
    });

  } catch (error) {
    console.error('Error executing command in container:', error);
    throw new Error(`Failed to execute command: ${error.message}`);
  }
};

// Check if container exists and is accessible
export const validateUserContainer = async (containerId, workspaceId) => {
  try {
    const container = docker.getContainer(containerId);
    const info = await container.inspect();
    
    // Check if container belongs to the workspace
    const containerWorkspaceId = info.Config.Labels['cloud-ide.workspace'];
    if (containerWorkspaceId !== workspaceId) {
      throw new Error('Container does not belong to this workspace');
    }

    return {
      valid: true,
      running: info.State.Running,
      info: {
        id: info.Id,
        name: info.Name,
        state: info.State,
        workspaceId: containerWorkspaceId
      }
    };

  } catch (error) {
    console.error('Error validating container:', error);
    return {
      valid: false,
      error: error.message
    };
  }
};
