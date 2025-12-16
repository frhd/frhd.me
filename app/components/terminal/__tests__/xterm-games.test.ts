import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { executeCommand } from '../xterm-commands'

// Mock window.dispatchEvent
const mockDispatchEvent = vi.fn()

describe('Phase 3: Mini-Games Commands', () => {
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

  describe('snake command', () => {
    it('displays launch message', async () => {
      await executeCommand(term, 'snake')

      expect(term.writeln).toHaveBeenCalledWith(expect.stringContaining('Snake'))
    })

    it('displays control instructions', async () => {
      await executeCommand(term, 'snake')

      expect(term.writeln).toHaveBeenCalledWith(expect.stringContaining('Arrow keys'))
      expect(term.writeln).toHaveBeenCalledWith(expect.stringContaining('WASD'))
    })

    it('dispatches visual-effect event with snake effect', async () => {
      await executeCommand(term, 'snake')

      const event = dispatchedEvents.find(e => e.type === 'visual-effect')
      expect(event).toBeDefined()
      expect(event?.detail).toEqual({ effect: 'snake' })
    })
  })

  describe('tetris command', () => {
    it('displays launch message', async () => {
      await executeCommand(term, 'tetris')

      expect(term.writeln).toHaveBeenCalledWith(expect.stringContaining('Tetris'))
    })

    it('displays control instructions', async () => {
      await executeCommand(term, 'tetris')

      expect(term.writeln).toHaveBeenCalledWith(expect.stringContaining('Arrow keys'))
      expect(term.writeln).toHaveBeenCalledWith(expect.stringContaining('rotate'))
    })

    it('dispatches visual-effect event with tetris effect', async () => {
      await executeCommand(term, 'tetris')

      const event = dispatchedEvents.find(e => e.type === 'visual-effect')
      expect(event).toBeDefined()
      expect(event?.detail).toEqual({ effect: 'tetris' })
    })
  })

  describe('typing command', () => {
    it('displays launch message', async () => {
      await executeCommand(term, 'typing')

      expect(term.writeln).toHaveBeenCalledWith(expect.stringContaining('Typing Test'))
    })

    it('displays control instructions', async () => {
      await executeCommand(term, 'typing')

      expect(term.writeln).toHaveBeenCalledWith(expect.stringContaining('Start typing'))
    })

    it('dispatches visual-effect event with typing effect', async () => {
      await executeCommand(term, 'typing')

      const event = dispatchedEvents.find(e => e.type === 'visual-effect')
      expect(event).toBeDefined()
      expect(event?.detail).toEqual({ effect: 'typing' })
    })
  })

  describe('2048 command', () => {
    it('displays launch message', async () => {
      await executeCommand(term, '2048')

      expect(term.writeln).toHaveBeenCalledWith(expect.stringContaining('2048'))
    })

    it('displays control instructions', async () => {
      await executeCommand(term, '2048')

      expect(term.writeln).toHaveBeenCalledWith(expect.stringContaining('Arrow keys'))
    })

    it('dispatches visual-effect event with 2048 effect', async () => {
      await executeCommand(term, '2048')

      const event = dispatchedEvents.find(e => e.type === 'visual-effect')
      expect(event).toBeDefined()
      expect(event?.detail).toEqual({ effect: '2048' })
    })
  })
})

describe('Phase 3: Game Commands in Help', () => {
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

  it('help games lists mini-games section', async () => {
    await executeCommand(term, 'help games')

    const allOutput = term.writeln.mock.calls.map(call => call[0]).join('\n')
    expect(allOutput).toContain('Mini-Games')
  })

  it('help games lists snake game', async () => {
    await executeCommand(term, 'help games')

    const allOutput = term.writeln.mock.calls.map(call => call[0]).join('\n')
    expect(allOutput).toContain('snake')
  })

  it('help games lists tetris game', async () => {
    await executeCommand(term, 'help games')

    const allOutput = term.writeln.mock.calls.map(call => call[0]).join('\n')
    expect(allOutput).toContain('tetris')
  })

  it('help games lists typing test', async () => {
    await executeCommand(term, 'help games')

    const allOutput = term.writeln.mock.calls.map(call => call[0]).join('\n')
    expect(allOutput).toContain('typing')
  })

  it('help games lists 2048 game', async () => {
    await executeCommand(term, 'help games')

    const allOutput = term.writeln.mock.calls.map(call => call[0]).join('\n')
    expect(allOutput).toContain('2048')
  })
})

describe('Phase 3: Tab Completion for Games', () => {
  it('completes "sna" to "snake"', async () => {
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
    ext.currentLine = 'sna'
    ext.handleTab()

    expect(ext.currentLine).toBe('snake')
  })

  it('completes "tet" to "tetris"', async () => {
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
    ext.currentLine = 'tet'
    ext.handleTab()

    expect(ext.currentLine).toBe('tetris')
  })

  it('completes "typ" to "typing"', async () => {
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
    ext.currentLine = 'typ'
    ext.handleTab()

    expect(ext.currentLine).toBe('typing')
  })

  it('completes "204" to "2048"', async () => {
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
    ext.currentLine = '204'
    ext.handleTab()

    expect(ext.currentLine).toBe('2048')
  })
})

describe('Phase 3: localStorage Score Persistence', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('snake high score storage key is correct', () => {
    localStorage.setItem('frhd-snake-highscore', '100')
    expect(localStorage.getItem('frhd-snake-highscore')).toBe('100')
  })

  it('tetris high score storage key is correct', () => {
    localStorage.setItem('frhd-tetris-highscore', '5000')
    expect(localStorage.getItem('frhd-tetris-highscore')).toBe('5000')
  })

  it('typing high score storage key is correct', () => {
    localStorage.setItem('frhd-typing-highscore', '80')
    expect(localStorage.getItem('frhd-typing-highscore')).toBe('80')
  })

  it('2048 high score storage key is correct', () => {
    localStorage.setItem('frhd-2048-highscore', '2048')
    expect(localStorage.getItem('frhd-2048-highscore')).toBe('2048')
  })
})
