/**
 * Pure sidebar-tree and breadcrumb builders for the editor chrome.
 *
 * `buildTree` takes already-loaded content (posts, projects, photo years) and
 * shapes it into the file-tree the sidebar renders; it never touches fs. That
 * keeps it usable both at build time (fed by `getAllPosts()` etc. in the
 * (editor) layout) and in tests, and keeps `TreeNode` JSON-plain (no
 * functions, no Dates) so it can cross the client-component boundary as
 * serializable props.
 */

export type TreeNodeType = 'file' | 'dir' | 'external'

export interface TreeNode {
  /** Row label as shown in the sidebar, e.g. "writing/" or "now.md". */
  label: string
  type: TreeNodeType
  /** Present on files/external links; dirs are expand-only containers. */
  href?: string
  children?: TreeNode[]
}

/** Minimal shape `buildTree` needs from a post — structurally compatible with `PostMeta`. */
export interface TreePost {
  slug: string
}

/** Minimal shape `buildTree` needs from a project — structurally compatible with `Project`. */
export interface TreeProject {
  name: string
  href?: string
  slug?: string
}

export interface BuildTreeInput {
  /** Already ordered (newest first); order is preserved as given. */
  posts: TreePost[]
  projects: TreeProject[]
  /** Already ordered (newest first); order is preserved as given. Omitted/empty hides the photos/ row entirely. */
  photoYears?: string[]
}

function writingNode(posts: TreePost[]): TreeNode {
  return {
    label: 'writing/',
    type: 'dir',
    children: posts.map((post) => ({
      label: `${post.slug}.md`,
      type: 'file',
      href: `/writing/${post.slug}/`,
    })),
  }
}

function projectsNode(projects: TreeProject[]): TreeNode {
  return {
    label: 'projects/',
    type: 'dir',
    children: projects.map((project) =>
      project.slug
        ? {
            label: `${project.slug}.md`,
            type: 'file',
            href: `/projects/${project.slug}/`,
          }
        : { label: project.name, type: 'external', href: project.href },
    ),
  }
}

function photosNode(photoYears: string[]): TreeNode {
  return {
    label: 'photos/',
    type: 'dir',
    children: photoYears.map((year) => ({
      label: `${year}/`,
      type: 'dir',
      href: `/photos/${year}/`,
    })),
  }
}

/**
 * Builds the sidebar tree in the locked order: README.md, writing/,
 * projects/, photos/ (only when at least one photo year exists), now.md.
 */
export function buildTree({ posts, projects, photoYears = [] }: BuildTreeInput): TreeNode[] {
  const tree: TreeNode[] = [
    { label: 'README.md', type: 'file', href: '/' },
    writingNode(posts),
    projectsNode(projects),
  ]

  if (photoYears.length > 0) {
    tree.push(photosNode(photoYears))
  }

  tree.push({ label: 'now.md', type: 'file', href: '/now/' })

  return tree
}

/**
 * Maps a pathname to the sidebar breadcrumb's "open file" label. Trailing
 * slash tolerant (comparisons are done on the slash-stripped path); for
 * unrecognized routes falls back to the path with only its leading slash
 * removed.
 */
export function breadcrumbFromPath(pathname: string): string {
  const noLeading = pathname.replace(/^\/+/, '')
  const segments = noLeading.replace(/\/+$/, '').split('/').filter(Boolean)

  if (segments.length === 0) return 'README.md'

  const [first, second, third] = segments

  if (first === 'writing' && segments.length === 2) return `writing/${second}.md`
  if (first === 'projects' && segments.length === 2) return `projects/${second}.md`
  if (first === 'now' && segments.length === 1) return 'now.md'
  if (first === 'photos' && segments.length === 2) return `photos/${second}/`
  if (first === 'photos' && segments.length === 3) return `photos/${second}/${third}`

  return noLeading
}
