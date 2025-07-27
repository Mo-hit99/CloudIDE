import { useState, useEffect, useCallback } from 'react';
import { dockerAPI, handleAPIError } from './services/api';
import EnhancedFolderTree from './Components/EnhancedFolderTree';
import EnhancedCodeEditor from './Components/EnhancedCodeEditor';
import EnhancedTerminal from './Components/EnhancedTerminal';
import WorkspaceManager from './Components/WorkspaceManager';
import './styles/scrollbar.css';
import './styles/responsive.css';

const EnhancedApp = () => {
  const [containers, setContainers] = useState([]);
  const [selectedContainer, setSelectedContainer] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showWorkspaceManager, setShowWorkspaceManager] = useState(false);

  // Load containers on component mount
  useEffect(() => {
    loadContainers();
  }, []);

  const loadContainers = async () => {
    setLoading(true);
    try {
      const response = await dockerAPI.getContainers();
      const runningContainers = response.data.filter(container => 
        container.state === 'running' && 
        (container.name.includes('dev-container') || container.name.includes('cloud-ide'))
      );
      setContainers(runningContainers);
      
      // Auto-select first container if none selected
      if (!selectedContainer && runningContainers.length > 0) {
        setSelectedContainer(runningContainers[0]);
      }
    } catch (error) {
      const errorMessage = handleAPIError(error);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = useCallback((file) => {
    if (file && file.data?.type === 'file') {
      setCurrentFile(file);
    }
  }, []);

  const handleError = useCallback((errorMessage) => {
    setError(errorMessage);
    setTimeout(() => setError(null), 5000);
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handleFileExecute = useCallback((file) => {
    // This will be handled by the terminal component
    console.log('Executing file:', file);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading containers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col transition-colors duration-200 ${
      darkMode ? 'dark bg-gray-900' : 'bg-gray-100'
    }`}>
      {/* Header */}
      <header className="flex-shrink-0 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                ☁️ Cloud IDE
              </h1>

              {/* Container Selector */}
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600 dark:text-gray-400">
                  Container:
                </label>
                <select
                  value={selectedContainer?.id || ''}
                  onChange={(e) => {
                    const container = containers.find(c => c.id === e.target.value);
                    setSelectedContainer(container);
                  }}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">Select container...</option>
                  {containers.map((container) => (
                    <option key={container.id} value={container.id}>
                      {container.name} ({container.state})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Workspace Manager Toggle */}
              <button
                onClick={() => setShowWorkspaceManager(!showWorkspaceManager)}
                className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors text-sm"
              >
                🎯 Workspace
              </button>

              {/* Refresh Button */}
              <button
                onClick={loadContainers}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
              >
                🔄 Refresh
              </button>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border-l-4 border-red-500 p-4 mx-6 mt-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-500">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex gap-4 p-6 overflow-hidden mobile-stack mobile-p-2 mobile-gap-2 min-h-0">
        {/* Left Sidebar */}
        <div className="w-80 tablet-sidebar-narrow flex flex-col gap-4 min-h-0 mobile-full-width">
          {/* File Explorer */}
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden min-h-0">
            <EnhancedFolderTree
              containerId={selectedContainer?.id}
              onSelect={handleFileSelect}
              onError={handleError}
              onExecute={handleFileExecute}
              key={`${selectedContainer?.id}-${refreshTrigger}`}
            />
          </div>

          {/* Workspace Manager */}
          {showWorkspaceManager && (
            <div className="h-80 workspace-manager-tablet bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <WorkspaceManager
                containerId={selectedContainer?.id}
                onError={handleError}
                onRefresh={handleRefresh}
              />
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col gap-4 min-h-0 min-w-0 mobile-full-width">
          {/* Code Editor */}
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden min-h-0">
            <EnhancedCodeEditor
              containerId={selectedContainer?.id}
              currentFile={currentFile}
              darkMode={darkMode}
              onError={handleError}
              onExecute={handleFileExecute}
              autoSave={true}
              autoSaveDelay={2000}
            />
          </div>

          {/* Terminal */}
          <div className="h-80 bg-gray-900 rounded-lg shadow-md overflow-hidden flex-shrink-0">
            <EnhancedTerminal
              containerId={selectedContainer?.id}
              darkMode={darkMode}
              onError={handleError}
              currentWorkingDir="/workspace"
            />
          </div>
        </div>
      </div>

      {/* No Container Selected */}
      {!selectedContainer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              No Container Selected
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please select a running development container to start coding.
            </p>
            <div className="space-y-2">
              {containers.map((container) => (
                <button
                  key={container.id}
                  onClick={() => setSelectedContainer(container)}
                  className="w-full text-left p-3 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="font-medium text-gray-900 dark:text-white">
                    {container.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {container.image} • {container.state}
                  </div>
                </button>
              ))}
            </div>
            {containers.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400">
                No running containers found. Please start a development container first.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedApp;
