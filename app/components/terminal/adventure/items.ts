/**
 * Adventure Item Utilities
 * Helper functions for working with items in the adventure game
 */

import type { Item } from "./types";
import { ROOMS } from "./rooms";

/**
 * Find an item by ID across all rooms
 */
export function findItemById(itemId: string): Item | undefined {
  for (const room of Object.values(ROOMS)) {
    const item = room.items.find(i => i.id === itemId);
    if (item) {
      return item;
    }
  }
  return undefined;
}

/**
 * Find an item by name (partial match) across all rooms
 */
export function findItemByName(name: string): Item | undefined {
  const lowerName = name.toLowerCase();
  for (const room of Object.values(ROOMS)) {
    const item = room.items.find(
      i => i.name.toLowerCase().includes(lowerName) || i.id.toLowerCase() === lowerName
    );
    if (item) {
      return item;
    }
  }
  return undefined;
}

/**
 * Get all items from a specific room
 */
export function getItemsInRoom(roomId: string): Item[] {
  const room = ROOMS[roomId];
  return room ? [...room.items] : [];
}

/**
 * Find item in inventory by name
 */
export function findInventoryItem(
  inventory: string[],
  itemName: string
): string | undefined {
  const lowerName = itemName.toLowerCase();
  return inventory.find(id => {
    const item = findItemById(id);
    return (
      item?.name.toLowerCase().includes(lowerName) || id.toLowerCase() === lowerName
    );
  });
}

/**
 * Get item display name from ID
 */
export function getItemName(itemId: string): string {
  const item = findItemById(itemId);
  return item?.name || itemId;
}

/**
 * Create a basic item definition (used for dropped items)
 */
export function createBasicItem(id: string, name: string): Item {
  return {
    id,
    name,
    description: `A ${name}`,
    canTake: true,
  };
}
