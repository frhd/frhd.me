/**
 * Plugin System
 *
 * Modular plugin system for the terminal.
 * This module re-exports all plugin functionality.
 */

// Types
export type {
  Plugin,
  PluginCommand,
  TerminalInterface,
  StoredPlugin,
  RawPluginDefinition,
  CommandEntry,
} from "./types";

// Sandbox
export { createSandbox, executeInSandbox } from "./sandbox";
export type { SandboxEnvironment } from "./sandbox";

// Loader
export { parsePlugin, generatePluginId } from "./loader";

// Storage
export {
  loadStoredPlugins,
  savePlugins,
  clearStoredPlugins,
  getStorageKey,
} from "./storage";

// Registry
export { PluginRegistry, RESERVED_COMMANDS } from "./registry";

// Examples
export { examplePlugins, dicePlugin, countdownPlugin, asciiPlugin } from "./examples";

// Singleton instance
import { PluginRegistry } from "./registry";

let registryInstance: PluginRegistry | null = null;

/**
 * Get the singleton plugin registry instance
 */
export function getPluginRegistry(): PluginRegistry {
  if (!registryInstance) {
    registryInstance = new PluginRegistry();
  }
  return registryInstance;
}
