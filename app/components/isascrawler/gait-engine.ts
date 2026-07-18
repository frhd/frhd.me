/**
 * Pure-logic gait engine for the ISAScrawler showcase.
 *
 * Models the forward walking gait of the rebuilt caterpillar robot as a
 * sequence of keyframes (thesis figure moves1, phases a–i) and linearly
 * interpolates joint state between them. No rendering imports — this is
 * consumed by a three.js view layer elsewhere.
 *
 * Units: millimeters for spatial fields, seconds for time.
 */

export interface LegState {
  /** Vertical lift of the leg segment off the ground, mm (0 = planted). */
  lift: number
  /** Fore-aft offset of the leg relative to the trunk, mm (+ = toward front). */
  x: number
}

export interface CrawlerState {
  /** Trunk height above its resting position, mm. */
  trunkLift: number
  front: LegState
  middle: LegState
  rear: LegState
}

const TRUNK_LIFT = 6
const LEG_LIFT = 8
const STRIDE = 15

export const PHASE_SECONDS = 0.6

const leg = (lift = 0, x = 0): LegState => ({ lift, x })

export const FORWARD_GAIT = {
  loopStartIndex: 2,
  keyframes: [
    // a: initial rest pose
    { trunkLift: 0, front: leg(), middle: leg(), rear: leg() },
    // b: lift trunk
    { trunkLift: TRUNK_LIFT, front: leg(), middle: leg(), rear: leg() },
    // c: lift middle leg
    { trunkLift: TRUNK_LIFT, front: leg(), middle: leg(LEG_LIFT), rear: leg() },
    // d: move middle leg forward
    { trunkLift: TRUNK_LIFT, front: leg(), middle: leg(LEG_LIFT, STRIDE), rear: leg() },
    // e: lower middle leg
    { trunkLift: TRUNK_LIFT, front: leg(), middle: leg(0, STRIDE), rear: leg() },
    // f: lift front + rear legs
    { trunkLift: TRUNK_LIFT, front: leg(LEG_LIFT), middle: leg(0, STRIDE), rear: leg(LEG_LIFT) },
    // g: move trunk forward over the planted middle leg (middle leg slides
    // backward relative to the trunk — this is the trunk advancing, not the
    // leg stepping)
    { trunkLift: TRUNK_LIFT, front: leg(LEG_LIFT), middle: leg(0, 0), rear: leg(LEG_LIFT) },
    // h: lower front + rear legs (state-identical to b; loop wraps to
    // keyframe 2 (≡ thesis phase i, lift middle leg) instead of replaying b)
    { trunkLift: TRUNK_LIFT, front: leg(), middle: leg(), rear: leg() },
  ],
} as const

export const CYCLE_SECONDS =
  (FORWARD_GAIT.keyframes.length - FORWARD_GAIT.loopStartIndex) * PHASE_SECONDS

const INTRO_SECONDS = FORWARD_GAIT.loopStartIndex * PHASE_SECONDS

function lerpLeg(a: LegState, b: LegState, u: number): LegState {
  return {
    lift: a.lift + (b.lift - a.lift) * u,
    x: a.x + (b.x - a.x) * u,
  }
}

function lerpState(a: CrawlerState, b: CrawlerState, u: number): CrawlerState {
  return {
    trunkLift: a.trunkLift + (b.trunkLift - a.trunkLift) * u,
    front: lerpLeg(a.front, b.front, u),
    middle: lerpLeg(a.middle, b.middle, u),
    rear: lerpLeg(a.rear, b.rear, u),
  }
}

/** Returns the interpolated crawler joint state at time `t` (seconds, >= 0). */
export function jointStateAt(t: number): CrawlerState {
  const ks = FORWARD_GAIT.keyframes

  if (t < INTRO_SECONDS) {
    // Intro: keyframes 0 -> 1 -> 2 (rest pose -> trunk up -> middle up).
    const phaseIndex = Math.floor(t / PHASE_SECONDS)
    const u = (t - phaseIndex * PHASE_SECONDS) / PHASE_SECONDS
    return lerpState(ks[phaseIndex], ks[phaseIndex + 1], u)
  }

  // Looping segment: keyframes loopStartIndex..end, wrapping from the last
  // keyframe back to loopStartIndex.
  const loopStart = FORWARD_GAIT.loopStartIndex
  const segmentCount = ks.length - loopStart
  const loopT = (t - INTRO_SECONDS) % CYCLE_SECONDS
  const segmentIndex = Math.floor(loopT / PHASE_SECONDS)
  const u = (loopT - segmentIndex * PHASE_SECONDS) / PHASE_SECONDS

  const fromIndex = loopStart + segmentIndex
  const toIndex = segmentIndex + 1 < segmentCount ? fromIndex + 1 : loopStart

  return lerpState(ks[fromIndex], ks[toIndex], u)
}
