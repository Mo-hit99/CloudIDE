import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging and authentication
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);

    // Add authentication token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Docker API endpoints
export const dockerAPI = {
  // Get all containers
  getContainers: () => api.get('/docker/containers'),
  
  // Get container details
  getContainer: (id) => api.get(`/docker/containers/${id}`),
  
  // Start container
  startContainer: (id) => api.post(`/docker/containers/${id}/start`),
  
  // Stop container
  stopContainer: (id) => api.post(`/docker/containers/${id}/stop`),
  
  // Execute command in container
  execCommand: (id, command, workingDir = '/app') => 
    api.post(`/docker/containers/${id}/exec`, { command, workingDir }),
  
  // Create new container
  createContainer: (config) => api.post('/docker/containers', config),
  
  // Get images
  getImages: () => api.get('/docker/images'),
};

// File API endpoints
export const fileAPI = {
  // Get directory tree
  getDirectoryTree: (containerId, path = '/workspace') =>
    api.get(`/files/tree/${containerId}`, { params: { path } }),

  // Read file content
  readFile: (containerId, path) =>
    api.get(`/files/content/${containerId}`, { params: { path } }),

  // Write file content
  writeFile: (containerId, path, content) =>
    api.post(`/files/content/${containerId}`, { path, content }),

  // Create file or directory
  createFile: (containerId, path, type = 'file', content = '') =>
    api.post(`/files/create/${containerId}`, { path, type, content }),

  // Delete file or directory
  deleteFile: (containerId, path) =>
    api.delete(`/files/delete/${containerId}`, { data: { path } }),

  // Rename file or directory
  renameFile: (containerId, oldPath, newPath) =>
    api.put(`/files/rename/${containerId}`, { oldPath, newPath }),

  // Move file or directory
  moveFile: (containerId, sourcePath, destinationPath) =>
    api.put(`/files/move/${containerId}`, { sourcePath, destinationPath }),

  // Copy file or directory
  copyFile: (containerId, sourcePath, destinationPath) =>
    api.post(`/files/copy/${containerId}`, { sourcePath, destinationPath }),

  // Execute file
  executeFile: (containerId, filePath, workingDir = '/workspace') =>
    api.post(`/files/execute/${containerId}`, { filePath, workingDir }),
};

// Helper functions for error handling
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    const message = error.response.data?.error || error.response.statusText;
    return `Server Error (${error.response.status}): ${message}`;
  } else if (error.request) {
    // Request was made but no response received
    return 'Network Error: Unable to connect to server';
  } else {
    // Something else happened
    return `Error: ${error.message}`;
  }
};

// Helper function to check if API is available
export const checkAPIHealth = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data.status === 'ok';
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};

export default api;
