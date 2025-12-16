import type { Command } from "./types";
import { dispatchEvent } from "./utils";
import { unlockAchievement } from "../achievements";

/**
 * Matrix command - display matrix rain effect
 */
const matrixCommand: Command = {
  name: "matrix",
  description: "Enter the Matrix (press 'q' to exit)",
  category: "games",
  execute: (term) => {
    // Unlock matrix_fan achievement
    unlockAchievement("matrix_fan");

    term.writeln(term.colorize("Entering the Matrix...", "brightGreen"));
    term.writeln(term.colorize("Press 'q' or ESC to exit", "brightYellow"));

    // Trigger matrix rain effect in parent component
    dispatchEvent("matrix-effect", {});
  },
};

/**
 * Snake command - classic snake game
 */
const snakeCommand: Command = {
  name: "snake",
  description: "Classic snake game",
  category: "games",
  execute: (term) => {
    // Unlock game_on achievement
    unlockAchievement("game_on");

    term.writeln(term.colorize("🐍 Launching Snake...", "brightGreen"));
    term.writeln(
      term.colorize(
        "Arrow keys or WASD to move | SPACE to pause | Q/ESC to exit",
        "brightYellow"
      )
    );

    dispatchEvent("visual-effect", { effect: "snake" });
  },
};

/**
 * Tetris command - classic block game
 */
const tetrisCommand: Command = {
  name: "tetris",
  description: "The classic block game",
  category: "games",
  execute: (term) => {
    // Unlock game_on achievement
    unlockAchievement("game_on");

    term.writeln(term.colorize("🧱 Launching Tetris...", "brightCyan"));
    term.writeln(
      term.colorize(
        "Arrow keys to move | UP to rotate | ENTER for hard drop | Q/ESC to exit",
        "brightYellow"
      )
    );

    dispatchEvent("visual-effect", { effect: "tetris" });
  },
};

/**
 * Typing command - typing speed test
 */
const typingCommand: Command = {
  name: "typing",
  description: "Test your typing speed",
  category: "games",
  execute: (term) => {
    // Unlock game_on achievement
    unlockAchievement("game_on");

    term.writeln(term.colorize("⌨️  Launching Typing Test...", "brightMagenta"));
    term.writeln(
      term.colorize(
        "Start typing when ready | TAB to skip whitespace | Q/ESC to exit",
        "brightYellow"
      )
    );

    dispatchEvent("visual-effect", { effect: "typing" });
  },
};

/**
 * 2048 command - slide and merge numbers game
 */
const game2048Command: Command = {
  name: "2048",
  description: "Slide and merge numbers",
  category: "games",
  execute: (term) => {
    // Unlock game_on achievement
    unlockAchievement("game_on");

    term.writeln(term.colorize("🎮 Launching 2048...", "brightYellow"));
    term.writeln(
      term.colorize(
        "Arrow keys to move | SPACE to restart | Q/ESC to exit",
        "brightYellow"
      )
    );

    dispatchEvent("visual-effect", { effect: "2048" });
  },
};

/**
 * Pipes command - classic pipes screensaver
 */
const pipesCommand: Command = {
  name: "pipes",
  description: "Classic pipes screensaver",
  category: "visual",
  execute: (term) => {
    term.writeln(term.colorize("Launching pipes screensaver...", "brightCyan"));
    term.writeln(term.colorize("Press 'q' or ESC to exit", "brightYellow"));

    dispatchEvent("visual-effect", { effect: "pipes" });
  },
};

/**
 * Plasma command - retro demoscene plasma effect
 */
const plasmaCommand: Command = {
  name: "plasma",
  description: "Retro demoscene plasma effect",
  category: "visual",
  execute: (term) => {
    term.writeln(term.colorize("Launching plasma effect...", "brightMagenta"));
    term.writeln(term.colorize("Press 'q' or ESC to exit", "brightYellow"));

    dispatchEvent("visual-effect", { effect: "plasma" });
  },
};

/**
 * Fireworks command - celebratory fireworks display
 */
const fireworksCommand: Command = {
  name: "fireworks",
  description: "Celebratory fireworks display",
  category: "visual",
  execute: (term) => {
    term.writeln(term.colorize("🎆 Launching fireworks...", "brightYellow"));
    term.writeln(term.colorize("Press 'q' or ESC to exit", "brightYellow"));

    dispatchEvent("visual-effect", { effect: "fireworks" });
  },
};

/**
 * Vim command - minimal vim-like text editor
 */
const vimCommand: Command = {
  name: "vim",
  aliases: ["vi", "nano"],
  usage: "vim [file]",
  description: "Minimal vim-like text editor",
  category: "utility",
  execute: (term, args) => {
    const filename = args[0] || "readme.txt";
    term.writeln(term.colorize("📝 Launching vim editor...", "brightCyan"));
    term.writeln(term.colorize(`Opening: ${filename}`, "brightYellow"));
    term.writeln(
      term.colorize(
        "Press ESC for normal mode | :q to quit | :help for commands",
        "brightYellow"
      )
    );

    dispatchEvent("visual-effect", { effect: "vim", filename });
  },
};

/**
 * All game and visual commands
 */
export const gameCommands: Command[] = [
  matrixCommand,
  snakeCommand,
  tetrisCommand,
  typingCommand,
  game2048Command,
  pipesCommand,
  plasmaCommand,
  fireworksCommand,
  vimCommand,
];
