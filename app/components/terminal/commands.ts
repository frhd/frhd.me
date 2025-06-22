import { Command, CommandOutput } from './types';

const commands: Record<string, Command> = {
  help: {
    name: 'help',
    description: 'Display available commands',
    action: () => ({
      content: `
Available commands:
  help                - Display this help message
  clear               - Clear terminal history
  about               - Learn about me
  decrypt --about     - Decrypt and reveal bio
  matrix              - Enter the Matrix
  glitch              - Trigger glitch effects
  scan --systems      - Scan system capabilities
  access --mainframe  - Access mainframe (full screen)
  whoami              - Who are you?
  contact             - Get contact information
  ls                  - List available sections
  cat [file]          - Display file contents
  download --consciousness - Easter egg
  exit                - Close browser tab
`,
      type: 'text'
    })
  },

  clear: {
    name: 'clear',
    description: 'Clear terminal history',
    action: () => ({
      content: 'CLEAR_TERMINAL',
      type: 'text'
    })
  },

  about: {
    name: 'about',
    description: 'Display information about me',
    action: () => ({
      content: `
[ACCESSING DATABASE...]
[PROFILE LOADED]

Name: Farhad
Role: Full Stack Developer | Security Enthusiast
Location: Variable
Specialties: Web Development, Cybersecurity, Cloud Architecture

Type 'decrypt --about' for the full experience.
`,
      type: 'text'
    })
  },

  decrypt: {
    name: 'decrypt',
    description: 'Decrypt hidden information',
    action: (args) => {
      if (args && args[0] === '--about') {
        return {
          content: `I'm a developer passionate about building secure, innovative web applications. 
My journey spans from system administration to full-stack development, 
with a particular interest in the intersection of security and user experience.

Currently focused on modern web technologies, cloud architectures, 
and creating engaging digital experiences.`,
          type: 'decrypt',
          duration: 3000
        };
      }
      return {
        content: 'Usage: decrypt --about',
        type: 'error'
      };
    }
  },

  matrix: {
    name: 'matrix',
    description: 'Enter the Matrix',
    action: () => ({
      content: 'MATRIX_RAIN',
      type: 'matrix',
      duration: 10000
    })
  },

  glitch: {
    name: 'glitch',
    description: 'Trigger glitch effects',
    action: () => ({
      content: 'GLITCH_EFFECT',
      type: 'glitch',
      duration: 2000
    })
  },

  scan: {
    name: 'scan',
    description: 'Scan systems',
    action: (args) => {
      if (args && args[0] === '--systems') {
        return {
          content: `
[SCANNING SYSTEMS...]
[■□□□□□□□□□] 10%
[■■■□□□□□□□] 30%
[■■■■■□□□□□] 50%
[■■■■■■■□□□] 70%
[■■■■■■■■■□] 90%
[■■■■■■■■■■] 100%

SCAN COMPLETE:
✓ React.js - ACTIVE
✓ Next.js - ACTIVE
✓ TypeScript - ACTIVE
✓ Node.js - ACTIVE
✓ Security Tools - ARMED
✓ Cloud Services - CONNECTED
✓ Database Systems - ONLINE
✓ DevOps Pipeline - OPERATIONAL

All systems operational.
`,
          type: 'text'
        };
      }
      return {
        content: 'Usage: scan --systems',
        type: 'error'
      };
    }
  },

  access: {
    name: 'access',
    description: 'Access mainframe',
    action: (args) => {
      if (args && args[0] === '--mainframe') {
        return {
          content: 'MAINFRAME_ACCESS',
          type: 'matrix',
          duration: 15000
        };
      }
      return {
        content: 'Usage: access --mainframe',
        type: 'error'
      };
    }
  },

  whoami: {
    name: 'whoami',
    description: 'Display current user',
    action: () => ({
      content: 'guest@frhd.me',
      type: 'text'
    })
  },

  contact: {
    name: 'contact',
    description: 'Display contact information',
    action: () => ({
      content: `
[ESTABLISHING SECURE CONNECTION...]

Email: [ENCRYPTED]
GitHub: github.com/frhd
LinkedIn: [CLASSIFIED]
Twitter/X: [REDACTED]

Use 'decrypt --contact' to reveal (coming soon)
`,
      type: 'text'
    })
  },

  ls: {
    name: 'ls',
    description: 'List available sections',
    action: () => ({
      content: `
drwxr-xr-x  about/
drwxr-xr-x  projects/
drwxr-xr-x  skills/
drwxr-xr-x  contact/
-rw-r--r--  resume.pdf
-rw-r--r--  README.md
`,
      type: 'text'
    })
  },

  cat: {
    name: 'cat',
    description: 'Display file contents',
    action: (args) => {
      if (!args || args.length === 0) {
        return {
          content: 'Usage: cat [filename]',
          type: 'error'
        };
      }

      const file = args[0].toLowerCase();
      const files: Record<string, string> = {
        'readme.md': `
# Welcome to frhd.me

This is my personal terminal-based portfolio.
Feel free to explore using various commands.

Type 'help' to see available commands.
`,
        'resume.pdf': 'Binary file. Use "download resume.pdf" to get it.',
      };

      if (files[file]) {
        return {
          content: files[file],
          type: 'text'
        };
      }

      return {
        content: `cat: ${args[0]}: No such file or directory`,
        type: 'error'
      };
    }
  },

  download: {
    name: 'download',
    description: 'Download files or consciousness',
    action: (args) => {
      if (args && args[0] === '--consciousness') {
        return {
          content: `
[INITIATING CONSCIOUSNESS TRANSFER...]
[WARNING: NEURAL INTERFACE NOT DETECTED]
[ESTABLISHING QUANTUM LINK...]
[■■■■■□□□□□] 50%
[ERROR: REALITY BUFFER OVERFLOW]

Transfer failed. You're not ready yet, Neo.
`,
          type: 'glitch',
          duration: 3000
        };
      }
      return {
        content: 'Usage: download --consciousness',
        type: 'error'
      };
    }
  },

  exit: {
    name: 'exit',
    description: 'Close browser tab',
    action: () => {
      // Display a goodbye message before closing
      setTimeout(() => {
        window.close();
      }, 1000);
      
      return {
        content: `
[TERMINATING SESSION...]
[SAVING STATE...]
[CLOSING CONNECTION...]

Goodbye, user. Connection terminated.
`,
        type: 'text'
      };
    }
  }
};

export function parseCommand(input: string): { command: string; args: string[] } {
  const parts = input.trim().split(/\s+/);
  return {
    command: parts[0] || '',
    args: parts.slice(1)
  };
}

export function executeCommand(input: string): CommandOutput {
  const { command, args } = parseCommand(input);
  
  if (commands[command]) {
    return commands[command].action(args);
  }
  
  return {
    content: `Command not found: ${command}. Type 'help' for available commands.`,
    type: 'error'
  };
}