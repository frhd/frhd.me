/**
 * Text Adventure Engine
 * An interactive fiction game exploring a career journey in tech
 *
 * This file re-exports the modular adventure system for backwards compatibility.
 * See adventure/ directory for the actual implementations.
 */

// Re-export types
export type { Item, Exit, Room, AdventureState, CommandResult } from "./adventure";

// Re-export room utilities
export { getRoom } from "./adventure";

// Re-export state management
export { loadState, saveState, resetState, getCurrentRoom, getStats } from "./adventure";

// Re-export the main parser
export { parseCommand } from "./adventure";
