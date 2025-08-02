import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import EnhancedFolderTree from './Components/EnhancedFolderTree';
import EnhancedCodeEditor from './Components/EnhancedCodeEditor';
import EnhancedTerminal from './Components/EnhancedTerminal';
import WorkspaceManager from './Components/WorkspaceManager';
import UserProfile from './Components/UserProfile';
import './styles/scrollbar.css';
import './styles/responsive.css';

function AuthenticatedApp() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentFile, setCurrentFile] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      return savedTheme === 'dark' ||
        (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showWorkspaceManager, setShowWorkspaceManager] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [fileExplorerCollapsed, setFileExplorerCollapsed] = useState(false);
  const [terminalCollapsed, setTerminalCollapsed] = useState(false);
  const terminalRef = useRef(null);

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleError = useCallback((error) => {
    console.error('App error:', error);
    setError(error);
    setTimeout(() => setError(null), 5000);
  }, []);

  const handleFileSelect = useCallback((file) => {
    setCurrentFile(file);
  }, []);

  const handleFileExecute = useCallback((file) => {
    console.log('Executing file:', file);
    // Pass the file to the terminal for execution
    if (terminalRef.current && terminalRef.current.executeFile) {
      terminalRef.current.executeFile(file);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      // Navigate to login page after logout
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Navigate to login even if logout fails
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className={`h-screen flex flex-col transition-all duration-300 ${
      darkMode ? 'dark' : ''
    }`}>
      <div className="h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex flex-col">
        {/* Header */}
        <header className="flex-shrink-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
          <div className="px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              {/* Logo and Title */}
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-lg sm:text-xl font-bold">☁️</span>
                  </div>
                  <div>
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                      Cloud IDE
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                      Welcome, {user?.firstName}
                    </p>
                  </div>
                </div>
                {user?.containerId && (
                  <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-700 dark:text-green-300 font-medium">
                      Container Active
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-1 sm:space-x-2">
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                
                {/* Mobile File Explorer Toggle */}
                <button
                  onClick={() => setFileExplorerCollapsed(!fileExplorerCollapsed)}
                  className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 ml-1"
                >
                  {fileExplorerCollapsed ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                    </svg>
                  )}
                </button>

                {/* Desktop Action Buttons */}
                <div className="hidden md:flex items-center space-x-2">
                  {/* Workspace Manager Button */}
                  <button
                    onClick={() => setShowWorkspaceManager(!showWorkspaceManager)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
                      showWorkspaceManager
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                    }`}
                  >
                    <span>🎯</span>
                    <span className="text-sm font-medium">Workspace</span>
                  </button>

                  {/* Refresh Button */}
                  <button
                    onClick={handleRefresh}
                    className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    <span>🔄</span>
                    <span className="text-sm font-medium">Refresh</span>
                  </button>

                  {/* User Profile Button */}
                  <button
                    onClick={() => setShowUserProfile(!showUserProfile)}
                    className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium">{user?.username}</span>
                  </button>

                  {/* Dark Mode Toggle */}
                  <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    {darkMode ? '☀️' : '🌙'}
                  </button>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    <span>🚪</span>
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Menu */}
            {showMobileMenu && (
              <div className="md:hidden mt-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setShowWorkspaceManager(!showWorkspaceManager);
                      setShowMobileMenu(false);
                    }}
                    className="flex items-center justify-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium"
                  >
                    <span>🎯</span>
                    <span>Workspace</span>
                  </button>
                  <button
                    onClick={() => {
                      handleRefresh();
                      setShowMobileMenu(false);
                    }}
                    className="flex items-center justify-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg text-sm font-medium"
                  >
                    <span>🔄</span>
                    <span>Refresh</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowUserProfile(!showUserProfile);
                      setShowMobileMenu(false);
                    }}
                    className="flex items-center justify-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium"
                  >
                    <span>👤</span>
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowMobileMenu(false);
                    }}
                    className="flex items-center justify-center space-x-2 px-3 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg text-sm font-medium"
                  >
                    <span>🚪</span>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

      {/* Error Display */}
      {error && (
        <div className="flex-shrink-0 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-200">
                {typeof error === 'string' ? error : error.message || 'An error occurred'}
              </p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`flex-1 flex gap-4 p-6 mobile-stack mobile-p-2 mobile-gap-2 min-h-0 mobile-scrollable ${fileExplorerCollapsed ? 'file-explorer-collapsed' : ''} ${terminalCollapsed ? 'terminal-collapsed' : ''}`} style={{ minHeight: '100vh' }}>
        {/* Left Sidebar */}
        <div className={`${fileExplorerCollapsed ? 'w-0 overflow-hidden' : 'w-80'} tablet-sidebar-narrow flex flex-col gap-4 min-h-0 mobile-full-width transition-all duration-300`}>
          {/* File Explorer */}
          <div className={`flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden min-h-0 file-tree-mobile mobile-file-explorer ${fileExplorerCollapsed ? 'collapsed' : ''}`}>
            <div className="mobile-explorer-toggle" onClick={() => setFileExplorerCollapsed(!fileExplorerCollapsed)}>
              {fileExplorerCollapsed ? '📂 Show Files' : '📁 Hide Files'}
            </div>
            <EnhancedFolderTree
              containerId={user?.containerId}
              onSelect={handleFileSelect}
              onError={handleError}
              onExecute={handleFileExecute}
              key={`${user?.containerId}-${refreshTrigger}`}
            />
          </div>

          {/* Workspace Manager */}
          {showWorkspaceManager && (
            <div className="h-80 workspace-manager-tablet bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <WorkspaceManager
                containerId={user?.containerId}
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
              containerId={user?.containerId}
              currentFile={currentFile}
              darkMode={darkMode}
              onError={handleError}
              onExecute={handleFileExecute}
              autoSave={true}
              autoSaveDelay={2000}
            />
          </div>

          {/* Terminal */}
          <div className={`bg-gray-900 rounded-lg shadow-md overflow-hidden flex-shrink-0 terminal-mobile ${terminalCollapsed ? 'collapsed' : ''}`} style={{ height: '320px' }}>
            <div className="terminal-toggle flex justify-between items-center px-2 py-1 bg-gray-800 dark:bg-gray-700 border-b border-gray-700 dark:border-gray-600">
              <span className="text-xs font-medium text-gray-300">Terminal</span>
              <button 
                onClick={() => setTerminalCollapsed(!terminalCollapsed)}
                className="text-xs px-2 py-1 rounded hover:bg-gray-700 dark:hover:bg-gray-600 text-gray-300"
              >
                {terminalCollapsed ? '▼ Expand' : '▲ Collapse'}
              </button>
            </div>
            <EnhancedTerminal
              ref={terminalRef}
              containerId={user?.containerId}
              workspaceId={user?.workspaceId}
              darkMode={darkMode}
              onError={handleError}
              currentWorkingDir="/workspace"
            />
          </div>
        </div>
      </div>

        {/* User Profile Modal */}
        {showUserProfile && (
          <UserProfile
            onClose={() => setShowUserProfile(false)}
            darkMode={darkMode}
          />
        )}
      </div>
    </div>
  );
}

export default AuthenticatedApp;
