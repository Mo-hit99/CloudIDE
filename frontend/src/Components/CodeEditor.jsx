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

// Helper function to determine file mode based on extension
const getFileMode = (filename) => {
  if (!filename) return 'text';

  const extension = filename.split('.').pop()?.toLowerCase();
  const modeMap = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'javascript',
    'tsx': 'javascript',
    'py': 'python',
    'java': 'java',
    'html': 'html',
    'htm': 'html',
    'css': 'css',
    'scss': 'css',
    'sass': 'css',
    'json': 'json',
    'md': 'markdown',
    'dockerfile': 'dockerfile',
    'yml': 'yaml',
    'yaml': 'yaml',
    'xml': 'xml',
    'sql': 'sql',
    'sh': 'sh',
    'bash': 'sh'
  };

  return modeMap[extension] || 'text';
};

const CodeEditor = ({
  containerId,
  currentFile,
  darkMode = true,
  onSave,
  onError,
  autoSave = true,
  autoSaveDelay = 2000
}) => {
  const [content, setContent] = useState('');
  const [isModified, setIsModified] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const autoSaveTimeoutRef = useRef(null);
  const editorRef = useRef(null);

  // Get file mode based on current file
  const fileMode = currentFile ? getFileMode(currentFile.text) : 'text';
  const theme = darkMode ? "tomorrow_night" : "github";

  // Load file content when currentFile changes
  useEffect(() => {
    if (currentFile && currentFile.data?.content !== undefined) {
      setContent(currentFile.data.content);
      setIsModified(false);
      setLastSaved(new Date());
    } else if (currentFile && currentFile.data?.path && containerId) {
      loadFileContent();
    } else {
      setContent('');
      setIsModified(false);
    }
  }, [currentFile, containerId]);

  const loadFileContent = async () => {
    if (!currentFile?.data?.path || !containerId) return;

    try {
      const response = await fileAPI.readFile(containerId, currentFile.data.path);
      setContent(response.data.content);
      setIsModified(false);
      setLastSaved(new Date());
    } catch (error) {
      const errorMessage = handleAPIError(error);
      onError?.(errorMessage);
      console.error('Failed to load file content:', error);
    }
  };

  // Save file content
  const saveFile = useCallback(async (contentToSave = content) => {
    if (!currentFile?.data?.path || !containerId || isSaving) return;

    setIsSaving(true);
    try {
      await fileAPI.writeFile(containerId, currentFile.data.path, contentToSave);
      setIsModified(false);
      setLastSaved(new Date());
      onSave?.(currentFile.data.path, contentToSave);
    } catch (error) {
      const errorMessage = handleAPIError(error);
      onError?.(errorMessage);
      console.error('Failed to save file:', error);
    } finally {
      setIsSaving(false);
    }
  }, [content, currentFile, containerId, isSaving, onSave, onError]);

  // Handle content changes
  const handleChange = useCallback((newValue) => {
    setContent(newValue);
    setIsModified(true);

    // Clear existing auto-save timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new auto-save timeout if enabled
    if (autoSave && containerId && currentFile?.data?.path) {
      autoSaveTimeoutRef.current = setTimeout(() => {
        saveFile(newValue);
      }, autoSaveDelay);
    }
  }, [autoSave, autoSaveDelay, containerId, currentFile, saveFile]);

  // Manual save with Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (isModified) {
          saveFile();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [isModified, saveFile]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  if (!currentFile) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>Select a file to edit</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* File header with save status */}
      <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {currentFile.text}
          </span>
          {isModified && (
            <span className="text-xs text-orange-500 dark:text-orange-400">
              • Modified
            </span>
          )}
          {isSaving && (
            <span className="text-xs text-blue-500 dark:text-blue-400">
              Saving...
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {lastSaved && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => saveFile()}
            disabled={!isModified || isSaving}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>

      {/* Code editor */}
      <div className="flex-1">
        <AceEditor
          ref={editorRef}
          mode={fileMode}
          theme={theme}
          onChange={handleChange}
          value={content}
          name="code-editor"
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
            fontFamily: 'JetBrains Mono, monospace',
            useWorker: false
          }}
          style={{
            borderRadius: '0 0 8px 8px',
            backgroundColor: 'transparent'
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;