import express from 'express';
import Docker from 'dockerode';
import { Readable } from 'stream';
import tar from 'tar-stream';
import path from 'path';
import fs from 'fs/promises';
import {
  fileRateLimit,
  validateContainerId,
  validatePath,
  validateFileContent
} from '../middleware/security.js';
import { authenticateToken, authorizeWorkspace } from '../middleware/auth.js';

const router = express.Router();
const docker = new Docker();

// File type detection
const getFileType = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  const fileTypes = {
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.py': 'python',
    '.java': 'java',
    '.html': 'html',
    '.css': 'css',
    '.json': 'json',
    '.md': 'markdown',
    '.yml': 'yaml',
    '.yaml': 'yaml',
    '.xml': 'xml',
    '.txt': 'text',
    '.log': 'text',
    '.sh': 'shell',
    '.bat': 'batch',
    '.dockerfile': 'dockerfile',
    '.sql': 'sql',
    '.php': 'php',
    '.rb': 'ruby',
    '.go': 'go',
    '.rs': 'rust',
    '.cpp': 'cpp',
    '.c': 'c',
    '.h': 'c'
  };
  return fileTypes[ext] || 'text';
};

// Check if file is executable
const isExecutableFile = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  const executableTypes = ['.py', '.js', '.java', '.sh', '.bat'];
  return executableTypes.includes(ext);
};

// Get file icon based on type
const getFileIcon = (filename, isDirectory = false) => {
  if (isDirectory) return 'folder';

  const ext = path.extname(filename).toLowerCase();
  const iconMap = {
    '.js': 'javascript',
    '.jsx': 'react',
    '.ts': 'typescript',
    '.tsx': 'react',
    '.py': 'python',
    '.java': 'java',
    '.html': 'html',
    '.css': 'css',
    '.json': 'json',
    '.md': 'markdown',
    '.yml': 'yaml',
    '.yaml': 'yaml',
    '.xml': 'xml',
    '.txt': 'text',
    '.log': 'log',
    '.sh': 'shell',
    '.bat': 'batch',
    '.dockerfile': 'docker',
    '.sql': 'database',
    '.php': 'php',
    '.rb': 'ruby',
    '.go': 'go',
    '.rs': 'rust',
    '.cpp': 'cpp',
    '.c': 'c',
    '.h': 'c'
  };
  return iconMap[ext] || 'file';
};

// Helper function to extract files from tar stream
const extractFromTar = (tarStream) => {
  return new Promise((resolve, reject) => {
    const extract = tar.extract();
    let result = null;
    
    extract.on('entry', (header, stream, next) => {
      let data = '';
      stream.on('data', (chunk) => {
        data += chunk.toString();
      });
      stream.on('end', () => {
        result = data;
        next();
      });
      stream.resume();
    });
    
    extract.on('finish', () => {
      resolve(result);
    });
    
    extract.on('error', reject);
    
    tarStream.pipe(extract);
  });
};

// Helper function to create tar stream for file upload
const createTarStream = (filename, content) => {
  const pack = tar.pack();
  pack.entry({ name: filename }, content);
  pack.finalize();
  return pack;
};

