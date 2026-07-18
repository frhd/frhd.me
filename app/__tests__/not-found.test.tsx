import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import NotFound, { metadata } from '../not-found'

describe('NotFound', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders the editor-flavored 404 line', () => {
    render(<NotFound />)
    expect(
      screen.getByRole('heading', { name: 'no such file' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/E404: this path doesn't resolve/i),
    ).toBeInTheDocument()
  })

  it('links back home', () => {
    render(<NotFound />)
    const link = screen.getByRole('link', { name: /frhd\.me/i })
    expect(link).toHaveAttribute('href', '/')
  })

  it('has a 404 page title', () => {
    expect(metadata.title).toBe('404 — frhd.me')
  })
})
