import Docker from 'dockerode';
import { spawn } from 'child_process';
import path from 'path';

const docker = new Docker();
const activeTerminals = new Map();

export const setupWebSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Handle ping/pong for testing
    socket.on('ping', (data) => {
      console.log('Received ping:', data);
      socket.emit('pong', { 
        message: 'pong', 
        timestamp: new Date().toISOString(),
        socketId: socket.id,
        data: data 
      });
    });

    // Handle terminal connection request
    socket.on('terminal:connect', async (data) => {
      try {
        console.log('Terminal connection request:', data);
        const { containerId, workingDir = '/workspace', workspaceId } = data;

        if (!containerId) {
          console.error('No container ID provided');
          socket.emit('terminal:error', { error: 'Container ID is required' });
          return;
        }

        // Check if this is a simulated container
        if (containerId.startsWith('sim_')) {
          console.log('Creating simulated terminal session for:', containerId);
          await createSimulatedTerminal(socket, containerId, workspaceId, workingDir);
          return;
        }

        // Handle real Docker container
        const container = docker.getContainer(containerId);

        // Check if container is running
        console.log('Checking container status for:', containerId);
        const containerInfo = await container.inspect();
        if (!containerInfo.State.Running) {
          console.error('Container is not running:', containerId);
          socket.emit('terminal:error', { error: 'Container is not running' });
          return;
        }

        console.log('Container is running, creating terminal session');

        // Create exec instance for interactive shell
        const exec = await container.exec({
          Cmd: ['/bin/sh', '-c', 'if command -v bash >/dev/null 2>&1; then exec bash; else exec sh; fi'],
          AttachStdin: true,
          AttachStdout: true,
          AttachStderr: true,
          Tty: true,
          WorkingDir: workingDir,
          Env: ['TERM=xterm-256color', 'PS1=\\u@\\h:\\w\\$ ']
        });

        // Start the exec instance
        console.log('Starting terminal exec instance');
        const stream = await exec.start({
          hijack: true,
          stdin: true
        });

        console.log('Terminal stream created successfully');

        // Store the terminal session
        activeTerminals.set(socket.id, {
          stream,
          exec,
          containerId
        });

        // Handle data from container
        stream.on('data', (chunk) => {
          const data = chunk.toString();
          console.log('Terminal output:', data.substring(0, 100) + (data.length > 100 ? '...' : ''));
          socket.emit('terminal:output', data);
        });

        // Handle stream end
        stream.on('end', () => {
          console.log('Terminal stream ended for socket:', socket.id);
          socket.emit('terminal:disconnected');
          activeTerminals.delete(socket.id);
        });

        // Handle stream error
        stream.on('error', (error) => {
          console.error('Terminal stream error:', error);
          socket.emit('terminal:error', error.message);
          activeTerminals.delete(socket.id);
        });

        // Send initial prompt
        setTimeout(() => {
          socket.emit('terminal:output', `\nConnected to container ${containerId}\n${workingDir}$ `);
        }, 100);

        socket.emit('terminal:connected', {
          containerId,
          workingDir,
          message: 'Terminal connected successfully'
        });

        console.log('Terminal connection established for socket:', socket.id);

      } catch (error) {
        console.error('Error connecting to terminal:', error);
        socket.emit('terminal:error', { error: error.message });
      }
    });

    // Handle terminal input (unified for both Docker and simulated terminals)
    socket.on('terminal:input', (data) => {
      const terminal = activeTerminals.get(socket.id);
      if (!terminal) {
        console.error('No active terminal session for socket:', socket.id);
        socket.emit('terminal:error', { error: 'No active terminal session' });
        return;
      }

      // Handle Docker container terminals
      if (terminal.stream) {
        const input = typeof data === 'string' ? data : data.input;
        console.log('Sending input to Docker terminal:', input.replace(/\r?\n/g, '\\n'));
        terminal.stream.write(input);
      }
      // Handle simulated terminals
      else if (terminal.terminal && !terminal.terminal.killed) {
        const inputData = typeof data === 'string' ? data : data.data;
        if (inputData) {
          console.log('Writing to simulated terminal stdin:', JSON.stringify(inputData));
          terminal.terminal.stdin.write(inputData);
        }
      }
      else {
        console.error('Terminal session exists but no valid stream/process for socket:', socket.id);
        socket.emit('terminal:error', { error: 'Invalid terminal session' });
      }
    });

    // Handle terminal resize
    socket.on('terminal:resize', async (data) => {
      try {
        const terminal = activeTerminals.get(socket.id);
        if (terminal && terminal.exec) {
          await terminal.exec.resize({
            h: data.rows,
            w: data.cols
          });
        }
      } catch (error) {
        console.error('Error resizing terminal:', error);
      }
    });

    // Handle terminal disconnect
    socket.on('terminal:disconnect', () => {
      const terminal = activeTerminals.get(socket.id);
      if (terminal) {
        console.log('Disconnecting terminal for socket:', socket.id);
        if (terminal.stream) {
          terminal.stream.end();
        }
        if (terminal.terminal && !terminal.terminal.killed) {
          terminal.terminal.kill();
        }
        activeTerminals.delete(socket.id);
        socket.emit('terminal:disconnected');
      }
    });

    // Handle client disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      const terminal = activeTerminals.get(socket.id);
      if (terminal) {
        if (terminal.stream) {
          terminal.stream.end();
        }
        if (terminal.terminal && !terminal.terminal.killed) {
          terminal.terminal.kill();
        }
        activeTerminals.delete(socket.id);
      }
    });

    // Handle file watching for real-time updates
    socket.on('file:watch', (data) => {
      const { containerId, filePath } = data;
      // TODO: Implement file watching using container exec with tail -f
      socket.emit('file:watch:started', { filePath });
    });

    socket.on('file:unwatch', (data) => {
      const { filePath } = data;
      // TODO: Stop file watching
      socket.emit('file:watch:stopped', { filePath });
    });
  });
};

