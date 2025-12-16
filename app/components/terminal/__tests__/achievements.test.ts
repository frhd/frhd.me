import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  isAchievementUnlocked,
  getUnlockedAchievements,
  unlockAchievement,
  getAchievementStats,
  trackCommand,
  getUsedCommands,
  resetAchievements,
  checkTimeAchievements,
  ACHIEVEMENTS,
  formatAchievement,
  type AchievementId,
} from '../achievements'

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    get store() {
      return store
    },
  }
})()

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

// Mock window events
const mockDispatchEvent = vi.fn()
Object.defineProperty(window, 'dispatchEvent', { value: mockDispatchEvent })

describe('achievements', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
    mockDispatchEvent.mockClear()
    resetAchievements()
  })

  afterEach(() => {
    resetAchievements()
  })

  describe('ACHIEVEMENTS constant', () => {
    it('should have all 15 achievement definitions', () => {
      const achievementIds = Object.keys(ACHIEVEMENTS)
      expect(achievementIds.length).toBe(15)
    })

    it('should have required properties for each achievement', () => {
      for (const [id, achievement] of Object.entries(ACHIEVEMENTS)) {
        expect(achievement.id).toBe(id)
        expect(achievement.name).toBeTruthy()
        expect(achievement.description).toBeTruthy()
        expect(achievement.icon).toBeTruthy()
      }
    })

    it('should have expected achievement IDs', () => {
      const expectedIds = [
        'first_command',
        'matrix_fan',
        'secret_finder',
        'rabbit_hole',
        'game_on',
        'high_scorer',
        'night_owl',
        'early_bird',
        'completionist',
        'speed_demon',
        'fork_bomber',
        'sudo_user',
        'destroyer',
        'theme_switcher',
        'moo',
      ]
      for (const id of expectedIds) {
        expect(ACHIEVEMENTS[id as AchievementId]).toBeDefined()
      }
    })
  })

  describe('isAchievementUnlocked', () => {
    it('should return false for locked achievements', () => {
      expect(isAchievementUnlocked('first_command')).toBe(false)
    })

    it('should return true for unlocked achievements', () => {
      unlockAchievement('first_command')
      expect(isAchievementUnlocked('first_command')).toBe(true)
    })
  })

  describe('unlockAchievement', () => {
    it('should unlock an achievement and return true', () => {
      const result = unlockAchievement('matrix_fan')
      expect(result).toBe(true)
      expect(isAchievementUnlocked('matrix_fan')).toBe(true)
    })

    it('should return false if achievement is already unlocked', () => {
      unlockAchievement('matrix_fan')
      const result = unlockAchievement('matrix_fan')
      expect(result).toBe(false)
    })

    it('should dispatch achievement-unlocked event', () => {
      unlockAchievement('secret_finder')
      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'achievement-unlocked',
          detail: { achievement: ACHIEVEMENTS['secret_finder'] },
        })
      )
    })

    it('should persist to localStorage', () => {
      unlockAchievement('rabbit_hole')
      expect(mockLocalStorage.setItem).toHaveBeenCalled()
      const stored = JSON.parse(
        mockLocalStorage.store['frhd-terminal-achievements']
      )
      expect(stored).toHaveProperty('rabbit_hole')
    })
  })

  describe('getUnlockedAchievements', () => {
    it('should return empty array when no achievements unlocked', () => {
      const unlocked = getUnlockedAchievements()
      expect(unlocked).toEqual([])
    })

    it('should return array of unlocked achievement IDs', () => {
      unlockAchievement('game_on')
      unlockAchievement('high_scorer')
      const unlocked = getUnlockedAchievements()
      expect(unlocked).toContain('game_on')
      expect(unlocked).toContain('high_scorer')
      expect(unlocked.length).toBe(2)
    })
  })

  describe('getAchievementStats', () => {
    it('should return correct stats when no achievements unlocked', () => {
      const stats = getAchievementStats()
      expect(stats.unlocked).toBe(0)
      expect(stats.total).toBe(15)
      expect(stats.percentage).toBe(0)
    })

    it('should return correct stats after unlocking achievements', () => {
      unlockAchievement('first_command')
      unlockAchievement('moo')
      unlockAchievement('theme_switcher')
      const stats = getAchievementStats()
      expect(stats.unlocked).toBe(3)
      expect(stats.total).toBe(15)
      expect(stats.percentage).toBe(20)
    })
  })

  describe('trackCommand', () => {
    it('should track valid commands', () => {
      trackCommand('help')
      trackCommand('ls')
      const used = getUsedCommands()
      expect(used).toContain('help')
      expect(used).toContain('ls')
    })

    it('should not track invalid commands', () => {
      trackCommand('unknowncommand')
      const used = getUsedCommands()
      expect(used).not.toContain('unknowncommand')
    })

    it('should track only the first word of command', () => {
      trackCommand('cat file.txt')
      const used = getUsedCommands()
      expect(used).toContain('cat')
      expect(used).not.toContain('file.txt')
    })

    it('should not duplicate commands', () => {
      trackCommand('help')
      trackCommand('help')
      const used = getUsedCommands()
      expect(used.filter((cmd) => cmd === 'help').length).toBe(1)
    })
  })

  describe('resetAchievements', () => {
    it('should clear all achievements', () => {
      unlockAchievement('first_command')
      unlockAchievement('moo')
      trackCommand('help')

      resetAchievements()

      expect(getUnlockedAchievements()).toEqual([])
      expect(getUsedCommands()).toEqual([])
    })
  })

  describe('checkTimeAchievements', () => {
    it('should unlock night_owl between 2am and 5am', () => {
      const mockDate = new Date()
      mockDate.setHours(3, 0, 0, 0)
      vi.useFakeTimers()
      vi.setSystemTime(mockDate)

      checkTimeAchievements()

      expect(isAchievementUnlocked('night_owl')).toBe(true)
      expect(isAchievementUnlocked('early_bird')).toBe(false)

      vi.useRealTimers()
    })

    it('should unlock early_bird between 5am and 7am', () => {
      const mockDate = new Date()
      mockDate.setHours(6, 0, 0, 0)
      vi.useFakeTimers()
      vi.setSystemTime(mockDate)

      checkTimeAchievements()

      expect(isAchievementUnlocked('early_bird')).toBe(true)

      vi.useRealTimers()
    })

    it('should not unlock time achievements at noon', () => {
      const mockDate = new Date()
      mockDate.setHours(12, 0, 0, 0)
      vi.useFakeTimers()
      vi.setSystemTime(mockDate)

      checkTimeAchievements()

      expect(isAchievementUnlocked('night_owl')).toBe(false)
      expect(isAchievementUnlocked('early_bird')).toBe(false)

      vi.useRealTimers()
    })
  })

  describe('formatAchievement', () => {
    it('should format unlocked achievement correctly', () => {
      unlockAchievement('moo')
      const formatted = formatAchievement('moo')
      expect(formatted).toContain('✓')
      expect(formatted).toContain(ACHIEVEMENTS['moo'].icon)
      expect(formatted).toContain(ACHIEVEMENTS['moo'].name)
      expect(formatted).toContain(ACHIEVEMENTS['moo'].description)
    })

    it('should format locked achievement correctly', () => {
      const formatted = formatAchievement('first_command')
      expect(formatted).toContain('○')
      expect(formatted).toContain('🔒')
    })

    it('should hide secret achievements when locked', () => {
      const formatted = formatAchievement('night_owl')
      expect(formatted).toContain('??????')
      expect(formatted).toContain('Secret achievement')
    })

    it('should show secret achievements when showSecret is true', () => {
      const formatted = formatAchievement('night_owl', true)
      expect(formatted).toContain(ACHIEVEMENTS['night_owl'].name)
    })
  })
})
