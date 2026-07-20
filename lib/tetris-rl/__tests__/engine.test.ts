import { describe, expect, it } from 'vitest'

import {
  ACTION_MAPPING,
  BOARD_HEIGHT,
  BOARD_WIDTH,
  N_ACTIONS,
  sevenBag,
  spawnColumn,
  TetrisRlEngine,
  type PieceSource,
} from '../engine'
import { PIECE_SHAPES, PieceType } from '../pieces'

/** Deterministic source that deals a fixed sequence, then repeats the last. */
function fixedSource(...types: PieceType[]): PieceSource {
  let i = 0
  return () => types[Math.min(i++, types.length - 1)]
}

/** Simple seeded PRNG for deterministic shuffles. */
function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** row-major index into an engine grid. */
function fill(engine: TetrisRlEngine, row: number, col: number, type = PieceType.I): void {
  engine.grid[row * BOARD_WIDTH + col] = type + 1
}

describe('PIECE_SHAPES', () => {
  it('has 7 types, 4 rotations each, 4 cells per rotation', () => {
    expect(PIECE_SHAPES.length).toBe(7)
    for (const rotations of PIECE_SHAPES) {
      expect(rotations.length).toBe(4)
      for (const cells of rotations) {
        expect(cells.length).toBe(4)
        for (const cell of cells) {
          expect(cell.length).toBe(2)
          expect(Number.isInteger(cell[0])).toBe(true)
          expect(Number.isInteger(cell[1])).toBe(true)
        }
      }
    }
  })

  it('matches Python offsets for spot-checked pieces/rotations', () => {
    expect(PIECE_SHAPES[PieceType.T][0]).toEqual([[0, 1], [1, 0], [1, 1], [1, 2]])
    expect(PIECE_SHAPES[PieceType.I][1]).toEqual([[0, 0], [1, 0], [2, 0], [3, 0]])
    expect(PIECE_SHAPES[PieceType.L][0]).toEqual([[0, 2], [1, 0], [1, 1], [1, 2]])
    expect(PIECE_SHAPES[PieceType.J][3]).toEqual([[0, 1], [1, 1], [2, 0], [2, 1]])
    expect(PIECE_SHAPES[PieceType.O][2]).toEqual([[0, 0], [0, 1], [1, 0], [1, 1]])
  })
})

describe('ACTION_MAPPING', () => {
  it('is rotation-major with 40 entries (index = rotation*10 + col)', () => {
    expect(N_ACTIONS).toBe(40)
    expect(ACTION_MAPPING.length).toBe(40)
    expect(ACTION_MAPPING[0]).toEqual([0, 0])
    expect(ACTION_MAPPING[7]).toEqual([7, 0])
    expect(ACTION_MAPPING[10]).toEqual([0, 1])
    expect(ACTION_MAPPING[38]).toEqual([8, 3])
  })
})

describe('spawnColumn', () => {
  it('matches Python spawn x for all 7 pieces', () => {
    expect(spawnColumn(PieceType.I)).toBe(3)
    expect(spawnColumn(PieceType.O)).toBe(4)
    expect(spawnColumn(PieceType.T)).toBe(3)
    expect(spawnColumn(PieceType.S)).toBe(3)
    expect(spawnColumn(PieceType.Z)).toBe(3)
    expect(spawnColumn(PieceType.J)).toBe(3)
    expect(spawnColumn(PieceType.L)).toBe(3)
  })
})

describe('drop / lock', () => {
  it('hard-drops a vertical I to the floor and records absolute cells', () => {
    const engine = new TetrisRlEngine(fixedSource(PieceType.I, PieceType.I))
    // action 19 = rotation 1 (vertical), col 9
    const info = engine.step(19)
    expect(info.placed).not.toBeNull()
    expect(info.placed!.row).toBe(BOARD_HEIGHT - 4)
    expect(info.placed!.cells).toEqual([[16, 9], [17, 9], [18, 9], [19, 9]])
    expect(engine.grid[19 * BOARD_WIDTH + 9]).toBe(PieceType.I + 1)
  })

  it('settles a piece in the first valid window from the top (rests atop an overhang)', () => {
    const engine = new TetrisRlEngine(fixedSource(PieceType.I, PieceType.I))
    // A lone block at (5, 0) blocks the column part-way down.
    fill(engine, 5, 0)
    // Vertical I at col 0: rows 0-3 and 1-4 fit, rows 2-5 hit the block.
    const info = engine.step(10) // rotation 1, col 0
    expect(info.placed!.row).toBe(1)
    expect(info.placed!.cells).toEqual([[1, 0], [2, 0], [3, 0], [4, 0]])
    expect(info.linesCleared).toBe(0)
  })
})

