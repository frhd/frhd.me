# ISAScrawler Showcase Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the ISAScrawler Studienarbeit showcase to frhd.me: a low-profile writeup page at `/projects/isascrawler` with 2–3 photos and a faithful, gait-animated three.js replica of the robot.

**Architecture:** New self-contained files plus one small edit to `lib/projects.ts`, so this work does not collide with the concurrent v2 homepage work. The 3D replica follows the repo's engine pattern: `gait-engine.ts` (pure TS, unit-tested, no three.js import) drives `model.ts` (procedural three.js geometry, unit-tested via object-graph assertions) rendered by a thin client component `Scene.tsx`, dynamically imported so three.js loads only on this page.

**Tech Stack:** Next.js 16 (static export), React 19, TypeScript, three (new dependency), vitest (jsdom, globals: true), Tailwind CSS v4.

**Spec:** `docs/superpowers/specs/2026-07-18-isascrawler-showcase-design.md` (approved). Parent: `docs/superpowers/specs/2026-07-18-frhd-me-v2-design.md`.

**Source material** (read-only archive — never modify): `~/Ablage/14-Uni/Uni KA/02-Hauptstudium/00 - Studienarbeit(1)/Ausarbeitung/VorlageSADA/`. Referenced below as `$THESIS`. Note the path contains spaces and parentheses — always quote it in shell commands.

**Coordination note:** An autonomous loop is concurrently implementing the v2 homepage. This plan only touches new files plus `lib/projects.ts`. If `lib/projects.ts` or its test has changed since this plan was written, adapt Task 2 to the current shape rather than reverting anything. The homepage rendering of the work list is NOT part of this plan.

---

## Physical reference (from thesis + photos)

Everything the model needs, so no task requires re-reading the thesis:

