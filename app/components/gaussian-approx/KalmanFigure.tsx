'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import type { GaussianRuns, Run, Trajectory } from '@/lib/gaussianRuns'
import { STEPS_PER_RUN, TRAJECTORIES } from '@/lib/gaussianRuns'

import { covarianceEllipse, toDegrees } from './ellipse'

const FINAL_STEP = STEPS_PER_RUN - 1 // steps are 0..99
const STEP_MS = 85 // ~11.7 steps/sec
const HOLD_MS = 1500 // pause on the final frame before looping

/** Human labels for the segmented switcher, in display order. */
const TRAJECTORY_LABELS: Record<Trajectory, string> = {
  circle: 'circle',
  line: 'line',
  fig8: 'fig8',
  random: 'random',
}

type Point = readonly [number, number]

interface RunGeometry {
  /** viewBox width/height in the run's own (padded) data units. */
  viewW: number
  viewH: number
  /** Diagonal — used to size strokes/markers consistently across runs. */
  scale: number
  truthPts: Point[]
  measPts: Point[]
  estPts: Point[]
  ellipses: { cx: number; cy: number; rx: number; ry: number; deg: number }[]
  rmses: number[]
}

/**
 * Projects a run into a self-contained SVG coordinate space: origin at the
 * top-left of the padded bounding box, y flipped so data-up is screen-up. The
 * viewBox is derived per run from that run's own extents (they differ a lot —
 * circle stays within ~+/-8, line reaches x~30), including the 2-sigma ellipse
 * envelope so it never clips.
 */
function buildGeometry(run: Run): RunGeometry {
  const { steps } = run

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  const consider = (x: number, y: number) => {
    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  }

  for (const s of steps) {
    consider(s.trueX, s.trueY)
    consider(s.measX, s.measY)
    consider(s.estX, s.estY)
    // Axis-aligned 2-sigma envelope around the estimate (cov_xy ~ 0, so this
    // bounds the ellipse), so a large early covariance never clips.
    const sx = 2 * Math.sqrt(Math.max(0, s.covXX))
    const sy = 2 * Math.sqrt(Math.max(0, s.covYY))
    consider(s.estX - sx, s.estY - sy)
    consider(s.estX + sx, s.estY + sy)
  }

  const spanX = maxX - minX || 1
  const spanY = maxY - minY || 1
  const pad = 0.06 * Math.max(spanX, spanY)
  const viewW = spanX + 2 * pad
  const viewH = spanY + 2 * pad
  const scale = Math.hypot(viewW, viewH)

  // data -> svg (y flipped)
  const px = (x: number) => x - minX + pad
  const py = (y: number) => maxY - y + pad

  const truthPts = steps.map((s) => [px(s.trueX), py(s.trueY)] as const)
  const measPts = steps.map((s) => [px(s.measX), py(s.measY)] as const)
  const estPts = steps.map((s) => [px(s.estX), py(s.estY)] as const)

  const ellipses = steps.map((s) => {
    const { rx, ry, angle } = covarianceEllipse({ xx: s.covXX, xy: s.covXY, yy: s.covYY })
    return {
      cx: px(s.estX),
      cy: py(s.estY),
      rx,
      ry,
      // The y-flip mirrors the axis, negating the rotation direction.
      deg: -toDegrees(angle),
    }
  })

  return {
    viewW,
    viewH,
    scale,
    truthPts,
    measPts,
    estPts,
    ellipses,
    rmses: steps.map((s) => s.rmse),
  }
}

function polyline(points: Point[], upto: number): string {
  const out: string[] = []
  for (let i = 0; i <= upto && i < points.length; i++) {
    out.push(`${points[i][0].toFixed(3)},${points[i][1].toFixed(3)}`)
  }
  return out.join(' ')
}

