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

  it('has a string slug whenever one is present', () => {
    for (const project of projects) {
      if (project.slug !== undefined) {
        expect(typeof project.slug).toBe('string')
        expect(project.slug).toBeTruthy()
      }
    }
  })
})
