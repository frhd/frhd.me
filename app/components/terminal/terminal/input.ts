/**
 * Input handling utilities for the terminal
 */

/**
 * ANSI escape sequences for cursor control
 */
export const escapeSequences = {
  clearLine: "\r\x1b[K",
  backspace: "\b \b",
  hideCursor: "\x1b[?25l",
  showCursor: "\x1b[?25h",
  moveCursorLeft: (n: number) => `\x1b[${n}D`,
  moveCursorRight: (n: number) => `\x1b[${n}C`,
};

/**
 * Handle backspace key
 * @returns The new line after backspace, or undefined if line was empty
 */
export function handleBackspace(currentLine: string): string | undefined {
  if (currentLine.length === 0) {
    return undefined;
  }
  return currentLine.slice(0, -1);
}

/**
 * Handle regular character input
 */
export function handleCharacterInput(currentLine: string, char: string): string {
  return currentLine + char;
}

/**
 * Handle Ctrl+C (cancel current input)
 */
export function handleCtrlC(): { output: string; newLine: string } {
  return {
    output: "^C",
    newLine: "",
  };
}

/**
 * Handle Home key (move cursor to beginning)
 */
export function getHomeCursorMove(currentLine: string): string {
  return escapeSequences.moveCursorLeft(currentLine.length);
}

/**
 * Handle End key (move cursor to end)
 */
export function getEndCursorMove(currentLine: string): string {
  return escapeSequences.moveCursorRight(currentLine.length);
}
