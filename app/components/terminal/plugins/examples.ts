/**
 * Example Plugins
 *
 * Sample plugins that can be installed to demonstrate the plugin system.
 */

/** Dice rolling plugin source code */
export const dicePlugin = `// Dice Rolling Plugin
const plugin = {
  name: "Dice Roller",
  version: "1.0.0",
  author: "frhd.me",
  description: "Roll dice with various configurations",
  commands: [
    {
      name: "roll",
      description: "Roll dice (e.g., roll 2d6, roll d20)",
      usage: "roll [NdM] - Roll N dice with M sides (default: 1d6)",
      execute: function(term, args) {
        const input = args[0] || "1d6";
        const match = input.match(/^(\\d*)d(\\d+)$/i);

        if (!match) {
          term.writeln(term.colorize("Usage: roll [NdM] - e.g., roll 2d6, roll d20", "yellow"));
          return;
        }

        const count = parseInt(match[1]) || 1;
        const sides = parseInt(match[2]);

        if (count > 100 || sides > 1000) {
          term.writeln(term.colorize("Maximum: 100 dice with 1000 sides each", "brightRed"));
          return;
        }

        const rolls = [];
        let total = 0;
        for (let i = 0; i < count; i++) {
          const roll = Math.floor(Math.random() * sides) + 1;
          rolls.push(roll);
          total += roll;
        }

        term.writeln(term.colorize("Rolling " + count + "d" + sides + "...", "cyan"));
        term.writeln("");

        if (count === 1) {
          term.writeln(term.colorize("  [ " + rolls[0] + " ]", "brightGreen"));
        } else {
          term.writeln("  " + rolls.map(function(r) { return term.colorize(r.toString(), "brightGreen"); }).join(" + "));
          term.writeln("");
          term.writeln(term.colorize("  Total: " + total, "brightYellow"));
        }
      }
    }
  ]
};`;

/** Countdown timer plugin source code */
export const countdownPlugin = `// Countdown Timer Plugin
const plugin = {
  name: "Countdown Timer",
  version: "1.0.0",
  author: "frhd.me",
  description: "Simple countdown timer",
  commands: [
    {
      name: "countdown",
      description: "Start a countdown timer",
      usage: "countdown <seconds>",
      execute: async function(term, args) {
        const seconds = parseInt(args[0]);

        if (!seconds || seconds <= 0 || seconds > 3600) {
          term.writeln(term.colorize("Usage: countdown <seconds> (1-3600)", "yellow"));
          return;
        }

        term.writeln(term.colorize("Starting countdown from " + seconds + " seconds...", "cyan"));
        term.writeln("");

        for (let i = seconds; i >= 0; i--) {
          term.write("\\r  " + term.colorize(i.toString().padStart(4, " "), i <= 5 ? "brightRed" : "brightGreen") + " ");
          if (i > 0) {
            await new Promise(function(r) { setTimeout(r, 1000); });
          }
        }

        term.writeln("");
        term.writeln("");
        term.writeln(term.colorize("  DONE!", "brightYellow"));
      }
    }
  ]
};`;

/** ASCII art plugin source code */
export const asciiPlugin = `// ASCII Art Plugin
const plugin = {
  name: "ASCII Art",
  version: "1.0.0",
  author: "frhd.me",
  description: "Display fun ASCII art",
  commands: [
    {
      name: "shrug",
      description: "Display a shrug emoticon",
      execute: function(term) {
        term.writeln(term.colorize("  ¯\\\\_(\u30c4)_/¯", "brightCyan"));
      }
    },
    {
      name: "tableflip",
      description: "Flip that table!",
      execute: function(term) {
        term.writeln(term.colorize("  (\u256f\u00b0\u25a1\u00b0\uff09\u256f\ufe35 \u253b\u2501\u253b", "brightRed"));
      }
    },
    {
      name: "unflip",
      description: "Put the table back",
      execute: function(term) {
        term.writeln(term.colorize("  \u252c\u2500\u252c \u30ce( \u309c-\u309c\u30ce)", "brightGreen"));
      }
    }
  ]
};`;

/**
 * Collection of all example plugins keyed by name
 */
export const examplePlugins = {
  dice: dicePlugin,
  countdown: countdownPlugin,
  ascii: asciiPlugin,
} as const;
