/**
 * Plugin Loader
 *
 * Handles parsing and validating plugin source code.
 */

import type { Plugin, RawPluginDefinition } from "./types";
import { createSandbox, executeInSandbox } from "./sandbox";

/**
 * Generate a unique ID for a plugin based on its name
 *
 * @param name - Plugin name
 * @returns A slug-based unique ID
 */
export function generatePluginId(name: string): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const random = Math.random().toString(36).substring(2, 8);
  return `${slug}-${random}`;
}

/**
 * Validate a raw plugin definition from parsed source
 *
 * @param result - The parsed result from sandbox execution
 * @throws Error if validation fails
 */
function validatePluginDefinition(result: unknown): asserts result is RawPluginDefinition {
  if (!result || typeof result !== "object") {
    throw new Error("Plugin must export a 'plugin' object");
  }

  const obj = result as Record<string, unknown>;

  // Validate required fields
  if (!obj.name || typeof obj.name !== "string") {
    throw new Error("Plugin must have a name");
  }
  if (!obj.commands || !Array.isArray(obj.commands)) {
    throw new Error("Plugin must have a commands array");
  }

  // Validate each command
  for (const cmd of obj.commands) {
    if (!cmd || typeof cmd !== "object") {
      throw new Error("Each command must be an object");
    }
    if (!cmd.name || typeof cmd.name !== "string") {
      throw new Error("Each command must have a name");
    }
    if (!cmd.execute || typeof cmd.execute !== "function") {
      throw new Error(`Command '${cmd.name}' must have an execute function`);
    }
  }
}

/**
 * Parse plugin source code into a Plugin object.
 * Plugins must define a 'plugin' variable with the Plugin interface structure.
 *
 * @param source - The plugin source code
 * @returns Parsed Plugin object
 * @throws Error if parsing or validation fails
 */
export function parsePlugin(source: string): Plugin {
  // Create a sandboxed environment for the plugin
  const sandbox = createSandbox();

  // Execute the source in the sandbox
  const result = executeInSandbox(source, sandbox);

  // Validate the result
  validatePluginDefinition(result);

  // Build the Plugin object with defaults
  const plugin: Plugin = {
    id: result.id || generatePluginId(result.name),
    name: result.name,
    version: result.version || "1.0.0",
    author: result.author || "Unknown",
    description: result.description || "No description",
    commands: result.commands,
    source: source,
  };

  return plugin;
}
