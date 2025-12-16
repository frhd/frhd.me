/**
 * Text Adventure Engine
 * An interactive fiction game exploring a career journey in tech
 */

// Types for the adventure system
export interface Item {
  id: string;
  name: string;
  description: string;
  canTake: boolean;
  useWith?: string; // Item ID it can be used with
  useResult?: string; // Message when used correctly
}

export interface Exit {
  direction: string;
  roomId: string;
  description?: string;
  locked?: boolean;
  keyItem?: string; // Item ID needed to unlock
}

export interface Room {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  items: Item[];
  exits: Exit[];
  visited: boolean;
  onEnter?: string; // Special message when entering
  onLook?: string; // Additional details when looking
}

export interface AdventureState {
  currentRoom: string;
  inventory: string[]; // Item IDs
  visitedRooms: string[];
  flags: Record<string, boolean>;
  moveCount: number;
  gameStarted: boolean;
  gameComplete: boolean;
  takenItems: Record<string, string[]>; // roomId -> item IDs taken from that room
}

// Storage key for persistence
const STORAGE_KEY = "frhd-adventure-state";

// Initial game state
const INITIAL_STATE: AdventureState = {
  currentRoom: "bedroom",
  inventory: [],
  visitedRooms: [],
  flags: {},
  moveCount: 0,
  gameStarted: false,
  gameComplete: false,
  takenItems: {},
};

