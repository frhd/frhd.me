'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactElement } from 'react'

import {
  ACTION_MAPPING,
  BOARD_HEIGHT,
  BOARD_WIDTH,
  TetrisRlEngine,
} from '@/lib/tetris-rl/engine'
import { argmax, parseModel, qValues } from '@/lib/tetris-rl/nn'
import type { QNet } from '@/lib/tetris-rl/nn'
import { PIECE_SHAPES, PieceType } from '@/lib/tetris-rl/pieces'

const MODEL_URL = '/projects/tetris-rl-nn/model.bin'

type Cell = readonly [number, number]

/** CSS custom property per piece type, indexed by PieceType (I,O,T,S,Z,J,L). */
const PIECE_VARS = [
  '--tetris-i',
  '--tetris-o',
  '--tetris-t',
  '--tetris-s',
  '--tetris-z',
  '--tetris-j',
  '--tetris-l',
] as const

const PIECE_NAMES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'] as const

/** Colour for a filled board cell (grid value 1..7 → piece 0..6). */
function cellColor(value: number): string {
  return `var(${PIECE_VARS[value - 1] ?? '--tetris-i'})`
}

/** Base per-placement phase durations in ms, at 1× speed. */
const THINK_MS = 380
const DROP_MS = 260
const FLASH_MS = 240
const SETTLE_MS = 90
const GAMEOVER_MS = 650

type Speed = 1 | 4 | 16

/** Shape returned by TetrisRlEngine.step — kept structural to avoid coupling. */
interface StepInfo {
  linesCleared: number
  clearedRows: number[]
  totalLines: number
  officialScore: number
  level: number
  gameOver: boolean
  placed: {
    type: PieceType
    rotation: number
    col: number
    row: number
    cells: Cell[]
  } | null
}

interface Decision {
  /** Board (row-major, 0 empty) before the piece is placed. */
  preGrid: Uint8Array
  info: StepInfo
  /** Cells the chosen placement occupies (its final resting spot). */
  landing: Cell[]
  /** The piece being placed. */
  type: PieceType
  /** Per-column normalized max-Q heat, 0..1, one per board column. */
  heat: number[]
  chosenCol: number
  /** Topmost row of the landing — the visible fall distance from row 0. */
  minRow: number
}

type PhaseName = 'start' | 'think' | 'drop' | 'flash' | 'gameover'

/** Everything the SVG needs for the current frame. */
interface View {
  grid: Uint8Array
  phase: PhaseName
  heat: number[] | null
  chosenCol: number
  ghost: Cell[] | null
  ghostType: PieceType | null
  falling: { cells: Cell[]; type: PieceType; shift: number } | null
  flashRows: number[] | null
  gameOver: boolean
}

interface Stats {
  lines: number
  pieces: number
  score: number
  level: number
  games: number
  /** 14 board features: heights[10], aggregate, max, holes, bumpiness. */
  features: number[]
  current: PieceType | null
  next: PieceType | null
}

const EMPTY_GRID = new Uint8Array(BOARD_WIDTH * BOARD_HEIGHT)

const INITIAL_VIEW: View = {
  grid: EMPTY_GRID,
  phase: 'start',
  heat: null,
  chosenCol: -1,
  ghost: null,
  ghostType: null,
  falling: null,
  flashRows: null,
  gameOver: false,
}

const INITIAL_STATS: Stats = {
  lines: 0,
  pieces: 0,
  score: 0,
  level: 0,
  games: 0,
  features: new Array(14).fill(0),
  current: null,
  next: null,
}

/** Overlay `cells` (coloured as `type`) onto a copy of `base`. */
function withPiece(base: Uint8Array, cells: Cell[], type: PieceType): Uint8Array {
  const g = base.slice()
  for (const [r, c] of cells) {
    if (r >= 0 && r < BOARD_HEIGHT && c >= 0 && c < BOARD_WIDTH) {
      g[r * BOARD_WIDTH + c] = type + 1
    }
  }
  return g
}

