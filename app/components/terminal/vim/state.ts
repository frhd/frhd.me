/**
 * Editor state management for vim
 */

import type { EditorState, UndoState } from "./types";
import { getFileContent } from "./filesystem";

export function createInitialState(filename: string): EditorState {
  const initialLines = getFileContent(filename) || [""];
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
}

export function saveUndoState(state: EditorState): UndoState {
  return {
    lines: [...state.lines],
    cursorRow: state.cursorRow,
    cursorCol: state.cursorCol,
  };
}

export function pushUndo(state: EditorState, undoState: UndoState): Partial<EditorState> {
  return {
    undoStack: [...state.undoStack, undoState],
    redoStack: [],
  };
}

export function undo(state: EditorState): Partial<EditorState> | null {
  if (state.undoStack.length === 0) {
    return null;
  }

  const undoState = state.undoStack[state.undoStack.length - 1];
  const currentState = saveUndoState(state);

  return {
    lines: undoState.lines,
    cursorRow: undoState.cursorRow,
    cursorCol: undoState.cursorCol,
    undoStack: state.undoStack.slice(0, -1),
    redoStack: [...state.redoStack, currentState],
    modified: state.undoStack.length > 1,
    statusMessage: "Undo",
  };
}

export function redo(state: EditorState): Partial<EditorState> | null {
  if (state.redoStack.length === 0) {
    return null;
  }

  const redoState = state.redoStack[state.redoStack.length - 1];
  const currentState = saveUndoState(state);

  return {
    lines: redoState.lines,
    cursorRow: redoState.cursorRow,
    cursorCol: redoState.cursorCol,
    undoStack: [...state.undoStack, currentState],
    redoStack: state.redoStack.slice(0, -1),
    modified: true,
    statusMessage: "Redo",
  };
}

export function calculateScrollOffset(
  state: EditorState,
  visibleLines: number
): number {
  let scrollOffset = state.scrollOffset;

  if (state.cursorRow < scrollOffset) {
    scrollOffset = state.cursorRow;
  } else if (state.cursorRow >= scrollOffset + visibleLines) {
    scrollOffset = state.cursorRow - visibleLines + 1;
  }

  return scrollOffset;
}
