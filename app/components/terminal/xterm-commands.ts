/**
 * Terminal Commands - Thin Wrapper
 *
 * This file re-exports from the modular commands system for backwards compatibility.
 * The actual command implementations are in the commands/ directory.
 *
 * @deprecated Import from './commands' instead for direct access to the modular system.
 */

export {
  executeCommand,
  getCrtEnabled,
  isInAdventureMode,
  executeAdventureInput,
} from "./commands";

// Re-export commonly used utilities from other modules for backwards compatibility
export { isSoundEnabled, isMusicEnabled } from "./sound-manager";
export { unlockAchievement } from "./achievements";
