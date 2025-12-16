import type { Command } from "./types";
import { typewriterEffect, sleep } from "./utils";
import { unlockAchievement } from "../achievements";

/**
 * About command - displays info about the developer
 */
const aboutCommand: Command = {
  name: "about",
  usage: "about [--decrypt]",
  description: "Learn about me",
  category: "info",
  execute: async (term, args) => {
    if (args[0] === "--decrypt" || args[0] === "-d") {
      await displayAboutDecrypted(term);
    } else {
      displayAbout(term);
    }
  },
};

function displayAbout(term: Parameters<Command["execute"]>[0]): void {
  term.writeln(term.colorize("=== About ===", "brightCyan"));
  term.writeln("");
  term.writeln("Name: Farhad");
  term.writeln("Role: Software Engineer");
  term.writeln("Location: Earth");
  term.writeln("");
  term.writeln(
    `For more details, run: ${term.colorize("about --decrypt", "brightYellow")}`
  );
}

async function displayAboutDecrypted(
  term: Parameters<Command["execute"]>[0]
): Promise<void> {
  const text = [
    "Decrypting biography...",
    "",
    "Name: Farhad",
    "Role: Full-Stack Engineer & Creative Technologist",
    "Specialties: Java, Kubernetes, Node.js, System Design, Sofware Architecture",
    "Interests: AI/ML, Creative Coding, Open Source",
    "",
    "Currently building innovative web experiences",
    "and exploring the intersection of code and creativity.",
  ];

  for (const line of text) {
    await typewriterEffect(term, line, 30);
    term.writeln("");
  }
}

/**
 * Contact command - displays contact information
 */
const contactCommand: Command = {
  name: "contact",
  description: "Get contact information",
  category: "info",
  execute: (term) => {
    term.writeln(term.colorize("=== Contact Information ===", "brightCyan"));
    term.writeln("");
    term.writeln(`${term.colorize("Email:", "brightGreen")}    hello@frhd.me`);
    term.writeln(`${term.colorize("GitHub:", "brightGreen")}   github.com/frhd`);
    term.writeln(
      `${term.colorize("LinkedIn:", "brightGreen")} linkedin.com/in/frhd`
    );
  },
};

/**
 * Neofetch command - displays system info
 */
const neofetchCommand: Command = {
  name: "neofetch",
  description: "Display system info",
  category: "info",
  execute: (term) => {
    const info = [
      term.colorize("       _____      _          _ ", "brightGreen"),
      term.colorize("      |  ___|_ _ | |__   ___| |", "brightGreen"),
      term.colorize("      | |_ / _` || '_ \\ / _ \\ |", "brightGreen"),
      term.colorize("      |  _| (_| || | | |  __/_|", "brightGreen"),
      term.colorize("      |_|  \\__,_||_| |_|\\___(_)", "brightGreen"),
      "",
      `${term.colorize("OS:", "brightCyan")} Linux frhd.me 5.15.0 x86_64`,
      `${term.colorize("Host:", "brightCyan")} Personal Terminal v2.0`,
      `${term.colorize("Kernel:", "brightCyan")} 5.15.0-web`,
      `${term.colorize("Uptime:", "brightCyan")} ${Math.floor(
        Math.random() * 365
      )} days`,
      `${term.colorize("Shell:", "brightCyan")} xterm.js`,
      `${term.colorize("Terminal:", "brightCyan")} XTerm`,
      `${term.colorize("CPU:", "brightCyan")} Intel Core i∞`,
      `${term.colorize("Memory:", "brightCyan")} ∞ GB / ∞ GB`,
    ];

    info.forEach((line) => term.writeln(line));
  },
};

/**
 * Scan command - scans systems (easter egg)
 */
const scanCommand: Command = {
  name: "scan",
  usage: "scan --systems",
  description: "Scan available systems",
  category: "info",
  execute: async (term, args) => {
    if (args[0] !== "--systems") {
      term.writeln(term.colorize("Usage: scan --systems", "brightRed"));
      return;
    }

    const systems = [
      "Neural Networks",
      "Quantum Processors",
      "Blockchain Nodes",
      "AI Models",
      "Cloud Infrastructure",
      "Edge Computing",
      "Distributed Systems",
    ];

    term.writeln(term.colorize("Scanning systems...", "brightYellow"));
    term.writeln("");

    for (const system of systems) {
      term.write(`[${term.colorize("SCAN", "brightCyan")}] ${system}`);
      await sleep(300);
      term.writeln(` ... ${term.colorize("ONLINE", "brightGreen")}`);
    }

    term.writeln("");
    term.writeln(term.colorize("All systems operational.", "brightGreen"));
  },
};

