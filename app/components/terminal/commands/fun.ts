import type { Command } from "./types";
import {
  sleep,
  FORTUNES,
  FIGLET_CHARS,
  STEAM_LOCOMOTIVE_FRAMES,
  PING_RESPONSES,
} from "./utils";
import { unlockAchievement } from "../achievements";

/**
 * Cowsay command - make a cow say something
 */
const cowsayCommand: Command = {
  name: "cowsay",
  usage: "cowsay <msg>",
  description: "Make a cow say something",
  category: "fun",
  execute: (term, args) => {
    const message = args.join(" ") || "Moo!";

    // Unlock moo achievement
    unlockAchievement("moo");

    const maxWidth = 40;
    const words = message.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      if ((currentLine + " " + word).trim().length <= maxWidth) {
        currentLine = (currentLine + " " + word).trim();
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);

    const longestLine = Math.max(...lines.map((l) => l.length));
    const border = "-".repeat(longestLine + 2);

    term.writeln(` ${border}`);
    lines.forEach((line, i) => {
      const padding = " ".repeat(longestLine - line.length);
      if (lines.length === 1) {
        term.writeln(`< ${line}${padding} >`);
      } else if (i === 0) {
        term.writeln(`/ ${line}${padding} \\`);
      } else if (i === lines.length - 1) {
        term.writeln(`\\ ${line}${padding} /`);
      } else {
        term.writeln(`| ${line}${padding} |`);
      }
    });
    term.writeln(` ${border}`);
    term.writeln("        \\   ^__^");
    term.writeln("         \\  (oo)\\_______");
    term.writeln("            (__)\\       )\\/\\");
    term.writeln("                ||----w |");
    term.writeln("                ||     ||");
  },
};

/**
 * Fortune command - display random programming quote
 */
const fortuneCommand: Command = {
  name: "fortune",
  description: "Get a random programming quote",
  category: "fun",
  execute: (term) => {
    const fortune = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
    term.writeln(term.colorize("🔮 " + fortune, "brightCyan"));
  },
};

/**
 * Figlet command - create ASCII art text
 */
const figletCommand: Command = {
  name: "figlet",
  usage: "figlet <text>",
  description: "Create ASCII art text",
  category: "fun",
  execute: (term, args) => {
    const text = args.join(" ") || "Hello";
    const upperText = text.toUpperCase().slice(0, 10); // Limit to 10 chars
    const lines: string[] = ["", "", "", "", ""];

    for (const char of upperText) {
      const charArt = FIGLET_CHARS[char] || FIGLET_CHARS[" "];
      for (let i = 0; i < 5; i++) {
        lines[i] += charArt[i];
      }
    }

    lines.forEach((line) => term.writeln(term.colorize(line, "brightGreen")));
  },
};

/**
 * Ping command - ping a host with witty responses
 */
const pingCommand: Command = {
  name: "ping",
  usage: "ping <host>",
  description: "Ping a host (try google.com)",
  category: "fun",
  execute: async (term, args) => {
    const host = args[0];

    if (!host) {
      term.writeln(term.colorize("ping: missing host operand", "brightRed"));
      return;
    }

    term.writeln(
      `PING ${host} (${Math.floor(Math.random() * 255)}.${Math.floor(
        Math.random() * 255
      )}.${Math.floor(Math.random() * 255)}.${Math.floor(
        Math.random() * 255
      )}): 56 data bytes`
    );

    const responses = PING_RESPONSES[host.toLowerCase()] || [
      `64 bytes from ${host}: icmp_seq=1 ttl=64 time=${(
        Math.random() * 100
      ).toFixed(2)}ms`,
      `64 bytes from the digital ether: host seems confused`,
      `Response from ${host}: "Who are you and why are you pinging me?"`,
    ];

    for (let i = 0; i < 3; i++) {
      await sleep(800);
      term.writeln(responses[i % responses.length]);
    }

    term.writeln("");
    term.writeln(`--- ${host} ping statistics ---`);
    term.writeln(
      "3 packets transmitted, 3 received, 0% packet loss, time 2400ms"
    );
  },
};

/**
 * Sl command - steam locomotive (typo easter egg)
 */
const slCommand: Command = {
  name: "sl",
  description: "Steam locomotive (oops, typo!)",
  category: "fun",
  execute: async (term) => {
    term.writeln(
      term.colorize("🚂 Choo choo! You meant 'ls', didn't you?", "brightYellow")
    );
    term.writeln("");

    for (let i = 0; i < 4; i++) {
      const frame = STEAM_LOCOMOTIVE_FRAMES[i % 2];
      for (const line of frame) {
        term.writeln(term.colorize(line, "brightCyan"));
      }
      await sleep(300);
      if (i < 3) {
        // Clear the frame for animation effect
        for (let j = 0; j < frame.length; j++) {
          term.write("\x1b[A"); // Move cursor up
          term.write("\r\x1b[K"); // Clear line
        }
      }
    }
  },
};

