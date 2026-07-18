import fs from 'node:fs'
import path from 'node:path'

import type { Metadata } from 'next'

import { renderMdx } from '@/lib/mdx'
import { SITE_TITLE } from '@/lib/site'

/**
 * The /now page: a standalone Markdown document (content/now.md) rendered in
 * the editor chrome, same shape as the README page but with its own title.
 */
export const metadata: Metadata = {
  title: `now — ${SITE_TITLE}`,
}

export default async function Now() {
  const source = fs.readFileSync(
    path.join(process.cwd(), 'content/now.md'),
    'utf8',
  )
  const body = await renderMdx(source)
  return <article className="prose">{body}</article>
}
