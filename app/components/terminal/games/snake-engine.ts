/**
 * Snake game engine - pure game logic separated from rendering
 */

import type { Point, Direction, SnakeState, SnakeConfig } from "./types";

// Default configuration
export const DEFAULT_CONFIG: SnakeConfig = {
  gridWidth: 40,
  gridHeight: 30,
  initialSpeed: 100,
  speedIncrement: 2,
  minSpeed: 50,
};

/**
 * Create initial snake at the center of the grid
 */
export function createInitialSnake(gridWidth: number, gridHeight: number): Point[] {
  const startX = Math.floor(gridWidth / 2);
  const startY = Math.floor(gridHeight / 2);
  return [
    { x: startX, y: startY },
    { x: startX - 1, y: startY },
    { x: startX - 2, y: startY },
  ];
}

/**
 * Create initial game state
 */
export function createInitialState(config: SnakeConfig = DEFAULT_CONFIG): SnakeState {
  const snake = createInitialSnake(config.gridWidth, config.gridHeight);
  const food = spawnFoodInternal(snake, config.gridWidth, config.gridHeight);

  return {
    snake,
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 },
    food,
    score: 0,
    highScore: 0,
    gameOver: false,
    isPaused: false,
    speed: config.initialSpeed,
  };
}

/**
 * Internal function to spawn food at a random position not occupied by snake
 */
function spawnFoodInternal(snake: Point[], gridWidth: number, gridHeight: number): Point {
  let newFood: Point;
  do {
    newFood = {
      x: Math.floor(Math.random() * gridWidth),
      y: Math.floor(Math.random() * gridHeight),
    };
  } while (snake.some((s) => s.x === newFood.x && s.y === newFood.y));
  return newFood;
}

/**
 * Spawn food at a random position
 */
export function spawnFood(state: SnakeState, gridWidth: number, gridHeight: number): void {
  state.food = spawnFoodInternal(state.snake, gridWidth, gridHeight);
}

/**
 * Check if a position collides with walls or snake body
 */
export function checkCollision(
  head: Point,
  snake: Point[],
  gridWidth: number,
  gridHeight: number
): boolean {
  // Wall collision
  if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
    return true;
  }
  // Self collision (skip the head itself)
  for (let i = 1; i < snake.length; i++) {
    if (snake[i].x === head.x && snake[i].y === head.y) {
      return true;
    }
  }
  return false;
}

/**
 * Set the next direction (queued for next update)
 */
export function setDirection(state: SnakeState, newDirection: Direction): boolean {
  const { direction } = state;

  // Prevent reversing direction
  if (newDirection.x === -direction.x && newDirection.y === -direction.y) {
    return false;
  }

  // Prevent same-axis direction changes that would be invalid
  if (newDirection.x !== 0 && direction.x !== 0) {
    return false;
  }
  if (newDirection.y !== 0 && direction.y !== 0) {
    return false;
  }

  state.nextDirection = { ...newDirection };
  return true;
}

/**
 * Update game state for one tick
 * Returns whether a new high score was achieved
 */
export function update(state: SnakeState, config: SnakeConfig = DEFAULT_CONFIG): { newHighScore: boolean } {
  if (state.gameOver || state.isPaused) {
    return { newHighScore: false };
  }

  // Apply the queued direction
  state.direction = { ...state.nextDirection };

  // Calculate new head position
  const head = state.snake[0];
  const newHead: Point = {
    x: head.x + state.direction.x,
    y: head.y + state.direction.y,
  };

  // Check collision
  if (checkCollision(newHead, state.snake, config.gridWidth, config.gridHeight)) {
    state.gameOver = true;
    // Check high score
    if (state.score > state.highScore) {
      state.highScore = state.score;
      return { newHighScore: true };
    }
    return { newHighScore: false };
  }

  // Add new head
  state.snake.unshift(newHead);

  // Check if food eaten
  if (newHead.x === state.food.x && newHead.y === state.food.y) {
    state.score += 10;
    // Increase speed
    state.speed = Math.max(config.minSpeed, state.speed - config.speedIncrement);
    spawnFood(state, config.gridWidth, config.gridHeight);
  } else {
    // Remove tail if no food eaten
    state.snake.pop();
  }

  return { newHighScore: false };
}

/**
 * Toggle pause state
 */
export function togglePause(state: SnakeState): void {
  if (!state.gameOver) {
    state.isPaused = !state.isPaused;
  }
}

/**
 * Reset game to initial state
 */
export function resetGame(state: SnakeState, config: SnakeConfig = DEFAULT_CONFIG): void {
  const newState = createInitialState(config);
  state.snake = newState.snake;
  state.direction = newState.direction;
  state.nextDirection = newState.nextDirection;
  state.food = newState.food;
  state.score = newState.score;
  state.gameOver = newState.gameOver;
  state.isPaused = newState.isPaused;
  state.speed = newState.speed;
  // Keep highScore
}

/**
 * Get direction from key input
 */
export function getDirectionFromKey(key: string): Direction | null {
  switch (key.toLowerCase()) {
    case "arrowup":
    case "w":
      return { x: 0, y: -1 };
    case "arrowdown":
    case "s":
      return { x: 0, y: 1 };
    case "arrowleft":
    case "a":
      return { x: -1, y: 0 };
    case "arrowright":
    case "d":
      return { x: 1, y: 0 };
    default:
      return null;
  }
}

/**
 * Calculate brightness for snake segment (gradient effect)
 */
export function getSegmentBrightness(index: number): number {
  return Math.max(0.4, 1 - index * 0.03);
}
