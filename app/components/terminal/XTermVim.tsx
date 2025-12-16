"use client";

import { useEffect, useRef, useCallback, useState } from "react";

interface VimProps {
  onComplete: () => void;
  filename?: string;
}

type VimMode = "normal" | "insert" | "command" | "visual";

interface EditorState {
  lines: string[];
  cursorRow: number;
  cursorCol: number;
  mode: VimMode;
  commandBuffer: string;
  statusMessage: string;
  showLineNumbers: boolean;
  modified: boolean;
  filename: string;
  undoStack: { lines: string[]; cursorRow: number; cursorCol: number }[];
  redoStack: { lines: string[]; cursorRow: number; cursorCol: number }[];
  scrollOffset: number;
  pendingOperator: string | null;
  yankBuffer: string[];
  lastSearchPattern: string;
}

// Sample files for the virtual file system
const VIRTUAL_FILES: Record<string, string[]> = {
  "readme.txt": [
    "Welcome to Vim!",
    "",
    "This is a minimal vim-like editor.",
    "Press 'i' to enter insert mode.",
    "Press 'ESC' to return to normal mode.",
    "Type ':q' to quit, ':w' to save.",
    "",
    "Navigation:",
    "  h - left",
    "  j - down",
    "  k - up",
    "  l - right",
    "  w - next word",
    "  b - previous word",
    "  0 - start of line",
    "  $ - end of line",
    "  gg - start of file",
    "  G - end of file",
    "",
    "Editing:",
    "  i - insert before cursor",
    "  a - append after cursor",
    "  o - open line below",
    "  O - open line above",
    "  x - delete character",
    "  dd - delete line",
    "  dw - delete word",
    "  yy - yank line",
    "  p - paste after",
    "  P - paste before",
    "  u - undo",
    "  Ctrl+r - redo",
    "",
    "Commands:",
    "  :w - save",
    "  :q - quit",
    "  :wq - save and quit",
    "  :q! - force quit",
    "  :set number - show line numbers",
    "  :set nonumber - hide line numbers",
  ],
  "hello.js": [
    "// A simple JavaScript file",
    "function greet(name) {",
    "  const message = `Hello, ${name}!`;",
    "  console.log(message);",
    "  return message;",
    "}",
    "",
    "// Main execution",
    "const result = greet('World');",
    "console.log('Result:', result);",
  ],
  "example.py": [
    "# Python example",
    "def factorial(n):",
    "    if n <= 1:",
    "        return 1",
    "    return n * factorial(n - 1)",
    "",
    "# Test the function",
    "for i in range(10):",
    "    print(f'{i}! = {factorial(i)}')",
  ],
  "config.json": [
    "{",
    '  "name": "terminal-portfolio",',
    '  "version": "1.0.0",',
    '  "settings": {',
    '    "theme": "matrix",',
    '    "fontSize": 14,',
    '    "showLineNumbers": true',
    "  }",
    "}",
  ],
};

// Syntax highlighting patterns
const SYNTAX_PATTERNS: Record<
  string,
  { pattern: RegExp; color: string }[]
