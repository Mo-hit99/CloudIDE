import { useState, useCallback } from 'react';
import { fileAPI, handleAPIError } from '../services/api';

const fileTemplates = {
  'hello.py': `#!/usr/bin/env python3
"""
Hello World Python Script
"""

def main():
    print("Hello, World!")
    print("Welcome to your Python workspace!")

if __name__ == "__main__":
    main()
`,
  'hello.js': `#!/usr/bin/env node
/**
 * Hello World Node.js Script
 */

function main() {
    console.log("Hello, World!");
    console.log("Welcome to your Node.js workspace!");
}

main();
`,
  'Hello.java': `public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        System.out.println("Welcome to your Java workspace!");
    }
}
`,
  'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hello World</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Hello, World!</h1>
        <p>Welcome to your HTML workspace!</p>
    </div>
</body>
</html>
`,
  'README.md': `# My Project

Welcome to your new project workspace!

## Getting Started

This workspace includes:
- File explorer with context menus
- Code editor with syntax highlighting
- Integrated terminal
- File execution capabilities

## Quick Start

1. Create new files using the file explorer
2. Edit files in the code editor
3. Run executable files using the Run button or Ctrl+R
4. Use the terminal for additional commands

## Supported Languages

- Python (.py)
- JavaScript/Node.js (.js)
- Java (.java)
- HTML (.html)
- CSS (.css)
- Markdown (.md)
- And many more!

Happy coding! 🚀
`,
  'package.json': `{
  "name": "my-project",
  "version": "1.0.0",
  "description": "My awesome project",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "test": "echo \\"Error: no test specified\\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "MIT"
}
`,
  'requirements.txt': `# Python dependencies
# Add your required packages here
# Example:
# requests>=2.25.1
# numpy>=1.21.0
`,
  'style.css': `/* Global Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Arial', sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #f4f4f4;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

h1, h2, h3 {
    margin-bottom: 1rem;
}

p {
    margin-bottom: 1rem;
}
`
};

const projectTemplates = {
  'Python Project': {
    files: ['hello.py', 'README.md', 'requirements.txt'],
    folders: ['src', 'tests', 'docs']
  },
  'Node.js Project': {
    files: ['hello.js', 'package.json', 'README.md'],
    folders: ['src', 'tests', 'docs']
  },
  'Java Project': {
    files: ['Hello.java', 'README.md'],
    folders: ['src', 'bin', 'docs']
  },
  'Web Project': {
    files: ['index.html', 'style.css', 'README.md'],
    folders: ['css', 'js', 'images', 'docs']
  },
  'Empty Project': {
    files: ['README.md'],
    folders: []
  }
};

const WorkspaceManager = ({ containerId, onError, onRefresh }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const createFile = useCallback(async (fileName, content = '') => {
    try {
      await fileAPI.createFile(containerId, `/workspace/${fileName}`, 'file', content);
    } catch (error) {
      throw new Error(`Failed to create ${fileName}: ${handleAPIError(error)}`);
    }
  }, [containerId]);

  const createFolder = useCallback(async (folderName) => {
    try {
      await fileAPI.createFile(containerId, `/workspace/${folderName}`, 'directory');
    } catch (error) {
      throw new Error(`Failed to create folder ${folderName}: ${handleAPIError(error)}`);
    }
  }, [containerId]);

  const createProject = useCallback(async (templateName) => {
    if (!containerId) return;

    setIsCreating(true);
    try {
      const template = projectTemplates[templateName];
      
      // Create folders first
      for (const folder of template.folders) {
        await createFolder(folder);
      }
      
      // Create files with content
      for (const fileName of template.files) {
        const content = fileTemplates[fileName] || '';
        await createFile(fileName, content);
      }
      
      onRefresh?.();
      setShowTemplates(false);
    } catch (error) {
      onError?.(error.message);
    } finally {
      setIsCreating(false);
    }
  }, [containerId, createFile, createFolder, onRefresh, onError]);

  const createCustomFile = useCallback(async () => {
    const fileName = prompt('Enter file name (with extension):');
    if (!fileName) return;

    try {
      const content = fileTemplates[fileName] || '';
      await createFile(fileName, content);
      onRefresh?.();
    } catch (error) {
      onError?.(error.message);
    }
  }, [createFile, onRefresh, onError]);

  const createCustomFolder = useCallback(async () => {
    const folderName = prompt('Enter folder name:');
    if (!folderName) return;

    try {
      await createFolder(folderName);
      onRefresh?.();
    } catch (error) {
      onError?.(error.message);
    }
  }, [createFolder, onRefresh, onError]);

  const initializeWorkspace = useCallback(async () => {
    try {
      setIsCreating(true);
      
      // Create basic workspace structure
      await createFolder('projects');
      await createFolder('temp');
      
      // Create a welcome file
      await createFile('welcome.md', `# Welcome to Your Cloud IDE! 🎉

This is your personal workspace where you can:

## 📁 File Management
- Create, edit, and delete files and folders
- Use the file explorer with right-click context menus
- Organize your projects in the \`projects\` folder

## 💻 Code Editing
- Syntax highlighting for multiple languages
- Auto-save functionality
- Multiple file tabs
- Keyboard shortcuts (Ctrl+S to save, Ctrl+R to run)

## 🖥️ Terminal Integration
- Built-in terminal with command history
- Execute files directly from the editor
- Quick command buttons for common operations

## 🚀 Getting Started
1. Right-click in the file explorer to create new files/folders
2. Use the project templates to quickly set up new projects
3. Double-click files to open them in the editor
4. Use the Run button or Ctrl+R to execute code files

Happy coding! 🎯
`);
      
      onRefresh?.();
    } catch (error) {
      onError?.(error.message);
    } finally {
      setIsCreating(false);
    }
  }, [createFile, createFolder, onRefresh, onError]);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-600">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Workspace Manager
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={createCustomFile}
              disabled={isCreating}
              className="flex items-center justify-center px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 transition-colors text-sm"
            >
              📄 New File
            </button>

            <button
              onClick={createCustomFolder}
              disabled={isCreating}
              className="flex items-center justify-center px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 transition-colors text-sm"
            >
              📁 New Folder
            </button>
          </div>

        {/* Project Templates */}
        <div>
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="w-full flex items-center justify-between px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors text-sm"
          >
            <span>🎯 Project Templates</span>
            <span>{showTemplates ? '▼' : '▶'}</span>
          </button>
          
          {showTemplates && (
            <div className="mt-2 space-y-2 pl-4">
              {Object.keys(projectTemplates).map((templateName) => (
                <button
                  key={templateName}
                  onClick={() => createProject(templateName)}
                  disabled={isCreating}
                  className="w-full text-left px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:bg-gray-300 transition-colors text-sm"
                >
                  {templateName}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Initialize Workspace */}
        <button
          onClick={initializeWorkspace}
          disabled={isCreating}
          className="w-full px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:bg-gray-400 transition-colors text-sm"
        >
          {isCreating ? '⏳ Creating...' : '🏗️ Initialize Workspace'}
        </button>

        {/* File Templates Info */}
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded text-xs">
          <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Available Templates:
          </p>
          <div className="grid grid-cols-2 gap-1 text-gray-600 dark:text-gray-400">
            {Object.keys(fileTemplates).map((template) => (
              <span key={template}>• {template}</span>
            ))}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceManager;
