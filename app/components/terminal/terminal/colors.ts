/**
 * ANSI color codes and colorization utilities for terminal output
 */

export const ansiColors: Record<string, string> = {
  // Standard colors
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  // Bright colors
  brightBlack: "\x1b[90m",
  brightRed: "\x1b[91m",
  brightGreen: "\x1b[92m",
  brightYellow: "\x1b[93m",
  brightBlue: "\x1b[94m",
  brightMagenta: "\x1b[95m",
  brightCyan: "\x1b[96m",
  brightWhite: "\x1b[97m",
  // Styles
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  italic: "\x1b[3m",
  underline: "\x1b[4m",
  reset: "\x1b[0m",
};

/**
 * Colorize text with ANSI escape codes
 * @param text - The text to colorize
 * @param color - The color or style name
 * @returns The colorized text with reset code appended
 */
export function colorize(text: string, color: string): string {
  return `${ansiColors[color] || ""}${text}${ansiColors.reset}`;
}

/**
 * Create a colorize function bound to a specific color
 */
export function createColorizer(color: string): (text: string) => string {
  return (text: string) => colorize(text, color);
}

// Pre-bound colorizers for common colors
export const colors = {
  red: createColorizer("red"),
  green: createColorizer("green"),
  yellow: createColorizer("yellow"),
  blue: createColorizer("blue"),
  cyan: createColorizer("cyan"),
  magenta: createColorizer("magenta"),
  brightRed: createColorizer("brightRed"),
  brightGreen: createColorizer("brightGreen"),
  brightYellow: createColorizer("brightYellow"),
  brightBlue: createColorizer("brightBlue"),
  brightCyan: createColorizer("brightCyan"),
  brightMagenta: createColorizer("brightMagenta"),
  bold: createColorizer("bold"),
  dim: createColorizer("dim"),
};
