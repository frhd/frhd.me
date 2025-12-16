/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Command, CommandCategory } from "./types";
import { CATEGORY_CONFIG } from "./types";

/**
 * Command Registry - manages all terminal commands
 */
class CommandRegistry {
  private commands: Map<string, Command> = new Map();
  private aliasMap: Map<string, string> = new Map();

  /**
   * Register a command
   */
  register(command: Command): void {
    this.commands.set(command.name, command);

    if (command.aliases) {
      for (const alias of command.aliases) {
        this.aliasMap.set(alias, command.name);
      }
    }
  }

  /**
   * Register multiple commands at once
   */
  registerAll(commands: Command[]): void {
    for (const command of commands) {
      this.register(command);
    }
  }

  /**
   * Get a command by name or alias
   */
  get(nameOrAlias: string): Command | undefined {
    const name = this.aliasMap.get(nameOrAlias) || nameOrAlias;
    return this.commands.get(name);
  }

  /**
   * Check if a command exists
   */
  has(nameOrAlias: string): boolean {
    return this.get(nameOrAlias) !== undefined;
  }

  /**
   * Get all commands
   */
  getAll(): Command[] {
    return Array.from(this.commands.values());
  }

  /**
   * Get commands by category
   */
  getByCategory(category: CommandCategory): Command[] {
    return this.getAll().filter((cmd) => cmd.category === category);
  }

  /**
   * Get all category names that have commands
   */
  getCategories(): CommandCategory[] {
    const categories = new Set<CommandCategory>();
    for (const cmd of this.commands.values()) {
      categories.add(cmd.category);
    }
    return Array.from(categories);
  }

  /**
   * Execute a command by name
   */
  async execute(
    term: any,
    commandName: string,
    args: string[]
  ): Promise<boolean> {
    const command = this.get(commandName.toLowerCase());
    if (command) {
      await command.execute(term, args);
      return true;
    }
    return false;
  }

  /**
   * Display order for categories
   */
  private categoryOrder: CommandCategory[] = [
    "system",
    "info",
    "files",
    "fun",
    "visual",
    "games",
    "audio",
    "progress",
    "session",
    "utility",
    "live",
    "plugin",
    "meta",
  ];

  /**
   * Get commands grouped by category
   */
  private getGroupedCommands(): Map<CommandCategory, Command[]> {
    const categorizedCommands = new Map<CommandCategory, Command[]>();
    for (const cmd of this.commands.values()) {
      const category = cmd.category;
      if (!categorizedCommands.has(category)) {
        categorizedCommands.set(category, []);
      }
      categorizedCommands.get(category)!.push(cmd);
    }
    return categorizedCommands;
  }

  /**
   * Display category overview (compact view)
   */
  displayCategories(term: any): void {
    const grouped = this.getGroupedCommands();
    const categories: { name: string; key: string; count: number; color: string }[] = [];

    for (const category of this.categoryOrder) {
      const commands = grouped.get(category);
      if (!commands || commands.length === 0) continue;
      const config = CATEGORY_CONFIG[category];
      categories.push({
        name: config.name,
        key: category,
        count: commands.length,
        color: config.color,
      });
    }

    // Display in rows of 3
    term.writeln("");
    for (let i = 0; i < categories.length; i += 3) {
      const row = categories.slice(i, i + 3);
      const formatted = row
        .map((c) => {
          const label = `${c.key} (${c.count})`;
          return term.colorize(label.padEnd(18), c.color);
        })
        .join("");
      term.writeln(`  ${formatted}`);
    }
  }

  /**
   * Display commands for a specific category
   */
  displayCategory(term: any, categoryName: string): boolean {
    const category = categoryName.toLowerCase() as CommandCategory;
    const grouped = this.getGroupedCommands();
    const commands = grouped.get(category);

    if (!commands || commands.length === 0) {
      return false;
    }

    const config = CATEGORY_CONFIG[category];
    term.writeln("");
    term.writeln(term.colorize(`${config.name}:`, config.color));
    term.writeln("");

    for (const cmd of commands) {
      const displayName = cmd.usage || cmd.name;
      const paddedName = displayName.padEnd(20);
      term.writeln(
        `  ${term.colorize(paddedName, "brightGreen")} ${cmd.description}`
      );
    }
    return true;
  }

  /**
   * Display help for a specific command
   */
  displayCommandHelp(term: any, commandName: string): boolean {
    const cmd = this.get(commandName);
    if (!cmd) return false;

    term.writeln("");
    term.writeln(term.colorize(cmd.usage || cmd.name, "brightGreen"));
    term.writeln(`  ${cmd.description}`);
    if (cmd.aliases && cmd.aliases.length > 0) {
      term.writeln(`  Aliases: ${cmd.aliases.join(", ")}`);
    }
    return true;
  }

  /**
   * Display help for all commands (full view)
   */
  displayHelp(term: any): void {
    const grouped = this.getGroupedCommands();

    for (const category of this.categoryOrder) {
      const commands = grouped.get(category);
      if (!commands || commands.length === 0) continue;

      const config = CATEGORY_CONFIG[category];
      term.writeln("");
      term.writeln(term.colorize(`${config.name}:`, config.color));
      term.writeln("");

      for (const cmd of commands) {
        const displayName = cmd.usage || cmd.name;
        const paddedName = displayName.padEnd(24);
        term.writeln(
          `  ${term.colorize(paddedName, "brightGreen")} ${cmd.description}`
        );
      }
    }
  }
}

// Singleton instance
export const commandRegistry = new CommandRegistry();

/**
 * Helper to create a command definition
 */
export function defineCommand(command: Command): Command {
  return command;
}
