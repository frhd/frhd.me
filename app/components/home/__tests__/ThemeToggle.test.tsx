import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { THEME_STORAGE_KEY } from '@/lib/theme'

import ThemeToggle from '../ThemeToggle'

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  afterEach(() => {
    cleanup()
  })

  it('reflects the theme already stamped on <html>', () => {
    document.documentElement.setAttribute('data-theme', 'dark')
    render(<ThemeToggle />)
    // In dark mode the button offers the light theme.
    expect(screen.getByRole('button')).toHaveTextContent('light')
  })

  it('toggles data-theme on <html> and persists the choice', () => {
    document.documentElement.setAttribute('data-theme', 'light')
    render(<ThemeToggle />)

    fireEvent.click(screen.getByRole('button'))
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')

    fireEvent.click(screen.getByRole('button'))
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
  })

  it('exposes an accessible label describing the target theme', () => {
    document.documentElement.setAttribute('data-theme', 'light')
    render(<ThemeToggle />)
    expect(
      screen.getByRole('button', { name: /switch to dark theme/i }),
    ).toBeInTheDocument()
  })
})
