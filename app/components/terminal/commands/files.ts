import type { Command } from "./types";
import { unlockAchievement } from "../achievements";

/**
 * Virtual filesystem data
 */
const FILES: Record<string, string[]> = {
  "about.txt": [
    "Full-stack engineer passionate about building",
    "innovative web experiences and exploring the",
    "intersection of technology and creativity.",
  ],
  "skills.json": [
    "{",
    '  "languages": ["TypeScript", "JavaScript", "Python"],',
    '  "frameworks": ["React", "Next.js", "Node.js"],',
    '  "databases": ["PostgreSQL", "MongoDB", "Redis"],',
    '  "tools": ["Git", "Docker", "AWS"]',
    "}",
  ],
  "contact.md": [
    "# Contact Information",
    "",
    "- GitHub: github.com/frhd",
    "- Email: hello@frhd.me",
    "- LinkedIn: linkedin.com/in/farhadomid",
  ],
  ".secrets": [
    "You found the secrets file! But is this all there is?",
    "",
    "Hint: The rabbit hole goes deeper...",
    "Try: cat .deeper",
  ],
  ".deeper": [
    "██████████████████████████████████████████",
    "█                                        █",
    "█  You're getting warmer...              █",
    "█                                        █",
    "█  The truth awaits those who seek it.   █",
    "█                                        █",
    "█  One more level remains: .rabbit_hole  █",
    "█                                        █",
    "██████████████████████████████████████████",
  ],
  ".rabbit_hole": [
    "",
    "  ╔═══════════════════════════════════════════════════════╗",
    "  ║                                                       ║",
    "  ║   🐰 YOU FOUND THE RABBIT HOLE 🐰                     ║",
    "  ║                                                       ║",
    '  ║   "The Matrix has you..."                             ║',
    "  ║                                                       ║",
    "  ║   Congratulations, curious explorer.                  ║",
    "  ║   You've discovered the deepest secret.               ║",
    "  ║                                                       ║",
    "  ║   Here's a truth: The best code is                    ║",
    "  ║   the code you didn't have to write.                  ║",
    "  ║                                                       ║",
    "  ║   Thanks for exploring. Stay curious.                 ║",
    "  ║                                                       ║",
    "  ║   - Farhad                                            ║",
    "  ║                                                       ║",
    "  ╚═══════════════════════════════════════════════════════╝",
    "",
  ],
};

/**
 * Directory listing
 */
const DIRECTORY_CONTENTS = [
  { name: "about.txt", type: "file" },
  { name: "projects/", type: "dir" },
  { name: "skills.json", type: "file" },
  { name: "contact.md", type: "file" },
  { name: ".secrets", type: "file" },
];

/**
 * Ls command - list directory contents
 */
const lsCommand: Command = {
  name: "ls",
  description: "List directory contents",
  category: "files",
  execute: (term) => {
    DIRECTORY_CONTENTS.forEach(({ name, type }) => {
      const color = type === "dir" ? "brightBlue" : "white";
      term.writeln(term.colorize(name, color));
    });
  },
};

/**
 * Cat command - display file contents
 */
const catCommand: Command = {
  name: "cat",
  usage: "cat <file>",
  description: "Display file contents",
  category: "files",
  execute: (term, args) => {
    const filename = args.join(" ");

    if (!filename) {
      term.writeln(term.colorize("cat: missing file operand", "brightRed"));
      return;
    }

    // Achievement triggers for secret files
    if (filename === ".secrets") {
      unlockAchievement("secret_finder");
    } else if (filename === ".rabbit_hole") {
      unlockAchievement("rabbit_hole");
    }

    if (FILES[filename]) {
      FILES[filename].forEach((line) => term.writeln(line));
    } else {
      term.writeln(
        term.colorize(
          `cat: ${filename}: No such file or directory`,
          "brightRed"
        )
      );
    }
  },
};

/**
 * Cd command - change directory
 */
const cdCommand: Command = {
  name: "cd",
  usage: "cd <dir>",
  description: "Change directory",
  category: "files",
  execute: (term, args) => {
    const path = args[0];

    if (!path || path === "~") {
      term.cwd = "~";
    } else if (path === "..") {
      if (term.cwd !== "~") {
        term.cwd = "~";
      }
    } else if (path === "projects" || path === "./projects") {
      term.cwd = "~/projects";
    } else {
      term.writeln(
        term.colorize(`cd: ${path}: No such file or directory`, "brightRed")
      );
    }
  },
};

/**
 * Tree command - display directory tree
 */
const treeCommand: Command = {
  name: "tree",
  description: "Display directory tree",
  category: "files",
  execute: (term) => {
    term.writeln(term.colorize(".", "brightBlue"));
    term.writeln("├── " + term.colorize("about.txt", "white"));
    term.writeln("├── " + term.colorize("projects/", "brightBlue"));
    term.writeln("│   └── " + term.colorize("(explore to see more)", "dim"));
    term.writeln("├── " + term.colorize("skills.json", "white"));
    term.writeln("├── " + term.colorize("contact.md", "white"));
    term.writeln("└── " + term.colorize(".secrets", "dim"));
    term.writeln("");
    term.writeln(
      term.colorize("4 directories, 4 files (some hidden)", "dim")
    );
  },
};

/**
 * All file commands
 */
export const fileCommands: Command[] = [lsCommand, catCommand, cdCommand, treeCommand];
