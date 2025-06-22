/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
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
  const [matrixDuration, setMatrixDuration] = useState(5000);
  const [isLoading, setIsLoading] = useState(true);
  const [MatrixComponent, setMatrixComponent] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebug = (message: string) => {
    console.log("🐛 XTerminal:", message);
    setDebugInfo(prev => [...prev, message]);
  };

  useEffect(() => {
    addDebug("Component mounted, starting initialization...");
    
    // Load the Matrix component dynamically
    import("./XTermMatrixRain").then((module) => {
      addDebug("Matrix component loaded successfully");
      setMatrixComponent(() => module.default);
    }).catch((error) => {
      addDebug(`Matrix component failed: ${error.message}`);
    });
  }, []);

  useEffect(() => {
    if (!terminalRef.current) {
      addDebug("terminalRef.current is null, waiting...");
      return;
    }
    
    if (xtermRef.current) {
      addDebug("xtermRef.current already exists, skipping...");
      return;
    }

    let isInitialized = false;

    const initializeTerminal = async () => {
      if (isInitialized) {
        addDebug("Already initialized, returning early");
        return;
      }
      isInitialized = true;

      addDebug("🚀 Starting terminal initialization...");

      try {
        addDebug("📦 Loading dynamic imports...");
        
        // Test basic import first
        const xtermModule = await import("@xterm/xterm");
        addDebug("✅ @xterm/xterm loaded");

        const fitModule = await import("@xterm/addon-fit");
        addDebug("✅ @xterm/addon-fit loaded");

        const webLinksModule = await import("@xterm/addon-web-links");
        addDebug("✅ @xterm/addon-web-links loaded");

        const extensionsModule = await import("./xterm-extensions");
        addDebug("✅ xterm-extensions loaded");

        const { Terminal } = xtermModule;
        const { FitAddon } = fitModule;
        const { WebLinksAddon } = webLinksModule;
        const { extendTerminal } = extensionsModule;

        addDebug("📄 Loading xterm CSS...");
        // Load xterm CSS dynamically
        if (typeof document !== 'undefined' && !document.querySelector('link[href*="xterm.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/@xterm/xterm@5.5.0/css/xterm.css';
          document.head.appendChild(link);
          addDebug("✅ XTerm CSS added to head");
        } else {
          addDebug("✅ XTerm CSS already present");
        }

        addDebug("🖥️ Creating terminal instance...");
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
        addDebug("✅ Terminal instance created");

        addDebug("🔌 Creating addons...");
        // Create addons
        const fitAddon = new FitAddon();
        const webLinksAddon = new WebLinksAddon();
        addDebug("✅ Addons created");

        addDebug("🏠 Opening terminal in DOM...");
        // Open terminal in DOM
        term.open(terminalRef.current!);
        addDebug("✅ Terminal opened in DOM");

        addDebug("🔧 Loading addons...");
        // Load addons
        term.loadAddon(fitAddon);
        term.loadAddon(webLinksAddon);
        addDebug("✅ Addons loaded");

        addDebug("⚡ Extending terminal...");
        // Extend terminal with custom functionality
        extendTerminal(term);
        addDebug("✅ Terminal extended");

        // Cast to extended terminal type
        const extendedTerm = term as unknown as ExtendedTerminal;
        
        // Store ref after extending
        xtermRef.current = extendedTerm;

        addDebug("🎨 Fitting and initializing terminal...");
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
              
              addDebug("🎉 Terminal initialization complete!");
              setIsLoading(false);
            } catch (error) {
              addDebug(`❌ Terminal initialization error: ${error}`);
              setIsLoading(false);
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
            addDebug(`Resize fit failed: ${error}`);
          }
        };
        window.addEventListener("resize", handleResize);

        // Listen for matrix effect events
        const handleMatrixEffect = (event: CustomEvent) => {
          setMatrixDuration(event.detail.duration || 5000);
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
        addDebug(`❌ Failed to initialize terminal: ${error}`);
        console.error("❌ Failed to initialize terminal:", error);
        setIsLoading(false);
      }
    };

    initializeTerminal();

    return () => {
      if (xtermRef.current) {
        xtermRef.current.dispose();
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black p-4">
        <div className="h-full w-full max-w-6xl rounded-lg border border-green-500/20 bg-black/90 p-4 shadow-2xl shadow-green-500/10">
          <div className="flex h-full w-full items-center justify-center flex-col space-y-4">
            <div className="text-green-500 font-mono animate-pulse">
              Loading terminal...
            </div>
            <div className="text-xs text-green-300 font-mono max-w-md">
              Debug info:
              {debugInfo.slice(-5).map((info, i) => (
                <div key={i} className="text-xs opacity-70">
                  {info}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-screen w-full items-center justify-center bg-black p-4">
        <div className="h-full w-full max-w-6xl rounded-lg border border-green-500/20 bg-black/90 p-4 shadow-2xl shadow-green-500/10">
          <div ref={terminalRef} className="h-full w-full" />
        </div>
      </div>
      {showMatrix && MatrixComponent && (
        <MatrixComponent
          duration={matrixDuration}
          onComplete={() => setShowMatrix(false)}
        />
      )}
    </>
  );
}