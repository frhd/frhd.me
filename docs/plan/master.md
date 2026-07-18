# frhd.me → editor-chrome: v3 redesign

The quiet editorial site becomes a code editor: today navigation is a header on top of a page; end state is a persistent sidebar file tree where the content *is* the files and the serif page is the open document.

## Context

v2 ("Monospace Quiet" → editorial serif two-column, spec `docs/superpowers/specs/2026-07-18-frhd-me-v2-design.md`) reads well but has no personality above the fold. Research (`docs/research/creative-sites-report.md`, 24 verified findings) shows distinctive personal sites commit to one concept plus hidden layers. The chosen concept, inspired by robinrendle.com: the site is an editor (Sublime-style file tree, syntax-colored chrome, Monokai dark), the documents stay editorial serif, and the existing `/terminal` easter egg becomes the same computer's other window. Adds a new first-class `photos/` section (seeded small).

## End-state architecture

| Subsystem | Role |
|---|---|
| `app/(editor)/` route group + `EditorShell`/`Sidebar`/`Breadcrumb` | The chrome: sidebar tree, open-file breadcrumb, build footer. All reading pages live in the group; `/terminal` stays outside, full-screen. |
| `lib/tree.ts` | Pure tree/breadcrumb builders; content in, sidebar data out. |
| `lib/posts.ts`, `lib/projects.ts` (existing) | Unchanged content sources. |
| `lib/photos.ts` + `scripts/photos.mjs` | Strict photo manifest (both-ways validation) + sharp pre-sizing into `public/photos/` (gitignored). |
| `content/README.md`, `content/now.md` | Homepage and /now as literal MDX files. |
| `lib/mdx.tsx` + rehype-pretty-code/shiki | Build-time dual-theme code highlighting with line numbers. |
| `app/globals.css` tokens | Existing `--bg/--fg/…` extended with `--chrome-*`, `--active-bg`, `--syn-*`; light = warm paper + accents, dark = Monokai. |
| Terminal (`app/terminal`, `app/components/terminal/`) | Untouched. |

## Invariants and locked defaults

1. Static export (`output: 'export'`) — no server runtime, everything resolves at build time.
2. `pnpm check` passes before every commit (pre-commit hook enforces it). Commits: lowercase imperative, **no Claude attribution lines**.
3. `globals.css` dark tokens are duplicated in the `@media (prefers-color-scheme: dark)` no-JS fallback — every dark change is mirrored there.
4. Tailwind utilities are not generated in this pipeline; write plain CSS against tokens. Never reference `@theme` block variables.
5. Reading pane stays serif (Benne via `--font-serif`); chrome is Geist Mono.
6. Terminal stays at `/terminal` with the `t` hotkey; no editor chrome on it.
7. Approved design is locked — do not re-debate:
   - **Default:** full editor chrome + full editor theme; NO tabs, NO bottom status bar (declined).
   - **Default:** dark = Monokai (`--bg #272822`, keyword `#f92672`, string `#e6db74`, function `#a6e22e`, constant `#ae81ff`, comment `#75715e`, accent `#66d9ef`); light = current paper + GitHub-light-ish accents.
   - **Default:** photos via explicit manifest in `lib/photos.ts`; derived sizes thumb 480w / large 1600w WebP q82; not in RSS; no lightbox.
   - **Default:** shiki themes `{ light: 'github-light', dark: 'monokai' }` with `defaultColor: false`, `keepBackground: false`.
   - **Default:** document footer `⎇ <short-hash> · press t`; no per-file modified dates in v1.

## Phase index

| Phase | File | Depends on | Status |
|---|---|---|---|
| 1 | [phase-1-foundations.md](phase-1-foundations.md) | none | done |
| 2 | [phase-2-photos-data.md](phase-2-photos-data.md) | none | done |
| 3 | [phase-3-editor-shell.md](phase-3-editor-shell.md) | 1 | done |
| 4 | [phase-4-photos-routes.md](phase-4-photos-routes.md) | 2, 3 | todo |
| 5 | [phase-5-syntax-and-polish.md](phase-5-syntax-and-polish.md) | 1–4 | todo |

Update both this table AND the phase file's status header at phase start and exit.

## Critical files

| Concern | Path |
|---|---|
| Design tokens (both themes + fallback block) | `app/globals.css` (top three token blocks) |
| Root layout (fonts on `<html>`, theme script, hotkey, GA) | `app/layout.tsx` |
| Content loaders (pattern to mirror) | `lib/posts.ts` |
| MDX pipeline | `lib/mdx.tsx` |
| Static-export config | `next.config.mjs` |
| Test setup / idioms | `vitest.config.ts`, `test/setup.ts`, `lib/__tests__/posts.test.ts` |
| Approved design decisions (full detail) | this file + `docs/research/creative-sites-report.md` |

## Sequencing and gates

Phase 1 first; phases 2 and 3 can run in either order (or parallel) after it; 4 after 2+3; 5 last. Every phase exits green (`pnpm check`) and committed. No human gates: phase 4 seeds with generated Monokai-gradient placeholders (real photos swap in later via manifest edit alone). Phase 5 ends with the full `pnpm pre-deploy` + serve-`out/`-and-click-through gate and the merge of the `editor-chrome` branch (all phases work on that branch).

## Open risks

- `generateStaticParams` returning `[]` under `output: 'export'` (empty photo manifest window between phases 4a and 4b) — phase 4 verifies the build both empty and seeded.
- rehype-pretty-code/shiki API drift vs. the plan's config — phase 5 verifies against installed versions before wiring.
- Existing `lib/__tests__/mdx.test.tsx` assertions may break on the new `<pre>` wrapper — phase 5 updates them deliberately, not by weakening.
- Monokai-light contrast: light-theme syntax accents must clear WCAG AA on `#fcfcf9`/`#f4f3ec` — phase 1 eyeballs, phase 5 verifies.
- Removing `.home-*` CSS while 404 still uses `.site`/`.home-intro`/`.home-hint` — phase 3 has the exact keep-list.
