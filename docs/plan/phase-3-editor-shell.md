# Phase 3 — Editor shell, route group, content migration

> Part of [frhd.me → editor-chrome](master.md). See index for invariants.

**Status:** todo

**Depends on:** 1

**Goal:** The visible transformation: every reading page renders inside the editor chrome (sidebar tree, breadcrumb, build footer), the homepage becomes `content/README.md`, `/now` exists, the old homepage component dies, the 404 goes editor-flavored. Terminal untouched.

## Files

- Move: `app/components/home/ThemeToggle.tsx` → `app/components/ThemeToggle.tsx` (+ its test). Importers to patch: `app/page.tsx` (imports AND renders it — dies later this phase, but must compile at every commit), `app/writing/[slug]/page.tsx`, `app/not-found.tsx`; the moved test's relative `../ThemeToggle` import survives the move as-is. Cosmetic: `lib/theme.ts` doc comment references the old path. CSS: move the `position:fixed; top/right` lines out of `.theme-toggle` into a new `.theme-toggle--floating` modifier that only the 404 uses (in the chrome it sits in the sidebar flow; on the 404 it keeps floating top-right)
- New: `app/components/editor/Sidebar.tsx` — client (`usePathname` active-file, mobile drawer state, closes on nav); recursive `TreeNode` render; root label `~/frhd.me`; foot: `github ↗`, `rss ↗`, `<ThemeToggle/>`
- New: `app/components/editor/__tests__/Sidebar.test.tsx` — mock `next/navigation`; assert nodes render, `aria-current="page"` on active (trailing-slash tolerant)
- New: `app/components/editor/Breadcrumb.tsx` — client; `breadcrumbFromPath(usePathname())`
- New: `app/components/editor/EditorShell.tsx` — presentational: `<Sidebar/>` + pane (breadcrumb, children, footer `⎇ {commitHash} · press t`)
- New: `app/(editor)/layout.tsx` — builds tree from `getAllPosts()` + `projects` + `photoYears(getAllPhotos())`, wraps children in `EditorShell`
- Move: `app/page.tsx` → `app/(editor)/page.tsx` — rewritten: read `content/README.md`, `renderMdx`, `.prose` article
- Move: `app/writing/` → `app/(editor)/writing/` — drop `ThemeToggle` + `post-back` link from post page
- Move: `app/projects/` → `app/(editor)/projects/` — same chrome-stripping if present
- New: `content/README.md` — serif intro + elsewhere links + `press t` line
- New: `content/now.md` + `app/(editor)/now/page.tsx` — same shape as README page, own metadata title
- Delete: `app/components/home/HomePage.tsx` + `app/components/home/__tests__/HomePage.test.tsx`
- Touches: `app/globals.css` — editor layout styles (grid `240px minmax(0,1fr)`, sticky mono sidebar on `--chrome-bg`, `.tree-*` classes with syntax-role colors, active row on `--active-bg`, breadcrumb, pane, ≤767px drawer under a `~/frhd.me ☰` topbar); delete dead homepage CSS; slim `.post` (drop its `max-width`/`margin: 0 auto` and heavy padding — the pane owns the column now, otherwise posts double-frame and center inside a left-aligned pane)
- Touches: `app/not-found.tsx` + `app/__tests__/not-found.test.tsx` — heading `no such file`, body `E404: this path doesn't resolve — the file moved, or it never existed.`; stays outside chrome

## Dead-CSS keep-list

Delete: `.site-header .site-nav .home-grid .home-col .home-heading .entry .entry-head .entry-title .entry-date .entry-blurb .home-now .home-elsewhere .home-sep .home-footer`.
Keep: `.site .site-name .home-intro .home-hint` (404 + pane footer use them) and all `.post*` / `.prose` rules.

## Exit criteria

- `/`, `/writing/a-quieter-frhd-me/`, `/projects/isascrawler/`, `/now/` all render inside the chrome with correct active-file highlight and breadcrumb (`README.md`, `writing/….md`, …).
- `/terminal` full-screen, chrome-free; `t` hotkey still navigates from a document page.
- Narrow viewport: topbar toggles the drawer; drawer closes after navigating.
- Sidebar + not-found tests green; HomePage test removed; `pnpm check` green; commits without attribution lines.

## Gotchas

- `(editor)` is a route *group* — moving `page.tsx` into it must not change URLs. Verify `pnpm build` route list is identical (plus `/now`).
- `app/not-found.tsx` stays at app root: inside the group it would lose 404 semantics for non-group paths; it intentionally has no sidebar.
- Sidebar is client but receives the tree as serializable props — keep `TreeNode` JSON-plain (no functions/Dates) or the RSC boundary throws.
- `usePathname` may return paths without trailing slash despite `trailingSlash: true` — normalize both sides before comparing (tests pin this).
- Shell must live under `app/(editor)/layout.tsx`, NOT the root layout — otherwise the terminal gets chrome.
- `git mv` the moved files so history follows; run `pnpm check` only after all imports are patched, then commit the move atomically. In particular the ThemeToggle move and the `app/page.tsx` rewrite must land in the same commit window — between them the old homepage imports a moved file.
- Don't hardcode the mobile topbar height in the drawer's `inset` — anchor with `top: 100%` on a positioned topbar or share a `--topbar-h` custom property; a hardcoded `41px` breaks the first time the font size changes.
