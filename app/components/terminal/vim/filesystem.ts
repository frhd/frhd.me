/**
 * Virtual filesystem for the vim editor
 */

export const VIRTUAL_FILES: Record<string, string[]> = {
  "readme.txt": [
    "Welcome to Vim!",
    "",
    "This is a minimal vim-like editor.",
    "Press 'i' to enter insert mode.",
    "Press 'ESC' to return to normal mode.",
    "Type ':q' to quit, ':w' to save.",
    "",
    "Navigation:",
    "  h - left",
    "  j - down",
    "  k - up",
    "  l - right",
    "  w - next word",
    "  b - previous word",
    "  0 - start of line",
    "  $ - end of line",
    "  gg - start of file",
    "  G - end of file",
    "",
    "Editing:",
    "  i - insert before cursor",
    "  a - append after cursor",
    "  o - open line below",
    "  O - open line above",
    "  x - delete character",
    "  dd - delete line",
    "  dw - delete word",
    "  yy - yank line",
    "  p - paste after",
    "  P - paste before",
    "  u - undo",
    "  Ctrl+r - redo",
    "",
    "Commands:",
    "  :w - save",
    "  :q - quit",
    "  :wq - save and quit",
    "  :q! - force quit",
    "  :set number - show line numbers",
    "  :set nonumber - hide line numbers",
  ],
  "hello.js": [
    "// A simple JavaScript file",
    "function greet(name) {",
    "  const message = `Hello, ${name}!`;",
    "  console.log(message);",
    "  return message;",
    "}",
    "",
    "// Main execution",
    "const result = greet('World');",
    "console.log('Result:', result);",
  ],
  "example.py": [
    "# Python example",
    "def factorial(n):",
    "    if n <= 1:",
    "        return 1",
    "    return n * factorial(n - 1)",
    "",
    "# Test the function",
    "for i in range(10):",
    "    print(f'{i}! = {factorial(i)}')",
  ],
  "config.json": [
    "{",
    '  "name": "terminal-portfolio",',
    '  "version": "1.0.0",',
    '  "settings": {',
    '    "theme": "matrix",',
    '    "fontSize": 14,',
    '    "showLineNumbers": true',
    "  }",
    "}",
  ],
};

export function getFileContent(filename: string): string[] | null {
  return VIRTUAL_FILES[filename] ? [...VIRTUAL_FILES[filename]] : null;
}

export function fileExists(filename: string): boolean {
  return filename in VIRTUAL_FILES;
}

export function listFiles(): string[] {
  return Object.keys(VIRTUAL_FILES);
}
