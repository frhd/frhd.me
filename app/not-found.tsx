import type { Metadata } from 'next'
import Link from 'next/link'

import ThemeToggle from '@/app/components/home/ThemeToggle'
import { SITE_TITLE } from '@/lib/site'

/**
 * The 404 page, in the same quiet one-column voice as the rest of the site.
 */
export const metadata: Metadata = {
  title: `404 — ${SITE_TITLE}`,
}

export default function NotFound() {
  return (
    <>
      <ThemeToggle />
      <main className="home">
        <h1 className="home-name">404</h1>
        <p className="home-intro">
          nothing here. this page does not exist — or it once did and
          doesn&apos;t anymore.
        </p>
        <Link className="home-link" href="/">
          ← frhd.me
        </Link>
      </main>
    </>
  )
}
