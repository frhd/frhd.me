import { describe, it, expect } from "vitest";
import { parsePlugin, generatePluginId } from "../../plugins/loader";

describe("Plugin Loader", () => {
  describe("generatePluginId", () => {
    it("should generate a slug-based ID with random suffix", () => {
      const id = generatePluginId("My Cool Plugin");
      expect(id).toMatch(/^my-cool-plugin-[a-z0-9]{6}$/);
    });

    it("should handle special characters", () => {
      const id = generatePluginId("Plugin! @#$% Test");
      // "Plugin! @#$% Test" -> 7 special chars (! space @#$% space) become dashes
      expect(id).toMatch(/^plugin-------test-[a-z0-9]{6}$/);
    });

    it("should generate unique IDs", () => {
      const id1 = generatePluginId("Test");
      const id2 = generatePluginId("Test");
      expect(id1).not.toBe(id2);
    });
  });

  describe("parsePlugin", () => {
    it("should parse a valid plugin", () => {
      const source = `
        const plugin = {
          name: "Test Plugin",
          version: "1.0.0",
          author: "Test Author",
          description: "A test plugin",
          commands: [
            {
              name: "test",
              description: "A test command",
              execute: function(term) {
                term.writeln("Hello!");
              }
            }
          ]
        };
      `;

      const plugin = parsePlugin(source);

      expect(plugin.name).toBe("Test Plugin");
      expect(plugin.version).toBe("1.0.0");
      expect(plugin.author).toBe("Test Author");
      expect(plugin.description).toBe("A test plugin");
      expect(plugin.commands).toHaveLength(1);
      expect(plugin.commands[0].name).toBe("test");
      expect(plugin.source).toBe(source);
    });

    it("should use default values for optional fields", () => {
      const source = `
        const plugin = {
          name: "Minimal Plugin",
          commands: [
            {
              name: "minimal",
              description: "A minimal command",
              execute: function() {}
            }
          ]
        };
      `;

      const plugin = parsePlugin(source);

      expect(plugin.name).toBe("Minimal Plugin");
      expect(plugin.version).toBe("1.0.0");
      expect(plugin.author).toBe("Unknown");
      expect(plugin.description).toBe("No description");
    });

    it("should throw if plugin object is missing", () => {
      const source = `const notAPlugin = { foo: "bar" };`;

      expect(() => parsePlugin(source)).toThrow(
        "Plugin must export a 'plugin' object"
      );
    });

    it("should throw if name is missing", () => {
      const source = `
        const plugin = {
          commands: []
        };
      `;

      expect(() => parsePlugin(source)).toThrow("Plugin must have a name");
    });

    it("should throw if commands array is missing", () => {
      const source = `
        const plugin = {
          name: "Test"
        };
      `;

      expect(() => parsePlugin(source)).toThrow(
        "Plugin must have a commands array"
      );
    });

    it("should throw if command is missing name", () => {
      const source = `
        const plugin = {
          name: "Test",
          commands: [
            {
              description: "No name",
              execute: function() {}
            }
          ]
        };
      `;

      expect(() => parsePlugin(source)).toThrow("Each command must have a name");
    });

    it("should throw if command is missing execute function", () => {
      const source = `
        const plugin = {
          name: "Test",
          commands: [
            {
              name: "noexec",
              description: "No execute"
            }
          ]
        };
      `;

      expect(() => parsePlugin(source)).toThrow(
        "Command 'noexec' must have an execute function"
      );
    });

    it("should parse plugin with multiple commands", () => {
      const source = `
        const plugin = {
          name: "Multi Command",
          commands: [
            { name: "cmd1", description: "First", execute: function() {} },
            { name: "cmd2", description: "Second", execute: function() {} },
            { name: "cmd3", description: "Third", execute: function() {} }
          ]
        };
      `;

      const plugin = parsePlugin(source);
      expect(plugin.commands).toHaveLength(3);
      expect(plugin.commands.map((c) => c.name)).toEqual([
        "cmd1",
        "cmd2",
        "cmd3",
      ]);
    });

    it("should parse plugin with async execute function", () => {
      const source = `
        const plugin = {
          name: "Async Plugin",
          commands: [
            {
              name: "async",
              description: "Async command",
              execute: async function(term) {
                await Promise.resolve();
                term.writeln("Done");
              }
            }
          ]
        };
      `;

      const plugin = parsePlugin(source);
      expect(plugin.commands[0].name).toBe("async");
      expect(typeof plugin.commands[0].execute).toBe("function");
    });
  });
});
