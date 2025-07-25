import React, { useEffect } from "react";
import AceEditor from "react-ace";
import ace from "ace-builds";
import "ace-builds/src-noconflict/ace";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/snippets/java";
import "ace-builds/src-noconflict/theme-tomorrow_night";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/ext-searchbox";

// Set Ace editor base path
ace.config.set(
  "basePath", 
  "https://cdn.jsdelivr.net/npm/ace-builds@1.31.1/src-noconflict/"
);

const CodeEditor = ({ value, onChange, darkMode = true }) => {
  const handleChange = (newValue) => {
    console.log("change", newValue);
    onChange?.(newValue);
  };

  // Use the appropriate theme based on dark mode setting
  const theme = darkMode ? "tomorrow_night" : "github";

  return (
    <AceEditor
      mode="java"
      theme={theme}
      onChange={handleChange}
      value={value}
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
        borderRadius: '8px',
        padding: '8px 0',
        backgroundColor: 'transparent'
      }}
    />
  );
};

export default CodeEditor;