// Room definitions - A journey through a tech career
const ROOMS: Record<string, Room> = {
  bedroom: {
    id: "bedroom",
    name: "Your Childhood Bedroom",
    description: `You're in a small bedroom filled with the warm glow of nostalgia. An old desktop
computer sits on a cluttered desk, its CRT monitor displaying a blinking cursor. Posters of video
games and sci-fi movies cover the walls. A window shows the fading light of a late afternoon.

This is where it all began - where you first learned that computers could do more than play games.`,
    shortDescription: "Your childhood bedroom with an old computer.",
    items: [
      {
        id: "floppy",
        name: "floppy disk",
        description: "A 3.5\" floppy disk labeled 'My First Program'",
        canTake: true,
      },
      {
        id: "manual",
        name: "BASIC manual",
        description: "A well-worn programming manual with coffee stains and margin notes",
        canTake: true,
      },
    ],
    exits: [
      { direction: "north", roomId: "hallway", description: "A hallway leads north" },
    ],
    visited: false,
    onEnter: "Memories flood back as you take in the familiar surroundings...",
  },

  hallway: {
    id: "hallway",
    name: "The Hallway of Decisions",
    description: `A long hallway stretches before you, its walls lined with doors. Each door has
a small plaque. To the east is "School", to the west is "The Garage", and to the north the
hallway continues toward a bright light labeled "The Future".`,
    shortDescription: "A hallway with several doors.",
    items: [],
    exits: [
      { direction: "south", roomId: "bedroom", description: "Your bedroom is to the south" },
      { direction: "east", roomId: "school", description: "The School door" },
      { direction: "west", roomId: "garage", description: "The Garage door" },
      { direction: "north", roomId: "university", description: "Towards The Future" },
    ],
    visited: false,
  },

  school: {
    id: "school",
    name: "The Computer Lab",
    description: `Rows of chunky beige computers fill this room, their fans humming in unison.
A friendly teacher nods at you from behind a desk cluttered with cables and software boxes.

"Feel free to explore," they say. "The best way to learn is by doing."

A bulletin board displays notices about programming competitions and tech clubs.`,
    shortDescription: "A school computer lab with rows of old PCs.",
    items: [
      {
        id: "certificate",
        name: "programming certificate",
        description: "A certificate from a coding competition - 'First Place'",
        canTake: true,
      },
    ],
    exits: [
      { direction: "west", roomId: "hallway", description: "Back to the hallway" },
    ],
    visited: false,
    onEnter: "The familiar smell of warm electronics fills your nostrils.",
  },

  garage: {
    id: "garage",
    name: "The Startup Garage",
    description: `A converted garage that serves as a makeshift office. Whiteboards covered in
diagrams and sticky notes line the walls. Pizza boxes are stacked in one corner, and the hum
of multiple servers fills the air.

A sign on the wall reads: "Move Fast and Build Things"

This is where side projects become real products.`,
    shortDescription: "A garage converted into a startup workspace.",
    items: [
      {
        id: "laptop",
        name: "vintage laptop",
        description: "A ThinkPad covered in conference stickers - your first 'real' dev machine",
        canTake: true,
      },
      {
        id: "whiteboard-marker",
        name: "whiteboard marker",
        description: "A blue marker that's seen countless architecture diagrams",
        canTake: true,
      },
    ],
    exits: [
      { direction: "east", roomId: "hallway", description: "Back to the hallway" },
    ],
    visited: false,
    onEnter: "The entrepreneurial spirit is palpable here.",
  },

  university: {
    id: "university",
    name: "The University Campus",
    description: `A sprawling campus stretches before you. Students hurry between buildings,
some carrying thick textbooks, others with laptops. A grand library rises in the distance.

To the east is the Computer Science building, and to the north lies the path to the professional
world beyond.`,
    shortDescription: "A university campus with paths in multiple directions.",
    items: [
      {
        id: "diploma",
        name: "diploma",
        description: "A framed diploma in Computer Science - hard-earned knowledge",
        canTake: true,
      },
    ],
    exits: [
      { direction: "south", roomId: "hallway", description: "Back to the hallway" },
      { direction: "east", roomId: "csbuilding", description: "The CS building" },
      { direction: "north", roomId: "crossroads", description: "The path forward" },
    ],
    visited: false,
  },

  csbuilding: {
    id: "csbuilding",
    name: "Computer Science Building",
    description: `The CS building buzzes with activity. Through open doors you see students
debugging code, professors gesturing at whiteboards, and TAs helping with homework.

A vending machine in the corner promises caffeine and sugar. A poster advertises
"Algorithm Design: Where Theory Meets Practice."`,
    shortDescription: "The Computer Science department building.",
    items: [
      {
        id: "algorithm-book",
        name: "algorithms textbook",
        description: "Introduction to Algorithms - the bible of CS",
        canTake: true,
      },
    ],
    exits: [
      { direction: "west", roomId: "university", description: "Back to campus" },
    ],
    visited: false,
    onLook: "You notice students collaborating on projects in study rooms.",
  },

  crossroads: {
    id: "crossroads",
    name: "The Career Crossroads",
    description: `You stand at a crossroads. Multiple paths branch out before you, each
representing a different career direction.

To the east lies "Big Tech Corp" - stability, resources, and established processes.
To the west is "Startup Valley" - risk, innovation, and the unknown.
To the north glows "Open Source Gardens" - community, collaboration, and contribution.`,
    shortDescription: "A crossroads with paths to different career directions.",
    items: [],
    exits: [
      { direction: "south", roomId: "university", description: "Back to university" },
      { direction: "east", roomId: "bigtech", description: "Big Tech Corp" },
      { direction: "west", roomId: "startup", description: "Startup Valley" },
      { direction: "north", roomId: "opensource", description: "Open Source Gardens" },
    ],
    visited: false,
    onEnter: "Every path has its own rewards and challenges...",
  },

  bigtech: {
    id: "bigtech",
    name: "Big Tech Corp",
    description: `A sleek, modern office building with floor-to-ceiling windows. Engineers
work at standing desks with multiple monitors. The cafeteria serves gourmet food, and
every meeting room has a quirky name.

A plaque on the wall reads: "Scaling to Billions"

The work here reaches millions of users every day.`,
    shortDescription: "A modern corporate tech office.",
    items: [
      {
        id: "badge",
        name: "employee badge",
        description: "A corporate badge - access to resources and mentorship",
        canTake: true,
      },
    ],
    exits: [
      { direction: "west", roomId: "crossroads", description: "Back to crossroads" },
    ],
    visited: false,
    onEnter: "The scale of impact here is impressive.",
  },

  startup: {
    id: "startup",
    name: "Startup Valley",
    description: `A co-working space filled with energy and chaos. Founders pitch to investors
in one corner while developers ship features at breakneck speed in another. A ping pong
table serves as a conference room.

A banner declares: "Build. Measure. Learn."

The potential for creation is unlimited here, but so is the uncertainty.`,
    shortDescription: "A chaotic but energetic startup space.",
    items: [
      {
        id: "equity",
        name: "stock options",
        description: "A stock option agreement - a bet on the future",
        canTake: true,
      },
    ],
    exits: [
      { direction: "east", roomId: "crossroads", description: "Back to crossroads" },
    ],
    visited: false,
    onEnter: "The entrepreneurial energy is infectious!",
  },

  opensource: {
    id: "opensource",
    name: "Open Source Gardens",
    description: `A beautiful garden where code grows on digital trees. Contributors from
around the world tend to projects, fixing bugs like weeding and adding features like
planting new flowers.

A sign reads: "Given enough eyeballs, all bugs are shallow."

In the center stands a fountain with the words "Free as in Freedom" inscribed.`,
    shortDescription: "A collaborative garden of open source projects.",
    items: [
      {
        id: "commit",
        name: "merged PR",
        description: "A commemorative plaque for your first merged pull request",
        canTake: true,
      },
    ],
    exits: [
      { direction: "south", roomId: "crossroads", description: "Back to crossroads" },
      { direction: "north", roomId: "summit", description: "The path to the summit", locked: true, keyItem: "wisdom" },
    ],
    visited: false,
    onEnter: "You feel connected to developers around the world.",
  },

  summit: {
    id: "summit",
    name: "The Summit",
    description: `You've reached the summit - not of a mountain, but of understanding. From
here, you can see all the paths you've traveled: the bedroom where curiosity sparked,
the school where skills were honed, the crossroads where decisions were made.

A terminal sits on a stone pedestal, its screen displaying:

    ┌──────────────────────────────────────────┐
    │                                          │
    │   The journey never really ends.         │
    │   Technology evolves, and so do we.      │
    │                                          │
    │   Keep learning. Keep building.          │
    │   Keep sharing what you know.            │
    │                                          │
    │   Type 'claim reward' to complete        │
    │   your journey.                          │
    │                                          │
    └──────────────────────────────────────────┘

You've gathered wisdom from every path - now it's time to share your own story.`,
    shortDescription: "The summit - where all paths converge.",
    items: [],
    exits: [
      { direction: "south", roomId: "opensource", description: "Back down" },
    ],
    visited: false,
    onEnter: "You feel a sense of accomplishment wash over you.",
  },
};

