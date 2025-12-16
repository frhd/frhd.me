/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import "./xterm-theme.css";
import { getStoredTheme, getTheme, getDefaultTheme } from "./xterm-themes";
import XTermAchievementManager from "./XTermAchievement";
import { checkTimeAchievements } from "./achievements";
import {
  initSession,
  getTimeGreeting,
  getSeasonalMessage,
  getReturnGreeting,
} from "./time-utils";

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
  options: any;
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
  const [showCrt, setShowCrt] = useState(false);
  const [CrtComponent, setCrtComponent] = useState<any>(null);
  const [activeEffect, setActiveEffect] = useState<string | null>(null);
  const [activeEffectProps, setActiveEffectProps] = useState<Record<string, any>>({});
  const [EffectComponents, setEffectComponents] = useState<Record<string, any>>({});
  const pendingEffectRef = useRef<{ effect: string; props: Record<string, any> } | null>(null);
  const effectComponentsLoadedRef = useRef(false);

  useEffect(() => {
    // Load the Matrix component dynamically
    import("./XTermMatrixRain").then((module) => {
      setMatrixComponent(() => module.default);
    }).catch((error) => {
      console.error("Failed to load Matrix component:", error);
    });

    // Load the CRT component dynamically
    import("./XTermCRT").then((module) => {
      setCrtComponent(() => module.default);
    }).catch((error) => {
      console.error("Failed to load CRT component:", error);
    });

    // Load visual effect components dynamically
    Promise.all([
      import("./XTermPipes"),
      import("./XTermPlasma"),
      import("./XTermFireworks"),
      import("./XTermSnake"),
      import("./XTermTetris"),
      import("./XTermTyping"),
      import("./XTerm2048"),
      import("./XTermVim"),
    ]).then(([pipes, plasma, fireworks, snake, tetris, typing, game2048, vim]) => {
      setEffectComponents({
        pipes: pipes.default,
        plasma: plasma.default,
        fireworks: fireworks.default,
        snake: snake.default,
        tetris: tetris.default,
        typing: typing.default,
        "2048": game2048.default,
        vim: vim.default,
      });
      effectComponentsLoadedRef.current = true;
      // If there was a pending effect waiting for components to load, activate it now
      if (pendingEffectRef.current) {
        setActiveEffect(pendingEffectRef.current.effect);
        setActiveEffectProps(pendingEffectRef.current.props);
        pendingEffectRef.current = null;
      }
    }).catch((error) => {
      console.error("Failed to load effect components:", error);
    });

    // Check initial CRT state from localStorage
    const crtEnabled = localStorage.getItem("frhd-terminal-crt") === "true";
    setShowCrt(crtEnabled);

    // Check time-based achievements on load
    checkTimeAchievements();

    // Initialize session tracking
    initSession();
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

        // Get stored theme or default
        const storedThemeName = getStoredTheme();
        const storedTheme = getTheme(storedThemeName) || getDefaultTheme();

        // Create terminal instance
        const term = new Terminal({
          cursorBlink: true,
          fontSize: 14,
          fontFamily: 'Consolas, "Courier New", monospace',
          theme: storedTheme.colors,
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
              const timeGreeting = getTimeGreeting();
              const seasonalMessage = getSeasonalMessage();
              const returnGreeting = getReturnGreeting();

              extendedTerm.writeln("\x1b[1;32mWelcome to frhd.me terminal\x1b[0m");
              extendedTerm.writeln("\x1b[1;32m===========================\x1b[0m");
              extendedTerm.writeln("");
              extendedTerm.writeln(`\x1b[1;36m${timeGreeting}\x1b[0m`);
              if (returnGreeting) {
                extendedTerm.writeln(`\x1b[1;33m${returnGreeting}\x1b[0m`);
              }
              extendedTerm.writeln("");
              if (seasonalMessage) {
                extendedTerm.writeln(seasonalMessage);
                extendedTerm.writeln("");
              }
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

        // Listen for theme change events
        const handleThemeChange = (event: CustomEvent) => {
          const themeName = event.detail.theme;
          const newTheme = getTheme(themeName);
          if (newTheme && extendedTerm.options) {
            extendedTerm.options.theme = newTheme.colors;
          }
        };
        window.addEventListener("terminal-theme-change", handleThemeChange as EventListener);

        // Listen for CRT toggle events
        const handleCrtChange = (event: CustomEvent) => {
          setShowCrt(event.detail.enabled);
        };
        window.addEventListener("terminal-crt-change", handleCrtChange as EventListener);

        // Listen for visual effect events
        const handleVisualEffect = (event: CustomEvent) => {
          const { effect, ...props } = event.detail;
          // If components aren't loaded yet, store the effect to apply later
          if (!effectComponentsLoadedRef.current) {
            pendingEffectRef.current = { effect, props };
          } else {
            setActiveEffect(effect);
            setActiveEffectProps(props);
          }
        };
        window.addEventListener("visual-effect", handleVisualEffect as EventListener);

        // Cleanup function
        return () => {
          window.removeEventListener("resize", handleResize);
          window.removeEventListener("matrix-effect", handleMatrixEffect as EventListener);
          window.removeEventListener("terminal-theme-change", handleThemeChange as EventListener);
          window.removeEventListener("terminal-crt-change", handleCrtChange as EventListener);
          window.removeEventListener("visual-effect", handleVisualEffect as EventListener);
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

  // Handle keyboard events for effect exit
  // Note: vim handles its own exit via :q commands, so we skip it here
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip vim - it handles its own keyboard events
      if (activeEffect === "vim") return;

      if ((showMatrix || activeEffect) && (event.key.toLowerCase() === 'q' || event.key === 'Escape')) {
        setShowMatrix(false);
        setActiveEffect(null);
        setActiveEffectProps({});
        event.preventDefault(); // Prevent other handlers from processing this key
      }
    };

    if (showMatrix || activeEffect) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showMatrix, activeEffect]);

  // Get active effect component
  const ActiveEffectComponent = activeEffect ? EffectComponents[activeEffect] : null;

  return (
    <>
      <div className="flex min-h-screen w-full items-start justify-center bg-black p-4 pt-8">
        <div className="h-[85vh] w-full max-w-6xl rounded-lg bg-black/90 p-4 shadow-2xl shadow-green-500/10">
          {/* Terminal wrapper with padding */}
          <div className="h-full w-full p-4 relative">
            {/* Terminal container - XTerm.js attaches here */}
            <div ref={terminalRef} className="h-full w-full" />

            {/* CRT overlay effect */}
            {showCrt && CrtComponent && <CrtComponent />}
          </div>
        </div>
      </div>

      {showMatrix && MatrixComponent && (
        <MatrixComponent
          onComplete={() => setShowMatrix(false)}
        />
      )}

      {activeEffect && ActiveEffectComponent && (
        <ActiveEffectComponent
          onComplete={() => {
            setActiveEffect(null);
            setActiveEffectProps({});
          }}
          {...activeEffectProps}
        />
      )}

      {/* Achievement notifications */}
      <XTermAchievementManager />
    </>
  );
}