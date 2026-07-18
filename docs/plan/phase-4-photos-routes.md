# Phase 4 — Photo routes and seeding

> Part of [frhd.me → editor-chrome](master.md). See index for invariants.

**Status:** todo

**Depends on:** 2, 3

**Goal:** Photos become visible: `/photos/<year>/` thumbnail grid and `/photos/<year>/<slug>/` detail pages with prev/next, then the section goes live with Farhad's seed photos. Contains the plan's one human gate.

## Files

- New: `app/(editor)/photos/[year]/page.tsx` — `generateStaticParams` from `photoYears(getAllPhotos())`, `dynamicParams = false`; `.photo-grid` of thumb `<img loading="lazy">` linking to detail pages
- New: `app/(editor)/photos/[year]/[slug]/page.tsx` — params from `getAllPhotos()`; large `<img>`, optional `.photo-caption`, `.photo-nav` prev/next within the year
- Touches: `app/globals.css` — `.photo-grid` (auto-fill minmax(160px,1fr)), `.photo-caption` (serif, muted), `.photo-nav` (mono, space-between)
- Touches: `lib/photos.ts` — fill `photoManifest` with the seed entries
- New: `content/photos/<year>/*.jpg` — **supplied by Farhad**

## Decisions to make in this phase

- Plain `<img>` with per-line eslint-disable of `@next/next/no-img-element` (we pre-size ourselves; `next/image` adds nothing under `unoptimized`). Recommended: keep `<img>`.

## Exit criteria

- With the manifest still empty: `pnpm build` succeeds and emits zero photo pages (this proves the empty-window risk from master.md is closed).
- **GATE (needs Farhad):** 3–6 originals dropped in `content/photos/<year>/`, manifest filled with kebab-case slugs + captions.
- `pnpm photos` generates derivatives; grid renders; detail pages show caption and working prev/next at both ends (no dangling link).
- Sidebar now shows `photos/<year>/`; breadcrumbs `photos/<year>/` and `photos/<year>/<slug>` correct.
- `pnpm check` green; committed (originals ARE committed; `public/photos/` stays ignored).

## Gotchas

- If `generateStaticParams` returning `[]` errors under `output: 'export'` on this Next version, gate the route registration instead (or land 4a together with seeding) — but verify empty-build first and log the outcome in QUESTIONS.md.
- `alt` falls back to the slug when caption is absent — never emit empty alt.
- Originals can be large; keep seeds under ~10 MB each so the repo stays light. Derived files must never be committed.
