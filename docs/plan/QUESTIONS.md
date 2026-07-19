# QUESTIONS — editor-chrome redesign

Append-only log of cross-phase issues raised during execution that a phase intentionally did not fix (pre-existing flakes, scope-cut deferrals, punted decisions). Entries go under `## Phase N (YYYY-MM-DD)` headings and name the file/test/symbol.

## Phase 4 (2026-07-19)

**Open risk from master.md resolved: `generateStaticParams` returning `[]` DOES error under `output: 'export'` on this Next version (16.0.10, Turbopack).**

With `photoManifest` empty, `photoYears(getAllPhotos())` (and `getAllPhotos()` itself) returns `[]`, so `generateStaticParams` for both `app/(editor)/photos/[year]/page.tsx` and its `[slug]` child resolved to zero routes. `next build` failed with:

```
Error: Page "/photos/[year]/[slug]" is missing "generateStaticParams()" so it cannot be used with "output: export" config.
```

Traced to `node_modules/next/dist/build/index.js` (~line 1321, error code `E87`): the export-build path computes `hasGenerateStaticParams = workerResult.prerenderedRoutes && workerResult.prerenderedRoutes.length > 0` and throws whenever `config.output === 'export' && isDynamic && !hasGenerateStaticParams` — regardless of whether the route is nested under another dynamic segment. An empty array from `generateStaticParams()` is treated identically to not exporting it at all.

**Resolution (per this phase's brief, "gate the route registration"):** the authored route source lives in the private `app/(editor)/photos/_src/[year]/` folder (Next.js excludes any `_`-prefixed folder from routing, so `_src` and everything under it — including the nested `[slug]` page — is invisible to the router regardless of what it exports). `scripts/photos.mjs` now also runs `syncPhotoRoutes()`: after generating derivatives, it copies `photos/_src/[year]/` to the real, routable `photos/[year]/` only when at least one photo original was found on disk; otherwise it removes any existing materialized copy. With the manifest empty, the materialized `photos/[year]/` directory never exists, so Next's route discovery never sees a `/photos/[year]` dynamic segment at all, and the export-build error above is never reached. The materialized directory is gitignored (`/app/(editor)/photos/\[year\]/` — bracket chars need the backslash escape for gitignore to treat them as literal, verified with `git check-ignore`); `photos/_src/**` is the only version of the route source that's committed.

Verified: with an empty manifest, `pnpm build` succeeds and emits zero `/photos/*` pages/routes in `out/`. With a scratch-seeded manifest (temporary, not committed — see phase report), `pnpm photos && pnpm build` materializes the routes and both the grid and detail pages render correctly, including prev/next.

One consequence worth flagging for phase 5 or later maintenance: `next dev` does not run `scripts/photos.mjs` (the "dev" script is plain `next dev`), so `/photos/<year>/` will 404 in local dev until someone runs `pnpm photos` at least once to materialize the route. This mirrors the pre-existing behavior for derivative generation (dev also never auto-runs `scripts/photos.mjs` for that), so it's a pre-existing gap this phase didn't introduce, just extended to routing too.

## Phase 5 / final review (2026-07-19)

Whole-branch review (d2b8d80..aab3589) verdict: ready to merge after one fix wave, which landed in `aab3589` (duplicate `<main>` landmarks demoted in `app/(editor)/writing/[slug]/page.tsx`, `app/(editor)/projects/isascrawler/page.tsx`, both `app/(editor)/photos/_src/` pages; `lib/photos.ts` `scanOriginals` now lowercases extensions before `isPhotoExt` so validation matches `scripts/photos.mjs`'s case-insensitive scan).

Deliberately left unfixed (reviewed, all judged non-blocking):

- `lib/buildinfo.ts` — one-line `?? 'dev'` read has no dedicated test; the branching logic it depends on lives (and is exercised) in `next.config.mjs`.
- `lib/tree.ts` `breadcrumbFromPath` — partial paths `/writing/`, `/photos/` fall to the generic fallback; both are dead routes today, unasserted by tests.
- `lib/photos.ts` sort comparator — returns `1` instead of `0` when year+slug are equal and only ext differs; unreachable with a sane manifest (such entries would collide in `photoSrc` anyway).
- `app/components/editor/Sidebar.tsx` — drawer-close `onClick` sits on the whole `<nav>`, so tapping a non-link directory label closes the mobile drawer without navigating.
- Photo-route materialization is documented in CLAUDE.md/QUESTIONS.md/`scripts/photos.mjs` but not signposted at the seeder's entry points (`lib/photos.ts` `photoManifest`, `content/photos/`).
- `.photo-grid img` / `.photo-detail img` in `app/globals.css` have byte-identical rule bodies; selectors could be combined.
- `content/README.md` renders `/` with no `<h1>` (first heading is `## elsewhere`) — flagged as a content/design decision for Farhad, not changed: the plan's brief specified "serif intro + elsewhere links + press t line" with no heading.
- Photo pages get the ≥1100px `.editor-doc` gutter left-padding but no gutter numbers (gutter is scoped to `.prose`); cosmetic.
- shiki's own github-light keyword color `#D73A49` is 4.01:1 on `--code-bg` (AA-large only) — inherent to the locked `github-light` theme; the site's own `--syn-*` accents all pass AA (5.21–12.47:1).
