import { describe, it, expect } from "vitest";
import {
  builtinCommands,
  completeCommand,
  findCommonPrefix,
} from "../../terminal/completion";

describe("completion", () => {
  describe("builtinCommands", () => {
    it("contains essential commands", () => {
      expect(builtinCommands).toContain("help");
      expect(builtinCommands).toContain("clear");
      expect(builtinCommands).toContain("ls");
      expect(builtinCommands).toContain("cat");
      expect(builtinCommands).toContain("cd");
    });

    it("contains game commands", () => {
      expect(builtinCommands).toContain("snake");
      expect(builtinCommands).toContain("tetris");
      expect(builtinCommands).toContain("2048");
    });

    it("contains utility commands", () => {
      expect(builtinCommands).toContain("weather");
      expect(builtinCommands).toContain("calc");
      expect(builtinCommands).toContain("qr");
    });
  });

  describe("completeCommand", () => {
    it("completes single matching command", () => {
      const result = completeCommand("hel");
      expect(result.completion).toBe("p");
      expect(result.newLine).toBe("help");
    });

    it("returns multiple matches when ambiguous", () => {
      const result = completeCommand("c");
      expect(result.matches).toBeDefined();
      expect(result.matches).toContain("clear");
      expect(result.matches).toContain("cat");
      expect(result.matches).toContain("cd");
    });

    it("returns empty result when no matches", () => {
      const result = completeCommand("xyz");
      expect(result.completion).toBeUndefined();
      expect(result.matches).toBeUndefined();
    });

    it("does not complete commands with arguments", () => {
      const result = completeCommand("cat file");
      expect(result.completion).toBeUndefined();
      expect(result.matches).toBeUndefined();
    });

    it("completes exact prefix", () => {
      const result = completeCommand("neo");
      expect(result.completion).toBe("fetch");
      expect(result.newLine).toBe("neofetch");
    });

    it("handles empty input", () => {
      const result = completeCommand("");
      // Empty string matches all commands
      expect(result.matches).toBeDefined();
      expect(result.matches!.length).toBeGreaterThan(0);
    });
  });

  describe("findCommonPrefix", () => {
    it("finds common prefix of strings", () => {
      expect(findCommonPrefix(["cat", "cd", "clear"])).toBe("c");
    });

    it("returns first string for single element", () => {
      expect(findCommonPrefix(["hello"])).toBe("hello");
    });

    it("returns empty string for no common prefix", () => {
      expect(findCommonPrefix(["abc", "xyz"])).toBe("");
    });

    it("returns empty string for empty array", () => {
      expect(findCommonPrefix([])).toBe("");
    });

    it("finds longer common prefix", () => {
      expect(findCommonPrefix(["theme", "the", "them"])).toBe("the");
    });

    it("handles identical strings", () => {
      expect(findCommonPrefix(["test", "test", "test"])).toBe("test");
    });
  });
});
