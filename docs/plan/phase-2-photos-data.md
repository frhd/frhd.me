# Phase 2 — Photos data layer and resize pipeline

> Part of [frhd.me → editor-chrome](master.md). See index for invariants.

**Status:** done

**Depends on:** none

**Goal:** The photo content module (strict manifest, mirrors `lib/posts.ts` philosophy) and the sharp pre-sizing script wired into the build. No routes yet — pure data + tooling, fully testable while the manifest is empty.

## Files

- New: `lib/photos.ts` — `PhotoEntry {year, slug, ext: 'jpg'|'jpeg'|'png', caption?}`, `photoManifest: PhotoEntry[]` (starts `[]`), `getAllPhotos(manifest?, dir?)`, `photoSrc(photo, 'thumb'|'large')` → `/photos/<year>/<slug>-<size>.webp`, `photoYears(photos)`
- New: `lib/__tests__/photos.test.ts` — temp-dir tests (`fs.mkdtempSync`), injectable manifest+dir like posts' injectable dir
- New: `scripts/photos.mjs` — scan `content/photos/<year>/*.{jpg,jpeg,png}` → `public/photos/<year>/<name>-thumb.webp` (480w) + `-large.webp` (1600w), webp q82, `withoutEnlargement`, skip when target mtime ≥ source, exit 0 quietly when dir missing
- Touches: `package.json` — `"photos": "node scripts/photos.mjs"`, `"build": "node scripts/photos.mjs && next build"`
- Touches: `.gitignore` — add `/public/photos/`

## Decisions to make in this phase

- None — validation strictness is locked: manifest entry without original **throws**; on-disk original without manifest entry **throws** (both directions fail `pnpm check`/build, like malformed post frontmatter).

## Exit criteria

- Tests green for: sort (year desc, slug asc), both strictness directions, `[]` for empty manifest + missing dir, `photoSrc`/`photoYears` shapes.
- `pnpm photos` with no `content/photos/` prints a quiet no-op line, exit 0.
- With a scratch image dropped in `content/photos/2026/`, `pnpm photos` emits both derivatives; second run skips ("up to date"); scratch files removed afterwards.
- `pnpm check` green; committed without attribution lines.

## Gotchas

- `getAllPhotos` runs inside the (editor) layout at build time in phase 3+ — keep it synchronous and cheap (existsSync/readdirSync only, never sharp).
- sharp is a devDependency; the build script runs on Vercel where devDeps are installed — do not move it to dependencies.
- Sort must be deterministic (tie-break slug asc) or `generateStaticParams` ordering flaps between builds.
