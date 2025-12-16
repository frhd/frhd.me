import { describe, it, expect, beforeEach } from "vitest";
import {
  createEmptyGrid,
  getEmptyCells,
  addRandomTile,
  canMove,
  hasWinningTile,
  slideRow,
  gridsEqual,
  createInitialState,
  move,
  continueAfterWin,
  resetGame,
  getTileColor,
  TILE_COLORS,
} from "../../games/game-2048-engine";
import type { Game2048State, Grid2048 } from "../../games/types";

describe("2048 Engine", () => {
  describe("createEmptyGrid", () => {
    it("should create a grid of correct size", () => {
      const grid = createEmptyGrid(4);
      expect(grid.length).toBe(4);
      expect(grid[0].length).toBe(4);
    });

    it("should create a grid filled with zeros", () => {
      const grid = createEmptyGrid(4);
      expect(grid.every((row) => row.every((cell) => cell === 0))).toBe(true);
    });
  });

  describe("getEmptyCells", () => {
    it("should return all cells for empty grid", () => {
      const grid = createEmptyGrid(4);
      const empty = getEmptyCells(grid);
      expect(empty.length).toBe(16);
    });

    it("should return correct empty cells", () => {
      const grid: Grid2048 = [
        [2, 0, 0, 0],
        [0, 4, 0, 0],
        [0, 0, 8, 0],
        [0, 0, 0, 16],
      ];
      const empty = getEmptyCells(grid);
      expect(empty.length).toBe(12);
      expect(empty).not.toContainEqual({ row: 0, col: 0 });
      expect(empty).not.toContainEqual({ row: 1, col: 1 });
    });
  });

  describe("addRandomTile", () => {
    it("should add a tile to empty cell", () => {
      const grid = createEmptyGrid(4);
      const result = addRandomTile(grid);
      expect(result).toBe(true);
      const emptyCells = getEmptyCells(grid);
      expect(emptyCells.length).toBe(15);
    });

    it("should return false for full grid", () => {
      const grid: Grid2048 = [
        [2, 4, 8, 16],
        [32, 64, 128, 256],
        [512, 1024, 2048, 4096],
        [2, 4, 8, 16],
      ];
      const result = addRandomTile(grid);
      expect(result).toBe(false);
    });

    it("should add 2 or 4", () => {
      const grid = createEmptyGrid(4);
      addRandomTile(grid);
      const nonEmpty = grid.flat().filter((x) => x !== 0);
      expect(nonEmpty.length).toBe(1);
      expect([2, 4]).toContain(nonEmpty[0]);
    });
  });

  describe("canMove", () => {
    it("should return true for grid with empty cells", () => {
      const grid: Grid2048 = [
        [2, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ];
      expect(canMove(grid)).toBe(true);
    });

    it("should return true for mergeable adjacent cells", () => {
      const grid: Grid2048 = [
        [2, 4, 8, 16],
        [32, 64, 128, 256],
        [512, 1024, 2048, 2048],
        [2, 4, 8, 16],
      ];
      expect(canMove(grid)).toBe(true); // 2048s can merge
    });

    it("should return false when no moves possible", () => {
      const grid: Grid2048 = [
        [2, 4, 8, 16],
        [32, 64, 128, 256],
        [2, 4, 8, 16],
        [32, 64, 128, 256],
      ];
      expect(canMove(grid)).toBe(false);
    });
  });

  describe("hasWinningTile", () => {
    it("should return false for grid without 2048", () => {
      const grid: Grid2048 = [
        [2, 4, 8, 16],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 1024],
      ];
      expect(hasWinningTile(grid)).toBe(false);
    });

    it("should return true for grid with 2048", () => {
      const grid: Grid2048 = [
        [2, 4, 8, 16],
        [0, 0, 0, 0],
        [0, 0, 2048, 0],
        [0, 0, 0, 0],
      ];
      expect(hasWinningTile(grid)).toBe(true);
    });

    it("should return true for grid with tile > 2048", () => {
      const grid: Grid2048 = [
        [4096, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ];
      expect(hasWinningTile(grid)).toBe(true);
    });
  });

  describe("slideRow", () => {
    it("should slide tiles to the left", () => {
      const result = slideRow([0, 2, 0, 2]);
      expect(result.newRow).toEqual([4, 0, 0, 0]);
      expect(result.score).toBe(4);
    });

    it("should merge same tiles", () => {
      const result = slideRow([2, 2, 4, 4]);
      expect(result.newRow).toEqual([4, 8, 0, 0]);
      expect(result.score).toBe(12);
    });

    it("should not merge already merged tiles", () => {
      const result = slideRow([2, 2, 2, 2]);
      expect(result.newRow).toEqual([4, 4, 0, 0]);
      expect(result.score).toBe(8);
    });

    it("should handle already sorted row", () => {
      const result = slideRow([4, 2, 0, 0]);
      expect(result.newRow).toEqual([4, 2, 0, 0]);
      expect(result.score).toBe(0);
    });

    it("should handle empty row", () => {
      const result = slideRow([0, 0, 0, 0]);
      expect(result.newRow).toEqual([0, 0, 0, 0]);
      expect(result.score).toBe(0);
    });
  });

  describe("gridsEqual", () => {
    it("should return true for equal grids", () => {
      const grid1: Grid2048 = [
        [2, 4, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ];
      const grid2: Grid2048 = [
        [2, 4, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ];
      expect(gridsEqual(grid1, grid2)).toBe(true);
    });

    it("should return false for different grids", () => {
      const grid1: Grid2048 = [
        [2, 4, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ];
      const grid2: Grid2048 = [
        [4, 2, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ];
      expect(gridsEqual(grid1, grid2)).toBe(false);
    });
  });

  describe("createInitialState", () => {
    it("should create state with two tiles", () => {
      const state = createInitialState();
      const nonEmpty = state.grid.flat().filter((x) => x !== 0);
      expect(nonEmpty.length).toBe(2);
    });

    it("should initialize scores to zero", () => {
      const state = createInitialState();
      expect(state.score).toBe(0);
      expect(state.highScore).toBe(0);
    });

    it("should not be game over or won initially", () => {
      const state = createInitialState();
      expect(state.gameOver).toBe(false);
      expect(state.won).toBe(false);
      expect(state.continueAfterWin).toBe(false);
    });
  });

  describe("move", () => {
    let state: Game2048State;

    beforeEach(() => {
      state = createInitialState();
      // Set up a predictable grid
      state.grid = [
        [2, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ];
    });

    it("should move tiles left", () => {
      state.grid = [
        [0, 0, 2, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ];
      const result = move(state, "left");
      expect(result.changed).toBe(true);
      expect(state.grid[0][0]).toBe(2);
    });

    it("should move tiles right", () => {
      state.grid = [
        [2, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ];
      const result = move(state, "right");
      expect(result.changed).toBe(true);
      expect(state.grid[0][3]).toBe(2);
    });

    it("should move tiles up", () => {
      state.grid = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [2, 0, 0, 0],
      ];
      const result = move(state, "up");
      expect(result.changed).toBe(true);
      expect(state.grid[0][0]).toBe(2);
    });

    it("should move tiles down", () => {
      state.grid = [
        [2, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ];
      const result = move(state, "down");
      expect(result.changed).toBe(true);
      expect(state.grid[3][0]).toBe(2);
    });

    it("should merge tiles and update score", () => {
      state.grid = [
        [2, 2, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ];
      move(state, "left");
      expect(state.score).toBe(4);
    });

    it("should add new tile after valid move", () => {
      state.grid = [
        [0, 0, 0, 2],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ];
      move(state, "left");
      const nonEmpty = state.grid.flat().filter((x) => x !== 0);
      expect(nonEmpty.length).toBe(2); // Original + new tile
    });

    it("should not change when move has no effect", () => {
      state.grid = [
        [2, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ];
      const result = move(state, "left");
      expect(result.changed).toBe(false);
    });
  });

  describe("continueAfterWin", () => {
    it("should set continueAfterWin flag", () => {
      const state = createInitialState();
      state.won = true;
      continueAfterWin(state);
      expect(state.continueAfterWin).toBe(true);
    });

    it("should not change if not won", () => {
      const state = createInitialState();
      continueAfterWin(state);
      expect(state.continueAfterWin).toBe(false);
    });
  });

  describe("resetGame", () => {
    it("should reset state but keep high score", () => {
      const state = createInitialState();
      state.score = 1000;
      state.highScore = 5000;
      state.gameOver = true;
      state.won = true;

      resetGame(state);

      expect(state.score).toBe(0);
      expect(state.highScore).toBe(5000);
      expect(state.gameOver).toBe(false);
      expect(state.won).toBe(false);
    });
  });

  describe("getTileColor", () => {
    it("should return correct color for known values", () => {
      expect(getTileColor(2).bg).toBe(TILE_COLORS[2].bg);
      expect(getTileColor(2048).bg).toBe(TILE_COLORS[2048].bg);
    });

    it("should return fallback color for unknown values", () => {
      const color = getTileColor(16384);
      expect(color.bg).toBe(TILE_COLORS[4096].bg);
    });
  });
});
