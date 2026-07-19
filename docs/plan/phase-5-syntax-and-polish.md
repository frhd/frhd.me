# Phase 5 — Shiki highlighting, gutter, docs, ship

> Part of [frhd.me → editor-chrome](master.md). See index for invariants.

**Status:** done

**Depends on:** 1–4

**Goal:** The editor theme reaches the documents: build-time syntax highlighting with line numbers in the site's palette, the decorative wide-screen gutter, updated repo docs, and the full pre-deploy gate + merge.

## Files

- Touches: `lib/mdx.tsx` — add `rehype-pretty-code`: `theme {light:'github-light', dark:'monokai'}`, `defaultColor:false`, `keepBackground:false`, `defaultLang:'text'` (locked in master)
- Touches: `lib/__tests__/mdx.test.tsx` — new test: fenced block renders `data-rehype-pretty-code-figure` + `--shiki-dark` var; update existing assertions deliberately if the `<pre>` wrapper changes them
- Touches: `app/globals.css` — shiki dual-theme switching (`--shiki-light` default, `--shiki-dark` under `[data-theme='dark']` AND the no-JS fallback media block), CSS-counter line numbers on `[data-line]`, decorative gutter ≥1100px (counter on `.pane-doc .prose > *::before`, extra pane left-padding)
- Touches: `CLAUDE.md` (frhd.me) — architecture section rewritten for the editor shell (route group, tree/photos modules, README/now content files, shiki, chrome tokens)
- Touches: `docs/plan/master.md` — statuses to done

## Exit criteria

- A `ts` fenced block shows highlighted tokens + line numbers in both themes (verify by temporarily adding one to `content/now.md`, then removing it).
- Gutter numbers appear ≥1100px on `/` and a post, absent on mobile, and do not double-number inside code figures (selector hits only direct `.prose` children).
- Light-theme syntax accents pass WCAG AA against `#fcfcf9` (spot-check keyword/string/function with a contrast checker).
- `pnpm pre-deploy` green; serve `out/` and click through every route incl. 404, `/terminal`, `t` hotkey, both themes, mobile width.
- `CLAUDE.md` matches reality; plan statuses updated; `editor-chrome` branch merged to main (ask Farhad: merge vs. PR).

## Gotchas

- Verify installed rehype-pretty-code/shiki APIs before wiring — option names have churned across majors; if `defaultColor:false` output shape differs, adapt the CSS, not the invariant (dual theme via CSS vars).
- The dark-mode shiki override needs BOTH `[data-theme='dark']` and the `prefers-color-scheme` fallback selector — same mirroring rule as tokens.
- `renderMdx` gains its first plugin — keep the "trusted local content, no sanitisation" doc comment honest.
- Don't ship the temporary code block in `now.md`.
