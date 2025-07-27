import { useEffect, useState, useCallback, useRef } from "react";
import AceEditor from "react-ace";
import ace from "ace-builds";
import "ace-builds/src-noconflict/ace";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/mode-css";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/mode-markdown";
import "ace-builds/src-noconflict/mode-dockerfile";
import "ace-builds/src-noconflict/mode-yaml";
import "ace-builds/src-noconflict/mode-typescript";
import "ace-builds/src-noconflict/mode-php";
import "ace-builds/src-noconflict/mode-ruby";
import "ace-builds/src-noconflict/mode-golang";
import "ace-builds/src-noconflict/mode-rust";
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/snippets/java";
import "ace-builds/src-noconflict/snippets/javascript";
import "ace-builds/src-noconflict/snippets/python";
import "ace-builds/src-noconflict/theme-tomorrow_night";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/ext-searchbox";
import { fileAPI, handleAPIError } from '../services/api';

// Set Ace editor base path
ace.config.set(
  "basePath",
  "https://cdn.jsdelivr.net/npm/ace-builds@1.31.1/src-noconflict/"
);

// File mode mapping
const getFileMode = (filename) => {
  if (!filename) return 'text';
  
  const ext = filename.split('.').pop()?.toLowerCase();
  const modeMap = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'java': 'java',
    'html': 'html',
    'htm': 'html',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'json': 'json',
    'md': 'markdown',
    'markdown': 'markdown',
    'yml': 'yaml',
    'yaml': 'yaml',
    'xml': 'xml',
    'php': 'php',
    'rb': 'ruby',
    'go': 'golang',
    'rs': 'rust',
    'cpp': 'c_cpp',
    'c': 'c_cpp',
    'h': 'c_cpp',
    'hpp': 'c_cpp',
    'dockerfile': 'dockerfile',
    'sh': 'sh',
    'bash': 'sh',
    'sql': 'sql'
  };
  
  return modeMap[ext] || 'text';
};

const FileTab = ({ file, isActive, onSelect, onClose, isModified }) => {
  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const iconMap = {
      'js': '🟨', 'jsx': '🟨', 'ts': '🔷', 'tsx': '🔷',
      'py': '🐍', 'java': '☕', 'html': '🌐', 'css': '🎨',
      'json': '📋', 'md': '📝', 'yml': '⚙️', 'yaml': '⚙️'
    };
    return iconMap[ext] || '📄';
  };

  return (
    <div
      className={`flex items-center px-3 py-2 border-r border-gray-200 dark:border-gray-600 cursor-pointer transition-colors ${
        isActive 
          ? 'bg-white dark:bg-gray-800 text-black dark:text-white' 
          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
      }`}
      onClick={onSelect}
    >
      <span className="mr-2 text-sm">{getFileIcon(file.text)}</span>
      <span className="text-sm truncate max-w-32">{file.text}</span>
      {isModified && <span className="ml-1 text-orange-500">●</span>}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
      >
        ×
      </button>
    </div>
  );
};

