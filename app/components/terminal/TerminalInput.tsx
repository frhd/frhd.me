'use client';

import React, { useState, useRef, useEffect } from 'react';

interface TerminalInputProps {
  onCommand: (command: string) => void;
  isProcessing: boolean;
}

export default function TerminalInput({ onCommand, isProcessing }: TerminalInputProps) {
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    
    // Re-focus on click anywhere in the document
    const handleClick = () => {
      inputRef.current?.focus();
    };
    
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      onCommand(input);
      setCommandHistory(prev => [...prev, input]);
      setHistoryIndex(-1);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center">
      <span className="text-green-500 mr-2">guest@frhd.me:~$</span>
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isProcessing}
        className="flex-1 bg-transparent outline-none text-green-500 font-mono"
        autoComplete="off"
        spellCheck={false}
      />
      <span className="terminal-cursor text-green-500">_</span>
    </form>
  );
}