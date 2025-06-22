/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import "./xterm-theme.css";

// Define the extended terminal interface
interface ExtendedTerminal {
  write: (data: string) => void;
  writeln: (data: string) => void;
  clear: () => void;
  scrollToTop: () => void;
  dispose: () => void;
  onData: (callback: (data: string) => void) => void;
  open: (parent: HTMLElement) => void;
  loadAddon: (addon: any) => void;
  prompt: () => void;
  handleEnter: () => void;
  handleBackspace: () => void;
  handleTab: () => void;
  handleArrowUp: () => void;
  handleArrowDown: () => void;
  handleHome: () => void;
  handleEnd: () => void;
  handleCtrlC: () => void;
  handleInput: (data: string) => void;
}

export default function XTerminal() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<ExtendedTerminal | null>(null);
  const [showMatrix, setShowMatrix] = useState(false);
  const [MatrixComponent, setMatrixComponent] = useState<any>(null);

  useEffect(() => {
    // Load the Matrix component dynamically
    import("./XTermMatrixRain").then((module) => {
      setMatrixComponent(() => module.default);
    }).catch((error) => {
      console.error("Failed to load Matrix component:", error);
    });
  }, []);

  // Use useLayoutEffect for DOM-dependent operations
  useLayoutEffect(() => {
    if (!terminalRef.current) {
      return;
    }
    
    if (xtermRef.current) {
      return;
    }

    let isInitialized = false;

    const initializeTerminal = async () => {
      if (isInitialized) {
        return;
      }
      isInitialized = true;

      try {
        // Load dynamic imports
        const xtermModule = await import("@xterm/xterm");
        const fitModule = await import("@xterm/addon-fit");
        const webLinksModule = await import("@xterm/addon-web-links");
        const extensionsModule = await import("./xterm-extensions");

        const { Terminal } = xtermModule;
        const { FitAddon } = fitModule;
        const { WebLinksAddon } = webLinksModule;
        const { extendTerminal } = extensionsModule;

        // Load xterm CSS dynamically
        if (typeof document !== 'undefined' && !document.querySelector('link[href*="xterm.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/@xterm/xterm@5.5.0/css/xterm.css';
          document.head.appendChild(link);
        }

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
        term.open(terminalRef.current!);

        // Load addons
        term.loadAddon(fitAddon);
        term.loadAddon(webLinksAddon);

        // Extend terminal with custom functionality
        extendTerminal(term);

        // Cast to extended terminal type
        const extendedTerm = term as unknown as ExtendedTerminal;
        
        // Store ref after extending
        xtermRef.current = extendedTerm;

        // Wait for terminal to be fully rendered before fitting
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            try {
              fitAddon.fit();
              
              // Initialize terminal after everything is set up
              extendedTerm.writeln("\x1b[1;32mWelcome to frhd.me terminal\x1b[0m");
              extendedTerm.writeln("\x1b[1;32m===========================\x1b[0m");
              extendedTerm.writeln("");
              extendedTerm.writeln("Type \x1b[1;33mhelp\x1b[0m to see available commands.");
              extendedTerm.writeln("");
              extendedTerm.prompt();
            } catch (error) {
              console.error("Terminal initialization error:", error);
            }
          });
        });

        // Handle input
        extendedTerm.onData((data) => {
          const code = data.charCodeAt(0);

          // Handle special keys
          if (code === 13) {
            // Enter
            extendedTerm.handleEnter();
          } else if (code === 127) {
            // Backspace
            extendedTerm.handleBackspace();
          } else if (code === 9) {
            // Tab
            extendedTerm.handleTab();
          } else if (data === "\x1b[A") {
            // Arrow up
            extendedTerm.handleArrowUp();
          } else if (data === "\x1b[B") {
            // Arrow down
            extendedTerm.handleArrowDown();
          } else if (data === "\x01") {
            // Ctrl+A
            extendedTerm.handleHome();
          } else if (data === "\x05") {
            // Ctrl+E
            extendedTerm.handleEnd();
          } else if (data === "\x03") {
            // Ctrl+C
            extendedTerm.handleCtrlC();
          } else if (code >= 32) {
            // Printable characters
            extendedTerm.handleInput(data);
          }
        });

        // Handle window resize
        const handleResize = () => {
          try {
            if (extendedTerm && fitAddon) {
              fitAddon.fit();
            }
          } catch (error) {
            console.error("Resize fit failed:", error);
          }
        };
        window.addEventListener("resize", handleResize);

        // Listen for matrix effect events
        const handleMatrixEffect = () => {
          setShowMatrix(true);
        };
        window.addEventListener("matrix-effect", handleMatrixEffect as EventListener);

        // Cleanup function
        return () => {
          window.removeEventListener("resize", handleResize);
          window.removeEventListener("matrix-effect", handleMatrixEffect as EventListener);
          extendedTerm.dispose();
        };
      } catch (error) {
        console.error("Failed to initialize terminal:", error);
      }
    };

    initializeTerminal();

    return () => {
      if (xtermRef.current) {
        xtermRef.current.dispose();
      }
    };
  }, []); // Empty dependency array since we want this to run once when the component is ready

  // Handle keyboard events for matrix exit
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (showMatrix && (event.key.toLowerCase() === 'q' || event.key === 'Escape')) {
        setShowMatrix(false);
        event.preventDefault(); // Prevent other handlers from processing this key
      }
    };

    if (showMatrix) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showMatrix]);

  return (
    <>
      <div className="flex min-h-screen w-full items-start justify-center bg-black p-4 pt-8">
        <div className="h-[85vh] w-full max-w-6xl rounded-lg bg-black/90 p-4 shadow-2xl shadow-green-500/10">
          {/* Terminal wrapper with padding */}
          <div className="h-full w-full p-4">
            {/* Terminal container - XTerm.js attaches here */}
            <div ref={terminalRef} className="h-full w-full" />
          </div>
        </div>
      </div>
      
      {showMatrix && MatrixComponent && (
        <MatrixComponent
          onComplete={() => setShowMatrix(false)}
        />
      )}
    </>
  );
}