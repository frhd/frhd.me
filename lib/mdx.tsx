import type { ReactElement } from 'react'

import { compileMDX } from 'next-mdx-remote/rsc'

/**
 * Compile trusted local MDX source to a rendered React element on the server.
 *
 * Content comes from `content/writing/*.mdx` (our own files), so no
 * sanitisation, syntax-highlighting, or remark/rehype plugins are wired in —
 * the default HTML mapping is enough. Runs at build time only (static export);
 * there is no client-side MDX runtime.
 */
export async function renderMdx(source: string): Promise<ReactElement> {
  const { content } = await compileMDX({ source })
  return content
}
