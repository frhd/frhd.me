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

  it('renders the header nav anchor links to the in-page sections', () => {
    render(<HomePage posts={posts} projects={projects} />)
    expect(screen.getByRole('link', { name: 'Work' })).toHaveAttribute(
      'href',
      '#work',
    )
    expect(screen.getByRole('link', { name: 'Writing' })).toHaveAttribute(
      'href',
      '#writing',
    )
    expect(screen.getByRole('link', { name: 'Now' })).toHaveAttribute(
      'href',
      '#now',
    )
  })

  it('renders the serif intro paragraph', () => {
    render(<HomePage posts={posts} projects={projects} />)
    expect(
      screen.getByText(/i build tools, toys, and long-running experiments/i),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/teaching this website to stop pretending/i),
    ).toBeInTheDocument()
  })

  it('renders the four sections as level-2 headings in order (no "##" prefix)', () => {
    render(<HomePage posts={posts} projects={projects} />)
    const headings = screen
      .getAllByRole('heading', { level: 2 })
      .map((h) => h.textContent)
    expect(headings).toEqual(['Work', 'Writing', 'Now', 'Elsewhere'])
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

  it('shows each project one-liner as a blurb', () => {
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

  it('shows a post summary as a blurb when present', () => {
    render(<HomePage posts={posts} projects={projects} />)
    // Only the first post has a summary; the second must not render a blurb.
    expect(screen.getByText('s')).toBeInTheDocument()
  })

  it('renders the now section text and links the /terminal path', () => {
    render(<HomePage posts={posts} projects={projects} />)
    expect(
      screen.getByText(/redesigning this site for reading/i),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '/terminal' })).toHaveAttribute(
      'href',
      '/terminal',
    )
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
