'use client';

import React, { useState, useRef, useEffect } from 'react';
import TerminalInput from './TerminalInput';
import TerminalOutput from './TerminalOutput';
import MatrixRain from './MatrixRain';
import { executeCommand } from './commands';
import { TerminalHistoryItem, CommandOutput } from './types';

export default function Terminal() {
  const [history, setHistory] = useState<TerminalHistoryItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showMatrix, setShowMatrix] = useState(false);
  const [matrixDuration, setMatrixDuration] = useState(10000);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const welcomeMessage: TerminalHistoryItem = {
      input: '',
      output: {
        content: `
Welcome to frhd.me Terminal v1.0.0

 ███████╗██████╗ ██╗  ██╗██████╗    ███╗   ███╗███████╗
 ██╔════╝██╔══██╗██║  ██║██╔══██╗   ████╗ ████║██╔════╝
 █████╗  ██████╔╝███████║██║  ██║   ██╔████╔██║█████╗  
 ██╔══╝  ██╔══██╗██╔══██║██║  ██║   ██║╚██╔╝██║██╔══╝  
 ██║     ██║  ██║██║  ██║██████╔╝██╗██║ ╚═╝ ██║███████╗
 ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚═╝╚═╝     ╚═╝╚══════╝

Type 'help' for available commands.
`,
        type: 'text'
      },
      timestamp: new Date()
    };
    setHistory([welcomeMessage]);
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = async (input: string) => {
    setIsProcessing(true);
    
    const output = executeCommand(input);
    
    if (output.content === 'CLEAR_TERMINAL') {
      setHistory([]);
      setIsProcessing(false);
      return;
    }

    if (output.content === 'MATRIX_RAIN' || output.content === 'MAINFRAME_ACCESS') {
      setMatrixDuration(output.duration || 10000);
      setShowMatrix(true);
    }

    const newHistoryItem: TerminalHistoryItem = {
      input,
      output,
      timestamp: new Date()
    };

    setHistory(prev => [...prev, newHistoryItem]);
    
    setTimeout(() => {
      setIsProcessing(false);
    }, 100);
  };

  return (
    <>
      {showMatrix && (
        <MatrixRain 
          duration={matrixDuration} 
          onComplete={() => setShowMatrix(false)} 
        />
      )}
      
      <div className="min-h-screen bg-black text-green-500 p-4 font-mono">
        <div 
          ref={terminalRef}
          className="max-w-4xl mx-auto h-[90vh] overflow-y-auto custom-scrollbar"
        >
          {history.map((item, index) => (
            <div key={index} className="mb-4">
              {item.input && (
                <div className="flex items-center mb-1">
                  <span className="text-green-500 mr-2">guest@frhd.me:~$</span>
                  <span className="text-green-500">{item.input}</span>
                </div>
              )}
              <TerminalOutput output={item.output} />
            </div>
          ))}
          
          <div className="mb-4">
            <TerminalInput 
              onCommand={handleCommand} 
              isProcessing={isProcessing} 
            />
          </div>
        </div>
      </div>
    </>
  );
}