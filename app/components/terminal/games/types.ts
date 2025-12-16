/**
 * Shared type definitions for terminal games
 */

// Common point/position type
export interface Point {
  x: number;
  y: number;
}

// Common direction type
export interface Direction {
  x: number;
  y: number;
}

// Base game state interface
export interface BaseGameState {
  score: number;
  highScore: number;
  gameOver: boolean;
  isPaused: boolean;
}

// ========================================
// Tetris Types
// ========================================

export type TetrominoType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";

export interface TetrominoDef {
  shape: number[][];
  color: string;
}

export interface TetrisPiece {
  type: TetrominoType;
  shape: number[][];
  x: number;
  y: number;
  color: string;
}

export interface TetrisState extends BaseGameState {
  board: (string | null)[][];
  currentPiece: TetrisPiece | null;
  nextPiece: TetrisPiece | null;
  level: number;
  lines: number;
  dropSpeed: number;
}

export interface TetrisConfig {
  boardWidth: number;
  boardHeight: number;
  initialDropSpeed: number;
}

// ========================================
// 2048 Types
// ========================================

export type Grid2048 = number[][];

export interface Game2048State extends BaseGameState {
  grid: Grid2048;
  won: boolean;
  continueAfterWin: boolean;
}

export interface Game2048Config {
  gridSize: number;
}

export type MoveDirection = "up" | "down" | "left" | "right";

export interface SlideResult {
  newRow: number[];
  score: number;
}

// ========================================
// Snake Types
// ========================================

export interface SnakeState extends BaseGameState {
  snake: Point[];
  direction: Direction;
  nextDirection: Direction;
  food: Point;
  speed: number;
}

export interface SnakeConfig {
  gridWidth: number;
  gridHeight: number;
  initialSpeed: number;
  speedIncrement: number;
  minSpeed: number;
}
