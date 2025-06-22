"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import "@xterm/xterm/css/xterm.css";
import { commands } from "./xterm-commands";
import { extendTerminal } from "./xterm-extensions";
import XTermMatrixRain from "./XTermMatrixRain";
import "./xterm-theme.css";

export default function XTerminal() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const [showMatrix, setShowMatrix] = useState(false);
  const [matrixDuration, setMatrixDuration] = useState(5000);

  useEffect(() => {
    if (!terminalRef.current || xtermRef.current) return;

    // Create terminal instance
    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Consolas, "Courier New", monospace',
      theme: {
        background: "#0a0a0a",
        foreground: "#00ff00",
        cursor: "#00ff00",
        cursorAccent: "#0a0a0a",
        selectionBackground: "#00ff0044",
        black: "#000000",
        red: "#ff0000",
        green: "#00ff00",
        yellow: "#ffff00",
        blue: "#0080ff",
        magenta: "#ff00ff",
        cyan: "#00ffff",
        white: "#ffffff",
        brightBlack: "#555555",
        brightRed: "#ff5555",
        brightGreen: "#55ff55",
        brightYellow: "#ffff55",
        brightBlue: "#5555ff",
        brightMagenta: "#ff55ff",
        brightCyan: "#55ffff",
        brightWhite: "#ffffff",
      },
    });

    // Create addons
    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    // Open terminal in DOM
    term.open(terminalRef.current);

    // Load addons
    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);

    // Extend terminal with custom functionality
    extendTerminal(term);

    // Fit terminal to container
    fitAddon.fit();

    // Initialize terminal
    term.writeln("\x1b[1;32mWelcome to frhd.me terminal\x1b[0m");
    term.writeln("\x1b[1;32m===========================\x1b[0m");
    term.writeln("");
    term.writeln("Type \x1b[1;33mhelp\x1b[0m to see available commands.");
    term.writeln("");
    term.prompt();

    // Handle input
    term.onData((data) => {
      const code = data.charCodeAt(0);

      // Handle special keys
      if (code === 13) {
        // Enter
        term.handleEnter();
      } else if (code === 127) {
        // Backspace
        term.handleBackspace();
      } else if (code === 9) {
        // Tab
        term.handleTab();
      } else if (data === "\x1b[A") {
        // Arrow up
        term.handleArrowUp();
      } else if (data === "\x1b[B") {
        // Arrow down
        term.handleArrowDown();
      } else if (data === "\x01") {
        // Ctrl+A
        term.handleHome();
      } else if (data === "\x05") {
        // Ctrl+E
        term.handleEnd();
      } else if (data === "\x03") {
        // Ctrl+C
        term.handleCtrlC();
      } else if (code >= 32) {
        // Printable characters
        term.handleInput(data);
      }
    });

    // Handle window resize
    const handleResize = () => {
      fitAddon.fit();
    };
    window.addEventListener("resize", handleResize);

    // Listen for matrix effect events
    const handleMatrixEffect = (event: CustomEvent) => {
      setMatrixDuration(event.detail.duration || 5000);
      setShowMatrix(true);
    };
    window.addEventListener("matrix-effect", handleMatrixEffect as EventListener);

    xtermRef.current = term;

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("matrix-effect", handleMatrixEffect as EventListener);
      term.dispose();
    };
  }, []);

  return (
    <>
      <div className="flex h-screen w-full items-center justify-center bg-black p-4">
        <div className="h-full w-full max-w-6xl rounded-lg border border-green-500/20 bg-black/90 p-4 shadow-2xl shadow-green-500/10">
          <div ref={terminalRef} className="h-full w-full" />
        </div>
      </div>
      {showMatrix && (
        <XTermMatrixRain
          duration={matrixDuration}
          onComplete={() => setShowMatrix(false)}
        />
      )}
    </>
  );
}