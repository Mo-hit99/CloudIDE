import { useState, useEffect, useCallback, useRef } from 'react';
import { fileAPI, handleAPIError } from '../services/api';

// File type icons mapping
const getFileIcon = (fileType, isDirectory) => {
  if (isDirectory) return '📁';
  
  const iconMap = {
    javascript: '🟨',
    typescript: '🔷',
    python: '🐍',
    java: '☕',
    html: '🌐',
    css: '🎨',
    json: '📋',
    markdown: '📝',
    yaml: '⚙️',
    xml: '📄',
    text: '📄',
    log: '📜',
    shell: '🖥️',
    batch: '🖥️',
    dockerfile: '🐳',
    database: '🗄️',
    php: '🐘',
    ruby: '💎',
    go: '🐹',
    rust: '🦀',
    cpp: '⚡',
    c: '⚡'
  };
  
  return iconMap[fileType] || '📄';
};

const TreeNode = ({ 
  node, 
  depth = 0, 
  onSelect, 
  onCreateFile, 
  onCreateFolder, 
  onDelete, 
  onRename, 
  onExecute,
  selectedNode,
  expandedNodes,
  onToggleExpand 
}) => {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(node.text);
  const contextMenuRef = useRef(null);
  const inputRef = useRef(null);

  const indent = depth * 20;
  const isDirectory = node.data?.type === 'directory';
  const isExpanded = expandedNodes.has(node.id);
  const isSelected = selectedNode?.id === node.id;

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
        setShowContextMenu(false);
      }
    };

    if (showContextMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showContextMenu]);

  const handleClick = (e) => {
    e.stopPropagation();
    if (isDirectory) {
      onToggleExpand(node.id);
    }
    onSelect(node);
  };

  const handleRightClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowContextMenu(true);
  };

  const handleContextAction = (action) => {
    setShowContextMenu(false);
    switch (action) {
      case 'newFile':
        onCreateFile(node);
        break;
      case 'newFolder':
        onCreateFolder(node);
        break;
      case 'rename':
        setIsRenaming(true);
        break;
      case 'delete':
        onDelete(node);
        break;
      case 'execute':
        onExecute(node);
        break;
    }
  };

  const handleRename = () => {
    if (newName.trim() && newName !== node.text) {
      onRename(node, newName.trim());
    }
    setIsRenaming(false);
    setNewName(node.text);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setIsRenaming(false);
      setNewName(node.text);
    }
  };

  return (
    <div className="relative">
      <div
        className={`flex items-center py-1.5 px-2 my-0.5 rounded cursor-pointer transition-colors duration-150 select-none ${
          isSelected
            ? 'bg-blue-500 text-white'
            : 'text-black dark:text-gray-300 hover:bg-[#DDDDDD] dark:hover:bg-gray-700 hover:text-black dark:hover:text-white'
        }`}
        style={{ paddingLeft: `${indent + 8}px`, minHeight: '32px' }}
        onClick={handleClick}
        onContextMenu={handleRightClick}
      >
        {/* Expand/Collapse Icon */}
        {isDirectory && (
          <span className="mr-1 text-xs">
            {isExpanded ? '▼' : '▶'}
          </span>
        )}
        
        {/* File/Folder Icon */}
        <span className="mr-2 text-sm">
          {getFileIcon(node.data?.fileType, isDirectory)}
        </span>
        
        {/* File/Folder Name */}
        {isRenaming ? (
          <input
            ref={inputRef}
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={handleKeyDown}
            className="bg-white dark:bg-gray-800 text-black dark:text-white px-1 py-0.5 rounded text-sm flex-1"
          />
        ) : (
          <span className="text-sm flex-1 truncate">{node.text}</span>
        )}
        
        {/* Executable indicator */}
        {node.data?.executable && (
          <span className="ml-2 text-xs text-green-500">▶</span>
        )}
      </div>

      {/* Context Menu */}
      {showContextMenu && (
        <div
          ref={contextMenuRef}
          className="absolute z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg py-1 min-w-32"
          style={{ top: '100%', left: `${indent + 8}px` }}
        >
          {isDirectory && (
            <>
              <button
                onClick={() => handleContextAction('newFile')}
                className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                📄 New File
              </button>
              <button
                onClick={() => handleContextAction('newFolder')}
                className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                📁 New Folder
              </button>
              <hr className="my-1 border-gray-200 dark:border-gray-600" />
            </>
          )}
          
          {node.data?.executable && (
            <button
              onClick={() => handleContextAction('execute')}
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-green-600"
            >
              ▶ Run File
            </button>
          )}
          
          <button
            onClick={() => handleContextAction('rename')}
            className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            ✏️ Rename
          </button>
          
          <button
            onClick={() => handleContextAction('delete')}
            className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600"
          >
            🗑️ Delete
          </button>
        </div>
      )}

      {/* Children */}
      {isDirectory && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              onSelect={onSelect}
              onCreateFile={onCreateFile}
              onCreateFolder={onCreateFolder}
              onDelete={onDelete}
              onRename={onRename}
              onExecute={onExecute}
              selectedNode={selectedNode}
              expandedNodes={expandedNodes}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const EnhancedFolderTree = ({ containerId, onSelect, onError, onExecute }) => {
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPath, setSelectedPath] = useState('/workspace');
  const [expandedNodes, setExpandedNodes] = useState(new Set(['/workspace']));
  const [selectedNode, setSelectedNode] = useState(null);

  const loadDirectoryTree = useCallback(async (path = selectedPath) => {
    if (!containerId) {
      console.warn('No container ID provided to EnhancedFolderTree');
      setTreeData([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fileAPI.getDirectoryTree(containerId, path);
      setTreeData(response.data);
    } catch (error) {
      const errorMessage = handleAPIError(error);
      console.error('Error loading directory tree:', errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [containerId, selectedPath, onError]);

  useEffect(() => {
    loadDirectoryTree();
  }, [loadDirectoryTree]);

  const handleToggleExpand = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleSelect = (node) => {
    setSelectedNode(node);
    if (node.data?.type === 'file') {
      onSelect?.(node);
    }
  };

  const handleCreateFile = async (node) => {
    const fileName = prompt('Enter file name:');
    if (!fileName) return;

    const basePath = node?.data?.path || selectedPath;
    const filePath = `${basePath}/${fileName}`;

    try {
      await fileAPI.createFile(containerId, filePath, 'file', '');
      loadDirectoryTree();
    } catch (error) {
      const errorMessage = handleAPIError(error);
      onError?.(errorMessage);
    }
  };

  const handleCreateFolder = async (node) => {
    const folderName = prompt('Enter folder name:');
    if (!folderName) return;

    const basePath = node?.data?.path || selectedPath;
    const folderPath = `${basePath}/${folderName}`;

    try {
      await fileAPI.createFile(containerId, folderPath, 'directory');
      loadDirectoryTree();
    } catch (error) {
      const errorMessage = handleAPIError(error);
      onError?.(errorMessage);
    }
  };

  const handleDelete = async (node) => {
    if (!confirm(`Are you sure you want to delete ${node.text}?`)) return;

    try {
      await fileAPI.deleteFile(containerId, node.data.path);
      loadDirectoryTree();
    } catch (error) {
      const errorMessage = handleAPIError(error);
      onError?.(errorMessage);
    }
  };

  const handleRename = async (node, newName) => {
    const pathParts = node.data.path.split('/');
    pathParts[pathParts.length - 1] = newName;
    const newPath = pathParts.join('/');

    try {
      await fileAPI.renameFile(containerId, node.data.path, newPath);
      loadDirectoryTree();
    } catch (error) {
      const errorMessage = handleAPIError(error);
      onError?.(errorMessage);
    }
  };

  const handleExecuteFile = async (node) => {
    if (node.data?.type !== 'file' || !node.data?.executable) return;

    try {
      onExecute?.(node);
    } catch (error) {
      const errorMessage = handleAPIError(error);
      onError?.(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      <div className="flex-shrink-0 p-3 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            📁 Workspace Files
          </h3>
          <button
            onClick={() => loadDirectoryTree()}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="Refresh"
          >
            🔄
          </button>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{
          minHeight: 0,
          maxHeight: '100%',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(156, 163, 175, 0.6) transparent'
        }}
      >
        <div className="p-2">

          {treeData.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <p>No files found</p>
              <button
                onClick={() => handleCreateFile({ data: { path: selectedPath } })}
                className="mt-2 text-blue-500 hover:text-blue-600 text-sm"
              >
                Create your first file
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              {treeData.map((node) => (
                <TreeNode
                  key={node.id}
                  node={node}
                  onSelect={handleSelect}
                  onCreateFile={handleCreateFile}
                  onCreateFolder={handleCreateFolder}
                  onDelete={handleDelete}
                  onRename={handleRename}
                  onExecute={handleExecuteFile}
                  selectedNode={selectedNode}
                  expandedNodes={expandedNodes}
                  onToggleExpand={handleToggleExpand}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedFolderTree;
