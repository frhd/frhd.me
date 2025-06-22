'use client';

import React, { useEffect, useState } from 'react';
import { CommandOutput } from './types';

interface TerminalOutputProps {
  output: CommandOutput;
}

export default function TerminalOutput({ output }: TerminalOutputProps) {
  const [displayText, setDisplayText] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);

  useEffect(() => {
    if (output.type === 'decrypt' && typeof output.content === 'string') {
      setIsDecrypting(true);
      const fullText = output.content;
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
      let currentText = fullText.split('').map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
      setDisplayText(currentText);

      let revealed = 0;
      const interval = setInterval(() => {
        if (revealed < fullText.length) {
          currentText = fullText.substring(0, revealed) + 
                       currentText.substring(revealed).split('').map(() => 
                         chars[Math.floor(Math.random() * chars.length)]
                       ).join('');
          setDisplayText(currentText);
          revealed++;
        } else {
          setIsDecrypting(false);
          clearInterval(interval);
        }
      }, 50);

      return () => clearInterval(interval);
    } else if (typeof output.content === 'string') {
      setDisplayText(output.content);
    }
  }, [output]);

  if (output.type === 'glitch') {
    return (
      <div className="relative">
        <pre className="font-mono text-base whitespace-pre-wrap animate-pulse glitch" style={{ color: '#22c55e', fontFamily: 'inherit' }}>
          {displayText}
        </pre>
      </div>
    );
  }

  if (output.type === 'error') {
    return (
      <pre className="font-mono text-base whitespace-pre-wrap" style={{ color: '#ef4444', fontFamily: 'inherit' }}>
        {displayText}
      </pre>
    );
  }

  if (output.type === 'decrypt') {
    return (
      <pre className="font-mono text-base whitespace-pre-wrap" style={{ color: isDecrypting ? '#86efac' : '#22c55e', fontFamily: 'inherit' }}>
        {displayText}
      </pre>
    );
  }

  return (
    <pre className="font-mono text-base whitespace-pre-wrap" style={{ color: '#22c55e', fontFamily: 'inherit' }}>
      {displayText}
    </pre>
  );
}