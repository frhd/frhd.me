import { describe, expect, it } from 'vitest'

import { projects } from '../projects'

describe('projects', () => {
  it('exports a non-empty list', () => {
    expect(projects.length).toBeGreaterThan(0)
  })

  it('gives every project a name, a one-liner, and a link (href or slug)', () => {
    for (const project of projects) {
      expect(project.name).toBeTruthy()
      expect(project.oneLiner).toBeTruthy()
      if (project.href !== undefined) {
        expect(project.href).toMatch(/^https?:\/\//)
      } else {
        expect(project.slug).toBeDefined() // internal-only entries must be linkable
      }
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

describe('isascrawler entry', () => {
  const entry = projects.find((p) => p.slug === 'isascrawler')

  it('exists with a name and one-liner', () => {
    expect(entry).toBeDefined()
    expect(entry!.name).toBe('ISAScrawler')
    expect(entry!.oneLiner.length).toBeGreaterThan(0)
  })

  it('is internal-only: slug set, no external href', () => {
    expect(entry!.href).toBeUndefined()
  })
})
