/**
 * Adventure Engine Types
 * Interfaces and types for the text adventure game system
 */

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

export interface CommandResult {
  output: string[];
  newState: AdventureState;
}

export type ActionHandler = (state: AdventureState, args: string) => CommandResult;