// Helper function to build file tree from host filesystem
const buildHostFileTree = async (hostPath, requestPath = '/workspace') => {
  try {
    // Ensure the workspace directory exists
    try {
      await fs.access(hostPath);
    } catch (accessError) {
      // Directory doesn't exist, create it
      console.log(`Creating workspace directory: ${hostPath}`);
      await fs.mkdir(hostPath, { recursive: true });
    }

    // Read directory contents
    const entries = await fs.readdir(hostPath, { withFileTypes: true });

    const tree = [];
    let id = 1;

    for (const entry of entries) {
      const fullPath = path.join(hostPath, entry.name);
      const stats = await fs.stat(fullPath);

      const node = {
        id: id++,
        text: entry.name,
        data: {
          path: path.join(requestPath, entry.name),
          type: entry.isDirectory() ? 'directory' : 'file',
          size: entry.isDirectory() ? null : stats.size,
          permissions: stats.mode.toString(8).slice(-3),
          fileType: entry.isDirectory() ? 'folder' : getFileType(entry.name),
          icon: getFileIcon(entry.name, entry.isDirectory()),
          executable: !entry.isDirectory() && isExecutableFile(entry.name),
          modified: stats.mtime.toISOString()
        },
        children: []
      };

      // If it's a directory, recursively get children (limit depth)
      if (entry.isDirectory() && requestPath.split('/').length < 6) {
        try {
          const childTree = await buildHostFileTree(fullPath, path.join(requestPath, entry.name));
          node.children = childTree;
          node.droppable = true;
        } catch (childError) {
          console.error(`Error reading subdirectory ${fullPath}:`, childError);
          // Continue with empty children
        }
      }

      tree.push(node);
    }

    return tree;
  } catch (error) {
    console.error('Error building host file tree:', error);
    // Always return an empty array instead of throwing
    return [];
  }
};

// Get directory structure with metadata
router.get('/tree/:containerId', authenticateToken, authorizeWorkspace, fileRateLimit, validateContainerId, async (req, res) => {
  try {
    const { containerId } = req.params;
    const { path: requestPath = '/workspace' } = req.query;

    // Check if this is a simulated container
    if (containerId.startsWith('sim_')) {
      // Handle simulated container - read from host filesystem
      const workspaceId = req.user.workspaceId;
      const hostPath = path.join('/app/workspace', workspaceId);

      try {
        const tree = await buildHostFileTree(hostPath, requestPath);
        res.json(tree);
        return;
      } catch (hostError) {
        console.error('Error reading host filesystem:', hostError);
        // Return empty array instead of error
        res.json([]);
        return;
      }
    }

    // Handle real Docker container
    const container = docker.getContainer(containerId);

    // Execute ls -la command to get detailed directory listing
    const exec = await container.exec({
      Cmd: ['find', requestPath, '-maxdepth', '4', '-exec', 'ls', '-ld', '{}', ';'],
      AttachStdout: true,
      AttachStderr: true
    });

    const stream = await exec.start();
    let output = '';

    stream.on('data', (chunk) => {
      output += chunk.toString();
    });

    await new Promise((resolve) => {
      stream.on('end', resolve);
    });

    // Parse the output into a tree structure with metadata
    const lines = output.trim().split('\n').filter(line => line.trim());
    const tree = buildTreeStructureWithMetadata(lines, requestPath);

    res.json(tree);
  } catch (error) {
    console.error('Error getting directory tree:', error);
    // Return empty array instead of error
    res.json([]);
  }
});

