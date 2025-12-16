"use client";

import { useEffect, useRef, useCallback } from "react";
import { unlockAchievement } from "./achievements";

interface Game2048Props {
  onComplete: () => void;
}

const GRID_SIZE = 4;
const CELL_SIZE = 100;
const CELL_GAP = 10;
const BOARD_PADDING = 10;

const TILE_COLORS: Record<number, { bg: string; text: string }> = {
  0: { bg: "#1a1a2e", text: "#1a1a2e" },
  2: { bg: "#3d3d5c", text: "#ffffff" },
  4: { bg: "#4a4a6a", text: "#ffffff" },
  8: { bg: "#f2b179", text: "#ffffff" },
  16: { bg: "#f59563", text: "#ffffff" },
  32: { bg: "#f67c5f", text: "#ffffff" },
  64: { bg: "#f65e3b", text: "#ffffff" },
  128: { bg: "#edcf72", text: "#ffffff" },
  256: { bg: "#edcc61", text: "#ffffff" },
  512: { bg: "#edc850", text: "#ffffff" },
  1024: { bg: "#edc53f", text: "#ffffff" },
  2048: { bg: "#edc22e", text: "#ffffff" },
  4096: { bg: "#3c3a32", text: "#ffffff" },
  8192: { bg: "#3c3a32", text: "#ffffff" },
};

