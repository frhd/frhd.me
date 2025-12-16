/**
 * Plugin Registry
 *
 * Central registry for managing plugins and their commands.
 * Handles plugin registration, command lookup, and execution.
 */

import type {
  Plugin,
  TerminalInterface,
  CommandEntry,
} from "./types";
import { parsePlugin } from "./loader";
import { loadStoredPlugins, savePlugins } from "./storage";

/**
 * Reserved command names that plugins cannot override
 */
export const RESERVED_COMMANDS = [
  "help",
  "clear",
  "about",
  "matrix",
  "decrypt",
  "whoami",
  "pwd",
  "ls",
  "cat",
  "cd",
  "echo",
  "date",
  "neofetch",
  "contact",
  "scan",
  "access",
  "glitch",
  "download",
  "exit",
  "sudo",
  "rm",
  "ping",
  "sl",
  "cowsay",
  "fortune",
  "figlet",
  "find",
  "theme",
  "crt",
  "pipes",
  "plasma",
  "fireworks",
  "snake",
  "tetris",
  "typing",
  "2048",
  "sound",
  "music",
  "achievements",
  "uptime",
  "last",
  "qr",
  "base64",
  "calc",
  "uuid",
  "timestamp",
  "weather",
  "adventure",
  "github",
  "status",
  "news",
  "vim",
  "vi",
  "nano",
  "plugin",
] as const;

/**
 * Plugin Registry class
 *
 * Manages plugin registration, storage, and command execution.
 */
export class PluginRegistry {
  private plugins: Map<string, Plugin> = new Map();
  private commandMap: Map<string, CommandEntry> = new Map();

  constructor() {
    this.loadPlugins();
  }

  /**
   * Parse plugin source code into a Plugin object.
   * Delegates to the standalone parsePlugin function.
   *
   * @param source - The plugin source code
   * @returns Parsed Plugin object
   * @throws Error if parsing or validation fails
   */
  parsePlugin(source: string): Plugin {
    return parsePlugin(source);
  }

  /**
   * Load plugins from localStorage
   */
  loadPlugins(): void {
    const storedPlugins = loadStoredPlugins();

    for (const storedPlugin of storedPlugins) {
      try {
        const plugin = parsePlugin(storedPlugin.source);
        // Preserve the original ID
        plugin.id = storedPlugin.id;
        this.registerPlugin(plugin, false);
      } catch (e) {
        console.error(`Failed to load plugin ${storedPlugin.id}:`, e);
      }
    }
  }

  /**
   * Save plugins to localStorage
   */
  private savePluginsToStorage(): void {
    savePlugins(this.plugins);
  }

  /**
   * Check if a command name is reserved
   */
  isReservedCommand(commandName: string): boolean {
    return RESERVED_COMMANDS.includes(
      commandName.toLowerCase() as (typeof RESERVED_COMMANDS)[number]
    );
  }

  /**
   * Register a plugin and its commands
   *
   * @param plugin - Plugin to register
   * @param save - Whether to save to localStorage (default: true)
   * @throws Error if command conflicts exist
   */
  registerPlugin(plugin: Plugin, save: boolean = true): void {
    // Check for command name conflicts with other plugins
    for (const cmd of plugin.commands) {
      const existing = this.commandMap.get(cmd.name.toLowerCase());
      if (existing) {
        throw new Error(
          `Command '${cmd.name}' already exists from plugin '${existing.plugin.name}'`
        );
      }
    }

    // Check for reserved command names
    for (const cmd of plugin.commands) {
      if (this.isReservedCommand(cmd.name)) {
        throw new Error(`Command '${cmd.name}' is a reserved command name`);
      }
    }

    // Register plugin and its commands
    this.plugins.set(plugin.id, plugin);
    for (const cmd of plugin.commands) {
      this.commandMap.set(cmd.name.toLowerCase(), { plugin, command: cmd });
    }

    if (save) {
      this.savePluginsToStorage();
    }
  }

  /**
   * Unregister a plugin and remove its commands
   *
   * @param pluginId - ID of the plugin to remove
   * @returns true if plugin was removed, false if not found
   */
  unregisterPlugin(pluginId: string): boolean {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return false;

    // Remove all commands
    for (const cmd of plugin.commands) {
      this.commandMap.delete(cmd.name.toLowerCase());
    }

    this.plugins.delete(pluginId);
    this.savePluginsToStorage();
    return true;
  }

  /**
   * Get all registered plugins
   */
  getPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get a plugin by ID
   */
  getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * Get a command entry by name
   */
  getCommand(commandName: string): CommandEntry | undefined {
    return this.commandMap.get(commandName.toLowerCase());
  }

  /**
   * Check if a command exists
   */
  hasCommand(commandName: string): boolean {
    return this.commandMap.has(commandName.toLowerCase());
  }

  /**
   * Get all plugin command names for tab completion
   */
  getCommandNames(): string[] {
    return Array.from(this.commandMap.keys());
  }

  /**
   * Execute a plugin command
   *
   * @param commandName - Name of the command to execute
   * @param term - Terminal interface for output
   * @param args - Command arguments
   * @returns true if command was handled, false if not found
   */
  async executeCommand(
    commandName: string,
    term: TerminalInterface,
    args: string[]
  ): Promise<boolean> {
    const entry = this.commandMap.get(commandName.toLowerCase());
    if (!entry) return false;

    try {
      await entry.command.execute(term, args);
      return true;
    } catch (e) {
      term.writeln(
        term.colorize(
          `Plugin error: ${e instanceof Error ? e.message : "Unknown error"}`,
          "brightRed"
        )
      );
      return true; // Return true to indicate command was handled (even if errored)
    }
  }
}