/**
 * Sudo command - permission denied easter egg
 */
const sudoCommand: Command = {
  name: "sudo",
  usage: "sudo <command>",
  description: "Execute with privileges (nice try)",
  category: "fun",
  execute: async (term, args) => {
    // Unlock sudo_user achievement
    unlockAchievement("sudo_user");

    const arg = args.join(" ");
    if (!arg) {
      term.writeln(term.colorize("sudo: missing command", "brightRed"));
      return;
    }

    term.writeln(
      term.colorize("[sudo] password for guest: ", "brightYellow")
    );
    await sleep(800);
    term.writeln("");
    term.writeln(
      term.colorize("Nice try. This incident will be reported.", "brightRed")
    );
    term.writeln("");
    term.writeln(
      term.colorize(
        "Dec 16 03:14:15 frhd.me sudo: guest : command not allowed ; TTY=xterm ; PWD=~ ; USER=root ; COMMAND=/usr/bin/" +
          arg.split(" ")[0],
        "dim"
      )
    );
  },
};

/**
 * Rm command - remove files (fake with easter egg)
 */
const rmCommand: Command = {
  name: "rm",
  usage: "rm <file>",
  description: "Remove files (permission denied)",
  category: "fun",
  execute: async (term, args) => {
    const arg = args.join(" ");

    if (arg.startsWith("-rf") && arg.includes("/")) {
      // Unlock destroyer achievement
      unlockAchievement("destroyer");

      term.writeln(term.colorize("WARNING: NUCLEAR OPTION DETECTED", "brightRed"));
      term.writeln("");

      const files = [
        "/etc/passwd",
        "/var/log/*",
        "/home/*",
        "/usr/bin/*",
        "/boot/vmlinuz",
        "/root/.ssh/*",
        "/var/www/*",
        "/.secrets",
        "/consciousness.exe",
        "/reality.dll",
      ];

      for (const file of files) {
        term.writeln(`${term.colorize("rm:", "brightRed")} removing '${file}'`);
        await sleep(150);
      }

      term.writeln("");
      term.writeln(term.colorize("SYSTEM FAILURE IMMINENT", "brightRed"));
      await sleep(500);

      // Glitch effect
      const glitchChars = "!@#$%^&*()_+-=[]{}|;:,.<>?/~`";
      for (let i = 0; i < 5; i++) {
        let glitched = "";
        for (let j = 0; j < 40; j++) {
          glitched += glitchChars[Math.floor(Math.random() * glitchChars.length)];
        }
        term.writeln(term.colorize(glitched, "brightRed"));
        await sleep(100);
      }

      term.writeln("");
      await sleep(500);
      term.writeln(term.colorize("Just kidding! 😎", "brightGreen"));
      term.writeln(
        term.colorize(
          "You didn't really think I'd let you do that, did you?",
          "brightYellow"
        )
      );
    } else {
      term.writeln(
        term.colorize(
          `rm: cannot remove '${arg}': Permission denied`,
          "brightRed"
        )
      );
    }
  },
};

/**
 * Fork bomb command - easter egg
 */
const forkBombCommand: Command = {
  name: ":(){ :|:& };:",
  description: "Fork bomb (neutralized)",
  category: "fun",
  execute: (term) => {
    // Unlock fork_bomber achievement
    unlockAchievement("fork_bomber");

    term.writeln(term.colorize("⚠️  FORK BOMB DETECTED", "brightRed"));
    term.writeln("");
    term.writeln("Nice try, hacker. 😏");
    term.writeln("");
    term.writeln(
      term.colorize(
        "This classic bash fork bomb has been neutralized.",
        "brightYellow"
      )
    );
    term.writeln(
      term.colorize(
        "Your hacking skills are impressive, but not here.",
        "dim"
      )
    );
  },
};

/**
 * Banner command - display ASCII banner
 */
const bannerCommand: Command = {
  name: "banner",
  usage: "banner <text>",
  description: "Display ASCII banner",
  category: "fun",
  execute: (term, args) => {
    const text = args.join(" ") || "HELLO";
    const upperText = text.toUpperCase().slice(0, 8);

    term.writeln(term.colorize("═".repeat(upperText.length * 6 + 4), "brightCyan"));
    term.writeln(
      term.colorize(
        "║ " + upperText.split("").join(" ") + " ║",
        "brightCyan"
      )
    );
    term.writeln(term.colorize("═".repeat(upperText.length * 6 + 4), "brightCyan"));
  },
};

/**
 * All fun commands
 */
export const funCommands: Command[] = [
  cowsayCommand,
  fortuneCommand,
  figletCommand,
  pingCommand,
  slCommand,
  sudoCommand,
  rmCommand,
  forkBombCommand,
  bannerCommand,
];
