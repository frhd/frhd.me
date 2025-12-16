/**
 * Plugin System Types
 *
 * Core interfaces and types for the terminal plugin system.
 */

/**
 * Terminal interface exposed to plugins (subset of full terminal)
 * This is a safe, limited API that plugins can use
 */
export interface TerminalInterface {
  write: (text: string) => void;
  writeln: (text: string) => void;
  clear: () => void;
  colorize: (text: string, color: string) => string;
}

/**
 * A single command provided by a plugin
 */
export interface PluginCommand {
  name: string;
  description: string;
  usage?: string;
  execute: (term: TerminalInterface, args: string[]) => Promise<void> | void;
}

/**
 * Plugin definition with metadata and commands
 */
export interface Plugin {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  commands: PluginCommand[];
  /** Source code as string for serialization */
  source?: string;
}

/**
 * Serialized plugin format for localStorage persistence
 */
export interface StoredPlugin {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  source: string;
  installedAt: number;
}

/**
 * Raw plugin definition from parsed source code
 * This is what plugin authors create before it's processed
 */
export interface RawPluginDefinition {
  id?: string;
  name: string;
  version?: string;
  author?: string;
  description?: string;
  commands: PluginCommand[];
}

/**
 * Entry in the command map linking commands to their plugins
 */
export interface CommandEntry {
  plugin: Plugin;
  command: PluginCommand;
}