export default function XTerm2048({ onComplete }: Game2048Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef({
    grid: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]] as number[][],
    score: 0,
    highScore: 0,
    gameOver: false,
    won: false,
    continueAfterWin: false,
  });

  const handleComplete = useCallback(() => {
    onComplete?.();
  }, [onComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Load high score
    const savedHighScore = localStorage.getItem("frhd-2048-highscore");
    if (savedHighScore) {
      gameStateRef.current.highScore = parseInt(savedHighScore, 10);
    }

    // Setup canvas
    const boardSize = GRID_SIZE * CELL_SIZE + (GRID_SIZE + 1) * CELL_GAP + BOARD_PADDING * 2;
    canvas.width = boardSize + 200; // Extra space for sidebar
    canvas.height = boardSize + 60;

    const offsetX = BOARD_PADDING;
    const offsetY = 50;

    const createEmptyGrid = (): number[][] => {
      return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
    };

    const getEmptyCells = (grid: number[][]): { row: number; col: number }[] => {
      const empty: { row: number; col: number }[] = [];
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          if (grid[row][col] === 0) {
            empty.push({ row, col });
          }
        }
      }
      return empty;
    };

    const addRandomTile = (grid: number[][]) => {
      const empty = getEmptyCells(grid);
      if (empty.length === 0) return;

      const { row, col } = empty[Math.floor(Math.random() * empty.length)];
      grid[row][col] = Math.random() < 0.9 ? 2 : 4;
    };

    const initGame = () => {
      const state = gameStateRef.current;
      state.grid = createEmptyGrid();
      state.score = 0;
      state.gameOver = false;
      state.won = false;
      state.continueAfterWin = false;
      addRandomTile(state.grid);
      addRandomTile(state.grid);
    };

    const canMove = (grid: number[][]): boolean => {
      // Check for empty cells
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          if (grid[row][col] === 0) return true;
        }
      }
      // Check for mergeable adjacent cells
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          const val = grid[row][col];
          if (
            (row < GRID_SIZE - 1 && grid[row + 1][col] === val) ||
            (col < GRID_SIZE - 1 && grid[row][col + 1] === val)
          ) {
            return true;
          }
        }
      }
      return false;
    };

    const slideRow = (row: number[]): { newRow: number[]; score: number } => {
      // Remove zeros
      const filtered = row.filter(x => x !== 0);
      let score = 0;
      const merged: number[] = [];

      let i = 0;
      while (i < filtered.length) {
        if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
          // Merge
          const mergedValue = filtered[i] * 2;
          merged.push(mergedValue);
          score += mergedValue;
          i += 2;
        } else {
          merged.push(filtered[i]);
          i++;
        }
      }

      // Pad with zeros
      while (merged.length < GRID_SIZE) {
        merged.push(0);
      }

      return { newRow: merged, score };
    };

    const move = (direction: "up" | "down" | "left" | "right"): boolean => {
      const state = gameStateRef.current;
      if (state.gameOver || (state.won && !state.continueAfterWin)) return false;

      const oldGrid = state.grid.map(row => [...row]);
      let totalScore = 0;

      if (direction === "left") {
        for (let row = 0; row < GRID_SIZE; row++) {
          const { newRow, score } = slideRow(state.grid[row]);
          state.grid[row] = newRow;
          totalScore += score;
        }
      } else if (direction === "right") {
        for (let row = 0; row < GRID_SIZE; row++) {
          const { newRow, score } = slideRow([...state.grid[row]].reverse());
          state.grid[row] = newRow.reverse();
          totalScore += score;
        }
      } else if (direction === "up") {
        for (let col = 0; col < GRID_SIZE; col++) {
          const column = state.grid.map(row => row[col]);
          const { newRow, score } = slideRow(column);
          for (let row = 0; row < GRID_SIZE; row++) {
            state.grid[row][col] = newRow[row];
          }
          totalScore += score;
        }
      } else if (direction === "down") {
        for (let col = 0; col < GRID_SIZE; col++) {
          const column = state.grid.map(row => row[col]).reverse();
          const { newRow, score } = slideRow(column);
          const reversed = newRow.reverse();
          for (let row = 0; row < GRID_SIZE; row++) {
            state.grid[row][col] = reversed[row];
          }
          totalScore += score;
        }
      }

      // Check if anything changed
      const changed = !state.grid.every((row, i) =>
        row.every((val, j) => val === oldGrid[i][j])
      );

      if (changed) {
        state.score += totalScore;
        addRandomTile(state.grid);

        // Check for win
        if (!state.won && state.grid.some(row => row.some(val => val >= 2048))) {
          state.won = true;
        }

        // Check for game over
        if (!canMove(state.grid)) {
          state.gameOver = true;
          if (state.score > state.highScore) {
            state.highScore = state.score;
            localStorage.setItem("frhd-2048-highscore", state.highScore.toString());
            // Unlock high_scorer achievement
            unlockAchievement("high_scorer");
          }
        }
      }

      return changed;
    };

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
      const sidebarX = offsetX + GRID_SIZE * (CELL_SIZE + CELL_GAP) + CELL_GAP + 30;
      ctx.fillStyle = "#ffffff";
      ctx.font = "16px monospace";
      ctx.fillText(`Score: ${state.score}`, sidebarX, offsetY + 30);
      ctx.fillText(`Best: ${state.highScore}`, sidebarX, offsetY + 55);

      // Draw board background
      drawRoundedRect(
        offsetX,
        offsetY,
        GRID_SIZE * (CELL_SIZE + CELL_GAP) + CELL_GAP,
        GRID_SIZE * (CELL_SIZE + CELL_GAP) + CELL_GAP,
        8,
        "#16213e"
      );

      // Draw cells
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          const value = state.grid[row][col];
          const x = offsetX + CELL_GAP + col * (CELL_SIZE + CELL_GAP);
          const y = offsetY + CELL_GAP + row * (CELL_SIZE + CELL_GAP);

          const colors = TILE_COLORS[value] || TILE_COLORS[4096];
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

      // Win screen
      if (state.won && !state.continueAfterWin) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(offsetX, offsetY, GRID_SIZE * (CELL_SIZE + CELL_GAP) + CELL_GAP, GRID_SIZE * (CELL_SIZE + CELL_GAP) + CELL_GAP);

        ctx.fillStyle = "#ffff00";
        ctx.font = "bold 36px monospace";
        ctx.textAlign = "center";
        ctx.fillText("YOU WIN!", offsetX + (GRID_SIZE * (CELL_SIZE + CELL_GAP) + CELL_GAP) / 2, offsetY + 180);

        ctx.fillStyle = "#ffffff";
        ctx.font = "18px monospace";
        ctx.fillText("Press ENTER to continue", offsetX + (GRID_SIZE * (CELL_SIZE + CELL_GAP) + CELL_GAP) / 2, offsetY + 220);
        ctx.fillText("or SPACE to restart", offsetX + (GRID_SIZE * (CELL_SIZE + CELL_GAP) + CELL_GAP) / 2, offsetY + 245);
        ctx.textAlign = "left";
      }

      // Game over screen
      if (state.gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(offsetX, offsetY, GRID_SIZE * (CELL_SIZE + CELL_GAP) + CELL_GAP, GRID_SIZE * (CELL_SIZE + CELL_GAP) + CELL_GAP);

        ctx.fillStyle = "#ff0000";
        ctx.font = "bold 36px monospace";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", offsetX + (GRID_SIZE * (CELL_SIZE + CELL_GAP) + CELL_GAP) / 2, offsetY + 180);

        ctx.fillStyle = "#00ff00";
        ctx.font = "20px monospace";
        ctx.fillText(`Score: ${state.score}`, offsetX + (GRID_SIZE * (CELL_SIZE + CELL_GAP) + CELL_GAP) / 2, offsetY + 220);

        if (state.score >= state.highScore && state.score > 0) {
          ctx.fillStyle = "#ffff00";
          ctx.font = "16px monospace";
          ctx.fillText("NEW HIGH SCORE!", offsetX + (GRID_SIZE * (CELL_SIZE + CELL_GAP) + CELL_GAP) / 2, offsetY + 250);
        }

        ctx.fillStyle = "#888888";
        ctx.font = "14px monospace";
        ctx.fillText("SPACE to restart | Q/ESC to exit", offsetX + (GRID_SIZE * (CELL_SIZE + CELL_GAP) + CELL_GAP) / 2, offsetY + 290);
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
        initGame();
        return;
      }

      if (event.key === "Enter" && state.won && !state.continueAfterWin) {
        event.preventDefault();
        state.continueAfterWin = true;
        return;
      }

      if (state.gameOver || (state.won && !state.continueAfterWin)) return;

      let direction: "up" | "down" | "left" | "right" | null = null;

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
        move(direction);
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);

    // Initialize
    initGame();

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
    <div style={{ position: "fixed", inset: 0, zIndex: 50, backgroundColor: "black", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <canvas ref={canvasRef} />
      <div style={{ position: "absolute", bottom: "1rem", color: "#22c55e", fontSize: "0.875rem", fontFamily: "monospace" }}>
        Arrow keys or WASD to move | SPACE to restart | Q/ESC to exit
      </div>
    </div>
  );
}
