import { describe, it, expect } from "vitest";
import { executeVimCommand } from "../../vim/commands";
import { createInitialState } from "../../vim/state";

describe("vim/commands", () => {
  const createTestState = (modified = false) => ({
    ...createInitialState("test.txt"),
    modified,
  });

  describe("executeVimCommand", () => {
    describe("quit commands", () => {
      it("should exit with :q when not modified", () => {
        const state = createTestState(false);
        const result = executeVimCommand(state, "q");
        expect(result.shouldExit).toBe(true);
      });

      it("should error with :q when modified", () => {
        const state = createTestState(true);
        const result = executeVimCommand(state, "q");
        expect(result.shouldExit).toBeUndefined();
        expect(result.message).toContain("No write since last change");
      });

      it("should exit with :quit when not modified", () => {
        const state = createTestState(false);
        const result = executeVimCommand(state, "quit");
        expect(result.shouldExit).toBe(true);
      });

      it("should exit with :q! even when modified", () => {
        const state = createTestState(true);
        const result = executeVimCommand(state, "q!");
        expect(result.shouldExit).toBe(true);
      });

      it("should exit with :quit! even when modified", () => {
        const state = createTestState(true);
        const result = executeVimCommand(state, "quit!");
        expect(result.shouldExit).toBe(true);
      });
    });

    describe("write commands", () => {
      it("should simulate write with :w", () => {
        const state = createTestState(true);
        const result = executeVimCommand(state, "w");
        expect(result.newState?.modified).toBe(false);
        expect(result.message).toContain("written");
      });

      it("should simulate write with :write", () => {
        const state = createTestState(true);
        const result = executeVimCommand(state, "write");
        expect(result.newState?.modified).toBe(false);
      });
    });

    describe("write and quit commands", () => {
      it("should exit with :wq", () => {
        const state = createTestState(true);
        const result = executeVimCommand(state, "wq");
        expect(result.shouldExit).toBe(true);
      });

      it("should exit with :x", () => {
        const state = createTestState(true);
        const result = executeVimCommand(state, "x");
        expect(result.shouldExit).toBe(true);
      });
    });

    describe("set commands", () => {
      it("should enable line numbers with :set number", () => {
        const state = createTestState();
        const result = executeVimCommand(state, "set number");
        expect(result.newState?.showLineNumbers).toBe(true);
      });

      it("should enable line numbers with :set nu", () => {
        const state = createTestState();
        const result = executeVimCommand(state, "set nu");
        expect(result.newState?.showLineNumbers).toBe(true);
      });

      it("should disable line numbers with :set nonumber", () => {
        const state = createTestState();
        const result = executeVimCommand(state, "set nonumber");
        expect(result.newState?.showLineNumbers).toBe(false);
      });

      it("should disable line numbers with :set nonu", () => {
        const state = createTestState();
        const result = executeVimCommand(state, "set nonu");
        expect(result.newState?.showLineNumbers).toBe(false);
      });
    });

    describe("edit commands", () => {
      it("should open existing file with :e", () => {
        const state = createTestState();
        const result = executeVimCommand(state, "e hello.js");
        expect(result.newState?.filename).toBe("hello.js");
        expect(result.newState?.lines).toBeDefined();
        expect(result.newState?.modified).toBe(false);
      });

      it("should error on non-existent file", () => {
        const state = createTestState();
        const result = executeVimCommand(state, "e nonexistent.txt");
        expect(result.newState).toBeUndefined();
        expect(result.message).toContain("Can't open file");
      });
    });

    describe("help command", () => {
      it("should open readme.txt with :help", () => {
        const state = createTestState();
        const result = executeVimCommand(state, "help");
        expect(result.newState?.filename).toBe("readme.txt");
      });

      it("should open readme.txt with :h", () => {
        const state = createTestState();
        const result = executeVimCommand(state, "h");
        expect(result.newState?.filename).toBe("readme.txt");
      });
    });

    describe("files command", () => {
      it("should list available files with :files", () => {
        const state = createTestState();
        const result = executeVimCommand(state, "files");
        expect(result.message).toContain("Available files");
        expect(result.message).toContain("readme.txt");
      });

      it("should list available files with :ls", () => {
        const state = createTestState();
        const result = executeVimCommand(state, "ls");
        expect(result.message).toContain("Available files");
      });
    });

    describe("unknown commands", () => {
      it("should error on unknown command", () => {
        const state = createTestState();
        const result = executeVimCommand(state, "unknowncommand");
        expect(result.message).toContain("Not an editor command");
      });
    });
  });
});
