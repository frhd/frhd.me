/**
 * Placement-based Tetris environment, a faithful TypeScript port of the Python
 * `TetrisEnv`/`Board` (`tetris_rl/environment/{tetris_env,board}.py`). The agent
 * picks a `(column, rotation)` per step and the piece hard-drops into place; the
 * observation it scores is `flatState()`.
 *
 * Deliberate deviation from the Python `Board`, which stores mere presence:
 * `grid` stores `pieceType + 1` so a renderer can colour cells. All feature code
 * treats any nonzero value as "filled", exactly like the Python `grid != 0`.
 */

import { PIECE_SHAPES, PieceType } from './pieces'

export const BOARD_WIDTH = 10
export const BOARD_HEIGHT = 20
export const N_ACTIONS = 40

/**
 * Action index -> `[col, rotation]`, built rotation-major (`rotation * 10 + col`)
 * to match the Python `_build_action_mapping`. NOTE: the invalid-action fallback
 * in `step` scans column-major instead — a different order, preserved on purpose.
 */
export const ACTION_MAPPING: ReadonlyArray<readonly [number, number]> = (() => {
  const mapping: Array<readonly [number, number]> = []
  for (let rotation = 0; rotation < 4; rotation++) {
    for (let col = 0; col < BOARD_WIDTH; col++) {
      mapping.push([col, rotation])
    }
  }
  return mapping
})()

const BASE_SCORES: Record<number, number> = { 1: 40, 2: 100, 3: 300, 4: 1200 }

export type PieceSource = () => PieceType

/**
 * Official-guideline 7-bag: shuffle all seven types, deal until empty, refill.
 * Mirrors the Python `_refill_bag` + `pop()` (draws from the end of the bag).
 * The RNG is injectable so tests are deterministic; production uses `Math.random`.
 */
export function sevenBag(random: () => number = Math.random): PieceSource {
  let bag: PieceType[] = []
  return () => {
    if (bag.length === 0) {
      bag = [
        PieceType.I,
        PieceType.O,
        PieceType.T,
        PieceType.S,
        PieceType.Z,
        PieceType.J,
        PieceType.L,
      ]
      for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1))
        const tmp = bag[i]
        bag[i] = bag[j]
        bag[j] = tmp
      }
    }
    return bag.pop() as PieceType
  }
}

export interface PlacedPiece {
  type: PieceType
  rotation: number
  col: number
  /** Final y (top row of the piece's anchor) after the hard drop. */
  row: number
  /** Absolute `[row, col]` of the four locked cells (before any line clear). */
  cells: ReadonlyArray<readonly [number, number]>
}

export interface StepInfo {
  linesCleared: number
  /** Absolute row indices cleared this step, empty when none. */
  clearedRows: ReadonlyArray<number>
  totalLines: number
  officialScore: number
  level: number
  gameOver: boolean
  /** null only in the impossible-placement edge case (piece fits nowhere). */
  placed: PlacedPiece | null
}

/** Rotation-0 spawn column: `(width - pieceWidth) // 2 - minCol`, Python floordiv. */
export function spawnColumn(type: PieceType): number {
  const shape = PIECE_SHAPES[type][0]
  let minCol = Infinity
  let maxCol = -Infinity
  for (const [, c] of shape) {
    if (c < minCol) minCol = c
    if (c > maxCol) maxCol = c
  }
  const pieceWidth = maxCol - minCol + 1
  return Math.floor((BOARD_WIDTH - pieceWidth) / 2) - minCol
}

interface Drop {
  col: number
  rotation: number
  y: number
}

export class TetrisRlEngine {
  readonly grid: Uint8Array = new Uint8Array(BOARD_HEIGHT * BOARD_WIDTH)
  currentPiece: PieceType = PieceType.I
  nextPiece: PieceType = PieceType.I
  totalLines = 0
  officialScore = 0
  level = 0
  pieces = 0

  private readonly source: PieceSource

  constructor(source: PieceSource = sevenBag()) {
    this.source = source
    this.reset()
  }

  reset(): void {
    this.grid.fill(0)
    this.totalLines = 0
    this.officialScore = 0
    this.level = 0
    this.pieces = 0
    // First draw becomes current, second becomes next (matches Python reset).
    this.currentPiece = this.source()
    this.nextPiece = this.source()
  }

  private isValidPosition(
    type: PieceType,
    rotation: number,
    row: number,
    col: number,
  ): boolean {
    for (const [dr, dc] of PIECE_SHAPES[type][rotation]) {
      const r = row + dr
      const c = col + dc
      if (r < 0 || r >= BOARD_HEIGHT) return false
      if (c < 0 || c >= BOARD_WIDTH) return false
      if (this.grid[r * BOARD_WIDTH + c] !== 0) return false
    }
    return true
  }

