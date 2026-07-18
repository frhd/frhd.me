import type { Metadata } from 'next'
import Link from 'next/link'

import ThemeToggle from '@/app/components/ThemeToggle'
import { SITE_TITLE } from '@/lib/site'

/**
 * The 404 page, editor-flavored but deliberately outside the (editor) chrome:
 * it lives at the app root so it keeps 404 semantics for every non-group path,
 * and it has no sidebar. The theme toggle floats top-right here since there is
 * no sidebar flow to hold it.
 */
export const metadata: Metadata = {
  title: `404 — ${SITE_TITLE}`,
}

export default function NotFound() {
  return (
    <>
      <ThemeToggle className="theme-toggle--floating" />
      <main className="site">
        <h1 className="site-name">no such file</h1>
        <p className="home-intro">
          E404: this path doesn&apos;t resolve — the file moved, or it never
          existed.
        </p>
        <Link className="post-back" href="/">
          ← frhd.me
        </Link>
      </main>
    </>
  )
}
