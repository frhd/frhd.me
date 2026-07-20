import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import TetrisRlFigure from '../TetrisRlFigure'

/**
 * End-to-end wiring test for the live figure: real weights are fetched
 * (stubbed transport), parsed, and the rAF state machine is pumped with a
 * fake clock until the network has visibly placed pieces on the board.
 * The decision quality itself is covered by lib/tetris-rl parity tests.
 */

const MODEL = readFileSync(
  join(process.cwd(), 'public/projects/tetris-rl-nn/model.bin'),
)

type RafCb = (t: number) => void

describe('TetrisRlFigure', () => {
  let rafQueue: RafCb[]
  let now: number

  beforeEach(() => {
    rafQueue = []
    now = 0

    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          arrayBuffer: () =>
            Promise.resolve(
              MODEL.buffer.slice(
                MODEL.byteOffset,
                MODEL.byteOffset + MODEL.byteLength,
              ),
            ),
        }),
      ),
    )

    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn().mockImplementation((cb: RafCb) => {
        rafQueue.push(cb)
        return rafQueue.length
      }),
    )
    vi.stubGlobal('cancelAnimationFrame', vi.fn())

    // Immediately-intersecting observer so the loop's in-view gate opens.
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb: IntersectionObserverCallback) {
          queueMicrotask(() =>
            cb(
              [{ isIntersecting: true, intersectionRatio: 1 }] as never,
              this as never,
            ),
          )
        }
        observe() {}
        disconnect() {}
        unobserve() {}
      },
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  /** Run every queued rAF callback once, advancing the fake clock. */
  const pumpFrame = (dt: number) => {
    now += dt
    const cbs = rafQueue
    rafQueue = []
    act(() => {
      for (const cb of cbs) cb(now)
    })
  }

  it('fetches the model and plays placements on the board', async () => {
    render(<TetrisRlFigure />)

    // Let the fetch/parse effect and the observer microtask settle.
    await act(async () => {
      await Promise.resolve()
    })

    expect(fetch).toHaveBeenCalledWith('/projects/tetris-rl-nn/model.bin')
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument()

    // Each 500ms fake frame clears at least one phase at 1× speed.
    for (let i = 0; i < 30 && rafQueue.length > 0; i++) pumpFrame(500)

    const hud = screen.getByText('pieces').parentElement
    const pieces = Number(hud?.querySelector('dd')?.textContent)
    expect(pieces).toBeGreaterThan(0)

    // The previews now show what the net is holding.
    expect(screen.getAllByRole('img', { name: /piece$/ }).length).toBe(2)
  })

  it('starts paused when the visitor prefers reduced motion', async () => {
    window.matchMedia('(prefers-reduced-motion: reduce)')
    // The shared mock defaults to non-matching; override for this test.
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: query.includes('prefers-reduced-motion'),
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        onchange: null,
        dispatchEvent: () => false,
      })),
    )

    render(<TetrisRlFigure />)
    await act(async () => {
      await Promise.resolve()
    })

    expect(
      screen.getByRole('button', { name: 'Play the agent' }),
    ).toBeInTheDocument()
  })
})
