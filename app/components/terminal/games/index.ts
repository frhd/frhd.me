/**
 * Game engines barrel export
 */

// Types
export * from "./types";

// Tetris - explicitly export with namespace-like prefixes to avoid conflicts
export {
  TETROMINOES,
  TETROMINO_TYPES,
  DEFAULT_CONFIG as TETRIS_DEFAULT_CONFIG,
  createBoard as createTetrisBoard,
  createPiece as createTetrisPiece,
  createInitialState as createTetrisState,
  isValidMove as isTetrisMoveValid,
  rotatePieceShape,
  tryRotate,
  lockPiece,
  movePiece as moveTetrisPiece,
  rotatePiece,
  hardDrop,
  getGhostY,
  resetGame as resetTetris,
  togglePause as toggleTetrisPause,
} from "./tetris-engine";

// 2048 - explicitly export with namespace-like prefixes
export {
  DEFAULT_CONFIG as GAME_2048_DEFAULT_CONFIG,
  TILE_COLORS,
  createEmptyGrid,
  getEmptyCells,
  addRandomTile,
  canMove as canMove2048,
  hasWinningTile,
  slideRow,
  gridsEqual,
  createInitialState as create2048State,
  move as move2048,
  continueAfterWin,
  resetGame as reset2048,
  getTileColor,
} from "./game-2048-engine";

// Snake - explicitly export with namespace-like prefixes
export {
  DEFAULT_CONFIG as SNAKE_DEFAULT_CONFIG,
  createInitialSnake,
  createInitialState as createSnakeState,
  spawnFood,
  checkCollision as checkSnakeCollision,
  setDirection,
  update as updateSnake,
  togglePause as toggleSnakePause,
  resetGame as resetSnake,
  getDirectionFromKey,
  getSegmentBrightness,
} from "./snake-engine";
