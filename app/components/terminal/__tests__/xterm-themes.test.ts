import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  themes,
  getStoredTheme,
  setStoredTheme,
  getTheme,
  getThemeNames,
  getDefaultTheme,
} from '../xterm-themes'

describe('xterm-themes', () => {
  // Mock localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {}
    return {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value
      }),
      clear: () => {
        store = {}
      },
    }
  })()

  beforeEach(() => {
    // Setup localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    })
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('themes', () => {
    it('has all required themes', () => {
      expect(themes).toHaveProperty('matrix')
      expect(themes).toHaveProperty('amber')
      expect(themes).toHaveProperty('cyberpunk')
      expect(themes).toHaveProperty('dracula')
      expect(themes).toHaveProperty('light')
    })

    it('each theme has required properties', () => {
      Object.values(themes).forEach((theme) => {
        expect(theme).toHaveProperty('name')
        expect(theme).toHaveProperty('displayName')
        expect(theme).toHaveProperty('description')
        expect(theme).toHaveProperty('colors')

        // Check required color properties
        expect(theme.colors).toHaveProperty('background')
        expect(theme.colors).toHaveProperty('foreground')
        expect(theme.colors).toHaveProperty('cursor')
        expect(theme.colors).toHaveProperty('black')
        expect(theme.colors).toHaveProperty('red')
        expect(theme.colors).toHaveProperty('green')
        expect(theme.colors).toHaveProperty('yellow')
        expect(theme.colors).toHaveProperty('blue')
        expect(theme.colors).toHaveProperty('magenta')
        expect(theme.colors).toHaveProperty('cyan')
        expect(theme.colors).toHaveProperty('white')
      })
    })

    it('matrix theme has green foreground', () => {
      expect(themes.matrix.colors.foreground).toBe('#00ff00')
    })

    it('amber theme has amber foreground', () => {
      expect(themes.amber.colors.foreground).toBe('#ffb000')
    })

    it('light theme has light background', () => {
      expect(themes.light.colors.background).toBe('#ffffff')
    })
  })

  describe('getStoredTheme', () => {
    it('returns matrix as default when no theme stored', () => {
      expect(getStoredTheme()).toBe('matrix')
    })

    it('returns stored theme name', () => {
      localStorageMock.setItem('frhd-terminal-theme', 'cyberpunk')
      expect(getStoredTheme()).toBe('cyberpunk')
    })
  })

  describe('setStoredTheme', () => {
    it('stores theme name in localStorage', () => {
      setStoredTheme('dracula')
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'frhd-terminal-theme',
        'dracula'
      )
    })
  })

  describe('getTheme', () => {
    it('returns theme by name', () => {
      const theme = getTheme('matrix')
      expect(theme).toBeDefined()
      expect(theme?.name).toBe('matrix')
    })

    it('returns undefined for unknown theme', () => {
      const theme = getTheme('nonexistent')
      expect(theme).toBeUndefined()
    })
  })

  describe('getThemeNames', () => {
    it('returns all theme names', () => {
      const names = getThemeNames()
      expect(names).toContain('matrix')
      expect(names).toContain('amber')
      expect(names).toContain('cyberpunk')
      expect(names).toContain('dracula')
      expect(names).toContain('light')
    })
  })

  describe('getDefaultTheme', () => {
    it('returns matrix theme', () => {
      const defaultTheme = getDefaultTheme()
      expect(defaultTheme.name).toBe('matrix')
    })
  })
})
