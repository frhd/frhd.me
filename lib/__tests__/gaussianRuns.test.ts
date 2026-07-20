import { describe, expect, it } from 'vitest'

import { parseRun, RUN_HEADER, STEPS_PER_RUN, TRAJECTORIES } from '../gaussianRuns'
import { loadGaussianRuns } from '../gaussianRunsLoader'

/**
 * Fixture helpers: build run CSVs as strings so the strict validation can be
 * exercised without temp files. Each cell defaults to its column index, so a
 * default row also asserts column -> field mapping.
 */
function row(overrides: Record<number, number | string> = {}): string {
  const cols = Array.from({ length: 15 }, (_, i) => String(i))
  for (const [col, value] of Object.entries(overrides)) {
    cols[Number(col)] = String(value)
  }
  return cols.join(',')
}

function csv(rows: string[]): string {
  return [RUN_HEADER, ...rows].join('\n')
}

function validRows(n = STEPS_PER_RUN): string[] {
  return Array.from({ length: n }, (_, i) => row({ 0: i }))
}

describe('parseRun', () => {
  it('parses a well-formed run into STEPS_PER_RUN steps', () => {
    const run = parseRun(csv(validRows()), 'circle')
    expect(run.trajectory).toBe('circle')
    expect(run.steps).toHaveLength(STEPS_PER_RUN)
  })

  it('maps columns to the right fields (and drops time/velocity/nis)', () => {
    const run = parseRun(csv(validRows()), 'circle')
    // default row cells equal their column index
    expect(run.steps[0]).toEqual({
      step: 0,
      trueX: 2,
      trueY: 3,
      measX: 4,
      measY: 5,
      estX: 6,
      estY: 7,
      covXX: 10,
      covXY: 11,
      covYY: 12,
      rmse: 13,
    })
  })

  it('rounds floats to 3 decimals', () => {
    const run = parseRun(csv([row({ 0: 0, 2: 1.23456 }), ...validRows(STEPS_PER_RUN - 1)]), 'line')
    expect(run.steps[0].trueX).toBe(1.235)
  })

  it('tolerates a trailing newline', () => {
    const run = parseRun(`${csv(validRows())}\n\n`, 'circle')
    expect(run.steps).toHaveLength(STEPS_PER_RUN)
  })

  it('rejects a malformed header', () => {
    expect(() => parseRun(['not,the,header', ...validRows()].join('\n'), 'circle')).toThrow(
      /unexpected CSV header/,
    )
  })

  it('rejects the wrong number of data rows', () => {
    expect(() => parseRun(csv(validRows(STEPS_PER_RUN - 1)), 'circle')).toThrow(
      /expected exactly 100 data rows/,
    )
  })

  it('rejects a non-finite value', () => {
    const bad = csv([row({ 4: 'nan' }), ...validRows(STEPS_PER_RUN - 1)])
    expect(() => parseRun(bad, 'circle')).toThrow(/non-finite/)
  })

  it('rejects an empty cell', () => {
    const bad = csv([row({ 7: '' }), ...validRows(STEPS_PER_RUN - 1)])
    expect(() => parseRun(bad, 'circle')).toThrow(/non-finite/)
  })

  it('rejects a row with the wrong column count', () => {
    const bad = csv(['0,1,2', ...validRows(STEPS_PER_RUN - 1)])
    expect(() => parseRun(bad, 'circle')).toThrow(/columns/)
  })
})

describe('loadGaussianRuns (real content files)', () => {
  const runs = loadGaussianRuns()

  it('loads all four trajectories in display order', () => {
    expect(Object.keys(runs)).toEqual([...TRAJECTORIES])
  })

  it('gives every run exactly STEPS_PER_RUN steps', () => {
    for (const trajectory of TRAJECTORIES) {
      expect(runs[trajectory].steps).toHaveLength(STEPS_PER_RUN)
    }
  })

  it('has finite, rounded numeric fields throughout', () => {
    for (const trajectory of TRAJECTORIES) {
      for (const step of runs[trajectory].steps) {
        for (const value of Object.values(step)) {
          expect(Number.isFinite(value)).toBe(true)
          // rounded to 3 decimals -> value*1000 is (near) integral
          expect(Math.abs(value * 1000 - Math.round(value * 1000))).toBeLessThan(1e-6)
        }
      }
    }
  })

  it('numbers steps 0..99 in order', () => {
    for (const trajectory of TRAJECTORIES) {
      expect(runs[trajectory].steps.map((s) => s.step)).toEqual(
        Array.from({ length: STEPS_PER_RUN }, (_, i) => i),
      )
    }
  })
})
