/**
 * Adventure Action Handlers
 * Implements all game actions (look, go, take, etc.)
 */

import type { AdventureState, CommandResult, Item } from "./types";
import { ROOMS, getTotalRoomCount } from "./rooms";
import { findItemById, findInventoryItem } from "./items";
import {
  getCurrentRoom,
  saveState,
  markRoomVisited,
  addToInventory,
  removeFromInventory,
  moveToRoom,
  canUnlockWisdom,
  INITIAL_STATE,
} from "./state";

/**
 * Look at the room or a specific target
 */
export function look(state: AdventureState, target: string): CommandResult {
  const room = getCurrentRoom(state);

  if (!target || target === "room" || target === "around") {
    // Look at room
    const output: string[] = [];

    output.push("");
    output.push(`\x1b[1;33m${room.name}\x1b[0m`);
    output.push("─".repeat(40));

    if (state.visitedRooms.includes(room.id) && room.shortDescription) {
      output.push(room.shortDescription);
    } else {
      output.push(room.description);
    }

    if (room.onLook) {
      output.push("");
      output.push(room.onLook);
    }

    // List items
    if (room.items.length > 0) {
      output.push("");
      output.push("You see:");
      room.items.forEach(item => {
        output.push(`  • \x1b[1;36m${item.name}\x1b[0m`);
      });
    }

    // List exits
    output.push("");
    output.push("Exits:");
    room.exits.forEach(exit => {
      const locked = exit.locked ? " [locked]" : "";
      output.push(
        `  • \x1b[1;32m${exit.direction}\x1b[0m${locked}${exit.description ? ` - ${exit.description}` : ""}`
      );
    });

    // Mark as visited
    if (!state.visitedRooms.includes(room.id)) {
      state = markRoomVisited(state, room.id);
      saveState(state);
    }

    return { output, newState: state };
  }

  // Look at specific item
  const item = room.items.find(
    i => i.name.toLowerCase().includes(target) || i.id.toLowerCase() === target
  );

  if (item) {
    return { output: [item.description], newState: state };
  }

  // Check inventory
  const invItem = findInventoryItem(state.inventory, target);

  if (invItem) {
    const item = findItemById(invItem);
    if (item) {
      return { output: [item.description], newState: state };
    }
  }

  return { output: [`You don't see any "${target}" here.`], newState: state };
}

/**
 * Move in a direction
 */
export function go(state: AdventureState, direction: string): CommandResult {
  if (!direction) {
    return { output: ["Go where? Try: north, south, east, west"], newState: state };
  }

  const room = getCurrentRoom(state);
  const exit = room.exits.find(
    e =>
      e.direction.toLowerCase() === direction.toLowerCase() ||
      e.direction.toLowerCase().startsWith(direction.toLowerCase())
  );

  if (!exit) {
    return { output: ["You can't go that way."], newState: state };
  }

  if (exit.locked) {
    if (exit.keyItem && state.inventory.includes(exit.keyItem)) {
      // Unlock with key item
      return {
        output: [`You use your ${exit.keyItem} to unlock the path.`],
        newState: state,
      };
    }

    // Check for wisdom unlock
    if (exit.keyItem === "wisdom" && canUnlockWisdom(state)) {
      state = { ...state, inventory: [...state.inventory, "wisdom"] };
      return {
        output: [
          "As you approach, you realize you've gathered enough experience.",
          "The path opens before you...",
          "",
          ...go(state, direction).output,
        ],
        newState: state,
      };
    }

    return {
      output: [
        "The path is locked.",
        "Perhaps you need to explore more and gain wisdom first...",
      ],
      newState: state,
    };
  }

  const newRoom = ROOMS[exit.roomId];
  if (!newRoom) {
    return { output: ["That path leads nowhere."], newState: state };
  }

  state = moveToRoom(state, exit.roomId);

  const output: string[] = [];

  if (newRoom.onEnter && !state.visitedRooms.includes(newRoom.id)) {
    output.push(newRoom.onEnter);
    output.push("");
  }

  const lookResult = look(state, "");
  state = lookResult.newState;
  output.push(...lookResult.output);

  saveState(state);
  return { output, newState: state };
}

/**
 * Take an item
 */
export function take(state: AdventureState, itemName: string): CommandResult {
  if (!itemName) {
    return { output: ["Take what?"], newState: state };
  }

  const room = getCurrentRoom(state);
  const itemIndex = room.items.findIndex(
    i =>
      i.name.toLowerCase().includes(itemName.toLowerCase()) ||
      i.id.toLowerCase() === itemName.toLowerCase()
  );

  if (itemIndex === -1) {
    return { output: [`You don't see any "${itemName}" here.`], newState: state };
  }

  const item = room.items[itemIndex];

  if (!item.canTake) {
    return { output: [`You can't take the ${item.name}.`], newState: state };
  }

  state = addToInventory(state, item.id);
  saveState(state);
  return { output: [`You take the ${item.name}.`], newState: state };
}

/**
 * Drop an item
 */
