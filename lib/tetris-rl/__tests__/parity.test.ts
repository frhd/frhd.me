import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { TetrisRlEngine, type PieceSource, type StepInfo } from '../engine'
import { argmax, parseModel, qValues } from '../nn'
import { PieceType } from '../pieces'
import golden from './fixtures/golden-trace.json'

interface GoldenStep {
  current: number
  next: number
  flatState: number[]
  qValues: number[]
  action: number
  linesCleared: number
}

const trace = golden as {
  seed: number
  totalLines: number
  pieces: number
  officialScore: number
  steps: GoldenStep[]
}

/**
 * The piece feed the Python run consumed, reconstructed from the trace:
 * current of step 0, then every step's `next`. Reset draws the first two
 * (current, next); each step draws exactly one more. One extra draw happens on
 * the final game-over spawn — its value is never observed, so a fallback is safe.
 */
function feedSource(): PieceSource {
  const feed: PieceType[] = [trace.steps[0].current as PieceType]
  for (const step of trace.steps) feed.push(step.next as PieceType)
  let i = 0
  return () => (i < feed.length ? feed[i++] : PieceType.I)
}

function loadModel() {
  const raw = fs.readFileSync(
    path.join(process.cwd(), 'public/projects/tetris-rl-nn/model.bin'),
  )
  const ab = raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength)
  return parseModel(ab)
}

describe('golden-trace parity', () => {
  it('reproduces flatState, q-values, actions and clears for all 134 steps', () => {
    const net = loadModel()
    const engine = new TetrisRlEngine(feedSource())

    let last: StepInfo | undefined
    for (let k = 0; k < trace.steps.length; k++) {
      const step = trace.steps[k]

      const flat = engine.flatState()
      expect(flat[14 + step.current]).toBe(1)
      expect(flat[21 + step.next]).toBe(1)
      for (let j = 0; j < 28; j++) {
        expect(Math.abs(flat[j] - step.flatState[j])).toBeLessThan(1e-4)
      }

      const q = qValues(net, flat)
      for (let j = 0; j < 40; j++) {
        expect(Math.abs(q[j] - step.qValues[j])).toBeLessThan(1e-3)
      }

      expect(argmax(q)).toBe(step.action)

      last = engine.step(step.action)
      expect(last.linesCleared).toBe(step.linesCleared)
    }

    expect(engine.totalLines).toBe(39)
    expect(engine.officialScore).toBe(10800)
    expect(last?.gameOver).toBe(true)
    expect(trace.totalLines).toBe(39)
    expect(trace.officialScore).toBe(10800)
  })
})
