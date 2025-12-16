/**
 * Terminal Commands Module
 *
 * This module provides a unified command system for the terminal.
 * Commands are organized into categories and registered with a central registry.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { commandRegistry } from "./registry";
import { systemCommands } from "./system";
import { infoCommands } from "./info";
import { fileCommands } from "./files";
import { funCommands } from "./fun";
import { utilityCommands } from "./utility";
import { gameCommands } from "./games";
import { settingsCommands, getCrtEnabled } from "./settings";
import { metaCommands, isInAdventureMode, executeAdventureInput } from "./meta";
import { trackCommand, unlockAchievement } from "../achievements";
import { getPluginRegistry } from "../plugin-system";

// Register all commands on module load
commandRegistry.registerAll(systemCommands);
commandRegistry.registerAll(infoCommands);
commandRegistry.registerAll(fileCommands);
commandRegistry.registerAll(funCommands);
commandRegistry.registerAll(utilityCommands);
commandRegistry.registerAll(gameCommands);
commandRegistry.registerAll(settingsCommands);
commandRegistry.registerAll(metaCommands);

/**
 * Execute a command string
 *
 * @param term - The terminal instance (any for backwards compatibility)
 * @param command - The full command string
 */
export async function executeCommand(
  term: any,
  command: string
): Promise<void> {
  const [cmd, ...args] = command.split(" ");
  const commandName = cmd.toLowerCase();

  // Track command usage for achievements
  if (command.trim()) {
    trackCommand(command);
    unlockAchievement("first_command");
  }

  // Try to execute from command registry first
  const executed = await commandRegistry.execute(term, commandName, args);

  if (!executed) {
    // Check if it's a plugin command
    const pluginRegistry = getPluginRegistry();
    if (pluginRegistry.hasCommand(commandName)) {
      await pluginRegistry.executeCommand(commandName, term, args);
    } else if (command.trim()) {
      term.writeln(
        term.colorize(
          `Command not found: ${cmd}. Type 'help' for available commands.`,
          "brightRed"
        )
      );
    }
  }
}

// Re-export for backwards compatibility
export {
  commandRegistry,
  getCrtEnabled,
  isInAdventureMode,
  executeAdventureInput,
};

// Re-export types
export type { ExtendedTerminal, Command } from "./types";
