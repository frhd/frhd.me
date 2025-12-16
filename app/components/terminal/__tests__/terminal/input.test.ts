import { describe, it, expect } from "vitest";
import {
  escapeSequences,
  handleBackspace,
  handleCharacterInput,
  handleCtrlC,
  getHomeCursorMove,
  getEndCursorMove,
} from "../../terminal/input";

describe("input", () => {
  describe("escapeSequences", () => {
    it("has clearLine sequence", () => {
      expect(escapeSequences.clearLine).toBe("\r\x1b[K");
    });

    it("has backspace sequence", () => {
      expect(escapeSequences.backspace).toBe("\b \b");
    });

    it("has cursor hide/show sequences", () => {
      expect(escapeSequences.hideCursor).toBe("\x1b[?25l");
      expect(escapeSequences.showCursor).toBe("\x1b[?25h");
    });

    it("generates cursor movement sequences", () => {
      expect(escapeSequences.moveCursorLeft(5)).toBe("\x1b[5D");
      expect(escapeSequences.moveCursorRight(10)).toBe("\x1b[10C");
    });
  });

  describe("handleBackspace", () => {
    it("removes last character", () => {
      expect(handleBackspace("hello")).toBe("hell");
    });

    it("returns undefined for empty string", () => {
      expect(handleBackspace("")).toBeUndefined();
    });

    it("removes single character", () => {
      expect(handleBackspace("a")).toBe("");
    });

    it("handles unicode characters", () => {
      expect(handleBackspace("hello!")).toBe("hello");
    });
  });

  describe("handleCharacterInput", () => {
    it("appends character to line", () => {
      expect(handleCharacterInput("hel", "l")).toBe("hell");
    });

    it("handles empty line", () => {
      expect(handleCharacterInput("", "a")).toBe("a");
    });

    it("handles multiple characters", () => {
      expect(handleCharacterInput("test", "ing")).toBe("testing");
    });
  });

  describe("handleCtrlC", () => {
    it("returns ^C output and empty line", () => {
      const result = handleCtrlC();
      expect(result.output).toBe("^C");
      expect(result.newLine).toBe("");
    });
  });

  describe("getHomeCursorMove", () => {
    it("returns cursor left movement for line length", () => {
      expect(getHomeCursorMove("hello")).toBe("\x1b[5D");
    });

    it("handles empty line", () => {
      expect(getHomeCursorMove("")).toBe("\x1b[0D");
    });

    it("handles longer lines", () => {
      expect(getHomeCursorMove("a long command here")).toBe("\x1b[19D");
    });
  });

  describe("getEndCursorMove", () => {
    it("returns cursor right movement for line length", () => {
      expect(getEndCursorMove("hello")).toBe("\x1b[5C");
    });

    it("handles empty line", () => {
      expect(getEndCursorMove("")).toBe("\x1b[0C");
    });
  });
});