const EnhancedCodeEditor = ({
  containerId,
  currentFile,
  darkMode = true,
  onSave,
  onError,
  onExecute,
  autoSave = true,
  autoSaveDelay = 2000
}) => {
  const [openFiles, setOpenFiles] = useState([]);
  const [activeFileId, setActiveFileId] = useState(null);
  const [fileContents, setFileContents] = useState({});
  const [modifiedFiles, setModifiedFiles] = useState(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState({});
  const autoSaveTimeoutRef = useRef({});
  const editorRef = useRef(null);

  const activeFile = openFiles.find(f => f.id === activeFileId);
  const activeContent = activeFile ? (fileContents[activeFile.id] || '') : '';
  const fileMode = activeFile ? getFileMode(activeFile.text) : 'text';
  const theme = darkMode ? "tomorrow_night" : "github";

  // Load file content when a new file is opened
  const loadFileContent = useCallback(async (file) => {
    if (fileContents[file.id] !== undefined) return;

    try {
      const response = await fileAPI.readFile(containerId, file.data.path);
      setFileContents(prev => ({
        ...prev,
        [file.id]: response.data.content || ''
      }));
    } catch (error) {
      const errorMessage = handleAPIError(error);
      onError?.(errorMessage);
      setFileContents(prev => ({
        ...prev,
        [file.id]: ''
      }));
    }
  }, [containerId, fileContents, onError]);

  // Open file in editor
  const openFile = useCallback((file) => {
    if (!file || file.data?.type !== 'file') return;

    // Check if file is already open
    const existingFile = openFiles.find(f => f.id === file.id);
    if (existingFile) {
      setActiveFileId(file.id);
      return;
    }

    // Add to open files
    setOpenFiles(prev => [...prev, file]);
    setActiveFileId(file.id);
    loadFileContent(file);
  }, [openFiles, loadFileContent]);

  // Close file
  const closeFile = useCallback((fileId) => {
    // Check if file is modified
    if (modifiedFiles.has(fileId)) {
      const shouldClose = confirm('File has unsaved changes. Close anyway?');
      if (!shouldClose) return;
    }

    setOpenFiles(prev => prev.filter(f => f.id !== fileId));
    setFileContents(prev => {
      const newContents = { ...prev };
      delete newContents[fileId];
      return newContents;
    });
    setModifiedFiles(prev => {
      const newModified = new Set(prev);
      newModified.delete(fileId);
      return newModified;
    });

    // Clear auto-save timeout
    if (autoSaveTimeoutRef.current[fileId]) {
      clearTimeout(autoSaveTimeoutRef.current[fileId]);
      delete autoSaveTimeoutRef.current[fileId];
    }

    // Switch to another file if this was active
    if (activeFileId === fileId) {
      const remainingFiles = openFiles.filter(f => f.id !== fileId);
      setActiveFileId(remainingFiles.length > 0 ? remainingFiles[remainingFiles.length - 1].id : null);
    }
  }, [modifiedFiles, activeFileId, openFiles]);

  // Save file
  const saveFile = useCallback(async (fileId = activeFileId) => {
    if (!fileId || !containerId) return;

    const file = openFiles.find(f => f.id === fileId);
    const content = fileContents[fileId];
    
    if (!file || content === undefined) return;

    setIsSaving(true);
    try {
      await fileAPI.writeFile(containerId, file.data.path, content);
      setModifiedFiles(prev => {
        const newModified = new Set(prev);
        newModified.delete(fileId);
        return newModified;
      });
      setLastSaved(prev => ({
        ...prev,
        [fileId]: new Date()
      }));
      onSave?.(file, content);
    } catch (error) {
      const errorMessage = handleAPIError(error);
      onError?.(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }, [activeFileId, containerId, openFiles, fileContents, onSave, onError]);

  // Handle content change
  const handleChange = useCallback((newContent) => {
    if (!activeFileId) return;

    setFileContents(prev => ({
      ...prev,
      [activeFileId]: newContent
    }));

    setModifiedFiles(prev => new Set([...prev, activeFileId]));

    // Auto-save
    if (autoSave) {
      if (autoSaveTimeoutRef.current[activeFileId]) {
        clearTimeout(autoSaveTimeoutRef.current[activeFileId]);
      }
      autoSaveTimeoutRef.current[activeFileId] = setTimeout(() => {
        saveFile(activeFileId);
      }, autoSaveDelay);
    }
  }, [activeFileId, autoSave, autoSaveDelay, saveFile]);

  // Execute current file
  const executeCurrentFile = useCallback(async () => {
    if (!activeFile || !activeFile.data?.executable) return;

    try {
      // Save file first if modified
      if (modifiedFiles.has(activeFileId)) {
        await saveFile(activeFileId);
      }
      
      onExecute?.(activeFile);
    } catch (error) {
      const errorMessage = handleAPIError(error);
      onError?.(errorMessage);
    }
  }, [activeFile, activeFileId, modifiedFiles, saveFile, onExecute, onError]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            saveFile();
            break;
          case 'w':
            e.preventDefault();
            if (activeFileId) closeFile(activeFileId);
            break;
          case 'r':
            e.preventDefault();
            executeCurrentFile();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [saveFile, closeFile, activeFileId, executeCurrentFile]);

  // Open file when currentFile prop changes
  useEffect(() => {
    if (currentFile) {
      openFile(currentFile);
    }
  }, [currentFile, openFile]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(autoSaveTimeoutRef.current).forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* File Tabs */}
      <div className="flex-shrink-0 flex overflow-x-auto border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700" style={{ scrollbarWidth: 'thin' }}>
        {openFiles.map((file) => (
          <FileTab
            key={file.id}
            file={file}
            isActive={file.id === activeFileId}
            onSelect={() => setActiveFileId(file.id)}
            onClose={() => closeFile(file.id)}
            isModified={modifiedFiles.has(file.id)}
          />
        ))}

        {openFiles.length === 0 && (
          <div className="flex-1 flex items-center justify-center py-8 text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <p className="mb-2">No files open</p>
              <p className="text-sm">Select a file from the explorer to start editing</p>
            </div>
          </div>
        )}
      </div>

      {/* Editor Toolbar */}
      {activeFile && (
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-4 min-w-0 flex-1">
            <span className="text-sm text-gray-600 dark:text-gray-300 truncate">
              {activeFile.data.path}
            </span>
            {modifiedFiles.has(activeFileId) && (
              <span className="text-xs text-orange-500 flex-shrink-0">● Modified</span>
            )}
            {lastSaved[activeFileId] && (
              <span className="text-xs text-gray-500 flex-shrink-0">
                Saved {lastSaved[activeFileId].toLocaleTimeString()}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            {activeFile.data?.executable && (
              <button
                onClick={executeCurrentFile}
                className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                title="Run file (Ctrl+R)"
              >
                ▶ Run
              </button>
            )}

            <button
              onClick={() => saveFile()}
              disabled={isSaving || !modifiedFiles.has(activeFileId)}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
              title="Save file (Ctrl+S)"
            >
              {isSaving ? '💾 Saving...' : '💾 Save'}
            </button>
          </div>
        </div>
      )}

      {/* Code Editor */}
      {activeFile && (
        <div className="flex-1">
          <AceEditor
            ref={editorRef}
            mode={fileMode}
            theme={theme}
            onChange={handleChange}
            value={activeContent}
            name={`editor-${activeFileId}`}
            editorProps={{ $blockScrolling: true }}
            width="100%"
            height="100%"
            fontSize={14}
            showPrintMargin={false}
            showGutter={true}
            highlightActiveLine={true}
            setOptions={{
              enableBasicAutocompletion: true,
              enableLiveAutocompletion: true,
              enableSnippets: true,
              showLineNumbers: true,
              tabSize: 2,
              fontFamily: 'JetBrains Mono, Consolas, Monaco, "Courier New", monospace',
              useWorker: false
            }}
            style={{
              backgroundColor: 'transparent'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default EnhancedCodeEditor;
