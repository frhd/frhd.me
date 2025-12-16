"use client";

import { useEffect, useRef, useCallback } from "react";
import { unlockAchievement } from "./achievements";
import type { TetrisState } from "./games/types";
import {
  createInitialState,
  movePiece,
  rotatePiece,
  hardDrop,
  getGhostY,
  resetGame,
  togglePause,
  DEFAULT_CONFIG,
} from "./games/tetris-engine";

interface TetrisProps {
  onComplete: () => void;
}

const CELL_SIZE = 30;

export default function XTermTetris({ onComplete }: TetrisProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<TetrisState>(createInitialState());

  const handleComplete = useCallback(() => {
    onComplete?.();
  }, [onComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const config = DEFAULT_CONFIG;

    // Load high score
    const savedHighScore = localStorage.getItem("frhd-tetris-highscore");
    if (savedHighScore) {
      gameStateRef.current.highScore = parseInt(savedHighScore, 10);
    }

    // Setup canvas
    const boardPixelWidth = config.boardWidth * CELL_SIZE;
    const boardPixelHeight = config.boardHeight * CELL_SIZE;
    const sidebarWidth = 200;

    canvas.width = boardPixelWidth + sidebarWidth + 40;
    canvas.height = boardPixelHeight + 40;

    const offsetX = 20;
    const offsetY = 20;

    const drawCell = (x: number, y: number, color: string, isGhost = false) => {
      const px = offsetX + x * CELL_SIZE;
      const py = offsetY + y * CELL_SIZE;

      if (isGhost) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(px + 2, py + 2, CELL_SIZE - 4, CELL_SIZE - 4);
      } else {
        ctx.fillStyle = color;
        ctx.fillRect(px + 1, py + 1, CELL_SIZE - 2, CELL_SIZE - 2);

        // 3D effect
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.fillRect(px + 1, py + 1, CELL_SIZE - 2, 3);
        ctx.fillRect(px + 1, py + 1, 3, CELL_SIZE - 2);

        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.fillRect(px + 1, py + CELL_SIZE - 4, CELL_SIZE - 2, 3);
        ctx.fillRect(px + CELL_SIZE - 4, py + 1, 3, CELL_SIZE - 2);
      }
    };

    const draw = () => {
      const state = gameStateRef.current;

      // Clear canvas
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw board border
      ctx.strokeStyle = "#00ff00";
      ctx.lineWidth = 2;
      ctx.strokeRect(offsetX - 2, offsetY - 2, boardPixelWidth + 4, boardPixelHeight + 4);

      // Draw board
      for (let y = 0; y < config.boardHeight; y++) {
        for (let x = 0; x < config.boardWidth; x++) {
          const cell = state.board[y][x];
          if (cell) {
            drawCell(x, y, cell);
          } else {
            // Draw grid
            ctx.fillStyle = "#111111";
            ctx.fillRect(
              offsetX + x * CELL_SIZE + 1,
              offsetY + y * CELL_SIZE + 1,
              CELL_SIZE - 2,
              CELL_SIZE - 2
            );
          }
        }
      }

      // Draw ghost piece
      if (state.currentPiece && !state.gameOver) {
        const ghostY = getGhostY(state);

        for (let y = 0; y < state.currentPiece.shape.length; y++) {
          for (let x = 0; x < state.currentPiece.shape[y].length; x++) {
            if (state.currentPiece.shape[y][x]) {
              const drawY = ghostY + y;
              if (drawY >= 0) {
                drawCell(state.currentPiece.x + x, drawY, state.currentPiece.color, true);
              }
            }
          }
        }
      }

      // Draw current piece
      if (state.currentPiece && !state.gameOver) {
        for (let y = 0; y < state.currentPiece.shape.length; y++) {
          for (let x = 0; x < state.currentPiece.shape[y].length; x++) {
            if (state.currentPiece.shape[y][x]) {
              const drawY = state.currentPiece.y + y;
              if (drawY >= 0) {
                drawCell(state.currentPiece.x + x, drawY, state.currentPiece.color);
              }
            }
          }
        }
      }

      // Draw sidebar
      const sidebarX = offsetX + boardPixelWidth + 20;

      ctx.fillStyle = "#00ff00";
      ctx.font = "bold 24px monospace";
      ctx.fillText("TETRIS", sidebarX, offsetY + 30);

      ctx.font = "16px monospace";
      ctx.fillText(`Score: ${state.score}`, sidebarX, offsetY + 70);
      ctx.fillText(`High: ${state.highScore}`, sidebarX, offsetY + 95);
      ctx.fillText(`Level: ${state.level}`, sidebarX, offsetY + 120);
      ctx.fillText(`Lines: ${state.lines}`, sidebarX, offsetY + 145);

      // Draw next piece preview
      ctx.fillText("Next:", sidebarX, offsetY + 190);
      if (state.nextPiece) {
        const previewScale = 20;
        const previewX = sidebarX;
        const previewY = offsetY + 210;

        for (let y = 0; y < state.nextPiece.shape.length; y++) {
          for (let x = 0; x < state.nextPiece.shape[y].length; x++) {
            if (state.nextPiece.shape[y][x]) {
              ctx.fillStyle = state.nextPiece.color;
              ctx.fillRect(
                previewX + x * previewScale,
                previewY + y * previewScale,
                previewScale - 2,
                previewScale - 2
              );
            }
          }
        }
      }

      // Draw game over
      if (state.gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.fillRect(offsetX, offsetY, boardPixelWidth, boardPixelHeight);

        ctx.fillStyle = "#ff0000";
        ctx.font = "bold 36px monospace";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", offsetX + boardPixelWidth / 2, offsetY + boardPixelHeight / 2 - 30);

        ctx.fillStyle = "#00ff00";
        ctx.font = "18px monospace";
        ctx.fillText(`Score: ${state.score}`, offsetX + boardPixelWidth / 2, offsetY + boardPixelHeight / 2 + 10);

        if (state.score >= state.highScore && state.score > 0) {
          ctx.fillStyle = "#ffff00";
          ctx.fillText("NEW HIGH SCORE!", offsetX + boardPixelWidth / 2, offsetY + boardPixelHeight / 2 + 40);
        }

        ctx.fillStyle = "#888888";
        ctx.font = "14px monospace";
        ctx.fillText("SPACE to restart", offsetX + boardPixelWidth / 2, offsetY + boardPixelHeight / 2 + 80);
        ctx.fillText("Q/ESC to exit", offsetX + boardPixelWidth / 2, offsetY + boardPixelHeight / 2 + 100);
        ctx.textAlign = "left";
      }

      // Draw pause
      if (state.isPaused && !state.gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(offsetX, offsetY, boardPixelWidth, boardPixelHeight);

        ctx.fillStyle = "#00ff00";
        ctx.font = "bold 36px monospace";
        ctx.textAlign = "center";
        ctx.fillText("PAUSED", offsetX + boardPixelWidth / 2, offsetY + boardPixelHeight / 2);
        ctx.font = "16px monospace";
        ctx.fillText("Press SPACE to continue", offsetX + boardPixelWidth / 2, offsetY + boardPixelHeight / 2 + 30);
        ctx.textAlign = "left";
      }
    };

    // Keyboard handler
    const handleKeyDown = (event: KeyboardEvent) => {
      const state = gameStateRef.current;

      if (event.key.toLowerCase() === "q" || event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        handleComplete();
        return;
      }

      if (event.key === " ") {
        event.preventDefault();
        if (state.gameOver) {
          resetGame(state, config);
        } else {
          togglePause(state);
        }
        return;
      }

      if (state.gameOver || state.isPaused) return;

      switch (event.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          event.preventDefault();
          movePiece(state, -1, 0, config);
          break;
        case "ArrowRight":
        case "d":
        case "D":
          event.preventDefault();
          movePiece(state, 1, 0, config);
          break;
        case "ArrowDown":
        case "s":
        case "S":
          event.preventDefault();
          const softDropResult = movePiece(state, 0, 1, config);
          if (softDropResult.moved) {
            state.score += 1;
          }
          if (softDropResult.newHighScore) {
            localStorage.setItem("frhd-tetris-highscore", state.highScore.toString());
            unlockAchievement("high_scorer");
          }
          break;
        case "ArrowUp":
        case "w":
        case "W":
          event.preventDefault();
          rotatePiece(state);
          break;
        case "Enter":
          event.preventDefault();
          const dropResult = hardDrop(state, config);
          if (dropResult.newHighScore) {
            localStorage.setItem("frhd-tetris-highscore", state.highScore.toString());
            unlockAchievement("high_scorer");
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);

    // Game loop
    let lastDrop = 0;
    let animationId: number;

    const gameLoop = (timestamp: number) => {
      const state = gameStateRef.current;

      if (!state.gameOver && !state.isPaused && timestamp - lastDrop >= state.dropSpeed) {
        const result = movePiece(state, 0, 1, config);
        if (result.newHighScore) {
          localStorage.setItem("frhd-tetris-highscore", state.highScore.toString());
          unlockAchievement("high_scorer");
        }
        lastDrop = timestamp;
      }

      draw();
      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationId);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [handleComplete]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, backgroundColor: "black", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <canvas ref={canvasRef} />
      <div style={{ position: "absolute", bottom: "1rem", color: "#22c55e", fontSize: "0.875rem", fontFamily: "monospace", textAlign: "center" }}>
        Arrow keys or WASD to move | UP/W to rotate | ENTER to hard drop | SPACE to pause | Q/ESC to exit
      </div>
    </div>
  );
}
