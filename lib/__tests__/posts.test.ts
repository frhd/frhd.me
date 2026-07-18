import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { getAllPosts, getPost, parsePost } from '../posts'

/**
 * Fixture posts are written to a temp directory so that listing/order/slug
 * behaviour can be exercised against the real filesystem without depending on
 * the site's actual content.
 */
let fixtureDir: string

const fixtures: Record<string, string> = {
  'middle.mdx': `---
title: middle post
date: "2026-03-15"
summary: the one in the middle
---
middle body
`,
  'newest.mdx': `---
title: newest post
date: "2026-07-01"
---
newest body
`,
  'oldest.mdx': `---
title: oldest post
date: "2025-01-01"
summary: the first thing i wrote
---
oldest body
`,
}

beforeAll(() => {
  fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), 'posts-fixtures-'))
  for (const [name, contents] of Object.entries(fixtures)) {
    fs.writeFileSync(path.join(fixtureDir, name), contents)
  }
})

afterAll(() => {
  fs.rmSync(fixtureDir, { recursive: true, force: true })
})

describe('getAllPosts', () => {
  it('lists posts newest-first (reverse-chronological)', () => {
    const posts = getAllPosts(fixtureDir)
    expect(posts.map((p) => p.slug)).toEqual(['newest', 'middle', 'oldest'])
  })

  it('derives the slug from the filename', () => {
    const posts = getAllPosts(fixtureDir)
    expect(posts.map((p) => p.slug)).toContain('middle')
    // slug never carries the .mdx extension
    expect(posts.every((p) => !p.slug.includes('.'))).toBe(true)
  })

  it('includes the summary when present', () => {
    const posts = getAllPosts(fixtureDir)
    const middle = posts.find((p) => p.slug === 'middle')
    expect(middle?.summary).toBe('the one in the middle')
  })

  it('omits the summary when absent', () => {
    const posts = getAllPosts(fixtureDir)
    const newest = posts.find((p) => p.slug === 'newest')
    expect(newest?.summary).toBeUndefined()
  })

  it('returns metadata only (no body) for the listing', () => {
    const posts = getAllPosts(fixtureDir)
    expect(posts[0]).not.toHaveProperty('content')
  })
})

describe('getPost', () => {
  it('loads a single post with its frontmatter and body', () => {
    const post = getPost('middle', fixtureDir)
    expect(post.title).toBe('middle post')
    expect(post.date).toBe('2026-03-15')
    expect(post.summary).toBe('the one in the middle')
    expect(post.content.trim()).toBe('middle body')
  })

  it('throws for an unknown slug', () => {
    expect(() => getPost('does-not-exist', fixtureDir)).toThrow()
  })
})

describe('parsePost validation', () => {
  const body = '\nsome body\n'

  it('keeps a well-formed date as a string', () => {
    const post = parsePost('ok', `---\ntitle: fine\ndate: 2026-07-18\n---${body}`)
    expect(post.date).toBe('2026-07-18')
  })

  it('rejects a missing title', () => {
    expect(() => parsePost('bad', `---\ndate: "2026-07-18"\n---${body}`)).toThrow(
      /title/i,
    )
  })

  it('rejects an empty title', () => {
    expect(() =>
      parsePost('bad', `---\ntitle: "   "\ndate: "2026-07-18"\n---${body}`),
    ).toThrow(/title/i)
  })

  it('rejects a missing date', () => {
    expect(() => parsePost('bad', `---\ntitle: no date\n---${body}`)).toThrow(
      /date/i,
    )
  })

  it('rejects a date that is not YYYY-MM-DD', () => {
    expect(() =>
      parsePost('bad', `---\ntitle: t\ndate: "2026-7-8"\n---${body}`),
    ).toThrow(/date/i)
    expect(() =>
      parsePost('bad', `---\ntitle: t\ndate: "July 8, 2026"\n---${body}`),
    ).toThrow(/date/i)
  })

  it('rejects a well-formatted but non-existent calendar date', () => {
    expect(() =>
      parsePost('bad', `---\ntitle: t\ndate: "2026-02-30"\n---${body}`),
    ).toThrow(/date/i)
    expect(() =>
      parsePost('bad', `---\ntitle: t\ndate: "2026-13-01"\n---${body}`),
    ).toThrow(/date/i)
  })

  it('rejects a non-string summary', () => {
    expect(() =>
      parsePost('bad', `---\ntitle: t\ndate: "2026-07-18"\nsummary: 42\n---${body}`),
    ).toThrow(/summary/i)
  })
})

describe('real content', () => {
  it('loads the seed post cleanly', () => {
    const posts = getAllPosts()
    const seed = posts.find((p) => p.slug === 'a-quieter-frhd-me')
    expect(seed).toBeDefined()
    expect(seed?.title).toBe('a quieter frhd.me')
    expect(seed?.date).toBe('2026-07-18')
  })

  it('every real post has valid frontmatter (build gate)', () => {
    // getAllPosts throws on any malformed frontmatter; this asserts it doesn't.
    expect(() => getAllPosts()).not.toThrow()
  })
})
