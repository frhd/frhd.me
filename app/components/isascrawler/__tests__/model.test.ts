import { describe, expect, it } from 'vitest'
import { buildCrawler, applyCrawlerState, DIMS } from '../model'
import { PHASE_SECONDS, jointStateAt } from '../gait-engine'

describe('buildCrawler', () => {
  const parts = buildCrawler()

  it('exposes root, trunk, and three leg groups', () => {
    expect(parts.root.children).toContain(parts.trunk)
    for (const leg of [parts.front, parts.middle, parts.rear]) {
      expect(parts.root.children).toContain(leg)
    }
  })

  it('places the trunk at rest height and legs at distinct x slots', () => {
    expect(parts.trunk.position.y).toBe(DIMS.trunk.restHeight)
    const xs = [parts.front, parts.middle, parts.rear].map((l) => l.position.x)
    expect(new Set(xs).size).toBe(3)
    expect(Math.max(...xs) - Math.min(...xs)).toBe(2 * DIMS.segmentSpacing)
  })

  it('legs are siblings of the trunk, not children (independent joints)', () => {
    expect(parts.trunk.children).not.toContain(parts.middle)
  })
})

describe('applyCrawlerState', () => {
  it('moves trunk and legs according to a gait state', () => {
    const parts = buildCrawler()
    const homeMiddleX = parts.middle.position.x
    const state = jointStateAt(4 * PHASE_SECONDS) // end of phase e: middle planted at full stride
    applyCrawlerState(parts, state)
    expect(parts.trunk.position.y).toBe(DIMS.trunk.restHeight + state.trunkLift)
    expect(parts.middle.position.x).toBe(homeMiddleX + state.middle.x)
    expect(parts.middle.position.y).toBe(state.middle.lift)
  })

  it('is idempotent for the same state (absolute, not additive)', () => {
    const parts = buildCrawler()
    const state = jointStateAt(1.5 * PHASE_SECONDS)
    applyCrawlerState(parts, state)
    const once = parts.middle.position.x
    applyCrawlerState(parts, state)
    expect(parts.middle.position.x).toBe(once)
  })
})
