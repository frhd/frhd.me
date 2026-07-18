import { describe, expect, it } from 'vitest'

import { breadcrumbFromPath, buildTree } from '../tree'

/**
 * `buildTree` is pure (no fs): posts/projects/photoYears are passed in
 * directly rather than loaded, so these fixtures stand in for
 * `getAllPosts()` / `projects` / `photoYears(getAllPhotos())`.
 */
const posts = [{ slug: 'newest-post' }, { slug: 'older-post' }]

const projects = [
  { name: 'has writeup', slug: 'has-writeup' },
  { name: 'external only', href: 'https://example.com/external-only' },
]

describe('buildTree', () => {
  it('orders top-level rows as README.md, writing/, projects/, photos/, now.md when photo years exist', () => {
    const tree = buildTree({ posts, projects, photoYears: ['2026', '2025'] })
    expect(tree.map((n) => n.label)).toEqual([
      'README.md',
      'writing/',
      'projects/',
      'photos/',
      'now.md',
    ])
  })

  it('omits the photos/ row entirely when there are no photo years', () => {
    const tree = buildTree({ posts, projects, photoYears: [] })
    expect(tree.map((n) => n.label)).toEqual([
      'README.md',
      'writing/',
      'projects/',
      'now.md',
    ])
  })

  it('omits the photos/ row when photoYears is not passed at all', () => {
    const tree = buildTree({ posts, projects })
    expect(tree.map((n) => n.label)).toEqual([
      'README.md',
      'writing/',
      'projects/',
      'now.md',
    ])
  })

  it('gives README.md a file node hrefed at the site root', () => {
    const tree = buildTree({ posts, projects })
    const readme = tree[0]
    expect(readme).toMatchObject({ label: 'README.md', type: 'file', href: '/' })
  })

  it('gives now.md a file node hrefed at /now/', () => {
    const tree = buildTree({ posts, projects })
    const now = tree.at(-1)
    expect(now).toMatchObject({ label: 'now.md', type: 'file', href: '/now/' })
  })

  it('lists posts as <slug>.md files hrefed /writing/<slug>/, preserving input order', () => {
    const tree = buildTree({ posts, projects })
    const writing = tree.find((n) => n.label === 'writing/')
    expect(writing?.type).toBe('dir')
    expect(writing?.children).toEqual([
      { label: 'newest-post.md', type: 'file', href: '/writing/newest-post/' },
      { label: 'older-post.md', type: 'file', href: '/writing/older-post/' },
    ])
  })

  it('renders a project with a slug as a file node linking to its writeup', () => {
    const tree = buildTree({ posts, projects })
    const projectsNode = tree.find((n) => n.label === 'projects/')
    expect(projectsNode?.type).toBe('dir')
    expect(projectsNode?.children?.[0]).toEqual({
      label: 'has-writeup.md',
      type: 'file',
      href: '/projects/has-writeup/',
    })
  })

  it('renders an href-only project as an external node labeled with its plain name', () => {
    const tree = buildTree({ posts, projects })
    const projectsNode = tree.find((n) => n.label === 'projects/')
    expect(projectsNode?.children?.[1]).toEqual({
      label: 'external only',
      type: 'external',
      href: 'https://example.com/external-only',
    })
  })

  it('renders photo years (newest first, order preserved) as a photos/ dir of <year>/ rows', () => {
    const tree = buildTree({ posts, projects, photoYears: ['2026', '2025'] })
    const photos = tree.find((n) => n.label === 'photos/')
    expect(photos?.type).toBe('dir')
    expect(photos?.children).toEqual([
      { label: '2026/', type: 'dir', href: '/photos/2026/' },
      { label: '2025/', type: 'dir', href: '/photos/2025/' },
    ])
  })

  it('produces JSON-plain nodes (no functions, no Dates) so they can cross the RSC boundary', () => {
    const tree = buildTree({ posts, projects, photoYears: ['2026'] })
    expect(() => JSON.parse(JSON.stringify(tree))).not.toThrow()
    expect(JSON.parse(JSON.stringify(tree))).toEqual(tree)
  })
})

describe('breadcrumbFromPath', () => {
  it('maps the root to README.md', () => {
    expect(breadcrumbFromPath('/')).toBe('README.md')
  })

  it('maps a writing path to writing/<slug>.md', () => {
    expect(breadcrumbFromPath('/writing/a-quieter-frhd-me/')).toBe(
      'writing/a-quieter-frhd-me.md',
    )
  })

  it('maps a projects path to projects/<slug>.md', () => {
    expect(breadcrumbFromPath('/projects/isascrawler/')).toBe(
      'projects/isascrawler.md',
    )
  })

  it('maps /now/ to now.md', () => {
    expect(breadcrumbFromPath('/now/')).toBe('now.md')
  })

  it('maps a photo year path to photos/<year>/', () => {
    expect(breadcrumbFromPath('/photos/2026/')).toBe('photos/2026/')
  })

  it('maps a photo detail path to photos/<year>/<slug> with no trailing slash', () => {
    expect(breadcrumbFromPath('/photos/2026/some-photo/')).toBe(
      'photos/2026/some-photo',
    )
  })

  it('is trailing-slash tolerant on every known route', () => {
    expect(breadcrumbFromPath('/writing/a-quieter-frhd-me')).toBe(
      'writing/a-quieter-frhd-me.md',
    )
    expect(breadcrumbFromPath('/projects/isascrawler')).toBe(
      'projects/isascrawler.md',
    )
    expect(breadcrumbFromPath('/now')).toBe('now.md')
    expect(breadcrumbFromPath('/photos/2026')).toBe('photos/2026/')
    expect(breadcrumbFromPath('/photos/2026/some-photo')).toBe(
      'photos/2026/some-photo',
    )
  })

  it('falls back to the path sans leading slash for unknown routes', () => {
    expect(breadcrumbFromPath('/terminal/')).toBe('terminal/')
    expect(breadcrumbFromPath('/some/deep/unknown/path/')).toBe(
      'some/deep/unknown/path/',
    )
  })
})