/**
 * Decrypt command - decrypts about section
 */
const decryptCommand: Command = {
  name: "decrypt",
  usage: "decrypt --about",
  description: "Decrypt extended bio",
  category: "info",
  execute: async (term, args) => {
    if (args[0] === "--about") {
      await displayAboutDecrypted(term);
    } else {
      term.writeln(term.colorize("Usage: decrypt --about", "brightRed"));
    }
  },
};

/**
 * Access command - access mainframe (easter egg)
 */
const accessCommand: Command = {
  name: "access",
  usage: "access --mainframe",
  description: "Access the mainframe (press 'q' to exit)",
  category: "info",
  execute: async (term, args) => {
    if (args[0] !== "--mainframe") {
      term.writeln(term.colorize("Usage: access --mainframe", "brightRed"));
      return;
    }

    term.writeln(term.colorize("ACCESS GRANTED", "brightGreen"));
    term.writeln("");
    term.writeln("Initiating enhanced matrix protocol...");
    term.writeln(term.colorize("Press 'q' or ESC to exit", "brightYellow"));
    await sleep(1000);

    // Trigger matrix effect
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("matrix-effect", { detail: {} }));
    }
  },
};

/**
 * Glitch command - display glitch effect
 */
const glitchCommand: Command = {
  name: "glitch",
  description: "????",
  category: "info",
  execute: async (term) => {
    const glitchChars = "!@#$%^&*()_+-=[]{}|;:,.<>?/~`";
    const originalText = "REALITY.EXE HAS STOPPED RESPONDING";

    for (let i = 0; i < 10; i++) {
      let glitched = "";
      for (const char of originalText) {
        glitched +=
          Math.random() > 0.5
            ? glitchChars[Math.floor(Math.random() * glitchChars.length)]
            : char;
      }
      term.write(`\r${term.colorize(glitched, "brightRed")}`);
      await sleep(100);
    }
    term.writeln(`\r${term.colorize(originalText, "brightRed")}`);
  },
};

/**
 * Download command - download consciousness (easter egg)
 */
const downloadCommand: Command = {
  name: "download",
  usage: "download --consciousness",
  description: "Download consciousness",
  category: "info",
  execute: async (term, args) => {
    if (args[0] !== "--consciousness") {
      term.writeln(
        term.colorize("Usage: download --consciousness", "brightRed")
      );
      return;
    }

    term.writeln(
      term.colorize("INITIATING CONSCIOUSNESS DOWNLOAD", "brightMagenta")
    );
    term.writeln("");

    const steps = [
      "Establishing neural link...",
      "Mapping synaptic pathways...",
      "Encoding memories...",
      "Compressing experiences...",
      "Packaging dreams...",
      "Finalizing transfer...",
    ];

    for (const step of steps) {
      term.write(step);
      await sleep(500);
      term.writeln(` ${term.colorize("✓", "brightGreen")}`);
    }

    term.writeln("");
    term.writeln(
      term.colorize("ERROR: Consciousness is not downloadable.", "brightRed")
    );
    term.writeln(term.colorize("It must be experienced.", "brightYellow"));
  },
};

/**
 * Find command - find files (limited, shows secrets)
 */
const findCommand: Command = {
  name: "find",
  usage: 'find / -name "*.secret"',
  description: "Find files (limited demo)",
  category: "info",
  execute: (term, args) => {
    const argStr = args.join(" ");
    if (argStr.includes("-name") && argStr.includes("*.secret")) {
      // Unlock achievement for discovering secrets
      unlockAchievement("secret_finder");

      term.writeln(
        term.colorize("Searching for hidden secrets...", "brightYellow")
      );
      term.writeln("");
      term.writeln("/.secrets");
      term.writeln("/.deeper");
      term.writeln("/.rabbit_hole");
      term.writeln("");
      term.writeln(
        term.colorize("Hint: Use 'cat' to read these files...", "dim")
      );
    } else {
      term.writeln(
        term.colorize("find: limited functionality in demo mode", "brightYellow")
      );
    }
  },
};

/**
 * All info commands
 */
export const infoCommands: Command[] = [
  aboutCommand,
  contactCommand,
  neofetchCommand,
  scanCommand,
  decryptCommand,
  accessCommand,
  glitchCommand,
  downloadCommand,
  findCommand,
];
