import type { PostMeta } from './posts'
import { SITE_DESCRIPTION, SITE_ORIGIN, SITE_TITLE } from './site'

/**
 * Pure RSS 2.0 builder. Takes posts already ordered (newest first, as
 * `getAllPosts` delivers them) and returns the feed XML as a string. Kept free
 * of route/network concerns so it can be unit-tested directly.
 */

/** Escape the five XML metacharacters for safe interpolation into markup. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** Canonical, trailing-slashed URL for a post. */
function postUrl(slug: string): string {
  return `${SITE_ORIGIN}/writing/${slug}/`
}

/**
 * Convert a `YYYY-MM-DD` date to an RFC 822 date-time in UTC, e.g.
 * "Wed, 01 Jul 2026 00:00:00 GMT". Input is trusted (validated by parsePost).
 */
function toRfc822(date: string): string {
  return new Date(`${date}T00:00:00.000Z`).toUTCString()
}

function renderItem(post: PostMeta): string {
  const link = postUrl(post.slug)
  const lines = [
    `      <title>${escapeXml(post.title)}</title>`,
    `      <link>${escapeXml(link)}</link>`,
    `      <guid isPermaLink="true">${escapeXml(link)}</guid>`,
    `      <pubDate>${toRfc822(post.date)}</pubDate>`,
  ]
  if (post.summary) {
    lines.push(`      <description>${escapeXml(post.summary)}</description>`)
  }
  return `    <item>\n${lines.join('\n')}\n    </item>`
}

/** Build the full RSS 2.0 feed document for the given posts. */
export function buildRssXml(posts: PostMeta[]): string {
  const items = posts.map(renderItem).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${escapeXml(`${SITE_ORIGIN}/`)}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
${items}
  </channel>
</rss>
`
}
