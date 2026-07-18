import { beforeEach, describe, expect, it, vi } from 'vitest'

import { setPrefersDark } from '@/test/match-media-mock'

import { buildThemeScript, THEME_STORAGE_KEY } from '../theme'

/**
 * These tests eval the exact script string that app/layout.tsx injects into
 * <head>, so the shipped no-flash behavior itself is what is verified.
 */
function runThemeScript(): string | null {
  window.eval(buildThemeScript())
  return document.documentElement.getAttribute('data-theme')
}

describe('buildThemeScript', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  it('honors a stored light choice over a dark system preference', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'light')
    setPrefersDark(true)
    expect(runThemeScript()).toBe('light')
  })

  it('honors a stored dark choice over a light system preference', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark')
    setPrefersDark(false)
    expect(runThemeScript()).toBe('dark')
  })

  it('falls back to the system preference (dark) when nothing is stored', () => {
    setPrefersDark(true)
    expect(runThemeScript()).toBe('dark')
  })

  it('falls back to the system preference (light) when nothing is stored', () => {
    setPrefersDark(false)
    expect(runThemeScript()).toBe('light')
  })

  it('ignores an invalid stored value and uses the system preference', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'chartreuse')
    setPrefersDark(true)
    expect(runThemeScript()).toBe('dark')
  })

  it('swallows storage failures instead of throwing before first paint', () => {
    const getItem = vi
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation(() => {
        throw new Error('storage disabled')
      })
    try {
      expect(() => window.eval(buildThemeScript())).not.toThrow()
      // The CSS prefers-color-scheme fallback takes over in this case.
      expect(document.documentElement.getAttribute('data-theme')).toBeNull()
    } finally {
      getItem.mockRestore()
    }
  })
})
