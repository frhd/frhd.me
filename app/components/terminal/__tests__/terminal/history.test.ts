import { describe, it, expect } from "vitest";
import {
  createHistoryState,
  addToHistory,
  navigateHistoryUp,
  navigateHistoryDown,
  resetHistoryIndex,
} from "../../terminal/history";

describe("history", () => {
  describe("createHistoryState", () => {
    it("creates empty history state", () => {
      const state = createHistoryState();
      expect(state.history).toEqual([]);
      expect(state.historyIndex).toBe(-1);
    });
  });

  describe("addToHistory", () => {
    it("adds command to history", () => {
      const state = createHistoryState();
      const newState = addToHistory(state, "ls");
      expect(newState.history).toEqual(["ls"]);
      expect(newState.historyIndex).toBe(1);
    });

    it("appends to existing history", () => {
      const state = { history: ["ls"], historyIndex: 1 };
      const newState = addToHistory(state, "cd");
      expect(newState.history).toEqual(["ls", "cd"]);
      expect(newState.historyIndex).toBe(2);
    });

    it("does not mutate original state", () => {
      const state = { history: ["ls"], historyIndex: 1 };
      addToHistory(state, "cd");
      expect(state.history).toEqual(["ls"]);
    });
  });

  describe("navigateHistoryUp", () => {
    it("navigates to previous item", () => {
      const state = { history: ["ls", "cd", "pwd"], historyIndex: 3 };
      const result = navigateHistoryUp(state);
      expect(result.state.historyIndex).toBe(2);
      expect(result.command).toBe("pwd");
    });

    it("continues navigating up", () => {
      const state = { history: ["ls", "cd", "pwd"], historyIndex: 2 };
      const result = navigateHistoryUp(state);
      expect(result.state.historyIndex).toBe(1);
      expect(result.command).toBe("cd");
    });

    it("stops at beginning", () => {
      const state = { history: ["ls"], historyIndex: 0 };
      const result = navigateHistoryUp(state);
      expect(result.state.historyIndex).toBe(0);
      expect(result.command).toBeUndefined();
    });

    it("returns undefined command when at start", () => {
      const state = { history: ["ls"], historyIndex: 0 };
      const result = navigateHistoryUp(state);
      expect(result.command).toBeUndefined();
    });
  });

  describe("navigateHistoryDown", () => {
    it("navigates to next item", () => {
      const state = { history: ["ls", "cd", "pwd"], historyIndex: 0 };
      const result = navigateHistoryDown(state);
      expect(result.state.historyIndex).toBe(1);
      expect(result.command).toBe("cd");
    });

    it("returns empty string at end of history", () => {
      const state = { history: ["ls", "cd"], historyIndex: 1 };
      const result = navigateHistoryDown(state);
      expect(result.state.historyIndex).toBe(2);
      expect(result.command).toBe("");
    });

    it("does nothing when past end of history", () => {
      const state = { history: ["ls"], historyIndex: 2 };
      const result = navigateHistoryDown(state);
      expect(result.state.historyIndex).toBe(2);
      expect(result.command).toBeUndefined();
    });
  });

  describe("resetHistoryIndex", () => {
    it("resets index to end of history", () => {
      const state = { history: ["ls", "cd", "pwd"], historyIndex: 0 };
      const newState = resetHistoryIndex(state);
      expect(newState.historyIndex).toBe(3);
    });

    it("preserves history array", () => {
      const state = { history: ["ls", "cd"], historyIndex: 0 };
      const newState = resetHistoryIndex(state);
      expect(newState.history).toEqual(["ls", "cd"]);
    });
  });
});
