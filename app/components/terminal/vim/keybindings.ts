/**
 * Keyboard event handling for vim modes
 */

import type { EditorState } from "./types";
import { saveUndoState, undo, redo, pushUndo } from "./state";

export interface KeyResult {
  state: EditorState;
  shouldExit: boolean;
}

export function handleInsertMode(
  state: EditorState,
  key: string
): EditorState {
  const currentLine = state.lines[state.cursorRow] || "";

  if (key === "Backspace") {
    if (state.cursorCol > 0) {
      const newLine =
        currentLine.slice(0, state.cursorCol - 1) + currentLine.slice(state.cursorCol);
      const newLines = [...state.lines];
      newLines[state.cursorRow] = newLine;
      return {
        ...state,
        lines: newLines,
        cursorCol: state.cursorCol - 1,
        modified: true,
      };
    } else if (state.cursorRow > 0) {
      // Join with previous line
      const prevLine = state.lines[state.cursorRow - 1];
      const newCol = prevLine.length;
      const newLines = [...state.lines];
      newLines[state.cursorRow - 1] = prevLine + currentLine;
      newLines.splice(state.cursorRow, 1);
      return {
        ...state,
        lines: newLines,
        cursorRow: state.cursorRow - 1,
        cursorCol: newCol,
        modified: true,
      };
    }
  } else if (key === "Enter") {
    const beforeCursor = currentLine.slice(0, state.cursorCol);
    const afterCursor = currentLine.slice(state.cursorCol);
    const newLines = [...state.lines];
    newLines[state.cursorRow] = beforeCursor;
    newLines.splice(state.cursorRow + 1, 0, afterCursor);
    return {
      ...state,
      lines: newLines,
      cursorRow: state.cursorRow + 1,
      cursorCol: 0,
      modified: true,
    };
  } else if (key === "Tab") {
    const newLine =
      currentLine.slice(0, state.cursorCol) + "  " + currentLine.slice(state.cursorCol);
    const newLines = [...state.lines];
    newLines[state.cursorRow] = newLine;
    return {
      ...state,
      lines: newLines,
      cursorCol: state.cursorCol + 2,
      modified: true,
    };
  } else if (key.length === 1) {
    const newLine =
      currentLine.slice(0, state.cursorCol) + key + currentLine.slice(state.cursorCol);
    const newLines = [...state.lines];
    newLines[state.cursorRow] = newLine;
    return {
      ...state,
      lines: newLines,
      cursorCol: state.cursorCol + 1,
      modified: true,
    };
  }

  return state;
}

export function handleNormalModeMovement(
  state: EditorState,
  key: string
): EditorState | null {
  const currentLine = state.lines[state.cursorRow] || "";

  // Basic movement
  if (key === "h" || key === "ArrowLeft") {
    return { ...state, cursorCol: Math.max(0, state.cursorCol - 1) };
  }

  if (key === "j" || key === "ArrowDown") {
    const newRow = Math.min(state.lines.length - 1, state.cursorRow + 1);
    const newLine = state.lines[newRow] || "";
    return {
      ...state,
      cursorRow: newRow,
      cursorCol: Math.min(state.cursorCol, Math.max(0, newLine.length - 1)),
    };
  }

  if (key === "k" || key === "ArrowUp") {
    const newRow = Math.max(0, state.cursorRow - 1);
    const newLine = state.lines[newRow] || "";
    return {
      ...state,
      cursorRow: newRow,
      cursorCol: Math.min(state.cursorCol, Math.max(0, newLine.length - 1)),
    };
  }

  if (key === "l" || key === "ArrowRight") {
    return {
      ...state,
      cursorCol: Math.min(Math.max(0, currentLine.length - 1), state.cursorCol + 1),
    };
  }

  // Word movement
  if (key === "w") {
    let col = state.cursorCol;
    while (col < currentLine.length && !/\s/.test(currentLine[col])) {
      col++;
    }
    while (col < currentLine.length && /\s/.test(currentLine[col])) {
      col++;
    }
    if (col >= currentLine.length && state.cursorRow < state.lines.length - 1) {
      return { ...state, cursorRow: state.cursorRow + 1, cursorCol: 0 };
    }
    return { ...state, cursorCol: col };
  }

  if (key === "b") {
    let col = state.cursorCol;
    if (col > 0) col--;
    while (col > 0 && /\s/.test(currentLine[col])) {
      col--;
    }
    while (col > 0 && !/\s/.test(currentLine[col - 1])) {
      col--;
    }
    return { ...state, cursorCol: col };
  }

  // Line movement
  if (key === "0") {
    return { ...state, cursorCol: 0 };
  }

  if (key === "$") {
    return { ...state, cursorCol: Math.max(0, currentLine.length - 1) };
  }

  // File movement
  if (key === "G") {
    const lastRow = state.lines.length - 1;
    return { ...state, cursorRow: lastRow, cursorCol: 0 };
  }

  return null;
}

