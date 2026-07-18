import type { ReactNode } from 'react'

import EditorShell from '@/app/components/editor/EditorShell'
import { getAllPhotos, photoYears } from '@/lib/photos'
import { getAllPosts } from '@/lib/posts'
import { projects } from '@/lib/projects'
import { buildTree } from '@/lib/tree'

/**
 * Layout for every reading page. It builds the sidebar tree once at build time
 * from the content sources and wraps the route's document in the editor chrome.
 * Kept out of the root layout so `/terminal` (which is not in this group) stays
 * full-screen and chrome-free.
 */
export default function EditorLayout({ children }: { children: ReactNode }) {
  const tree = buildTree({
    posts: getAllPosts(),
    projects,
    photoYears: photoYears(getAllPhotos()),
  })

  return <EditorShell tree={tree}>{children}</EditorShell>
}
