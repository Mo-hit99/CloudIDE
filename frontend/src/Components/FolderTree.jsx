import React from 'react';
import { Tree } from '@minoru/react-dnd-treeview';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const CustomNode = ({ node, depth }) => {
  const indent = depth * 16;
  
  return (
    <div 
      className="tree-item flex items-center py-1.5 px-2 my-0.5 text-black dark:text-gray-300 hover:bg-[#DDDDDD] dark:hover:bg-gray-700 hover:text-black dark:hover:text-white rounded cursor-pointer transition-colors duration-150"
      style={{ paddingLeft: `${indent + 8}px` }}
    >
      <span className="mr-2 opacity-80">
        {node.droppable ? 
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
  );
};

const FolderTree = ({ data, onSelect }) => {
  const handleSelect = (node) => {
    if (!node.droppable) {
      onSelect?.(node);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-full overflow-auto">
        <Tree
          tree={data}
          rootId={0}
          render={(node, { depth }) => (
            <CustomNode node={node} depth={depth} />
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
