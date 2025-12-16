/**
 * 2048 game engine - pure game logic separated from rendering
 */

import type {
  Grid2048,
  Game2048State,
  Game2048Config,
  MoveDirection,
  SlideResult,
} from "./types";

// Default configuration
export const DEFAULT_CONFIG: Game2048Config = {
  gridSize: 4,
};

// Tile color definitions
export const TILE_COLORS: Record<number, { bg: string; text: string }> = {
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

/**
 * Create an empty grid
 */
export function createEmptyGrid(size: number): Grid2048 {
  return Array(size)
    .fill(null)
    .map(() => Array(size).fill(0));
}

/**
 * Get all empty cells in the grid
 */
export function getEmptyCells(grid: Grid2048): { row: number; col: number }[] {
  const empty: { row: number; col: number }[] = [];
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      if (grid[row][col] === 0) {
        empty.push({ row, col });
      }
    }
  }
  return empty;
}

/**
 * Add a random tile (2 or 4) to the grid
 */
export function addRandomTile(grid: Grid2048): boolean {
  const empty = getEmptyCells(grid);
  if (empty.length === 0) return false;

  const { row, col } = empty[Math.floor(Math.random() * empty.length)];
  grid[row][col] = Math.random() < 0.9 ? 2 : 4;
  return true;
}

/**
 * Check if any moves are possible
 */
export function canMove(grid: Grid2048): boolean {
  const size = grid.length;

  // Check for empty cells
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (grid[row][col] === 0) return true;
    }
  }

  // Check for mergeable adjacent cells
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const val = grid[row][col];
      if (
        (row < size - 1 && grid[row + 1][col] === val) ||
        (col < size - 1 && grid[row][col + 1] === val)
      ) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Check if the grid contains a winning tile (2048 or higher)
 */
export function hasWinningTile(grid: Grid2048): boolean {
  return grid.some((row) => row.some((val) => val >= 2048));
}

/**
 * Slide and merge a single row to the left
 */
export function slideRow(row: number[]): SlideResult {
  // Remove zeros
  const filtered = row.filter((x) => x !== 0);
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
  while (merged.length < row.length) {
    merged.push(0);
  }

  return { newRow: merged, score };
}

/**
 * Check if two grids are equal
 */
export function gridsEqual(grid1: Grid2048, grid2: Grid2048): boolean {
  return grid1.every((row, i) => row.every((val, j) => val === grid2[i][j]));
}

/**
 * Create initial game state
 */
export function createInitialState(config: Game2048Config = DEFAULT_CONFIG): Game2048State {
  const grid = createEmptyGrid(config.gridSize);
  addRandomTile(grid);
  addRandomTile(grid);

  return {
    grid,
    score: 0,
    highScore: 0,
    gameOver: false,
    isPaused: false,
    won: false,
    continueAfterWin: false,
  };
}

/**
 * Perform a move in the given direction
 * Returns whether anything changed and if there's a new high score
 */
export function move(
  state: Game2048State,
  direction: MoveDirection
): { changed: boolean; newHighScore: boolean } {
  if (state.gameOver || (state.won && !state.continueAfterWin)) {
    return { changed: false, newHighScore: false };
  }

  const size = state.grid.length;
  const oldGrid = state.grid.map((row) => [...row]);
  let totalScore = 0;

  if (direction === "left") {
    for (let row = 0; row < size; row++) {
      const { newRow, score } = slideRow(state.grid[row]);
      state.grid[row] = newRow;
      totalScore += score;
    }
  } else if (direction === "right") {
    for (let row = 0; row < size; row++) {
      const { newRow, score } = slideRow([...state.grid[row]].reverse());
      state.grid[row] = newRow.reverse();
      totalScore += score;
    }
  } else if (direction === "up") {
    for (let col = 0; col < size; col++) {
      const column = state.grid.map((row) => row[col]);
      const { newRow, score } = slideRow(column);
      for (let row = 0; row < size; row++) {
        state.grid[row][col] = newRow[row];
      }
      totalScore += score;
    }
  } else if (direction === "down") {
    for (let col = 0; col < size; col++) {
      const column = state.grid.map((row) => row[col]).reverse();
      const { newRow, score } = slideRow(column);
      const reversed = newRow.reverse();
      for (let row = 0; row < size; row++) {
        state.grid[row][col] = reversed[row];
      }
      totalScore += score;
    }
  }

  // Check if anything changed
  const changed = !gridsEqual(state.grid, oldGrid);

  let newHighScore = false;
  if (changed) {
    state.score += totalScore;
    addRandomTile(state.grid);

    // Check for win
    if (!state.won && hasWinningTile(state.grid)) {
      state.won = true;
    }

    // Check for game over
    if (!canMove(state.grid)) {
      state.gameOver = true;
      if (state.score > state.highScore) {
        state.highScore = state.score;
        newHighScore = true;
      }
    }
  }

  return { changed, newHighScore };
}

/**
 * Continue playing after winning
 */
export function continueAfterWin(state: Game2048State): void {
  if (state.won && !state.continueAfterWin) {
    state.continueAfterWin = true;
  }
}

/**
 * Reset game to initial state
 */
export function resetGame(state: Game2048State, config: Game2048Config = DEFAULT_CONFIG): void {
  const newState = createInitialState(config);
  state.grid = newState.grid;
  state.score = newState.score;
  state.gameOver = newState.gameOver;
  state.won = newState.won;
  state.continueAfterWin = newState.continueAfterWin;
  // Keep highScore
}

/**
 * Get tile color for a value
 */
export function getTileColor(value: number): { bg: string; text: string } {
  return TILE_COLORS[value] || TILE_COLORS[4096];
}