// Helper functions
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

export function saveState(state: AdventureState): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    console.error("Failed to save adventure state");
  }
}

export function resetState(): AdventureState {
  const state = { ...INITIAL_STATE };
  saveState(state);
  return state;
}

export function getRoom(roomId: string): Room | undefined {
  return ROOMS[roomId];
}

export function getCurrentRoom(state: AdventureState): Room {
  const baseRoom = ROOMS[state.currentRoom] || ROOMS.bedroom;
  const takenFromThisRoom = (state.takenItems && state.takenItems[baseRoom.id]) || [];

  // Return a copy of the room with items filtered to exclude taken ones
  return {
    ...baseRoom,
    items: baseRoom.items.filter(item => !takenFromThisRoom.includes(item.id)),
  };
}

// Check if player can collect "wisdom" (visited enough places & collected key items)
function canUnlockWisdom(state: AdventureState): boolean {
  const requiredRooms = ["bigtech", "startup", "opensource"];
  const requiredItems = ["diploma", "laptop", "commit"];

  const hasVisitedAll = requiredRooms.every(r => state.visitedRooms.includes(r));
  const hasRequiredItems = requiredItems.every(i => state.inventory.includes(i));

  return hasVisitedAll && hasRequiredItems;
}

// Command parsing and execution
export interface CommandResult {
  output: string[];
  newState: AdventureState;
}

