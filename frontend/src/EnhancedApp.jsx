import { useState, useEffect, useCallback } from 'react';
import { dockerAPI, handleAPIError } from './services/api';
import EnhancedFolderTree from './Components/EnhancedFolderTree';
import EnhancedCodeEditor from './Components/EnhancedCodeEditor';
import EnhancedTerminal from './Components/EnhancedTerminal';
import WorkspaceManager from './Components/WorkspaceManager';
import './styles/scrollbar.css';
import './styles/responsive.css';
import './styles/glass-effect.css';
import './styles/enhanced-ui.css';
import './styles/advanced-components.css';

const EnhancedApp = () => {
  const [containers, setContainers] = useState([]);
  const [selectedContainer, setSelectedContainer] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showWorkspaceManager, setShowWorkspaceManager] = useState(false);
  const [fileExplorerCollapsed, setFileExplorerCollapsed] = useState(false);
  const [terminalCollapsed, setTerminalCollapsed] = useState(false);

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
    console.log('🎯 File selected:', file);
    if (file && file.data?.type === 'file') {
      console.log('✅ Setting current file:', file.text, file.data.path);
      setCurrentFile(file);
    } else {
      console.log('❌ Not a file or invalid file data:', file);
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center">
        <div className="text-center liquid-card">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-blue-500 border-r-purple-500 mx-auto mb-6"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-blue-500 opacity-20 mx-auto"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            ☁️ Cloud IDE
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Initializing your workspace...</p>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col transition-all duration-300 ${
      darkMode ? 'dark bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
    }`}>
      {/* Enhanced Header */}
      <header className="flex-shrink-0 glass-header sticky top-0 shadow-lg border-b border-white/20 dark:border-gray-700/30 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-xl">☁️</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Cloud IDE
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Professional Development Environment</p>
                </div>
              </div>

              {/* Enhanced Container Selector */}
              <div className="flex items-center space-x-3">
                <div className="tooltip-container">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    🐳 Container:
                  </label>
                  <div className="tooltip-content">Select your development container</div>
                </div>
                <div className="relative">
                  <select
                    value={selectedContainer?.id || ''}
                    onChange={(e) => {
                      const container = containers.find(c => c.id === e.target.value);
                      setSelectedContainer(container);
                    }}
                    className="liquid-input px-4 py-2 text-sm min-w-[200px] appearance-none bg-white/10 dark:bg-gray-800/50"
                  >
                    <option value="">Choose container...</option>
                    {containers.map((container) => (
                      <option key={container.id} value={container.id}>
                        {container.name} ({container.state})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {selectedContainer && (
                  <div className="status-badge online">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                    ACTIVE
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Enhanced Action Buttons */}
              <div className="tooltip-container">
                <button
                  onClick={() => setFileExplorerCollapsed(!fileExplorerCollapsed)}
                  className="liquid-button liquid-button-neutral px-4 py-2 text-sm hidden md:flex items-center space-x-2"
                >
                  <span>{fileExplorerCollapsed ? '📂' : '📁'}</span>
                  <span>{fileExplorerCollapsed ? 'Show' : 'Hide'} Files</span>
                </button>
                <div className="tooltip-content">Toggle file explorer</div>
              </div>
              
              <div className="tooltip-container">
                <button
                  onClick={() => setShowWorkspaceManager(!showWorkspaceManager)}
                  className="liquid-button liquid-button-primary px-4 py-2 text-sm flex items-center space-x-2"
                >
                  <span>🎯</span>
                  <span className="hidden sm:inline">Workspace</span>
                </button>
                <div className="tooltip-content">Manage workspaces</div>
              </div>

              <div className="tooltip-container">
                <button
                  onClick={loadContainers}
                  className="liquid-button px-4 py-2 text-sm flex items-center space-x-2"
                >
                  <span>🔄</span>
                  <span className="hidden sm:inline">Refresh</span>
                </button>
                <div className="tooltip-content">Refresh containers</div>
              </div>

              <div className="tooltip-container">
                <button
                  onClick={toggleDarkMode}
                  className="liquid-button px-4 py-2 text-sm flex items-center justify-center"
                >
                  <span className="text-lg">{darkMode ? '☀️' : '🌙'}</span>
                </button>
                <div className="tooltip-content">{darkMode ? 'Light' : 'Dark'} mode</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Error Banner */}
      {error && (
        <div className="notification-toast error show mx-6 mt-4 relative">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">⚠️</span>
              </div>
            </div>
            <div className="ml-4 flex-1">
              <h4 className="text-sm font-semibold text-red-800 dark:text-red-200">Error</h4>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-4 text-red-500 hover:text-red-700 dark:hover:text-red-300 transition-colors p-1 rounded hover:bg-red-100/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Main Content */}
      <div className={`flex-1 flex gap-6 p-6 overflow-auto mobile-stack mobile-p-2 mobile-gap-2 min-h-0 large-screen-layout mobile-scrollable ${fileExplorerCollapsed ? 'file-explorer-collapsed' : ''} ${terminalCollapsed ? 'terminal-collapsed' : ''}`}>
        {/* Enhanced Left Sidebar */}
        <div className={`${fileExplorerCollapsed ? 'w-0 overflow-hidden' : 'w-80'} tablet-sidebar-narrow flex flex-col gap-6 min-h-0 mobile-full-width large-sidebar-wide transition-all duration-500 ease-in-out`}>
          {/* Enhanced File Explorer */}
          <div className={`flex-1 liquid-card liquid-card-glow min-h-0 file-tree-mobile mobile-file-explorer ${fileExplorerCollapsed ? 'collapsed' : ''}`}>
            <div className="mobile-explorer-toggle" onClick={() => setFileExplorerCollapsed(!fileExplorerCollapsed)}>
              {fileExplorerCollapsed ? '📂 Show Files' : '📁 Hide Files'}
            </div>
            <EnhancedFolderTree
              containerId={selectedContainer?.id}
              onSelect={handleFileSelect}
              onError={handleError}
              onExecute={handleFileExecute}
              key={`${selectedContainer?.id}-${refreshTrigger}`}
            />
          </div>

          {/* Enhanced Workspace Manager */}
          {showWorkspaceManager && (
            <div className="h-80 workspace-manager-tablet liquid-card overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
                  <span className="mr-2">🎯</span>
                  Workspace Manager
                </h3>
                <button
                  onClick={() => setShowWorkspaceManager(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <WorkspaceManager
                containerId={selectedContainer?.id}
                onError={handleError}
                onRefresh={handleRefresh}
              />
            </div>
          )}
        </div>

        {/* Enhanced Main Content Area */}
        <div className="flex-1 flex flex-col gap-6 min-h-0 min-w-0 mobile-full-width">
          {/* Enhanced Code Editor */}
          <div className="flex-1 liquid-card liquid-card-glow min-h-0 code-editor-mobile large-code-editor relative" style={{ flex: '1 0 70%' }}>
            {!currentFile && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/5 dark:bg-gray-900/20 backdrop-blur-sm rounded-lg">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-3xl">📝</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Welcome to Cloud IDE</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Select a file from the explorer to start coding</p>
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      Auto-save enabled
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                      Syntax highlighting
                    </div>
                  </div>
                </div>
              </div>
            )}
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

          {/* Enhanced Terminal */}
          <div className={`liquid-card min-h-0 terminal-mobile large-terminal ${terminalCollapsed ? 'collapsed' : ''}`} style={{ flex: '0 0 30%', minHeight: '150px' }}>
            <div className="terminal-toggle flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-lg">🖥️</span>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Terminal</h3>
                {selectedContainer && (
                  <div className="status-badge processing text-xs">
                    CONNECTED
                  </div>
                )}
              </div>
              <button 
                onClick={() => setTerminalCollapsed(!terminalCollapsed)}
                className="liquid-button px-3 py-1 text-xs flex items-center space-x-1"
              >
                <span>{terminalCollapsed ? '▼' : '▲'}</span>
                <span>{terminalCollapsed ? 'Expand' : 'Collapse'}</span>
              </button>
            </div>
            <EnhancedTerminal
              containerId={selectedContainer?.id}
              darkMode={darkMode}
              onError={handleError}
              currentWorkingDir="/workspace"
            />
          </div>
        </div>
      </div>

      {/* Enhanced Container Selection Modal */}
      {!selectedContainer && (
        <div className="modal-overlay show">
          <div className="modal-content max-w-lg w-full mx-4">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">🐳</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Select Development Container
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Choose a running container to start your coding session
              </p>
            </div>

            {containers.length > 0 ? (
              <div className="space-y-3">
                {containers.map((container) => (
                  <button
                    key={container.id}
                    onClick={() => setSelectedContainer(container)}
                    className="w-full liquid-card liquid-card-interactive p-4 text-left hover:scale-[1.02] transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {container.name.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {container.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {container.image}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="status-badge online">
                          {container.state}
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl">⚠️</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  No Containers Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No running development containers were found. Please start a container first.
                </p>
                <button
                  onClick={loadContainers}
                  className="liquid-button liquid-button-primary px-6 py-3 flex items-center space-x-2 mx-auto"
                >
                  <span>🔄</span>
                  <span>Refresh Containers</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Action Button for Quick Actions */}
      {selectedContainer && (
        <button className="fab" title="Quick Actions">
          <span>⚡</span>
        </button>
      )}
    </div>
  );
};

export default EnhancedApp;
