import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { renderMdx } from '../mdx'
import { getPost } from '../posts'

/**
 * Integration test for the MDX pipeline: compile the real seed post source and
 * assert its body renders to HTML with the expected content and semantic tags.
 */
describe('renderMdx', () => {
  it('renders the seed post body to HTML with paragraphs and inline code', async () => {
    const post = getPost('a-quieter-frhd-me')
    const element = await renderMdx(post.content)
    const html = renderToStaticMarkup(element)

    expect(html).toContain('<p>')
    // prose from the body survives compilation
    expect(html).toContain('a homepage should say things plainly')
    // inline code fences become <code> elements
    expect(html).toContain('<code>help</code>')
    expect(html).toContain('<code>/terminal</code>')
  })

  it('renders headings as heading elements', async () => {
    const element = await renderMdx('## a heading\n\nsome body text\n')
    const html = renderToStaticMarkup(element)
    expect(html).toContain('<h2>a heading</h2>')
    expect(html).toContain('some body text')
  })

  it('highlights fenced code blocks with dual-theme shiki vars and line rows', async () => {
    const element = await renderMdx('```ts\nconst x: number = 1\n```\n')
    const html = renderToStaticMarkup(element)

    // rehype-pretty-code wraps the block in a figure we can target in CSS.
    expect(html).toContain('data-rehype-pretty-code-figure')
    // Dual-theme output: every token carries BOTH palettes as CSS vars, so
    // globals.css can switch light/dark without re-highlighting. This is the
    // load-bearing invariant — assert both are present.
    expect(html).toContain('--shiki-light:')
    expect(html).toContain('--shiki-dark:')
    // Grid mode emits one [data-line] row per source line — the hook the
    // gutter's CSS line-number counter attaches to.
    expect(html).toContain('data-line')
    // A recognised keyword got tokenised (not dumped as one plain-text span).
    expect(html).toContain('const')
  })

  it('leaves inline code as a plain chip, not a highlight figure', async () => {
    const element = await renderMdx('some `inline` code\n')
    const html = renderToStaticMarkup(element)
    // bypassInlineCode keeps inline code a bare <code> (styled by .prose code);
    // it must NOT gain a figure wrapper or a [data-line] the gutter would count.
    expect(html).toContain('<code>inline</code>')
    expect(html).not.toContain('data-rehype-pretty-code-figure')
  })
})
