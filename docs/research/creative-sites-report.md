# Creative personal sites — verified research report

*Deep-research run, 2026-07-19. 102 agents: 5 search angles → 20 sources fetched → 99 claims extracted → 25 adversarially verified (24 confirmed, 1 refuted) → 11 synthesized findings. Companion files: `creative-sites-final-result.json` (full structured result), `creative-sites-raw-extract.md` (every agent's raw output), `creative-sites-journal-raw.jsonl` (raw journal).*

**Question:** Find super creative, distinctive personal websites/portfolios to draw redesign inspiration for frhd.me — what makes each special, and which ideas transfer to a developer site with an editorial base and a hidden terminal easter egg.

## The one-line takeaway

Across every verified site, distinctiveness comes from **one committed concept** (a drivable world, a printed paperback, a rainbow, a margin) **plus hidden discoverable layers**. frhd.me's terminal easter egg already starts this pattern — the site's problem is that the visible layer commits to nothing.

## Canonical examples, verified in depth

### Bruno Simon — bruno-simon.com *(maximalist end)*
The most-decorated playful developer portfolio: SOTD 2019 (8.04/10, Creativity 8.95); the 2025 rebuild took Portfolio Honors (Dec 2025), a Developer Award, and Site of the Month (Jan 2026).
- **Navigation as explorable world**: you drive a car through a Three.js/WebGPU world; social links and projects are drivable game elements; there is no menu. "Drive around to learn more about me and discover the many secrets of this world."
- **Humor in functional microcopy**: teleport button labeled "I'm stuck!", "And don't break anything!"
- **Real game mechanics on top of content**: achievements with timed rewards and unlockable skins, a racing circuit with a daily top-10 leaderboard, and a visitor-contributed multiplayer "Whispers" system (30 chars max, 30 messages max, one per visitor).
- **Transfer**: this is the maximalist version of the same idea as the hidden terminal — discovery *is* the interface. Microcopy humor costs nothing; achievements for finding secrets are proven; a tiny shared visitor-message mechanic works.

### Josh Comeau — joshwcomeau.com *(whimsy on an editorial base — closest architectural match)*
- **Hidden easter egg with a multiplayer twist**: the homepage rainbow reacts to the cursor; a configurator appears only after hovering; edits broadcast live to every visitor via PartyKit WebSockets ("you're not just changing the rainbow on your device, you're changing it for everybody"). Verified live in the site's production JS.
- **MDX chosen specifically so posts embed custom interactive components** — the core mechanism of his interactive-article feel. Stack: Next.js 15 + next-mdx-remote — directly compatible with frhd.me's `content/writing/` + static export.
- **His own caveats**: shared-state eggs needed moderation after launch chaos; MDX major-version migrations were painful.

### Lynn Fisher — lynnandtonic.com 2025 refresh *(editorial site with one committed metaphor)*
- **Printed-paperback concept**: fixed 436px book-page column, display fonts (Hubano Rough, Sydonia Atramentiqua), paper texture in light mode / dust in dark mode, table-of-contents landing, chapter headers.
- **Signature easter egg discoverable only by resizing**: the page stretches elastically during browser resize and snaps back with a bounce — "you have to resize to discover it." Directly analogous to hiding a terminal behind a hotkey.
- At rest the site is completely static — distinctiveness without ambient motion.

### Gwern — gwern.net *(typography-driven editorial reference)*
- **Sidenotes/margin notes** on wide screens (Tufte-style), falling back to floating footnotes on mobile.
- **Three visually distinct link-underline styles** (solid = ordinary, hooked = live preview, dotted = annotated popup) with recursive in-page preview popups.
- **Core reading experience requires no JavaScript** — everything above is progressive enhancement. Maps one-to-one onto frhd.me's static-export constraint: pre-rendered readable HTML with optional interactive islands (the terminal already is one).

## Pattern-scale ideas with named creators (fit an editorial site directly)

From the Awwwards Freelance Portfolios collection (verified against raw HTML):
- **Draggable 3D-polaroid hero** — Bartlomiej Pierzchala (chevez.shop)
- **Randomized color-theme switcher** — Aaron McGuire (aaronmcguire.design)
- **Index-as-homepage layout + depth-mapped scroll animations** — Guillaume Colombel (guillaumecolombel.fr)

## Award-validated individual sites to study (all verified against Awwwards records)

| Site | Creator | Award |
|---|---|---|
| hirotos.com | Hiroto Sato | SOTD Jul 17 2026 + Developer Award (3D/motion) |
| juliencalot.com | Julien Calot | SOTD Jul 8 2026 (artist site, agency-built: FLOT NOIR) |
| pacomepertant.com | Pacôme Pertant | SOTD Jun 9 2026 (motion/sound designer) |
| elliott.mangham.dev | Elliott Mangham | SOTD Dec 2 2025 (self-made dev) |
| gianlucagradogna.com | Gianluca Gradogna | SOTD Jan 23 2025 (multidisciplinary) |
| wodniack.dev | Antoine Wodniack | SOTD Dec 12 2024 (self-made dev) |
| guillaumecolombel.fr | Guillaume Colombel | SOTD + Developer Award Oct 20 2024 (self-made dev) |
| samsy.ninja | Samuel Honigstein | WebGPU multiplayer 3D world; FWA Site of the Year, Awwwards SOTD + Dev Award Oct 2025 *(medium confidence on the "50+ awards" bio figure)* |
| grit.pictures | Grit Pictures (studio) | Collage/scrapbook aesthetic — torn edges, retro Nokia/VHS props, GIF-plus-static collage; transferable tactile texture *(commercial studio, not individual)* |

## Seed pools for ongoing mining

- **Awwwards Portfolio Honors archive** — juried, dated winner archive (Apr 2024–Jun 2026): awwwards.com/websites/winner_category_portfolio/
- **Awwwards Freelance Portfolios collection** — 360 curated items: awwwards.com/awwwards/collections/freelance-portfolio/
- **brutalistwebsites.com** — ~1,599 weird-web entries, ~925 with first-person creator interviews ("Why do you have a Brutalist Website?"). A raw catalog + interview archive, **not** a manifesto (the "unifying philosophy" framing was refuted 0-3).
- **whimsical.club** (The Whimsical Web), **personalsit.es**, Brian Lovin's personal-websites list, Siteinspire typographic collection.

## Caveats (from the verification pass)

- Live sites redesign frequently — several examples won SOTD within days of the research date; re-check specifics at visit time.
- Samsy Ninja / Grit Pictures originate from a muz.li listicle (medium confidence despite primary corroboration).
- Not every "developer portfolio" is self-made (Calot: agency-built; Pertant: motion designer) — matters when studying what an individual can build solo.
- Shared-state easter eggs (Comeau's rainbow) need an external real-time service — frhd.me is a static export with no server runtime — plus moderation.
- Heavy WebGL/WebGPU conflicts with an editorial site's performance and no-JS-reading budget unless confined to an easter-egg surface like `/terminal`.

## Open questions for the design phase

1. Which patterns fit the static-export constraint without adding a server? (Third-party PartyKit/Cloudflare DO from a static page vs. purely client-side discovery mechanics — achievements, resize/hotkey secrets.)
2. What do the ~925 brutalist-site creator interviews say in aggregate? (Sampled, not synthesized.)
3. How discoverable should the terminal egg be? Verified examples split: zero signposting (Fisher's resize, Comeau's hover) vs. explicit invitation (Simon's "discover the many secrets").
4. Is there prior art for **terminal-flavored editorial sites** (as opposed to full terminal-only portfolios)? This round didn't surface any — possibly an open niche.

## All fetched sources

Primary: awwwards.com winner/collection/award pages, bruno-simon.com, gwern.net/design, joshwcomeau.com/blog/how-i-built-my-blog-v2, lynnandtonic.com 2025-refresh case study, brutalistwebsites.com.
Secondary/blog/forum: muz.li top-100 (2025), readymag award-winning-portfolios, onepagelove brutalist collection, reallygooddesigns neo-brutalist examples, whimsical.club, mxb.dev "The Whimsical Web", cassie.codes "Making a lil' me", personalsit.es, rachsmith.com on Lynn Fisher, Brian Lovin's list, HN thread 41645265.
