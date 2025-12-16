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
   * Display help for all commands
   */
  displayHelp(term: any): void {
    const categorizedCommands = new Map<CommandCategory, Command[]>();

    // Group commands by category
    for (const cmd of this.commands.values()) {
      const category = cmd.category;
      if (!categorizedCommands.has(category)) {
        categorizedCommands.set(category, []);
      }
      categorizedCommands.get(category)!.push(cmd);
    }

    // Display order for categories
    const categoryOrder: CommandCategory[] = [
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

    for (const category of categoryOrder) {
      const commands = categorizedCommands.get(category);
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