> = {
  js: [
    { pattern: /\/\/.*$/gm, color: "#6a737d" }, // comments
    { pattern: /\/\*[\s\S]*?\*\//g, color: "#6a737d" }, // multi-line comments
    { pattern: /(["'`])(?:(?!\1)[^\\]|\\.)*?\1/g, color: "#9ecbff" }, // strings
    {
      pattern:
        /\b(function|const|let|var|return|if|else|for|while|class|import|export|from|async|await|try|catch|throw|new)\b/g,
      color: "#ff7b72",
    }, // keywords
    { pattern: /\b(true|false|null|undefined|NaN|Infinity)\b/g, color: "#79c0ff" }, // constants
    { pattern: /\b\d+\.?\d*\b/g, color: "#79c0ff" }, // numbers
    { pattern: /\b(console|Math|JSON|Array|Object|String|Number|Date)\b/g, color: "#ffa657" }, // built-ins
  ],
  py: [
    { pattern: /#.*$/gm, color: "#6a737d" }, // comments
    { pattern: /(["'])(?:(?!\1)[^\\]|\\.)*?\1/g, color: "#9ecbff" }, // strings
    { pattern: /"""[\s\S]*?"""|'''[\s\S]*?'''/g, color: "#9ecbff" }, // docstrings
    {
      pattern:
        /\b(def|class|if|elif|else|for|while|return|import|from|as|try|except|finally|with|yield|lambda|pass|break|continue|raise|assert|global|nonlocal)\b/g,
      color: "#ff7b72",
    }, // keywords
    { pattern: /\b(True|False|None)\b/g, color: "#79c0ff" }, // constants
    { pattern: /\b\d+\.?\d*\b/g, color: "#79c0ff" }, // numbers
    { pattern: /\b(print|len|range|str|int|float|list|dict|set|tuple|type|isinstance|open)\b/g, color: "#ffa657" }, // built-ins
  ],
  json: [
    { pattern: /(["'])(?:(?!\1)[^\\]|\\.)*?\1(?=\s*:)/g, color: "#7ee787" }, // keys
    { pattern: /:\s*(["'])(?:(?!\1)[^\\]|\\.)*?\1/g, color: "#9ecbff" }, // string values
    { pattern: /\b(true|false|null)\b/g, color: "#79c0ff" }, // constants
    { pattern: /\b-?\d+\.?\d*\b/g, color: "#79c0ff" }, // numbers
  ],
  txt: [],
};

function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "txt";
}

export default function XTermVim({ onComplete, filename = "readme.txt" }: VimProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<EditorState>(() => {
    const initialLines = VIRTUAL_FILES[filename] || [""];
    return {
      lines: [...initialLines],
      cursorRow: 0,
      cursorCol: 0,
      mode: "normal",
      commandBuffer: "",
      statusMessage: `"${filename}" ${initialLines.length}L`,
      showLineNumbers: true,
      modified: false,
      filename,
      undoStack: [],
      redoStack: [],
      scrollOffset: 0,
      pendingOperator: null,
      yankBuffer: [],
      lastSearchPattern: "",
    };
  });

  const handleComplete = useCallback(() => {
    onComplete?.();
  }, [onComplete]);

  // Save state for undo
  const saveUndoState = useCallback((currentState: EditorState) => {
    return {
      lines: [...currentState.lines],
      cursorRow: currentState.cursorRow,
      cursorCol: currentState.cursorCol,
    };
  }, []);

  // Apply syntax highlighting
  const highlightLine = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      line: string,
      x: number,
      y: number,
      charWidth: number,
      ext: string
    ) => {
      const patterns = SYNTAX_PATTERNS[ext] || [];
      const colors: { start: number; end: number; color: string }[] = [];

      // Find all matches
      for (const { pattern, color } of patterns) {
        pattern.lastIndex = 0;
        let match;
        while ((match = pattern.exec(line)) !== null) {
          colors.push({ start: match.index, end: match.index + match[0].length, color });
        }
      }

      // Sort by start position (later matches override earlier)
      colors.sort((a, b) => a.start - b.start);

      // Draw character by character with appropriate colors
      let currentColorIndex = 0;
      for (let i = 0; i < line.length; i++) {
        // Find the applicable color
        let charColor = "#00ff00"; // default green
        while (currentColorIndex < colors.length && colors[currentColorIndex].end <= i) {
          currentColorIndex++;
        }
        if (currentColorIndex < colors.length && colors[currentColorIndex].start <= i) {
          charColor = colors[currentColorIndex].color;
        }

        ctx.fillStyle = charColor;
        ctx.fillText(line[i], x + i * charWidth, y);
      }
    },
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const CHAR_WIDTH = 10;
    const LINE_HEIGHT = 20;
    const PADDING = 10;
    const LINE_NUMBER_WIDTH = state.showLineNumbers ? 50 : 0;

    const setupCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setupCanvas();

    const visibleLines = Math.floor((canvas.height - PADDING * 2 - LINE_HEIGHT * 2) / LINE_HEIGHT);

    const draw = () => {
      // Clear canvas
      ctx.fillStyle = "#0d1117";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = "16px monospace";

      // Ensure scroll keeps cursor visible
      let scrollOffset = state.scrollOffset;
      if (state.cursorRow < scrollOffset) {
        scrollOffset = state.cursorRow;
      } else if (state.cursorRow >= scrollOffset + visibleLines) {
        scrollOffset = state.cursorRow - visibleLines + 1;
      }

      // Draw lines
      const ext = getFileExtension(state.filename);
      for (let i = 0; i < visibleLines && scrollOffset + i < state.lines.length; i++) {
        const lineIndex = scrollOffset + i;
        const y = PADDING + (i + 1) * LINE_HEIGHT;

        // Draw line number
        if (state.showLineNumbers) {
          ctx.fillStyle = "#484f58";
          ctx.fillText(String(lineIndex + 1).padStart(4, " "), PADDING, y);
        }

        // Draw line content with syntax highlighting
        const line = state.lines[lineIndex];
        highlightLine(ctx, line, PADDING + LINE_NUMBER_WIDTH, y, CHAR_WIDTH, ext);

        // Draw cursor
        if (lineIndex === state.cursorRow) {
          const cursorX = PADDING + LINE_NUMBER_WIDTH + state.cursorCol * CHAR_WIDTH;
          const cursorY = y - LINE_HEIGHT + 5;

          if (state.mode === "insert") {
            // Thin line cursor in insert mode
            ctx.fillStyle = "#00ff00";
            ctx.fillRect(cursorX, cursorY, 2, LINE_HEIGHT);
          } else {
            // Block cursor in normal mode
            ctx.fillStyle = "rgba(0, 255, 0, 0.5)";
            ctx.fillRect(cursorX, cursorY, CHAR_WIDTH, LINE_HEIGHT);
          }
        }
      }

      // Draw status bar
      const statusY = canvas.height - LINE_HEIGHT * 2;
      ctx.fillStyle = "#21262d";
      ctx.fillRect(0, statusY, canvas.width, LINE_HEIGHT);

      ctx.fillStyle = "#00ff00";
      const modeText = state.mode.toUpperCase();
      const modeColor =
        state.mode === "insert"
          ? "#7ee787"
          : state.mode === "command"
          ? "#79c0ff"
          : "#ff7b72";
      ctx.fillStyle = modeColor;
      ctx.fillText(`-- ${modeText} --`, PADDING, statusY + 15);

      // Draw filename and modified flag
      ctx.fillStyle = "#c9d1d9";
      const fileStatus = state.modified ? `${state.filename} [+]` : state.filename;
      ctx.fillText(fileStatus, 150, statusY + 15);

      // Draw cursor position
      const posText = `${state.cursorRow + 1},${state.cursorCol + 1}`;
      ctx.fillText(posText, canvas.width - 100, statusY + 15);

      // Draw command line
      const cmdY = canvas.height - LINE_HEIGHT;
      ctx.fillStyle = "#0d1117";
      ctx.fillRect(0, cmdY, canvas.width, LINE_HEIGHT);

      if (state.mode === "command") {
        ctx.fillStyle = "#00ff00";
        ctx.fillText(":" + state.commandBuffer, PADDING, cmdY + 15);
        // Command cursor
        ctx.fillRect(
          PADDING + (1 + state.commandBuffer.length) * CHAR_WIDTH,
          cmdY + 2,
          CHAR_WIDTH,
          LINE_HEIGHT - 4
        );
      } else {
        ctx.fillStyle = "#8b949e";
        ctx.fillText(state.statusMessage, PADDING, cmdY + 15);
      }
    };

    draw();

    // Update scroll offset if needed
    if (
      state.cursorRow < state.scrollOffset ||
      state.cursorRow >= state.scrollOffset + visibleLines
    ) {
      let newScrollOffset = state.scrollOffset;
      if (state.cursorRow < state.scrollOffset) {
        newScrollOffset = state.cursorRow;
      } else if (state.cursorRow >= state.scrollOffset + visibleLines) {
        newScrollOffset = state.cursorRow - visibleLines + 1;
      }
      if (newScrollOffset !== state.scrollOffset) {
        setState((prev) => ({ ...prev, scrollOffset: newScrollOffset }));
      }
    }
  }, [state, highlightLine]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();

      const key = event.key;

      setState((prev) => {
        const newState = { ...prev };
        const currentLine = prev.lines[prev.cursorRow] || "";

        // Exit with Q in normal mode or Escape anywhere
        if (prev.mode === "normal" && key.toLowerCase() === "q" && !prev.pendingOperator) {
          if (!prev.modified) {
            handleComplete();
            return prev;
          } else {
            return { ...prev, statusMessage: "E37: No write since last change (add ! to override)" };
          }
        }

        // Handle Escape
        if (key === "Escape") {
          if (prev.mode === "command" || prev.mode === "insert") {
            return {
              ...prev,
              mode: "normal",
              commandBuffer: "",
              statusMessage: "",
              pendingOperator: null,
            };
          }
          return { ...prev, pendingOperator: null };
        }

        // Command mode
        if (prev.mode === "command") {
          if (key === "Enter") {
            const cmd = prev.commandBuffer.trim();
            let message = "";

            if (cmd === "q" || cmd === "quit") {
              if (prev.modified) {
                message = "E37: No write since last change (add ! to override)";
              } else {
                handleComplete();
                return prev;
              }
            } else if (cmd === "q!" || cmd === "quit!") {
              handleComplete();
              return prev;
            } else if (cmd === "w" || cmd === "write") {
              message = `"${prev.filename}" ${prev.lines.length}L written (simulated)`;
              return {
                ...prev,
                mode: "normal",
                commandBuffer: "",
                statusMessage: message,
                modified: false,
              };
            } else if (cmd === "wq" || cmd === "x") {
              handleComplete();
              return prev;
            } else if (cmd === "set number" || cmd === "set nu") {
              return {
                ...prev,
                mode: "normal",
                commandBuffer: "",
                showLineNumbers: true,
                statusMessage: "",
              };
            } else if (cmd === "set nonumber" || cmd === "set nonu") {
              return {
                ...prev,
                mode: "normal",
                commandBuffer: "",
                showLineNumbers: false,
                statusMessage: "",
              };
            } else if (cmd.startsWith("e ")) {
              const newFilename = cmd.slice(2).trim();
              if (VIRTUAL_FILES[newFilename]) {
                return {
                  ...prev,
                  mode: "normal",
                  commandBuffer: "",
                  lines: [...VIRTUAL_FILES[newFilename]],
                  filename: newFilename,
                  cursorRow: 0,
                  cursorCol: 0,
                  modified: false,
                  statusMessage: `"${newFilename}" ${VIRTUAL_FILES[newFilename].length}L`,
                  undoStack: [],
                  redoStack: [],
                };
              } else {
                message = `E212: Can't open file for reading: ${newFilename}`;
              }
            } else if (cmd === "help" || cmd === "h") {
              return {
                ...prev,
                mode: "normal",
                commandBuffer: "",
                lines: [...VIRTUAL_FILES["readme.txt"]],
                filename: "readme.txt",
                cursorRow: 0,
                cursorCol: 0,
                modified: false,
                statusMessage: `"readme.txt" ${VIRTUAL_FILES["readme.txt"].length}L`,
                undoStack: [],
                redoStack: [],
              };
            } else if (cmd === "files" || cmd === "ls") {
              const fileList = Object.keys(VIRTUAL_FILES);
              message = `Available files: ${fileList.join(", ")}`;
            } else {
              message = `E492: Not an editor command: ${cmd}`;
            }

            return {
              ...prev,
              mode: "normal",
              commandBuffer: "",
              statusMessage: message,
            };
          } else if (key === "Backspace") {
            return {
              ...prev,
              commandBuffer: prev.commandBuffer.slice(0, -1),
            };
          } else if (key.length === 1) {
            return {
              ...prev,
              commandBuffer: prev.commandBuffer + key,
            };
          }
          return prev;
        }

        // Insert mode
        if (prev.mode === "insert") {
          if (key === "Backspace") {
            if (prev.cursorCol > 0) {
              const newLine =
                currentLine.slice(0, prev.cursorCol - 1) + currentLine.slice(prev.cursorCol);
              const newLines = [...prev.lines];
              newLines[prev.cursorRow] = newLine;
              return {
                ...prev,
                lines: newLines,
                cursorCol: prev.cursorCol - 1,
                modified: true,
              };
            } else if (prev.cursorRow > 0) {
              // Join with previous line
              const prevLine = prev.lines[prev.cursorRow - 1];
              const newCol = prevLine.length;
              const newLines = [...prev.lines];
              newLines[prev.cursorRow - 1] = prevLine + currentLine;
              newLines.splice(prev.cursorRow, 1);
              return {
                ...prev,
                lines: newLines,
                cursorRow: prev.cursorRow - 1,
                cursorCol: newCol,
                modified: true,
              };
            }
          } else if (key === "Enter") {
            const beforeCursor = currentLine.slice(0, prev.cursorCol);
            const afterCursor = currentLine.slice(prev.cursorCol);
            const newLines = [...prev.lines];
            newLines[prev.cursorRow] = beforeCursor;
            newLines.splice(prev.cursorRow + 1, 0, afterCursor);
            return {
              ...prev,
              lines: newLines,
              cursorRow: prev.cursorRow + 1,
              cursorCol: 0,
              modified: true,
            };
          } else if (key === "Tab") {
            const newLine =
              currentLine.slice(0, prev.cursorCol) + "  " + currentLine.slice(prev.cursorCol);
            const newLines = [...prev.lines];
            newLines[prev.cursorRow] = newLine;
            return {
              ...prev,
              lines: newLines,
              cursorCol: prev.cursorCol + 2,
              modified: true,
            };
          } else if (key.length === 1) {
            const newLine =
              currentLine.slice(0, prev.cursorCol) + key + currentLine.slice(prev.cursorCol);
            const newLines = [...prev.lines];
            newLines[prev.cursorRow] = newLine;
            return {
              ...prev,
              lines: newLines,
              cursorCol: prev.cursorCol + 1,
              modified: true,
            };
          }
          return prev;
        }

        // Normal mode
        if (prev.mode === "normal") {
          // Handle pending operators (d, y, c)
          if (prev.pendingOperator) {
            const op = prev.pendingOperator;

            if (op === "d") {
              if (key === "d") {
                // dd - delete line
                const undoState = saveUndoState(prev);
                newState.yankBuffer = [currentLine];
                const newLines = [...prev.lines];
                if (newLines.length > 1) {
                  newLines.splice(prev.cursorRow, 1);
                } else {
                  newLines[0] = "";
                }
                const newRow = Math.min(prev.cursorRow, newLines.length - 1);
                return {
                  ...prev,
                  lines: newLines,
                  cursorRow: newRow,
                  cursorCol: 0,
                  modified: true,
                  pendingOperator: null,
                  yankBuffer: [currentLine],
                  undoStack: [...prev.undoStack, undoState],
                  redoStack: [],
                  statusMessage: "1 line deleted",
                };
              } else if (key === "w") {
                // dw - delete word
                const undoState = saveUndoState(prev);
                let endCol = prev.cursorCol;
                while (endCol < currentLine.length && !/\s/.test(currentLine[endCol])) {
                  endCol++;
                }
                while (endCol < currentLine.length && /\s/.test(currentLine[endCol])) {
                  endCol++;
                }
                const deleted = currentLine.slice(prev.cursorCol, endCol);
                const newLine = currentLine.slice(0, prev.cursorCol) + currentLine.slice(endCol);
                const newLines = [...prev.lines];
                newLines[prev.cursorRow] = newLine;
                return {
                  ...prev,
                  lines: newLines,
                  modified: true,
                  pendingOperator: null,
                  yankBuffer: [deleted],
                  undoStack: [...prev.undoStack, undoState],
                  redoStack: [],
                };
              }
            } else if (op === "y") {
              if (key === "y") {
                // yy - yank line
                return {
                  ...prev,
                  yankBuffer: [currentLine],
                  pendingOperator: null,
                  statusMessage: "1 line yanked",
                };
              }
            } else if (op === "g") {
              if (key === "g") {
                // gg - go to first line
                return {
                  ...prev,
                  cursorRow: 0,
                  cursorCol: 0,
                  pendingOperator: null,
                };
              }
            }

            return { ...prev, pendingOperator: null };
          }

          // Movement
          if (key === "h" || key === "ArrowLeft") {
            return { ...prev, cursorCol: Math.max(0, prev.cursorCol - 1) };
          } else if (key === "j" || key === "ArrowDown") {
            const newRow = Math.min(prev.lines.length - 1, prev.cursorRow + 1);
            const newLine = prev.lines[newRow] || "";
            return {
              ...prev,
              cursorRow: newRow,
              cursorCol: Math.min(prev.cursorCol, Math.max(0, newLine.length - 1)),
            };
          } else if (key === "k" || key === "ArrowUp") {
            const newRow = Math.max(0, prev.cursorRow - 1);
            const newLine = prev.lines[newRow] || "";
            return {
              ...prev,
              cursorRow: newRow,
              cursorCol: Math.min(prev.cursorCol, Math.max(0, newLine.length - 1)),
            };
          } else if (key === "l" || key === "ArrowRight") {
            return {
              ...prev,
              cursorCol: Math.min(Math.max(0, currentLine.length - 1), prev.cursorCol + 1),
            };
          } else if (key === "w") {
            // Move to next word
            let col = prev.cursorCol;
            while (col < currentLine.length && !/\s/.test(currentLine[col])) {
              col++;
            }
            while (col < currentLine.length && /\s/.test(currentLine[col])) {
              col++;
            }
            if (col >= currentLine.length && prev.cursorRow < prev.lines.length - 1) {
              return { ...prev, cursorRow: prev.cursorRow + 1, cursorCol: 0 };
            }
            return { ...prev, cursorCol: col };
          } else if (key === "b") {
            // Move to previous word
            let col = prev.cursorCol;
            if (col > 0) col--;
            while (col > 0 && /\s/.test(currentLine[col])) {
              col--;
            }
            while (col > 0 && !/\s/.test(currentLine[col - 1])) {
              col--;
            }
            return { ...prev, cursorCol: col };
          } else if (key === "0") {
            return { ...prev, cursorCol: 0 };
          } else if (key === "$") {
            return { ...prev, cursorCol: Math.max(0, currentLine.length - 1) };
          } else if (key === "G") {
            const lastRow = prev.lines.length - 1;
            return { ...prev, cursorRow: lastRow, cursorCol: 0 };
          } else if (key === "g") {
            return { ...prev, pendingOperator: "g" };
          }

          // Mode switching
          else if (key === "i") {
            return { ...prev, mode: "insert", statusMessage: "-- INSERT --" };
          } else if (key === "I") {
            // Find first non-whitespace
            let col = 0;
            while (col < currentLine.length && /\s/.test(currentLine[col])) {
              col++;
            }
            return { ...prev, mode: "insert", cursorCol: col, statusMessage: "-- INSERT --" };
          } else if (key === "a") {
            return {
              ...prev,
              mode: "insert",
              cursorCol: Math.min(currentLine.length, prev.cursorCol + 1),
              statusMessage: "-- INSERT --",
            };
          } else if (key === "A") {
            return {
              ...prev,
              mode: "insert",
              cursorCol: currentLine.length,
              statusMessage: "-- INSERT --",
            };
          } else if (key === "o") {
            const undoState = saveUndoState(prev);
            const newLines = [...prev.lines];
            newLines.splice(prev.cursorRow + 1, 0, "");
            return {
              ...prev,
              mode: "insert",
              lines: newLines,
              cursorRow: prev.cursorRow + 1,
              cursorCol: 0,
              modified: true,
              undoStack: [...prev.undoStack, undoState],
              redoStack: [],
            };
          } else if (key === "O") {
            const undoState = saveUndoState(prev);
            const newLines = [...prev.lines];
            newLines.splice(prev.cursorRow, 0, "");
            return {
              ...prev,
              mode: "insert",
              lines: newLines,
              cursorCol: 0,
              modified: true,
              undoStack: [...prev.undoStack, undoState],
              redoStack: [],
            };
          }

          // Delete/change
          else if (key === "x") {
            if (currentLine.length > 0) {
              const undoState = saveUndoState(prev);
              const deleted = currentLine[prev.cursorCol] || "";
              const newLine =
                currentLine.slice(0, prev.cursorCol) + currentLine.slice(prev.cursorCol + 1);
              const newLines = [...prev.lines];
              newLines[prev.cursorRow] = newLine;
              const newCol = Math.min(prev.cursorCol, Math.max(0, newLine.length - 1));
              return {
                ...prev,
                lines: newLines,
                cursorCol: newCol,
                modified: true,
                yankBuffer: [deleted],
                undoStack: [...prev.undoStack, undoState],
                redoStack: [],
              };
            }
          } else if (key === "d") {
            return { ...prev, pendingOperator: "d" };
          } else if (key === "y") {
            return { ...prev, pendingOperator: "y" };
          }

          // Paste
          else if (key === "p") {
            if (prev.yankBuffer.length > 0) {
              const undoState = saveUndoState(prev);
              if (prev.yankBuffer.length === 1 && !prev.yankBuffer[0].includes("\n")) {
                // Paste inline
                const text = prev.yankBuffer[0];
                const newLine =
                  currentLine.slice(0, prev.cursorCol + 1) +
                  text +
                  currentLine.slice(prev.cursorCol + 1);
                const newLines = [...prev.lines];
                newLines[prev.cursorRow] = newLine;
                return {
                  ...prev,
                  lines: newLines,
                  cursorCol: prev.cursorCol + text.length,
                  modified: true,
                  undoStack: [...prev.undoStack, undoState],
                  redoStack: [],
                };
              } else {
                // Paste lines
                const newLines = [...prev.lines];
                newLines.splice(prev.cursorRow + 1, 0, ...prev.yankBuffer);
                return {
                  ...prev,
                  lines: newLines,
                  cursorRow: prev.cursorRow + 1,
                  cursorCol: 0,
                  modified: true,
                  undoStack: [...prev.undoStack, undoState],
                  redoStack: [],
                };
              }
            }
          } else if (key === "P") {
            if (prev.yankBuffer.length > 0) {
              const undoState = saveUndoState(prev);
              if (prev.yankBuffer.length === 1 && !prev.yankBuffer[0].includes("\n")) {
                // Paste inline before cursor
                const text = prev.yankBuffer[0];
                const newLine =
                  currentLine.slice(0, prev.cursorCol) + text + currentLine.slice(prev.cursorCol);
                const newLines = [...prev.lines];
                newLines[prev.cursorRow] = newLine;
                return {
                  ...prev,
                  lines: newLines,
                  cursorCol: prev.cursorCol + text.length - 1,
                  modified: true,
                  undoStack: [...prev.undoStack, undoState],
                  redoStack: [],
                };
              } else {
                // Paste lines above
                const newLines = [...prev.lines];
                newLines.splice(prev.cursorRow, 0, ...prev.yankBuffer);
                return {
                  ...prev,
                  lines: newLines,
                  cursorCol: 0,
                  modified: true,
                  undoStack: [...prev.undoStack, undoState],
                  redoStack: [],
                };
              }
            }
          }

          // Undo/Redo
          else if (key === "u") {
            if (prev.undoStack.length > 0) {
              const undoState = prev.undoStack[prev.undoStack.length - 1];
              const currentState = saveUndoState(prev);
              return {
                ...prev,
                lines: undoState.lines,
                cursorRow: undoState.cursorRow,
                cursorCol: undoState.cursorCol,
                undoStack: prev.undoStack.slice(0, -1),
                redoStack: [...prev.redoStack, currentState],
                modified: prev.undoStack.length > 1,
                statusMessage: "Undo",
              };
            } else {
              return { ...prev, statusMessage: "Already at oldest change" };
            }
          } else if (event.ctrlKey && key === "r") {
            if (prev.redoStack.length > 0) {
              const redoState = prev.redoStack[prev.redoStack.length - 1];
              const currentState = saveUndoState(prev);
              return {
                ...prev,
                lines: redoState.lines,
                cursorRow: redoState.cursorRow,
                cursorCol: redoState.cursorCol,
                undoStack: [...prev.undoStack, currentState],
                redoStack: prev.redoStack.slice(0, -1),
                modified: true,
                statusMessage: "Redo",
              };
            } else {
              return { ...prev, statusMessage: "Already at newest change" };
            }
          }

          // Enter command mode
          else if (key === ":") {
            return { ...prev, mode: "command", commandBuffer: "" };
          }
        }

        return prev;
      });
    };

    document.addEventListener("keydown", handleKeyDown, true);

    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [handleComplete, saveUndoState]);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute top-2 right-4 text-gray-500 text-xs font-mono">
        Press ESC for normal mode | :q to quit | :help for commands
      </div>
    </div>
  );
}
