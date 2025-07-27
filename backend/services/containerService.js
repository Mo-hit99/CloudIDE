import Docker from 'dockerode';
import path from 'path';
import fs from 'fs/promises';

const docker = new Docker();

// Create a user-specific container with isolated workspace
export const createUserContainer = async (workspaceId) => {
  try {
    console.log(`Creating container for workspace: ${workspaceId}`);

    // Create container with user workspace
    const container = await docker.createContainer({
      Image: 'node:18-alpine',
      name: `workspace-${workspaceId}`,
      Cmd: ['tail', '-f', '/dev/null'], // Keep container running
      WorkingDir: '/workspace',
      Env: [
        'NODE_ENV=development',
        `WORKSPACE_ID=${workspaceId}`,
        'PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/workspace/node_modules/.bin'
      ],
      HostConfig: {
        Memory: 512 * 1024 * 1024, // 512MB memory limit
        CpuShares: 512, // CPU limit
        NetworkMode: 'bridge',
        RestartPolicy: {
          Name: 'unless-stopped'
        }
      },
      NetworkingConfig: {
        EndpointsConfig: {
          bridge: {}
        }
      },
      Labels: {
        'cloud-ide.workspace': workspaceId,
        'cloud-ide.type': 'user-workspace'
      }
    });

    // Start the container
    await container.start();

    // Setup initial workspace structure
    await setupWorkspaceStructure(container);

    console.log(`Container created successfully: ${container.id}`);
    return container.id;

  } catch (error) {
    console.error('Error creating user container:', error);
    throw new Error(`Failed to create container: ${error.message}`);
  }
};

// Setup initial workspace structure
const setupWorkspaceStructure = async (container) => {
  try {
    // Create initial directory structure
    const commands = [
      'mkdir -p /workspace/src',
      'mkdir -p /workspace/public',
      'mkdir -p /workspace/docs',
      'mkdir -p /workspace/tests',
      'mkdir -p /workspace/config',
      'mkdir -p /workspace/scripts',
      'apk add --no-cache bash curl git nano vim',
      'npm init -y',
      'echo "# Welcome to your Cloud IDE Workspace" > /workspace/README.md',
      'echo "console.log(\'Hello, World!\');" > /workspace/src/index.js',
      'echo "<!DOCTYPE html><html><head><title>My Project</title></head><body><h1>Hello World</h1></body></html>" > /workspace/public/index.html',
      'echo "# Project Documentation" > /workspace/docs/README.md',
      'echo "#!/bin/bash\necho \\"Build script\\"" > /workspace/scripts/build.sh',
      'chmod +x /workspace/scripts/build.sh'
    ];

    for (const cmd of commands) {
      const exec = await container.exec({
        Cmd: ['sh', '-c', cmd],
        AttachStdout: true,
        AttachStderr: true
      });
      await exec.start();
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
    const exec = await container.exec({
      Cmd: ['sh', '-c', `echo '${packageJsonContent}' > /workspace/package.json`],
      AttachStdout: true,
      AttachStderr: true
    });
    await exec.start();

    console.log('Workspace structure setup completed');

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