export function handleNormalModeOperators(
  state: EditorState,
  key: string
): EditorState | null {
  const currentLine = state.lines[state.cursorRow] || "";
  const op = state.pendingOperator;

  if (!op) {
    if (key === "d") {
      return { ...state, pendingOperator: "d" };
    }
    if (key === "y") {
      return { ...state, pendingOperator: "y" };
    }
    if (key === "g") {
      return { ...state, pendingOperator: "g" };
    }
    return null;
  }

  // Handle pending operators
  if (op === "d") {
    if (key === "d") {
      // dd - delete line
      const undoState = saveUndoState(state);
      const newLines = [...state.lines];
      if (newLines.length > 1) {
        newLines.splice(state.cursorRow, 1);
      } else {
        newLines[0] = "";
      }
      const newRow = Math.min(state.cursorRow, newLines.length - 1);
      return {
        ...state,
        lines: newLines,
        cursorRow: newRow,
        cursorCol: 0,
        modified: true,
        pendingOperator: null,
        yankBuffer: [currentLine],
        ...pushUndo(state, undoState),
        statusMessage: "1 line deleted",
      };
    }
    if (key === "w") {
      // dw - delete word
      const undoState = saveUndoState(state);
      let endCol = state.cursorCol;
      while (endCol < currentLine.length && !/\s/.test(currentLine[endCol])) {
        endCol++;
      }
      while (endCol < currentLine.length && /\s/.test(currentLine[endCol])) {
        endCol++;
      }
      const deleted = currentLine.slice(state.cursorCol, endCol);
      const newLine = currentLine.slice(0, state.cursorCol) + currentLine.slice(endCol);
      const newLines = [...state.lines];
      newLines[state.cursorRow] = newLine;
      return {
        ...state,
        lines: newLines,
        modified: true,
        pendingOperator: null,
        yankBuffer: [deleted],
        ...pushUndo(state, undoState),
      };
    }
  }

  if (op === "y") {
    if (key === "y") {
      // yy - yank line
      return {
        ...state,
        yankBuffer: [currentLine],
        pendingOperator: null,
        statusMessage: "1 line yanked",
      };
    }
  }

  if (op === "g") {
    if (key === "g") {
      // gg - go to first line
      return {
        ...state,
        cursorRow: 0,
        cursorCol: 0,
        pendingOperator: null,
      };
    }
  }

  return { ...state, pendingOperator: null };
}

export function handleNormalModeEditing(
  state: EditorState,
  key: string
): EditorState | null {
  const currentLine = state.lines[state.cursorRow] || "";

  // Delete character
  if (key === "x") {
    if (currentLine.length > 0) {
      const undoState = saveUndoState(state);
      const deleted = currentLine[state.cursorCol] || "";
      const newLine =
        currentLine.slice(0, state.cursorCol) + currentLine.slice(state.cursorCol + 1);
      const newLines = [...state.lines];
      newLines[state.cursorRow] = newLine;
      const newCol = Math.min(state.cursorCol, Math.max(0, newLine.length - 1));
      return {
        ...state,
        lines: newLines,
        cursorCol: newCol,
        modified: true,
        yankBuffer: [deleted],
        ...pushUndo(state, undoState),
      };
    }
    return state;
  }

  return null;
}

export function handleNormalModeModeSwitch(
  state: EditorState,
  key: string
): EditorState | null {
  const currentLine = state.lines[state.cursorRow] || "";

  if (key === "i") {
    return { ...state, mode: "insert", statusMessage: "-- INSERT --" };
  }

  if (key === "I") {
    let col = 0;
    while (col < currentLine.length && /\s/.test(currentLine[col])) {
      col++;
    }
    return { ...state, mode: "insert", cursorCol: col, statusMessage: "-- INSERT --" };
  }

  if (key === "a") {
    return {
      ...state,
      mode: "insert",
      cursorCol: Math.min(currentLine.length, state.cursorCol + 1),
      statusMessage: "-- INSERT --",
    };
  }

  if (key === "A") {
    return {
      ...state,
      mode: "insert",
      cursorCol: currentLine.length,
      statusMessage: "-- INSERT --",
    };
  }

  if (key === "o") {
    const undoState = saveUndoState(state);
    const newLines = [...state.lines];
    newLines.splice(state.cursorRow + 1, 0, "");
    return {
      ...state,
      mode: "insert",
      lines: newLines,
      cursorRow: state.cursorRow + 1,
      cursorCol: 0,
      modified: true,
      ...pushUndo(state, undoState),
    };
  }

  if (key === "O") {
    const undoState = saveUndoState(state);
    const newLines = [...state.lines];
    newLines.splice(state.cursorRow, 0, "");
    return {
      ...state,
      mode: "insert",
      lines: newLines,
      cursorCol: 0,
      modified: true,
      ...pushUndo(state, undoState),
    };
  }

  if (key === ":") {
    return { ...state, mode: "command", commandBuffer: "" };
  }

  return null;
}

