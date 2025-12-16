import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  getTimeOfDay,
  getTimeGreeting,
  getCurrentHoliday,
  getSeasonalMessage,
  getSessionUptime,
  getLastVisitString,
  getReturnGreeting,
  initSession,
  getVisitData,
} from '../time-utils'

describe('time-utils', () => {
  beforeEach(() => {
    // Clear localStorage and sessionStorage before each test
    localStorage.clear()
    sessionStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('getTimeOfDay', () => {
    it('returns morning for 6am', () => {
      vi.setSystemTime(new Date('2024-12-16T06:00:00'))
      expect(getTimeOfDay()).toBe('morning')
    })

    it('returns morning for 11am', () => {
      vi.setSystemTime(new Date('2024-12-16T11:00:00'))
      expect(getTimeOfDay()).toBe('morning')
    })

    it('returns afternoon for 12pm', () => {
      vi.setSystemTime(new Date('2024-12-16T12:00:00'))
      expect(getTimeOfDay()).toBe('afternoon')
    })

    it('returns afternoon for 5pm', () => {
      vi.setSystemTime(new Date('2024-12-16T17:00:00'))
      expect(getTimeOfDay()).toBe('afternoon')
    })

    it('returns evening for 6pm', () => {
      vi.setSystemTime(new Date('2024-12-16T18:00:00'))
      expect(getTimeOfDay()).toBe('evening')
    })

    it('returns evening for 9pm', () => {
      vi.setSystemTime(new Date('2024-12-16T21:00:00'))
      expect(getTimeOfDay()).toBe('evening')
    })

    it('returns night for 10pm', () => {
      vi.setSystemTime(new Date('2024-12-16T22:00:00'))
      expect(getTimeOfDay()).toBe('night')
    })

    it('returns night for 3am', () => {
      vi.setSystemTime(new Date('2024-12-16T03:00:00'))
      expect(getTimeOfDay()).toBe('night')
    })
  })

  describe('getTimeGreeting', () => {
    it('returns morning greeting for morning', () => {
      vi.setSystemTime(new Date('2024-12-16T08:00:00'))
      expect(getTimeGreeting()).toContain('morning')
    })

    it('returns afternoon greeting for afternoon', () => {
      vi.setSystemTime(new Date('2024-12-16T14:00:00'))
      expect(getTimeGreeting()).toContain('afternoon')
    })

    it('returns evening greeting for evening', () => {
      vi.setSystemTime(new Date('2024-12-16T20:00:00'))
      expect(getTimeGreeting()).toContain('evening')
    })

    it('returns night greeting for night', () => {
      vi.setSystemTime(new Date('2024-12-16T02:00:00'))
      expect(getTimeGreeting()).toContain('midnight')
    })
  })

  describe('getCurrentHoliday', () => {
    it('returns halloween on October 31', () => {
      vi.setSystemTime(new Date('2024-10-31T12:00:00'))
      expect(getCurrentHoliday()).toBe('halloween')
    })

    it('returns winter in December', () => {
      vi.setSystemTime(new Date('2024-12-15T12:00:00'))
      expect(getCurrentHoliday()).toBe('winter')
    })

    it('returns newYear on January 1', () => {
      vi.setSystemTime(new Date('2025-01-01T12:00:00'))
      expect(getCurrentHoliday()).toBe('newYear')
    })

    it('returns aprilFools on April 1', () => {
      vi.setSystemTime(new Date('2024-04-01T12:00:00'))
      expect(getCurrentHoliday()).toBe('aprilFools')
    })

    it('returns null on regular days', () => {
      vi.setSystemTime(new Date('2024-07-15T12:00:00'))
      expect(getCurrentHoliday()).toBe(null)
    })
  })

  describe('getSeasonalMessage', () => {
    it('returns halloween message on Halloween', () => {
      vi.setSystemTime(new Date('2024-10-31T12:00:00'))
      const message = getSeasonalMessage()
      expect(message).toContain('Halloween')
    })

    it('returns winter message in December', () => {
      vi.setSystemTime(new Date('2024-12-25T12:00:00'))
      const message = getSeasonalMessage()
      expect(message).toContain('Holiday')
    })

    it('returns new year message on January 1', () => {
      vi.setSystemTime(new Date('2025-01-01T12:00:00'))
      const message = getSeasonalMessage()
      expect(message).toContain('New Year')
    })

    it('returns april fools message on April 1', () => {
      vi.setSystemTime(new Date('2024-04-01T12:00:00'))
      const message = getSeasonalMessage()
      expect(message).toContain('April Fools')
    })

    it('returns null on regular days', () => {
      vi.setSystemTime(new Date('2024-07-15T12:00:00'))
      expect(getSeasonalMessage()).toBe(null)
    })
  })

  describe('session tracking', () => {
    it('initSession sets session start time', () => {
      const now = new Date('2024-12-16T10:00:00')
      vi.setSystemTime(now)
      initSession()

      const storedTime = sessionStorage.getItem('frhd-terminal-session-start')
      expect(storedTime).toBe(now.getTime().toString())
    })

    it('getSessionUptime returns correct duration', () => {
      const start = new Date('2024-12-16T10:00:00')
      vi.setSystemTime(start)
      initSession()

      // Advance time by 5 minutes
      vi.setSystemTime(new Date('2024-12-16T10:05:00'))

      const uptime = getSessionUptime()
      expect(uptime).toContain('5 minute')
    })

    it('getSessionUptime handles hours', () => {
      const start = new Date('2024-12-16T10:00:00')
      vi.setSystemTime(start)
      initSession()

      // Advance time by 2 hours 30 minutes
      vi.setSystemTime(new Date('2024-12-16T12:30:00'))

      const uptime = getSessionUptime()
      expect(uptime).toContain('2 hour')
      expect(uptime).toContain('30 minute')
    })
  })

  describe('visit tracking', () => {
    it('initSession increments visit count', () => {
      vi.setSystemTime(new Date('2024-12-16T10:00:00'))
      initSession()

      const data = getVisitData()
      expect(data.visitCount).toBe(1)
    })

    it('multiple sessions increment visit count', () => {
      vi.setSystemTime(new Date('2024-12-16T10:00:00'))
      initSession()

      // Simulate new session
      sessionStorage.clear()
      vi.setSystemTime(new Date('2024-12-16T12:00:00'))
      initSession()

      const data = getVisitData()
      expect(data.visitCount).toBe(2)
    })

    it('getLastVisitString returns correct time ago', () => {
      const firstVisit = new Date('2024-12-16T10:00:00')
      vi.setSystemTime(firstVisit)
      initSession()

      // Simulate new session 2 hours later
      sessionStorage.clear()
      vi.setSystemTime(new Date('2024-12-16T12:00:00'))
      initSession()

      const lastVisit = getLastVisitString()
      expect(lastVisit).toContain('2 hour')
    })

    it('getLastVisitString returns null on first visit', () => {
      vi.setSystemTime(new Date('2024-12-16T10:00:00'))
      initSession()

      expect(getLastVisitString()).toBe(null)
    })

    it('getReturnGreeting returns welcome back message', () => {
      const firstVisit = new Date('2024-12-16T10:00:00')
      vi.setSystemTime(firstVisit)
      initSession()

      // Simulate new session
      sessionStorage.clear()
      vi.setSystemTime(new Date('2024-12-17T10:00:00'))
      initSession()

      const greeting = getReturnGreeting()
      expect(greeting).toContain('Welcome back')
      expect(greeting).toContain('day')
    })

    it('getReturnGreeting returns null on first visit', () => {
      vi.setSystemTime(new Date('2024-12-16T10:00:00'))
      initSession()

      expect(getReturnGreeting()).toBe(null)
    })
  })
})
