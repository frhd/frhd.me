import { describe, expect, it } from 'vitest'

import { projects } from '../projects'

describe('projects', () => {
  it('exports a non-empty list', () => {
    expect(projects.length).toBeGreaterThan(0)
  })

  it('gives every project a name, one-liner, and href', () => {
    for (const project of projects) {
      expect(project.name).toBeTruthy()
      expect(project.oneLiner).toBeTruthy()
      expect(project.href).toMatch(/^https?:\/\//)
    }
  })

  it('only carries a slug when a writeup page exists (none in v1)', () => {
    for (const project of projects) {
      if ('slug' in project && project.slug !== undefined) {
        expect(typeof project.slug).toBe('string')
      }
    }
    // v1 ships no project writeups
    expect(projects.every((p) => p.slug === undefined)).toBe(true)
  })
})