describe('line clears', () => {
  it('clears a single completed row', () => {
    const engine = new TetrisRlEngine(fixedSource(PieceType.I, PieceType.I))
    for (let col = 0; col < BOARD_WIDTH - 1; col++) fill(engine, 19, col)
    const info = engine.step(19) // vertical I into col 9
    expect(info.linesCleared).toBe(1)
    expect(info.clearedRows).toEqual([19])
    expect(engine.totalLines).toBe(1)
    // Remaining I cells (rows 16-18) shift down one into rows 17-19.
    expect(engine.grid[19 * BOARD_WIDTH + 9]).toBe(PieceType.I + 1)
  })

  it('clears two rows at once', () => {
    const engine = new TetrisRlEngine(fixedSource(PieceType.I, PieceType.I))
    for (const row of [18, 19]) {
      for (let col = 0; col < BOARD_WIDTH - 1; col++) fill(engine, row, col)
    }
    const info = engine.step(19) // vertical I completes both rows in col 9
    expect(info.linesCleared).toBe(2)
    expect(info.clearedRows).toEqual([18, 19])
    expect(engine.totalLines).toBe(2)
  })

  it('applies official scoring and level-up', () => {
    const engine = new TetrisRlEngine(fixedSource(PieceType.I, PieceType.I))
    for (let col = 0; col < BOARD_WIDTH - 1; col++) fill(engine, 19, col)
    const info = engine.step(19)
    // single line at level 0: 40 * (0 + 1) = 40
    expect(info.officialScore).toBe(40)
    expect(info.level).toBe(0)
  })
})

describe('features', () => {
  it('reports heights, aggregate, max, holes, bumpiness for a hand-built board', () => {
    const engine = new TetrisRlEngine(fixedSource(PieceType.I, PieceType.I))
    fill(engine, 18, 0)
    fill(engine, 19, 0) // col 0 height 2
    fill(engine, 19, 1) // col 1 height 1
    fill(engine, 17, 2) // col 2 height 3, rows 18/19 empty -> 2 holes
    const f = engine.features()
    expect(Array.from(f.slice(0, 10))).toEqual([2, 1, 3, 0, 0, 0, 0, 0, 0, 0])
    expect(f[10]).toBe(6) // aggregate height
    expect(f[11]).toBe(3) // max height
    expect(f[12]).toBe(2) // holes
    expect(f[13]).toBe(6) // bumpiness: 1 + 2 + 3
  })

  it('flatState appends current + next one-hots to the 14 features', () => {
    const engine = new TetrisRlEngine(fixedSource(PieceType.T, PieceType.S))
    const flat = engine.flatState()
    expect(flat.length).toBe(28)
    expect(Array.from(flat.slice(0, 14))).toEqual(new Array(14).fill(0))
    expect(flat[14 + PieceType.T]).toBe(1)
    expect(flat[21 + PieceType.S]).toBe(1)
  })
})

describe('game over', () => {
  it('reports gameOver when the next piece cannot spawn', () => {
    const engine = new TetrisRlEngine(fixedSource(PieceType.O))
    // Fill the O spawn footprint (rows 0-1, cols 4-5) so the next spawn fails.
    for (const [r, c] of [[0, 4], [0, 5], [1, 4], [1, 5]]) fill(engine, r, c)
    // Drop somewhere that does not disturb the spawn area (col 0).
    const info = engine.step(0)
    expect(info.gameOver).toBe(true)
  })
})

describe('sevenBag', () => {
  it('deals every piece type exactly once per bag of 7', () => {
    const draw = sevenBag(mulberry32(12345))
    for (let bag = 0; bag < 10; bag++) {
      const seen = new Array<PieceType>(7)
      for (let i = 0; i < 7; i++) seen[i] = draw()
      expect([...seen].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 6])
    }
  })
})
