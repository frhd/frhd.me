import type { Metadata } from 'next'

import ClientTerminalWrapper from '@/app/components/terminal/ClientTerminalWrapper'
import { SITE_TITLE } from '@/lib/site'

/**
 * The terminal as an easter egg, behind /terminal/. This renders the original
 * full-screen xterm.js homepage untouched. The `.terminal-page` wrapper class
 * re-scopes the page-level `overflow: hidden` that Task 2 removed from the
 * global stylesheet (see globals.css) so the xterm canvas never produces
 * page-level scrollbars — the quiet content pages still scroll freely.
 */
export const metadata: Metadata = {
  title: `terminal — ${SITE_TITLE}`,
}

export default function TerminalPage() {
  return (
    <div className="terminal-page">
      <ClientTerminalWrapper />
    </div>
  )
}
