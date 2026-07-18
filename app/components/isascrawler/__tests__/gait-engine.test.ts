import { describe, expect, it } from 'vitest'
import {
  FORWARD_GAIT,
  PHASE_SECONDS,
  jointStateAt,
} from '../gait-engine'

const legs = ['front', 'middle', 'rear'] as const

describe('FORWARD_GAIT keyframes', () => {
  it('has 8 keyframes (thesis phases a–h; i wraps into the loop)', () => {
    expect(FORWARD_GAIT.keyframes).toHaveLength(8)
  })

  it('starts at the resting pose', () => {
    const k0 = FORWARD_GAIT.keyframes[0]
    expect(k0.trunkLift).toBe(0)
    for (const leg of legs) {
      expect(k0[leg]).toEqual({ lift: 0, x: 0 })
    }
  })

  it('keeps the trunk lifted throughout the loop', () => {
    for (const k of FORWARD_GAIT.keyframes.slice(1)) {
      expect(k.trunkLift).toBeGreaterThan(0)
    }
  })

  it('never moves a leg horizontally while it is planted next to a lifted state', () => {
    // A leg's x may only change between keyframes where it is lifted,
    // except phase g (index 5→6) where the planted middle leg slides
    // relative to the trunk — that IS the trunk advancing.
    const ks = FORWARD_GAIT.keyframes
    for (let i = 1; i < ks.length; i++) {
      for (const leg of legs) {
        const moved = ks[i][leg].x !== ks[i - 1][leg].x
        const airborne = ks[i][leg].lift > 0 && ks[i - 1][leg].lift > 0
        const isTrunkAdvance = leg === 'middle' && i === 6
        if (moved) expect(airborne || isTrunkAdvance).toBe(true)
      }
    }
  })
})

describe('jointStateAt', () => {
  it('returns the resting pose at t=0', () => {
    expect(jointStateAt(0)).toEqual(FORWARD_GAIT.keyframes[0])
  })

  it('interpolates midway through a phase', () => {
    const mid = jointStateAt(PHASE_SECONDS / 2)
    expect(mid.trunkLift).toBeCloseTo(FORWARD_GAIT.keyframes[1].trunkLift / 2)
  })

  it('is continuous across the loop wrap', () => {
    const introSeconds = 2 * PHASE_SECONDS
    const loopSeconds =
      (FORWARD_GAIT.keyframes.length - FORWARD_GAIT.loopStartIndex) *
      PHASE_SECONDS
    const epsilon = 1e-4
    const endOfCycle = jointStateAt(introSeconds + loopSeconds - epsilon)
    const startOfNext = jointStateAt(introSeconds + loopSeconds + epsilon)
    expect(startOfNext.trunkLift).toBeCloseTo(endOfCycle.trunkLift, 1)
    for (const leg of legs) {
      expect(startOfNext[leg].x).toBeCloseTo(endOfCycle[leg].x, 1)
      expect(startOfNext[leg].lift).toBeCloseTo(endOfCycle[leg].lift, 1)
    }
  })

  it('never returns negative lifts', () => {
    for (let t = 0; t < 10; t += 0.05) {
      const s = jointStateAt(t)
      expect(s.trunkLift).toBeGreaterThanOrEqual(0)
      for (const leg of legs) expect(s[leg].lift).toBeGreaterThanOrEqual(0)
    }
  })
})