// Helper function to build tree structure
function buildTreeStructure(paths, rootPath) {
  const tree = [];
  const pathMap = new Map();
  
  // Sort paths to ensure parents come before children
  paths.sort();
  
  paths.forEach((fullPath, index) => {
    const relativePath = fullPath.replace(rootPath, '').replace(/^\//, '');
    if (!relativePath) return; // Skip root path
    
    const parts = relativePath.split('/');
    const fileName = parts[parts.length - 1];
    const parentPath = parts.slice(0, -1).join('/');
    
    const node = {
      id: index + 1,
      text: fileName,
      path: fullPath,
      isDirectory: !fileName.includes('.') || fileName.startsWith('.'),
      children: []
    };
    
    pathMap.set(relativePath, node);
    
    if (parentPath === '') {
      tree.push(node);
    } else {
      const parent = pathMap.get(parentPath);
      if (parent) {
        parent.children.push(node);
        parent.droppable = true;
      }
    }
  });
  
  return tree;
}

// Helper function to build tree structure with metadata
function buildTreeStructureWithMetadata(lsOutput, rootPath) {
  const tree = [];
  const pathMap = new Map();

  lsOutput.forEach((line, index) => {
    if (!line.trim()) return;

    // Parse ls -ld output: permissions user group size date time path
    const parts = line.trim().split(/\s+/);
    if (parts.length < 9) return;

    const permissions = parts[0];
    const isDirectory = permissions.startsWith('d');
    const size = parts[4];
    const fullPath = parts.slice(8).join(' ');

    const relativePath = fullPath.replace(rootPath, '').replace(/^\//, '');
    if (!relativePath) return; // Skip root path

    const pathParts = relativePath.split('/');
    const fileName = pathParts[pathParts.length - 1];
    const parentPath = pathParts.slice(0, -1).join('/');

    const node = {
      id: `${index}`,
      text: fileName,
      data: {
        path: fullPath,
        type: isDirectory ? 'directory' : 'file',
        size: isDirectory ? null : parseInt(size),
        permissions: permissions,
        fileType: isDirectory ? 'folder' : getFileType(fileName),
        icon: getFileIcon(fileName, isDirectory),
        executable: isDirectory ? false : isExecutableFile(fileName)
      },
      children: []
    };

    pathMap.set(relativePath, node);

    if (parentPath === '') {
      tree.push(node);
    } else {
      const parent = pathMap.get(parentPath);
      if (parent) {
        parent.children.push(node);
      }
    }
  });

  // Sort tree: directories first, then files, both alphabetically
  const sortTree = (nodes) => {
    nodes.sort((a, b) => {
      if (a.data.type !== b.data.type) {
        return a.data.type === 'directory' ? -1 : 1;
      }
      return a.text.localeCompare(b.text);
    });

    nodes.forEach(node => {
      if (node.children.length > 0) {
        sortTree(node.children);
      }
    });
  };

  sortTree(tree);
  return tree;
}

// Read file content
router.get('/content/:containerId', authenticateToken, authorizeWorkspace, validateContainerId, async (req, res) => {
  try {
    const { containerId } = req.params;
    const { path: filePath } = req.query;

    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }

    // Check if this is a simulated container
    if (containerId.startsWith('sim_')) {
      // Handle simulated container - read from host filesystem
      const workspaceId = req.user.workspaceId;
      const hostWorkspaceDir = path.join('/app/workspace', workspaceId);

      // Convert workspace path to host path
      const relativePath = filePath.replace('/workspace/', '').replace('/workspace', '');
      const fullHostPath = path.join(hostWorkspaceDir, relativePath);

      try {
        const content = await fs.readFile(fullHostPath, 'utf8');
        res.json({ content, path: filePath });
        return;
      } catch (hostError) {
        console.error('Error reading file from host:', hostError);
        res.status(500).json({ error: 'Failed to read file' });
        return;
      }
    }

    // Handle real Docker container
    const container = docker.getContainer(containerId);

    // Get file from container using tar
    const tarStream = await container.getArchive({ path: filePath });
    const content = await extractFromTar(tarStream);

    res.json({ content, path: filePath });
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).json({ error: 'Failed to read file' });
  }
});

// Write file content
router.post('/content/:containerId', authenticateToken, authorizeWorkspace, validateContainerId, async (req, res) => {
  try {
    const { containerId } = req.params;
    const { path: filePath, content } = req.body;

    if (!filePath || content === undefined) {
      return res.status(400).json({ error: 'File path and content are required' });
    }

    // Check if this is a simulated container
    if (containerId.startsWith('sim_')) {
      // Handle simulated container - write to host filesystem
      const workspaceId = req.user.workspaceId;
      const hostWorkspaceDir = path.join('/app/workspace', workspaceId);

      // Convert workspace path to host path
      const relativePath = filePath.replace('/workspace/', '').replace('/workspace', '');
      const fullHostPath = path.join(hostWorkspaceDir, relativePath);

      try {
        // Ensure directory exists
        const directory = path.dirname(fullHostPath);
        await fs.mkdir(directory, { recursive: true });

        // Write file content
        await fs.writeFile(fullHostPath, content);
        res.json({ message: 'File saved successfully', path: filePath });
        return;
      } catch (hostError) {
        console.error('Error writing file to host:', hostError);
        res.status(500).json({ error: 'Failed to write file' });
        return;
      }
    }

    // Handle real Docker container
    const container = docker.getContainer(containerId);

    // Extract directory and filename
    const pathParts = filePath.split('/');
    const filename = pathParts.pop();
    const directory = pathParts.join('/') || '/';

    // Create tar stream with file content
    const tarStream = createTarStream(filename, content);

    // Upload file to container
    await container.putArchive(tarStream, { path: directory });

    res.json({ message: 'File saved successfully', path: filePath });
  } catch (error) {
    console.error('Error writing file:', error);
    res.status(500).json({ error: 'Failed to write file' });
  }
});