export function drop(state: AdventureState, itemName: string): CommandResult {
  if (!itemName) {
    return { output: ["Drop what?"], newState: state };
  }

  const itemId = findInventoryItem(state.inventory, itemName);

  if (!itemId) {
    return { output: [`You don't have any "${itemName}".`], newState: state };
  }

  // Find the original item definition
  let originalItem: Item | undefined = findItemById(itemId);

  if (!originalItem) {
    // Create a basic item if not found
    originalItem = {
      id: itemId,
      name: itemName,
      description: `A ${itemName}`,
      canTake: true,
    };
  }

  state = removeFromInventory(state, itemId);
  saveState(state);
  return { output: [`You drop the ${originalItem.name}.`], newState: state };
}

/**
 * Show inventory
 */
export function inventory(state: AdventureState): CommandResult {
  if (state.inventory.length === 0) {
    return { output: ["You're not carrying anything."], newState: state };
  }

  const output: string[] = ["You are carrying:"];

  state.inventory.forEach(id => {
    const item = findItemById(id);
    if (item) {
      output.push(`  • \x1b[1;36m${item.name}\x1b[0m`);
    } else if (id === "wisdom") {
      output.push(`  • \x1b[1;35mwisdom\x1b[0m - The knowledge gained from your journey`);
    } else {
      output.push(`  • ${id}`);
    }
  });

  return { output, newState: state };
}

/**
 * Examine an item (alias for look)
 */
export function examine(state: AdventureState, target: string): CommandResult {
  return look(state, target);
}

/**
 * Use an item
 */
export function handleUse(state: AdventureState, itemName: string): CommandResult {
  if (!itemName) {
    return { output: ["Use what?"], newState: state };
  }

  // Special case for wisdom
  if (itemName === "wisdom" && state.inventory.includes("wisdom")) {
    return {
      output: [
        "Your wisdom guides you. Use it to unlock the path north in the Open Source Gardens.",
      ],
      newState: state,
    };
  }

  const hasItem = state.inventory.some(id => id.toLowerCase().includes(itemName.toLowerCase()));

  if (!hasItem) {
    return { output: [`You don't have any "${itemName}".`], newState: state };
  }

  return {
    output: ["You're not sure how to use that here."],
    newState: state,
  };
}

/**
 * Show help
 */
export function help(state: AdventureState): CommandResult {
  return {
    output: [
      "",
      "\x1b[1;33mCommands:\x1b[0m",
      "─".repeat(30),
      "  look, l          - Look around or at something",
      "  go <direction>   - Move in a direction",
      "  n, s, e, w       - Shorthand for directions",
      "  take, get <item> - Pick up an item",
      "  drop <item>      - Drop an item",
      "  inventory, i     - See what you're carrying",
      "  examine <thing>  - Look closely at something",
      "  exits            - List available exits",
      "  help, ?          - Show this help",
      "",
      "\x1b[1;33mTips:\x1b[0m",
      "  • Explore everywhere",
      "  • Collect items - they may be useful",
      "  • Read room descriptions carefully",
      "",
    ],
    newState: state,
  };
}

/**
 * Show available exits
 */
export function exits(state: AdventureState): CommandResult {
  const room = getCurrentRoom(state);
  const output: string[] = ["Available exits:"];

  room.exits.forEach(exit => {
    const locked = exit.locked ? " \x1b[1;31m[locked]\x1b[0m" : "";
    output.push(`  • \x1b[1;32m${exit.direction}\x1b[0m${locked}`);
  });

  return { output, newState: state };
}

/**
 * Claim the final reward
 */
export function claimReward(state: AdventureState): CommandResult {
  state = {
    ...state,
    gameComplete: true,
  };
  saveState(state);

  return {
    output: [
      "",
      "═══════════════════════════════════════════════════════════════",
      "                    CONGRATULATIONS!",
      "═══════════════════════════════════════════════════════════════",
      "",
      "You've completed The Developer's Journey!",
      "",
      `  Total moves: ${state.moveCount}`,
      `  Items collected: ${state.inventory.length}`,
      `  Rooms explored: ${state.visitedRooms.length}/${getTotalRoomCount()}`,
      "",
      "The journey of a developer never truly ends. There's always",
      "more to learn, more to build, and more to share.",
      "",
      "Thank you for playing!",
      "",
      "\x1b[1;33m🏆 Achievement Unlocked: Journey Complete!\x1b[0m",
      "",
      "Type 'adventure reset' to play again, or 'exit' to return.",
      "",
      "═══════════════════════════════════════════════════════════════",
    ],
    newState: state,
  };
}

/**
 * Get the game start text
 */
export function getStartText(): string[] {
  return [
    "",
    "═══════════════════════════════════════════════════════════════",
    "                    THE DEVELOPER'S JOURNEY",
    "                 An Interactive Fiction Adventure",
    "═══════════════════════════════════════════════════════════════",
    "",
    "Every developer has a story. This is yours.",
    "",
    "Starting from humble beginnings in a childhood bedroom, you'll",
    "trace the path that led you to where you are today. Along the way,",
    "collect memories, learn lessons, and discover what it truly means",
    "to build things with code.",
    "",
    "Type 'help' for commands, or just start exploring!",
    "",
    "═══════════════════════════════════════════════════════════════",
    "",
    ...look({ ...INITIAL_STATE, gameStarted: true, visitedRooms: [] }, "").output,
  ];
}
