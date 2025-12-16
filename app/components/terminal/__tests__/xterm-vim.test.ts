import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { executeCommand } from '../xterm-commands'

// Mock window.dispatchEvent
const mockDispatchEvent = vi.fn()

describe('Phase 12: Vim Editor Commands', () => {
  let term: {
    write: ReturnType<typeof vi.fn>
    writeln: ReturnType<typeof vi.fn>
    clear: ReturnType<typeof vi.fn>
    scrollToTop: ReturnType<typeof vi.fn>
    colorize: (text: string, color: string) => string
    cwd: string
    disconnect: ReturnType<typeof vi.fn>
  }
  let dispatchedEvents: CustomEvent[] = []

  beforeEach(() => {
    term = {
      write: vi.fn(),
      writeln: vi.fn(),
      clear: vi.fn(),
      scrollToTop: vi.fn(),
      colorize: (text: string) => text, // Simple pass-through for tests
      cwd: '~',
      disconnect: vi.fn(),
    }
    dispatchedEvents = []

    // Mock window.dispatchEvent to capture events
    mockDispatchEvent.mockImplementation((event: CustomEvent) => {
      dispatchedEvents.push(event)
      return true
    })

    vi.stubGlobal('window', {
      dispatchEvent: mockDispatchEvent,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  describe('vim command', () => {
    it('displays launch message', async () => {
      await executeCommand(term, 'vim')

      expect(term.writeln).toHaveBeenCalledWith(expect.stringContaining('vim'))
    })

    it('displays default filename when no file specified', async () => {
      await executeCommand(term, 'vim')

      expect(term.writeln).toHaveBeenCalledWith(expect.stringContaining('readme.txt'))
    })

    it('displays specified filename', async () => {
      await executeCommand(term, 'vim hello.js')

      expect(term.writeln).toHaveBeenCalledWith(expect.stringContaining('hello.js'))
    })

    it('dispatches visual-effect event with vim effect', async () => {
      await executeCommand(term, 'vim')

      const event = dispatchedEvents.find(e => e.type === 'visual-effect')
      expect(event).toBeDefined()
      expect(event?.detail.effect).toBe('vim')
    })

    it('passes filename in event detail', async () => {
      await executeCommand(term, 'vim config.json')

      const event = dispatchedEvents.find(e => e.type === 'visual-effect')
      expect(event?.detail.filename).toBe('config.json')
    })
  })

  describe('vi command (alias)', () => {
    it('works as vim alias', async () => {
      await executeCommand(term, 'vi')

      const event = dispatchedEvents.find(e => e.type === 'visual-effect')
      expect(event?.detail.effect).toBe('vim')
    })
  })

  describe('nano command (alias)', () => {
    it('works as vim alias', async () => {
      await executeCommand(term, 'nano')

      const event = dispatchedEvents.find(e => e.type === 'visual-effect')
      expect(event?.detail.effect).toBe('vim')
    })
  })
})

describe('Phase 12: Tab Completion for Vim', () => {
  it('completes "vi" to "vi" (exact match)', async () => {
    const { extendTerminal } = await import('../xterm-extensions')

    const output: string[] = []
    const term = {
      output,
      write: vi.fn((data: string) => output.push(data)),
      writeln: vi.fn((data: string) => output.push(data + '\n')),
      clear: vi.fn(),
      scrollToTop: vi.fn(),
      dispose: vi.fn(),
      onData: vi.fn(),
      open: vi.fn(),
      loadAddon: vi.fn(),
    }

    extendTerminal(term)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ext = term as any
    ext.currentLine = 'vi'
    ext.handleTab()

    // Should show multiple matches (vi, vim)
    expect(ext.currentLine).toBe('vi')
  })

  it('completes "vim" to "vim"', async () => {
    const { extendTerminal } = await import('../xterm-extensions')

    const output: string[] = []
    const term = {
      output,
      write: vi.fn((data: string) => output.push(data)),
      writeln: vi.fn((data: string) => output.push(data + '\n')),
      clear: vi.fn(),
      scrollToTop: vi.fn(),
      dispose: vi.fn(),
      onData: vi.fn(),
      open: vi.fn(),
      loadAddon: vi.fn(),
    }

    extendTerminal(term)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ext = term as any
    ext.currentLine = 'vim'
    ext.handleTab()

    expect(ext.currentLine).toBe('vim')
  })

  it('completes "nan" to "nano"', async () => {
    const { extendTerminal } = await import('../xterm-extensions')

    const output: string[] = []
    const term = {
      output,
      write: vi.fn((data: string) => output.push(data)),
      writeln: vi.fn((data: string) => output.push(data + '\n')),
      clear: vi.fn(),
      scrollToTop: vi.fn(),
      dispose: vi.fn(),
      onData: vi.fn(),
      open: vi.fn(),
      loadAddon: vi.fn(),
    }

    extendTerminal(term)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ext = term as any
    ext.currentLine = 'nan'
    ext.handleTab()

    expect(ext.currentLine).toBe('nano')
  })
})

describe('Phase 12: Vim in Help', () => {
  let term: {
    write: ReturnType<typeof vi.fn>
    writeln: ReturnType<typeof vi.fn>
    clear: ReturnType<typeof vi.fn>
    scrollToTop: ReturnType<typeof vi.fn>
    colorize: (text: string, color: string) => string
    cwd: string
    disconnect: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    term = {
      write: vi.fn(),
      writeln: vi.fn(),
      clear: vi.fn(),
      scrollToTop: vi.fn(),
      colorize: (text: string) => text,
      cwd: '~',
      disconnect: vi.fn(),
    }
  })

  it('help utility lists vim', async () => {
    await executeCommand(term, 'help utility')

    const allOutput = term.writeln.mock.calls.map(call => call[0]).join('\n')
    expect(allOutput).toContain('vim')
  })

  it('help utility describes vim as text editor', async () => {
    await executeCommand(term, 'help utility')

    const allOutput = term.writeln.mock.calls.map(call => call[0]).join('\n')
    expect(allOutput).toContain('editor')
  })
})