- **Overall:** three ~50×50×50 mm leg segments (front/middle/rear) under a ~160×50 mm trunk of two stacked copper-clad PCB plates (`Schema.png`, `3segmente.png`). Total weight 160 g. At each of the two segment connections, three degrees of freedom; joints are ball-bearing "sandwich" constructions of sliding PCB plates driven by micro servos (4.7 g).
- **Top plate carries:** silver Kokam LiPo pouch (~50×30×6 mm), blue XBee radio board (~25×28 mm) with vertical wire antenna (~25 mm), misc. copper traces.
- **Leg segments:** copper/FR4 frames with black micro servos (yellow output horns), blue leg rods (Ø ~2 mm, length ~40 mm), yellow serrated feet on the middle segment.
- **Colors (from `neuerBot.jpg`):** copper plate `#b87333`, FR4 edge `#c8a165`, servo body `#1a1a1a`, servo horn / feet `#e6c619`, battery `#c0c0c8`, XBee `#2255aa`, leg rods `#2266cc`.
- **Forward gait** (`moves1` caption, phases a–i): a) initial pose → b) lift trunk → c) lift middle leg → d) move middle leg forward → e) lower middle leg → f) lift front+rear legs → g) move trunk forward (over the planted middle leg) → h) lower front+rear legs → i) lift middle leg (= wraps to c). Sideways and rotation gaits exist in the thesis (`moves2`, `moves3`) but only the forward gait ships in v1 (YAGNI — the engine's data format supports adding them later).
- **Walk-in-place convention:** the scene shows the robot as a specimen (no net locomotion). "Trunk moves forward" is represented in the trunk's frame: the planted middle leg slides backward relative to the trunk (which is literally how the sandwich joints work), so the loop closes with zero drift.

---

## File structure

| File | Responsibility |
|---|---|
| `public/projects/isascrawler/{prototype,joint,leg}.jpg` | Pre-resized, compressed photos |
| `lib/projects.ts` (modify) | Make `href` optional, update doc comment, add ISAScrawler entry with `slug` |
| `lib/__tests__/projects.test.ts` (modify) | Cover the new entry / optional `href` |
| `app/components/isascrawler/gait-engine.ts` | Pure TS: joint-state types, forward-gait keyframes, `jointStateAt(t)` |
| `app/components/isascrawler/model.ts` | Dimension/color constants, `buildCrawler()`, `applyCrawlerState()` |
| `app/components/isascrawler/Scene.tsx` | Client component: renderer, lighting, resize, drag-orbit, visibility/reduced-motion gating |
| `app/components/isascrawler/ClientSceneWrapper.tsx` | `'use client'` shim so the server page can dynamic-import the scene |
| `app/components/isascrawler/__tests__/gait-engine.test.ts` | Gait engine unit tests |
| `app/components/isascrawler/__tests__/model.test.ts` | Model object-graph unit tests |
| `app/projects/isascrawler/page.tsx` | The writeup page (server component; embeds Scene via `next/dynamic`) |

---

## Chunk 1: Content — photos, project entry, writeup page

### Task 1: Photos

**Files:**
- Create: `public/projects/isascrawler/prototype.jpg`, `joint.jpg`, `leg.jpg`

- [x] **Step 1: Copy and process the three photos**

`sips` is built into macOS. Resize to max 1200 px wide, ~75% JPEG quality:

```bash
cd /Users/farhad/src/frhd/personal_sites/frhd.me
mkdir -p public/projects/isascrawler
T="$HOME/Ablage/14-Uni/Uni KA/02-Hauptstudium/00 - Studienarbeit(1)/Ausarbeitung/VorlageSADA"
sips -Z 1200 -s format jpeg -s formatOptions 75 "$T/neuerBot.jpg"   --out public/projects/isascrawler/prototype.jpg
sips -Z 900  -s format jpeg -s formatOptions 75 "$T/sandwich1.jpg"  --out public/projects/isascrawler/joint.jpg
sips -Z 900  -s format jpeg -s formatOptions 75 "$T/Bein1.jpg"      --out public/projects/isascrawler/leg.jpg
ls -la public/projects/isascrawler/
```

Expected: three files, each well under 300 KB. If `sandwich1.jpg` or `Bein1.jpg` turn out to be poor shots (check visually), substitute `gelenkoffen.jpg` / `Bein3.jpg`.

- [x] **Step 2: Commit**

```bash
git add public/projects/isascrawler
git commit -m "add ISAScrawler photos (resized from thesis archive)"
```

### Task 2: Project entry in `lib/projects.ts`

**Files:**
- Modify: `lib/projects.ts`
- Modify: `lib/__tests__/projects.test.ts`

- [x] **Step 1: Read both files first** — the v2 loop may have changed them since this plan was written. Adapt the steps below to the current shape.

- [x] **Step 2: Write failing tests**

In `lib/__tests__/projects.test.ts`, first FIX the existing assertion that every entry has an `https?://` `href` (currently `lib/__tests__/projects.test.ts:10-16`, "gives every project a name, one-liner, and href") — it must tolerate entries without `href`:

```ts
    if (project.href !== undefined) {
      expect(project.href).toMatch(/^https?:\/\//)
    } else {
      expect(project.slug).toBeDefined() // internal-only entries must be linkable
    }
```

Then add the new tests:

```ts
describe('isascrawler entry', () => {
  const entry = projects.find((p) => p.slug === 'isascrawler')

  it('exists with a name and one-liner', () => {
    expect(entry).toBeDefined()
    expect(entry!.name).toBe('ISAScrawler')
    expect(entry!.oneLiner.length).toBeGreaterThan(0)
  })

  it('is internal-only: slug set, no external href', () => {
    expect(entry!.href).toBeUndefined()
  })
})
```

- [x] **Step 3: Run tests to verify they fail**

Run: `pnpm vitest run lib/__tests__/projects.test.ts`
Expected: FAIL (`entry` undefined).

- [x] **Step 4: Implement**

In `lib/projects.ts`: make `href` optional and fix the doc comments (spec decision — `href` stays reserved for external links; internal writeups are linked via `slug`):

```ts
  /** External link (GitHub, demo, etc.). Omitted when the project only has an internal writeup. */
  href?: string
  /** Present only when a `/projects/<slug>` writeup page exists; the work list links there. */
  slug?: string
```

Update the interface's top doc comment ("No writeups exist in v1…" is no longer true). Add the entry (keep list order: newest-ish first is not established; append at the end — it is the oldest project):

```ts
  {
    name: 'ISAScrawler',
    oneLiner: 'rebuilt a caterpillar swarm robot — mechanics, electronics, firmware (Uni Karlsruhe, 2007)',
    slug: 'isascrawler',
  },
```

If a homepage component already renders `projects` and assumes `href` is always present, fix it to prefer `/projects/${slug}` when `slug` is set (this is the spec's linking rule) — but do not build homepage rendering if it doesn't exist yet.

- [x] **Step 5: Run the full check**

Run: `pnpm vitest run lib/__tests__/projects.test.ts` → PASS, then `pnpm check` → all green (type-check will catch any consumer assuming `href: string`).

- [x] **Step 6: Commit**

```bash
git add lib/projects.ts lib/__tests__/projects.test.ts
git commit -m "add ISAScrawler project entry; href becomes optional/external-only"
```

### Task 3: Writeup page

**Files:**
- Create: `app/projects/isascrawler/page.tsx`

The 3D scene lands in Chunk 2; until then the page shows `prototype.jpg` where the scene will go (which is also its permanent fallback).

- [x] **Step 1: Write the page**

Server component, plain `<img>` tags (static export — no image optimization), Tailwind classes consistent with a quiet single column. Content is derived from the thesis abstract; keep the register plain and first-person, no marketing tone. ~300–500 words. Draft to use (Farhad reviews wording before deploy):

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ISAScrawler — farhad omid',
  description:
    'Rebuilding a caterpillar swarm robot: mechanics, electronics, and firmware. Studienarbeit at ISAS, Universität Karlsruhe, 2006–07.',
}

export default function IsascrawlerPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 font-mono text-[15px] leading-relaxed">
      <h1 className="text-lg font-bold">ISAScrawler</h1>
      <p className="mt-1 text-sm opacity-60">
        Studienarbeit, ISAS · Universität Karlsruhe · 2006–07
      </p>

      <p className="mt-8">
        At the Intelligent Sensor-Actuator-Systems lab, a group of small
        caterpillar robots was meant to explore collaborative swarm behavior —
        machines that crawl over terrain in groups and solve tasks together.
        The existing prototype had accumulated enough mechanical and electrical
        problems that efficient operation was impossible, so my Studienarbeit
        became a ground-up redesign.
      </p>

      {/* 3D scene mounts here in a later task; the photo is its permanent fallback */}
      <figure className="mt-8">
        <img
          src="/projects/isascrawler/prototype.jpg"
          alt="The ISAScrawler prototype: three servo-driven leg segments under a copper PCB trunk carrying a LiPo battery and an XBee radio module"
          className="w-full"
        />
        <figcaption className="mt-2 text-sm opacity-60">
          The finished prototype, 16 cm and 160 g.
        </figcaption>
      </figure>

      <h2 className="mt-10 font-bold"># what was wrong</h2>
      <p className="mt-3">
        The predecessor fought itself: open-loop motors with no position
        feedback, a microcontroller per limb, joints that shed their ball
        bearings, and a tethered power supply. Every subsystem needed
        redesign, and the fixes only worked together — so it became a new
        robot.
      </p>

      <h2 className="mt-10 font-bold"># the redesign</h2>
      <p className="mt-3">
        The frame is CNC-milled copper-clad PCB material — structure and
        circuit board in one. The joints became a sandwich construction:
        three plates with enclosed ball-bearing races, so the bearings
        physically cannot fall out, driven by 4.7-gram positional micro
        servos. One microcontroller replaced the previous cluster, a new
        radio module made communication bidirectional, and a lithium-polymer
        cell finally cut the cable. The firmware was rewritten from scratch:
        besides manual and per-servo control, the robot accepts target
        coordinates and walks a straight computed path on its own — dead
        reckoning only, no feedback about drift yet.
      </p>

      <figure className="mt-8">
        <img
          src="/projects/isascrawler/joint.jpg"
          alt="Sandwich joint: three milled PCB plates enclosing ball bearings in their races"
          className="w-full"
        />
        <figcaption className="mt-2 text-sm opacity-60">
          The sandwich joint — the bearings are enclosed between three milled plates.
        </figcaption>
      </figure>

      <figure className="mt-8">
        <img
          src="/projects/isascrawler/leg.jpg"
          alt="A leg segment: milled PCB frame with two micro servos and blue leg rods"
          className="w-full"
        />
        <figcaption className="mt-2 text-sm opacity-60">
          A leg segment — frame and circuit board are the same milled material.
        </figcaption>
      </figure>

      <h2 className="mt-10 font-bold"># looking back</h2>
      <p className="mt-3">
        It was the first project where I built the whole stack myself —
        mechanics, boards, radio protocol, firmware — and where I learned
        that the second version of anything is mostly an apology to the
        first. The crawler above is rebuilt in code from the thesis
        drawings, walking its original gait.
      </p>

      <p className="mt-12 text-sm">
        <a href="/" className="underline opacity-60 hover:opacity-100">
          ← home
        </a>
      </p>
    </main>
  )
}
```

- [x] **Step 2: Verify it renders and exports**

Run: `pnpm dev`, open `http://localhost:3000/projects/isascrawler` — page renders, all three photos load, no console errors.
Run: `pnpm pre-deploy`
Expected: build succeeds; `out/projects/isascrawler/index.html` exists.

