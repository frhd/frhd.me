# ISAScrawler Showcase — Design

**Date:** 2026-07-18
**Status:** Approved by Farhad (brainstorm session)
**Relationship:** Content addition to the [frhd.me v2 design](2026-07-18-frhd-me-v2-design.md). Implemented as part of the v2 plan, not a separate effort.

## What this is

A showcase of Farhad's Studienarbeit (ISAS, Universität Karlsruhe, 2006/07): the **ISAScrawler**, a redesign of a small caterpillar-style swarm robot — controlled servo actuation, ball-bearing joints in sandwich construction, reduced microcontroller count, bidirectional radio (XBee), rewritten firmware with autonomous straight-line path following, battery-powered operation.

It becomes the first `/projects/<slug>` writeup in the v2 site.

## Decisions made

- **Full writeup, low-profile.** Core story only; **no thesis PDF link, no downloads**, no external hosting of the original documents.
- **A few curated photos** (2–3), copied into the repo, resized and optimized.
- **Faithful three.js replica** of the prototype, animated with the robot's real gait — the user explicitly chose faithful over stylized.
- **Sequenced inside the v2 implementation plan**; the 3D replica is its own final task so it can slip without blocking the writeup.

## Page: `/projects/isascrawler`

Follows the v2 "monospace quiet" design system (Geist Mono structure, Geist Sans if body runs long; light/dark themes; one accent color).

Content, in order:

1. **Title + one-line context** (project, institute, year).
2. **Intro paragraph** — what the swarm robot project was and why a redesign.
3. **3D replica embed** — directly after the intro (hero position), lazy-loaded, with `neuerBot.jpg` as the static fallback/placeholder until the module loads (and permanently if JS is unavailable).
4. **Body sections** (~300–500 words total): deficits of the predecessor; the redesign (actuation, sandwich joints, electronics/radio, firmware and coordinate-based path mode); short closing reflection.
5. **1–2 detail photos** in the body (sandwich joint and/or leg module).

The `## work` list on the homepage gets one entry: name + one-liner, `href` pointing at `/projects/isascrawler` (uses the `slug` field from the v2 projects data file).

## 3D replica

- **Geometry is procedural** — built in code from boxes, plates, and cylinders; no modeling-tool asset pipeline. Source of truth for proportions: the thesis (three ~50 mm segment modules under a ~16 cm top plate, per `Schema.png` and the text) and the prototype photos for layout and color (copper PCB plates, silver LiPo pouch, blue XBee board with antenna, black servos, blue leg rods, yellow feet).
- **Gait animation** encodes the thesis's documented phase sequences (forward: 9 phases a–i; sideways: 8; rotation: 8) as keyframed joint states with interpolation. Forward gait plays by default on a loop.
- **Architecture** follows the repo's existing engine pattern (pure logic separated from rendering, as in `games/*-engine.ts`):
  - `isascrawler/model.ts` — dimensions/colors constants and mesh-building functions (input: constants; output: a three.js `Group`).
  - `isascrawler/gait-engine.ts` — pure TypeScript, no three.js import: phase definitions and a `jointStateAt(t)` function returning joint angles/offsets. Unit-tested (phase order, interpolation continuity, loop wraparound).
  - `isascrawler/Scene.tsx` — thin client component: renderer setup, lighting, resize handling, drives the model from the gait engine per frame.
- **Loading:** `next/dynamic` client-only import so three.js is bundled and fetched only on this page. Page content renders without it.
- **Interaction: quiet.** Drag-to-orbit plus slow idle rotation; no controls UI in v1. Animation pauses when the tab/element is not visible (`IntersectionObserver` + `requestAnimationFrame` only while visible).
- **Failure handling:** if WebGL is unavailable or module load fails, the static photo simply remains — no error UI.
- **Dependency:** `three` (+ `@types/three`). First and only 3D dependency; acceptable because it loads on one page only.

## Assets

- Copy from `~/Ablage/.../Ausarbeitung/VorlageSADA/`: `neuerBot.jpg` (fallback/anchor) plus 1–2 detail shots (candidates: `sandwich1.jpg`, `gelenkoffen.jpg`, `Bein1.jpg`) into `public/projects/isascrawler/`, resized to display size and compressed.
- No other original material leaves the archive folder.

## Testing & quality

- Gait engine: unit tests (vitest) as above.
- Projects data / page rendering covered by the v2 plan's existing content-loading tests.
- `pnpm check` remains the gate; `pnpm pre-deploy` must pass with the three.js dynamic import under static export.

## Out of scope

- Hosting the thesis PDF, presentation, or original source code.
- Physics simulation, terrain, or interactive robot control (the gait is keyframed playback, not simulated).
- Modeling internal components not visible in the photos (electronics beyond the visible boards).
- Any changes to the archive folder in `~/Ablage`.
