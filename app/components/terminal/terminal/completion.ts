/**
 * Tab completion logic for the terminal
 */

import { getPluginRegistry } from "../plugin-system";

/**
 * List of built-in terminal commands
 */
export const builtinCommands = [
  "help",
  "clear",
  "about",
  "matrix",
  "decrypt",
  "glitch",
  "scan",
  "access",
  "whoami",
  "contact",
  "ls",
  "cat",
  "pwd",
  "cd",
  "echo",
  "date",
  "neofetch",
  "exit",
  // Fun commands
  "sudo",
  "rm",
  "ping",
  "sl",
  "cowsay",
  "fortune",
  "figlet",
  "find",
  "download",
  // Visual & theme commands
  "theme",
  "crt",
  "pipes",
  "plasma",
  "fireworks",
  // Mini-games
  "snake",
  "tetris",
  "typing",
  "2048",
  // Sound system
  "sound",
  "music",
  // Achievements
  "achievements",
  // Time-based features
  "uptime",
  "last",
  // Utilities
  "qr",
  "base64",
  "calc",
  "uuid",
  "timestamp",
  "weather",
  // Text Adventure
  "adventure",
  // Live Data
  "github",
  "status",
  "news",
  // Advanced Editor
  "vim",
  "vi",
  "nano",
  // Plugin System
  "plugin",
];

/**
 * Get all available commands (built-in + plugin commands)
 */
export function getAllCommands(): string[] {
  const pluginCommands = getPluginRegistry().getCommandNames();
  return [...builtinCommands, ...pluginCommands];
}

/**
 * Result of tab completion
 */
export interface CompletionResult {
  /** If exactly one match, the completion suffix to append */
  completion?: string;
  /** If multiple matches, the list of matching commands */
  matches?: string[];
  /** The updated input line after completion */
  newLine?: string;
}

/**
 * Perform tab completion on the current input
 * @param currentLine - The current input line
 * @returns The completion result
 */
export function completeCommand(currentLine: string): CompletionResult {
  // Only complete commands (not arguments)
  if (currentLine.includes(" ")) {
    return {};
  }

  const allCommands = getAllCommands();
  const matches = allCommands.filter((cmd) => cmd.startsWith(currentLine));

  if (matches.length === 0) {
    return {};
  }

  if (matches.length === 1) {
    const completion = matches[0].slice(currentLine.length);
    return {
      completion,
      newLine: currentLine + completion,
    };
  }

  // Multiple matches
  return {
    matches,
  };
}

/**
 * Find common prefix among strings
 */
export function findCommonPrefix(strings: string[]): string {
  if (strings.length === 0) return "";
  if (strings.length === 1) return strings[0];

  let prefix = strings[0];
  for (let i = 1; i < strings.length; i++) {
    while (strings[i].indexOf(prefix) !== 0) {
      prefix = prefix.slice(0, -1);
      if (prefix === "") return "";
    }
  }
  return prefix;
}