/** Per-column max Q across rotations, normalized to 0..1 for this decision. */
function columnHeat(q: Float64Array): number[] {
  const maxByCol = new Array(BOARD_WIDTH).fill(-Infinity)
  for (let a = 0; a < ACTION_MAPPING.length; a++) {
    const col = ACTION_MAPPING[a][0]
    if (col >= 0 && col < BOARD_WIDTH && q[a] > maxByCol[col]) maxByCol[col] = q[a]
  }
  let lo = Infinity
  let hi = -Infinity
  for (const v of maxByCol) {
    if (v < lo) lo = v
    if (v > hi) hi = v
  }
  const span = hi - lo
  return maxByCol.map((v) => (span > 1e-9 ? (v - lo) / span : 0.5))
}

export default function TetrisRlFigure() {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState<Speed>(1)
  const [inView, setInView] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [view, setView] = useState<View>(INITIAL_VIEW)
  const [stats, setStats] = useState<Stats>(INITIAL_STATS)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const engineRef = useRef<TetrisRlEngine | null>(null)
  const netRef = useRef<QNet | null>(null)
  const gamesRef = useRef(0)
  const reducedRef = useRef(false)

  // Live mirrors so the rAF loop can read intent without re-subscribing.
  const speedRef = useRef<Speed>(speed)
  useEffect(() => {
    speedRef.current = speed
  }, [speed])

  // Fetch + parse the trained weights once, on mount (client only).
  useEffect(() => {
    let alive = true
    reducedRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ;(async () => {
      try {
        const res = await fetch(MODEL_URL)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const buf = await res.arrayBuffer()
        if (!alive) return
        netRef.current = parseModel(buf)
        engineRef.current = new TetrisRlEngine()
        engineRef.current.reset()
        setStatus('ready')
        // Autoplay only when motion is allowed; the observer starts it in view.
        if (!reducedRef.current) setPlaying(true)
      } catch {
        if (alive) setStatus('error')
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  // Pause playback while the figure is scrolled out of view.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => setInView(entries.some((e) => e.isIntersecting)),
      { threshold: 0.15 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Pause playback while the tab is hidden.
  useEffect(() => {
    const onVis = () => setHidden(document.hidden)
    onVis()
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  // Compute the next placement: read the board the net sees, pick an action,
  // step the engine for the authoritative outcome, and stage the animation.
  const decide = useCallback((): Decision | null => {
    const engine = engineRef.current
    const net = netRef.current
    if (!engine || !net) return null

    const preGrid = engine.grid.slice()
    const flat = engine.flatState()
    const q = qValues(net, flat)
    const action = argmax(q)
    const heat = columnHeat(q)
    const chosenCol = ACTION_MAPPING[action]?.[0] ?? action % BOARD_WIDTH

    const current = engine.currentPiece
    const nextPiece = engine.nextPiece
    const features = Array.from(flat.slice(0, 14))

    const info = engine.step(action) as StepInfo
    const landing = info.placed?.cells ?? []
    const type = info.placed?.type ?? current
    let minRow = BOARD_HEIGHT
    for (const [r] of landing) if (r < minRow) minRow = r
    if (landing.length === 0) minRow = 0

    // Board features + which piece is in play update once per decision.
    setStats((s) => ({ ...s, features, current, next: nextPiece }))

    return { preGrid, info, landing, type, heat, chosenCol, minRow }
  }, [])

  // The playback state machine, driven by requestAnimationFrame. It only runs
  // (and only costs frames) while playing, ready, visible, and tab-focused.
  useEffect(() => {
    if (status !== 'ready' || !playing || !inView || hidden) return
    const engine = engineRef.current
    if (!engine) return

    let raf = 0
    let phase: PhaseName = 'start'
    let phaseStart: number | null = null
    let decision: Decision | null = null
    const reduced = reducedRef.current

    const beginDecision = (t: number) => {
      decision = decide()
      if (!decision) return
      setView({
        grid: decision.preGrid,
        phase: 'think',
        heat: decision.heat,
        chosenCol: decision.chosenCol,
        ghost: decision.landing,
        ghostType: decision.type,
        falling: null,
        flashRows: null,
        gameOver: false,
      })
      phase = 'think'
      phaseStart = t
    }

    // Advance the machine by (at most) one transition. Returns true if it
    // transitioned instantly (so a fast speed can chain several per frame).
    const advance = (t: number): boolean => {
      const sp = speedRef.current
      if (phaseStart === null) phaseStart = t
      const elapsed = t - phaseStart

      if (phase === 'start') {
        beginDecision(t)
        return true
      }

      if (!decision) {
        beginDecision(t)
        return true
      }
      const d = decision

      if (phase === 'think') {
        if (elapsed < THINK_MS / sp) return false
        const skipFall = reduced || sp >= 16 || d.minRow <= 0 || d.landing.length === 0
        if (skipFall) {
          setView({
            grid: withPiece(d.preGrid, d.landing, d.type),
            phase: 'flash',
            heat: null,
            chosenCol: d.chosenCol,
            ghost: null,
            ghostType: null,
            falling: null,
            flashRows: d.info.clearedRows,
            gameOver: false,
          })
          phase = 'flash'
        } else {
          setView({
            grid: d.preGrid,
            phase: 'drop',
            heat: null,
            chosenCol: d.chosenCol,
            ghost: d.landing,
            ghostType: d.type,
            falling: { cells: d.landing, type: d.type, shift: d.minRow },
            flashRows: null,
            gameOver: false,
          })
          phase = 'drop'
        }
        phaseStart = t
        return true
      }

      if (phase === 'drop') {
        const dur = DROP_MS / sp
        const progress = dur > 0 ? Math.min(1, elapsed / dur) : 1
        const shift = d.minRow * (1 - progress)
        if (progress >= 1) {
          setView({
            grid: withPiece(d.preGrid, d.landing, d.type),
            phase: 'flash',
            heat: null,
            chosenCol: d.chosenCol,
            ghost: null,
            ghostType: null,
            falling: null,
            flashRows: d.info.clearedRows,
            gameOver: false,
          })
          phase = 'flash'
          phaseStart = t
          return true
        }
        // Still falling: update the offset, stay in this phase.
        setView((v) =>
          v.falling ? { ...v, falling: { ...v.falling, shift } } : v,
        )
        return false
      }

      if (phase === 'flash') {
        const dur = (d.info.clearedRows.length > 0 ? FLASH_MS : SETTLE_MS) / sp
        if (elapsed < dur) return false
        // Commit the authoritative post-step board and update the HUD counts.
        setStats((s) => ({
          ...s,
          lines: d.info.totalLines,
          pieces: engine.pieces,
          score: d.info.officialScore,
          level: d.info.level,
        }))
        if (d.info.gameOver) {
          setView({
            grid: engine.grid.slice(),
            phase: 'gameover',
            heat: null,
            chosenCol: -1,
            ghost: null,
            ghostType: null,
            falling: null,
            flashRows: null,
            gameOver: true,
          })
          phase = 'gameover'
          phaseStart = t
          return true
        }
        setView({
          grid: engine.grid.slice(),
          phase: 'start',
          heat: null,
          chosenCol: -1,
          ghost: null,
          ghostType: null,
          falling: null,
          flashRows: null,
          gameOver: false,
        })
        phase = 'start'
        phaseStart = t
        return true
      }

      if (phase === 'gameover') {
        if (elapsed < Math.max(250, GAMEOVER_MS / sp)) return false
        gamesRef.current += 1
        engine.reset()
        setStats((s) => ({ ...s, games: gamesRef.current }))
        setView({
          grid: engine.grid.slice(),
          phase: 'start',
          heat: null,
          chosenCol: -1,
          ghost: null,
          ghostType: null,
          falling: null,
          flashRows: null,
          gameOver: false,
        })
        phase = 'start'
        phaseStart = t
        return true
      }

      return false
    }

    const tick = (t: number) => {
      // Chain instantaneous transitions so high speeds actually run faster,
      // capped so a frame can never spin forever.
      let guard = 0
      while (guard++ < 64 && advance(t)) {
        /* keep advancing while phases complete instantly this frame */
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [status, playing, inView, hidden, decide])

  const togglePlay = () => setPlaying((p) => !p)
  const cycleSpeed = () =>
    setSpeed((s) => (s === 1 ? 4 : s === 4 ? 16 : 1))

  const loading = status === 'loading'
  const errored = status === 'error'

  return (
    <div className="trl" ref={containerRef}>
      <div className="trl-stage">
        <Board view={view} />
        <div className="trl-panel">
          <Hud stats={stats} />
          <Pieces current={stats.current} next={stats.next} />
          <Features features={stats.features} />
        </div>
      </div>

      <div className="trl-controls">
        <button
          type="button"
          className="trl-btn"
          onClick={togglePlay}
          disabled={loading || errored}
          aria-label={playing ? 'Pause the agent' : 'Play the agent'}
        >
          {playing ? '❚❚ pause' : '▶ play'}
        </button>

        <button
          type="button"
          className="trl-btn trl-speed"
          onClick={cycleSpeed}
          disabled={loading || errored}
          aria-label={`Playback speed ${speed} times; tap to change`}
        >
          speed {speed}×
        </button>

        <span className="trl-status" aria-live="polite">
          {loading
            ? 'loading network…'
            : errored
              ? 'network failed to load'
              : view.gameOver
                ? 'game over'
                : `${stats.games} game${stats.games === 1 ? '' : 's'} played`}
        </span>
      </div>
    </div>
  )
}

/* --- board --- */

const INSET = 0.06
const R = 0.14
const HEAT_Y = BOARD_HEIGHT + 0.3
const HEAT_H = 0.5

function Board({ view }: { view: View }) {
  const { grid, heat, chosenCol, ghost, ghostType, falling, flashRows, gameOver } = view
  const ghostStroke =
    ghostType !== null ? `var(${PIECE_VARS[ghostType]})` : 'var(--accent)'
  const cells: ReactElement[] = []

  for (let i = 0; i < grid.length; i++) {
    const v = grid[i]
    if (v === 0) continue
    const r = Math.floor(i / BOARD_WIDTH)
    const c = i % BOARD_WIDTH
    cells.push(
      <rect
        key={`c${i}`}
        x={c + INSET}
        y={r + INSET}
        width={1 - 2 * INSET}
        height={1 - 2 * INSET}
        rx={R}
        fill={cellColor(v)}
      />,
    )
  }

  return (
    <svg
      className="trl-board"
      viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT + 1}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="The trained network playing Tetris: its board, the piece it is dropping, and a per-column heat strip of how good it rates each landing column."
    >
      {/* board frame */}
      <rect x={0} y={0} width={BOARD_WIDTH} height={BOARD_HEIGHT} fill="var(--tetris-board)" />
      {/* grid lines */}
      {Array.from({ length: BOARD_WIDTH - 1 }, (_, i) => (
        <line
          key={`gx${i}`}
          x1={i + 1}
          y1={0}
          x2={i + 1}
          y2={BOARD_HEIGHT}
          stroke="var(--tetris-grid)"
          strokeWidth={0.02}
        />
      ))}
      {Array.from({ length: BOARD_HEIGHT - 1 }, (_, i) => (
        <line
          key={`gy${i}`}
          x1={0}
          y1={i + 1}
          x2={BOARD_WIDTH}
          y2={i + 1}
          stroke="var(--tetris-grid)"
          strokeWidth={0.02}
        />
      ))}

      {/* locked cells */}
      {cells}

      {/* flash cleared rows */}
      {flashRows?.map((r) => (
        <rect
          key={`f${r}`}
          x={0}
          y={r}
          width={BOARD_WIDTH}
          height={1}
          fill="var(--tetris-flash)"
          opacity={0.75}
        />
      ))}

      {/* ghost outline of the chosen placement */}
      {ghost?.map(([r, c], i) => (
        <rect
          key={`g${i}`}
          x={c + INSET}
          y={r + INSET}
          width={1 - 2 * INSET}
          height={1 - 2 * INSET}
          rx={R}
          fill="none"
          stroke={falling ? 'var(--tetris-grid)' : ghostStroke}
          strokeWidth={0.05}
          strokeDasharray="0.18 0.12"
          opacity={0.7}
        />
      ))}

      {/* falling piece */}
      {falling && (
        <g transform={`translate(0 ${(-falling.shift).toFixed(3)})`}>
          {falling.cells.map(([r, c], i) => (
            <rect
              key={`p${i}`}
              x={c + INSET}
              y={r + INSET}
              width={1 - 2 * INSET}
              height={1 - 2 * INSET}
              rx={R}
              fill={`var(${PIECE_VARS[falling.type]})`}
            />
          ))}
        </g>
      )}

      {/* per-column heat strip beneath the board */}
      {heat?.map((val, c) => (
        <rect
          key={`h${c}`}
          x={c + INSET}
          y={HEAT_Y}
          width={1 - 2 * INSET}
          height={HEAT_H}
          rx={0.08}
          fill="var(--accent)"
          opacity={0.12 + 0.6 * val}
        />
      ))}
      {chosenCol >= 0 && heat && (
        <rect
          x={chosenCol + INSET}
          y={HEAT_Y}
          width={1 - 2 * INSET}
          height={HEAT_H}
          rx={0.08}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={0.06}
        />
      )}

      {gameOver && (
        <>
          <rect
            x={0}
            y={0}
            width={BOARD_WIDTH}
            height={BOARD_HEIGHT}
            fill="var(--tetris-board)"
            opacity={0.7}
          />
          <text
            x={BOARD_WIDTH / 2}
            y={BOARD_HEIGHT / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={1}
            fill="var(--fg)"
            fontFamily="var(--font-mono)"
          >
            game over
          </text>
        </>
      )}
    </svg>
  )
}

/* --- HUD --- */

function Hud({ stats }: { stats: Stats }) {
  const items: [string, string | number][] = [
    ['lines', stats.lines],
    ['pieces', stats.pieces],
    ['score', stats.score],
    ['level', stats.level],
    ['games', stats.games],
  ]
  return (
    <dl className="trl-hud">
      {items.map(([label, value]) => (
        <div key={label} className="trl-hud-item">
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}

/* --- current / next piece previews --- */

function PiecePreview({ type }: { type: PieceType | null }) {
  if (type === null) {
    return <svg className="trl-preview" viewBox="0 0 4 2" aria-hidden="true" />
  }
  const shape = PIECE_SHAPES[type][0] as Cell[]
  let minR = Infinity
  let minC = Infinity
  let maxR = -Infinity
  let maxC = -Infinity
  for (const [r, c] of shape) {
    if (r < minR) minR = r
    if (c < minC) minC = c
    if (r > maxR) maxR = r
    if (c > maxC) maxC = c
  }
  const w = maxC - minC + 1
  const h = maxR - minR + 1
  return (
    <svg
      className="trl-preview"
      viewBox={`${-0.15} ${-0.15} ${w + 0.3} ${h + 0.3}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`${PIECE_NAMES[type]} piece`}
    >
      {shape.map(([r, c], i) => (
        <rect
          key={i}
          x={c - minC + INSET}
          y={r - minR + INSET}
          width={1 - 2 * INSET}
          height={1 - 2 * INSET}
          rx={R}
          fill={`var(${PIECE_VARS[type]})`}
        />
      ))}
    </svg>
  )
}

function Pieces({ current, next }: { current: PieceType | null; next: PieceType | null }) {
  return (
    <div className="trl-pieces">
      <div className="trl-piece-slot">
        <span className="trl-piece-label">current</span>
        <PiecePreview type={current} />
      </div>
      <div className="trl-piece-slot">
        <span className="trl-piece-label">next</span>
        <PiecePreview type={next} />
      </div>
    </div>
  )
}

/* --- feature readout --- */

function Features({ features }: { features: number[] }) {
  const heights = features.slice(0, 10)
  const aggregate = features[10] ?? 0
  const maxHeight = features[11] ?? 0
  const holes = features[12] ?? 0
  const bumpiness = features[13] ?? 0
  const maxBar = Math.max(1, ...heights, BOARD_HEIGHT)

  const scalars: [string, number][] = [
    ['aggregate', aggregate],
    ['max', maxHeight],
    ['holes', holes],
    ['bump', bumpiness],
  ]

  return (
    <div className="trl-features">
      <span className="trl-features-title">board features</span>
      <svg
        className="trl-heights"
        viewBox={`0 0 ${BOARD_WIDTH} 4`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`Column heights: ${heights.map((h) => Math.round(h)).join(', ')}`}
      >
        {heights.map((h, c) => {
          const bh = (h / maxBar) * 4
          return (
            <rect
              key={c}
              x={c + 0.12}
              y={4 - bh}
              width={1 - 0.24}
              height={bh}
              fill="var(--accent)"
              opacity={0.55}
            />
          )
        })}
      </svg>
      <dl className="trl-scalars">
        {scalars.map(([label, value]) => (
          <div key={label} className="trl-scalar">
            <dt>{label}</dt>
            <dd>{Math.round(value)}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
