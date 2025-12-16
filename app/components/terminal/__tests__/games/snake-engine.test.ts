import { describe, it, expect, beforeEach } from "vitest";
import {
  createInitialSnake,
  createInitialState,
  spawnFood,
  checkCollision,
  setDirection,
  update,
  togglePause,
  resetGame,
  getDirectionFromKey,
  getSegmentBrightness,
} from "../../games/snake-engine";
import type { SnakeState, SnakeConfig, Point } from "../../games/types";

describe("Snake Engine", () => {
  const testConfig: SnakeConfig = {
    gridWidth: 20,
    gridHeight: 15,
    initialSpeed: 100,
    speedIncrement: 2,
    minSpeed: 50,
  };

  describe("createInitialSnake", () => {
    it("should create snake with 3 segments", () => {
      const snake = createInitialSnake(20, 15);
      expect(snake.length).toBe(3);
    });

    it("should create snake in center of grid", () => {
      const snake = createInitialSnake(20, 15);
      expect(snake[0].x).toBe(10);
      expect(snake[0].y).toBe(7);
    });

    it("should create snake moving right (segments to the left of head)", () => {
      const snake = createInitialSnake(20, 15);
      expect(snake[1].x).toBe(snake[0].x - 1);
      expect(snake[2].x).toBe(snake[0].x - 2);
    });
  });

  describe("createInitialState", () => {
    it("should create valid initial state", () => {
      const state = createInitialState(testConfig);
      expect(state.snake.length).toBe(3);
      expect(state.direction).toEqual({ x: 1, y: 0 });
      expect(state.score).toBe(0);
      expect(state.gameOver).toBe(false);
      expect(state.isPaused).toBe(false);
    });

    it("should spawn food not on snake", () => {
      const state = createInitialState(testConfig);
      const foodOnSnake = state.snake.some(
        (s) => s.x === state.food.x && s.y === state.food.y
      );
      expect(foodOnSnake).toBe(false);
    });
  });

  describe("spawnFood", () => {
    it("should spawn food at valid position", () => {
      const state = createInitialState(testConfig);
      spawnFood(state, testConfig.gridWidth, testConfig.gridHeight);
      // Food may or may not be at same position (random)
      expect(state.food.x).toBeGreaterThanOrEqual(0);
      expect(state.food.x).toBeLessThan(testConfig.gridWidth);
      expect(state.food.y).toBeGreaterThanOrEqual(0);
      expect(state.food.y).toBeLessThan(testConfig.gridHeight);
    });

    it("should not spawn food on snake", () => {
      const state = createInitialState(testConfig);
      // Spawn multiple times to verify
      for (let i = 0; i < 10; i++) {
        spawnFood(state, testConfig.gridWidth, testConfig.gridHeight);
        const foodOnSnake = state.snake.some(
          (s) => s.x === state.food.x && s.y === state.food.y
        );
        expect(foodOnSnake).toBe(false);
      }
    });
  });

  describe("checkCollision", () => {
    it("should detect wall collision (left)", () => {
      const snake: Point[] = [{ x: 0, y: 5 }];
      const head: Point = { x: -1, y: 5 };
      expect(checkCollision(head, snake, 20, 15)).toBe(true);
    });

    it("should detect wall collision (right)", () => {
      const snake: Point[] = [{ x: 19, y: 5 }];
      const head: Point = { x: 20, y: 5 };
      expect(checkCollision(head, snake, 20, 15)).toBe(true);
    });

    it("should detect wall collision (top)", () => {
      const snake: Point[] = [{ x: 5, y: 0 }];
      const head: Point = { x: 5, y: -1 };
      expect(checkCollision(head, snake, 20, 15)).toBe(true);
    });

    it("should detect wall collision (bottom)", () => {
      const snake: Point[] = [{ x: 5, y: 14 }];
      const head: Point = { x: 5, y: 15 };
      expect(checkCollision(head, snake, 20, 15)).toBe(true);
    });

    it("should detect self collision", () => {
      const snake: Point[] = [
        { x: 5, y: 5 },
        { x: 6, y: 5 },
        { x: 6, y: 6 },
        { x: 5, y: 6 },
      ];
      const head: Point = { x: 5, y: 6 }; // Would collide with body
      expect(checkCollision(head, snake, 20, 15)).toBe(true);
    });

    it("should not detect collision for valid position", () => {
      const snake: Point[] = [{ x: 5, y: 5 }];
      const head: Point = { x: 6, y: 5 };
      expect(checkCollision(head, snake, 20, 15)).toBe(false);
    });
  });

  describe("setDirection", () => {
    let state: SnakeState;

    beforeEach(() => {
      state = createInitialState(testConfig);
    });

    it("should change direction when valid", () => {
      const result = setDirection(state, { x: 0, y: -1 }); // Up
      expect(result).toBe(true);
      expect(state.nextDirection).toEqual({ x: 0, y: -1 });
    });

    it("should not allow reversing direction", () => {
      state.direction = { x: 1, y: 0 }; // Moving right
      const result = setDirection(state, { x: -1, y: 0 }); // Try left
      expect(result).toBe(false);
    });

    it("should not allow same-axis direction changes", () => {
      state.direction = { x: 1, y: 0 }; // Moving right
      const result = setDirection(state, { x: 1, y: 0 }); // Try right again
      expect(result).toBe(false);
    });
  });

  describe("update", () => {
    let state: SnakeState;

    beforeEach(() => {
      state = createInitialState(testConfig);
    });

    it("should move snake forward", () => {
      const initialHead = { ...state.snake[0] };
      update(state, testConfig);
      expect(state.snake[0].x).toBe(initialHead.x + 1);
      expect(state.snake[0].y).toBe(initialHead.y);
    });

    it("should not update when paused", () => {
      state.isPaused = true;
      const initialHead = { ...state.snake[0] };
      update(state, testConfig);
      expect(state.snake[0]).toEqual(initialHead);
    });

    it("should not update when game over", () => {
      state.gameOver = true;
      const initialHead = { ...state.snake[0] };
      update(state, testConfig);
      expect(state.snake[0]).toEqual(initialHead);
    });

    it("should grow snake when eating food", () => {
      const initialLength = state.snake.length;
      // Place food in front of snake
      state.food = { x: state.snake[0].x + 1, y: state.snake[0].y };
      update(state, testConfig);
      expect(state.snake.length).toBe(initialLength + 1);
      expect(state.score).toBe(10);
    });

    it("should end game on wall collision", () => {
      // Move snake to right edge
      state.snake[0] = { x: testConfig.gridWidth - 1, y: 5 };
      state.direction = { x: 1, y: 0 };
      state.nextDirection = { x: 1, y: 0 };
      update(state, testConfig);
      expect(state.gameOver).toBe(true);
    });

    it("should increase speed when eating food", () => {
      const initialSpeed = state.speed;
      state.food = { x: state.snake[0].x + 1, y: state.snake[0].y };
      update(state, testConfig);
      expect(state.speed).toBeLessThan(initialSpeed);
    });

    it("should return newHighScore when beating high score", () => {
      state.highScore = 0;
      // Move snake to wall to trigger game over with score
      state.score = 100;
      state.snake[0] = { x: testConfig.gridWidth - 1, y: 5 };
      state.direction = { x: 1, y: 0 };
      state.nextDirection = { x: 1, y: 0 };
      const result = update(state, testConfig);
      expect(result.newHighScore).toBe(true);
      expect(state.highScore).toBe(100);
    });
  });

  describe("togglePause", () => {
    it("should toggle pause state", () => {
      const state = createInitialState(testConfig);
      expect(state.isPaused).toBe(false);
      togglePause(state);
      expect(state.isPaused).toBe(true);
      togglePause(state);
      expect(state.isPaused).toBe(false);
    });

    it("should not toggle when game over", () => {
      const state = createInitialState(testConfig);
      state.gameOver = true;
      togglePause(state);
      expect(state.isPaused).toBe(false);
    });
  });

  describe("resetGame", () => {
    it("should reset state but keep high score", () => {
      const state = createInitialState(testConfig);
      state.score = 100;
      state.highScore = 500;
      state.gameOver = true;
      state.snake = [{ x: 0, y: 0 }];

      resetGame(state, testConfig);

      expect(state.score).toBe(0);
      expect(state.highScore).toBe(500);
      expect(state.gameOver).toBe(false);
      expect(state.snake.length).toBe(3);
    });
  });

  describe("getDirectionFromKey", () => {
    it("should return up direction for ArrowUp/w", () => {
      expect(getDirectionFromKey("ArrowUp")).toEqual({ x: 0, y: -1 });
      expect(getDirectionFromKey("w")).toEqual({ x: 0, y: -1 });
      expect(getDirectionFromKey("W")).toEqual({ x: 0, y: -1 });
    });

    it("should return down direction for ArrowDown/s", () => {
      expect(getDirectionFromKey("ArrowDown")).toEqual({ x: 0, y: 1 });
      expect(getDirectionFromKey("s")).toEqual({ x: 0, y: 1 });
      expect(getDirectionFromKey("S")).toEqual({ x: 0, y: 1 });
    });

    it("should return left direction for ArrowLeft/a", () => {
      expect(getDirectionFromKey("ArrowLeft")).toEqual({ x: -1, y: 0 });
      expect(getDirectionFromKey("a")).toEqual({ x: -1, y: 0 });
      expect(getDirectionFromKey("A")).toEqual({ x: -1, y: 0 });
    });

    it("should return right direction for ArrowRight/d", () => {
      expect(getDirectionFromKey("ArrowRight")).toEqual({ x: 1, y: 0 });
      expect(getDirectionFromKey("d")).toEqual({ x: 1, y: 0 });
      expect(getDirectionFromKey("D")).toEqual({ x: 1, y: 0 });
    });

    it("should return null for unknown keys", () => {
      expect(getDirectionFromKey("Space")).toBeNull();
      expect(getDirectionFromKey("x")).toBeNull();
    });
  });

  describe("getSegmentBrightness", () => {
    it("should return 1 for head", () => {
      expect(getSegmentBrightness(0)).toBe(1);
    });

    it("should decrease with segment index", () => {
      expect(getSegmentBrightness(5)).toBeLessThan(getSegmentBrightness(0));
      expect(getSegmentBrightness(10)).toBeLessThan(getSegmentBrightness(5));
    });

    it("should not go below 0.4", () => {
      expect(getSegmentBrightness(100)).toBe(0.4);
    });
  });
});
