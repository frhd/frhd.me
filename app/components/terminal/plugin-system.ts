/**
 * Plugin System for Terminal
 *
 * This file re-exports from the modular plugins/ directory
 * for backwards compatibility.
 *
 * @see ./plugins/ for the modular implementation
 */

// Re-export types
export type {
  Plugin,
  PluginCommand,
  TerminalInterface,
} from "./plugins";

// Re-export the singleton getter and example plugins
export { getPluginRegistry, examplePlugins } from "./plugins";
