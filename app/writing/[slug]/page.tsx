import type { Metadata } from 'next'
import Link from 'next/link'

import { renderMdx } from '@/lib/mdx'
import { getAllPosts, getPost } from '@/lib/posts'
import { SITE_TITLE } from '@/lib/site'

/**
 * A single writing post at `/writing/<slug>/`. Every post is prerendered at
 * build time (static export) via generateStaticParams. The page is a thin
 * server component: load the post, compile its MDX body, and lay it out in the
 * same quiet one-column style as the homepage.
 */

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
  const post = getPost(slug)
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
  const post = getPost(slug)
  const body = await renderMdx(post.content)

  return (
    <main className="post">
      <Link className="post-back" href="/">
        ← frhd.me
      </Link>
      <article>
        <header className="post-header">
          <h1 className="post-title">{post.title}</h1>
          <p className="post-date">{post.date}</p>
        </header>
        <div className="post-body">{body}</div>
      </article>
    </main>
  )
}
