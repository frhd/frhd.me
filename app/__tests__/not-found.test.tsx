import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import NotFound, { metadata } from '../not-found'

describe('NotFound', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders the quiet 404 line', () => {
    render(<NotFound />)
    expect(screen.getByRole('heading', { name: '404' })).toBeInTheDocument()
    expect(screen.getByText(/nothing here/i)).toBeInTheDocument()
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
