import { describe, expect, it } from 'vitest'

import { isTheme, resolveTheme } from '../theme'

describe('resolveTheme', () => {
  it('honors a stored light choice over the system preference', () => {
    expect(resolveTheme('light', true)).toBe('light')
  })

  it('honors a stored dark choice over the system preference', () => {
    expect(resolveTheme('dark', false)).toBe('dark')
  })

  it('falls back to the system preference (dark) when nothing is stored', () => {
    expect(resolveTheme(null, true)).toBe('dark')
  })

  it('falls back to the system preference (light) when nothing is stored', () => {
    expect(resolveTheme(null, false)).toBe('light')
  })

  it('ignores an invalid stored value and uses the system preference', () => {
    expect(resolveTheme('chartreuse', true)).toBe('dark')
  })
})

describe('isTheme', () => {
  it('accepts only the two valid themes', () => {
    expect(isTheme('light')).toBe(true)
    expect(isTheme('dark')).toBe(true)
    expect(isTheme('')).toBe(false)
    expect(isTheme(null)).toBe(false)
    expect(isTheme('DARK')).toBe(false)
  })
})