// Create new file
router.post('/create/:containerId', authenticateToken, authorizeWorkspace, validateContainerId, async (req, res) => {
  try {
    const { containerId } = req.params;
    const { path: filePath, type = 'file', content = '' } = req.body;

    if (!filePath) {
      return res.status(400).json({ error: 'Path is required' });
    }

    // Check if this is a simulated container
    if (containerId.startsWith('sim_')) {
      // Handle simulated container - create on host filesystem
      const workspaceId = req.user.workspaceId;
      const hostWorkspaceDir = path.join('/app/workspace', workspaceId);

      // Convert workspace path to host path
      const relativePath = filePath.replace('/workspace/', '').replace('/workspace', '');
      const fullHostPath = path.join(hostWorkspaceDir, relativePath);

      try {
        if (type === 'directory') {
          // Create directory
          await fs.mkdir(fullHostPath, { recursive: true });
        } else {
          // Create file
          const directory = path.dirname(fullHostPath);
          await fs.mkdir(directory, { recursive: true });
          await fs.writeFile(fullHostPath, content);
        }

        res.json({ message: `${type} created successfully`, path: filePath });
        return;
      } catch (hostError) {
        console.error('Error creating file on host:', hostError);
        res.status(500).json({ error: `Failed to create ${type}` });
        return;
      }
    }

    // Handle real Docker container
    const container = docker.getContainer(containerId);

    if (type === 'directory') {
      // Create directory
      const exec = await container.exec({
        Cmd: ['mkdir', '-p', filePath],
        AttachStdout: true,
        AttachStderr: true
      });
      await exec.start();
    } else {
      // Create file
      const pathParts = filePath.split('/');
      const filename = pathParts.pop();
      const directory = pathParts.join('/') || '/';

      const tarStream = createTarStream(filename, content);
      await container.putArchive(tarStream, { path: directory });
    }

    res.json({ message: `${type} created successfully`, path: filePath });
  } catch (error) {
    console.error('Error creating file/directory:', error);
    res.status(500).json({ error: `Failed to create ${type}` });
  }
});

// Delete file or directory
router.delete('/delete/:containerId', authenticateToken, authorizeWorkspace, validateContainerId, async (req, res) => {
  try {
    const { containerId } = req.params;
    const { path: filePath } = req.body;

    if (!filePath) {
      return res.status(400).json({ error: 'Path is required' });
    }

    // Check if this is a simulated container
    if (containerId.startsWith('sim_')) {
      // Handle simulated container - delete from host filesystem
      const workspaceId = req.user.workspaceId;
      const hostWorkspaceDir = path.join('/app/workspace', workspaceId);

      // Convert workspace path to host path
      const relativePath = filePath.replace('/workspace/', '').replace('/workspace', '');
      const fullHostPath = path.join(hostWorkspaceDir, relativePath);

      try {
        // Check if it's a file or directory
        const stats = await fs.stat(fullHostPath);
        if (stats.isDirectory()) {
          await fs.rmdir(fullHostPath, { recursive: true });
        } else {
          await fs.unlink(fullHostPath);
        }

        res.json({ message: 'File/directory deleted successfully', path: filePath });
        return;
      } catch (hostError) {
        console.error('Error deleting file from host:', hostError);
        res.status(500).json({ error: 'Failed to delete file/directory' });
        return;
      }
    }

    // Handle real Docker container
    const container = docker.getContainer(containerId);

    const exec = await container.exec({
      Cmd: ['rm', '-rf', filePath],
      AttachStdout: true,
      AttachStderr: true
    });

    await exec.start();

    res.json({ message: 'File/directory deleted successfully', path: filePath });
  } catch (error) {
    console.error('Error deleting file/directory:', error);
    res.status(500).json({ error: 'Failed to delete file/directory' });
  }
});

