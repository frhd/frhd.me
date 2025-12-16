/**
 * Plugin Storage
 *
 * Handles persistence of plugins to localStorage.
 */

import type { Plugin, StoredPlugin } from "./types";

/** Storage key for installed plugins */
const PLUGINS_STORAGE_KEY = "frhd-terminal-plugins";

/**
 * Check if we're in a browser environment
 */
function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/**
 * Load stored plugins from localStorage
 *
 * @returns Array of stored plugins, or empty array if none
 */
export function loadStoredPlugins(): StoredPlugin[] {
  if (!isBrowser()) return [];

  try {
    const stored = localStorage.getItem(PLUGINS_STORAGE_KEY);
    if (!stored) return [];

    return JSON.parse(stored) as StoredPlugin[];
  } catch (e) {
    console.error("Failed to load plugins from localStorage:", e);
    return [];
  }
}

/**
 * Save plugins to localStorage
 *
 * @param plugins - Map of plugin ID to Plugin object
 */
export function savePlugins(plugins: Map<string, Plugin>): void {
  if (!isBrowser()) return;

  try {
    const storedPlugins: StoredPlugin[] = [];
    for (const plugin of plugins.values()) {
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
 * Clear all stored plugins from localStorage
 */
export function clearStoredPlugins(): void {
  if (!isBrowser()) return;

  try {
    localStorage.removeItem(PLUGINS_STORAGE_KEY);
  } catch (e) {
    console.error("Failed to clear plugins from localStorage:", e);
  }
}

/**
 * Get the storage key (for testing purposes)
 */
export function getStorageKey(): string {
  return PLUGINS_STORAGE_KEY;
}
