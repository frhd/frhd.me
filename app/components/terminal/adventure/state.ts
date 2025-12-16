/**
 * Adventure State Management
 * Handles game state persistence and manipulation
 */

import type { AdventureState, Room } from "./types";
import { ROOMS } from "./rooms";

// Storage key for persistence
const STORAGE_KEY = "frhd-adventure-state";

// Initial game state
export const INITIAL_STATE: AdventureState = {
  currentRoom: "bedroom",
  inventory: [],
  visitedRooms: [],
  flags: {},
  moveCount: 0,
  gameStarted: false,
  gameComplete: false,
  takenItems: {},
};

/**
 * Load game state from localStorage
 */
export function loadState(): AdventureState {
  if (typeof window === "undefined") return { ...INITIAL_STATE };

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const state = JSON.parse(saved);
      // Ensure backward compatibility with old saves that don't have takenItems
      if (!state.takenItems) {
        state.takenItems = {};
      }
      return state;
    }
  } catch {
    console.error("Failed to load adventure state");
  }
  return { ...INITIAL_STATE };
}

/**
 * Save game state to localStorage
 */
export function saveState(state: AdventureState): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    console.error("Failed to save adventure state");
  }
}

/**
 * Reset game state to initial values
 */
export function resetState(): AdventureState {
  const state = { ...INITIAL_STATE };
  saveState(state);
  return state;
}

/**
 * Get current room with items filtered by taken items
 */
export function getCurrentRoom(state: AdventureState): Room {
  const baseRoom = ROOMS[state.currentRoom] || ROOMS.bedroom;
  const takenFromThisRoom = (state.takenItems && state.takenItems[baseRoom.id]) || [];

  // Return a copy of the room with items filtered to exclude taken ones
  return {
    ...baseRoom,
    items: baseRoom.items.filter(item => !takenFromThisRoom.includes(item.id)),
  };
}

/**
 * Mark a room as visited
 */
export function markRoomVisited(state: AdventureState, roomId: string): AdventureState {
  if (state.visitedRooms.includes(roomId)) {
    return state;
  }
  return {
    ...state,
    visitedRooms: [...state.visitedRooms, roomId],
  };
}

/**
 * Add item to inventory and track it as taken from current room
 */
export function addToInventory(state: AdventureState, itemId: string): AdventureState {
  const roomId = state.currentRoom;
  const currentTakenItems = state.takenItems || {};
  const takenFromRoom = currentTakenItems[roomId] || [];

  return {
    ...state,
    inventory: [...state.inventory, itemId],
    takenItems: {
      ...currentTakenItems,
      [roomId]: [...takenFromRoom, itemId],
    },
  };
}

/**
 * Remove item from inventory
 */
export function removeFromInventory(
  state: AdventureState,
  itemId: string
): AdventureState {
  const roomId = state.currentRoom;
  const currentTakenItems = state.takenItems || {};
  const takenFromRoom = currentTakenItems[roomId] || [];
  const newTakenItems = takenFromRoom.filter(id => id !== itemId);

  return {
    ...state,
    inventory: state.inventory.filter(id => id !== itemId),
    takenItems: {
      ...currentTakenItems,
      [roomId]: newTakenItems,
    },
  };
}

/**
 * Move to a new room
 */
export function moveToRoom(state: AdventureState, roomId: string): AdventureState {
  return {
    ...state,
    currentRoom: roomId,
    moveCount: state.moveCount + 1,
  };
}

/**
 * Check if player can unlock wisdom (visited enough places & collected key items)
 */
export function canUnlockWisdom(state: AdventureState): boolean {
  const requiredRooms = ["bigtech", "startup", "opensource"];
  const requiredItems = ["diploma", "laptop", "commit"];

  const hasVisitedAll = requiredRooms.every(r => state.visitedRooms.includes(r));
  const hasRequiredItems = requiredItems.every(i => state.inventory.includes(i));

  return hasVisitedAll && hasRequiredItems;
}

/**
 * Get game statistics
 */
export function getStats(state: AdventureState): Record<string, number | boolean> {
  return {
    moveCount: state.moveCount,
    itemsCollected: state.inventory.length,
    roomsVisited: state.visitedRooms.length,
    totalRooms: Object.keys(ROOMS).length,
    gameComplete: state.gameComplete,
  };
}
