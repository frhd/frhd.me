/**
 * Vim command mode commands (:w, :q, etc.)
 */

import type { EditorState, CommandResult } from "./types";
import { getFileContent, listFiles, VIRTUAL_FILES } from "./filesystem";

export function executeVimCommand(
  state: EditorState,
  command: string
): CommandResult {
  const cmd = command.trim();

  // Quit commands
  if (cmd === "q" || cmd === "quit") {
    if (state.modified) {
      return {
        message: "E37: No write since last change (add ! to override)",
      };
    }
    return { shouldExit: true };
  }

  if (cmd === "q!" || cmd === "quit!") {
    return { shouldExit: true };
  }

  // Write commands
  if (cmd === "w" || cmd === "write") {
    return {
      newState: { modified: false },
      message: `"${state.filename}" ${state.lines.length}L written (simulated)`,
    };
  }

  // Write and quit
  if (cmd === "wq" || cmd === "x") {
    return { shouldExit: true };
  }

  // Set options
  if (cmd === "set number" || cmd === "set nu") {
    return {
      newState: { showLineNumbers: true },
    };
  }

  if (cmd === "set nonumber" || cmd === "set nonu") {
    return {
      newState: { showLineNumbers: false },
    };
  }

  // Edit file
  if (cmd.startsWith("e ")) {
    const newFilename = cmd.slice(2).trim();
    const content = getFileContent(newFilename);

    if (content) {
      return {
        newState: {
          lines: content,
          filename: newFilename,
          cursorRow: 0,
          cursorCol: 0,
          modified: false,
          undoStack: [],
          redoStack: [],
        },
        message: `"${newFilename}" ${content.length}L`,
      };
    }

    return {
      message: `E212: Can't open file for reading: ${newFilename}`,
    };
  }

  // Help
  if (cmd === "help" || cmd === "h") {
    const helpContent = VIRTUAL_FILES["readme.txt"];
    return {
      newState: {
        lines: [...helpContent],
        filename: "readme.txt",
        cursorRow: 0,
        cursorCol: 0,
        modified: false,
        undoStack: [],
        redoStack: [],
      },
      message: `"readme.txt" ${helpContent.length}L`,
    };
  }

  // List files
  if (cmd === "files" || cmd === "ls") {
    const files = listFiles();
    return {
      message: `Available files: ${files.join(", ")}`,
    };
  }

  // Unknown command
  return {
    message: `E492: Not an editor command: ${cmd}`,
  };
}

export function handleCommandMode(
  state: EditorState,
  key: string
): { state: EditorState; shouldExit: boolean } {
  if (key === "Enter") {
    const result = executeVimCommand(state, state.commandBuffer);

    if (result.shouldExit) {
      return { state, shouldExit: true };
    }

    return {
      state: {
        ...state,
        ...result.newState,
        mode: "normal",
        commandBuffer: "",
        statusMessage: result.message || "",
      },
      shouldExit: false,
    };
  }

  if (key === "Backspace") {
    return {
      state: {
        ...state,
        commandBuffer: state.commandBuffer.slice(0, -1),
      },
      shouldExit: false,
    };
  }

  if (key.length === 1) {
    return {
      state: {
        ...state,
        commandBuffer: state.commandBuffer + key,
      },
      shouldExit: false,
    };
  }

  return { state, shouldExit: false };
}
