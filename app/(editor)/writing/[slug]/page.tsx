import { cache } from 'react'

import type { Metadata } from 'next'

import { renderMdx } from '@/lib/mdx'
import { getAllPosts, getPost } from '@/lib/posts'
import { SITE_TITLE } from '@/lib/site'

/**
 * A single writing post at `/writing/<slug>/`. Every post is prerendered at
 * build time (static export) via generateStaticParams. The page is a thin
 * server component: load the post, compile its MDX body, and render it as the
 * open document inside the editor chrome (supplied by the (editor) layout).
 */

// Deduplicate the file read: generateMetadata and PostPage both need the post,
// and React's cache() lets them share one getPost call per render.
const getCachedPost = cache(getPost)

interface PostPageParams {
  slug: string
}

export function generateStaticParams(): PostPageParams[] {
  return getAllPosts().map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PostPageParams>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getCachedPost(slug)
  return {
    title: `${post.title} — ${SITE_TITLE}`,
    description: post.summary,
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<PostPageParams>
}) {
  const { slug } = await params
  const post = getCachedPost(slug)
  const body = await renderMdx(post.content)

  return (
    <main className="post">
      <article>
        <header className="post-header">
          <h1 className="post-title">{post.title}</h1>
          <p className="post-date">{post.date}</p>
        </header>
        <div className="prose">{body}</div>
      </article>
    </main>
  )
}