// Rename file or directory
router.put('/rename/:containerId', authenticateToken, authorizeWorkspace, async (req, res) => {
  try {
    const { containerId } = req.params;
    const { oldPath, newPath } = req.body;

    if (!oldPath || !newPath) {
      return res.status(400).json({ error: 'Both oldPath and newPath are required' });
    }

    const container = docker.getContainer(containerId);

    const exec = await container.exec({
      Cmd: ['mv', oldPath, newPath],
      AttachStdout: true,
      AttachStderr: true
    });

    await exec.start();

    res.json({ message: 'File/directory renamed successfully', oldPath, newPath });
  } catch (error) {
    console.error('Error renaming file/directory:', error);
    res.status(500).json({ error: 'Failed to rename file/directory' });
  }
});

// Move file or directory
router.put('/move/:containerId', authenticateToken, authorizeWorkspace, async (req, res) => {
  try {
    const { containerId } = req.params;
    const { sourcePath, destinationPath } = req.body;

    if (!sourcePath || !destinationPath) {
      return res.status(400).json({ error: 'Both sourcePath and destinationPath are required' });
    }

    const container = docker.getContainer(containerId);

    const exec = await container.exec({
      Cmd: ['mv', sourcePath, destinationPath],
      AttachStdout: true,
      AttachStderr: true
    });

    await exec.start();

    res.json({ message: 'File/directory moved successfully', sourcePath, destinationPath });
  } catch (error) {
    console.error('Error moving file/directory:', error);
    res.status(500).json({ error: 'Failed to move file/directory' });
  }
});

// Copy file or directory
router.post('/copy/:containerId', authenticateToken, authorizeWorkspace, async (req, res) => {
  try {
    const { containerId } = req.params;
    const { sourcePath, destinationPath } = req.body;

    if (!sourcePath || !destinationPath) {
      return res.status(400).json({ error: 'Both sourcePath and destinationPath are required' });
    }

    const container = docker.getContainer(containerId);

    const exec = await container.exec({
      Cmd: ['cp', '-r', sourcePath, destinationPath],
      AttachStdout: true,
      AttachStderr: true
    });

    await exec.start();

    res.json({ message: 'File/directory copied successfully', sourcePath, destinationPath });
  } catch (error) {
    console.error('Error copying file/directory:', error);
    res.status(500).json({ error: 'Failed to copy file/directory' });
  }
});

