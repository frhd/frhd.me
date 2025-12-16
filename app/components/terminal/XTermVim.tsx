"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { VimProps, EditorState } from "./vim/types";
import { DEFAULT_RENDER_CONFIG } from "./vim/types";
import { createInitialState, calculateScrollOffset } from "./vim/state";
import { renderEditor, setupCanvas, calculateVisibleLines } from "./vim/renderer";
import { handleInsertMode, handleNormalMode } from "./vim/keybindings";
import { handleCommandMode } from "./vim/commands";

export default function XTermVim({ onComplete, filename = "readme.txt" }: VimProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<EditorState>(() => createInitialState(filename));

  const handleComplete = useCallback(() => {
    onComplete?.();
  }, [onComplete]);

  // Render effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setupCanvas(canvas);

    const config = {
      ...DEFAULT_RENDER_CONFIG,
      lineNumberWidth: state.showLineNumbers ? DEFAULT_RENDER_CONFIG.lineNumberWidth : 0,
    };

    renderEditor(ctx, canvas, state, config);

    // Update scroll offset if needed
    const visibleLines = calculateVisibleLines(canvas.height, config);
    const newScrollOffset = calculateScrollOffset(state, visibleLines);

    if (newScrollOffset !== state.scrollOffset) {
      setState((prev) => ({ ...prev, scrollOffset: newScrollOffset }));
    }
  }, [state]);

  // Keyboard event handling
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();

      const key = event.key;

      // Handle Escape globally
      if (key === "Escape") {
        setState((prev) => {
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
        });
        return;
      }

      setState((prev) => {
        // Command mode
        if (prev.mode === "command") {
          const result = handleCommandMode(prev, key);
          if (result.shouldExit) {
            handleComplete();
            return prev;
          }
          return result.state;
        }

        // Insert mode
        if (prev.mode === "insert") {
          return handleInsertMode(prev, key);
        }

        // Normal mode
        if (prev.mode === "normal") {
          const result = handleNormalMode(prev, key, event.ctrlKey);
          if (result.shouldExit) {
            handleComplete();
            return prev;
          }
          return result.state;
        }

        return prev;
      });
    };

    document.addEventListener("keydown", handleKeyDown, true);

    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        setupCanvas(canvas);
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [handleComplete]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, backgroundColor: "black" }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      <div
        style={{
          position: "absolute",
          top: "0.5rem",
          right: "1rem",
          color: "#6b7280",
          fontSize: "0.75rem",
          fontFamily: "monospace",
        }}
      >
        Press ESC for normal mode | :q to quit | :help for commands
      </div>
    </div>
  );
}
