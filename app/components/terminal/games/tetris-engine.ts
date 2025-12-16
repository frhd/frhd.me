/**
 * Tetris game engine - pure game logic separated from rendering
 */

import type {
  TetrominoType,
  TetrominoDef,
  TetrisPiece,
  TetrisState,
  TetrisConfig,
} from "./types";

// Tetromino definitions
export const TETROMINOES: Record<TetrominoType, TetrominoDef> = {
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

export const TETROMINO_TYPES: TetrominoType[] = ["I", "O", "T", "S", "Z", "J", "L"];

// Default configuration
export const DEFAULT_CONFIG: TetrisConfig = {
  boardWidth: 10,
  boardHeight: 20,
  initialDropSpeed: 1000,
};

// Line clear scoring
const LINE_SCORES = [0, 100, 300, 500, 800];

/**
 * Create an empty game board
 */
export function createBoard(width: number, height: number): (string | null)[][] {
  return Array(height)
    .fill(null)
    .map(() => Array(width).fill(null));
}

/**
 * Create a random tetromino piece
 */
export function createPiece(boardWidth: number): TetrisPiece {
  const type = TETROMINO_TYPES[Math.floor(Math.random() * TETROMINO_TYPES.length)];
  const tetromino = TETROMINOES[type];
  return {
    type,
    shape: tetromino.shape.map((row) => [...row]),
    x: Math.floor(boardWidth / 2) - Math.floor(tetromino.shape[0].length / 2),
    y: 0,
    color: tetromino.color,
  };
}

/**
 * Initialize a new game state
 */
export function createInitialState(config: TetrisConfig = DEFAULT_CONFIG): TetrisState {
  return {
    board: createBoard(config.boardWidth, config.boardHeight),
    currentPiece: createPiece(config.boardWidth),
    nextPiece: createPiece(config.boardWidth),
    score: 0,
    highScore: 0,
    level: 1,
    lines: 0,
    gameOver: false,
    isPaused: false,
    dropSpeed: config.initialDropSpeed,
  };
}

/**
 * Check if a move is valid (no collisions)
 */
export function isValidMove(
  board: (string | null)[][],
  piece: TetrisPiece,
  offsetX: number,
  offsetY: number,
  newShape?: number[][]
): boolean {
  const shape = newShape || piece.shape;
  const boardHeight = board.length;
  const boardWidth = board[0].length;

  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        const newX = piece.x + x + offsetX;
        const newY = piece.y + y + offsetY;

        if (newX < 0 || newX >= boardWidth || newY >= boardHeight) {
          return false;
        }
        if (newY >= 0 && board[newY][newX]) {
          return false;
        }
      }
    }
  }
  return true;
}

/**
 * Rotate a piece shape clockwise
 */
export function rotatePieceShape(shape: number[][]): number[][] {
  const rows = shape.length;
  const cols = shape[0].length;
  const rotated: number[][] = [];

  for (let x = 0; x < cols; x++) {
    rotated.push([]);
    for (let y = rows - 1; y >= 0; y--) {
      rotated[x].push(shape[y][x]);
    }
  }

  return rotated;
}

/**
 * Try to rotate the current piece with wall kicks
 */
export function tryRotate(
  board: (string | null)[][],
  piece: TetrisPiece
): { success: boolean; newShape: number[][]; kickX: number } {
  const rotated = rotatePieceShape(piece.shape);

  // Try normal rotation
  if (isValidMove(board, piece, 0, 0, rotated)) {
    return { success: true, newShape: rotated, kickX: 0 };
  }

  // Wall kick: try moving left or right
  for (const kick of [-1, 1, -2, 2]) {
    if (isValidMove(board, piece, kick, 0, rotated)) {
      return { success: true, newShape: rotated, kickX: kick };
    }
  }

  return { success: false, newShape: piece.shape, kickX: 0 };
}

/**
 * Lock the current piece onto the board and check for completed lines
 */
