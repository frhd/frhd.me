# Phase 4 — Photo routes and seeding

> Part of [frhd.me → editor-chrome](master.md). See index for invariants.

**Status:** in progress

**Depends on:** 2, 3

**Goal:** Photos become visible: `/photos/<year>/` thumbnail grid and `/photos/<year>/<slug>/` detail pages with prev/next, seeded with generated placeholder images so the whole pipeline ships without waiting on real photos. No human gate.

## Files

- New: `app/(editor)/photos/[year]/page.tsx` — `generateStaticParams` from `photoYears(getAllPhotos())`, `dynamicParams = false`; `.photo-grid` of thumb `<img loading="lazy">` linking to detail pages
- New: `app/(editor)/photos/[year]/[slug]/page.tsx` — params from `getAllPhotos()`; large `<img>`, optional `.photo-caption`, `.photo-nav` prev/next within the year
- Touches: `app/globals.css` — `.photo-grid` (auto-fill minmax(160px,1fr)), `.photo-caption` (serif, muted), `.photo-nav` (mono, space-between)
- Touches: `lib/photos.ts` — fill `photoManifest` with the three placeholder entries (captions like "placeholder — swap for a real photo")
- New: `content/photos/2026/placeholder-01..03.jpg` — generated Monokai-gradient placeholders (see snippet below), committed as stand-ins until real photos replace them

## Placeholder generation (one-off, sharp is already installed)

Run once from `frhd.me/` (adapt colors/count freely; 1600×1067, jpeg q88):

```js
// node scripts/placeholder-photos.mjs — delete the script after running, or keep under scripts/ if useful
import sharp from 'sharp'
import fs from 'node:fs'
const pairs = [
  ['placeholder-01', '#f92672', '#272822'],
  ['placeholder-02', '#a6e22e', '#1e1f1c'],
  ['placeholder-03', '#66d9ef', '#3e3d32'],
]
fs.mkdirSync('content/photos/2026', { recursive: true })
for (const [name, a, b] of pairs) {
  const svg = Buffer.from(`<svg width="1600" height="1067" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
    <rect width="1600" height="1067" fill="url(#g)"/>
    <text x="50%" y="52%" font-family="monospace" font-size="64" fill="rgba(255,255,255,.85)" text-anchor="middle">${name}.jpg</text>
  </svg>`)
  await sharp(svg).jpeg({ quality: 88 }).toFile(`content/photos/2026/${name}.jpg`)
}
```

## Decisions to make in this phase

- Plain `<img>` with per-line eslint-disable of `@next/next/no-img-element` (we pre-size ourselves; `next/image` adds nothing under `unoptimized`). Recommended: keep `<img>`.

## Exit criteria

- With the manifest still empty: `pnpm build` succeeds and emits zero photo pages (this proves the empty-window risk from master.md is closed).
- Placeholders generated, manifest filled; `pnpm photos` generates derivatives; grid renders; detail pages show caption and working prev/next at both ends (no dangling link).
- Sidebar now shows `photos/<year>/`; breadcrumbs `photos/<year>/` and `photos/<year>/<slug>` correct.
- `pnpm check` green; committed (originals ARE committed; `public/photos/` stays ignored).

## Gotchas

- If `generateStaticParams` returning `[]` errors under `output: 'export'` on this Next version, gate the route registration instead (or land 4a together with seeding) — but verify empty-build first and log the outcome in QUESTIONS.md.
- `alt` falls back to the slug when caption is absent — never emit empty alt.
- Originals can be large; keep seeds under ~10 MB each so the repo stays light. Derived files must never be committed.
- Log in QUESTIONS.md under this phase: placeholders are a deliberate stand-in — swapping in real photos (drop originals, edit manifest, `pnpm photos`) is deferred, no code change needed.