export function handleNormalModePaste(
  state: EditorState,
  key: string
): EditorState | null {
  const currentLine = state.lines[state.cursorRow] || "";

  if (key === "p") {
    if (state.yankBuffer.length > 0) {
      const undoState = saveUndoState(state);
      if (state.yankBuffer.length === 1 && !state.yankBuffer[0].includes("\n")) {
        const text = state.yankBuffer[0];
        const newLine =
          currentLine.slice(0, state.cursorCol + 1) +
          text +
          currentLine.slice(state.cursorCol + 1);
        const newLines = [...state.lines];
        newLines[state.cursorRow] = newLine;
        return {
          ...state,
          lines: newLines,
          cursorCol: state.cursorCol + text.length,
          modified: true,
          ...pushUndo(state, undoState),
        };
      } else {
        const newLines = [...state.lines];
        newLines.splice(state.cursorRow + 1, 0, ...state.yankBuffer);
        return {
          ...state,
          lines: newLines,
          cursorRow: state.cursorRow + 1,
          cursorCol: 0,
          modified: true,
          ...pushUndo(state, undoState),
        };
      }
    }
    return state;
  }

  if (key === "P") {
    if (state.yankBuffer.length > 0) {
      const undoState = saveUndoState(state);
      if (state.yankBuffer.length === 1 && !state.yankBuffer[0].includes("\n")) {
        const text = state.yankBuffer[0];
        const newLine =
          currentLine.slice(0, state.cursorCol) + text + currentLine.slice(state.cursorCol);
        const newLines = [...state.lines];
        newLines[state.cursorRow] = newLine;
        return {
          ...state,
          lines: newLines,
          cursorCol: state.cursorCol + text.length - 1,
          modified: true,
          ...pushUndo(state, undoState),
        };
      } else {
        const newLines = [...state.lines];
        newLines.splice(state.cursorRow, 0, ...state.yankBuffer);
        return {
          ...state,
          lines: newLines,
          cursorCol: 0,
          modified: true,
          ...pushUndo(state, undoState),
        };
      }
    }
    return state;
  }

  return null;
}

export function handleNormalModeUndoRedo(
  state: EditorState,
  key: string,
  ctrlKey: boolean
): EditorState | null {
  if (key === "u") {
    const result = undo(state);
    if (result) {
      return { ...state, ...result };
    }
    return { ...state, statusMessage: "Already at oldest change" };
  }

  if (ctrlKey && key === "r") {
    const result = redo(state);
    if (result) {
      return { ...state, ...result };
    }
    return { ...state, statusMessage: "Already at newest change" };
  }

  return null;
}

export function handleNormalMode(
  state: EditorState,
  key: string,
  ctrlKey: boolean
): KeyResult {
  // Handle pending operators first
  if (state.pendingOperator) {
    const result = handleNormalModeOperators(state, key);
    if (result) {
      return { state: result, shouldExit: false };
    }
    return { state: { ...state, pendingOperator: null }, shouldExit: false };
  }

  // Exit with Q in normal mode
  if (key.toLowerCase() === "q") {
    if (!state.modified) {
      return { state, shouldExit: true };
    }
    return {
      state: {
        ...state,
        statusMessage: "E37: No write since last change (add ! to override)",
      },
      shouldExit: false,
    };
  }

  // Try each handler in order
  const handlers = [
    () => handleNormalModeMovement(state, key),
    () => handleNormalModeOperators(state, key),
    () => handleNormalModeEditing(state, key),
    () => handleNormalModeModeSwitch(state, key),
    () => handleNormalModePaste(state, key),
    () => handleNormalModeUndoRedo(state, key, ctrlKey),
  ];

  for (const handler of handlers) {
    const result = handler();
    if (result) {
      return { state: result, shouldExit: false };
    }
  }

  return { state, shouldExit: false };
}
