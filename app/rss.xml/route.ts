import { getAllPosts } from '@/lib/posts'
import { buildRssXml } from '@/lib/rss'

// force-static so the static export writes this route out to `out/rss.xml`
// instead of expecting a server at request time.
export const dynamic = 'force-static'

export function GET(): Response {
  const xml = buildRssXml(getAllPosts())
  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}