- [x] **Step 3: Commit**

```bash
git add app/projects/isascrawler/page.tsx
git commit -m "add /projects/isascrawler writeup page"
```

---

## Chunk 2: The three.js replica

### Task 4: Gait engine (pure TS, TDD)

**Files:**
- Create: `app/components/isascrawler/gait-engine.ts`
- Test: `app/components/isascrawler/__tests__/gait-engine.test.ts`

**Design.** All units are millimeters, matching the thesis; the scene scales once. A `CrawlerState` is:

```ts
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
```

The forward gait is a list of keyframes (phase boundaries). `jointStateAt(t)` linearly interpolates between them; `t` is in seconds and wraps at the cycle length. Amplitude constants: `TRUNK_LIFT = 6`, `LEG_LIFT = 8`, `STRIDE = 15` (mm — consistent with the 10–20 mm bearing race lengths), `PHASE_SECONDS = 0.6`.

Keyframes transcribe thesis figure `moves1` a–i using the walk-in-place convention (phase g: middle leg slides `STRIDE → 0` relative to the trunk while front/rear are lifted). The cycle: a is the resting pose reached only at start; the loop runs c→h, and phase i ≡ c, so the wrap targets the `c` keyframe (see below):

| # | thesis phase | trunkLift | front.lift | front.x | middle.lift | middle.x | rear.lift | rear.x |
|---|---|---|---|---|---|---|---|---|
| 0 | a initial | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 1 | b trunk up | 6 | 0 | 0 | 0 | 0 | 0 | 0 |
| 2 | c middle up | 6 | 0 | 0 | 8 | 0 | 0 | 0 |
| 3 | d middle fwd | 6 | 0 | 0 | 8 | 15 | 0 | 0 |
| 4 | e middle down | 6 | 0 | 0 | 0 | 15 | 0 | 0 |
| 5 | f front+rear up | 6 | 8 | 0 | 0 | 15 | 8 | 0 |
| 6 | g trunk fwd | 6 | 8 | 0 | 0 | 0 | 8 | 0 |
| 7 | h front+rear down | 6 | 0 | 0 | 0 | 0 | 0 | 0 |

