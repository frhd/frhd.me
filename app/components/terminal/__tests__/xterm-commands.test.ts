import { describe, it, expect, vi, beforeEach } from 'vitest'
import { executeCommand } from '../xterm-commands'

// Mock terminal object that captures writes
function createMockTerminal() {
  const output: string[] = []
  const term = {
    output,
    cwd: '~',
    write: vi.fn((data: string) => output.push(data)),
    writeln: vi.fn((data: string) => output.push(data + '\n')),
    clear: vi.fn(),
    scrollToTop: vi.fn(),
    disconnect: vi.fn(),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    colorize: (text: string, _color: string) => text,
    getOutput: () => output.join(''),
    getLines: () => output,
  }
  return term
}

describe('executeCommand', () => {
  let term: ReturnType<typeof createMockTerminal>

  beforeEach(() => {
    term = createMockTerminal()
  })

  describe('help command', () => {
    it('displays available commands', async () => {
      await executeCommand(term, 'help')
      const output = term.getOutput()
      expect(output).toContain('Available Commands:')
      expect(output).toContain('help')
      expect(output).toContain('about')
      expect(output).toContain('matrix')
      expect(output).toContain('whoami')
    })
  })

  describe('whoami command', () => {
    it('returns guest@frhd.me', async () => {
      await executeCommand(term, 'whoami')
      expect(term.writeln).toHaveBeenCalledWith('guest@frhd.me')
    })
  })

  describe('pwd command', () => {
    it('returns current working directory', async () => {
      term.cwd = '~/projects'
      await executeCommand(term, 'pwd')
      expect(term.writeln).toHaveBeenCalledWith('~/projects')
    })

    it('returns home directory by default', async () => {
      await executeCommand(term, 'pwd')
      expect(term.writeln).toHaveBeenCalledWith('~')
    })
  })

  describe('date command', () => {
    it('returns a valid date string', async () => {
      await executeCommand(term, 'date')
      expect(term.writeln).toHaveBeenCalled()
      const call = term.writeln.mock.calls[0][0]
      // Date string should be parseable
      expect(new Date(call).toString()).not.toBe('Invalid Date')
    })
  })

  describe('echo command', () => {
    it('echoes the input text', async () => {
      await executeCommand(term, 'echo Hello World')
      expect(term.writeln).toHaveBeenCalledWith('Hello World')
    })

    it('echoes empty string when no args', async () => {
      await executeCommand(term, 'echo')
      expect(term.writeln).toHaveBeenCalledWith('')
    })
  })

  describe('cat command', () => {
    it('displays about.txt content', async () => {
      await executeCommand(term, 'cat about.txt')
      const output = term.getOutput()
      expect(output).toContain('Full-stack engineer')
    })

    it('displays skills.json content', async () => {
      await executeCommand(term, 'cat skills.json')
      const output = term.getOutput()
      expect(output).toContain('TypeScript')
      expect(output).toContain('React')
    })

    it('displays contact.md content', async () => {
      await executeCommand(term, 'cat contact.md')
      const output = term.getOutput()
      expect(output).toContain('github.com/frhd')
    })

    it('displays error for unknown file', async () => {
      await executeCommand(term, 'cat unknown.txt')
      const output = term.getOutput()
      expect(output).toContain('No such file or directory')
    })

    it('displays error when no file specified', async () => {
      await executeCommand(term, 'cat')
      const output = term.getOutput()
      expect(output).toContain('missing file operand')
    })
  })

  describe('ls command', () => {
    it('lists directory contents', async () => {
      await executeCommand(term, 'ls')
      const output = term.getOutput()
      expect(output).toContain('about.txt')
      expect(output).toContain('projects/')
      expect(output).toContain('skills.json')
      expect(output).toContain('contact.md')
    })
  })

  describe('cd command', () => {
    it('changes to projects directory', async () => {
      await executeCommand(term, 'cd projects')
      expect(term.cwd).toBe('~/projects')
    })

    it('changes to projects with ./ prefix', async () => {
      await executeCommand(term, 'cd ./projects')
      expect(term.cwd).toBe('~/projects')
    })

    it('navigates up with ..', async () => {
      term.cwd = '~/projects'
      await executeCommand(term, 'cd ..')
      expect(term.cwd).toBe('~')
    })

    it('navigates to home with ~', async () => {
      term.cwd = '~/projects'
      await executeCommand(term, 'cd ~')
      expect(term.cwd).toBe('~')
    })

    it('navigates to home with no args', async () => {
      term.cwd = '~/projects'
      await executeCommand(term, 'cd')
      expect(term.cwd).toBe('~')
    })

    it('displays error for invalid directory', async () => {
      await executeCommand(term, 'cd nonexistent')
      const output = term.getOutput()
      expect(output).toContain('No such file or directory')
    })
  })

  describe('neofetch command', () => {
    it('displays system info', async () => {
      await executeCommand(term, 'neofetch')
      const output = term.getOutput()
      expect(output).toContain('OS:')
      expect(output).toContain('Shell:')
      expect(output).toContain('Terminal:')
    })
  })

  describe('contact command', () => {
    it('displays contact information', async () => {
      await executeCommand(term, 'contact')
      const output = term.getOutput()
      expect(output).toContain('Contact Information')
      expect(output).toContain('Email:')
      expect(output).toContain('GitHub:')
      expect(output).toContain('LinkedIn:')
    })
  })

  describe('unknown command', () => {
    it('displays error for unknown command', async () => {
      await executeCommand(term, 'unknowncommand')
      const output = term.getOutput()
      expect(output).toContain('Command not found')
      expect(output).toContain("Type 'help' for available commands")
    })

    it('does not display error for empty command', async () => {
      await executeCommand(term, '')
      expect(term.writeln).not.toHaveBeenCalled()
    })

    it('does not display error for whitespace command', async () => {
      await executeCommand(term, '   ')
      expect(term.writeln).not.toHaveBeenCalled()
    })
  })

  describe('clear command', () => {
    it('clears the terminal', async () => {
      await executeCommand(term, 'clear')
      expect(term.clear).toHaveBeenCalled()
      expect(term.scrollToTop).toHaveBeenCalled()
    })
  })

  describe('about command', () => {
    it('displays about info', async () => {
      await executeCommand(term, 'about')
      const output = term.getOutput()
      expect(output).toContain('About')
      expect(output).toContain('Farhad')
      expect(output).toContain('Software Engineer')
    })
  })

  describe('decrypt command', () => {
    it('shows usage error without --about flag', async () => {
      await executeCommand(term, 'decrypt')
      const output = term.getOutput()
      expect(output).toContain('Usage: decrypt --about')
    })
  })

  describe('scan command', () => {
    it('shows usage error without --systems flag', async () => {
      await executeCommand(term, 'scan')
      const output = term.getOutput()
      expect(output).toContain('Usage: scan --systems')
    })
  })

  describe('access command', () => {
    it('shows usage error without --mainframe flag', async () => {
      await executeCommand(term, 'access')
      const output = term.getOutput()
      expect(output).toContain('Usage: access --mainframe')
    })
  })

  describe('download command', () => {
    it('shows usage error without --consciousness flag', async () => {
      await executeCommand(term, 'download')
      const output = term.getOutput()
      expect(output).toContain('Usage: download --consciousness')
    })
  })
})
