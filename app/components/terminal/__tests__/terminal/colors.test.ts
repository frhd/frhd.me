import { describe, it, expect } from "vitest";
import {
  ansiColors,
  colorize,
  createColorizer,
  colors,
} from "../../terminal/colors";

describe("colors", () => {
  describe("ansiColors", () => {
    it("contains standard colors", () => {
      expect(ansiColors.red).toBe("\x1b[31m");
      expect(ansiColors.green).toBe("\x1b[32m");
      expect(ansiColors.blue).toBe("\x1b[34m");
    });

    it("contains bright colors", () => {
      expect(ansiColors.brightRed).toBe("\x1b[91m");
      expect(ansiColors.brightGreen).toBe("\x1b[92m");
      expect(ansiColors.brightBlue).toBe("\x1b[94m");
    });

    it("contains styles", () => {
      expect(ansiColors.bold).toBe("\x1b[1m");
      expect(ansiColors.dim).toBe("\x1b[2m");
      expect(ansiColors.underline).toBe("\x1b[4m");
    });

    it("contains reset code", () => {
      expect(ansiColors.reset).toBe("\x1b[0m");
    });
  });

  describe("colorize", () => {
    it("wraps text with color code and reset", () => {
      const result = colorize("hello", "green");
      expect(result).toBe("\x1b[32mhello\x1b[0m");
    });

    it("handles brightRed color", () => {
      const result = colorize("error", "brightRed");
      expect(result).toBe("\x1b[91merror\x1b[0m");
    });

    it("handles bold style", () => {
      const result = colorize("important", "bold");
      expect(result).toBe("\x1b[1mimportant\x1b[0m");
    });

    it("handles unknown color gracefully", () => {
      const result = colorize("text", "unknownColor");
      expect(result).toBe("text\x1b[0m");
    });

    it("handles empty text", () => {
      const result = colorize("", "green");
      expect(result).toBe("\x1b[32m\x1b[0m");
    });
  });

  describe("createColorizer", () => {
    it("creates a function that colorizes with specified color", () => {
      const redColorizer = createColorizer("red");
      expect(redColorizer("text")).toBe("\x1b[31mtext\x1b[0m");
    });

    it("creates independent colorizers", () => {
      const red = createColorizer("red");
      const blue = createColorizer("blue");
      expect(red("a")).toBe("\x1b[31ma\x1b[0m");
      expect(blue("b")).toBe("\x1b[34mb\x1b[0m");
    });
  });

  describe("colors object", () => {
    it("provides pre-bound colorizers", () => {
      expect(colors.red("x")).toBe("\x1b[31mx\x1b[0m");
      expect(colors.green("y")).toBe("\x1b[32my\x1b[0m");
      expect(colors.bold("z")).toBe("\x1b[1mz\x1b[0m");
    });

    it("includes all common colors", () => {
      expect(colors.red).toBeDefined();
      expect(colors.green).toBeDefined();
      expect(colors.yellow).toBeDefined();
      expect(colors.blue).toBeDefined();
      expect(colors.cyan).toBeDefined();
      expect(colors.magenta).toBeDefined();
      expect(colors.brightRed).toBeDefined();
      expect(colors.brightGreen).toBeDefined();
      expect(colors.bold).toBeDefined();
      expect(colors.dim).toBeDefined();
    });
  });
});
