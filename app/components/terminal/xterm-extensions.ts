/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  initAudio,
  markUserInteraction,
  playKeypressSound,
  playSound,
  isSoundEnabled,
} from "./sound-manager";
import {
  colorize,
  renderLogo,
  renderPrompt,
  defaultPromptConfig,
  completeCommand,
  escapeSequences,
} from "./terminal";

// Re-export utilities for backwards compatibility
export { colorize, ansiColors } from "./terminal";

interface CustomTerminal {
  write: (data: string) => void;
  writeln: (data: string) => void;
  clear: () => void;
  scrollToTop: () => void;
  dispose: () => void;
  onData: (callback: (data: string) => void) => void;
  open: (parent: HTMLElement) => void;
  loadAddon: (addon: any) => void;
  currentLine: string;
  user: string;
  host: string;
  cwd: string;
  history: string[];
  historyIndex: number;
  disconnected: boolean;
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
  clearCurrentLine: () => void;
  setCurrentLine: (line: string) => void;
  colorize: (text: string, color: string) => string;
  disconnect: () => void;
}

export function extendTerminal(term: any): void {
  const ext = term as CustomTerminal;

  // Initialize properties
  ext.currentLine = "";
  ext.user = defaultPromptConfig.user;
  ext.host = defaultPromptConfig.host;
  ext.cwd = defaultPromptConfig.cwd;
  ext.history = [];
  ext.historyIndex = -1;
  ext.disconnected = false;

  // Helper function to colorize text (bound to terminal for backwards compatibility)
  ext.colorize = colorize;

  // Display logo on initialization
  renderLogo().forEach((line) => {
    ext.writeln(line);
  });

  // Display prompt
  ext.prompt = () => {
    if (ext.disconnected) {
      return; // Don't show prompt when disconnected
    }
    const prompt = renderPrompt({
      user: ext.user,
      host: ext.host,
      cwd: ext.cwd,
    });
    ext.write(prompt);
  };

  // Disconnect method
  ext.disconnect = () => {
    ext.disconnected = true;

    // Hide the cursor
    ext.write(escapeSequences.hideCursor);

    ext.writeln("");
    ext.writeln(colorize("Connection to frhd.me closed.", "brightRed"));

    // Show blinking disconnected status
    let blinkState = true;
    const blinkInterval = setInterval(() => {
      if (blinkState) {
        ext.write(`\r${colorize("[Disconnected]", "dim")}`);
      } else {
        ext.write(`\r${" ".repeat(14)}`); // Clear the text
      }
      blinkState = !blinkState;
    }, 800);

    // Store the interval so it can be cleared if needed
    (ext as any).disconnectBlinkInterval = blinkInterval;
  };

  // Clear current line
  ext.clearCurrentLine = () => {
    ext.write(escapeSequences.clearLine);
  };

  // Set current line
  ext.setCurrentLine = (line: string) => {
    ext.currentLine = line;
    ext.clearCurrentLine();
    ext.prompt();
    ext.write(line);
  };

  // Handle Enter key
  ext.handleEnter = async () => {
    if (ext.disconnected) {
      return; // Don't process commands when disconnected
    }

    // Initialize audio on first user interaction
    markUserInteraction();
    initAudio();

    ext.writeln("");
    const command = ext.currentLine.trim();

    if (command) {
      ext.history.push(command);
      ext.historyIndex = ext.history.length;

      // Play command sound
      if (isSoundEnabled()) {
        playSound("command");
      }

      // Dynamically import executeCommand to avoid SSR issues
      try {
        const { executeCommand } = await import("./xterm-commands");
        await executeCommand(ext, command);
      } catch (error) {
        console.error("Failed to execute command:", error);
        ext.writeln(colorize("Command execution failed", "brightRed"));
        if (isSoundEnabled()) {
          playSound("error");
        }
      }
    }

    ext.currentLine = "";
    if (!ext.disconnected) {
      ext.prompt();
    }
  };

  // Handle Backspace
  ext.handleBackspace = () => {
    if (ext.disconnected) {
      return; // Don't process input when disconnected
    }
    if (ext.currentLine.length > 0) {
      ext.currentLine = ext.currentLine.slice(0, -1);
      ext.write(escapeSequences.backspace);
    }
  };

  // Handle Tab (auto-completion)
  ext.handleTab = () => {
    if (ext.disconnected) {
      return; // Don't process input when disconnected
    }

    const result = completeCommand(ext.currentLine);

    if (result.completion !== undefined) {
      // Single match - complete it
      ext.currentLine = result.newLine!;
      ext.write(result.completion);
    } else if (result.matches) {
      // Multiple matches - show them
      ext.writeln("");
      result.matches.forEach((match) => {
        ext.writeln(`  ${match}`);
      });
      ext.prompt();
      ext.write(ext.currentLine);
    }
  };

  // Handle Arrow Up
  ext.handleArrowUp = () => {
    if (ext.disconnected) {
      return; // Don't process input when disconnected
    }
    if (ext.historyIndex > 0) {
      ext.historyIndex--;
      ext.setCurrentLine(ext.history[ext.historyIndex]);
    }
  };

  // Handle Arrow Down
  ext.handleArrowDown = () => {
    if (ext.disconnected) {
      return; // Don't process input when disconnected
    }
    if (ext.historyIndex < ext.history.length - 1) {
      ext.historyIndex++;
      ext.setCurrentLine(ext.history[ext.historyIndex]);
    } else if (ext.historyIndex === ext.history.length - 1) {
      ext.historyIndex = ext.history.length;
      ext.setCurrentLine("");
    }
  };

  // Handle Home (Ctrl+A)
  ext.handleHome = () => {
    if (ext.disconnected) {
      return; // Don't process input when disconnected
    }
    const cursorPos = ext.currentLine.length;
    ext.write(`\x1b[${cursorPos}D`);
  };

  // Handle End (Ctrl+E)
  ext.handleEnd = () => {
    if (ext.disconnected) {
      return; // Don't process input when disconnected
    }
    const cursorPos = ext.currentLine.length;
    ext.write(`\x1b[${cursorPos}C`);
  };

  // Handle Ctrl+C
  ext.handleCtrlC = () => {
    if (ext.disconnected) {
      return; // Don't process input when disconnected
    }
    ext.writeln("^C");
    ext.currentLine = "";
    ext.prompt();
  };

  // Handle regular input
  ext.handleInput = (data: string) => {
    if (ext.disconnected) {
      return; // Don't process input when disconnected
    }
    ext.currentLine += data;
    ext.write(data);

    // Play keypress sound (rate-limited)
    if (isSoundEnabled()) {
      playKeypressSound();
    }
  };

  // Override dispose to clean up intervals
  const originalDispose = ext.dispose;
  ext.dispose = () => {
    // Clear disconnect blink interval if it exists
    if ((ext as any).disconnectBlinkInterval) {
      clearInterval((ext as any).disconnectBlinkInterval);
    }
    // Call original dispose
    originalDispose.call(ext);
  };
}