export default function KalmanFigure({ runs }: { runs: GaussianRuns }) {
  const [trajectory, setTrajectory] = useState<Trajectory>('circle')
  // Deterministic initial render (SSR + hydration): the final frame of the
  // default run, so no-JS visitors see a complete converged run. The mount
  // effect rewinds to step 0 when motion is allowed.
  const [step, setStep] = useState(FINAL_STEP)
  const [playing, setPlaying] = useState(false)
  const [inView, setInView] = useState(false)

  const containerRef = useRef<HTMLDivElement | null>(null)
  // Mirrors `step` for the rAF loop to read without re-subscribing per step.
  // Synced in an effect (never during render); handlers also write it directly
  // so synchronous reads stay current.
  const stepRef = useRef(step)
  useEffect(() => {
    stepRef.current = step
  }, [step])

  const geom = useMemo(() => buildGeometry(runs[trajectory]), [runs, trajectory])

  // On mount, if motion is allowed, rewind to the start and arm playback; the
  // IntersectionObserver actually starts it once the figure scrolls into view.
  // Under reduced motion we leave the final frame shown and never autoplay.
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return
    // Defer to the next frame so the rewind is a callback, not a synchronous
    // effect-body setState; the SSR final frame shows for one frame at most.
    const id = requestAnimationFrame(() => {
      stepRef.current = 0
      setStep(0)
      setPlaying(true)
    })
    return () => cancelAnimationFrame(id)
  }, [])

  // Track viewport visibility so playback only runs (and only costs frames)
  // while the figure is on screen.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => setInView(entries.some((e) => e.isIntersecting)),
      { threshold: 0.2 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Playback loop. Reads/advances via stepRef so the effect doesn't re-run per
  // step; it only re-runs when intent (playing), visibility, or run changes.
  useEffect(() => {
    if (!playing || !inView) return
    let raf = 0
    let last: number | null = null
    let holdUntil: number | null = null

    const tick = (t: number) => {
      if (holdUntil !== null) {
        if (t >= holdUntil) {
          holdUntil = null
          last = t
          setStep(0)
          stepRef.current = 0
        }
        raf = requestAnimationFrame(tick)
        return
      }
      if (last === null) last = t
      const elapsed = t - last
      if (elapsed >= STEP_MS) {
        last = t - (elapsed % STEP_MS) // keep the remainder for steady cadence
        const next = stepRef.current + 1
        if (next > FINAL_STEP) {
          setStep(FINAL_STEP)
          stepRef.current = FINAL_STEP
          holdUntil = t + HOLD_MS
        } else {
          setStep(next)
          stepRef.current = next
        }
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, inView, trajectory])

  const togglePlay = () => {
    setPlaying((p) => {
      // Pressing play from the final frame restarts the run.
      if (!p && stepRef.current >= FINAL_STEP) {
        setStep(0)
        stepRef.current = 0
      }
      return !p
    })
  }

  const onScrub = (value: number) => {
    setPlaying(false)
    setStep(value)
    stepRef.current = value
  }

  const switchTrajectory = (next: Trajectory) => {
    if (next === trajectory) return
    setTrajectory(next)
    setStep(0)
    stepRef.current = 0
    // Playing/paused state is intentionally preserved.
  }

  const { scale } = geom
  const rmse = geom.rmses[step] ?? 0
  const ellipse = geom.ellipses[step]

  // Everything is sized relative to the run's viewBox diagonal so strokes and
  // markers read consistently whether the run spans 15 units or 45.
  const truthStroke = scale * 0.0045
  const trailStroke = scale * 0.0065
  const measR = scale * 0.008
  const estR = scale * 0.015
  const ellipseStroke = scale * 0.0045

  return (
    <div className="kf" ref={containerRef}>
      <div className="kf-frame">
        <svg
          className="kf-svg"
          viewBox={`0 0 ${geom.viewW.toFixed(3)} ${geom.viewH.toFixed(3)}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={`Kalman filter tracking a ${trajectory} trajectory: true path, noisy measurements, filter estimate, and its 2-sigma covariance ellipse, at step ${step + 1} of ${STEPS_PER_RUN}.`}
        >
          {/* truth path so far */}
          <polyline
            points={polyline(geom.truthPts, step)}
            fill="none"
            stroke="var(--muted)"
            strokeWidth={truthStroke}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* measurements so far */}
          {geom.measPts.slice(0, step + 1).map((p, i) => (
            <circle key={i} cx={p[0]} cy={p[1]} r={measR} fill="var(--muted)" opacity={0.32} />
          ))}

          {/* estimate trail so far */}
          <polyline
            points={polyline(geom.estPts, step)}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={trailStroke}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* 2-sigma covariance ellipse at the current step */}
          {ellipse && (ellipse.rx > 0 || ellipse.ry > 0) && (
            <ellipse
              cx={0}
              cy={0}
              rx={ellipse.rx}
              ry={ellipse.ry}
              transform={`translate(${ellipse.cx} ${ellipse.cy}) rotate(${ellipse.deg.toFixed(3)})`}
              fill="var(--accent)"
              fillOpacity={0.1}
              stroke="var(--accent)"
              strokeOpacity={0.55}
              strokeWidth={ellipseStroke}
            />
          )}

          {/* current estimate marker */}
          {geom.estPts[step] && (
            <circle
              cx={geom.estPts[step][0]}
              cy={geom.estPts[step][1]}
              r={estR}
              fill="var(--accent)"
            />
          )}
        </svg>

        <div className="kf-readout" aria-hidden="true">
          step {step + 1}/{STEPS_PER_RUN} · rmse {rmse.toFixed(2)}
        </div>
      </div>

      <div className="kf-controls">
        <button
          type="button"
          className="kf-btn"
          onClick={togglePlay}
          aria-label={playing ? 'Pause playback' : 'Play playback'}
        >
          {playing ? '❚❚ pause' : '▶ play'}
        </button>

        <input
          className="kf-scrub"
          type="range"
          min={0}
          max={FINAL_STEP}
          step={1}
          value={step}
          onChange={(e) => onScrub(Number(e.target.value))}
          aria-label="Scrub filter step"
          aria-valuetext={`step ${step + 1} of ${STEPS_PER_RUN}`}
        />

        <div className="kf-seg" role="group" aria-label="Trajectory">
          {TRAJECTORIES.map((t) => (
            <button
              key={t}
              type="button"
              className="kf-seg-btn"
              aria-pressed={t === trajectory}
              onClick={() => switchTrajectory(t)}
            >
              {TRAJECTORY_LABELS[t]}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
