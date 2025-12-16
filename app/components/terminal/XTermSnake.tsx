"use client";

import { useEffect, useRef, useCallback } from "react";
import { unlockAchievement } from "./achievements";
import type { SnakeState, SnakeConfig } from "./games/types";
import {
  createInitialState,
  update,
  setDirection,
  togglePause,
  resetGame,
  getDirectionFromKey,
  getSegmentBrightness,
} from "./games/snake-engine";

interface SnakeProps {
  onComplete: () => void;
}

const GRID_SIZE = 20;

export default function XTermSnake({ onComplete }: SnakeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<SnakeState | null>(null);
  const configRef = useRef<SnakeConfig | null>(null);

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

    // Calculate grid dimensions based on canvas size
    let gridWidth: number;
    let gridHeight: number;
    let cellSize: number;

    const setupCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      cellSize = Math.floor(Math.min(canvas.width, canvas.height) / GRID_SIZE);
      gridWidth = Math.floor(canvas.width / cellSize);
      gridHeight = Math.floor(canvas.height / cellSize);

      // Update config with calculated dimensions
      configRef.current = {
        gridWidth,
        gridHeight,
        initialSpeed: 100,
        speedIncrement: 2,
        minSpeed: 50,
      };
    };

    setupCanvas();

    // Load high score from localStorage
    const savedHighScore = localStorage.getItem("frhd-snake-highscore");

    // Initialize game with calculated config
    gameStateRef.current = createInitialState(configRef.current!);
    if (savedHighScore) {
      gameStateRef.current.highScore = parseInt(savedHighScore, 10);
    }

    const draw = () => {
      const state = gameStateRef.current;
      if (!state) return;

      // Clear canvas
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid (subtle)
      ctx.strokeStyle = "#111111";
      ctx.lineWidth = 1;
      for (let x = 0; x <= gridWidth; x++) {
        ctx.beginPath();
        ctx.moveTo(x * cellSize, 0);
        ctx.lineTo(x * cellSize, gridHeight * cellSize);
        ctx.stroke();
      }
      for (let y = 0; y <= gridHeight; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * cellSize);
        ctx.lineTo(gridWidth * cellSize, y * cellSize);
        ctx.stroke();
      }

      // Draw snake
      state.snake.forEach((segment, index) => {
        const brightness = getSegmentBrightness(index);
        ctx.fillStyle = `rgb(0, ${Math.floor(255 * brightness)}, 0)`;
        ctx.fillRect(
          segment.x * cellSize + 1,
          segment.y * cellSize + 1,
          cellSize - 2,
          cellSize - 2
        );

        // Draw eyes on head
        if (index === 0) {
          ctx.fillStyle = "#000000";
          const eyeSize = cellSize / 6;
          const eyeOffset = cellSize / 4;
          ctx.fillRect(
            segment.x * cellSize + eyeOffset,
            segment.y * cellSize + eyeOffset,
            eyeSize,
            eyeSize
          );
          ctx.fillRect(
            segment.x * cellSize + cellSize - eyeOffset - eyeSize,
            segment.y * cellSize + eyeOffset,
            eyeSize,
            eyeSize
          );
        }
      });

      // Draw food
      ctx.fillStyle = "#ff0000";
      ctx.beginPath();
      ctx.arc(
        state.food.x * cellSize + cellSize / 2,
        state.food.y * cellSize + cellSize / 2,
        cellSize / 2 - 2,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Draw score
      ctx.fillStyle = "#00ff00";
      ctx.font = "20px monospace";
      ctx.fillText(`Score: ${state.score}`, 20, 30);
      ctx.fillText(`High Score: ${state.highScore}`, 20, 55);

      // Draw game over screen
      if (state.gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#ff0000";
        ctx.font = "48px monospace";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 40);

        ctx.fillStyle = "#00ff00";
        ctx.font = "24px monospace";
        ctx.fillText(`Final Score: ${state.score}`, canvas.width / 2, canvas.height / 2 + 10);

        if (state.score >= state.highScore && state.score > 0) {
          ctx.fillStyle = "#ffff00";
          ctx.fillText("NEW HIGH SCORE!", canvas.width / 2, canvas.height / 2 + 50);
        }

        ctx.fillStyle = "#888888";
        ctx.font = "18px monospace";
        ctx.fillText("Press SPACE to restart or Q/ESC to exit", canvas.width / 2, canvas.height / 2 + 100);
        ctx.textAlign = "left";
      }

      // Draw pause screen
      if (state.isPaused && !state.gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#00ff00";
        ctx.font = "48px monospace";
        ctx.textAlign = "center";
        ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2);
        ctx.font = "18px monospace";
        ctx.fillText("Press SPACE to continue", canvas.width / 2, canvas.height / 2 + 40);
        ctx.textAlign = "left";
      }
    };

    // Keyboard handler
    const handleKeyDown = (event: KeyboardEvent) => {
      const state = gameStateRef.current;
      const config = configRef.current;
      if (!state || !config) return;

      // Exit on Q or ESC
      if (event.key.toLowerCase() === "q" || event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        handleComplete();
        return;
      }

      // Space to restart or toggle pause
      if (event.key === " ") {
        event.preventDefault();
        if (state.gameOver) {
          resetGame(state, config);
        } else {
          togglePause(state);
        }
        return;
      }

      // Direction controls
      const newDirection = getDirectionFromKey(event.key);
      if (newDirection) {
        setDirection(state, newDirection);
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);

    // Handle resize
    const handleResize = () => {
      setupCanvas();
      // Reinitialize game with new dimensions
      if (gameStateRef.current && configRef.current) {
        const highScore = gameStateRef.current.highScore;
        gameStateRef.current = createInitialState(configRef.current);
        gameStateRef.current.highScore = highScore;
      }
    };
    window.addEventListener("resize", handleResize);

    // Game loop
    let lastUpdate = 0;
    let animationId: number;

    const gameLoop = (timestamp: number) => {
      const state = gameStateRef.current;
      const config = configRef.current;
      if (!state || !config) {
        animationId = requestAnimationFrame(gameLoop);
        return;
      }

      if (timestamp - lastUpdate >= state.speed) {
        const result = update(state, config);
        if (result.newHighScore) {
          localStorage.setItem("frhd-snake-highscore", state.highScore.toString());
          unlockAchievement("high_scorer");
        }
        lastUpdate = timestamp;
      }

      draw();
      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      document.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [handleComplete]);

  return (
    <div ref={containerRef} tabIndex={-1} style={{ position: "fixed", inset: 0, zIndex: 50, backgroundColor: "black", outline: "none" }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      <div style={{ position: "absolute", top: "1rem", left: "50%", transform: "translateX(-50%)", color: "#22c55e", fontSize: "0.875rem", fontFamily: "monospace" }}>
        Arrow keys or WASD to move | SPACE to pause | Q or ESC to exit
      </div>
    </div>
  );
}
