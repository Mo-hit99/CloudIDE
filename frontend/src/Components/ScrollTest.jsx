import React from 'react';

const ScrollTest = () => {
  const items = Array.from({ length: 100 }, (_, i) => i + 1);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <header className="bg-blue-600 text-white p-4 flex-shrink-0">
        <h1 className="text-xl font-bold">Scroll Test Page</h1>
        <p className="text-sm">Testing scrolling functionality</p>
      </header>

      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Left Panel - Vertical Scroll Test */}
        <div className="w-1/3 bg-white rounded-lg shadow-md flex flex-col">
          <div className="p-3 border-b bg-gray-50 flex-shrink-0">
            <h2 className="font-semibold text-gray-800">Vertical Scroll Test</h2>
          </div>
          <div 
            className="flex-1 overflow-y-auto p-3"
            style={{
              minHeight: 0,
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(156, 163, 175, 0.6) transparent'
            }}
          >
            {items.map(item => (
              <div 
                key={item} 
                className="p-3 mb-2 bg-blue-50 rounded border hover:bg-blue-100 transition-colors"
              >
                <div className="font-medium">Item {item}</div>
                <div className="text-sm text-gray-600">
                  This is item number {item}. It has some content to make scrolling necessary.
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Middle Panel - Code Editor Simulation */}
        <div className="flex-1 bg-white rounded-lg shadow-md flex flex-col">
          <div className="flex-shrink-0 border-b">
            {/* Tabs */}
            <div 
              className="flex overflow-x-auto bg-gray-50"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(156, 163, 175, 0.4) transparent'
              }}
            >
              {Array.from({ length: 15 }, (_, i) => (
                <div 
                  key={i}
                  className="flex-shrink-0 px-4 py-2 border-r border-gray-200 bg-white text-sm cursor-pointer hover:bg-gray-50"
                >
                  file{i + 1}.js
                </div>
              ))}
            </div>
            
            {/* Toolbar */}
            <div className="p-2 bg-gray-50 border-b">
              <div className="text-sm text-gray-600">src/components/test.js</div>
            </div>
          </div>
          
          {/* Code Content */}
          <div 
            className="flex-1 overflow-auto p-4 font-mono text-sm bg-gray-900 text-green-400"
            style={{
              minHeight: 0,
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(75, 85, 99, 0.8) transparent'
            }}
          >
            {Array.from({ length: 50 }, (_, i) => (
              <div key={i} className="mb-1">
                <span className="text-gray-500 mr-4">{String(i + 1).padStart(2, ' ')}</span>
                <span>
                  {i === 0 && "function testScrolling() {"}
                  {i === 1 && "  console.log('Testing scroll functionality');"}
                  {i === 2 && "  const items = [];"}
                  {i > 2 && i < 47 && `  // Line ${i + 1} - More code content here`}
                  {i === 47 && "  return items;"}
                  {i === 48 && "}"}
                  {i === 49 && ""}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Terminal Simulation */}
        <div className="w-1/3 bg-gray-900 text-green-400 rounded-lg shadow-md flex flex-col">
          <div className="flex-shrink-0 p-3 border-b border-gray-700 bg-gray-800">
            <h2 className="font-semibold text-white">Terminal</h2>
          </div>
          <div 
            className="flex-1 overflow-y-auto p-3 font-mono text-sm"
            style={{
              minHeight: 0,
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(75, 85, 99, 0.8) transparent'
            }}
          >
            <div className="text-yellow-400">$ npm start</div>
            <div>Starting development server...</div>
            <div className="text-blue-400">✓ Server started on port 3000</div>
            <div className="text-gray-400">Watching for file changes...</div>
            <div className="mt-2">$ ls -la</div>
            {Array.from({ length: 30 }, (_, i) => (
              <div key={i} className="text-gray-300">
                {i % 3 === 0 && "drwxr-xr-x  2 user user  4096 Dec 15 10:30 "}
                {i % 3 === 1 && "-rw-r--r--  1 user user  1234 Dec 15 10:30 "}
                {i % 3 === 2 && "-rwxr-xr-x  1 user user  5678 Dec 15 10:30 "}
                file{i + 1}.{i % 3 === 0 ? 'dir' : i % 2 === 0 ? 'js' : 'txt'}
              </div>
            ))}
            <div className="mt-2 text-yellow-400">$ git status</div>
            <div>On branch main</div>
            <div>Your branch is up to date with 'origin/main'.</div>
            <div className="text-green-400">nothing to commit, working tree clean</div>
            <div className="mt-2">$ _</div>
          </div>
        </div>
      </div>

      <footer className="bg-gray-800 text-white p-2 text-center text-sm flex-shrink-0">
        Scroll Test - Check if all panels scroll properly
      </footer>
    </div>
  );
};

export default ScrollTest;
