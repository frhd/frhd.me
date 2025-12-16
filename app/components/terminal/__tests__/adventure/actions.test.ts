import { describe, it, expect, beforeEach, vi } from "vitest";
import { look, go, take, drop, inventory, help, exits } from "../../adventure/actions";
import type { AdventureState } from "../../adventure/types";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
});

describe("adventure/actions", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  const createState = (overrides: Partial<AdventureState> = {}): AdventureState => ({
    currentRoom: "bedroom",
    inventory: [],
    visitedRooms: [],
    flags: {},
    moveCount: 0,
    gameStarted: true,
    gameComplete: false,
    takenItems: {},
    ...overrides,
  });

  describe("look", () => {
    it("displays room name and description", () => {
      const state = createState();
      const result = look(state, "");

      const output = result.output.join("\n");
      expect(output).toContain("Your Childhood Bedroom");
    });

    it("shows items in the room", () => {
      const state = createState();
      const result = look(state, "");

      const output = result.output.join("\n");
      expect(output).toContain("floppy disk");
      expect(output).toContain("BASIC manual");
    });

    it("shows available exits", () => {
      const state = createState();
      const result = look(state, "");

      const output = result.output.join("\n");
      expect(output).toContain("north");
    });

    it("can look at a specific item", () => {
      const state = createState();
      const result = look(state, "floppy");

      expect(result.output[0]).toContain("3.5\"");
    });

    it("shows short description for visited rooms", () => {
      const state = createState({ visitedRooms: ["bedroom"] });
      const result = look(state, "");

      const output = result.output.join("\n");
      expect(output).toContain("childhood bedroom with an old computer");
    });
  });

  describe("go", () => {
    it("moves to an adjacent room", () => {
      const state = createState();
      const result = go(state, "north");

      expect(result.newState.currentRoom).toBe("hallway");
      expect(result.newState.moveCount).toBe(1);
    });

    it("shows error for invalid direction", () => {
      const state = createState();
      const result = go(state, "east");

      expect(result.output).toContain("You can't go that way.");
      expect(result.newState.currentRoom).toBe("bedroom");
    });

    it("shows error when no direction specified", () => {
      const state = createState();
      const result = go(state, "");

      expect(result.output).toContain("Go where? Try: north, south, east, west");
    });

    it("shows onEnter message for new rooms", () => {
      const state = createState();
      const result = go(state, "north");

      // Hallway doesn't have onEnter, but should show room description
      const output = result.output.join("\n");
      expect(output).toContain("The Hallway of Decisions");
    });
  });

  describe("take", () => {
    it("picks up an item from the room", () => {
      const state = createState();
      const result = take(state, "floppy");

      expect(result.newState.inventory).toContain("floppy");
      expect(result.output[0]).toContain("You take the floppy disk");
    });

    it("shows error for nonexistent item", () => {
      const state = createState();
      const result = take(state, "sword");

      expect(result.output[0]).toContain('You don\'t see any "sword" here');
    });

    it("shows error when no item specified", () => {
      const state = createState();
      const result = take(state, "");

      expect(result.output).toContain("Take what?");
    });

    it("tracks taken items in takenItems", () => {
      const state = createState();
      const result = take(state, "floppy");

      expect(result.newState.takenItems.bedroom).toContain("floppy");
    });
  });

  describe("drop", () => {
    it("removes item from inventory", () => {
      const state = createState({
        inventory: ["floppy"],
        takenItems: { bedroom: ["floppy"] },
      });
      const result = drop(state, "floppy");

      expect(result.newState.inventory).not.toContain("floppy");
      expect(result.output[0]).toContain("You drop the floppy disk");
    });

    it("shows error when not carrying item", () => {
      const state = createState();
      const result = drop(state, "sword");

      expect(result.output[0]).toContain('You don\'t have any "sword"');
    });

    it("shows error when no item specified", () => {
      const state = createState();
      const result = drop(state, "");

      expect(result.output).toContain("Drop what?");
    });
  });

  describe("inventory", () => {
    it("shows empty inventory message", () => {
      const state = createState();
      const result = inventory(state);

      expect(result.output).toContain("You're not carrying anything.");
    });

    it("lists items when carrying", () => {
      const state = createState({ inventory: ["floppy", "manual"] });
      const result = inventory(state);

      const output = result.output.join("\n");
      expect(output).toContain("You are carrying:");
      expect(output).toContain("floppy disk");
      expect(output).toContain("BASIC manual");
    });

    it("shows wisdom item specially", () => {
      const state = createState({ inventory: ["wisdom"] });
      const result = inventory(state);

      const output = result.output.join("\n");
      expect(output).toContain("wisdom");
      expect(output).toContain("knowledge gained");
    });
  });

  describe("help", () => {
    it("lists available commands", () => {
      const state = createState();
      const result = help(state);

      const output = result.output.join("\n");
      expect(output).toContain("Commands:");
      expect(output).toContain("look");
      expect(output).toContain("go");
      expect(output).toContain("take");
      expect(output).toContain("inventory");
    });

    it("includes tips", () => {
      const state = createState();
      const result = help(state);

      const output = result.output.join("\n");
      expect(output).toContain("Tips:");
      expect(output).toContain("Explore everywhere");
    });
  });

  describe("exits", () => {
    it("lists available exits for current room", () => {
      const state = createState({ currentRoom: "hallway" });
      const result = exits(state);

      const output = result.output.join("\n");
      expect(output).toContain("Available exits:");
      expect(output).toContain("north");
      expect(output).toContain("south");
      expect(output).toContain("east");
      expect(output).toContain("west");
    });

    it("shows locked exits", () => {
      const state = createState({ currentRoom: "opensource" });
      const result = exits(state);

      const output = result.output.join("\n");
      expect(output).toContain("[locked]");
    });
  });
});
