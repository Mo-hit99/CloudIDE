import { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import websocketService from '../services/websocket';
import { fileAPI, handleAPIError } from '../services/api';

const EnhancedTerminal = forwardRef(({ containerId, workspaceId, darkMode, onError, currentWorkingDir = '/workspace' }, ref) => {
  const [output, setOutput] = useState('');
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [workingDir, setWorkingDir] = useState(currentWorkingDir);
  const [isExecuting, setIsExecuting] = useState(false);
  const terminalRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when output changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  // Focus input when terminal is clicked
  const handleTerminalClick = () => {
    if (inputRef.current && isConnected) {
      inputRef.current.focus();
    }
  };

  // WebSocket event handlers
  useEffect(() => {
    const handleTerminalOutput = (data) => {
      // Handle both string and object formats
      const outputText = typeof data === 'string' ? data : (data.data || data);
      setOutput(prev => prev + outputText);
      setIsExecuting(false);
    };

    const handleTerminalConnected = () => {
      setIsConnected(true);
      setIsConnecting(false);
      setOutput(prev => prev + `Connected to container terminal\n${workingDir}$ `);
    };

    const handleTerminalDisconnected = () => {
      setIsConnected(false);
      setIsConnecting(false);
      setOutput(prev => prev + '\nTerminal disconnected\n');
    };

    const handleTerminalError = (error) => {
      setIsConnecting(false);
      setIsExecuting(false);

      // Extract error message from error object
      const errorMessage = typeof error === 'string'
        ? error
        : error?.error || error?.message || JSON.stringify(error);

      console.error('Terminal error:', error);
      onError?.(errorMessage);
      setOutput(prev => prev + `\nTerminal Error: ${errorMessage}\n`);
    };

    // Register event listeners
    websocketService.on('terminal:output', handleTerminalOutput);
    websocketService.on('terminal:connected', handleTerminalConnected);
    websocketService.on('terminal:disconnected', handleTerminalDisconnected);
    websocketService.on('terminal:error', handleTerminalError);

    return () => {
      websocketService.off('terminal:output', handleTerminalOutput);
      websocketService.off('terminal:connected', handleTerminalConnected);
      websocketService.off('terminal:disconnected', handleTerminalDisconnected);
      websocketService.off('terminal:error', handleTerminalError);
    };
  }, [onError, workingDir]);

  const connectToTerminal = useCallback(async () => {
    if (!containerId || isConnecting) return;

    setIsConnecting(true);
    setOutput('Connecting to terminal...\n');

    try {
      // Connect to WebSocket if not already connected
      const connectionStatus = websocketService.getConnectionStatus();
      if (!connectionStatus.connected) {
        console.log('WebSocket not connected, connecting...');
        websocketService.connect();
        // Wait for connection to establish
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('WebSocket connection timeout'));
          }, 10000);

          const checkConnection = () => {
            if (websocketService.getConnectionStatus().connected) {
              clearTimeout(timeout);
              resolve();
            } else {
              setTimeout(checkConnection, 100);
            }
          };
          checkConnection();
        });
      }

      console.log('Connecting to terminal for container:', containerId);
      // Connect to terminal
      websocketService.connectTerminal(containerId, workingDir, workspaceId);
    } catch (error) {
      console.error('Failed to connect to terminal:', error);
      setIsConnecting(false);
      onError?.(error.message);
      setOutput(prev => prev + `Failed to connect: ${error.message}\n`);
    }
  }, [containerId, isConnecting, onError, workingDir]);

  const disconnectFromTerminal = useCallback(() => {
    if (isConnected) {
      websocketService.disconnectTerminal();
      setIsConnected(false);
      setOutput(prev => prev + 'Disconnected from terminal\n');
    }
  }, [isConnected]);

  const sendInput = useCallback((inputText) => {
    if (!isConnected || !inputText.trim()) return;

    try {
      // Add newline character to execute the command
      websocketService.sendTerminalInput(inputText + '\n');

      // Don't add to output here - let the terminal output handler do it
      // setOutput(prev => prev + inputText + '\n');

      // Add to history if it's not empty and different from last command
      if (inputText.trim() && (history.length === 0 || history[history.length - 1] !== inputText.trim())) {
        setHistory(prev => [...prev, inputText.trim()]);
      }
      setHistoryIndex(-1);
    } catch (error) {
      onError?.(error.message);
    }
  }, [isConnected, history, onError]);

  const executeFile = useCallback(async (file) => {
    if (!file || !file.data?.executable || !isConnected) return;

    setIsExecuting(true);
    
    try {
      // Use the backend file execution endpoint
      const response = await fileAPI.executeFile(containerId, file.data.path, workingDir);
      
      // Display the execution command and output in terminal
      setOutput(prev => 
        prev + 
        `\n$ ${response.data.command}\n` +
        response.data.output + 
        `\n${workingDir}$ `
      );
    } catch (error) {
      const errorMessage = handleAPIError(error);
      setOutput(prev => 
        prev + 
        `\nError executing ${file.text}: ${errorMessage}\n${workingDir}$ `
      );
      onError?.(errorMessage);
    } finally {
      setIsExecuting(false);
    }
  }, [containerId, workingDir, isConnected, onError]);

  // Expose executeFile method to parent components via ref
  useImperativeHandle(ref, () => ({
    executeFile
  }), [executeFile]);

  const runCommand = useCallback((command) => {
    if (!isConnected) return;
    
    setIsExecuting(true);
    sendInput(command);
  }, [isConnected, sendInput]);

  const handleKeyDown = (e) => {
    if (!isConnected) return;

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        sendInput(input);
        setInput('');
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        if (history.length > 0) {
          const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
          setHistoryIndex(newIndex);
          setInput(history[newIndex]);
        }
        break;
      
      case 'ArrowDown':
        e.preventDefault();
        if (historyIndex !== -1) {
          const newIndex = historyIndex + 1;
          if (newIndex >= history.length) {
            setHistoryIndex(-1);
            setInput('');
          } else {
            setHistoryIndex(newIndex);
            setInput(history[newIndex]);
          }
        }
        break;
      
      case 'Tab':
        e.preventDefault();
        // Basic tab completion could be added here
        break;
      
      case 'c':
        if (e.ctrlKey) {
          e.preventDefault();
          // Send Ctrl+C directly without newline
          websocketService.sendTerminalInput('\x03');
          setInput('');
        }
        break;
    }
  };

  const clearTerminal = () => {
    setOutput('');
    if (isConnected) {
      setOutput(`${workingDir}$ `);
    }
  };

  const changeDirectory = (newDir) => {
    if (isConnected) {
      runCommand(`cd ${newDir}`);
      setWorkingDir(newDir);
    }
  };

  // Quick command buttons
  const quickCommands = [
    { label: 'ls', command: 'ls -la', icon: '📁' },
    { label: 'pwd', command: 'pwd', icon: '📍' },
    { label: 'clear', command: 'clear', icon: '🧹' },
    { label: 'ps', command: 'ps aux', icon: '⚙️' },
  ];

  return (
    <div className="h-full flex flex-col bg-gray-900 text-green-400">
      {/* Terminal Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-600">
        <div className="flex items-center space-x-4 min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-white">Terminal</h3>
          <span className="text-xs text-gray-400 truncate">{workingDir}</span>
          {isExecuting && (
            <span className="text-xs text-yellow-400 animate-pulse flex-shrink-0">Executing...</span>
          )}
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0 overflow-x-auto">
          {/* Quick Commands */}
          {isConnected && quickCommands.map((cmd) => (
            <button
              key={cmd.command}
              onClick={() => runCommand(cmd.command)}
              className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors whitespace-nowrap"
              title={cmd.command}
            >
              {cmd.icon} {cmd.label}
            </button>
          ))}

          <button
            onClick={clearTerminal}
            className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
            title="Clear terminal"
          >
            🧹
          </button>

          {isConnected ? (
            <button
              onClick={disconnectFromTerminal}
              className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors whitespace-nowrap"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={connectToTerminal}
              disabled={isConnecting}
              className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:bg-gray-600 transition-colors whitespace-nowrap"
            >
              {isConnecting ? 'Connecting...' : 'Connect'}
            </button>
          )}
        </div>
      </div>

      {/* Terminal Content */}
      <div
        ref={terminalRef}
        onClick={handleTerminalClick}
        className="flex-1 p-3 font-mono text-sm overflow-y-auto overflow-x-auto cursor-text"
        style={{
          fontFamily: 'JetBrains Mono, Consolas, Monaco, "Courier New", monospace',
          lineHeight: '1.4',
          minHeight: '0',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(75, 85, 99, 0.8) transparent'
        }}
      >
        {/* Terminal output */}
        <pre className="whitespace-pre-wrap break-words min-h-0">
          {output}
        </pre>

        {/* Input line */}
        {isConnected && (
          <div className="flex items-center sticky bottom-0 bg-gray-900 pt-1">
            <span className="text-green-400 mr-1 flex-shrink-0">{workingDir}$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-green-400 min-w-0"
              placeholder={isExecuting ? "Executing..." : "Type command..."}
              disabled={isExecuting}
              autoFocus
            />
          </div>
        )}
      </div>

      {/* Connection Status */}
      {!isConnected && !isConnecting && (
        <div className="p-4 text-center text-gray-400">
          <p className="mb-2">Terminal not connected</p>
          <button
            onClick={connectToTerminal}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Connect to Terminal
          </button>
        </div>
      )}
    </div>
  );
});

EnhancedTerminal.displayName = 'EnhancedTerminal';

export default EnhancedTerminal;