export function parseCommand(input: string, state: AdventureState): CommandResult {
  const parts = input.toLowerCase().trim().split(/\s+/);
  const verb = parts[0];
  const rest = parts.slice(1).join(" ");

  // Handle game not started
  if (!state.gameStarted) {
    state = { ...state, gameStarted: true };
    saveState(state);
    return {
      output: getStartText(),
      newState: state,
    };
  }

  // Handle game complete
  if (state.gameComplete) {
    return {
      output: ["Your adventure is complete! Type 'adventure reset' to play again."],
      newState: state,
    };
  }

  switch (verb) {
    case "look":
    case "l":
      return look(state, rest);
    case "go":
    case "walk":
    case "move":
      return go(state, rest);
    case "north":
    case "n":
      return go(state, "north");
    case "south":
    case "s":
      return go(state, "south");
    case "east":
    case "e":
      return go(state, "east");
    case "west":
    case "w":
      return go(state, "west");
    case "take":
    case "get":
    case "grab":
      return take(state, rest);
    case "drop":
      return drop(state, rest);
    case "inventory":
    case "inv":
    case "i":
      return inventory(state);
    case "examine":
    case "x":
    case "inspect":
      return examine(state, rest);
    case "use":
      return handleUse(state, rest);
    case "help":
    case "?":
      return help(state);
    case "exits":
      return exits(state);
    case "claim":
      if (rest === "reward" && state.currentRoom === "summit") {
        return claimReward(state);
      }
      return { output: ["Claim what?"], newState: state };
    default:
      return {
        output: [`I don't understand "${verb}". Type 'help' for commands.`],
        newState: state,
      };
  }
}

function getStartText(): string[] {
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

function look(state: AdventureState, target: string): CommandResult {
  const room = getCurrentRoom(state);

  if (!target || target === "room" || target === "around") {
    // Look at room
    const output: string[] = [];

    output.push("");
    output.push(`\x1b[1;33m${room.name}\x1b[0m`);
    output.push("─".repeat(40));

    if (room.visited && room.shortDescription) {
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
      output.push(`  • \x1b[1;32m${exit.direction}\x1b[0m${locked}${exit.description ? ` - ${exit.description}` : ""}`);
    });

    // Mark as visited
    if (!state.visitedRooms.includes(room.id)) {
      state = {
        ...state,
        visitedRooms: [...state.visitedRooms, room.id],
      };
      saveState(state);
    }

    return { output, newState: state };
  }

  // Look at specific item
  const item = room.items.find(i =>
    i.name.toLowerCase().includes(target) || i.id.toLowerCase() === target
  );

  if (item) {
    return { output: [item.description], newState: state };
  }

  // Check inventory
  const invItem = state.inventory.find(id => {
    const r = Object.values(ROOMS).find(rm => rm.items.some(i => i.id === id));
    const i = r?.items.find(it => it.id === id);
    return i?.name.toLowerCase().includes(target) || id.toLowerCase() === target;
  });

  if (invItem) {
    const r = Object.values(ROOMS).find(rm => rm.items.some(i => i.id === invItem));
    const item = r?.items.find(i => i.id === invItem);
    if (item) {
      return { output: [item.description], newState: state };
    }
  }

  return { output: [`You don't see any "${target}" here.`], newState: state };
}

function go(state: AdventureState, direction: string): CommandResult {
  if (!direction) {
    return { output: ["Go where? Try: north, south, east, west"], newState: state };
  }

  const room = getCurrentRoom(state);
  const exit = room.exits.find(e =>
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
      newState: state
    };
  }

  const newRoom = ROOMS[exit.roomId];
  if (!newRoom) {
    return { output: ["That path leads nowhere."], newState: state };
  }

  state = {
    ...state,
    currentRoom: exit.roomId,
    moveCount: state.moveCount + 1,
  };

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

