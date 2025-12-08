import { describe, it, expect, vi, beforeEach } from 'vitest'
import { extendTerminal } from '../xterm-extensions'

// Create a mock base terminal
function createBaseTerm() {
  const output: string[] = []
  return {
    output,
    write: vi.fn((data: string) => output.push(data)),
    writeln: vi.fn((data: string) => output.push(data + '\n')),
    clear: vi.fn(),
    scrollToTop: vi.fn(),
    dispose: vi.fn(),
    onData: vi.fn(),
    open: vi.fn(),
    loadAddon: vi.fn(),
    getOutput: () => output.join(''),
  }
}

describe('extendTerminal', () => {
  let term: ReturnType<typeof createBaseTerm> & Record<string, unknown>

  beforeEach(() => {
    term = createBaseTerm()
    extendTerminal(term)
  })

  describe('initialization', () => {
    it('initializes default properties', () => {
      expect(term.currentLine).toBe('')
      expect(term.user).toBe('guest')
      expect(term.host).toBe('frhd.me')
      expect(term.cwd).toBe('~')
      expect(term.history).toEqual([])
      expect(term.historyIndex).toBe(-1)
      expect(term.disconnected).toBe(false)
    })

    it('displays logo on initialization', () => {
      const output = term.getOutput()
      // The logo contains 'frhd' as ASCII art: | |_ _ __| |__   __| |  _ __ ___   ___
      expect(output).toContain('|  _|')
    })
  })

  describe('colorize', () => {
    it('applies green color code', () => {
      const colorize = term.colorize as (text: string, color: string) => string
      const result = colorize('test', 'green')
      expect(result).toContain('\x1b[32m')
      expect(result).toContain('test')
      expect(result).toContain('\x1b[0m')
    })

    it('applies brightRed color code', () => {
      const colorize = term.colorize as (text: string, color: string) => string
      const result = colorize('error', 'brightRed')
      expect(result).toContain('\x1b[91m')
      expect(result).toContain('error')
    })

    it('applies bold style', () => {
      const colorize = term.colorize as (text: string, color: string) => string
      const result = colorize('bold text', 'bold')
      expect(result).toContain('\x1b[1m')
    })

    it('handles unknown color gracefully', () => {
      const colorize = term.colorize as (text: string, color: string) => string
      const result = colorize('test', 'unknownColor')
      expect(result).toContain('test')
      expect(result).toContain('\x1b[0m')
    })
  })

  describe('handleBackspace', () => {
    it('removes last character from currentLine', () => {
      term.currentLine = 'hello'
      const handleBackspace = term.handleBackspace as () => void
      handleBackspace()
      expect(term.currentLine).toBe('hell')
    })

    it('does nothing when currentLine is empty', () => {
      term.currentLine = ''
      const handleBackspace = term.handleBackspace as () => void
      handleBackspace()
      expect(term.currentLine).toBe('')
    })

    it('writes backspace sequence', () => {
      term.currentLine = 'a'
      const handleBackspace = term.handleBackspace as () => void
      handleBackspace()
      expect(term.write).toHaveBeenCalledWith('\b \b')
    })

    it('does nothing when disconnected', () => {
      term.currentLine = 'hello'
      term.disconnected = true
      const handleBackspace = term.handleBackspace as () => void
      handleBackspace()
      expect(term.currentLine).toBe('hello')
    })
  })

  describe('handleArrowUp', () => {
    it('navigates to previous history item', () => {
      term.history = ['cmd1', 'cmd2', 'cmd3']
      term.historyIndex = 3

      const handleArrowUp = term.handleArrowUp as () => void
      handleArrowUp()

      expect(term.historyIndex).toBe(2)
      expect(term.currentLine).toBe('cmd3')
    })

    it('does not go below index 0', () => {
      term.history = ['cmd1']
      term.historyIndex = 0

      const handleArrowUp = term.handleArrowUp as () => void
      handleArrowUp()

      expect(term.historyIndex).toBe(0)
    })

    it('does nothing when disconnected', () => {
      term.history = ['cmd1']
      term.historyIndex = 1
      term.disconnected = true

      const handleArrowUp = term.handleArrowUp as () => void
      handleArrowUp()

      expect(term.historyIndex).toBe(1)
    })
  })

  describe('handleArrowDown', () => {
    it('navigates to next history item', () => {
      term.history = ['cmd1', 'cmd2', 'cmd3']
      term.historyIndex = 0

      const handleArrowDown = term.handleArrowDown as () => void
      handleArrowDown()

      expect(term.historyIndex).toBe(1)
      expect(term.currentLine).toBe('cmd2')
    })

    it('clears line when at end of history', () => {
      term.history = ['cmd1', 'cmd2']
      term.historyIndex = 1

      const handleArrowDown = term.handleArrowDown as () => void
      handleArrowDown()

      expect(term.historyIndex).toBe(2)
      expect(term.currentLine).toBe('')
    })

    it('does nothing when disconnected', () => {
      term.history = ['cmd1']
      term.historyIndex = 0
      term.disconnected = true

      const handleArrowDown = term.handleArrowDown as () => void
      handleArrowDown()

      expect(term.historyIndex).toBe(0)
    })
  })

  describe('handleTab', () => {
    it('completes single matching command', () => {
      term.currentLine = 'hel'

      const handleTab = term.handleTab as () => void
      handleTab()

      expect(term.currentLine).toBe('help')
      expect(term.write).toHaveBeenCalledWith('p')
    })

    it('shows multiple matches when ambiguous', () => {
      term.currentLine = 'c'

      const handleTab = term.handleTab as () => void
      handleTab()

      const output = term.getOutput()
      expect(output).toContain('clear')
      expect(output).toContain('cat')
      expect(output).toContain('cd')
      expect(output).toContain('contact')
    })

    it('does nothing when no matches', () => {
      term.currentLine = 'xyz'
      const writeCalls = (term.write as ReturnType<typeof vi.fn>).mock.calls.length

      const handleTab = term.handleTab as () => void
      handleTab()

      expect((term.write as ReturnType<typeof vi.fn>).mock.calls.length).toBe(writeCalls)
    })

    it('does nothing for commands with arguments', () => {
      term.currentLine = 'cat somefile'
      const writeCalls = (term.write as ReturnType<typeof vi.fn>).mock.calls.length

      const handleTab = term.handleTab as () => void
      handleTab()

      expect(term.currentLine).toBe('cat somefile')
      expect((term.write as ReturnType<typeof vi.fn>).mock.calls.length).toBe(writeCalls)
    })

    it('does nothing when disconnected', () => {
      term.currentLine = 'hel'
      term.disconnected = true

      const handleTab = term.handleTab as () => void
      handleTab()

      expect(term.currentLine).toBe('hel')
    })
  })

  describe('handleCtrlC', () => {
    it('clears current line and shows ^C', () => {
      term.currentLine = 'some command'

      const handleCtrlC = term.handleCtrlC as () => void
      handleCtrlC()

      expect(term.currentLine).toBe('')
      expect(term.writeln).toHaveBeenCalledWith('^C')
    })

    it('does nothing when disconnected', () => {
      term.currentLine = 'test'
      term.disconnected = true

      const handleCtrlC = term.handleCtrlC as () => void
      handleCtrlC()

      expect(term.currentLine).toBe('test')
    })
  })

  describe('handleInput', () => {
    it('appends character to currentLine', () => {
      term.currentLine = 'hel'

      const handleInput = term.handleInput as (data: string) => void
      handleInput('l')

      expect(term.currentLine).toBe('hell')
    })

    it('writes input to terminal', () => {
      const handleInput = term.handleInput as (data: string) => void
      handleInput('x')

      expect(term.write).toHaveBeenCalledWith('x')
    })

    it('does nothing when disconnected', () => {
      term.currentLine = ''
      term.disconnected = true

      const handleInput = term.handleInput as (data: string) => void
      handleInput('x')

      expect(term.currentLine).toBe('')
    })
  })

  describe('disconnect', () => {
    it('sets disconnected to true', () => {
      const disconnect = term.disconnect as () => void
      disconnect()

      expect(term.disconnected).toBe(true)
    })

    it('displays disconnection message', () => {
      const disconnect = term.disconnect as () => void
      disconnect()

      const output = term.getOutput()
      expect(output).toContain('Connection to frhd.me closed')
    })

    it('hides cursor', () => {
      const disconnect = term.disconnect as () => void
      disconnect()

      expect(term.write).toHaveBeenCalledWith('\x1b[?25l')
    })
  })

  describe('prompt', () => {
    it('displays prompt with user, host, and cwd', () => {
      // Clear the logo output from initialization
      ;(term.write as ReturnType<typeof vi.fn>).mockClear()

      const prompt = term.prompt as () => void
      prompt()

      expect(term.write).toHaveBeenCalled()
      const promptCall = (term.write as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(promptCall).toContain('guest')
      expect(promptCall).toContain('frhd.me')
      expect(promptCall).toContain('$')
    })

    it('does nothing when disconnected', () => {
      term.disconnected = true
      ;(term.write as ReturnType<typeof vi.fn>).mockClear()

      const prompt = term.prompt as () => void
      prompt()

      expect(term.write).not.toHaveBeenCalled()
    })
  })

  describe('setCurrentLine', () => {
    it('sets currentLine and updates display', () => {
      const setCurrentLine = term.setCurrentLine as (line: string) => void
      setCurrentLine('new command')

      expect(term.currentLine).toBe('new command')
      expect(term.write).toHaveBeenCalledWith('new command')
    })
  })

  describe('clearCurrentLine', () => {
    it('writes clear line escape sequence', () => {
      ;(term.write as ReturnType<typeof vi.fn>).mockClear()

      const clearCurrentLine = term.clearCurrentLine as () => void
      clearCurrentLine()

      expect(term.write).toHaveBeenCalledWith('\r\x1b[K')
    })
  })
})
