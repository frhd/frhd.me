/**
 * Adventure Engine
 * Modular text adventure game system
 */

// Re-export types
export type { Item, Exit, Room, AdventureState, CommandResult, ActionHandler } from "./types";

// Re-export room utilities
export { ROOMS, getRoom, getTotalRoomCount } from "./rooms";

// Re-export item utilities
export {
  findItemById,
  findItemByName,
  getItemsInRoom,
  findInventoryItem,
  getItemName,
  createBasicItem,
} from "./items";

// Re-export state management
export {
  INITIAL_STATE,
  loadState,
  saveState,
  resetState,
  getCurrentRoom,
  markRoomVisited,
  addToInventory,
  removeFromInventory,
  moveToRoom,
  canUnlockWisdom,
  getStats,
} from "./state";

// Re-export actions
export {
  look,
  go,
  take,
  drop,
  inventory,
  examine,
  handleUse,
  help,
  exits,
  claimReward,
  getStartText,
} from "./actions";

// Re-export parser
export {
  parseCommand,
  parseVerb,
  parseArgs,
  isDirection,
  normalizeDirection,
} from "./parser";
