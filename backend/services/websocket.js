import Docker from 'dockerode';

const docker = new Docker();
const activeTerminals = new Map();

export const setupWebSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Handle terminal connection request
    socket.on('terminal:connect', async (data) => {
      try {
        console.log('Terminal connection request:', data);
        const { containerId, workingDir = '/workspace' } = data;

        if (!containerId) {
          console.error('No container ID provided');
          socket.emit('terminal:error', { error: 'Container ID is required' });
          return;
        }

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

    // Handle terminal input
    socket.on('terminal:input', (data) => {
      const terminal = activeTerminals.get(socket.id);
      if (terminal && terminal.stream) {
        const input = typeof data === 'string' ? data : data.input;
        console.log('Sending input to terminal:', input.replace(/\r?\n/g, '\\n'));
        terminal.stream.write(input);
      } else {
        console.error('No active terminal session for socket:', socket.id);
        socket.emit('terminal:error', 'No active terminal session');
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
      if (terminal && terminal.stream) {
        terminal.stream.end();
        activeTerminals.delete(socket.id);
      }
    });

    // Handle client disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      const terminal = activeTerminals.get(socket.id);
      if (terminal && terminal.stream) {
        terminal.stream.end();
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

// Cleanup function for graceful shutdown
export const cleanupTerminals = () => {
  activeTerminals.forEach((terminal, socketId) => {
    if (terminal.stream) {
      terminal.stream.end();
    }
  });
  activeTerminals.clear();
};

// Handle process termination
process.on('SIGTERM', cleanupTerminals);
process.on('SIGINT', cleanupTerminals);
