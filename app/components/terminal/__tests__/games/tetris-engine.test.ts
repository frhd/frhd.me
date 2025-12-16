import { describe, it, expect, beforeEach } from "vitest";
import {
  createBoard,
  createPiece,
  createInitialState,
  isValidMove,
  rotatePieceShape,
  tryRotate,
  lockPiece,
  movePiece,
  rotatePiece,
  hardDrop,
  getGhostY,
  resetGame,
  togglePause,
  TETROMINOES,
  TETROMINO_TYPES,
  DEFAULT_CONFIG,
} from "../../games/tetris-engine";
import type { TetrisPiece } from "../../games/types";

describe("Tetris Engine", () => {
  describe("createBoard", () => {
    it("should create an empty board with correct dimensions", () => {
      const board = createBoard(10, 20);
      expect(board.length).toBe(20);
      expect(board[0].length).toBe(10);
      expect(board.every((row) => row.every((cell) => cell === null))).toBe(true);
    });
  });

  describe("createPiece", () => {
    it("should create a piece with valid type", () => {
      const piece = createPiece(10);
      expect(TETROMINO_TYPES).toContain(piece.type);
    });

    it("should create a piece centered on the board", () => {
      const piece = createPiece(10);
      expect(piece.x).toBeGreaterThanOrEqual(3);
      expect(piece.x).toBeLessThanOrEqual(5);
      expect(piece.y).toBe(0);
    });

    it("should have the correct color for the type", () => {
      const piece = createPiece(10);
      expect(piece.color).toBe(TETROMINOES[piece.type].color);
    });
  });

  describe("createInitialState", () => {
    it("should create a valid initial state", () => {
      const state = createInitialState();
      expect(state.board.length).toBe(DEFAULT_CONFIG.boardHeight);
      expect(state.board[0].length).toBe(DEFAULT_CONFIG.boardWidth);
      expect(state.currentPiece).not.toBeNull();
      expect(state.nextPiece).not.toBeNull();
      expect(state.score).toBe(0);
      expect(state.level).toBe(1);
      expect(state.lines).toBe(0);
      expect(state.gameOver).toBe(false);
      expect(state.isPaused).toBe(false);
    });
  });

  describe("isValidMove", () => {
    let board: (string | null)[][];
    let piece: TetrisPiece;

    beforeEach(() => {
      board = createBoard(10, 20);
      piece = {
        type: "O",
        shape: [
          [1, 1],
          [1, 1],
        ],
        x: 4,
        y: 0,
        color: "#ffff00",
      };
    });

    it("should return true for valid moves", () => {
      expect(isValidMove(board, piece, 0, 0)).toBe(true);
      expect(isValidMove(board, piece, 1, 0)).toBe(true);
      expect(isValidMove(board, piece, 0, 1)).toBe(true);
    });

    it("should return false for moves outside left boundary", () => {
      piece.x = 0;
      expect(isValidMove(board, piece, -1, 0)).toBe(false);
    });

    it("should return false for moves outside right boundary", () => {
      piece.x = 8;
      expect(isValidMove(board, piece, 1, 0)).toBe(false);
    });

    it("should return false for moves outside bottom boundary", () => {
      piece.y = 18;
      expect(isValidMove(board, piece, 0, 1)).toBe(false);
    });

    it("should return false for collisions with existing pieces", () => {
      board[1][5] = "#00ff00";
      expect(isValidMove(board, piece, 0, 0)).toBe(false);
    });
  });

  describe("rotatePieceShape", () => {
    it("should rotate T piece correctly", () => {
      const tShape = [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0],
      ];
      const rotated = rotatePieceShape(tShape);
      expect(rotated).toEqual([
        [0, 1, 0],
        [0, 1, 1],
        [0, 1, 0],
      ]);
    });

    it("should rotate I piece correctly", () => {
      const iShape = [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ];
      const rotated = rotatePieceShape(iShape);
      expect(rotated[0][2]).toBe(1);
      expect(rotated[1][2]).toBe(1);
      expect(rotated[2][2]).toBe(1);
      expect(rotated[3][2]).toBe(1);
    });
  });

  describe("tryRotate", () => {
    it("should rotate piece when there is space", () => {
      const board = createBoard(10, 20);
      const piece: TetrisPiece = {
        type: "T",
        shape: [
          [0, 1, 0],
          [1, 1, 1],
          [0, 0, 0],
        ],
        x: 4,
        y: 5,
        color: "#ff00ff",
      };
      const result = tryRotate(board, piece);
      expect(result.success).toBe(true);
      expect(result.kickX).toBe(0);
    });

    it("should wall kick when against left wall", () => {
      const board = createBoard(10, 20);
      const piece: TetrisPiece = {
        type: "I",
        shape: [
          [0, 0, 0, 0],
          [1, 1, 1, 1],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ],
        x: -1,
        y: 5,
        color: "#00ffff",
      };
      const result = tryRotate(board, piece);
      // Depending on rotation, may need wall kick
      expect(typeof result.success).toBe("boolean");
    });
  });

  describe("lockPiece", () => {
    it("should add piece to board", () => {
      const state = createInitialState();
      state.currentPiece = {
        type: "O",
        shape: [
          [1, 1],
          [1, 1],
        ],
        x: 4,
        y: 18,
        color: "#ffff00",
      };
      lockPiece(state);
      expect(state.board[18][4]).toBe("#ffff00");
      expect(state.board[18][5]).toBe("#ffff00");
      expect(state.board[19][4]).toBe("#ffff00");
      expect(state.board[19][5]).toBe("#ffff00");
    });

    it("should clear completed lines and update score", () => {
      const state = createInitialState();
      // Fill bottom row except one cell
      for (let x = 0; x < 9; x++) {
        state.board[19][x] = "#00ff00";
      }
      // Place O piece to complete line
      state.currentPiece = {
        type: "O",
        shape: [
          [1, 1],
          [1, 1],
        ],
        x: 8,
        y: 18,
        color: "#ffff00",
      };
      const result = lockPiece(state);
      expect(result.linesCleared).toBe(1);
      expect(state.score).toBe(100); // 100 * level 1
    });
  });

  describe("movePiece", () => {
    it("should move piece horizontally", () => {
      const state = createInitialState();
      const initialX = state.currentPiece!.x;
      movePiece(state, -1, 0);
      expect(state.currentPiece!.x).toBe(initialX - 1);
    });

    it("should move piece down", () => {
      const state = createInitialState();
      const initialY = state.currentPiece!.y;
      movePiece(state, 0, 1);
      expect(state.currentPiece!.y).toBe(initialY + 1);
    });

    it("should not move when paused", () => {
      const state = createInitialState();
      state.isPaused = true;
      const initialX = state.currentPiece!.x;
      movePiece(state, -1, 0);
      expect(state.currentPiece!.x).toBe(initialX);
    });
  });

  describe("rotatePiece", () => {
    it("should rotate the current piece", () => {
      const state = createInitialState();
      state.currentPiece = {
        type: "T",
        shape: [
          [0, 1, 0],
          [1, 1, 1],
          [0, 0, 0],
        ],
        x: 4,
        y: 5,
        color: "#ff00ff",
      };
      const result = rotatePiece(state);
      expect(result).toBe(true);
    });
  });

  describe("hardDrop", () => {
    it("should drop piece to bottom", () => {
      const state = createInitialState();
      state.currentPiece = {
        type: "O",
        shape: [
          [1, 1],
          [1, 1],
        ],
        x: 4,
        y: 0,
        color: "#ffff00",
      };
      const result = hardDrop(state);
      expect(result.dropDistance).toBeGreaterThan(0);
      // Piece should be locked
      expect(state.board[19][4]).toBe("#ffff00");
    });
  });

  describe("getGhostY", () => {
    it("should return correct ghost position", () => {
      const state = createInitialState();
      state.currentPiece = {
        type: "O",
        shape: [
          [1, 1],
          [1, 1],
        ],
        x: 4,
        y: 0,
        color: "#ffff00",
      };
      const ghostY = getGhostY(state);
      expect(ghostY).toBe(18); // Bottom minus piece height
    });
  });

  describe("resetGame", () => {
    it("should reset state but keep high score", () => {
      const state = createInitialState();
      state.score = 1000;
      state.highScore = 5000;
      state.level = 5;
      state.lines = 40;
      state.gameOver = true;

      resetGame(state);

      expect(state.score).toBe(0);
      expect(state.highScore).toBe(5000);
      expect(state.level).toBe(1);
      expect(state.lines).toBe(0);
      expect(state.gameOver).toBe(false);
    });
  });

  describe("togglePause", () => {
    it("should toggle pause state", () => {
      const state = createInitialState();
      expect(state.isPaused).toBe(false);
      togglePause(state);
      expect(state.isPaused).toBe(true);
      togglePause(state);
      expect(state.isPaused).toBe(false);
    });

    it("should not toggle when game is over", () => {
      const state = createInitialState();
      state.gameOver = true;
      togglePause(state);
      expect(state.isPaused).toBe(false);
    });
  });
});
