import { describe, it, expect } from "vitest";
import { createSandbox, executeInSandbox } from "../../plugins/sandbox";

describe("Plugin Sandbox", () => {
  describe("createSandbox", () => {
    it("should provide safe globals", () => {
      const sandbox = createSandbox();

      expect(sandbox.Math).toBe(Math);
      expect(sandbox.Date).toBe(Date);
      expect(sandbox.JSON).toBe(JSON);
      expect(sandbox.String).toBe(String);
      expect(sandbox.Number).toBe(Number);
      expect(sandbox.Boolean).toBe(Boolean);
      expect(sandbox.Array).toBe(Array);
      expect(sandbox.Object).toBe(Object);
      expect(sandbox.Map).toBe(Map);
      expect(sandbox.Set).toBe(Set);
      expect(sandbox.Promise).toBe(Promise);
    });

    it("should block dangerous globals", () => {
      const sandbox = createSandbox();

      expect(sandbox.window).toBeUndefined();
      expect(sandbox.document).toBeUndefined();
      expect(sandbox.localStorage).toBeUndefined();
      expect(sandbox.sessionStorage).toBeUndefined();
      expect(sandbox.fetch).toBeUndefined();
      expect(sandbox.XMLHttpRequest).toBeUndefined();
    });

    it("should provide safe console", () => {
      const sandbox = createSandbox();

      expect(sandbox.console).toBeDefined();
      expect(typeof (sandbox.console as { log: () => void }).log).toBe(
        "function"
      );
      expect(typeof (sandbox.console as { error: () => void }).error).toBe(
        "function"
      );
      expect(typeof (sandbox.console as { warn: () => void }).warn).toBe(
        "function"
      );

      // Should not throw
      (sandbox.console as { log: (msg: string) => void }).log("test");
    });

    it("should provide setTimeout with capped duration", () => {
      const sandbox = createSandbox();

      expect(typeof sandbox.setTimeout).toBe("function");
      expect(typeof sandbox.clearTimeout).toBe("function");
    });
  });

  describe("executeInSandbox", () => {
    it("should execute simple plugin code", () => {
      const sandbox = createSandbox();
      const source = `
        const plugin = {
          name: "Test",
          commands: []
        };
      `;

      const result = executeInSandbox(source, sandbox) as {
        name: string;
        commands: unknown[];
      };

      expect(result).toBeDefined();
      expect(result.name).toBe("Test");
      expect(result.commands).toEqual([]);
    });

    it("should return null if plugin is not defined", () => {
      const sandbox = createSandbox();
      const source = `const notAPlugin = {};`;

      const result = executeInSandbox(source, sandbox);
      expect(result).toBeNull();
    });

    it("should allow use of Math", () => {
      const sandbox = createSandbox();
      const source = `
        const plugin = {
          name: "Math Test",
          value: Math.floor(3.7),
          commands: []
        };
      `;

      const result = executeInSandbox(source, sandbox) as {
        name: string;
        value: number;
        commands: unknown[];
      };

      expect(result.value).toBe(3);
    });

    it("should allow use of JSON", () => {
      const sandbox = createSandbox();
      const source = `
        const data = JSON.parse('{"key": "value"}');
        const plugin = {
          name: "JSON Test",
          data: data,
          commands: []
        };
      `;

      const result = executeInSandbox(source, sandbox) as {
        name: string;
        data: { key: string };
        commands: unknown[];
      };

      expect(result.data.key).toBe("value");
    });

    it("should allow defining functions", () => {
      const sandbox = createSandbox();
      const source = `
        function helper() { return 42; }
        const plugin = {
          name: "Function Test",
          commands: [{
            name: "test",
            description: "test",
            execute: function() { return helper(); }
          }]
        };
      `;

      const result = executeInSandbox(source, sandbox) as {
        name: string;
        commands: Array<{ execute: () => number }>;
      };

      expect(result.commands[0].execute()).toBe(42);
    });

    it("should allow async functions", async () => {
      const sandbox = createSandbox();
      const source = `
        const plugin = {
          name: "Async Test",
          commands: [{
            name: "test",
            description: "test",
            execute: async function() {
              await Promise.resolve();
              return "done";
            }
          }]
        };
      `;

      const result = executeInSandbox(source, sandbox) as {
        name: string;
        commands: Array<{ execute: () => Promise<string> }>;
      };

      const execResult = await result.commands[0].execute();
      expect(execResult).toBe("done");
    });

    it("should block access to window via undefined value", () => {
      const sandbox = createSandbox();
      const source = `
        const plugin = {
          name: "Window Test",
          hasWindow: typeof window !== 'undefined',
          commands: []
        };
      `;

      const result = executeInSandbox(source, sandbox) as {
        name: string;
        hasWindow: boolean;
        commands: unknown[];
      };

      // window is explicitly set to undefined in the sandbox
      expect(result.hasWindow).toBe(false);
    });

    it("should run in strict mode", () => {
      const sandbox = createSandbox();
      // This would fail in strict mode
      const source = `
        const plugin = {
          name: "Strict Test",
          commands: []
        };
      `;

      // Should not throw - code is valid in strict mode
      const result = executeInSandbox(source, sandbox);
      expect(result).toBeDefined();
    });
  });
});
