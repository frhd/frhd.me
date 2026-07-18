import type { ReactNode } from 'react'

import { commitHash } from '@/lib/buildinfo'
import type { TreeNode } from '@/lib/tree'

import Breadcrumb from './Breadcrumb'
import Sidebar from './Sidebar'

/**
 * The editor chrome, presentational: the sidebar file tree alongside a pane
 * that stacks the open-file breadcrumb, the document (children), and the build
 * footer. The tree is built once in the (editor) layout and passed down, so
 * this component neither loads content nor holds state.
 */
export default function EditorShell({
  tree,
  children,
}: {
  tree: TreeNode[]
  children: ReactNode
}) {
  return (
    <div className="editor">
      <Sidebar tree={tree} />
      <div className="editor-pane">
        <Breadcrumb />
        <main className="editor-doc">{children}</main>
        <footer className="editor-foot">
          <span className="home-hint">⎇ {commitHash} · press t</span>
        </footer>
      </div>
    </div>
  )
}
