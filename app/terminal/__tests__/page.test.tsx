import { describe, expect, it } from 'vitest'

import TerminalPage, { metadata } from '../page'

/**
 * Deliberately shallow. Booting xterm.js under jsdom is expensive and already
 * exercised by XTerminal's own tests; here we only assert the route's contract:
 * it exports a component and the correct metadata title. Rendering the full
 * terminal adds nothing this task changed.
 */
describe('TerminalPage', () => {
  it('exports a page component', () => {
    expect(typeof TerminalPage).toBe('function')
  })

  it('has the terminal page title', () => {
    expect(metadata.title).toBe('terminal — frhd.me')
  })
})
