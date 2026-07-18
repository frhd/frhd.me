# frhd.me v2 — "Monospace Quiet" Design

**Date:** 2026-07-18
**Status:** Approved by Farhad (brainstorm session)

## Goal

Replace the terminal-only frhd.me homepage with a quiet, text-first personal site in the spirit of rsms.me — a proper exhibition site with projects, writing, and links — while keeping the existing xterm.js terminal as an easter egg.

## Context & decisions already made

- **frhd.me is the canonical personal site.** omid.cc remains email-only (farhad@omid.cc via Namecheap forwarding); its DNS and server are untouched by this project.
- **Audience:** Farhad himself and fellow developers. Not optimized for recruiters or clients.
- **Voice: "monospace quiet"** — chosen over a grotesk specimen (too close to cloning rsms.me directly) because it keeps the site's terminal heritage coherent and is forgiving to maintain. The voice is deliberately reversible: it is a stylesheet decision, not an architectural one.
- **The existing terminal becomes an easter egg**, not the homepage.

## Site structure

The homepage is the site. One column, no navigation bar, everything within roughly one screen's scroll:

```
farhad omid
<two-line intro>

## work        — curated project list: name + one-liner, linking to GitHub/demo
## writing     — post list: date + title
## now         — one line about current activity (static text in v1)
## elsewhere   — github / email / rss
footer: … | press t
```

Subpages only where content demands them:

- `/writing/<slug>` — blog posts (MDX).
- `/projects/<slug>` — optional longer project writeups; short projects link directly out. First writeup: the ISAScrawler Studienarbeit — see [ISAScrawler showcase design](2026-07-18-isascrawler-showcase-design.md).
- `/terminal` — the existing xterm.js terminal, full-screen.
- `/rss.xml` — RSS feed of the writing posts (see below).
- 404 page — one quiet line in the same voice, linking home.

Pressing `t` anywhere on the site navigates to `/terminal` (plain navigation, no overlay). The listener ignores keypresses when a text input or textarea is focused or when a modifier key is held. The only advertisement of this is a faint `press t` in the footer.

### RSS

`/rss.xml` contains all writing posts (title, date, link, summary when present), generated at build time from the same MDX source as the post list — an `app/rss.xml/route.ts` route handler marked `force-static`, which the static export renders to a file. No new runtime dependency required; the feed generation is unit-tested like the other content-loading code.

## Stack

Evolve the existing frhd.me Next.js 16 repo. Rationale: the terminal code, Vercel deployment, and test tooling (`pnpm check`: lint + type-check + vitest) already live there; static export (`output: 'export'`) stays.

- Homepage swaps `<XTerminal>` for the new quiet page. Terminal component moves behind `/terminal` and the `t` key listener.
- **Posts:** MDX files in the repo. Frontmatter schema: `title` (string, required), `date` (ISO string, required), `summary` (string, optional); slug derives from the filename.
- **Projects:** a simple typed data file; each entry has `name`, `oneLiner`, `href`, and optional `slug` when a `/projects/<slug>` writeup exists.
- No server runtime features (consistent with static export).

Alternative considered and rejected: fresh Astro build — better blog ergonomics but requires porting or iframing the terminal and rebuilding deploy/tooling.

## Design system

- **Type:** Geist Mono (already in repo) for all structure — headings, dates, lists, metadata, homepage. Geist Sans for long-form post bodies (monospace tires over 2,000 words).
- **Themes:** light and dark, default from `prefers-color-scheme`, small manual toggle, preference persisted. One accent color (link blue), tuned per theme. The site theme and the terminal's own theme system (`theme-manager.ts`, green-on-black) are independent — no attempt to unify them.
- **No images required** for the design to hold; project writeups may include them.

## Living details (post-v1 roadmap)

v1 ships completely still. Living details are added one at a time, each a small shippable experiment:

1. `## now` line fed by real data — client-side fetch of latest GitHub commit (works on a static site).
2. Hover previews on project links.
3. Further details only as they earn their place.

## Domains & hosting

- **frhd.me:** stays on Vercel (current setup).
- **omid.cc:** untouched, email only.
- **frhd.github.io:** becomes a one-file redirect to frhd.me, so the guessable GitHub URL lands on the real site. This lives in its own git repo (`frhd.github.io/`), so the implementation plan treats it as a standalone final task, not interleaved with frhd.me work. (Alternative kept in back pocket: host the static export on GitHub Pages with frhd.me as custom domain, dropping Vercel. Revisit only if Vercel becomes annoying.)

## Quality

- Existing `pnpm check` (lint, type-check, vitest) remains the commit gate; pre-commit hook already enforces it.
- New content-loading code (MDX/post listing, project data) gets unit tests.
- `pnpm pre-deploy` verifies the static export builds before deploying.

## Out of scope

- Any changes to omid.cc DNS, email, or its archived site backups.
- Redesigning the terminal itself.
- CMS, comments, analytics, or any server-side features.
