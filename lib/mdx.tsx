import type { ReactElement } from 'react'

import { compileMDX } from 'next-mdx-remote/rsc'
import rehypePrettyCode, { type Options as PrettyCodeOptions } from 'rehype-pretty-code'

/**
 * Locked shiki config (see docs/plan/master.md). Passing a `{ light, dark }`
 * theme record makes rehype-pretty-code emit both palettes as `--shiki-light`
 * / `--shiki-dark` CSS custom properties on every token (it sets shiki's
 * `defaultColor: false` for us — that option is no longer public in 0.14.x),
 * and app/globals.css picks the active one per theme. `keepBackground: false`
 * lets the pane's own `--code-bg` show through; `defaultLang: 'text'` keeps an
 * unlabelled fence from throwing.
 */
const prettyCodeOptions: PrettyCodeOptions = {
  theme: { light: 'github-light', dark: 'monokai' },
  keepBackground: false,
  defaultLang: 'text',
  // Leave inline `code` as a plain <code> chip (styled by .prose code). Without
  // this, rehype-pretty-code wraps every inline span in a highlight figure with
  // its own [data-line], which both muddies the DOM and would make the gutter's
  // line-number counter number inline code. Highlighting stays on fenced blocks.
  bypassInlineCode: true,
}

/**
 * Compile trusted local MDX source to a rendered React element on the server.
 *
 * Content comes from our own files (`content/*.md`, `content/writing/*.mdx`),
 * so it is treated as trusted: no HTML sanitisation is wired in. The only
 * rehype plugin is rehype-pretty-code, which adds build-time syntax
 * highlighting (dual-theme via CSS vars) — it does not sanitise. Runs at build
 * time only (static export); there is no client-side MDX runtime.
 */
export async function renderMdx(source: string): Promise<ReactElement> {
  const { content } = await compileMDX({
    source,
    options: {
      mdxOptions: {
        rehypePlugins: [[rehypePrettyCode, prettyCodeOptions]],
      },
    },
  })
  return content
}