Keyframe 7 (h) is state-identical to keyframe 1 (b), so wrapping 7→1 would insert a full phase of stillness each cycle. Faithful playback goes from h straight into lifting the middle leg (thesis phase i ≡ c): **the loop wraps from keyframe 7 to keyframe 2** (`loopStartIndex = 2`; segment 7→2 is the same motion as 1→2 because 7 ≡ 1). Public API:

```ts
export const FORWARD_GAIT: { keyframes: readonly CrawlerState[]; loopStartIndex: number }
export const PHASE_SECONDS: number
export const CYCLE_SECONDS: number // (keyframes.length - loopStartIndex) * PHASE_SECONDS
export function jointStateAt(t: number): CrawlerState
```

(Declare the type via the `readonly` form above OR rely on `as const` inference — combining a mutable-array annotation with `as const` is a TS error.)

Intro: `t` in `[0, 2 * PHASE_SECONDS)` plays keyframes 0→1→2 (rest pose → trunk up → middle up); after that, time folds modulo `CYCLE_SECONDS` = `(keyframes.length - 2) * PHASE_SECONDS` into the loop segments 2→3, 3→4, 4→5, 5→6, 6→7, 7→2.

- [x] **Step 1: Write failing tests** (`app/components/isascrawler/__tests__/gait-engine.test.ts`)

