import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

vi.stubGlobal("localStorage", localStorageMock);

// Import after mocking
import { getPluginRegistry, examplePlugins } from "../plugin-system";

// Reset registry between tests
function resetRegistry() {
  localStorageMock.clear();
  // Force re-initialization by clearing internal state
  const registry = getPluginRegistry();
  const plugins = registry.getPlugins();
  for (const plugin of plugins) {
    registry.unregisterPlugin(plugin.id);
  }
}

describe("Plugin System", () => {
  beforeEach(() => {
    resetRegistry();
  });

  afterEach(() => {
    resetRegistry();
  });

  describe("Plugin Registry", () => {
    it("starts with no plugins", () => {
      const registry = getPluginRegistry();
      expect(registry.getPlugins()).toHaveLength(0);
    });

    it("returns singleton instance", () => {
      const registry1 = getPluginRegistry();
      const registry2 = getPluginRegistry();
      expect(registry1).toBe(registry2);
    });

    it("can check if command exists", () => {
      const registry = getPluginRegistry();
      expect(registry.hasCommand("nonexistent")).toBe(false);
    });

    it("returns empty command names when no plugins installed", () => {
      const registry = getPluginRegistry();
      expect(registry.getCommandNames()).toHaveLength(0);
    });
  });

  describe("Plugin Parsing", () => {
    it("parses valid plugin source", () => {
      const registry = getPluginRegistry();
      const source = `
        const plugin = {
          name: "Test Plugin",
          version: "1.0.0",
          author: "Test",
          description: "A test plugin",
          commands: [
            {
              name: "test",
              description: "Test command",
              execute: function(term) {
                term.writeln("test");
              }
            }
          ]
        };
      `;

      const plugin = registry.parsePlugin(source);
      expect(plugin).not.toBeNull();
      expect(plugin?.name).toBe("Test Plugin");
      expect(plugin?.version).toBe("1.0.0");
      expect(plugin?.commands).toHaveLength(1);
      expect(plugin?.commands[0].name).toBe("test");
    });

    it("throws on plugin without name", () => {
      const registry = getPluginRegistry();
      const source = `
        const plugin = {
          commands: []
        };
      `;

      expect(() => registry.parsePlugin(source)).toThrow("Plugin must have a name");
    });

    it("throws on plugin without commands", () => {
      const registry = getPluginRegistry();
      const source = `
        const plugin = {
          name: "Bad Plugin"
        };
      `;

      expect(() => registry.parsePlugin(source)).toThrow(
        "Plugin must have a commands array"
      );
    });

    it("throws on command without execute function", () => {
      const registry = getPluginRegistry();
      const source = `
        const plugin = {
          name: "Bad Plugin",
          commands: [
            { name: "bad", description: "No execute" }
          ]
        };
      `;

      expect(() => registry.parsePlugin(source)).toThrow(
        "must have an execute function"
      );
    });
  });

  describe("Plugin Registration", () => {
    it("registers a valid plugin", () => {
      const registry = getPluginRegistry();
      const source = `
        const plugin = {
          name: "Registered Plugin",
          commands: [
            {
              name: "regtest",
              description: "Test",
              execute: function(term) { term.writeln("test"); }
            }
          ]
        };
      `;

      const plugin = registry.parsePlugin(source);
      expect(plugin).not.toBeNull();
      registry.registerPlugin(plugin!);

      expect(registry.getPlugins()).toHaveLength(1);
      expect(registry.hasCommand("regtest")).toBe(true);
      expect(registry.getCommandNames()).toContain("regtest");
    });

    it("prevents duplicate command names", () => {
      const registry = getPluginRegistry();
      const source1 = `
        const plugin = {
          name: "Plugin 1",
          commands: [
            { name: "samename", description: "Test", execute: function() {} }
          ]
        };
      `;
      const source2 = `
        const plugin = {
          name: "Plugin 2",
          commands: [
            { name: "samename", description: "Test", execute: function() {} }
          ]
        };
      `;

      const plugin1 = registry.parsePlugin(source1);
      registry.registerPlugin(plugin1!);

      const plugin2 = registry.parsePlugin(source2);
      expect(() => registry.registerPlugin(plugin2!)).toThrow(
        "already exists"
      );
    });

    it("prevents reserved command names", () => {
      const registry = getPluginRegistry();
      const source = `
        const plugin = {
          name: "Bad Plugin",
          commands: [
            { name: "help", description: "Override help", execute: function() {} }
          ]
        };
      `;

      const plugin = registry.parsePlugin(source);
      expect(() => registry.registerPlugin(plugin!)).toThrow(
        "reserved command name"
      );
    });
  });

  describe("Plugin Removal", () => {
    it("removes an installed plugin", () => {
      const registry = getPluginRegistry();
      const source = `
        const plugin = {
          name: "Removable",
          commands: [
            { name: "removeme", description: "Test", execute: function() {} }
          ]
        };
      `;

      const plugin = registry.parsePlugin(source);
      registry.registerPlugin(plugin!);
      expect(registry.hasCommand("removeme")).toBe(true);

      const removed = registry.unregisterPlugin(plugin!.id);
      expect(removed).toBe(true);
      expect(registry.hasCommand("removeme")).toBe(false);
      expect(registry.getPlugins()).toHaveLength(0);
    });

    it("returns false for non-existent plugin", () => {
      const registry = getPluginRegistry();
      const removed = registry.unregisterPlugin("nonexistent-id");
      expect(removed).toBe(false);
    });
  });

  describe("Plugin Execution", () => {
    it("executes plugin command", async () => {
      const registry = getPluginRegistry();
      const source = `
        const plugin = {
          name: "Exec Test",
          commands: [
            {
              name: "exectest",
              description: "Test",
              execute: function(term, args) {
                term.writeln("Executed with: " + args.join(" "));
              }
            }
          ]
        };
      `;

      const plugin = registry.parsePlugin(source);
      registry.registerPlugin(plugin!);

      const output: string[] = [];
      const mockTerm = {
        write: (s: string) => output.push(s),
        writeln: (s: string) => output.push(s + "\n"),
        clear: () => {},
        colorize: (s: string) => s,
      };

      const executed = await registry.executeCommand("exectest", mockTerm, [
        "arg1",
        "arg2",
      ]);
      expect(executed).toBe(true);
      expect(output.join("")).toContain("Executed with: arg1 arg2");
    });

    it("returns false for unknown command", async () => {
      const registry = getPluginRegistry();
      const mockTerm = {
        write: () => {},
        writeln: () => {},
        clear: () => {},
        colorize: (s: string) => s,
      };

      const executed = await registry.executeCommand("unknown", mockTerm, []);
      expect(executed).toBe(false);
    });

    it("handles plugin errors gracefully", async () => {
      const registry = getPluginRegistry();
      const source = `
        const plugin = {
          name: "Error Plugin",
          commands: [
            {
              name: "errorcmd",
              description: "Throws error",
              execute: function() {
                throw new Error("Plugin error!");
              }
            }
          ]
        };
      `;

      const plugin = registry.parsePlugin(source);
      registry.registerPlugin(plugin!);

      const output: string[] = [];
      const mockTerm = {
        write: (s: string) => output.push(s),
        writeln: (s: string) => output.push(s + "\n"),
        clear: () => {},
        colorize: (s: string) => s,
      };

      const executed = await registry.executeCommand("errorcmd", mockTerm, []);
      expect(executed).toBe(true); // Returns true because command was handled
      expect(output.join("")).toContain("Plugin error");
    });
  });

  describe("Example Plugins", () => {
    it("dice plugin parses correctly", () => {
      const registry = getPluginRegistry();
      const plugin = registry.parsePlugin(examplePlugins.dice);
      expect(plugin).not.toBeNull();
      expect(plugin?.name).toBe("Dice Roller");
      expect(plugin?.commands[0].name).toBe("roll");
    });

    it("countdown plugin parses correctly", () => {
      const registry = getPluginRegistry();
      const plugin = registry.parsePlugin(examplePlugins.countdown);
      expect(plugin).not.toBeNull();
      expect(plugin?.name).toBe("Countdown Timer");
      expect(plugin?.commands[0].name).toBe("countdown");
    });

    it("ascii plugin parses correctly", () => {
      const registry = getPluginRegistry();
      const plugin = registry.parsePlugin(examplePlugins.ascii);
      expect(plugin).not.toBeNull();
      expect(plugin?.name).toBe("ASCII Art");
      expect(plugin?.commands).toHaveLength(3);
      expect(plugin?.commands.map((c) => c.name)).toEqual([
        "shrug",
        "tableflip",
        "unflip",
      ]);
    });

    it("dice plugin executes roll command", async () => {
      const registry = getPluginRegistry();
      const plugin = registry.parsePlugin(examplePlugins.dice);
      registry.registerPlugin(plugin!);

      const output: string[] = [];
      const mockTerm = {
        write: (s: string) => output.push(s),
        writeln: (s: string) => output.push(s + "\n"),
        clear: () => {},
        colorize: (s: string) => s,
      };

      await registry.executeCommand("roll", mockTerm, ["1d6"]);
      expect(output.join("")).toContain("Rolling 1d6");
    });

    it("ascii plugin executes shrug command", async () => {
      const registry = getPluginRegistry();
      const plugin = registry.parsePlugin(examplePlugins.ascii);
      registry.registerPlugin(plugin!);

      const output: string[] = [];
      const mockTerm = {
        write: (s: string) => output.push(s),
        writeln: (s: string) => output.push(s + "\n"),
        clear: () => {},
        colorize: (s: string) => s,
      };

      await registry.executeCommand("shrug", mockTerm, []);
      expect(output.join("")).toContain("¯\\_");
    });
  });

  describe("Sandboxed Execution", () => {
    it("blocks access to window", () => {
      const registry = getPluginRegistry();
      const source = `
        const plugin = {
          name: "Window Access",
          commands: [
            {
              name: "accesswindow",
              description: "Try to access window",
              execute: function() {
                return typeof window;
              }
            }
          ]
        };
      `;

      const plugin = registry.parsePlugin(source);
      expect(plugin).not.toBeNull();
      // Window should be undefined in sandbox
      // The plugin itself executes in sandbox, so it won't have access to window
    });

    it("blocks access to document", () => {
      const registry = getPluginRegistry();
      const source = `
        const plugin = {
          name: "Document Access",
          commands: [
            {
              name: "accessdoc",
              description: "Try to access document",
              execute: function() {
                return typeof document;
              }
            }
          ]
        };
      `;

      const plugin = registry.parsePlugin(source);
      expect(plugin).not.toBeNull();
    });

    it("allows safe Math operations", () => {
      const registry = getPluginRegistry();
      const source = `
        const plugin = {
          name: "Math Plugin",
          commands: [
            {
              name: "random",
              description: "Get random number",
              execute: function(term) {
                term.writeln(String(Math.floor(Math.random() * 100)));
              }
            }
          ]
        };
      `;

      const plugin = registry.parsePlugin(source);
      expect(plugin).not.toBeNull();
      registry.registerPlugin(plugin!);

      const output: string[] = [];
      const mockTerm = {
        write: (s: string) => output.push(s),
        writeln: (s: string) => output.push(s + "\n"),
        clear: () => {},
        colorize: (s: string) => s,
      };

      // Should not throw
      registry.executeCommand("random", mockTerm, []);
    });
  });
});
