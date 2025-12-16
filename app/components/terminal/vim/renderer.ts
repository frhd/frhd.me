/**
 * Canvas rendering for the vim editor
 */

import type { EditorState, RenderConfig } from "./types";
import { getFileExtension, highlightLine } from "./syntax";

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  config: RenderConfig;
}

export function setupCanvas(canvas: HTMLCanvasElement): void {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

export function calculateVisibleLines(
  canvasHeight: number,
  config: RenderConfig
): number {
  return Math.floor(
    (canvasHeight - config.padding * 2 - config.lineHeight * 2) / config.lineHeight
  );
}

export function renderEditor(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  state: EditorState,
  config: RenderConfig
): void {
  const { charWidth, lineHeight, padding } = config;
  const lineNumberWidth = state.showLineNumbers ? config.lineNumberWidth : 0;

  const visibleLines = calculateVisibleLines(canvas.height, config);
  const scrollOffset = calculateRenderScrollOffset(state, visibleLines);

  // Clear canvas
  ctx.fillStyle = "#0d1117";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = "16px monospace";

  // Draw lines
  const ext = getFileExtension(state.filename);
  for (let i = 0; i < visibleLines && scrollOffset + i < state.lines.length; i++) {
    const lineIndex = scrollOffset + i;
    const y = padding + (i + 1) * lineHeight;

    // Draw line number
    if (state.showLineNumbers) {
      ctx.fillStyle = "#484f58";
      ctx.fillText(String(lineIndex + 1).padStart(4, " "), padding, y);
    }

    // Draw line content with syntax highlighting
    const line = state.lines[lineIndex];
    highlightLine(ctx, line, padding + lineNumberWidth, y, charWidth, ext);

    // Draw cursor
    if (lineIndex === state.cursorRow) {
      renderCursor(ctx, state, padding + lineNumberWidth, y, charWidth, lineHeight);
    }
  }

  // Draw status bar
  renderStatusBar(ctx, canvas, state, lineHeight, padding);

  // Draw command line
  renderCommandLine(ctx, canvas, state, lineHeight, padding, charWidth);
}

function calculateRenderScrollOffset(state: EditorState, visibleLines: number): number {
  let scrollOffset = state.scrollOffset;

  if (state.cursorRow < scrollOffset) {
    scrollOffset = state.cursorRow;
  } else if (state.cursorRow >= scrollOffset + visibleLines) {
    scrollOffset = state.cursorRow - visibleLines + 1;
  }

  return scrollOffset;
}

function renderCursor(
  ctx: CanvasRenderingContext2D,
  state: EditorState,
  x: number,
  y: number,
  charWidth: number,
  lineHeight: number
): void {
  const cursorX = x + state.cursorCol * charWidth;
  const cursorY = y - lineHeight + 5;

  if (state.mode === "insert") {
    // Thin line cursor in insert mode
    ctx.fillStyle = "#00ff00";
    ctx.fillRect(cursorX, cursorY, 2, lineHeight);
  } else {
    // Block cursor in normal mode
    ctx.fillStyle = "rgba(0, 255, 0, 0.5)";
    ctx.fillRect(cursorX, cursorY, charWidth, lineHeight);
  }
}

function renderStatusBar(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  state: EditorState,
  lineHeight: number,
  padding: number
): void {
  const statusY = canvas.height - lineHeight * 2;

  // Background
  ctx.fillStyle = "#21262d";
  ctx.fillRect(0, statusY, canvas.width, lineHeight);

  // Mode indicator
  const modeColor =
    state.mode === "insert"
      ? "#7ee787"
      : state.mode === "command"
        ? "#79c0ff"
        : "#ff7b72";
  ctx.fillStyle = modeColor;
  ctx.fillText(`-- ${state.mode.toUpperCase()} --`, padding, statusY + 15);

  // Filename and modified flag
  ctx.fillStyle = "#c9d1d9";
  const fileStatus = state.modified ? `${state.filename} [+]` : state.filename;
  ctx.fillText(fileStatus, 150, statusY + 15);

  // Cursor position
  const posText = `${state.cursorRow + 1},${state.cursorCol + 1}`;
  ctx.fillText(posText, canvas.width - 100, statusY + 15);
}

function renderCommandLine(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  state: EditorState,
  lineHeight: number,
  padding: number,
  charWidth: number
): void {
  const cmdY = canvas.height - lineHeight;

  // Background
  ctx.fillStyle = "#0d1117";
  ctx.fillRect(0, cmdY, canvas.width, lineHeight);

  if (state.mode === "command") {
    ctx.fillStyle = "#00ff00";
    ctx.fillText(":" + state.commandBuffer, padding, cmdY + 15);

    // Command cursor
    ctx.fillRect(
      padding + (1 + state.commandBuffer.length) * charWidth,
      cmdY + 2,
      charWidth,
      lineHeight - 4
    );
  } else {
    ctx.fillStyle = "#8b949e";
    ctx.fillText(state.statusMessage, padding, cmdY + 15);
  }
}