```ts
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
```

- [x] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run app/components/isascrawler/__tests__/gait-engine.test.ts`
Expected: FAIL — module not found.

- [x] **Step 3: Implement `gait-engine.ts`**

Pure TS, no imports. Keyframes exactly per the table; `jointStateAt`:

```ts
const TRUNK_LIFT = 6
const LEG_LIFT = 8
const STRIDE = 15
export const PHASE_SECONDS = 0.6

const leg = (lift = 0, x = 0): LegState => ({ lift, x })

export const FORWARD_GAIT = {
  loopStartIndex: 2,
  keyframes: [
    { trunkLift: 0, front: leg(), middle: leg(), rear: leg() },
    { trunkLift: TRUNK_LIFT, front: leg(), middle: leg(), rear: leg() },
    { trunkLift: TRUNK_LIFT, front: leg(), middle: leg(LEG_LIFT), rear: leg() },
    { trunkLift: TRUNK_LIFT, front: leg(), middle: leg(LEG_LIFT, STRIDE), rear: leg() },
    { trunkLift: TRUNK_LIFT, front: leg(), middle: leg(0, STRIDE), rear: leg() },
    { trunkLift: TRUNK_LIFT, front: leg(LEG_LIFT), middle: leg(0, STRIDE), rear: leg(LEG_LIFT) },
    { trunkLift: TRUNK_LIFT, front: leg(LEG_LIFT), middle: leg(0, 0), rear: leg(LEG_LIFT) },
    { trunkLift: TRUNK_LIFT, front: leg(), middle: leg(), rear: leg() },
  ],
} as const
```

`jointStateAt(t)`: if `t < 2 * PHASE_SECONDS`, interpolate through keyframes 0→1→2 (`u` within each phase). Otherwise fold `t - 2 * PHASE_SECONDS` modulo `CYCLE_SECONDS` (segments 2→3 … 6→7 plus wrap 7→2); the wrap segment interpolates keyframe 7 → keyframe 2. Linear interpolation of every scalar field; return fresh objects (no mutation of keyframes).

- [x] **Step 4: Run tests to verify they pass**

Run: `pnpm vitest run app/components/isascrawler/__tests__/gait-engine.test.ts`
Expected: PASS (all 8).

- [x] **Step 5: Commit**

```bash
git add app/components/isascrawler
git commit -m "add ISAScrawler gait engine with thesis moves1 keyframes"
```

### Task 5: Install three.js

- [x] **Step 1: Install**

```bash
pnpm add three
pnpm add -D @types/three
```

- [x] **Step 2: Verify the gate still passes**

Run: `pnpm check`
Expected: green (nothing imports three yet).

- [x] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "add three.js dependency for ISAScrawler replica"
```