// Create simulated terminal session using host process
const createSimulatedTerminal = async (socket, containerId, workspaceId, workingDir) => {
  try {
    // Determine the working directory for the simulated terminal
    const hostWorkspaceDir = path.join('/app/workspace', workspaceId);

    console.log(`Creating simulated terminal in directory: ${hostWorkspaceDir}`);

    // Ensure the workspace directory exists
    const fs = await import('fs/promises');
    try {
      await fs.access(hostWorkspaceDir);
      console.log(`✅ Workspace directory exists: ${hostWorkspaceDir}`);
    } catch (error) {
      console.log(`❌ Workspace directory missing, creating: ${hostWorkspaceDir}`);
      await fs.mkdir(hostWorkspaceDir, { recursive: true });
    }

    // Create a shell process on the host
    const shell = '/bin/sh';
    const shellArgs = ['-i']; // Interactive shell

    console.log(`🐚 Spawning shell: ${shell} with args:`, shellArgs);
    console.log(`📁 Working directory: ${hostWorkspaceDir}`);

    const terminal = spawn(shell, shellArgs, {
      cwd: hostWorkspaceDir,
      env: {
        ...process.env,
        TERM: 'xterm-256color',
        PS1: 'cloud-ide:$ ',
        HOME: hostWorkspaceDir,
        USER: 'cloud-ide-user',
        PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
        SHELL: '/bin/sh'
      },
      stdio: ['pipe', 'pipe', 'pipe'],
      detached: false
    });

    // Store terminal reference
    activeTerminals.set(socket.id, {
      terminal,
      containerId,
      type: 'simulated'
    });

    console.log(`Simulated terminal created for socket ${socket.id}`);

    // Send initial connection success
    socket.emit('terminal:connected', {
      containerId,
      message: `Connected to workspace: ${workspaceId}`,
      type: 'simulated'
    });

    // Send welcome message and initial prompt
    const welcomeMessage = `\r\n🌟 Welcome to Cloud IDE Terminal!\r\n`;
    const infoMessage = `📁 Workspace: ${workspaceId}\r\n`;
    const promptMessage = `💻 Type commands below:\r\n`;
    const initialPrompt = `cloud-ide:$ `;

    socket.emit('terminal:output', welcomeMessage);
    socket.emit('terminal:output', infoMessage);
    socket.emit('terminal:output', promptMessage);
    socket.emit('terminal:output', initialPrompt);

    // Handle terminal output
    terminal.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('Terminal stdout:', JSON.stringify(output));
      socket.emit('terminal:output', output);
    });

    terminal.stderr.on('data', (data) => {
      const output = data.toString();
      console.log('Terminal stderr:', JSON.stringify(output));
      socket.emit('terminal:output', output);
    });

    // Handle terminal exit
    terminal.on('exit', (code) => {
      console.log(`Simulated terminal exited with code ${code}`);
      socket.emit('terminal:exit', { code });
      activeTerminals.delete(socket.id);
    });

    terminal.on('error', (error) => {
      console.error('❌ Simulated terminal error:', error);
      console.error('Error details:', {
        code: error.code,
        errno: error.errno,
        syscall: error.syscall,
        path: error.path,
        spawnargs: error.spawnargs
      });

      // Send a more user-friendly error message
      const errorMessage = error.code === 'ENOENT'
        ? 'Shell not found. Terminal functionality may be limited.'
        : `Terminal error: ${error.message}`;

      socket.emit('terminal:error', { error: errorMessage });
      activeTerminals.delete(socket.id);
    });

    // Note: terminal:input and terminal:resize are handled by the main socket handlers above

  } catch (error) {
    console.error('❌ Error creating simulated terminal:', error);

    // Try to provide a fallback terminal experience
    try {
      console.log('🔄 Attempting fallback terminal creation...');

      // Send initial connection success even if shell fails
      socket.emit('terminal:connected', {
        containerId,
        message: `Connected to workspace: ${workspaceId}`,
        type: 'simulated-fallback'
      });

      // Send a welcome message explaining the limitation
      const fallbackMessage = `\r\n⚠️  Terminal shell unavailable, but workspace is accessible.\r\n`;
      const infoMessage = `📁 Workspace: ${workspaceId}\r\n`;
      const promptMessage = `💻 Use the file editor to manage your files.\r\n\r\n`;

      socket.emit('terminal:output', fallbackMessage);
      socket.emit('terminal:output', infoMessage);
      socket.emit('terminal:output', promptMessage);

    } catch (fallbackError) {
      console.error('❌ Fallback terminal creation also failed:', fallbackError);
      socket.emit('terminal:error', { error: 'Failed to create terminal session' });
    }
  }
};

// Cleanup function for graceful shutdown
export const cleanupTerminals = () => {
  activeTerminals.forEach((terminal, socketId) => {
    if (terminal.stream) {
      terminal.stream.end();
    }
    if (terminal.terminal && !terminal.terminal.killed) {
      terminal.terminal.kill();
    }
  });
  activeTerminals.clear();
};

// Handle process termination
process.on('SIGTERM', cleanupTerminals);
process.on('SIGINT', cleanupTerminals);

export default setupWebSocketHandlers;
