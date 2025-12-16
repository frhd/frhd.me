"use client";

import { useEffect, useRef, useCallback } from "react";
import { unlockAchievement } from "./achievements";

interface TetrisProps {
  onComplete: () => void;
}

// Tetromino shapes
const TETROMINOES = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: "#00ffff",
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "#ffff00",
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "#ff00ff",
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: "#00ff00",
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: "#ff0000",
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "#0000ff",
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "#ff8800",
  },
};

type TetrominoType = keyof typeof TETROMINOES;
const TETROMINO_TYPES: TetrominoType[] = ["I", "O", "T", "S", "Z", "J", "L"];

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const CELL_SIZE = 30;

interface Piece {
  type: TetrominoType;
  shape: number[][];
  x: number;
  y: number;
  color: string;
}

export default function XTermTetris({ onComplete }: TetrisProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef({
    board: [] as (string | null)[][],
    currentPiece: null as Piece | null,
    nextPiece: null as Piece | null,
    score: 0,
    highScore: 0,
    level: 1,
    lines: 0,
    gameOver: false,
    isPaused: false,
    dropSpeed: 1000,
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
    const savedHighScore = localStorage.getItem("frhd-tetris-highscore");
    if (savedHighScore) {
      gameStateRef.current.highScore = parseInt(savedHighScore, 10);
    }

    // Setup canvas
    const boardPixelWidth = BOARD_WIDTH * CELL_SIZE;
    const boardPixelHeight = BOARD_HEIGHT * CELL_SIZE;
    const sidebarWidth = 200;

    canvas.width = boardPixelWidth + sidebarWidth + 40;
    canvas.height = boardPixelHeight + 40;

    const offsetX = 20;
    const offsetY = 20;

    // Initialize board
    const createBoard = () => {
      return Array(BOARD_HEIGHT)
        .fill(null)
        .map(() => Array(BOARD_WIDTH).fill(null));
    };

    const createPiece = (): Piece => {
      const type = TETROMINO_TYPES[Math.floor(Math.random() * TETROMINO_TYPES.length)];
      const tetromino = TETROMINOES[type];
      return {
        type,
        shape: tetromino.shape.map((row) => [...row]),
        x: Math.floor(BOARD_WIDTH / 2) - Math.floor(tetromino.shape[0].length / 2),
        y: 0,
        color: tetromino.color,
      };
    };

    const initGame = () => {
      gameStateRef.current.board = createBoard();
      gameStateRef.current.currentPiece = createPiece();
      gameStateRef.current.nextPiece = createPiece();
      gameStateRef.current.score = 0;
      gameStateRef.current.level = 1;
      gameStateRef.current.lines = 0;
      gameStateRef.current.gameOver = false;
      gameStateRef.current.isPaused = false;
      gameStateRef.current.dropSpeed = 1000;
    };

    const isValidMove = (piece: Piece, offsetX: number, offsetY: number, newShape?: number[][]): boolean => {
      const shape = newShape || piece.shape;
      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (shape[y][x]) {
            const newX = piece.x + x + offsetX;
            const newY = piece.y + y + offsetY;

            if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
              return false;
            }
            if (newY >= 0 && gameStateRef.current.board[newY][newX]) {
              return false;
            }
          }
        }
      }
      return true;
    };

    const rotatePiece = (piece: Piece): number[][] => {
      const rows = piece.shape.length;
      const cols = piece.shape[0].length;
      const rotated: number[][] = [];

      for (let x = 0; x < cols; x++) {
        rotated.push([]);
        for (let y = rows - 1; y >= 0; y--) {
          rotated[x].push(piece.shape[y][x]);
        }
      }

      return rotated;
    };

    const lockPiece = () => {
      const state = gameStateRef.current;
      const piece = state.currentPiece;
      if (!piece) return;

      // Add piece to board
      for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
          if (piece.shape[y][x]) {
            const boardY = piece.y + y;
            const boardX = piece.x + x;
            if (boardY >= 0) {
              state.board[boardY][boardX] = piece.color;
            }
          }
        }
      }

      // Check for completed lines
      let linesCleared = 0;
      for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        if (state.board[y].every((cell) => cell !== null)) {
          state.board.splice(y, 1);
          state.board.unshift(Array(BOARD_WIDTH).fill(null));
          linesCleared++;
          y++; // Check same row again
        }
      }

      // Update score
      const lineScores = [0, 100, 300, 500, 800];
      state.score += lineScores[linesCleared] * state.level;
      state.lines += linesCleared;

      // Level up every 10 lines
      const newLevel = Math.floor(state.lines / 10) + 1;
      if (newLevel > state.level) {
        state.level = newLevel;
        state.dropSpeed = Math.max(100, 1000 - (state.level - 1) * 100);
      }

      // Spawn new piece
      state.currentPiece = state.nextPiece;
      state.nextPiece = createPiece();

      // Check game over
      if (!isValidMove(state.currentPiece!, 0, 0)) {
        state.gameOver = true;
        if (state.score > state.highScore) {
          state.highScore = state.score;
          localStorage.setItem("frhd-tetris-highscore", state.highScore.toString());
          // Unlock high_scorer achievement
          unlockAchievement("high_scorer");
        }
      }
    };

    const movePiece = (dx: number, dy: number) => {
      const state = gameStateRef.current;
      if (!state.currentPiece || state.gameOver || state.isPaused) return;

      if (isValidMove(state.currentPiece, dx, dy)) {
        state.currentPiece.x += dx;
        state.currentPiece.y += dy;
      } else if (dy > 0) {
        // Lock piece when it can't move down
        lockPiece();
      }
    };

    const rotate = () => {
      const state = gameStateRef.current;
      if (!state.currentPiece || state.gameOver || state.isPaused) return;

      const rotated = rotatePiece(state.currentPiece);

      // Try normal rotation
      if (isValidMove(state.currentPiece, 0, 0, rotated)) {
        state.currentPiece.shape = rotated;
        return;
      }

      // Wall kick: try moving left or right
      for (const kick of [-1, 1, -2, 2]) {
        if (isValidMove(state.currentPiece, kick, 0, rotated)) {
          state.currentPiece.x += kick;
          state.currentPiece.shape = rotated;
          return;
        }
      }
    };

    const hardDrop = () => {
      const state = gameStateRef.current;
      if (!state.currentPiece || state.gameOver || state.isPaused) return;

      while (isValidMove(state.currentPiece, 0, 1)) {
        state.currentPiece.y++;
        state.score += 2;
      }
      lockPiece();
    };

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
      for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
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
        let ghostY = state.currentPiece.y;
        while (isValidMove(state.currentPiece, 0, ghostY - state.currentPiece.y + 1)) {
          ghostY++;
        }

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
          initGame();
        } else {
          state.isPaused = !state.isPaused;
        }
        return;
      }

      if (state.gameOver || state.isPaused) return;

      switch (event.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          event.preventDefault();
          movePiece(-1, 0);
          break;
        case "ArrowRight":
        case "d":
        case "D":
          event.preventDefault();
          movePiece(1, 0);
          break;
        case "ArrowDown":
        case "s":
        case "S":
          event.preventDefault();
          movePiece(0, 1);
          state.score += 1;
          break;
        case "ArrowUp":
        case "w":
        case "W":
          event.preventDefault();
          rotate();
          break;
        case "Enter":
          event.preventDefault();
          hardDrop();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);

    // Initialize game
    initGame();

    // Game loop
    let lastDrop = 0;
    let animationId: number;

    const gameLoop = (timestamp: number) => {
      const state = gameStateRef.current;

      if (!state.gameOver && !state.isPaused && timestamp - lastDrop >= state.dropSpeed) {
        movePiece(0, 1);
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
