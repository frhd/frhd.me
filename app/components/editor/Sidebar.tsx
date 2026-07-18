'use client'

import { useState, type CSSProperties } from 'react'

import { usePathname } from 'next/navigation'

import ThemeToggle from '@/app/components/ThemeToggle'
import type { TreeNode } from '@/lib/tree'

/**
 * The editor sidebar: a mono file tree on the chrome surface, plus a foot with
 * off-site links and the theme toggle. Client component because the active-row
 * highlight follows `usePathname()` and the mobile drawer holds open/closed
 * state. It receives the tree as serializable props (built in the (editor)
 * layout) so nothing but JSON-plain `TreeNode`s cross the RSC boundary.
 */

const ROOT_LABEL = '~/frhd.me'

/**
 * Strip a trailing slash so `/now` and `/now/` compare equal: despite
 * `trailingSlash: true`, `usePathname()` can hand back a path without the
 * slash, and the tree hrefs always carry one.
 */
function normalize(path: string): string {
  const stripped = path.replace(/\/+$/, '')
  return stripped === '' ? '/' : stripped
}

function TreeRow({
  node,
  depth,
  activePath,
}: {
  node: TreeNode
  depth: number
  activePath: string
}) {
  const style = { '--depth': depth } as CSSProperties
  const isActive =
    node.type !== 'external' &&
    node.href !== undefined &&
    normalize(node.href) === activePath

  if (node.type === 'dir') {
    return (
      <>
        {node.href ? (
          <a
            className="tree-row tree-dir"
            style={style}
            href={node.href}
            aria-current={isActive ? 'page' : undefined}
          >
            {node.label}
          </a>
        ) : (
          <span className="tree-row tree-dir" style={style}>
            {node.label}
          </span>
        )}
        {node.children?.map((child) => (
          <TreeRow
            key={child.label}
            node={child}
            depth={depth + 1}
            activePath={activePath}
          />
        ))}
      </>
    )
  }

  if (node.type === 'external') {
    return (
      <a
        className="tree-row tree-external"
        style={style}
        href={node.href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {node.label} ↗
      </a>
    )
  }

  return (
    <a
      className="tree-row tree-file"
      style={style}
      href={node.href}
      aria-current={isActive ? 'page' : undefined}
    >
      {node.label}
    </a>
  )
}

export default function Sidebar({ tree }: { tree: TreeNode[] }) {
  const pathname = usePathname()
  const activePath = normalize(pathname ?? '/')
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="editor-topbar">
        <span className="editor-topbar-name">{ROOT_LABEL}</span>
        <button
          type="button"
          className="editor-topbar-toggle"
          aria-label="toggle file tree"
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
        >
          ☰
        </button>
      </div>
      <aside className={open ? 'sidebar sidebar--open' : 'sidebar'}>
        <div className="sidebar-root">{ROOT_LABEL}</div>
        {/* Clicking a tree link navigates; closing the drawer here (rather than
            in an effect on pathname) both dismisses it after nav and satisfies
            the no-setState-in-effect rule. Harmless on desktop, where the
            sidebar is never a drawer. */}
        <nav
          className="tree"
          aria-label="file tree"
          onClick={() => setOpen(false)}
        >
          {tree.map((node) => (
            <TreeRow
              key={node.label}
              node={node}
              depth={0}
              activePath={activePath}
            />
          ))}
        </nav>
        <div className="sidebar-foot">
          <a
            href="https://github.com/frhd"
            target="_blank"
            rel="noopener noreferrer"
          >
            github ↗
          </a>
          <a href="/rss.xml">rss ↗</a>
          <ThemeToggle />
        </div>
      </aside>
    </>
  )
}
