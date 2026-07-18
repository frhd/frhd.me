'use client'

import { usePathname } from 'next/navigation'

import { breadcrumbFromPath } from '@/lib/tree'

/**
 * The pane's "open file" line: the current route mapped to its file label
 * (e.g. `writing/a-quieter-frhd-me.md`). Client component so it tracks
 * `usePathname()`; the mapping itself lives in the pure `breadcrumbFromPath`.
 */
export default function Breadcrumb() {
  const pathname = usePathname()
  return <div className="breadcrumb">{breadcrumbFromPath(pathname ?? '/')}</div>
}
