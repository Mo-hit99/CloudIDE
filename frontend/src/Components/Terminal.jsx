import { useState, useEffect, useRef, useCallback } from 'react';
import websocketService from '../services/websocket';

const Terminal = ({ containerId, darkMode, onError }) => {
  const [output, setOutput] = useState('');
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
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

  // Connect to terminal when container changes
  useEffect(() => {
    if (containerId && !isConnected && !isConnecting) {
      connectToTerminal();
    } else if (!containerId && isConnected) {
      disconnectFromTerminal();
    }
  }, [containerId]);

  // Setup WebSocket event handlers
  useEffect(() => {
    const handleTerminalOutput = (data) => {
      setOutput(prev => prev + data.data);
    };

    const handleTerminalConnected = (data) => {
      setIsConnected(true);
      setIsConnecting(false);
      setOutput(`Connected to container: ${data.containerId}\n`);
    };

    const handleTerminalError = (data) => {
      setIsConnecting(false);
      setIsConnected(false);
      onError?.(data.error);
      setOutput(prev => prev + `\nError: ${data.error}\n`);
    };

    const handleTerminalDisconnected = () => {
      setIsConnected(false);
      setIsConnecting(false);
      setOutput(prev => prev + '\nTerminal disconnected\n');
    };

    const handleConnectionStatus = (data) => {
      if (!data.connected && isConnected) {
        setIsConnected(false);
        setOutput(prev => prev + '\nConnection lost\n');
      }
    };

    // Register event handlers
    websocketService.on('terminal:output', handleTerminalOutput);
    websocketService.on('terminal:connected', handleTerminalConnected);
    websocketService.on('terminal:error', handleTerminalError);
    websocketService.on('terminal:disconnected', handleTerminalDisconnected);
    websocketService.on('connection:status', handleConnectionStatus);

    return () => {
      // Cleanup event handlers
      websocketService.off('terminal:output', handleTerminalOutput);
      websocketService.off('terminal:connected', handleTerminalConnected);
      websocketService.off('terminal:error', handleTerminalError);
      websocketService.off('terminal:disconnected', handleTerminalDisconnected);
      websocketService.off('connection:status', handleConnectionStatus);
    };
  }, [isConnected, onError]);

  const connectToTerminal = useCallback(async () => {
    if (!containerId || isConnecting) return;

    setIsConnecting(true);
    setOutput('Connecting to terminal...\n');

    try {
      // Connect to WebSocket if not already connected
      if (!websocketService.getConnectionStatus().connected) {
        websocketService.connect();
        // Wait a bit for connection to establish
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Connect to terminal
      websocketService.connectTerminal(containerId);
    } catch (error) {
      setIsConnecting(false);
      onError?.(error.message);
      setOutput(prev => prev + `Failed to connect: ${error.message}\n`);
    }
  }, [containerId, isConnecting, onError]);

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
      websocketService.sendTerminalInput(inputText);

      // Add to history if it's not empty and different from last command
      if (inputText.trim() && (history.length === 0 || history[history.length - 1] !== inputText.trim())) {
        setHistory(prev => [...prev, inputText.trim()]);
      }
      setHistoryIndex(-1);
    } catch (error) {
      onError?.(error.message);
    }
  }, [isConnected, history, onError]);

  const handleKeyDown = (e) => {
    if (!isConnected) return;

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        sendInput(input + '\n');
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
        // TODO: Implement tab completion
        break;

      case 'c':
        if (e.ctrlKey) {
          e.preventDefault();
          sendInput('\x03'); // Send Ctrl+C
          setInput('');
        }
        break;

      case 'd':
        if (e.ctrlKey) {
          e.preventDefault();
          sendInput('\x04'); // Send Ctrl+D
          setInput('');
        }
        break;

      default:
        // For other keys, let the default behavior handle it
        break;
    }
  };

  const clearTerminal = () => {
    setOutput('');
  };

  if (!containerId) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <p>Select a container to open terminal</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Terminal header */}
      <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Terminal
          </span>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : isConnecting ? 'bg-yellow-500' : 'bg-red-500'}`} />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Disconnected'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={clearTerminal}
            className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Clear
          </button>
          {!isConnected && !isConnecting && (
            <button
              onClick={connectToTerminal}
              className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Connect
            </button>
          )}
          {isConnected && (
            <button
              onClick={disconnectFromTerminal}
              className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
            >
              Disconnect
            </button>
          )}
        </div>
      </div>

      {/* Terminal content */}
      <div
        ref={terminalRef}
        onClick={handleTerminalClick}
        className={`flex-1 p-3 font-mono text-sm overflow-auto cursor-text ${
          darkMode
            ? 'bg-gray-900 text-green-400'
            : 'bg-white text-gray-800'
        }`}
        style={{
          fontFamily: 'JetBrains Mono, Consolas, Monaco, "Courier New", monospace',
          lineHeight: '1.4'
        }}
      >
        {/* Terminal output */}
        <pre className="whitespace-pre-wrap break-words">
          {output}
        </pre>

        {/* Input line */}
        {isConnected && (
          <div className="flex items-center">
            <span className={`mr-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              $
            </span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none"
              style={{
                fontFamily: 'inherit',
                fontSize: 'inherit',
                color: 'inherit'
              }}
              autoFocus
              spellCheck={false}
              autoComplete="off"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Terminal;