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
})
