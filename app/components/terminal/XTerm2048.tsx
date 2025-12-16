"use client";

import { useEffect, useRef, useCallback } from "react";
import { unlockAchievement } from "./achievements";
import type { Game2048State, MoveDirection } from "./games/types";
import {
  createInitialState,
  move,
  continueAfterWin,
  resetGame,
  getTileColor,
  DEFAULT_CONFIG,
} from "./games/game-2048-engine";

interface Game2048Props {
  onComplete: () => void;
}

const CELL_SIZE = 100;
const CELL_GAP = 10;
const BOARD_PADDING = 10;

export default function XTerm2048({ onComplete }: Game2048Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<Game2048State>(createInitialState());

  // Focus the container on mount to capture keyboard events
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

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
    const savedHighScore = localStorage.getItem("frhd-2048-highscore");
    if (savedHighScore) {
      gameStateRef.current.highScore = parseInt(savedHighScore, 10);
    }

    // Setup canvas
    const boardSize = config.gridSize * CELL_SIZE + (config.gridSize + 1) * CELL_GAP + BOARD_PADDING * 2;
    canvas.width = boardSize + 200; // Extra space for sidebar
    canvas.height = boardSize + 60;

    const offsetX = BOARD_PADDING;
    const offsetY = 50;

    const drawRoundedRect = (
      x: number,
      y: number,
      width: number,
      height: number,
      radius: number,
      fill: string
    ) => {
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.fill();
    };

    const draw = () => {
      const state = gameStateRef.current;

      // Clear
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Title
      ctx.fillStyle = "#00ff00";
      ctx.font = "bold 32px monospace";
      ctx.fillText("2048", offsetX, 35);

      // Score
      const sidebarX = offsetX + config.gridSize * (CELL_SIZE + CELL_GAP) + CELL_GAP + 30;
      ctx.fillStyle = "#ffffff";
      ctx.font = "16px monospace";
      ctx.fillText(`Score: ${state.score}`, sidebarX, offsetY + 30);
      ctx.fillText(`Best: ${state.highScore}`, sidebarX, offsetY + 55);

      // Draw board background
      drawRoundedRect(
        offsetX,
        offsetY,
        config.gridSize * (CELL_SIZE + CELL_GAP) + CELL_GAP,
        config.gridSize * (CELL_SIZE + CELL_GAP) + CELL_GAP,
        8,
        "#16213e"
      );

      // Draw cells
      for (let row = 0; row < config.gridSize; row++) {
        for (let col = 0; col < config.gridSize; col++) {
          const value = state.grid[row][col];
          const x = offsetX + CELL_GAP + col * (CELL_SIZE + CELL_GAP);
          const y = offsetY + CELL_GAP + row * (CELL_SIZE + CELL_GAP);

          const colors = getTileColor(value);
          drawRoundedRect(x, y, CELL_SIZE, CELL_SIZE, 4, colors.bg);

          if (value > 0) {
            ctx.fillStyle = colors.text;
            ctx.font = value >= 1000 ? "bold 28px monospace" : "bold 36px monospace";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(value.toString(), x + CELL_SIZE / 2, y + CELL_SIZE / 2);
            ctx.textAlign = "left";
            ctx.textBaseline = "alphabetic";
          }
        }
      }

      // Instructions
      ctx.fillStyle = "#666666";
      ctx.font = "12px monospace";
      ctx.fillText("Arrow keys to move", sidebarX, offsetY + 100);
      ctx.fillText("SPACE to restart", sidebarX, offsetY + 120);
      ctx.fillText("Q/ESC to exit", sidebarX, offsetY + 140);

      const boardWidth = config.gridSize * (CELL_SIZE + CELL_GAP) + CELL_GAP;

      // Win screen
      if (state.won && !state.continueAfterWin) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(offsetX, offsetY, boardWidth, boardWidth);

        ctx.fillStyle = "#ffff00";
        ctx.font = "bold 36px monospace";
        ctx.textAlign = "center";
        ctx.fillText("YOU WIN!", offsetX + boardWidth / 2, offsetY + 180);

        ctx.fillStyle = "#ffffff";
        ctx.font = "18px monospace";
        ctx.fillText("Press ENTER to continue", offsetX + boardWidth / 2, offsetY + 220);
        ctx.fillText("or SPACE to restart", offsetX + boardWidth / 2, offsetY + 245);
        ctx.textAlign = "left";
      }

      // Game over screen
      if (state.gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(offsetX, offsetY, boardWidth, boardWidth);

        ctx.fillStyle = "#ff0000";
        ctx.font = "bold 36px monospace";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", offsetX + boardWidth / 2, offsetY + 180);

        ctx.fillStyle = "#00ff00";
        ctx.font = "20px monospace";
        ctx.fillText(`Score: ${state.score}`, offsetX + boardWidth / 2, offsetY + 220);

        if (state.score >= state.highScore && state.score > 0) {
          ctx.fillStyle = "#ffff00";
          ctx.font = "16px monospace";
          ctx.fillText("NEW HIGH SCORE!", offsetX + boardWidth / 2, offsetY + 250);
        }

        ctx.fillStyle = "#888888";
        ctx.font = "14px monospace";
        ctx.fillText("SPACE to restart | Q/ESC to exit", offsetX + boardWidth / 2, offsetY + 290);
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
        resetGame(state, config);
        return;
      }

      if (event.key === "Enter" && state.won && !state.continueAfterWin) {
        event.preventDefault();
        continueAfterWin(state);
        return;
      }

      if (state.gameOver || (state.won && !state.continueAfterWin)) return;

      let direction: MoveDirection | null = null;

      switch (event.key) {
        case "ArrowUp":
        case "w":
        case "W":
          direction = "up";
          break;
        case "ArrowDown":
        case "s":
        case "S":
          direction = "down";
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          direction = "left";
          break;
        case "ArrowRight":
        case "d":
        case "D":
          direction = "right";
          break;
      }

      if (direction) {
        event.preventDefault();
        const result = move(state, direction);
        if (result.newHighScore) {
          localStorage.setItem("frhd-2048-highscore", state.highScore.toString());
          unlockAchievement("high_scorer");
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);

    // Animation loop
    let animationId: number;
    const gameLoop = () => {
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
    <div ref={containerRef} tabIndex={-1} style={{ position: "fixed", inset: 0, zIndex: 50, backgroundColor: "black", display: "flex", alignItems: "center", justifyContent: "center", outline: "none" }}>
      <canvas ref={canvasRef} />
      <div style={{ position: "absolute", bottom: "1rem", color: "#22c55e", fontSize: "0.875rem", fontFamily: "monospace" }}>
        Arrow keys or WASD to move | SPACE to restart | Q/ESC to exit
      </div>
    </div>
  );
}
