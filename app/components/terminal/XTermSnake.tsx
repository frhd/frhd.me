"use client";

import { useEffect, useRef, useCallback } from "react";

interface SnakeProps {
  onComplete: () => void;
}

interface Point {
  x: number;
  y: number;
}

const GRID_SIZE = 20;
const INITIAL_SPEED = 100;
const SPEED_INCREMENT = 2;
const MIN_SPEED = 50;

export default function XTermSnake({ onComplete }: SnakeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef({
    snake: [{ x: 10, y: 10 }] as Point[],
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 },
    food: { x: 15, y: 10 } as Point,
    score: 0,
    highScore: 0,
    gameOver: false,
    isPaused: false,
    speed: INITIAL_SPEED,
  });

  const handleComplete = useCallback(() => {
    onComplete?.();
  }, [onComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Load high score from localStorage
    const savedHighScore = localStorage.getItem("frhd-snake-highscore");
    if (savedHighScore) {
      gameStateRef.current.highScore = parseInt(savedHighScore, 10);
    }

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
    };

    setupCanvas();

    // Initialize snake in the middle
    const initGame = () => {
      const startX = Math.floor(gridWidth / 2);
      const startY = Math.floor(gridHeight / 2);
      gameStateRef.current.snake = [
        { x: startX, y: startY },
        { x: startX - 1, y: startY },
        { x: startX - 2, y: startY },
      ];
      gameStateRef.current.direction = { x: 1, y: 0 };
      gameStateRef.current.nextDirection = { x: 1, y: 0 };
      gameStateRef.current.score = 0;
      gameStateRef.current.gameOver = false;
      gameStateRef.current.isPaused = false;
      gameStateRef.current.speed = INITIAL_SPEED;
      spawnFood();
    };

    const spawnFood = () => {
      const state = gameStateRef.current;
      let newFood: Point;
      do {
        newFood = {
          x: Math.floor(Math.random() * gridWidth),
          y: Math.floor(Math.random() * gridHeight),
        };
      } while (state.snake.some((s) => s.x === newFood.x && s.y === newFood.y));
      state.food = newFood;
    };

    const checkCollision = (head: Point): boolean => {
      const state = gameStateRef.current;
      // Wall collision
      if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
        return true;
      }
      // Self collision (skip the head itself)
      for (let i = 1; i < state.snake.length; i++) {
        if (state.snake[i].x === head.x && state.snake[i].y === head.y) {
          return true;
        }
      }
      return false;
    };

    const update = () => {
      const state = gameStateRef.current;
      if (state.gameOver || state.isPaused) return;

      // Apply the queued direction
      state.direction = { ...state.nextDirection };

      // Calculate new head position
      const head = state.snake[0];
      const newHead: Point = {
        x: head.x + state.direction.x,
        y: head.y + state.direction.y,
      };

      // Check collision
      if (checkCollision(newHead)) {
        state.gameOver = true;
        // Save high score
        if (state.score > state.highScore) {
          state.highScore = state.score;
          localStorage.setItem("frhd-snake-highscore", state.highScore.toString());
        }
        return;
      }

      // Add new head
      state.snake.unshift(newHead);

      // Check if food eaten
      if (newHead.x === state.food.x && newHead.y === state.food.y) {
        state.score += 10;
        // Increase speed
        state.speed = Math.max(MIN_SPEED, state.speed - SPEED_INCREMENT);
        spawnFood();
      } else {
        // Remove tail if no food eaten
        state.snake.pop();
      }
    };

    const draw = () => {
      const state = gameStateRef.current;

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
        const brightness = Math.max(0.4, 1 - index * 0.03);
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
          initGame();
        } else {
          state.isPaused = !state.isPaused;
        }
        return;
      }

      // Direction controls
      const { direction } = state;
      if ((event.key === "ArrowUp" || event.key.toLowerCase() === "w") && direction.y !== 1) {
        state.nextDirection = { x: 0, y: -1 };
      } else if ((event.key === "ArrowDown" || event.key.toLowerCase() === "s") && direction.y !== -1) {
        state.nextDirection = { x: 0, y: 1 };
      } else if ((event.key === "ArrowLeft" || event.key.toLowerCase() === "a") && direction.x !== 1) {
        state.nextDirection = { x: -1, y: 0 };
      } else if ((event.key === "ArrowRight" || event.key.toLowerCase() === "d") && direction.x !== -1) {
        state.nextDirection = { x: 1, y: 0 };
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);

    // Handle resize
    const handleResize = () => {
      setupCanvas();
    };
    window.addEventListener("resize", handleResize);

    // Initialize game
    initGame();

    // Game loop
    let lastUpdate = 0;
    let animationId: number;

    const gameLoop = (timestamp: number) => {
      const state = gameStateRef.current;

      if (timestamp - lastUpdate >= state.speed) {
        update();
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
    <div className="fixed inset-0 z-50 bg-black">
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-green-500 text-sm font-mono">
        Arrow keys or WASD to move | SPACE to pause | Q or ESC to exit
      </div>
    </div>
  );
}