function take(state: AdventureState, itemName: string): CommandResult {
  if (!itemName) {
    return { output: ["Take what?"], newState: state };
  }

  const room = getCurrentRoom(state);
  const itemIndex = room.items.findIndex(i =>
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

  // Track taken item and add to inventory (without mutating ROOMS)
  const roomId = state.currentRoom;
  const currentTakenItems = state.takenItems || {};
  const takenFromRoom = currentTakenItems[roomId] || [];

  state = {
    ...state,
    inventory: [...state.inventory, item.id],
    takenItems: {
      ...currentTakenItems,
      [roomId]: [...takenFromRoom, item.id],
    },
  };

  saveState(state);
  return { output: [`You take the ${item.name}.`], newState: state };
}

function drop(state: AdventureState, itemName: string): CommandResult {
  if (!itemName) {
    return { output: ["Drop what?"], newState: state };
  }

  const itemId = state.inventory.find(id => {
    const r = Object.values(ROOMS).find(rm => rm.items.some(i => i.id === id));
    const i = r?.items.find(it => it.id === id);
    return i?.name.toLowerCase().includes(itemName.toLowerCase()) || id.toLowerCase() === itemName.toLowerCase();
  });

  if (!itemId) {
    return { output: [`You don't have any "${itemName}".`], newState: state };
  }

  // Find the original item definition
  let originalItem: Item | undefined;
  for (const room of Object.values(ROOMS)) {
    const found = room.items.find(i => i.id === itemId);
    if (found) {
      originalItem = { ...found };
      break;
    }
  }

  if (!originalItem) {
    // Create a basic item if not found
    originalItem = {
      id: itemId,
      name: itemName,
      description: `A ${itemName}`,
      canTake: true,
    };
  }

  // Remove from takenItems for current room (so it appears in the room again)
  const roomId = state.currentRoom;
  const currentTakenItems = state.takenItems || {};
  const takenFromRoom = currentTakenItems[roomId] || [];
  const newTakenItems = takenFromRoom.filter(id => id !== itemId);

  state = {
    ...state,
    inventory: state.inventory.filter(id => id !== itemId),
    takenItems: {
      ...currentTakenItems,
      [roomId]: newTakenItems,
    },
  };

  saveState(state);
  return { output: [`You drop the ${originalItem.name}.`], newState: state };
}

function inventory(state: AdventureState): CommandResult {
  if (state.inventory.length === 0) {
    return { output: ["You're not carrying anything."], newState: state };
  }

  const output: string[] = ["You are carrying:"];

  state.inventory.forEach(id => {
    // Find item name
    for (const room of Object.values(ROOMS)) {
      const item = room.items.find(i => i.id === id);
      if (item) {
        output.push(`  • \x1b[1;36m${item.name}\x1b[0m`);
        return;
      }
    }
    // Handle wisdom special item
    if (id === "wisdom") {
      output.push(`  • \x1b[1;35mwisdom\x1b[0m - The knowledge gained from your journey`);
    } else {
      output.push(`  • ${id}`);
    }
  });

  return { output, newState: state };
}

function examine(state: AdventureState, target: string): CommandResult {
  return look(state, target);
}

function handleUse(state: AdventureState, itemName: string): CommandResult {
  if (!itemName) {
    return { output: ["Use what?"], newState: state };
  }

  // Special case for wisdom
  if (itemName === "wisdom" && state.inventory.includes("wisdom")) {
    return {
      output: ["Your wisdom guides you. Use it to unlock the path north in the Open Source Gardens."],
      newState: state
    };
  }

  const hasItem = state.inventory.some(id =>
    id.toLowerCase().includes(itemName.toLowerCase())
  );

  if (!hasItem) {
    return { output: [`You don't have any "${itemName}".`], newState: state };
  }

  return {
    output: ["You're not sure how to use that here."],
    newState: state
  };
}

function help(state: AdventureState): CommandResult {
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

function exits(state: AdventureState): CommandResult {
  const room = getCurrentRoom(state);
  const output: string[] = ["Available exits:"];

  room.exits.forEach(exit => {
    const locked = exit.locked ? " \x1b[1;31m[locked]\x1b[0m" : "";
    output.push(`  • \x1b[1;32m${exit.direction}\x1b[0m${locked}`);
  });

  return { output, newState: state };
}

function claimReward(state: AdventureState): CommandResult {
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
      `  Rooms explored: ${state.visitedRooms.length}/${Object.keys(ROOMS).length}`,
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

// Get game statistics
export function getStats(state: AdventureState): Record<string, number | boolean> {
  return {
    moveCount: state.moveCount,
    itemsCollected: state.inventory.length,
    roomsVisited: state.visitedRooms.length,
    totalRooms: Object.keys(ROOMS).length,
    gameComplete: state.gameComplete,
  };
}
