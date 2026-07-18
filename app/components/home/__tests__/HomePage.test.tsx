import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { PostMeta } from '@/lib/posts'
import type { Project } from '@/lib/projects'

import HomePage from '../HomePage'

const posts: PostMeta[] = [
  { slug: 'first-post', title: 'first post', date: '2026-07-18', summary: 's' },
  { slug: 'second-post', title: 'second post', date: '2026-06-01' },
]

const projects: Project[] = [
  { name: 'ext-proj', oneLiner: 'external one', href: 'https://example.com/x' },
  {
    name: 'writeup-proj',
    oneLiner: 'internal one',
    href: 'https://example.com/y',
    slug: 'writeup',
  },
]

describe('HomePage', () => {
  it('renders the name as the top-level heading', () => {
    render(<HomePage posts={posts} projects={projects} />)
    expect(
      screen.getByRole('heading', { level: 1, name: /farhad omid/i }),
    ).toBeInTheDocument()
  })

  it('renders the two-line intro', () => {
    render(<HomePage posts={posts} projects={projects} />)
    expect(
      screen.getByText(/i build tools, toys, and long-running experiments/i),
    ).toBeInTheDocument()
    expect(screen.getByText(/this page is plain on purpose/i)).toBeInTheDocument()
  })

  it('renders the four sections as level-2 headings in order', () => {
    render(<HomePage posts={posts} projects={projects} />)
    const headings = screen
      .getAllByRole('heading', { level: 2 })
      .map((h) => h.textContent)
    expect(headings).toEqual(['## work', '## writing', '## now', '## elsewhere'])
  })

  it('links external projects to their href and slug projects to /projects/<slug>/', () => {
    render(<HomePage posts={posts} projects={projects} />)
    expect(screen.getByRole('link', { name: 'ext-proj' })).toHaveAttribute(
      'href',
      'https://example.com/x',
    )
    expect(screen.getByRole('link', { name: 'writeup-proj' })).toHaveAttribute(
      'href',
      '/projects/writeup/',
    )
  })

  it('shows each project one-liner', () => {
    render(<HomePage posts={posts} projects={projects} />)
    expect(screen.getByText('external one')).toBeInTheDocument()
    expect(screen.getByText('internal one')).toBeInTheDocument()
  })

  it('links posts to /writing/<slug>/ and shows their dates', () => {
    render(<HomePage posts={posts} projects={projects} />)
    expect(screen.getByRole('link', { name: 'first post' })).toHaveAttribute(
      'href',
      '/writing/first-post/',
    )
    expect(screen.getByRole('link', { name: 'second post' })).toHaveAttribute(
      'href',
      '/writing/second-post/',
    )
    expect(screen.getByText('2026-07-18')).toBeInTheDocument()
    expect(screen.getByText('2026-06-01')).toBeInTheDocument()
  })

  it('renders the now section text', () => {
    render(<HomePage posts={posts} projects={projects} />)
    expect(
      screen.getByText(/making this line update itself/i),
    ).toBeInTheDocument()
  })

  it('renders the elsewhere links: github, email, and rss', () => {
    render(<HomePage posts={posts} projects={projects} />)
    expect(
      screen.getByRole('link', { name: /github\.com\/frhd/i }),
    ).toHaveAttribute('href', 'https://github.com/frhd')
    expect(
      screen.getByRole('link', { name: /farhad@omid\.cc/i }),
    ).toHaveAttribute('href', 'mailto:farhad@omid.cc')
    expect(screen.getByRole('link', { name: /rss/i })).toHaveAttribute(
      'href',
      '/rss.xml',
    )
  })

  it('renders the faint "press t" footer hint', () => {
    render(<HomePage posts={posts} projects={projects} />)
    expect(screen.getByText(/press t/i)).toBeInTheDocument()
  })
})
