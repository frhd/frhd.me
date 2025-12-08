import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'

// Mock xterm.js and its addons using classes
class MockTerminal {
  open = vi.fn()
  loadAddon = vi.fn()
  onData = vi.fn()
  write = vi.fn()
  writeln = vi.fn()
  dispose = vi.fn()
}

class MockFitAddon {
  fit = vi.fn()
}

class MockWebLinksAddon {}

vi.mock('@xterm/xterm', () => ({
  Terminal: MockTerminal,
}))

vi.mock('@xterm/addon-fit', () => ({
  FitAddon: MockFitAddon,
}))

vi.mock('@xterm/addon-web-links', () => ({
  WebLinksAddon: MockWebLinksAddon,
}))

vi.mock('../xterm-extensions', () => ({
  extendTerminal: vi.fn(),
}))

vi.mock('../XTermMatrixRain', () => ({
  default: () => <div data-testid="matrix-rain">Matrix Rain</div>,
}))

describe('XTerminal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock requestAnimationFrame
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0)
      return 0
    })
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('renders without crashing', async () => {
    const { default: XTerminal } = await import('../XTerminal')
    const { container } = render(<XTerminal />)
    expect(container).toBeTruthy()
  })

  it('renders terminal container element', async () => {
    const { default: XTerminal } = await import('../XTerminal')
    const { container } = render(<XTerminal />)

    // The terminal container div should exist
    const terminalContainer = container.querySelector('.h-full.w-full')
    expect(terminalContainer).toBeTruthy()
  })

  it('has correct layout structure', async () => {
    const { default: XTerminal } = await import('../XTerminal')
    const { container } = render(<XTerminal />)

    // Check for main wrapper with flex layout
    const flexWrapper = container.querySelector('.flex.min-h-screen')
    expect(flexWrapper).toBeTruthy()

    // Check for terminal box
    const terminalBox = container.querySelector('.rounded-lg.bg-black\\/90')
    expect(terminalBox).toBeTruthy()
  })
})

describe('ClientTerminalWrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0)
      return 0
    })
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('renders XTerminal component', async () => {
    const { default: ClientTerminalWrapper } = await import('../ClientTerminalWrapper')
    const { container } = render(<ClientTerminalWrapper />)

    // Should render the terminal structure
    const flexWrapper = container.querySelector('.flex.min-h-screen')
    expect(flexWrapper).toBeTruthy()
  })
})
