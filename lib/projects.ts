/**
 * Curated project list for the `## work` section of the homepage.
 *
 * `slug` is only set when a `/projects/<slug>` writeup page exists, in which
 * case the work list links there instead of out via `href`. Every entry must
 * have at least one of `href` or `slug`.
 */
export interface Project {
  /** Short project name. */
  name: string
  /** One-line description. */
  oneLiner: string
  /** External link (GitHub, demo, etc.). Omitted when the project only has an internal writeup. */
  href?: string
  /** Present only when a `/projects/<slug>` writeup page exists; the work list links there. */
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
  {
    name: 'ISAScrawler',
    oneLiner:
      'rebuilt a caterpillar swarm robot — mechanics, electronics, firmware (Uni Karlsruhe, 2007)',
    slug: 'isascrawler',
  },
]
