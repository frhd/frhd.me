import { describe, it, expect } from "vitest";
import {
  terminalLogo,
  renderPrompt,
  renderLogo,
  defaultPromptConfig,
} from "../../terminal/prompt";

describe("prompt", () => {
  describe("terminalLogo", () => {
    it("is an array of strings", () => {
      expect(Array.isArray(terminalLogo)).toBe(true);
      expect(terminalLogo.every((line) => typeof line === "string")).toBe(true);
    });

    it("contains ASCII art", () => {
      const logoText = terminalLogo.join("");
      expect(logoText).toContain("|");
      expect(logoText).toContain("_");
    });
  });

  describe("renderPrompt", () => {
    it("includes user, host, and cwd", () => {
      const prompt = renderPrompt({
        user: "testuser",
        host: "testhost",
        cwd: "/home",
      });
      expect(prompt).toContain("testuser");
      expect(prompt).toContain("testhost");
      expect(prompt).toContain("/home");
      expect(prompt).toContain("$");
    });

    it("includes ANSI color codes", () => {
      const prompt = renderPrompt({
        user: "user",
        host: "host",
        cwd: "~",
      });
      // Should contain ANSI escape sequences
      expect(prompt).toContain("\x1b[");
    });

    it("ends with dollar sign and space", () => {
      const prompt = renderPrompt({
        user: "a",
        host: "b",
        cwd: "c",
      });
      expect(prompt.endsWith("$ ")).toBe(true);
    });
  });

  describe("renderLogo", () => {
    it("returns colorized logo lines", () => {
      const lines = renderLogo();
      expect(Array.isArray(lines)).toBe(true);
      expect(lines.length).toBe(terminalLogo.length);
    });

    it("includes color codes", () => {
      const lines = renderLogo();
      lines.forEach((line) => {
        expect(line).toContain("\x1b[");
      });
    });
  });

  describe("defaultPromptConfig", () => {
    it("has default values", () => {
      expect(defaultPromptConfig.user).toBe("guest");
      expect(defaultPromptConfig.host).toBe("frhd.me");
      expect(defaultPromptConfig.cwd).toBe("~");
    });
  });
});