  /**
   * Hard-drop scan: y from 0..19, remember the last valid y, and break once a
   * position is invalid AND some valid y was already seen. This settles a piece
   * in the FIRST open window from the top, so it can rest atop an overhang.
   */
  private tryDrop(type: PieceType, col: number, rotation: number): Drop | null {
    let lastValidY = -1
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      if (this.isValidPosition(type, rotation, y, col)) {
        lastValidY = y
      } else if (lastValidY >= 0) {
        break
      }
    }
    if (lastValidY < 0) return null
    return { col, rotation, y: lastValidY }
  }

  private lockPiece(drop: Drop, type: PieceType): PlacedPiece {
    const cells: Array<readonly [number, number]> = []
    for (const [dr, dc] of PIECE_SHAPES[type][drop.rotation]) {
      const r = drop.y + dr
      const c = drop.col + dc
      this.grid[r * BOARD_WIDTH + c] = type + 1
      cells.push([r, c])
    }
    return { type, rotation: drop.rotation, col: drop.col, row: drop.y, cells }
  }

  private clearLines(): { count: number; rows: number[] } {
    const fullRows: number[] = []
    for (let row = 0; row < BOARD_HEIGHT; row++) {
      let full = true
      for (let col = 0; col < BOARD_WIDTH; col++) {
        if (this.grid[row * BOARD_WIDTH + col] === 0) {
          full = false
          break
        }
      }
      if (full) fullRows.push(row)
    }
    if (fullRows.length === 0) return { count: 0, rows: [] }

    // Rebuild: keep non-full rows in order, prepend that many empty rows at top.
    const kept: number[] = []
    const cleared = new Set(fullRows)
    for (let row = 0; row < BOARD_HEIGHT; row++) {
      if (!cleared.has(row)) kept.push(row)
    }
    const next = new Uint8Array(BOARD_HEIGHT * BOARD_WIDTH)
    let destRow = BOARD_HEIGHT - 1
    for (let i = kept.length - 1; i >= 0; i--) {
      const srcRow = kept[i]
      next.set(
        this.grid.subarray(srcRow * BOARD_WIDTH, srcRow * BOARD_WIDTH + BOARD_WIDTH),
        destRow * BOARD_WIDTH,
      )
      destRow--
    }
    this.grid.set(next)
    return { count: fullRows.length, rows: fullRows }
  }

  private columnHeights(): number[] {
    const heights = new Array<number>(BOARD_WIDTH).fill(0)
    for (let col = 0; col < BOARD_WIDTH; col++) {
      for (let row = 0; row < BOARD_HEIGHT; row++) {
        if (this.grid[row * BOARD_WIDTH + col] !== 0) {
          heights[col] = BOARD_HEIGHT - row
          break
        }
      }
    }
    return heights
  }

  private holes(): number {
    let holes = 0
    for (let col = 0; col < BOARD_WIDTH; col++) {
      let firstOccupied = -1
      for (let row = 0; row < BOARD_HEIGHT; row++) {
        if (this.grid[row * BOARD_WIDTH + col] !== 0) {
          firstOccupied = row
          break
        }
      }
      if (firstOccupied >= 0) {
        for (let row = firstOccupied; row < BOARD_HEIGHT; row++) {
          if (this.grid[row * BOARD_WIDTH + col] === 0) holes++
        }
      }
    }
    return holes
  }

  features(): Float32Array {
    const heights = this.columnHeights()
    const f = new Float32Array(14)
    let aggregate = 0
    let max = 0
    let bumpiness = 0
    for (let col = 0; col < BOARD_WIDTH; col++) {
      f[col] = heights[col]
      aggregate += heights[col]
      if (heights[col] > max) max = heights[col]
      if (col > 0) bumpiness += Math.abs(heights[col] - heights[col - 1])
    }
    f[10] = aggregate
    f[11] = max
    f[12] = this.holes()
    f[13] = bumpiness
    return f
  }

  flatState(): Float32Array {
    const state = new Float32Array(28)
    state.set(this.features(), 0)
    state[14 + this.currentPiece] = 1
    state[21 + this.nextPiece] = 1
    return state
  }

  step(action: number): StepInfo {
    const [col, rotation] = ACTION_MAPPING[action]
    const type = this.currentPiece

    let drop = this.tryDrop(type, col, rotation)
    if (drop === null) {
      // Invalid action: fall back to the first placement scanning column-major
      // (col outer, rotation inner) — intentionally different order to the
      // rotation-major action mapping above.
      for (let c = 0; c < BOARD_WIDTH && drop === null; c++) {
        for (let rot = 0; rot < 4; rot++) {
          drop = this.tryDrop(type, c, rot)
          if (drop !== null) break
        }
      }
    }

    let linesCleared = 0
    let clearedRows: number[] = []
    let placed: PlacedPiece | null = null
    if (drop !== null) {
      placed = this.lockPiece(drop, type)
      const cleared = this.clearLines()
      linesCleared = cleared.count
      clearedRows = cleared.rows
      this.pieces++
    }

    this.totalLines += linesCleared
    if (linesCleared > 0) {
      this.officialScore += BASE_SCORES[linesCleared] * (this.level + 1)
      this.level = Math.floor(this.totalLines / 10)
    }

    // Spawn next: current <- next, draw a fresh next; game over when the newly
    // spawned current cannot sit at its spawn position.
    this.currentPiece = this.nextPiece
    this.nextPiece = this.source()
    const gameOver = !this.isValidPosition(
      this.currentPiece,
      0,
      0,
      spawnColumn(this.currentPiece),
    )

    return {
      linesCleared,
      clearedRows,
      totalLines: this.totalLines,
      officialScore: this.officialScore,
      level: this.level,
      gameOver,
      placed,
    }
  }
}
