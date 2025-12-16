/**
 * Vim editor type definitions
 */

export type VimMode = "normal" | "insert" | "command" | "visual";

export interface UndoState {
  lines: string[];
  cursorRow: number;
  cursorCol: number;
}

export interface EditorState {
  lines: string[];
  cursorRow: number;
  cursorCol: number;
  mode: VimMode;
  commandBuffer: string;
  statusMessage: string;
  showLineNumbers: boolean;
  modified: boolean;
  filename: string;
  undoStack: UndoState[];
  redoStack: UndoState[];
  scrollOffset: number;
  pendingOperator: string | null;
  yankBuffer: string[];
  lastSearchPattern: string;
}

export interface VimProps {
  onComplete: () => void;
  filename?: string;
}

export interface SyntaxPattern {
  pattern: RegExp;
  color: string;
}

export interface ColorRange {
  start: number;
  end: number;
  color: string;
}

export interface RenderConfig {
  charWidth: number;
  lineHeight: number;
  padding: number;
  lineNumberWidth: number;
}

export const DEFAULT_RENDER_CONFIG: RenderConfig = {
  charWidth: 10,
  lineHeight: 20,
  padding: 10,
  lineNumberWidth: 50,
};

export interface CommandResult {
  newState?: Partial<EditorState>;
  message?: string;
  shouldExit?: boolean;
}
