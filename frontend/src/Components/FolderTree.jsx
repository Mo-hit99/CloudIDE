import { useState, useEffect, useCallback } from 'react';
import { Tree } from '@minoru/react-dnd-treeview';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { fileAPI, handleAPIError } from '../services/api';

const CustomNode = ({ node, depth, onRefresh, onCreateFile, onCreateFolder, onDelete }) => {
  const indent = depth * 16;
  const [showContextMenu, setShowContextMenu] = useState(false);

  const handleRightClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowContextMenu(true);
  };

  const handleContextAction = (action) => {
    setShowContextMenu(false);
    switch (action) {
      case 'refresh':
        onRefresh?.(node);
        break;
      case 'newFile':
        onCreateFile?.(node);
        break;
      case 'newFolder':
        onCreateFolder?.(node);
        break;
      case 'delete':
        onDelete?.(node);
        break;
    }
  };

  return (
    <div className="relative">
      <div
        className="tree-item flex items-center py-1.5 px-2 my-0.5 text-black dark:text-gray-300 hover:bg-[#DDDDDD] dark:hover:bg-gray-700 hover:text-black dark:hover:text-white rounded cursor-pointer transition-colors duration-150"
        style={{ paddingLeft: `${indent + 8}px` }}
        onContextMenu={handleRightClick}
      >
        <span className="mr-2 opacity-80">
          {node.droppable || node.isDirectory ?
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg> :
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        </span>
        <span className="text-sm truncate">{node.text}</span>
      </div>

      {showContextMenu && (
        <div className="absolute z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded shadow-lg py-1 min-w-32">
          <button
            className="w-full text-left px-3 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => handleContextAction('refresh')}
          >
            Refresh
          </button>
          {(node.droppable || node.isDirectory) && (
            <>
              <button
                className="w-full text-left px-3 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleContextAction('newFile')}
              >
                New File
              </button>
              <button
                className="w-full text-left px-3 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleContextAction('newFolder')}
              >
                New Folder
              </button>
            </>
          )}
          <button
            className="w-full text-left px-3 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600"
            onClick={() => handleContextAction('delete')}
          >
            Delete
          </button>
        </div>
      )}

      {showContextMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowContextMenu(false)}
        />
      )}
    </div>
  );
};

const FolderTree = ({ containerId, onSelect, onError }) => {
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPath, setSelectedPath] = useState('/app');

  // Convert API tree data to react-dnd-treeview format
  const convertToTreeFormat = (apiData, parentId = 0) => {
    const result = [];
    let idCounter = 1;

    const processNode = (node, parent = 0) => {
      const currentId = idCounter++;
      const treeNode = {
        id: currentId,
        parent: parent,
        text: node.text,
        droppable: node.isDirectory || node.children?.length > 0,
        data: {
          path: node.path,
          isDirectory: node.isDirectory
        }
      };

      result.push(treeNode);

      if (node.children && node.children.length > 0) {
        node.children.forEach(child => processNode(child, currentId));
      }
    };

    if (Array.isArray(apiData)) {
      apiData.forEach(node => processNode(node));
    }

    return result;
  };

  const loadDirectoryTree = useCallback(async (path = '/app') => {
    if (!containerId) {
      onError?.('No container selected');
      return;
    }

    setLoading(true);
    try {
      const response = await fileAPI.getDirectoryTree(containerId, path);
      const convertedData = convertToTreeFormat(response.data);
      setTreeData(convertedData);
    } catch (error) {
      const errorMessage = handleAPIError(error);
      onError?.(errorMessage);
      console.error('Failed to load directory tree:', error);
    } finally {
      setLoading(false);
    }
  }, [containerId, onError]);

  // Load tree when container changes
  useEffect(() => {
    if (containerId) {
      loadDirectoryTree(selectedPath);
    }
  }, [containerId, selectedPath, loadDirectoryTree]);

  const handleSelect = async (node) => {
    if (!node.droppable && !node.data?.isDirectory) {
      try {
        const response = await fileAPI.readFile(containerId, node.data.path);
        onSelect?.({
          ...node,
          data: {
            ...node.data,
            content: response.data.content
          }
        });
      } catch (error) {
        const errorMessage = handleAPIError(error);
        onError?.(errorMessage);
      }
    }
  };

  const handleRefresh = (node) => {
    const path = node?.data?.path || selectedPath;
    loadDirectoryTree(path);
  };

  const handleCreateFile = async (node) => {
    const fileName = prompt('Enter file name:');
    if (!fileName) return;

    const basePath = node?.data?.path || selectedPath;
    const filePath = `${basePath}/${fileName}`;

    try {
      await fileAPI.createFile(containerId, filePath, 'file', '');
      loadDirectoryTree(selectedPath);
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
      loadDirectoryTree(selectedPath);
    } catch (error) {
      const errorMessage = handleAPIError(error);
      onError?.(errorMessage);
    }
  };

  const handleDelete = async (node) => {
    if (!confirm(`Are you sure you want to delete ${node.text}?`)) return;

    try {
      await fileAPI.deleteFile(containerId, node.data.path);
      loadDirectoryTree(selectedPath);
    } catch (error) {
      const errorMessage = handleAPIError(error);
      onError?.(errorMessage);
    }
  };

  if (!containerId) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <p>Select a container to view files</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-full overflow-auto">
        <Tree
          tree={treeData}
          rootId={0}
          render={(node, { depth }) => (
            <CustomNode
              node={node}
              depth={depth}
              onRefresh={handleRefresh}
              onCreateFile={handleCreateFile}
              onCreateFolder={handleCreateFolder}
              onDelete={handleDelete}
            />
          )}
          onDrop={() => {}}
          onClick={handleSelect}
          initialOpen={true}
        />
      </div>
    </DndProvider>
  );
};

export default FolderTree;
