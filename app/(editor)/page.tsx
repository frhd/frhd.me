import fs from 'node:fs'
import path from 'node:path'

import { renderMdx } from '@/lib/mdx'

/**
 * The homepage is the README: a literal Markdown file rendered as the open
 * document in the editor chrome (supplied by the (editor) layout). Read and
 * compiled at build time — there is no client MDX runtime under static export.
 */
export default async function Home() {
  const source = fs.readFileSync(
    path.join(process.cwd(), 'content/README.md'),
    'utf8',
  )
  const body = await renderMdx(source)
  return <article className="prose">{body}</article>
}
