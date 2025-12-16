import { describe, it, expect } from "vitest";
import {
  parseVerb,
  parseArgs,
  isDirection,
  normalizeDirection,
} from "../../adventure/parser";

describe("adventure/parser", () => {
  describe("parseVerb", () => {
    it("extracts the first word from input", () => {
      expect(parseVerb("look around")).toBe("look");
      expect(parseVerb("go north")).toBe("go");
      expect(parseVerb("take floppy disk")).toBe("take");
    });

    it("handles single-word commands", () => {
      expect(parseVerb("inventory")).toBe("inventory");
      expect(parseVerb("help")).toBe("help");
    });

    it("lowercases the verb", () => {
      expect(parseVerb("LOOK")).toBe("look");
      expect(parseVerb("Go North")).toBe("go");
    });

    it("trims whitespace", () => {
      expect(parseVerb("  look  ")).toBe("look");
      expect(parseVerb("\tgo north")).toBe("go");
    });

    it("returns empty string for empty input", () => {
      expect(parseVerb("")).toBe("");
      expect(parseVerb("   ")).toBe("");
    });
  });

  describe("parseArgs", () => {
    it("extracts everything after the verb", () => {
      expect(parseArgs("look around")).toBe("around");
      expect(parseArgs("take floppy disk")).toBe("floppy disk");
      expect(parseArgs("go north")).toBe("north");
    });

    it("returns empty string for single-word commands", () => {
      expect(parseArgs("inventory")).toBe("");
      expect(parseArgs("help")).toBe("");
    });

    it("lowercases the arguments", () => {
      expect(parseArgs("LOOK AROUND")).toBe("around");
      expect(parseArgs("Take Floppy Disk")).toBe("floppy disk");
    });

    it("handles multiple spaces between words", () => {
      expect(parseArgs("take   floppy   disk")).toBe("floppy disk");
    });
  });

  describe("isDirection", () => {
    it("returns true for full direction names", () => {
      expect(isDirection("north")).toBe(true);
      expect(isDirection("south")).toBe(true);
      expect(isDirection("east")).toBe(true);
      expect(isDirection("west")).toBe(true);
    });

    it("returns true for direction shortcuts", () => {
      expect(isDirection("n")).toBe(true);
      expect(isDirection("s")).toBe(true);
      expect(isDirection("e")).toBe(true);
      expect(isDirection("w")).toBe(true);
    });

    it("is case-insensitive", () => {
      expect(isDirection("NORTH")).toBe(true);
      expect(isDirection("North")).toBe(true);
      expect(isDirection("N")).toBe(true);
    });

    it("returns false for non-directions", () => {
      expect(isDirection("look")).toBe(false);
      expect(isDirection("take")).toBe(false);
      expect(isDirection("up")).toBe(false);
      expect(isDirection("down")).toBe(false);
    });
  });

  describe("normalizeDirection", () => {
    it("expands direction shortcuts", () => {
      expect(normalizeDirection("n")).toBe("north");
      expect(normalizeDirection("s")).toBe("south");
      expect(normalizeDirection("e")).toBe("east");
      expect(normalizeDirection("w")).toBe("west");
    });

    it("passes through full direction names", () => {
      expect(normalizeDirection("north")).toBe("north");
      expect(normalizeDirection("south")).toBe("south");
      expect(normalizeDirection("east")).toBe("east");
      expect(normalizeDirection("west")).toBe("west");
    });

    it("is case-insensitive", () => {
      expect(normalizeDirection("N")).toBe("north");
      expect(normalizeDirection("NORTH")).toBe("north");
    });

    it("passes through unknown inputs unchanged", () => {
      expect(normalizeDirection("up")).toBe("up");
      expect(normalizeDirection("look")).toBe("look");
    });
  });
});
