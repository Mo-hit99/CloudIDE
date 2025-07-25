import { useState, useEffect } from 'react'
import CodeEditor from './Components/CodeEditor'
import FolderTree from './Components/FolderTree'
import Terminal from './Components/Terminal'

function App() {
  const [code, setCode] = useState(
    '// Write your Java code here\n' +
    'public class Main {\n' +
    '    public static void main(String[] args) {\n' +
    '        System.out.println("Hello, World!");\n' +
    '    }\n' +
    '}'
  );
  const [darkMode, setDarkMode] = useState(() => {
    // Check for saved theme preference or use system preference
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      return savedTheme === 'dark' || 
        (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Sample tree data - you can modify this structure
  const treeData = [
    {
      id: 1,
      parent: 0,
      droppable: true,
      text: "src",
    },
    {
      id: 2,
      parent: 1,
      text: "Main.java",
      data: {
        fileType: "java",
        content: "public class Main { }"
      }
    },
    {
      id: 3,
      parent: 1,
      droppable: true,
      text: "utils",
    },
    {
      id: 4,
      parent: 3,
      text: "Helper.java",
      data: {
        fileType: "java",
        content: "public class Helper { }"
      }
    }
  ];

  const handleCodeChange = (newValue) => {
    setCode(newValue);
  };

  const handleFileSelect = (node) => {
    if (node.data?.content) {
      setCode(node.data.content);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden p-4 gap-4 bg-[#EEEEEE] dark:bg-gray-900 transition-colors duration-200">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold text-black dark:text-blue-400">Cloud IDE Editor</h1>
        <button 
          onClick={toggleDarkMode}
          className="p-2 rounded-full bg-[#DDDDDD] dark:bg-gray-700 text-black dark:text-gray-200 hover:bg-[#CCCCCC] dark:hover:bg-gray-600 transition-colors duration-200"
          aria-label="Toggle dark mode"
        >
          {darkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>
      <div className="flex flex-col flex-1 gap-4">
        {/* Main content area with folder tree and code editor */}
        <div className="flex flex-1 gap-4">
          <div className="w-72 bg-[#EEEEEE] dark:bg-gray-800 rounded-lg shadow-md p-3 transition-colors duration-200">
            <div className="text-xl font-semibold mb-4 text-black dark:text-blue-400 px-2">
              Project Files
            </div>
            <div className="h-[calc(100%-2rem)] overflow-auto">
              <FolderTree 
                data={treeData}
                onSelect={handleFileSelect}
              />
            </div>
          </div>
          <div className="flex-1 bg-[#EEEEEE] dark:bg-gray-800 rounded-lg shadow-md p-3 transition-colors duration-200">
            <div className="h-full">
              <CodeEditor 
                value={code}
                onChange={handleCodeChange}
                darkMode={darkMode}
              />
            </div>
          </div>
        </div>
        
        {/* Terminal section at the bottom */}
        <div className="h-64 bg-[#EEEEEE] dark:bg-gray-800 rounded-lg shadow-md p-3 transition-colors duration-200">
          <div className="text-xl font-semibold mb-2 text-black dark:text-blue-400 px-2">
            Terminal
          </div>
          <div className="h-[calc(100%-2rem)]">
            <Terminal darkMode={darkMode} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App