// Execute file (run file in terminal)
router.post('/execute/:containerId', authenticateToken, authorizeWorkspace, validateContainerId, async (req, res) => {
  try {
    const { containerId } = req.params;
    const { filePath, workingDir = '/workspace' } = req.body;

    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }

    const fileName = path.basename(filePath);
    const fileExt = path.extname(fileName).toLowerCase();

    // Check if this is a simulated container
    if (containerId.startsWith('sim_')) {
      // Handle simulated container - execute on host filesystem
      const workspaceId = req.user.workspaceId;
      const hostWorkspaceDir = path.join('/app/workspace', workspaceId);

      // Convert workspace path to host path
      const relativePath = filePath.replace('/workspace/', '').replace('/workspace', '');
      const fullHostPath = path.join(hostWorkspaceDir, relativePath);

      try {
        const result = await executeFileOnHost(fullHostPath, fileExt, hostWorkspaceDir);
        res.json({
          message: 'File executed successfully',
          filePath,
          command: result.command,
          output: result.output
        });
        return;
      } catch (hostError) {
        console.error('Error executing file on host:', hostError);
        res.status(500).json({ error: 'Failed to execute file: ' + hostError.message });
        return;
      }
    }

    // Handle real Docker container
    const container = docker.getContainer(containerId);

    let command = [];

    // Determine execution command based on file type
    switch (fileExt) {
      case '.py':
        command = ['python3', filePath];
        break;
      case '.js':
        command = ['node', filePath];
        break;
      case '.java':
        // Compile and run Java file
        const className = path.basename(fileName, '.java');
        command = ['sh', '-c', `cd ${workingDir} && javac ${fileName} && java ${className}`];
        break;
      case '.sh':
        command = ['bash', filePath];
        break;
      case '.bat':
        command = ['sh', filePath]; // Convert to sh for Unix containers
        break;
      default:
        return res.status(400).json({ error: `Unsupported file type: ${fileExt}` });
    }

    const exec = await container.exec({
      Cmd: command,
      AttachStdout: true,
      AttachStderr: true,
      WorkingDir: workingDir
    });

    const stream = await exec.start();
    let output = '';

    stream.on('data', (chunk) => {
      output += chunk.toString();
    });

    await new Promise((resolve) => {
      stream.on('end', resolve);
    });

    // Clean up Docker stream output (remove control characters)
    const cleanOutput = output
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters except \n and \r
      .replace(/^\d+\s*/, '') // Remove leading numbers from Docker stream
      .trim();

    res.json({
      message: 'File executed successfully',
      filePath,
      command: command.join(' '),
      output: cleanOutput
    });
  } catch (error) {
    console.error('Error executing file:', error);
    res.status(500).json({ error: 'Failed to execute file', details: error.message });
  }
});



// Helper function to execute files on host filesystem
const executeFileOnHost = async (filePath, fileExt, workingDir) => {
  const { spawn } = await import('child_process');

  let command = [];
  let commandString = '';

  // Determine execution command based on file type
  switch (fileExt) {
    case '.py':
      command = ['python3', filePath];
      commandString = `python3 ${path.basename(filePath)}`;
      break;
    case '.js':
      command = ['node', filePath];
      commandString = `node ${path.basename(filePath)}`;
      break;
    case '.java':
      // Compile and run Java file
      const className = path.basename(filePath, '.java');
      command = ['sh', '-c', `cd ${workingDir} && javac ${path.basename(filePath)} && java ${className}`];
      commandString = `javac ${path.basename(filePath)} && java ${className}`;
      break;
    case '.sh':
      command = ['sh', filePath];
      commandString = `sh ${path.basename(filePath)}`;
      break;
    case '.bat':
      command = ['sh', filePath]; // Convert to sh for Unix containers
      commandString = `sh ${path.basename(filePath)}`;
      break;
    default:
      throw new Error(`Unsupported file type: ${fileExt}`);
  }

  return new Promise((resolve, reject) => {
    const process = spawn(command[0], command.slice(1), {
      cwd: workingDir,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let errorOutput = '';

    process.stdout.on('data', (data) => {
      output += data.toString();
    });

    process.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    process.on('close', (code) => {
      const finalOutput = output + (errorOutput ? '\nErrors:\n' + errorOutput : '');
      resolve({
        command: commandString,
        output: finalOutput.trim() || `Process exited with code ${code}`,
        exitCode: code
      });
    });

    process.on('error', (error) => {
      // Handle missing interpreter gracefully
      if (error.code === 'ENOENT') {
        resolve({
          command: commandString,
          output: `Error: ${command[0]} is not installed in this environment.\nSupported languages: JavaScript (.js), Shell scripts (.sh)`,
          exitCode: 127
        });
      } else {
        reject(new Error(`Failed to execute command: ${error.message}`));
      }
    });

    // Set a timeout to prevent hanging
    setTimeout(() => {
      if (!process.killed) {
        process.kill();
        reject(new Error('Command execution timeout'));
      }
    }, 30000); // 30 second timeout
  });
};

export default router;
