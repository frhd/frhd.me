/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  initAudio,
  markUserInteraction,
  playKeypressSound,
  playSound,
  isSoundEnabled,
} from "./sound-manager";

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
  ext.user = "guest";
  ext.host = "frhd.me";
  ext.cwd = "~";
  ext.history = [];
  ext.historyIndex = -1;
  ext.disconnected = false;

  // Helper function to colorize text
  ext.colorize = (text: string, color: string): string => {
    const colors: Record<string, string> = {
      black: "\x1b[30m",
      red: "\x1b[31m",
      green: "\x1b[32m",
      yellow: "\x1b[33m",
      blue: "\x1b[34m",
      magenta: "\x1b[35m",
      cyan: "\x1b[36m",
      white: "\x1b[37m",
      brightBlack: "\x1b[90m",
      brightRed: "\x1b[91m",
      brightGreen: "\x1b[92m",
      brightYellow: "\x1b[93m",
      brightBlue: "\x1b[94m",
      brightMagenta: "\x1b[95m",
      brightCyan: "\x1b[96m",
      brightWhite: "\x1b[97m",
      bold: "\x1b[1m",
      dim: "\x1b[2m",
      italic: "\x1b[3m",
      underline: "\x1b[4m",
      reset: "\x1b[0m",
    };
    return `${colors[color] || ""}${text}${colors.reset}`;
  };

  // ASCII art logo
  const logo = [
    "  __      _         _                  ",
    " / _|    | |       | |                 ",
    "| |_ _ __| |__   __| |  _ __ ___   ___ ",
    "|  _| '__| '_ \\ / _` | | '_ ` _ \\ / _ \\",
    "| | | |  | | | | (_| |_| | | | | |  __/",
    "|_| |_|  |_| |_|\\__,_(_)_| |_| |_|\\___|",
    "",
  ];

  // Display logo on initialization
  logo.forEach((line) => {
    ext.writeln(ext.colorize(line, "brightGreen"));
  });

  // Display prompt
  ext.prompt = () => {
    if (ext.disconnected) {
      return; // Don't show prompt when disconnected
    }
    const prompt = `${ext.colorize(ext.user, "brightYellow")}@${ext.colorize(
      ext.host,
      "brightGreen"
    )}:${ext.colorize(ext.cwd, "brightBlue")}$ `;
    ext.write(prompt);
  };

  // Disconnect method
  ext.disconnect = () => {
    ext.disconnected = true;
    
    // Hide the cursor
    ext.write("\x1b[?25l");
    
    ext.writeln("");
    ext.writeln(ext.colorize("Connection to frhd.me closed.", "brightRed"));
    
    // Show blinking disconnected status
    let blinkState = true;
    const blinkInterval = setInterval(() => {
      if (blinkState) {
        ext.write(`\r${ext.colorize("[Disconnected]", "dim")}`);
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
    ext.write("\r\x1b[K");
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
        ext.writeln(ext.colorize("Command execution failed", "brightRed"));
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
      ext.write("\b \b");
    }
  };

  // Handle Tab (auto-completion)
  ext.handleTab = () => {
    if (ext.disconnected) {
      return; // Don't process input when disconnected
    }
    // Simple tab completion for commands
    if (!ext.currentLine.includes(" ")) {
      const commands = [
        "help",
        "clear",
        "about",
        "matrix",
        "decrypt",
        "glitch",
        "scan",
        "access",
        "whoami",
        "contact",
        "ls",
        "cat",
        "pwd",
        "cd",
        "echo",
        "date",
        "neofetch",
        "exit",
        // Phase 1: New fun commands
        "sudo",
        "rm",
        "ping",
        "sl",
        "cowsay",
        "fortune",
        "figlet",
        "find",
        "download",
        // Phase 2: Visual & theme commands
        "theme",
        "crt",
        "pipes",
        "plasma",
        "fireworks",
        // Phase 3: Mini-games
        "snake",
        "tetris",
        "typing",
        "2048",
        // Phase 4: Sound system
        "sound",
        "music",
        // Phase 5: Achievements
        "achievements",
        // Phase 6: Time-based features
        "uptime",
        "last",
        // Phase 7: Utilities
        "qr",
        "base64",
        "calc",
        "uuid",
        "timestamp",
        "weather",
      ];

      const matches = commands.filter((cmd) =>
        cmd.startsWith(ext.currentLine)
      );

      if (matches.length === 1) {
        const completion = matches[0].slice(ext.currentLine.length);
        ext.currentLine += completion;
        ext.write(completion);
      } else if (matches.length > 1) {
        ext.writeln("");
        matches.forEach((match) => {
          ext.writeln(`  ${match}`);
        });
        ext.prompt();
        ext.write(ext.currentLine);
      }
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