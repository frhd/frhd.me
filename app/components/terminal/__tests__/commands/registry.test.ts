import { describe, it, expect, vi } from "vitest";
// Import from index to trigger command registration
import { commandRegistry } from "../../commands";
import { defineCommand } from "../../commands/registry";
import type { Command, ExtendedTerminal } from "../../commands/types";

describe("CommandRegistry", () => {
  // Create a mock terminal for testing
  const createMockTerminal = (): ExtendedTerminal => ({
    write: vi.fn(),
    writeln: vi.fn(),
    clear: vi.fn(),
    scrollToTop: vi.fn(),
    colorize: vi.fn((text: string) => text),
    cwd: "~",
    disconnect: vi.fn(),
  });

  describe("registration", () => {
    it("should have commands registered from module load", () => {
      // The registry should have commands from module load
      expect(commandRegistry.has("help")).toBe(true);
    });

    it("should register commands with aliases", () => {
      // vim command has aliases vi and nano
      expect(commandRegistry.has("vim")).toBe(true);
      expect(commandRegistry.has("vi")).toBe(true);
      expect(commandRegistry.has("nano")).toBe(true);
    });
  });

  describe("retrieval", () => {
    it("should get a command by name", () => {
      const command = commandRegistry.get("help");
      expect(command).toBeDefined();
      expect(command?.name).toBe("help");
    });

    it("should get a command by alias", () => {
      const command = commandRegistry.get("vi");
      expect(command).toBeDefined();
      expect(command?.name).toBe("vim");
    });

    it("should return undefined for unknown commands", () => {
      const command = commandRegistry.get("unknowncommand");
      expect(command).toBeUndefined();
    });
  });

  describe("execution", () => {
    it("should execute a registered command", async () => {
      const term = createMockTerminal();
      const result = await commandRegistry.execute(term, "whoami", []);
      expect(result).toBe(true);
      expect(term.writeln).toHaveBeenCalledWith("guest@frhd.me");
    });

    it("should return false for unknown commands", async () => {
      const term = createMockTerminal();
      const result = await commandRegistry.execute(term, "unknowncommand", []);
      expect(result).toBe(false);
    });

    it("should pass arguments to the command", async () => {
      const term = createMockTerminal();
      await commandRegistry.execute(term, "echo", ["hello", "world"]);
      expect(term.writeln).toHaveBeenCalledWith("hello world");
    });
  });

  describe("listing", () => {
    it("should get all commands", () => {
      const commands = commandRegistry.getAll();
      expect(commands.length).toBeGreaterThan(0);
      expect(commands.some((c) => c.name === "help")).toBe(true);
    });

    it("should get commands by category", () => {
      const systemCommands = commandRegistry.getByCategory("system");
      expect(systemCommands.length).toBeGreaterThan(0);
      expect(systemCommands.every((c) => c.category === "system")).toBe(true);
    });

    it("should get all categories", () => {
      const categories = commandRegistry.getCategories();
      expect(categories).toContain("system");
      expect(categories).toContain("games");
      expect(categories).toContain("utility");
    });
  });
});

describe("defineCommand", () => {
  it("should return the same command object", () => {
    const command: Command = {
      name: "test",
      description: "Test",
      category: "system",
      execute: vi.fn(),
    };

    const result = defineCommand(command);
    expect(result).toBe(command);
  });
});