### Task 6: Procedural model (TDD via object graph)

**Files:**
- Create: `app/components/isascrawler/model.ts`
- Test: `app/components/isascrawler/__tests__/model.test.ts`

three.js `Group`/`Mesh` construction needs no WebGL, so this is unit-testable in jsdom.

**Design.** Millimeter units; the Scene applies one global scale. Layout on the x-axis (front = +x), ground at y=0.

```ts
export const DIMS = {
  trunk: { length: 160, width: 50, plateThickness: 1.6, plateGap: 8, restHeight: 42 },
  segment: { size: 45, height: 28 },            // leg segment boxes under the trunk
  segmentSpacing: 55,                            // center-to-center
  servo: { w: 12, d: 24, h: 22 },
  battery: { l: 50, w: 30, h: 6 },
  xbee: { l: 28, w: 25, h: 2, antenna: 25 },
  legRod: { radius: 1, length: 40 },
  foot: { l: 30, w: 8, h: 6 },
} as const

export const COLORS = {
  copper: 0xb87333, fr4: 0xc8a165, servo: 0x1a1a1a,
  horn: 0xe6c619, battery: 0xc0c0c8, xbee: 0x2255aa,
  rod: 0x2266cc, foot: 0xe6c619,
} as const

export interface CrawlerParts {
  root: THREE.Group      // whole robot; Scene rotates this for orbit
  trunk: THREE.Group     // both plates + battery + xbee + antenna
  front: THREE.Group     // leg segment groups, children of root (NOT trunk)
  middle: THREE.Group
  rear: THREE.Group
}

export function buildCrawler(): CrawlerParts
export function applyCrawlerState(parts: CrawlerParts, state: CrawlerState): void
```

`buildCrawler()` composes: trunk = two copper plates (`BoxGeometry`) with `plateGap` between, battery + XBee + antenna (thin `CylinderGeometry`) on top; each leg segment = FR4 box + 2 servo boxes with horn plates + 2 leg rods angled outward + foot box (yellow serrated feet only on the middle segment; front/rear feet use rod tips). All meshes use `MeshLambertMaterial` (cheap, fine for flat shading). Name every group (`parts.trunk.name = 'trunk'` etc.) for testability.

`applyCrawlerState()` maps mm state → positions: `trunk.position.y = DIMS.trunk.restHeight + state.trunkLift`, and for each leg `L`: `parts[L].position.x = slotX(L) + state[L].x`, `parts[L].position.y = state[L].lift`. No rotation math in v1 — the sandwich joints are sliding joints, so translation is the faithful mapping.

- [x] **Step 1: Write failing tests**

```ts
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
```

- [x] **Step 2: Run tests to verify they fail** — module not found.

- [x] **Step 3: Implement `model.ts`** per the design above. Keep it one file; extract small helpers (`box(w, h, d, color)`, `buildLegSegment(withFoot: boolean)`) inside the module rather than new files.

- [x] **Step 4: Run tests** — `pnpm vitest run app/components/isascrawler/__tests__/model.test.ts` → PASS.

- [x] **Step 5: Commit**

```bash
git add app/components/isascrawler
git commit -m "add procedural three.js model of the ISAScrawler"
```

### Task 7: Scene component + page embed

**Files:**
- Create: `app/components/isascrawler/Scene.tsx`
- Create: `app/components/isascrawler/ClientSceneWrapper.tsx`
- Modify: `app/projects/isascrawler/page.tsx` (replace the prototype `<figure>` with the dynamic Scene, keeping the photo as fallback)

No unit tests for this file (jsdom has no WebGL); it stays thin — all logic already lives in tested modules. Verification is manual + build.

- [x] **Step 1: Write `Scene.tsx`**

`'use client'` component. Behavior:

- Props: `fallbackSrc: string`, `fallbackAlt: string`.
- Renders the `<img>` fallback until three.js has successfully produced a first frame; on any error (WebGL unavailable, context creation throws) it silently keeps the image (spec: no error UI).
- Setup in a `useEffect`: `WebGLRenderer({ antialias: true, alpha: true })`, `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))`, transparent background (page theme shows through), `PerspectiveCamera` at roughly (200, 140, 220) looking at the model center, one `HemisphereLight` + one `DirectionalLight`, `buildCrawler()` scaled to fit a ~420 px-tall container, subtle ground shadow omitted (YAGNI).
- Resize handling: a `ResizeObserver` on the container calls `renderer.setSize(width, height)` and updates `camera.aspect` + `camera.updateProjectionMatrix()`, and triggers a render when animation is paused (reduced motion / off-screen).
- Animation loop: `requestAnimationFrame` only while an `IntersectionObserver` reports the canvas visible; each frame `applyCrawlerState(parts, jointStateAt(elapsedSeconds))` plus slow idle yaw of `parts.root` (~0.15 rad/s) unless the user has dragged.
- `matchMedia('(prefers-reduced-motion: reduce)')`: when set, do not advance `elapsedSeconds` and no idle yaw — render the resting pose statically (drag-orbit still works); re-render on drag.
- Drag-to-orbit: pointer events on the canvas adjust `root.rotation.y` (and clamp a small `rotation.x` range); no OrbitControls import, no zoom.
- Cleanup on unmount: cancel RAF, disconnect observer, `renderer.dispose()`, dispose geometries/materials via `scene.traverse`.

- [x] **Step 2: Embed in the page**

`next/dynamic` with `ssr: false` is a build error inside a Server Component in Next 16, so use a tiny client wrapper (same pattern as the terminal's `ClientTerminalWrapper`). Create `app/components/isascrawler/ClientSceneWrapper.tsx`:

```tsx
'use client'

import dynamic from 'next/dynamic'

const CrawlerScene = dynamic(() => import('./Scene'), { ssr: false })

export default CrawlerScene
```

Then in `app/projects/isascrawler/page.tsx`, import it and replace the first `<figure>` with:

```tsx
import CrawlerScene from '@/app/components/isascrawler/ClientSceneWrapper'
```

```tsx
      <figure className="mt-8">
        <CrawlerScene
          fallbackSrc="/projects/isascrawler/prototype.jpg"
          fallbackAlt="The ISAScrawler prototype: three servo-driven leg segments under a copper PCB trunk carrying a LiPo battery and an XBee radio module"
        />
        <figcaption className="mt-2 text-sm opacity-60">
          The crawler, rebuilt in code from the thesis drawings, walking its
          forward gait. Drag to orbit.
        </figcaption>
      </figure>
```

- [x] **Step 3: Verify in the browser**

Run: `pnpm dev`, open `/projects/isascrawler`. Check: gait loops smoothly and matches the thesis sequence (trunk up → middle steps → front/rear lift while trunk advances); drag orbits; leaving the viewport pauses the RAF (check via performance panel or a console counter); OS reduced-motion setting yields a static model.

- [x] **Step 4: Verify the export**

Run: `pnpm pre-deploy`
Expected: build green. Confirm three.js is NOT in the shared/homepage JS: inspect `pnpm build` output — the three chunk should be attributed to `/projects/isascrawler` only.

- [x] **Step 5: Commit**

```bash
git add app/components/isascrawler app/projects/isascrawler/page.tsx
git commit -m "add gait-animated three.js replica to ISAScrawler page"
```

### Task 8: Final gate

- [x] **Step 1: Full check + build**

Run: `pnpm pre-deploy`
Expected: lint, type-check, all tests, and static export all green.

- [x] **Step 2: Review the diff as a whole** — no stray files, no changes outside `lib/projects.ts` + new files, archive folder untouched.

- [x] **Step 3: Ask Farhad to review the page copy and the replica's look before any deploy.** Deployment itself is out of scope for this plan (v2 work owns it).
