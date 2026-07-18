import { describe, expect, it } from 'vitest'

import type { PostMeta } from '../posts'
import { buildRssXml } from '../rss'
import { SITE_ORIGIN } from '../site'

const posts: PostMeta[] = [
  {
    slug: 'newest',
    title: 'newest post',
    date: '2026-07-01',
    summary: 'the freshest thing',
  },
  {
    slug: 'oldest',
    title: 'oldest post',
    date: '2025-01-01',
  },
]

describe('buildRssXml', () => {
  it('emits a valid RSS 2.0 channel with the site fields', () => {
    const xml = buildRssXml(posts)
    expect(xml).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/)
    expect(xml).toContain('<rss version="2.0">')
    expect(xml).toContain('<channel>')
    expect(xml).toContain('<title>frhd.me</title>')
    expect(xml).toContain(`<link>${SITE_ORIGIN}/</link>`)
    expect(xml).toContain('<description>')
    expect(xml).toContain('</channel>')
    expect(xml).toContain('</rss>')
  })

  it('keeps items in the order supplied by getAllPosts (newest first)', () => {
    const xml = buildRssXml(posts)
    const newestAt = xml.indexOf('newest post')
    const oldestAt = xml.indexOf('oldest post')
    expect(newestAt).toBeGreaterThan(-1)
    expect(oldestAt).toBeGreaterThan(-1)
    expect(newestAt).toBeLessThan(oldestAt)
  })

  it('renders one item per post', () => {
    const xml = buildRssXml(posts)
    const itemCount = xml.match(/<item>/g)?.length ?? 0
    expect(itemCount).toBe(posts.length)
  })

  it('builds item links with a trailing slash under the writing path', () => {
    const xml = buildRssXml(posts)
    expect(xml).toContain(`<link>${SITE_ORIGIN}/writing/newest/</link>`)
    expect(xml).toContain(`<link>${SITE_ORIGIN}/writing/oldest/</link>`)
  })

  it('emits a guid matching the item link', () => {
    const xml = buildRssXml(posts)
    expect(xml).toContain(
      `<guid isPermaLink="true">${SITE_ORIGIN}/writing/newest/</guid>`,
    )
  })

  it('includes a description only when the post has a summary', () => {
    const xml = buildRssXml(posts)
    // newest has a summary
    expect(xml).toContain('<description>the freshest thing</description>')
    // oldest has none: its item block must carry no <description>
    const oldestItem = xml.slice(xml.indexOf('<item>', xml.indexOf('oldest')))
    const oldestBlock = oldestItem.slice(0, oldestItem.indexOf('</item>'))
    expect(oldestBlock).not.toContain('<description>')
  })

  it('formats pubDate as an RFC 822 UTC string', () => {
    const xml = buildRssXml(posts)
    expect(xml).toContain('<pubDate>Wed, 01 Jul 2026 00:00:00 GMT</pubDate>')
    expect(xml).toContain('<pubDate>Wed, 01 Jan 2025 00:00:00 GMT</pubDate>')
  })

  it('escapes XML metacharacters in interpolated values', () => {
    const xml = buildRssXml([
      {
        slug: 'tricky',
        title: 'tools & toys <are> "fun"',
        date: '2026-05-05',
        summary: 'a & b < c > d',
      },
    ])
    expect(xml).toContain(
      '<title>tools &amp; toys &lt;are&gt; &quot;fun&quot;</title>',
    )
    expect(xml).toContain('<description>a &amp; b &lt; c &gt; d</description>')
    // raw metacharacters must not leak into the document
    expect(xml).not.toContain('tools & toys')
    expect(xml).not.toContain('<are>')
  })
})
