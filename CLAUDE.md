# CLAUDE.md — frhd.me

Personal site. A static Next.js (App Router) export styled as a **code editor**:
a persistent sidebar file tree is the navigation, the content *is* the files,
and each file opens in a serif reading pane. The old xterm.js terminal the site
used to be still lives at `/terminal` (press `t` from anywhere).

## Commands

- `pnpm dev` — Next dev server. Note: it does **not** run `scripts/photos.mjs`,
  so photo derivatives and `/photos/<year>/` routes are absent until you run
  `pnpm photos` once (see "Photos" below).
- `pnpm build` — runs `scripts/photos.mjs` then `next build` (static export to `out/`).
- `pnpm photos` — regenerate photo derivatives and materialize photo routes.
- `pnpm check` — lint + type-check + tests. **Must be green before every commit**
  (also enforced by a pre-commit hook).
- `pnpm pre-deploy` — `pnpm check` then `pnpm build`; the ship gate.
- `pnpm test` / `pnpm test:run` — vitest (watch / once).

Commits: lowercase imperative subjects, **no Claude attribution lines** (subjects
or bodies).

## Architecture

Static export (`output: 'export'` in `next.config.mjs`, `trailingSlash: true`,
`images.unoptimized`). Everything resolves at build time; there is no server
runtime and no client-side MDX/content runtime.

**Editor shell (the chrome).** All reading pages live in the `app/(editor)/`
route group. `app/(editor)/layout.tsx` builds the sidebar tree once at build
time from the content sources and wraps each route in `EditorShell`
(`app/components/editor/`: `EditorShell`, `Sidebar`, `Breadcrumb`). `/terminal`
is deliberately **outside** the group so it stays full-screen and chrome-free.
Routes in the group: `/` (README), `/now`, `/writing/[slug]`,
`/projects/isascrawler`, `/photos/[year]` + `/photos/[year]/[slug]`.

**Tree / breadcrumb (`lib/tree.ts`).** Pure builders — content in, sidebar data
out; never touches the filesystem. `buildTree` shapes already-loaded posts,
projects, and photo years into JSON-plain `TreeNode`s (serializable across the
client-component boundary) in a locked order: `README.md`, `writing/`,
`projects/`, `photos/` (only when a photo year exists), `now.md`.
`breadcrumbFromPath` maps a pathname to the "open file" label.

**Content sources.**
- `lib/posts.ts` — writing posts from `content/writing/*.mdx` (frontmatter via gray-matter).
- `lib/projects.ts` — project list (some in-repo pages, some external links).
- `content/README.md` and `content/now.md` — the homepage and `/now` as literal
  Markdown files rendered through the MDX pipeline.
- `lib/photos.ts` — see below.
- `lib/rss.ts` + `app/rss.xml/route.ts` — feed (photos are excluded from RSS).
- `lib/buildinfo.ts` — reads `NEXT_PUBLIC_COMMIT` (resolved from `git rev-parse`
  in `next.config.mjs`) for the chrome footer.

**MDX + syntax highlighting (`lib/mdx.tsx`).** `renderMdx` compiles trusted
local Markdown/MDX via `next-mdx-remote/rsc` at build time. Content is our own
files, so it is treated as trusted — **no HTML sanitisation**. The one rehype
plugin is **rehype-pretty-code** (shiki) for build-time syntax highlighting.
Locked config (also in `docs/plan/master.md`): themes
`{ light: 'github-light', dark: 'monokai' }`, `keepBackground: false`,
`defaultLang: 'text'`, `bypassInlineCode: true`. A `{ light, dark }` theme record
makes rehype-pretty-code emit **both** palettes as `--shiki-light` / `--shiki-dark`
inline CSS vars per token (it sets shiki's `defaultColor: false` itself — that
option is no longer public in rehype-pretty-code 0.14.x). `app/globals.css` picks
the active palette per theme, so the theme flip never re-highlights.
`bypassInlineCode` keeps inline `` `code` `` a plain `<code>` chip (styled by
`.prose code`), off the highlighter and off the line-number gutter.

**Styling / tokens (`app/globals.css`).** Plain CSS against CSS-variable tokens —
**not Tailwind utilities** (they are not generated in this pipeline; the `@theme`
block is inert, never reference its vars). Tokens for both themes:
`--bg/--fg/--muted/--accent/--border/--code-bg`, chrome (`--chrome-*`,
`--active-bg`), and syntax roles (`--syn-keyword/-string/-function/-constant/-comment`,
used by the sidebar tree and gutter). Reading pane is serif (`--font-serif`,
Benne); chrome and code are Geist Mono.

**Theme rule (critical).** There are **three** token blocks: light (`:root`),
dark (`:root[data-theme="dark"]`), and a no-JS OS fallback
(`@media (prefers-color-scheme: dark) :root:not([data-theme])`). The dark and
fallback blocks are duplicated on purpose — **every dark change must be mirrored
in both**. This applies to the shiki dual-theme switch too: the rule that flips
tokens from `--shiki-light` to `--shiki-dark` exists in both the
`[data-theme='dark']` selector and the `prefers-color-scheme` fallback.

**Code gutters (`app/globals.css`).** Two CSS-counter gutters: (1) line numbers
inside fenced blocks, scoped to `[data-rehype-pretty-code-figure] pre code
[data-line]` so only block code is numbered; (2) a decorative wide-screen
(≥1100px) editor gutter numbering **only direct `.prose` children**
(`.editor-doc .prose > *::before`) — `> *` keeps it off the code figure's inner
`[data-line]` rows, so a block's lines are never double-numbered.

**Photos (`lib/photos.ts` + `scripts/photos.mjs`).** Photos have no per-file
frontmatter: originals live at `content/photos/<year>/<slug>.<ext>` (pixels
only) and metadata lives in the explicit `photoManifest`. The two are
cross-validated both ways at build time (manifest entry with no original throws,
and vice versa). `scripts/photos.mjs` pre-sizes derivatives (thumb 480w / large
1600w WebP) into `public/photos/` (gitignored).

Route materialization gotcha: under `output: 'export'`, a dynamic route whose
`generateStaticParams()` returns `[]` **errors** the build (this Next version
treats empty the same as missing). So the authored photo route source lives in
the non-routing `app/(editor)/photos/_src/[year]/` folder (Next ignores
`_`-prefixed folders). `scripts/photos.mjs` copies `_src/[year]/` to the real
routable `photos/[year]/` **only when at least one photo original exists on
disk**, and removes it otherwise. The materialized `photos/[year]/` is
gitignored; only `_src/**` is committed. Because `pnpm dev` never runs
`scripts/photos.mjs`, `/photos/<year>/` 404s in dev until you run `pnpm photos`
once. (Full analysis in `docs/plan/QUESTIONS.md`.)

**Terminal.** `app/terminal/` + `app/components/terminal/` — a large xterm.js
easter-egg app (games, vim, adventure, plugins). Untouched by the editor
redesign; keep it that way.

## Planning docs

The editor redesign is tracked in `docs/plan/` — `master.md` (invariants + phase
index), `phase-N-*.md` files, and `QUESTIONS.md` (append-only cross-phase issue
log). Update statuses in both `master.md`'s table and the phase file header at
phase start/exit.
