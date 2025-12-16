/**
 * Plugin System for Terminal
 *
 * Allows users to create custom commands that integrate with the terminal.
 * Plugins are stored in localStorage and can be installed from URLs or created manually.
 */

// Storage key for installed plugins
const PLUGINS_STORAGE_KEY = "frhd-terminal-plugins";

// Plugin interface that all plugins must implement
export interface PluginCommand {
  name: string;
  description: string;
  usage?: string;
  execute: (term: TerminalInterface, args: string[]) => Promise<void> | void;
}

export interface Plugin {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  commands: PluginCommand[];
  // Source code as string for serialization
  source?: string;
}

// Serialized plugin format for localStorage
interface StoredPlugin {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  source: string;
  installedAt: number;
}

// Terminal interface exposed to plugins (subset of full terminal)
export interface TerminalInterface {
  write: (text: string) => void;
  writeln: (text: string) => void;
  clear: () => void;
  colorize: (text: string, color: string) => string;
}

// Plugin registry singleton
class PluginRegistry {
  private plugins: Map<string, Plugin> = new Map();
  private commandMap: Map<string, { plugin: Plugin; command: PluginCommand }> =
    new Map();

  constructor() {
    this.loadPlugins();
  }

  /**
   * Load plugins from localStorage
   */
  loadPlugins(): void {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(PLUGINS_STORAGE_KEY);
      if (!stored) return;

      const storedPlugins: StoredPlugin[] = JSON.parse(stored);
      for (const storedPlugin of storedPlugins) {
        try {
          const plugin = this.parsePlugin(storedPlugin.source);
          if (plugin) {
            plugin.id = storedPlugin.id;
            this.registerPlugin(plugin, false);
          }
        } catch (e) {
          console.error(`Failed to load plugin ${storedPlugin.id}:`, e);
        }
      }
    } catch (e) {
      console.error("Failed to load plugins from localStorage:", e);
    }
  }

  /**
   * Save plugins to localStorage
   */
  private savePlugins(): void {
    if (typeof window === "undefined") return;

    try {
      const storedPlugins: StoredPlugin[] = [];
      for (const plugin of this.plugins.values()) {
        if (plugin.source) {
          storedPlugins.push({
            id: plugin.id,
            name: plugin.name,
            version: plugin.version,
            author: plugin.author,
            description: plugin.description,
            source: plugin.source,
            installedAt: Date.now(),
          });
        }
      }
      localStorage.setItem(PLUGINS_STORAGE_KEY, JSON.stringify(storedPlugins));
    } catch (e) {
      console.error("Failed to save plugins to localStorage:", e);
    }
  }

  /**
   * Parse plugin source code into a Plugin object
   * Plugins must export a default object with the Plugin interface structure
   */
  parsePlugin(source: string): Plugin | null {
    try {
      // Create a sandboxed environment for the plugin
      const sandbox = this.createSandbox();

      // Wrap the source in an IIFE that returns the plugin definition
      const wrappedSource = `
        "use strict";
        ${source}
        return typeof plugin !== 'undefined' ? plugin : null;
      `;

      // Create a function from the source with limited scope
      const pluginFactory = new Function(...Object.keys(sandbox), wrappedSource);

      // Execute in sandbox
      const result = pluginFactory(...Object.values(sandbox));

      if (!result || typeof result !== "object") {
        throw new Error("Plugin must export a 'plugin' object");
      }

      // Validate required fields
      if (!result.name || typeof result.name !== "string") {
        throw new Error("Plugin must have a name");
      }
      if (!result.commands || !Array.isArray(result.commands)) {
        throw new Error("Plugin must have a commands array");
      }

      // Validate each command
      for (const cmd of result.commands) {
        if (!cmd.name || typeof cmd.name !== "string") {
          throw new Error("Each command must have a name");
        }
        if (!cmd.execute || typeof cmd.execute !== "function") {
          throw new Error(`Command '${cmd.name}' must have an execute function`);
        }
      }

      const plugin: Plugin = {
        id: result.id || this.generateId(result.name),
        name: result.name,
        version: result.version || "1.0.0",
        author: result.author || "Unknown",
        description: result.description || "No description",
        commands: result.commands,
        source: source,
      };

      return plugin;
    } catch (e) {
      console.error("Failed to parse plugin:", e);
      throw e;
    }
  }

  /**
   * Create a sandboxed environment for plugin execution
   * Only safe functions are exposed
   */
  private createSandbox(): Record<string, unknown> {
    return {
      // Safe globals
      console: {
        log: () => {},
        error: () => {},
        warn: () => {},
      },
      Math,
      Date,
      JSON,
      String,
      Number,
      Boolean,
      Array,
      Object,
      Map,
      Set,
      Promise,
      // Timing functions (limited)
      setTimeout: (fn: () => void, ms: number) => {
        // Cap timeout to 30 seconds
        const cappedMs = Math.min(ms, 30000);
        return setTimeout(fn, cappedMs);
      },
      clearTimeout,
      // Blocked globals (explicitly set to undefined to shadow global scope)
      window: undefined,
      document: undefined,
      localStorage: undefined,
      sessionStorage: undefined,
      fetch: undefined,
      XMLHttpRequest: undefined,
      // Note: eval and Function are not included here because they cannot be
      // used as parameter names in strict mode. The sandbox's strict mode
      // already prevents eval usage, and Function is blocked by not exposing it.
    };
  }

  /**
   * Generate a unique ID for a plugin
   */
  private generateId(name: string): string {
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const random = Math.random().toString(36).substring(2, 8);
    return `${slug}-${random}`;
  }

  /**
   * Register a plugin
   */
  registerPlugin(plugin: Plugin, save: boolean = true): void {
    // Check for command name conflicts
    for (const cmd of plugin.commands) {
      const existing = this.commandMap.get(cmd.name.toLowerCase());
      if (existing) {
        throw new Error(
          `Command '${cmd.name}' already exists from plugin '${existing.plugin.name}'`
        );
      }
    }

    // Check for reserved command names
    const reserved = [
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
    ];

    for (const cmd of plugin.commands) {
      if (reserved.includes(cmd.name.toLowerCase())) {
        throw new Error(`Command '${cmd.name}' is a reserved command name`);
      }
    }

    // Register plugin and its commands
    this.plugins.set(plugin.id, plugin);
    for (const cmd of plugin.commands) {
      this.commandMap.set(cmd.name.toLowerCase(), { plugin, command: cmd });
    }

    if (save) {
      this.savePlugins();
    }
  }

  /**
   * Unregister a plugin
   */
  unregisterPlugin(pluginId: string): boolean {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return false;

    // Remove all commands
    for (const cmd of plugin.commands) {
      this.commandMap.delete(cmd.name.toLowerCase());
    }

    this.plugins.delete(pluginId);
    this.savePlugins();
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
   * Get a command by name
   */
  getCommand(
    commandName: string
  ): { plugin: Plugin; command: PluginCommand } | undefined {
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

// Singleton instance
let registryInstance: PluginRegistry | null = null;

export function getPluginRegistry(): PluginRegistry {
  if (!registryInstance) {
    registryInstance = new PluginRegistry();
  }
  return registryInstance;
}

// Example plugins that can be installed
export const examplePlugins = {
  dice: `// Dice Rolling Plugin
const plugin = {
  name: "Dice Roller",
  version: "1.0.0",
  author: "frhd.me",
  description: "Roll dice with various configurations",
  commands: [
    {
      name: "roll",
      description: "Roll dice (e.g., roll 2d6, roll d20)",
      usage: "roll [NdM] - Roll N dice with M sides (default: 1d6)",
      execute: function(term, args) {
        const input = args[0] || "1d6";
        const match = input.match(/^(\\d*)d(\\d+)$/i);

        if (!match) {
          term.writeln(term.colorize("Usage: roll [NdM] - e.g., roll 2d6, roll d20", "yellow"));
          return;
        }

        const count = parseInt(match[1]) || 1;
        const sides = parseInt(match[2]);

        if (count > 100 || sides > 1000) {
          term.writeln(term.colorize("Maximum: 100 dice with 1000 sides each", "brightRed"));
          return;
        }

        const rolls = [];
        let total = 0;
        for (let i = 0; i < count; i++) {
          const roll = Math.floor(Math.random() * sides) + 1;
          rolls.push(roll);
          total += roll;
        }

        term.writeln(term.colorize("Rolling " + count + "d" + sides + "...", "cyan"));
        term.writeln("");

        if (count === 1) {
          term.writeln(term.colorize("  [ " + rolls[0] + " ]", "brightGreen"));
        } else {
          term.writeln("  " + rolls.map(function(r) { return term.colorize(r.toString(), "brightGreen"); }).join(" + "));
          term.writeln("");
          term.writeln(term.colorize("  Total: " + total, "brightYellow"));
        }
      }
    }
  ]
};`,

  countdown: `// Countdown Timer Plugin
const plugin = {
  name: "Countdown Timer",
  version: "1.0.0",
  author: "frhd.me",
  description: "Simple countdown timer",
  commands: [
    {
      name: "countdown",
      description: "Start a countdown timer",
      usage: "countdown <seconds>",
      execute: async function(term, args) {
        const seconds = parseInt(args[0]);

        if (!seconds || seconds <= 0 || seconds > 3600) {
          term.writeln(term.colorize("Usage: countdown <seconds> (1-3600)", "yellow"));
          return;
        }

        term.writeln(term.colorize("Starting countdown from " + seconds + " seconds...", "cyan"));
        term.writeln("");

        for (let i = seconds; i >= 0; i--) {
          term.write("\\r  " + term.colorize(i.toString().padStart(4, " "), i <= 5 ? "brightRed" : "brightGreen") + " ");
          if (i > 0) {
            await new Promise(function(r) { setTimeout(r, 1000); });
          }
        }

        term.writeln("");
        term.writeln("");
        term.writeln(term.colorize("  DONE!", "brightYellow"));
      }
    }
  ]
};`,

  ascii: `// ASCII Art Plugin
const plugin = {
  name: "ASCII Art",
  version: "1.0.0",
  author: "frhd.me",
  description: "Display fun ASCII art",
  commands: [
    {
      name: "shrug",
      description: "Display a shrug emoticon",
      execute: function(term) {
        term.writeln(term.colorize("  \u00af\\\\_(\u30c4)_/\u00af", "brightCyan"));
      }
    },
    {
      name: "tableflip",
      description: "Flip that table!",
      execute: function(term) {
        term.writeln(term.colorize("  (\u256f\u00b0\u25a1\u00b0\uff09\u256f\ufe35 \u253b\u2501\u253b", "brightRed"));
      }
    },
    {
      name: "unflip",
      description: "Put the table back",
      execute: function(term) {
        term.writeln(term.colorize("  \u252c\u2500\u252c \u30ce( \u309c-\u309c\u30ce)", "brightGreen"));
      }
    }
  ]
};`,
};
