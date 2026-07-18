import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { TreeNode } from '@/lib/tree'

import Sidebar from '../Sidebar'

// usePathname drives the active-file highlight; mock it so each test can pin
// the "current" route. ThemeToggle (rendered in the sidebar foot) does not use
// next/navigation, so this mock is enough.
let mockPathname = '/'
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}))

const tree: TreeNode[] = [
  { label: 'README.md', type: 'file', href: '/' },
  {
    label: 'writing/',
    type: 'dir',
    children: [
      { label: 'newest-post.md', type: 'file', href: '/writing/newest-post/' },
    ],
  },
  {
    label: 'projects/',
    type: 'dir',
    children: [
      { label: 'has-writeup.md', type: 'file', href: '/projects/has-writeup/' },
      {
        label: 'external only',
        type: 'external',
        href: 'https://example.com/external-only',
      },
    ],
  },
  { label: 'now.md', type: 'file', href: '/now/' },
]

describe('Sidebar', () => {
  beforeEach(() => {
    mockPathname = '/'
    document.documentElement.removeAttribute('data-theme')
  })

  afterEach(() => {
    cleanup()
  })

  it('renders the root label and every tree node', () => {
    render(<Sidebar tree={tree} />)

    // The root label appears in both the sidebar header and the mobile topbar.
    expect(screen.getAllByText('~/frhd.me').length).toBeGreaterThanOrEqual(1)

    expect(screen.getByRole('link', { name: 'README.md' })).toBeInTheDocument()
    expect(screen.getByText('writing/')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'newest-post.md' }),
    ).toBeInTheDocument()
    expect(screen.getByText('projects/')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'has-writeup.md' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /external only/ }),
    ).toHaveAttribute('href', 'https://example.com/external-only')
    expect(screen.getByRole('link', { name: 'now.md' })).toBeInTheDocument()
  })

  it('marks README active at the root path', () => {
    mockPathname = '/'
    render(<Sidebar tree={tree} />)
    expect(screen.getByRole('link', { name: 'README.md' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', { name: 'now.md' })).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('marks the active file with aria-current="page"', () => {
    mockPathname = '/now/'
    render(<Sidebar tree={tree} />)
    expect(screen.getByRole('link', { name: 'now.md' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', { name: 'README.md' })).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('matches the active file even when usePathname drops the trailing slash', () => {
    // href carries a trailing slash; the live path may not — they must still match.
    mockPathname = '/writing/newest-post'
    render(<Sidebar tree={tree} />)
    expect(
      screen.getByRole('link', { name: 'newest-post.md' }),
    ).toHaveAttribute('aria-current', 'page')
  })
})
