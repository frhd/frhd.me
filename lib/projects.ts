/**
 * Curated project list for the `## work` section of the homepage.
 *
 * `slug` is only set when a `/projects/<slug>` writeup page exists. No writeups
 * exist in v1, so every entry links straight out via `href`.
 */
export interface Project {
  /** Short project name. */
  name: string
  /** One-line description. */
  oneLiner: string
  /** External link (GitHub, demo, etc.). */
  href: string
  /** Present only when a longer writeup page exists. */
  slug?: string
}

export const projects: Project[] = [
  {
    name: 'frhd.me',
    oneLiner: 'this site — and the whole terminal OS it used to be (press t)',
    href: 'https://github.com/frhd/frhd.me',
  },
  {
    name: 'jarvis',
    oneLiner:
      'telegram ingestion + AI service with multi-tier LLM routing and semantic memory',
    href: 'https://github.com/frhd/jarvis',
  },
  {
    name: 'gaussian-approx',
    oneLiner: 'kalman-based gaussian approximator',
    href: 'https://github.com/frhd/gaussian-approx',
  },
  {
    name: 'tetris-rl-nn',
    oneLiner: 'teaching a neural net to play tetris',
    href: 'https://github.com/frhd/tetris-rl-nn',
  },
]
