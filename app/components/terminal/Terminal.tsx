'use client';

import React, { useState, useRef, useEffect } from 'react';
import TerminalInput from './TerminalInput';
import TerminalOutput from './TerminalOutput';
import MatrixRain from './MatrixRain';
import { executeCommand } from './commands';
import { TerminalHistoryItem } from './types';

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
      
      <div className="min-h-screen bg-black text-green-500 p-4 font-mono flex items-center justify-center">
        <div className="w-full max-w-2xl bg-gray-950 border border-green-500 rounded-lg shadow-2xl shadow-green-500/20">
          <div className="bg-green-500 text-black px-4 py-2 flex items-center justify-between rounded-t-lg">
            <span className="text-sm font-bold">terminal@frhd.me</span>
            <div className="flex gap-2">
              <div className="w-3 h-3 bg-black rounded-full"></div>
              <div className="w-3 h-3 bg-black rounded-full"></div>
              <div className="w-3 h-3 bg-black rounded-full"></div>
            </div>
          </div>
          <div 
            ref={terminalRef}
            className="h-[70vh] overflow-y-auto custom-scrollbar p-4"
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
      </div>
    </>
  );
}