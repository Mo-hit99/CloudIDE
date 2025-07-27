import express from 'express';
import Docker from 'dockerode';
import { Readable } from 'stream';
import tar from 'tar-stream';
import path from 'path';
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

// Get directory structure with metadata
router.get('/tree/:containerId', authenticateToken, authorizeWorkspace, fileRateLimit, validateContainerId, async (req, res) => {
  try {
    const { containerId } = req.params;
    const { path = '/workspace' } = req.query;

    const container = docker.getContainer(containerId);

    // Execute ls -la command to get detailed directory listing
    const exec = await container.exec({
      Cmd: ['find', path, '-maxdepth', '4', '-exec', 'ls', '-ld', '{}', ';'],
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
    const tree = buildTreeStructureWithMetadata(lines, path);

    res.json(tree);
  } catch (error) {
    console.error('Error getting directory tree:', error);
    res.status(500).json({ error: 'Failed to get directory structure' });
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
router.get('/content/:containerId', authenticateToken, authorizeWorkspace, async (req, res) => {
  try {
    const { containerId } = req.params;
    const { path } = req.query;
    
    if (!path) {
      return res.status(400).json({ error: 'File path is required' });
    }
    
    const container = docker.getContainer(containerId);
    
    // Get file from container using tar
    const tarStream = await container.getArchive({ path });
    const content = await extractFromTar(tarStream);
    
    res.json({ content, path });
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).json({ error: 'Failed to read file' });
  }
});

// Write file content
router.post('/content/:containerId', authenticateToken, authorizeWorkspace, async (req, res) => {
  try {
    const { containerId } = req.params;
    const { path, content } = req.body;
    
    if (!path || content === undefined) {
      return res.status(400).json({ error: 'File path and content are required' });
    }
    
    const container = docker.getContainer(containerId);
    
    // Extract directory and filename
    const pathParts = path.split('/');
    const filename = pathParts.pop();
    const directory = pathParts.join('/') || '/';
    
    // Create tar stream with file content
    const tarStream = createTarStream(filename, content);
    
    // Upload file to container
    await container.putArchive(tarStream, { path: directory });
    
    res.json({ message: 'File saved successfully', path });
  } catch (error) {
    console.error('Error writing file:', error);
    res.status(500).json({ error: 'Failed to write file' });
  }
});

// Create new file
router.post('/create/:containerId', authenticateToken, authorizeWorkspace, async (req, res) => {
  try {
    const { containerId } = req.params;
    const { path, type = 'file', content = '' } = req.body;
    
    if (!path) {
      return res.status(400).json({ error: 'Path is required' });
    }
    
    const container = docker.getContainer(containerId);
    
    if (type === 'directory') {
      // Create directory
      const exec = await container.exec({
        Cmd: ['mkdir', '-p', path],
        AttachStdout: true,
        AttachStderr: true
      });
      await exec.start();
    } else {
      // Create file
      const pathParts = path.split('/');
      const filename = pathParts.pop();
      const directory = pathParts.join('/') || '/';
      
      const tarStream = createTarStream(filename, content);
      await container.putArchive(tarStream, { path: directory });
    }
    
    res.json({ message: `${type} created successfully`, path });
  } catch (error) {
    console.error('Error creating file/directory:', error);
    res.status(500).json({ error: `Failed to create ${type}` });
  }
});

// Delete file or directory
router.delete('/delete/:containerId', authenticateToken, authorizeWorkspace, async (req, res) => {
  try {
    const { containerId } = req.params;
    const { path } = req.body;
    
    if (!path) {
      return res.status(400).json({ error: 'Path is required' });
    }
    
    const container = docker.getContainer(containerId);
    
    const exec = await container.exec({
      Cmd: ['rm', '-rf', path],
      AttachStdout: true,
      AttachStderr: true
    });
    
    await exec.start();
    
    res.json({ message: 'File/directory deleted successfully', path });
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
router.post('/execute/:containerId', authenticateToken, authorizeWorkspace, async (req, res) => {
  try {
    const { containerId } = req.params;
    const { filePath, workingDir = '/workspace' } = req.body;

    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }

    const container = docker.getContainer(containerId);
    const fileName = path.basename(filePath);
    const fileExt = path.extname(fileName).toLowerCase();

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

export default router;
