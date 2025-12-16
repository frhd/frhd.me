import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  isSoundEnabled,
  setSoundEnabled,
  isMusicEnabled,
  setMusicEnabled,
  getMusicVolume,
  setMusicVolume,
  isMusicPlaying,
  markUserInteraction,
  hasUserInteracted,
} from '../sound-manager'

describe('sound-manager', () => {
  // Mock localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {}
    return {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key]
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

  describe('isSoundEnabled', () => {
    it('returns true when sound not explicitly disabled', () => {
      expect(isSoundEnabled()).toBe(true)
    })

    it('returns false when sound explicitly disabled', () => {
      localStorageMock.setItem('frhd-terminal-sound', 'false')
      expect(isSoundEnabled()).toBe(false)
    })

    it('returns true when sound explicitly enabled', () => {
      localStorageMock.setItem('frhd-terminal-sound', 'true')
      expect(isSoundEnabled()).toBe(true)
    })
  })

  describe('setSoundEnabled', () => {
    it('stores sound enabled state as true', () => {
      setSoundEnabled(true)
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'frhd-terminal-sound',
        'true'
      )
    })

    it('stores sound enabled state as false', () => {
      setSoundEnabled(false)
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'frhd-terminal-sound',
        'false'
      )
    })
  })

  describe('isMusicEnabled', () => {
    it('returns false when music not explicitly enabled', () => {
      expect(isMusicEnabled()).toBe(false)
    })

    it('returns true when music explicitly enabled', () => {
      localStorageMock.setItem('frhd-terminal-music', 'true')
      expect(isMusicEnabled()).toBe(true)
    })
  })

  describe('setMusicEnabled', () => {
    it('stores music enabled state as true', () => {
      setMusicEnabled(true)
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'frhd-terminal-music',
        'true'
      )
    })

    it('stores music enabled state as false', () => {
      setMusicEnabled(false)
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'frhd-terminal-music',
        'false'
      )
    })
  })

  describe('getMusicVolume', () => {
    it('returns default volume of 30 when not set', () => {
      expect(getMusicVolume()).toBe(30)
    })

    it('returns stored volume', () => {
      localStorageMock.setItem('frhd-terminal-music-volume', '75')
      expect(getMusicVolume()).toBe(75)
    })
  })

  describe('setMusicVolume', () => {
    it('stores volume in localStorage', () => {
      setMusicVolume(50)
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'frhd-terminal-music-volume',
        '50'
      )
    })

    it('clamps volume to 0 minimum', () => {
      setMusicVolume(-10)
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'frhd-terminal-music-volume',
        '0'
      )
    })

    it('clamps volume to 100 maximum', () => {
      setMusicVolume(150)
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'frhd-terminal-music-volume',
        '100'
      )
    })
  })

  describe('isMusicPlaying', () => {
    it('returns false when no music is playing', () => {
      expect(isMusicPlaying()).toBe(false)
    })
  })

  describe('user interaction tracking', () => {
    it('tracks user interaction state', () => {
      markUserInteraction()
      expect(hasUserInteracted()).toBe(true)
    })
  })
})
