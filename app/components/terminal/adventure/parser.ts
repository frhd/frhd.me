/**
 * Adventure Command Parser
 * Parses and routes adventure game commands
 */

import type { AdventureState, CommandResult } from "./types";
import { saveState } from "./state";
import {
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

/**
 * Parse and execute a command
 */
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

/**
 * Parse verb from input
 */
export function parseVerb(input: string): string {
  return input.toLowerCase().trim().split(/\s+/)[0] || "";
}

/**
 * Parse arguments from input (everything after the verb)
 */
export function parseArgs(input: string): string {
  const parts = input.toLowerCase().trim().split(/\s+/);
  return parts.slice(1).join(" ");
}

/**
 * Check if a command is a valid direction
 */
export function isDirection(input: string): boolean {
  const directions = ["north", "south", "east", "west", "n", "s", "e", "w"];
  return directions.includes(input.toLowerCase().trim());
}

/**
 * Normalize direction shorthand to full direction name
 */
export function normalizeDirection(input: string): string {
  const shortToFull: Record<string, string> = {
    n: "north",
    s: "south",
    e: "east",
    w: "west",
  };
  const lower = input.toLowerCase().trim();
  return shortToFull[lower] || lower;
}
