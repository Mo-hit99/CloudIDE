import React, { useState } from 'react';
import { ReactTerminal } from 'react-terminal';

const Terminal = ({ darkMode }) => {
  const [terminalLineData, setTerminalLineData] = useState([]);

  // Terminal commands implementation
  const commands = {
    help: (
      <span>
        <strong>clear</strong> - Clear the terminal<br />
        <strong>echo [text]</strong> - Print text to the terminal<br />
        <strong>help</strong> - Show this help message
      </span>
    ),
    clear: () => {
      setTerminalLineData([]);
      return '';
    },
    echo: (text) => text,
  };

  return (
    <div className="h-full w-full">
      <ReactTerminal
        commands={commands}
        welcomeMessage="Cloud"
        themes={{
          'dark-theme': {
            themeBGColor: '#1e293b', // dark:bg-gray-800
            themeToolbarColor: '#334155', // dark:bg-gray-700
            themeColor: '#e2e8f0', // dark:text-gray-200
            themePromptColor: '#60a5fa', // dark:text-blue-400
          },
          'light-theme': {
            themeBGColor: '#EEEEEE', // light gray background
            themeToolbarColor: '#DDDDDD', // slightly darker gray for toolbar
            themeColor: '#000000', // black text
            themePromptColor: '#000000', // black prompt
          },
        }}
        theme={darkMode ? 'dark-theme' : 'light-theme'}
      />
    </div>
  );
};

export default Terminal;