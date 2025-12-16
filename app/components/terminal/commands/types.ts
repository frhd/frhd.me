/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Extended terminal interface with custom methods
 * Uses 'any' for backwards compatibility with existing code
 */
export interface ExtendedTerminal {
  write: (text: string) => void;
  writeln: (text: string) => void;
  clear: () => void;
  scrollToTop: () => void;
  colorize: (text: string, color: string) => string;
  cwd: string;
  disconnect: () => void;
  [key: string]: any; // Allow additional properties for flexibility
}

/**
 * Command definition interface
 */
export interface Command {
  /** Primary command name */
  name: string;
  /** Alternative names for the command */
  aliases?: string[];
  /** Short description shown in help */
  description: string;
  /** Usage pattern (e.g., "theme [name]") */
  usage?: string;
  /** Category for grouping in help */
  category: CommandCategory;
  /** Execute the command */
  execute: (term: ExtendedTerminal, args: string[]) => Promise<void> | void;
}

/**
 * Command categories for organization
 */
export type CommandCategory =
  | "system"
  | "info"
  | "files"
  | "fun"
  | "utility"
  | "games"
  | "visual"
  | "audio"
  | "progress"
  | "session"
  | "live"
  | "plugin"
  | "meta";

/**
 * Help category display configuration
 */
export interface CategoryConfig {
  name: string;
  color: string;
}

/**
 * Map of category display names and colors
 */
export const CATEGORY_CONFIG: Record<CommandCategory, CategoryConfig> = {
  system: { name: "System Commands", color: "brightCyan" },
  info: { name: "Information", color: "brightGreen" },
  files: { name: "File System", color: "brightBlue" },
  fun: { name: "Fun Commands", color: "brightMagenta" },
  utility: { name: "Utilities", color: "brightGreen" },
  games: { name: "Mini-Games", color: "brightRed" },
  visual: { name: "Visual & Themes", color: "brightBlue" },
  audio: { name: "Audio", color: "brightMagenta" },
  progress: { name: "Progress", color: "brightYellow" },
  session: { name: "Session", color: "brightCyan" },
  live: { name: "Live Data", color: "brightBlue" },
  plugin: { name: "Plugins", color: "brightMagenta" },
  meta: { name: "Meta", color: "brightWhite" },
};
