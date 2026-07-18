# Phase 1 — Dependencies, design tokens, tree builder, build info

> Part of [frhd.me → editor-chrome](master.md). See index for invariants.

**Status:** done

**Depends on:** none (foundation phase)

**Goal:** Everything the shell and highlighting phases build on: new dependencies installed, chrome/syntax tokens in both themes, the pure sidebar-tree/breadcrumb module with tests, and the build-time commit hash. No visible layout change yet beyond the Monokai dark palette.

## Files

- Touches: `package.json` — `pnpm add rehype-pretty-code shiki && pnpm add -D sharp`
- Touches: `app/globals.css` — new tokens in all three blocks (light, dark, no-JS dark fallback — mirror!)
- New: `lib/tree.ts` — `TreeNode`, `buildTree()`, `breadcrumbFromPath()`; pure, no fs
- New: `lib/__tests__/tree.test.ts` — TDD the module
- New: `lib/buildinfo.ts` — exports `commitHash` from `process.env.NEXT_PUBLIC_COMMIT ?? 'dev'`
- Touches: `next.config.mjs` — add `env.NEXT_PUBLIC_COMMIT` via `execSync('git rev-parse --short HEAD')` in try/catch

## Locked token values

Light block additions: `--chrome-bg #f4f3ec; --chrome-fg #3d3d36; --active-bg #e9e7db; --syn-keyword #cf222e; --syn-string #0a3069; --syn-function #1a56db; --syn-constant #953800; --syn-comment #6b6b62`.
Dark block becomes Monokai (replaces current values): `--bg #272822; --fg #f8f8f2; --muted #a59f85; --accent #66d9ef; --border #3e3d32; --code-bg #1e1f1c; --chrome-bg #1e1f1c; --chrome-fg #c8c5b6; --active-bg #3e3d32; --syn-keyword #f92672; --syn-string #e6db74; --syn-function #a6e22e; --syn-constant #ae81ff; --syn-comment #75715e`.

## Tree contract (what the tests pin)

- Order: `README.md`, `writing/`, `projects/`, [`photos/` iff years], `now.md`.
- Posts → `<slug>.md` files hrefed `/writing/<slug>/`, given order preserved.
- Projects: `slug` → file `<slug>.md`; href-only → `external` node labeled with plain name.
- `photoYears: string[]` (newest first) → `photos/` dir of `<year>/` rows hrefed `/photos/<year>/`.
- `breadcrumbFromPath`: `/`→`README.md`; `/writing/x/`→`writing/x.md`; `/projects/x/`→`projects/x.md`; `/now/`→`now.md`; `/photos/2026/`→`photos/2026/`; `/photos/2026/x/`→`photos/2026/x`; trailing-slash tolerant; unknown → path sans leading slash.

## Exit criteria

- `pnpm vitest run lib/__tests__/tree.test.ts` green, covering all bullets above.
- Dark mode in `pnpm dev` shows Monokai surfaces; light mode visually unchanged; both fallback-block values match `[data-theme="dark"]` exactly (diff the two blocks).
- `pnpm check` green; one commit per concern (deps / tokens / tree / buildinfo), no attribution lines.

## Gotchas

- `js-yaml`-style strictness lives in posts, not here — tree builder must not touch fs, or the (editor) layout becomes untestable.
- The `@theme` block at the top of globals.css is inert legacy — add nothing there.
- `execSync` without try/catch breaks Vercel/CI builds without git — keep the `'dev'` fallback.
- Changing `--bg` in dark mode restyles the 404 and post pages too — that's intended; the terminal has its own black container and must not shift.
