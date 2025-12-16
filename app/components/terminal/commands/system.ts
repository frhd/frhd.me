import type { Command } from "./types";
import { commandRegistry } from "./registry";
import { sleep } from "./utils";

/**
 * Help command - displays all available commands
 */
const helpCommand: Command = {
  name: "help",
  description: "Display this help message",
  category: "system",
  execute: (term) => {
    term.writeln(term.colorize("Available Commands:", "brightCyan"));
    commandRegistry.displayHelp(term);
    term.writeln("");
    term.writeln(
      term.colorize(
        'Hint: Try \'find / -name "*.secret"\' to discover hidden files...',
        "dim"
      )
    );
  },
};

/**
 * Clear command - clears the terminal
 */
const clearCommand: Command = {
  name: "clear",
  description: "Clear the terminal",
  category: "system",
  execute: (term) => {
    term.clear();
    term.scrollToTop();
  },
};

/**
 * Whoami command - displays current user
 */
const whoamiCommand: Command = {
  name: "whoami",
  description: "Display current user",
  category: "system",
  execute: (term) => {
    term.writeln("guest@frhd.me");
  },
};

/**
 * Pwd command - print working directory
 */
const pwdCommand: Command = {
  name: "pwd",
  description: "Print working directory",
  category: "system",
  execute: (term) => {
    term.writeln(term.cwd);
  },
};

/**
 * Echo command - display text
 */
const echoCommand: Command = {
  name: "echo",
  usage: "echo <text>",
  description: "Display text",
  category: "system",
  execute: (term, args) => {
    term.writeln(args.join(" "));
  },
};

/**
 * Date command - display current date
 */
const dateCommand: Command = {
  name: "date",
  description: "Display current date",
  category: "system",
  execute: (term) => {
    term.writeln(new Date().toString());
  },
};

/**
 * Exit command - close terminal session
 */
const exitCommand: Command = {
  name: "exit",
  description: "Close terminal",
  category: "system",
  execute: async (term) => {
    const exitSteps = [
      "Terminating session...",
      "Saving state...",
      "Closing connection...",
    ];

    for (const step of exitSteps) {
      term.write(`[${term.colorize("SYSTEM", "brightCyan")}] ${step}`);
      await sleep(400);
      term.writeln(` ${term.colorize("✓", "brightGreen")}`);
    }

    term.writeln("");
    term.writeln(term.colorize("Goodbye, user.", "brightYellow"));

    // Disconnect the terminal session
    term.disconnect();
  },
};

/**
 * All system commands
 */
export const systemCommands: Command[] = [
  helpCommand,
  clearCommand,
  whoamiCommand,
  pwdCommand,
  echoCommand,
  dateCommand,
  exitCommand,
];