export function lockPiece(
  state: TetrisState,
  config: TetrisConfig = DEFAULT_CONFIG
): { linesCleared: number; newHighScore: boolean } {
  const piece = state.currentPiece;
  if (!piece) return { linesCleared: 0, newHighScore: false };

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
  for (let y = config.boardHeight - 1; y >= 0; y--) {
    if (state.board[y].every((cell) => cell !== null)) {
      state.board.splice(y, 1);
      state.board.unshift(Array(config.boardWidth).fill(null));
      linesCleared++;
      y++; // Check same row again
    }
  }

  // Update score
  state.score += LINE_SCORES[linesCleared] * state.level;
  state.lines += linesCleared;

  // Level up every 10 lines
  const newLevel = Math.floor(state.lines / 10) + 1;
  if (newLevel > state.level) {
    state.level = newLevel;
    state.dropSpeed = Math.max(100, config.initialDropSpeed - (state.level - 1) * 100);
  }

  // Spawn new piece
  state.currentPiece = state.nextPiece;
  state.nextPiece = createPiece(config.boardWidth);

  // Check game over
  let newHighScore = false;
  if (!isValidMove(state.board, state.currentPiece!, 0, 0)) {
    state.gameOver = true;
    if (state.score > state.highScore) {
      state.highScore = state.score;
      newHighScore = true;
    }
  }

  return { linesCleared, newHighScore };
}

/**
 * Move the current piece
 * Returns true if the piece moved, false if it locked
 */
export function movePiece(
  state: TetrisState,
  dx: number,
  dy: number,
  config: TetrisConfig = DEFAULT_CONFIG
): { moved: boolean; locked: boolean; linesCleared: number; newHighScore: boolean } {
  if (!state.currentPiece || state.gameOver || state.isPaused) {
    return { moved: false, locked: false, linesCleared: 0, newHighScore: false };
  }

  if (isValidMove(state.board, state.currentPiece, dx, dy)) {
    state.currentPiece.x += dx;
    state.currentPiece.y += dy;
    return { moved: true, locked: false, linesCleared: 0, newHighScore: false };
  } else if (dy > 0) {
    // Lock piece when it can't move down
    const result = lockPiece(state, config);
    return { moved: false, locked: true, ...result };
  }

  return { moved: false, locked: false, linesCleared: 0, newHighScore: false };
}

/**
 * Rotate the current piece
 */
export function rotatePiece(state: TetrisState): boolean {
  if (!state.currentPiece || state.gameOver || state.isPaused) {
    return false;
  }

  const result = tryRotate(state.board, state.currentPiece);
  if (result.success) {
    state.currentPiece.shape = result.newShape;
    state.currentPiece.x += result.kickX;
    return true;
  }

  return false;
}

/**
 * Hard drop the current piece
 */
export function hardDrop(
  state: TetrisState,
  config: TetrisConfig = DEFAULT_CONFIG
): { dropDistance: number; linesCleared: number; newHighScore: boolean } {
  if (!state.currentPiece || state.gameOver || state.isPaused) {
    return { dropDistance: 0, linesCleared: 0, newHighScore: false };
  }

  let dropDistance = 0;
  while (isValidMove(state.board, state.currentPiece, 0, 1)) {
    state.currentPiece.y++;
    dropDistance++;
  }

  state.score += dropDistance * 2;
  const result = lockPiece(state, config);

  return { dropDistance, ...result };
}

/**
 * Calculate the ghost piece Y position (where the piece would land)
 */
export function getGhostY(state: TetrisState): number {
  if (!state.currentPiece) return 0;

  let ghostY = state.currentPiece.y;
  while (isValidMove(state.board, state.currentPiece, 0, ghostY - state.currentPiece.y + 1)) {
    ghostY++;
  }

  return ghostY;
}

/**
 * Reset game to initial state
 */
export function resetGame(state: TetrisState, config: TetrisConfig = DEFAULT_CONFIG): void {
  const newState = createInitialState(config);
  state.board = newState.board;
  state.currentPiece = newState.currentPiece;
  state.nextPiece = newState.nextPiece;
  state.score = newState.score;
  state.level = newState.level;
  state.lines = newState.lines;
  state.gameOver = newState.gameOver;
  state.isPaused = newState.isPaused;
  state.dropSpeed = newState.dropSpeed;
  // Keep highScore
}

/**
 * Toggle pause state
 */
export function togglePause(state: TetrisState): void {
  if (!state.gameOver) {
    state.isPaused = !state.isPaused;
  }
}
