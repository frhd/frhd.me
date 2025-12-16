/* eslint-disable @typescript-eslint/no-explicit-any */
import { themes, getThemeNames, setStoredTheme, getStoredTheme } from "./xterm-themes";
import {
  isSoundEnabled,
  setSoundEnabled,
  isMusicEnabled,
  getMusicVolume,
  setMusicVolume,
  startMusic,
  stopMusic,
  isMusicPlaying,
  playSound,
} from "./sound-manager";
import {
  unlockAchievement,
  trackCommand,
  getAchievementStats,
  getUnlockedAchievements,
  ACHIEVEMENTS,
  type AchievementId,
} from "./achievements";
import {
  getSessionUptime,
  getLastVisitString,
  getVisitData,
} from "./time-utils";
import {
  loadState,
  resetState,
  parseCommand as parseAdventureCommand,
  getStats as getAdventureStats,
  type AdventureState,
} from "./adventure-engine";

export async function executeCommand(
  term: any,
  command: string
): Promise<void> {
  const [cmd, ...args] = command.split(" ");
  const arg = args.join(" ");

  // Track command usage for completionist achievement
  if (command.trim()) {
    trackCommand(command);
    // Unlock first_command achievement on any valid command
    unlockAchievement("first_command");
  }

  switch (cmd.toLowerCase()) {
    case "theme":
      handleThemeCommand(term, args);
      break;
    case "help":
      displayHelp(term);
      break;

    case "clear":
      term.clear();
      term.scrollToTop();
      break;

    case "about":
      if (args[0] === "--decrypt" || args[0] === "-d") {
        await displayAboutDecrypted(term);
      } else {
        displayAbout(term);
      }
      break;

    case "matrix":
      displayMatrix(term);
      break;

    case "decrypt":
      if (arg === "--about") {
        await displayAboutDecrypted(term);
      } else {
        term.writeln(
          term.colorize("Usage: decrypt --about", "brightRed")
        );
      }
      break;

    case "whoami":
      term.writeln("guest@frhd.me");
      break;

    case "pwd":
      term.writeln(term.cwd);
      break;

    case "ls":
      displayLs(term);
      break;

    case "cat":
      if (arg) {
        displayCat(term, arg);
      } else {
        term.writeln(term.colorize("cat: missing file operand", "brightRed"));
      }
      break;

    case "cd":
      handleCd(term, arg);
      break;

    case "echo":
      term.writeln(arg);
      break;

    case "date":
      term.writeln(new Date().toString());
      break;

    case "neofetch":
      displayNeofetch(term);
      break;

    case "contact":
      displayContact(term);
      break;

    case "scan":
      if (arg === "--systems") {
        await displaySystemScan(term);
      } else {
        term.writeln(term.colorize("Usage: scan --systems", "brightRed"));
      }
      break;

    case "access":
      if (arg === "--mainframe") {
        term.writeln(term.colorize("ACCESS GRANTED", "brightGreen"));
        term.writeln("");
        term.writeln("Initiating enhanced matrix protocol...");
        term.writeln(term.colorize("Press 'q' or ESC to exit", "brightYellow"));
        await sleep(1000);
        displayMatrix(term);
      } else {
        term.writeln(term.colorize("Usage: access --mainframe", "brightRed"));
      }
      break;

    case "glitch":
      await displayGlitch(term);
      break;

    case "download":
      if (arg === "--consciousness") {
        await displayConsciousnessDownload(term);
      } else {
        term.writeln(
          term.colorize("Usage: download --consciousness", "brightRed")
        );
      }
      break;

    case "exit":
      await displayExit(term);
      break;

    case "sudo":
      await displaySudo(term, arg);
      break;

    case "rm":
      if (arg.startsWith("-rf") && arg.includes("/")) {
        await displayRmRf(term);
      } else {
        term.writeln(term.colorize(`rm: cannot remove '${arg}': Permission denied`, "brightRed"));
      }
      break;

    case ":(){ :|:& };:":
      displayForkBomb(term);
      break;

    case "ping":
      if (arg) {
        await displayPing(term, arg);
      } else {
        term.writeln(term.colorize("ping: missing host operand", "brightRed"));
      }
      break;

    case "sl":
      await displaySteamLocomotive(term);
      break;

    case "cowsay":
      displayCowsay(term, arg || "Moo!");
      break;

    case "fortune":
      displayFortune(term);
      break;

    case "figlet":
      displayFiglet(term, arg || "Hello");
      break;

    case "find":
      if (arg.includes("-name") && arg.includes("*.secret")) {
        displayFindSecrets(term);
      } else {
        term.writeln(term.colorize("find: limited functionality in demo mode", "brightYellow"));
      }
      break;

    case "crt":
      handleCrtCommand(term, args);
      break;

    case "pipes":
      displayPipes(term);
      break;

    case "plasma":
      displayPlasma(term);
      break;

    case "fireworks":
      displayFireworks(term);
      break;

    // Phase 3: Mini-Games
    case "snake":
      displaySnake(term);
      break;

    case "tetris":
      displayTetris(term);
      break;

    case "typing":
      displayTyping(term);
      break;

    case "2048":
      display2048(term);
      break;

    // Phase 4: Sound System
    case "sound":
      handleSoundCommand(term, args);
      break;

    case "music":
      await handleMusicCommand(term, args);
      break;

    // Phase 5: Achievements
    case "achievements":
      displayAchievements(term);
      break;

    // Phase 6: Time-Based Features
    case "uptime":
      displayUptime(term);
      break;

    case "last":
      displayLast(term);
      break;

    // Phase 7: QR Code & Utilities
    case "qr":
      await displayQrCode(term, arg);
      break;

    case "base64":
      handleBase64Command(term, args);
      break;

    case "calc":
      handleCalcCommand(term, arg);
      break;

    case "uuid":
      displayUuid(term);
      break;

    case "timestamp":
      displayTimestamp(term);
      break;

    case "weather":
      displayWeather(term, arg);
      break;

    // Phase 8: Text Adventure Game
    case "adventure":
      handleAdventureCommand(term, args);
      break;

    // Phase 9: Live Data Integration
    case "github":
      await handleGitHubCommand(term, args);
      break;

    case "status":
      displayStatus(term);
      break;

    case "news":
      await handleNewsCommand(term, args);
      break;

    default:
      if (command.trim()) {
        term.writeln(
          term.colorize(
            `Command not found: ${cmd}. Type 'help' for available commands.`,
            "brightRed"
          )
        );
      }
  }
}

function displayHelp(term: any): void {
  const commands = [
    { name: "help", desc: "Display this help message" },
    { name: "clear", desc: "Clear the terminal" },
    { name: "about", desc: "Learn about me" },
    { name: "about --decrypt", desc: "Decrypt extended bio" },
    { name: "matrix", desc: "Enter the Matrix (press 'q' to exit)" },
    { name: "whoami", desc: "Display current user" },
    { name: "pwd", desc: "Print working directory" },
    { name: "ls", desc: "List directory contents" },
    { name: "cat <file>", desc: "Display file contents" },
    { name: "cd <dir>", desc: "Change directory" },
    { name: "echo <text>", desc: "Display text" },
    { name: "date", desc: "Display current date" },
    { name: "neofetch", desc: "Display system info" },
    { name: "contact", desc: "Get contact information" },
    { name: "scan --systems", desc: "Scan available systems" },
    { name: "access --mainframe", desc: "Access the mainframe (press 'q' to exit)" },
    { name: "glitch", desc: "????" },
    { name: "download --consciousness", desc: "Download consciousness" },
    { name: "exit", desc: "Close terminal" },
  ];

  const funCommands = [
    { name: "cowsay <msg>", desc: "Make a cow say something" },
    { name: "fortune", desc: "Get a random programming quote" },
    { name: "figlet <text>", desc: "Create ASCII art text" },
    { name: "ping <host>", desc: "Ping a host (try google.com)" },
    { name: "sl", desc: "Steam locomotive (oops, typo!)" },
  ];

  const visualCommands = [
    { name: "theme [name]", desc: "List or change terminal theme" },
    { name: "crt on|off", desc: "Toggle CRT monitor effect" },
    { name: "pipes", desc: "Classic pipes screensaver" },
    { name: "plasma", desc: "Retro demoscene plasma effect" },
    { name: "fireworks", desc: "Celebratory fireworks display" },
  ];

  const soundCommands = [
    { name: "sound on|off", desc: "Toggle keyboard & command sounds" },
    { name: "music play|stop", desc: "Toggle ambient lo-fi music" },
    { name: "music volume <0-100>", desc: "Adjust music volume" },
  ];

  const achievementCommands = [
    { name: "achievements", desc: "View your unlocked achievements" },
  ];

  const timeCommands = [
    { name: "uptime", desc: "Show current session duration" },
    { name: "last", desc: "Show when you last visited" },
  ];

  const utilityCommands = [
    { name: "qr [url]", desc: "Generate QR code (default: frhd.me)" },
    { name: "base64 encode|decode", desc: "Base64 encode/decode text" },
    { name: "calc <expr>", desc: "Simple calculator" },
    { name: "uuid", desc: "Generate random UUID v4" },
    { name: "timestamp", desc: "Show current timestamps" },
    { name: "weather [loc]", desc: "Show weather (simulated)" },
  ];

  const liveDataCommands = [
    { name: "github", desc: "Show GitHub profile summary" },
    { name: "github repos", desc: "List public repositories" },
    { name: "github stats", desc: "Show GitHub stats" },
    { name: "status", desc: "Show site and session status" },
    { name: "news", desc: "Top tech news from Hacker News" },
  ];

  const gameCommands = [
    { name: "snake", desc: "Classic snake game" },
    { name: "tetris", desc: "The classic block game" },
    { name: "typing", desc: "Test your typing speed" },
    { name: "2048", desc: "Slide and merge numbers" },
    { name: "adventure", desc: "Text adventure game" },
  ];

  term.writeln(term.colorize("Available Commands:", "brightCyan"));
  term.writeln("");
  commands.forEach(({ name, desc }) => {
    const paddedName = name.padEnd(24);
    term.writeln(
      `  ${term.colorize(paddedName, "brightGreen")} ${desc}`
    );
  });

  term.writeln("");
  term.writeln(term.colorize("Fun Commands:", "brightMagenta"));
  term.writeln("");
  funCommands.forEach(({ name, desc }) => {
    const paddedName = name.padEnd(24);
    term.writeln(
      `  ${term.colorize(paddedName, "brightYellow")} ${desc}`
    );
  });

  term.writeln("");
  term.writeln(term.colorize("Visual & Themes:", "brightBlue"));
  term.writeln("");
  visualCommands.forEach(({ name, desc }) => {
    const paddedName = name.padEnd(24);
    term.writeln(
      `  ${term.colorize(paddedName, "cyan")} ${desc}`
    );
  });

  term.writeln("");
  term.writeln(term.colorize("Mini-Games:", "brightRed"));
  term.writeln("");
  gameCommands.forEach(({ name, desc }) => {
    const paddedName = name.padEnd(24);
    term.writeln(
      `  ${term.colorize(paddedName, "brightWhite")} ${desc}`
    );
  });

  term.writeln("");
  term.writeln(term.colorize("Audio:", "brightMagenta"));
  term.writeln("");
  soundCommands.forEach(({ name, desc }) => {
    const paddedName = name.padEnd(24);
    term.writeln(
      `  ${term.colorize(paddedName, "magenta")} ${desc}`
    );
  });

  term.writeln("");
  term.writeln(term.colorize("Progress:", "brightYellow"));
  term.writeln("");
  achievementCommands.forEach(({ name, desc }) => {
    const paddedName = name.padEnd(24);
    term.writeln(
      `  ${term.colorize(paddedName, "yellow")} ${desc}`
    );
  });

  term.writeln("");
  term.writeln(term.colorize("Session:", "brightCyan"));
  term.writeln("");
  timeCommands.forEach(({ name, desc }) => {
    const paddedName = name.padEnd(24);
    term.writeln(
      `  ${term.colorize(paddedName, "cyan")} ${desc}`
    );
  });

  term.writeln("");
  term.writeln(term.colorize("Utilities:", "brightGreen"));
  term.writeln("");
  utilityCommands.forEach(({ name, desc }) => {
    const paddedName = name.padEnd(24);
    term.writeln(
      `  ${term.colorize(paddedName, "green")} ${desc}`
    );
  });

  term.writeln("");
  term.writeln(term.colorize("Live Data:", "brightBlue"));
  term.writeln("");
  liveDataCommands.forEach(({ name, desc }) => {
    const paddedName = name.padEnd(24);
    term.writeln(
      `  ${term.colorize(paddedName, "blue")} ${desc}`
    );
  });

  term.writeln("");
  term.writeln(term.colorize("Hint: Try 'find / -name \"*.secret\"' to discover hidden files...", "dim"));
}

function displayAbout(term: any): void {
  term.writeln(term.colorize("=== About ===", "brightCyan"));
  term.writeln("");
  term.writeln("Name: Farhad");
  term.writeln("Role: Software Engineer");
  term.writeln("Location: Earth");
  term.writeln("");
  term.writeln(
    `For more details, run: ${term.colorize(
      "about --decrypt",
      "brightYellow"
    )}`
  );
}

async function displayAboutDecrypted(term: any): Promise<void> {
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function displayMatrix(_term: any): void {
  // Unlock matrix_fan achievement
  unlockAchievement("matrix_fan");

  // Trigger matrix rain effect in parent component
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent("matrix-effect", { detail: {} })
    );
  }
}

async function displayGlitch(term: any): Promise<void> {
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
}

function displayLs(term: any): void {
  const files = [
    { name: "about.txt", type: "file" },
    { name: "projects/", type: "dir" },
    { name: "skills.json", type: "file" },
    { name: "contact.md", type: "file" },
    { name: ".secrets", type: "file" },
  ];

  files.forEach(({ name, type }) => {
    const color = type === "dir" ? "brightBlue" : "white";
    term.writeln(term.colorize(name, color));
  });
}

function displayCat(term: any, filename: string): void {
  // Achievement triggers for secret files
  if (filename === ".secrets") {
    unlockAchievement("secret_finder");
  } else if (filename === ".rabbit_hole") {
    unlockAchievement("rabbit_hole");
  }

  const files: Record<string, string[]> = {
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
      "- LinkedIn: linkedin.com/in/frhd",
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
      "  ║   \"The Matrix has you...\"                             ║",
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

  if (files[filename]) {
    files[filename].forEach((line) => term.writeln(line));
  } else {
    term.writeln(
      term.colorize(`cat: ${filename}: No such file or directory`, "brightRed")
    );
  }
}

function handleCd(term: any, path: string): void {
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
}

function displayNeofetch(term: any): void {
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
}

function displayContact(term: any): void {
  term.writeln(term.colorize("=== Contact Information ===", "brightCyan"));
  term.writeln("");
  term.writeln(
    `${term.colorize("Email:", "brightGreen")}    hello@frhd.me`
  );
  term.writeln(
    `${term.colorize("GitHub:", "brightGreen")}   github.com/frhd`
  );
  term.writeln(
    `${term.colorize("LinkedIn:", "brightGreen")} linkedin.com/in/frhd`
  );
}

async function displaySystemScan(term: any): Promise<void> {
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
  term.writeln(
    term.colorize("All systems operational.", "brightGreen")
  );
}

async function displayConsciousnessDownload(term: any): Promise<void> {
  term.writeln(term.colorize("INITIATING CONSCIOUSNESS DOWNLOAD", "brightMagenta"));
  term.writeln("");
  
  const steps = [
    "Establishing neural link...",
    "Mapping synaptic pathways...",
    "Encoding memories...",
    "Compressing experiences...",
    "Packaging dreams...",
    "Finalizing transfer...",
  ];

  for (let i = 0; i < steps.length; i++) {
    term.write(steps[i]);
    await sleep(500);
    term.writeln(` ${term.colorize("✓", "brightGreen")}`);
  }

  term.writeln("");
  term.writeln(term.colorize("ERROR: Consciousness is not downloadable.", "brightRed"));
  term.writeln(term.colorize("It must be experienced.", "brightYellow"));
}

async function displayExit(term: any): Promise<void> {
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
}

// Phase 1: Joke/Easter Egg Commands

async function displaySudo(term: any, arg: string): Promise<void> {
  // Unlock sudo_user achievement
  unlockAchievement("sudo_user");

  if (!arg) {
    term.writeln(term.colorize("sudo: missing command", "brightRed"));
    return;
  }

  term.writeln(term.colorize("[sudo] password for guest: ", "brightYellow"));
  await sleep(800);
  term.writeln("");
  term.writeln(term.colorize("Nice try. This incident will be reported.", "brightRed"));
  term.writeln("");
  term.writeln(term.colorize("Dec 16 03:14:15 frhd.me sudo: guest : command not allowed ; TTY=xterm ; PWD=~ ; USER=root ; COMMAND=/usr/bin/" + arg.split(" ")[0], "dim"));
}

async function displayRmRf(term: any): Promise<void> {
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
  for (let i = 0; i < 5; i++) {
    const glitchChars = "!@#$%^&*()_+-=[]{}|;:,.<>?/~`";
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
  term.writeln(term.colorize("You didn't really think I'd let you do that, did you?", "brightYellow"));
}

function displayForkBomb(term: any): void {
  // Unlock fork_bomber achievement
  unlockAchievement("fork_bomber");

  term.writeln(term.colorize("⚠️  FORK BOMB DETECTED", "brightRed"));
  term.writeln("");
  term.writeln("Nice try, hacker. 😏");
  term.writeln("");
  term.writeln(term.colorize("This classic bash fork bomb has been neutralized.", "brightYellow"));
  term.writeln(term.colorize("Your hacking skills are impressive, but not here.", "dim"));
}

async function displayPing(term: any, host: string): Promise<void> {
  const wittyResponses: Record<string, string[]> = {
    "google.com": [
      "64 bytes from the void: icmp_seq=1 ttl=∞ time=0.001ms",
      "Google knows you're pinging them. They already knew.",
      "64 bytes from the omniscient cloud: time=instant",
    ],
    "localhost": [
      "64 bytes from yourself: Are you okay?",
      "Pinging yourself? That's deep.",
      "127.0.0.1 is lonely and appreciates the attention",
    ],
    "github.com": [
      "64 bytes from the code repository of dreams",
      "Response: 'Have you committed today?'",
      "GitHub responds: 'Your PR is still pending review'",
    ],
    "stackoverflow.com": [
      "64 bytes from the sacred texts",
      "Response: 'This question was marked as duplicate'",
      "Connection redirected to an answer from 2009",
    ],
    "frhd.me": [
      "64 bytes from home: You're already here!",
      "Response: 'Stop pinging yourself'",
      "Latency: 0ms (you're literally inside me)",
    ],
  };

  term.writeln(`PING ${host} (${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}): 56 data bytes`);

  const responses = wittyResponses[host.toLowerCase()] || [
    `64 bytes from ${host}: icmp_seq=1 ttl=64 time=${(Math.random() * 100).toFixed(2)}ms`,
    `64 bytes from the digital ether: host seems confused`,
    `Response from ${host}: "Who are you and why are you pinging me?"`,
  ];

  for (let i = 0; i < 3; i++) {
    await sleep(800);
    term.writeln(responses[i % responses.length]);
  }

  term.writeln("");
  term.writeln(`--- ${host} ping statistics ---`);
  term.writeln("3 packets transmitted, 3 received, 0% packet loss, time 2400ms");
}

async function displaySteamLocomotive(term: any): Promise<void> {
  const frames = [
    [
      "      ====        ________                ___________ ",
      "  _D _|  |_______/        \\__I_I_____===__|_________| ",
      "   |(_)---  |   H\\________/ |   |        =|___ ___|   ",
      "   /     |  |   H  |  |     |   |         ||_| |_||   ",
      "  |      |  |   H  |__--------------------| [___] |   ",
      "  | ________|___H__/__|_____/[][]~\\_______|       |   ",
      "  |/ |   |-----------I_____I [][] []  D   |=======|__ ",
      "__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__ ",
      " |/-=|___|=    ||    ||    ||    |_____/~\\___/        ",
      "  \\_/      \\O=====O=====O=====O_/      \\_/            ",
    ],
    [
      "      ====        ________                ___________ ",
      "  _D _|  |_______/        \\__I_I_____===__|_________| ",
      "   |(_)---  |   H\\________/ |   |        =|___ ___|   ",
      "   /     |  |   H  |  |     |   |         ||_| |_||   ",
      "  |      |  |   H  |__--------------------| [___] |   ",
      "  | ________|___H__/__|_____/[][]~\\_______|       |   ",
      "  |/ |   |-----------I_____I [][] []  D   |=======|__ ",
      "__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__ ",
      " |/-=|___|=   O=====O=====O=====O|_____/~\\___/        ",
      "  \\_/      \\_/      \\_/     \\_/  \\_/      \\_/         ",
    ],
  ];

  term.writeln(term.colorize("🚂 Choo choo! You meant 'ls', didn't you?", "brightYellow"));
  term.writeln("");

  for (let i = 0; i < 4; i++) {
    const frame = frames[i % 2];
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
}

function displayCowsay(term: any, message: string): void {
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

  const longestLine = Math.max(...lines.map(l => l.length));
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
}

const FORTUNES = [
  "There are only two hard things in Computer Science: cache invalidation and naming things. — Phil Karlton",
  "Any fool can write code that a computer can understand. Good programmers write code that humans can understand. — Martin Fowler",
  "First, solve the problem. Then, write the code. — John Johnson",
  "The best error message is the one that never shows up. — Thomas Fuchs",
  "Debugging is twice as hard as writing the code in the first place. — Brian Kernighan",
  "It's not a bug – it's an undocumented feature. — Anonymous",
  "Always code as if the guy who ends up maintaining your code will be a violent psychopath who knows where you live. — John Woods",
  "Weeks of coding can save you hours of planning. — Unknown",
  "There is no Ctrl-Z in life. — Unknown",
  "Code is like humor. When you have to explain it, it's bad. — Cory House",
  "The only way to learn a new programming language is by writing programs in it. — Dennis Ritchie",
  "Programming today is a race between software engineers striving to build bigger and better idiot-proof programs, and the Universe trying to produce bigger and better idiots. So far, the Universe is winning. — Rick Cook",
  "Walking on water and developing software from a specification are easy if both are frozen. — Edward V. Berard",
  "Give a man a program, frustrate him for a day. Teach a man to program, frustrate him for a lifetime. — Muhammad Waseem",
  "A good programmer is someone who always looks both ways before crossing a one-way street. — Doug Linder",
  "Measuring programming progress by lines of code is like measuring aircraft building progress by weight. — Bill Gates",
  "Before software can be reusable it first has to be usable. — Ralph Johnson",
  "The computer was born to solve problems that did not exist before. — Bill Gates",
  "In order to understand recursion, one must first understand recursion. — Unknown",
  "Talk is cheap. Show me the code. — Linus Torvalds",
  "99 little bugs in the code. 99 little bugs. Take one down, patch it around. 127 little bugs in the code. — Unknown",
  "Programming is like sex: one mistake and you have to support it for the rest of your life. — Michael Sinz",
  "Software and cathedrals are much the same – first we build them, then we pray. — Sam Redwine",
  "The most disastrous thing that you can ever learn is your first programming language. — Alan Kay",
  "A SQL query walks into a bar, walks up to two tables and asks... 'Can I join you?' — Unknown",
];

function displayFortune(term: any): void {
  const fortune = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
  term.writeln(term.colorize("🔮 " + fortune, "brightCyan"));
}

const FIGLET_CHARS: Record<string, string[]> = {
  "A": ["  █  ", " █ █ ", "█████", "█   █", "█   █"],
  "B": ["████ ", "█   █", "████ ", "█   █", "████ "],
  "C": [" ████", "█    ", "█    ", "█    ", " ████"],
  "D": ["████ ", "█   █", "█   █", "█   █", "████ "],
  "E": ["█████", "█    ", "████ ", "█    ", "█████"],
  "F": ["█████", "█    ", "████ ", "█    ", "█    "],
  "G": [" ████", "█    ", "█  ██", "█   █", " ████"],
  "H": ["█   █", "█   █", "█████", "█   █", "█   █"],
  "I": ["█████", "  █  ", "  █  ", "  █  ", "█████"],
  "J": ["█████", "   █ ", "   █ ", "█  █ ", " ██  "],
  "K": ["█   █", "█  █ ", "███  ", "█  █ ", "█   █"],
  "L": ["█    ", "█    ", "█    ", "█    ", "█████"],
  "M": ["█   █", "██ ██", "█ █ █", "█   █", "█   █"],
  "N": ["█   █", "██  █", "█ █ █", "█  ██", "█   █"],
  "O": [" ███ ", "█   █", "█   █", "█   █", " ███ "],
  "P": ["████ ", "█   █", "████ ", "█    ", "█    "],
  "Q": [" ███ ", "█   █", "█   █", "█  █ ", " ██ █"],
  "R": ["████ ", "█   █", "████ ", "█  █ ", "█   █"],
  "S": [" ████", "█    ", " ███ ", "    █", "████ "],
  "T": ["█████", "  █  ", "  █  ", "  █  ", "  █  "],
  "U": ["█   █", "█   █", "█   █", "█   █", " ███ "],
  "V": ["█   █", "█   █", "█   █", " █ █ ", "  █  "],
  "W": ["█   █", "█   █", "█ █ █", "██ ██", "█   █"],
  "X": ["█   █", " █ █ ", "  █  ", " █ █ ", "█   █"],
  "Y": ["█   █", " █ █ ", "  █  ", "  █  ", "  █  "],
  "Z": ["█████", "   █ ", "  █  ", " █   ", "█████"],
  " ": ["     ", "     ", "     ", "     ", "     "],
  "0": [" ███ ", "█  ██", "█ █ █", "██  █", " ███ "],
  "1": ["  █  ", " ██  ", "  █  ", "  █  ", " ███ "],
  "2": [" ███ ", "█   █", "  ██ ", " █   ", "█████"],
  "3": ["████ ", "    █", " ███ ", "    █", "████ "],
  "4": ["█   █", "█   █", "█████", "    █", "    █"],
  "5": ["█████", "█    ", "████ ", "    █", "████ "],
  "6": [" ███ ", "█    ", "████ ", "█   █", " ███ "],
  "7": ["█████", "   █ ", "  █  ", " █   ", "█    "],
  "8": [" ███ ", "█   █", " ███ ", "█   █", " ███ "],
  "9": [" ███ ", "█   █", " ████", "    █", " ███ "],
  "!": ["  █  ", "  █  ", "  █  ", "     ", "  █  "],
  "?": [" ███ ", "█   █", "  █  ", "     ", "  █  "],
};

function displayFiglet(term: any, text: string): void {
  const upperText = text.toUpperCase().slice(0, 10); // Limit to 10 chars
  const lines: string[] = ["", "", "", "", ""];

  for (const char of upperText) {
    const charArt = FIGLET_CHARS[char] || FIGLET_CHARS[" "];
    for (let i = 0; i < 5; i++) {
      lines[i] += charArt[i];
    }
  }

  lines.forEach(line => term.writeln(term.colorize(line, "brightGreen")));
}

function displayFindSecrets(term: any): void {
  term.writeln(term.colorize("Searching for hidden secrets...", "brightYellow"));
  term.writeln("");
  term.writeln("/.secrets");
  term.writeln("/.deeper");
  term.writeln("/.rabbit_hole");
  term.writeln("");
  term.writeln(term.colorize("Hint: Use 'cat' to read these files...", "dim"));
}

// Helper functions
async function typewriterEffect(
  term: any,
  text: string,
  delay: number
): Promise<void> {
  for (const char of text) {
    term.write(char);
    await sleep(delay);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Phase 2: Theme System

function handleThemeCommand(term: any, args: string[]): void {
  const subCommand = args[0]?.toLowerCase();

  if (!subCommand || subCommand === "list") {
    // List available themes
    term.writeln(term.colorize("Available themes:", "brightCyan"));
    term.writeln("");
    const currentTheme = getStoredTheme();
    getThemeNames().forEach((name) => {
      const theme = themes[name];
      const indicator = name === currentTheme ? term.colorize(" ← current", "brightYellow") : "";
      term.writeln(
        `  ${term.colorize(theme.displayName.padEnd(12), "brightGreen")} ${theme.description}${indicator}`
      );
    });
    term.writeln("");
    term.writeln(term.colorize("Usage: theme <name>", "dim"));
  } else {
    // Switch theme
    const themeName = subCommand;
    const theme = themes[themeName];

    if (theme) {
      // Unlock theme_switcher achievement
      unlockAchievement("theme_switcher");

      setStoredTheme(themeName);

      // Dispatch event to update terminal theme
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("terminal-theme-change", { detail: { theme: themeName } })
        );
      }

      term.writeln(term.colorize(`Theme changed to '${theme.displayName}'`, "brightGreen"));

      if (themeName === "light") {
        term.writeln("");
        term.writeln(term.colorize("☀️ Light mode? Bold choice for a hacker terminal...", "brightYellow"));
        term.writeln(term.colorize("Your neighbors can now see everything.", "dim"));
      }
    } else {
      term.writeln(term.colorize(`Unknown theme: ${themeName}`, "brightRed"));
      term.writeln(`Use ${term.colorize("theme list", "brightYellow")} to see available themes.`);
    }
  }
}

// Phase 2: CRT Effect

const CRT_STORAGE_KEY = "frhd-terminal-crt";

function getCrtEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(CRT_STORAGE_KEY) === "true";
}

function setCrtEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CRT_STORAGE_KEY, enabled ? "true" : "false");
}

function handleCrtCommand(term: any, args: string[]): void {
  const subCommand = args[0]?.toLowerCase();

  if (!subCommand) {
    const isEnabled = getCrtEnabled();
    term.writeln(`CRT effect is currently ${term.colorize(isEnabled ? "ON" : "OFF", isEnabled ? "brightGreen" : "brightRed")}`);
    term.writeln("");
    term.writeln(term.colorize("Usage: crt on|off", "dim"));
  } else if (subCommand === "on") {
    setCrtEnabled(true);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("terminal-crt-change", { detail: { enabled: true } }));
    }
    term.writeln(term.colorize("CRT effect enabled", "brightGreen"));
    term.writeln(term.colorize("📺 Now you're really living in the 80s!", "dim"));
  } else if (subCommand === "off") {
    setCrtEnabled(false);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("terminal-crt-change", { detail: { enabled: false } }));
    }
    term.writeln(term.colorize("CRT effect disabled", "brightYellow"));
  } else {
    term.writeln(term.colorize("Usage: crt on|off", "brightRed"));
  }
}

export { getCrtEnabled };

// Phase 2: Visual Effects

function displayPipes(term: any): void {
  term.writeln(term.colorize("Launching pipes screensaver...", "brightCyan"));
  term.writeln(term.colorize("Press 'q' or ESC to exit", "brightYellow"));

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("visual-effect", { detail: { effect: "pipes" } }));
  }
}

function displayPlasma(term: any): void {
  term.writeln(term.colorize("Launching plasma effect...", "brightMagenta"));
  term.writeln(term.colorize("Press 'q' or ESC to exit", "brightYellow"));

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("visual-effect", { detail: { effect: "plasma" } }));
  }
}

function displayFireworks(term: any): void {
  term.writeln(term.colorize("🎆 Launching fireworks...", "brightYellow"));
  term.writeln(term.colorize("Press 'q' or ESC to exit", "brightYellow"));

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("visual-effect", { detail: { effect: "fireworks" } }));
  }
}

// Phase 3: Mini-Games

function displaySnake(term: any): void {
  // Unlock game_on achievement
  unlockAchievement("game_on");

  term.writeln(term.colorize("🐍 Launching Snake...", "brightGreen"));
  term.writeln(term.colorize("Arrow keys or WASD to move | SPACE to pause | Q/ESC to exit", "brightYellow"));

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("visual-effect", { detail: { effect: "snake" } }));
  }
}

function displayTetris(term: any): void {
  // Unlock game_on achievement
  unlockAchievement("game_on");

  term.writeln(term.colorize("🧱 Launching Tetris...", "brightCyan"));
  term.writeln(term.colorize("Arrow keys to move | UP to rotate | ENTER for hard drop | Q/ESC to exit", "brightYellow"));

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("visual-effect", { detail: { effect: "tetris" } }));
  }
}

function displayTyping(term: any): void {
  // Unlock game_on achievement
  unlockAchievement("game_on");

  term.writeln(term.colorize("⌨️  Launching Typing Test...", "brightMagenta"));
  term.writeln(term.colorize("Start typing when ready | TAB to skip whitespace | Q/ESC to exit", "brightYellow"));

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("visual-effect", { detail: { effect: "typing" } }));
  }
}

function display2048(term: any): void {
  // Unlock game_on achievement
  unlockAchievement("game_on");

  term.writeln(term.colorize("🎮 Launching 2048...", "brightYellow"));
  term.writeln(term.colorize("Arrow keys to move | SPACE to restart | Q/ESC to exit", "brightYellow"));

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("visual-effect", { detail: { effect: "2048" } }));
  }
}

// Phase 4: Sound System

function handleSoundCommand(term: any, args: string[]): void {
  const subCommand = args[0]?.toLowerCase();

  if (!subCommand) {
    const isEnabled = isSoundEnabled();
    term.writeln(`Sound effects are ${term.colorize(isEnabled ? "ON" : "OFF", isEnabled ? "brightGreen" : "brightRed")}`);
    term.writeln("");
    term.writeln(term.colorize("Usage: sound on|off", "dim"));
  } else if (subCommand === "on") {
    setSoundEnabled(true);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("terminal-sound-change", { detail: { enabled: true } }));
    }
    playSound("achievement");
    term.writeln(term.colorize("Sound effects enabled", "brightGreen"));
  } else if (subCommand === "off") {
    setSoundEnabled(false);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("terminal-sound-change", { detail: { enabled: false } }));
    }
    term.writeln(term.colorize("Sound effects disabled", "brightYellow"));
  } else {
    term.writeln(term.colorize("Usage: sound on|off", "brightRed"));
  }
}

async function handleMusicCommand(term: any, args: string[]): Promise<void> {
  const subCommand = args[0]?.toLowerCase();

  if (!subCommand) {
    const isPlaying = isMusicPlaying();
    const volume = getMusicVolume();
    term.writeln(`Ambient music is ${term.colorize(isPlaying ? "PLAYING" : "STOPPED", isPlaying ? "brightGreen" : "brightRed")}`);
    term.writeln(`Volume: ${term.colorize(volume + "%", "brightCyan")}`);
    term.writeln("");
    term.writeln(term.colorize("Usage: music play|stop|volume <0-100>", "dim"));
  } else if (subCommand === "play" || subCommand === "start") {
    term.writeln(term.colorize("Starting ambient music...", "brightCyan"));
    const success = await startMusic();
    if (success) {
      term.writeln(term.colorize("🎵 Ambient music playing", "brightGreen"));
      term.writeln(term.colorize("Tip: Use 'music volume <0-100>' to adjust volume", "dim"));
    } else {
      term.writeln(term.colorize("Failed to start music. Try again after interacting with the terminal.", "brightRed"));
    }
  } else if (subCommand === "stop" || subCommand === "pause") {
    stopMusic();
    term.writeln(term.colorize("Music stopped", "brightYellow"));
  } else if (subCommand === "volume" || subCommand === "vol") {
    const volumeArg = args[1];
    if (!volumeArg) {
      const currentVolume = getMusicVolume();
      term.writeln(`Current volume: ${term.colorize(currentVolume + "%", "brightCyan")}`);
      term.writeln(term.colorize("Usage: music volume <0-100>", "dim"));
    } else {
      const volume = parseInt(volumeArg, 10);
      if (isNaN(volume) || volume < 0 || volume > 100) {
        term.writeln(term.colorize("Volume must be a number between 0 and 100", "brightRed"));
      } else {
        setMusicVolume(volume);
        term.writeln(`Volume set to ${term.colorize(volume + "%", "brightGreen")}`);
      }
    }
  } else {
    term.writeln(term.colorize("Usage: music play|stop|volume <0-100>", "brightRed"));
  }
}

// Phase 5: Achievements

function displayAchievements(term: any): void {
  const stats = getAchievementStats();
  const unlocked = getUnlockedAchievements();

  term.writeln(term.colorize("=== Achievements ===", "brightYellow"));
  term.writeln("");
  term.writeln(
    `Progress: ${term.colorize(`${stats.unlocked}/${stats.total}`, "brightGreen")} (${stats.percentage}%)`
  );
  term.writeln("");

  // Display all achievements
  const allIds = Object.keys(ACHIEVEMENTS) as AchievementId[];

  // Show unlocked achievements first
  const unlockedSet = new Set(unlocked);
  const sortedIds = [
    ...allIds.filter((id) => unlockedSet.has(id)),
    ...allIds.filter((id) => !unlockedSet.has(id)),
  ];

  for (const id of sortedIds) {
    const isUnlocked = unlockedSet.has(id);
    const achievement = ACHIEVEMENTS[id];

    if (achievement.secret && !isUnlocked) {
      term.writeln(term.colorize("○ 🔒 ?????? - Secret achievement", "dim"));
    } else {
      const status = isUnlocked ? "✓" : "○";
      const icon = isUnlocked ? achievement.icon : "🔒";
      const color = isUnlocked ? "brightGreen" : "dim";
      term.writeln(
        term.colorize(`${status} ${icon} ${achievement.name} - ${achievement.description}`, color)
      );
    }
  }

  term.writeln("");
  if (stats.unlocked < stats.total) {
    term.writeln(term.colorize("Tip: Explore the terminal to unlock more achievements!", "dim"));
  } else {
    term.writeln(term.colorize("🎉 Congratulations! You've unlocked all achievements!", "brightMagenta"));
  }
}

// Phase 6: Time-Based Features

function displayUptime(term: any): void {
  const uptime = getSessionUptime();
  term.writeln(term.colorize("=== Session Uptime ===", "brightCyan"));
  term.writeln("");
  term.writeln(`Current session: ${term.colorize(uptime, "brightGreen")}`);
  term.writeln("");
  term.writeln(term.colorize("Keep exploring!", "dim"));
}

function displayLast(term: any): void {
  const lastVisit = getLastVisitString();
  const visitData = getVisitData();

  term.writeln(term.colorize("=== Visit History ===", "brightCyan"));
  term.writeln("");

  if (lastVisit) {
    term.writeln(`Last visit: ${term.colorize(lastVisit, "brightYellow")}`);
  } else {
    term.writeln(term.colorize("This is your first visit!", "brightGreen"));
  }

  term.writeln(`Total visits: ${term.colorize(visitData.visitCount.toString(), "brightGreen")}`);
}

// Phase 7: QR Code & Utilities

async function displayQrCode(term: any, url: string): Promise<void> {
  const targetUrl = url || "https://frhd.me";

  term.writeln(term.colorize("Generating QR code...", "brightCyan"));
  term.writeln("");

  try {
    // Dynamic import to handle module resolution in both browser and test environments
    const QRCode = await import("qrcode");
    const qrModule = QRCode.default || QRCode;

    // Generate QR code as a string (text mode)
    const qrString = await qrModule.toString(targetUrl, {
      type: "utf8",
      errorCorrectionLevel: "M",
      margin: 1,
      scale: 1,
    });

    // Display each line of the QR code
    const lines = qrString.split("\n");
    for (const line of lines) {
      term.writeln(term.colorize(line, "brightWhite"));
    }

    term.writeln("");
    term.writeln(`URL: ${term.colorize(targetUrl, "brightGreen")}`);
    term.writeln(term.colorize("Scan with your phone camera!", "dim"));
  } catch {
    term.writeln(term.colorize("Failed to generate QR code", "brightRed"));
  }
}

function handleBase64Command(term: any, args: string[]): void {
  const subCommand = args[0]?.toLowerCase();
  const text = args.slice(1).join(" ");

  if (!subCommand || (subCommand !== "encode" && subCommand !== "decode")) {
    term.writeln(term.colorize("Usage: base64 encode|decode <text>", "brightYellow"));
    term.writeln("");
    term.writeln("Examples:");
    term.writeln(`  ${term.colorize("base64 encode Hello World", "dim")}`);
    term.writeln(`  ${term.colorize("base64 decode SGVsbG8gV29ybGQ=", "dim")}`);
    return;
  }

  if (!text) {
    term.writeln(term.colorize(`base64: missing text to ${subCommand}`, "brightRed"));
    return;
  }

  if (subCommand === "encode") {
    try {
      const encoded = btoa(text);
      term.writeln(term.colorize("Encoded:", "brightCyan"));
      term.writeln(encoded);
    } catch {
      term.writeln(term.colorize("Failed to encode text", "brightRed"));
    }
  } else {
    try {
      const decoded = atob(text);
      term.writeln(term.colorize("Decoded:", "brightCyan"));
      term.writeln(decoded);
    } catch {
      term.writeln(term.colorize("Failed to decode - invalid base64 string", "brightRed"));
    }
  }
}

function handleCalcCommand(term: any, expression: string): void {
  if (!expression) {
    term.writeln(term.colorize("Usage: calc <expression>", "brightYellow"));
    term.writeln("");
    term.writeln("Examples:");
    term.writeln(`  ${term.colorize("calc 2 + 2", "dim")}`);
    term.writeln(`  ${term.colorize("calc 100 * 3.14", "dim")}`);
    term.writeln(`  ${term.colorize("calc (10 + 5) / 3", "dim")}`);
    term.writeln(`  ${term.colorize("calc 2 ** 8", "dim")} (exponentiation)`);
    term.writeln(`  ${term.colorize("calc 17 % 5", "dim")} (modulo)`);
    return;
  }

  // Sanitize: only allow numbers, operators, parentheses, and spaces
  const sanitized = expression.replace(/\s+/g, "");
  const validPattern = /^[\d+\-*/%().\s^]+$/;

  if (!validPattern.test(sanitized)) {
    term.writeln(term.colorize("Invalid expression - only numbers and operators allowed", "brightRed"));
    return;
  }

  // Replace ^ with ** for exponentiation
  const normalized = sanitized.replace(/\^/g, "**");

  try {
    // Safe evaluation using Function constructor (safer than eval for this limited scope)
    const result = new Function(`"use strict"; return (${normalized})`)();

    if (typeof result === "number" && !isNaN(result) && isFinite(result)) {
      term.writeln(`${term.colorize(expression, "brightCyan")} = ${term.colorize(result.toString(), "brightGreen")}`);
    } else {
      term.writeln(term.colorize("Invalid result", "brightRed"));
    }
  } catch {
    term.writeln(term.colorize("Invalid expression", "brightRed"));
  }
}

function displayUuid(term: any): void {
  // Generate UUID v4
  const uuid = crypto.randomUUID();
  term.writeln(term.colorize("Generated UUID v4:", "brightCyan"));
  term.writeln(term.colorize(uuid, "brightGreen"));
  term.writeln("");
  term.writeln(term.colorize("Tip: Run again for a new UUID", "dim"));
}

function displayTimestamp(term: any): void {
  const now = new Date();
  const unixSeconds = Math.floor(now.getTime() / 1000);
  const unixMs = now.getTime();
  const iso = now.toISOString();

  term.writeln(term.colorize("=== Timestamps ===", "brightCyan"));
  term.writeln("");
  term.writeln(`Unix (seconds): ${term.colorize(unixSeconds.toString(), "brightGreen")}`);
  term.writeln(`Unix (ms):      ${term.colorize(unixMs.toString(), "brightYellow")}`);
  term.writeln(`ISO 8601:       ${term.colorize(iso, "brightMagenta")}`);
  term.writeln(`Local:          ${term.colorize(now.toLocaleString(), "white")}`);
}

const WEATHER_CONDITIONS = [
  {
    condition: "sunny",
    icon: [
      "    \\   /    ",
      "     .-.     ",
      "  ‒ (   ) ‒  ",
      "     `-᾿     ",
      "    /   \\    ",
    ],
    color: "brightYellow",
    temp: { min: 22, max: 35 },
    desc: "Clear sky",
  },
  {
    condition: "cloudy",
    icon: [
      "             ",
      "     .--.    ",
      "  .-(    ).  ",
      " (___.__)__) ",
      "             ",
    ],
    color: "white",
    temp: { min: 15, max: 25 },
    desc: "Cloudy",
  },
  {
    condition: "rainy",
    icon: [
      "     .-.     ",
      "    (   ).   ",
      "   (___(__)  ",
      "   ‚ʻ‚ʻ‚ʻ‚ʻ  ",
      "   ‚ʻ‚ʻ‚ʻ‚ʻ  ",
    ],
    color: "brightCyan",
    temp: { min: 10, max: 20 },
    desc: "Light rain",
  },
  {
    condition: "stormy",
    icon: [
      "     .-.     ",
      "    (   ).   ",
      "   (___(__)  ",
      "  ⚡ʻ‚⚡ʻ‚   ",
      "   ‚ʻ‚ʻ‚ʻ    ",
    ],
    color: "brightMagenta",
    temp: { min: 8, max: 18 },
    desc: "Thunderstorm",
  },
  {
    condition: "snowy",
    icon: [
      "     .-.     ",
      "    (   ).   ",
      "   (___(__)  ",
      "   * * * *   ",
      "  * * * *    ",
    ],
    color: "brightWhite",
    temp: { min: -10, max: 2 },
    desc: "Snowfall",
  },
  {
    condition: "foggy",
    icon: [
      "             ",
      "  _ - _ - _  ",
      " _ - _ - _ - ",
      "  - _ - _ -  ",
      "             ",
    ],
    color: "dim",
    temp: { min: 5, max: 15 },
    desc: "Foggy",
  },
];

function displayWeather(term: any, location: string): void {
  const loc = location || "Cyberspace";

  // Pick a random weather condition (simulated)
  const weather = WEATHER_CONDITIONS[Math.floor(Math.random() * WEATHER_CONDITIONS.length)];
  const temp = Math.floor(Math.random() * (weather.temp.max - weather.temp.min + 1)) + weather.temp.min;
  const humidity = Math.floor(Math.random() * 40) + 40; // 40-80%
  const wind = Math.floor(Math.random() * 30) + 5; // 5-35 km/h

  term.writeln(term.colorize(`Weather in ${loc}`, "brightCyan"));
  term.writeln("");

  // Display ASCII art
  for (const line of weather.icon) {
    term.writeln(term.colorize(line, weather.color));
  }

  term.writeln("");
  term.writeln(`${term.colorize("Condition:", "white")} ${weather.desc}`);
  term.writeln(`${term.colorize("Temperature:", "white")} ${term.colorize(temp + "°C", "brightYellow")} / ${term.colorize(Math.round(temp * 9 / 5 + 32) + "°F", "brightYellow")}`);
  term.writeln(`${term.colorize("Humidity:", "white")} ${humidity}%`);
  term.writeln(`${term.colorize("Wind:", "white")} ${wind} km/h`);
  term.writeln("");
  term.writeln(term.colorize("* Weather data is simulated for demo purposes", "dim"));
}

// Phase 8: Text Adventure Game

// Store adventure state in memory during session
let adventureState: AdventureState | null = null;
let adventureMode = false;

function handleAdventureCommand(term: any, args: string[]): void {
  const subCommand = args[0]?.toLowerCase();

  if (subCommand === "reset") {
    adventureState = resetState();
    adventureMode = false;
    term.writeln(term.colorize("Adventure progress reset.", "brightYellow"));
    term.writeln("Type 'adventure' to start a new journey.");
    return;
  }

  if (subCommand === "stats") {
    if (!adventureState) {
      adventureState = loadState();
    }
    const stats = getAdventureStats(adventureState);
    term.writeln(term.colorize("=== Adventure Stats ===", "brightCyan"));
    term.writeln("");
    term.writeln(`Moves: ${term.colorize(stats.moveCount.toString(), "brightGreen")}`);
    term.writeln(`Items: ${term.colorize(stats.itemsCollected.toString(), "brightYellow")}`);
    term.writeln(`Rooms: ${term.colorize(`${stats.roomsVisited}/${stats.totalRooms}`, "brightMagenta")}`);
    term.writeln(`Complete: ${term.colorize(stats.gameComplete ? "Yes" : "No", stats.gameComplete ? "brightGreen" : "brightRed")}`);
    return;
  }

  if (subCommand === "exit" || subCommand === "quit") {
    if (adventureMode) {
      adventureMode = false;
      term.writeln(term.colorize("Exited adventure mode.", "brightYellow"));
      term.writeln("Your progress has been saved. Type 'adventure' to continue.");
    } else {
      term.writeln(term.colorize("You're not in adventure mode.", "dim"));
    }
    return;
  }

  if (subCommand === "help") {
    displayAdventureHelp(term);
    return;
  }

  // Start or continue adventure
  if (!adventureState) {
    adventureState = loadState();
  }

  // Unlock game_on achievement
  unlockAchievement("game_on");

  // Enable adventure mode
  adventureMode = true;

  // If a command is provided (e.g., "adventure look"), execute it
  if (args.length > 0 && subCommand !== "start") {
    const adventureInput = args.join(" ");
    const result = parseAdventureCommand(adventureInput, adventureState);
    adventureState = result.newState;
    result.output.forEach((line) => term.writeln(line));

    // Check for game completion achievement
    if (adventureState.gameComplete) {
      unlockAchievement("completionist");
    }
  } else {
    // Start or show current state
    const result = parseAdventureCommand("look", adventureState);
    adventureState = result.newState;
    result.output.forEach((line) => term.writeln(line));
  }

  term.writeln("");
  term.writeln(term.colorize("Tip: Type commands directly or use 'adventure <command>'", "dim"));
  term.writeln(term.colorize("Type 'adventure exit' to leave adventure mode", "dim"));
}

function displayAdventureHelp(term: any): void {
  term.writeln(term.colorize("=== Adventure Mode ===", "brightCyan"));
  term.writeln("");
  term.writeln("An interactive text adventure exploring a developer's journey.");
  term.writeln("");
  term.writeln(term.colorize("Commands:", "brightYellow"));
  term.writeln("  adventure              Start or continue the adventure");
  term.writeln("  adventure reset        Reset progress and start over");
  term.writeln("  adventure stats        View your adventure statistics");
  term.writeln("  adventure exit         Exit adventure mode");
  term.writeln("  adventure help         Show this help");
  term.writeln("");
  term.writeln(term.colorize("In-game commands:", "brightYellow"));
  term.writeln("  look, l                Look around");
  term.writeln("  go <direction>         Move (north, south, east, west)");
  term.writeln("  n, s, e, w             Direction shortcuts");
  term.writeln("  take <item>            Pick up an item");
  term.writeln("  drop <item>            Drop an item");
  term.writeln("  inventory, i           Check your inventory");
  term.writeln("  examine <thing>        Examine something closely");
  term.writeln("  exits                  List available exits");
  term.writeln("  help                   In-game help");
  term.writeln("");
  term.writeln(term.colorize("Goal:", "brightGreen") + " Explore your career journey, collect memories,");
  term.writeln("and reach the summit to claim your reward!");
}

// Export adventure mode state for potential use in extensions
export function isInAdventureMode(): boolean {
  return adventureMode;
}

export function executeAdventureInput(term: any, input: string): void {
  if (!adventureState) {
    adventureState = loadState();
  }
  const result = parseAdventureCommand(input, adventureState);
  adventureState = result.newState;
  result.output.forEach((line) => term.writeln(line));

  if (adventureState.gameComplete) {
    unlockAchievement("completionist");
  }
}

// Phase 9: Live Data Integration

const GITHUB_USERNAME = "frhd";
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

interface CachedData<T> {
  data: T;
  timestamp: number;
}

interface GitHubUser {
  login: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  avatar_url: string;
  html_url: string;
  created_at: string;
}

interface GitHubRepo {
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
}

interface HackerNewsStory {
  id: number;
  title: string;
  url?: string;
  score: number;
  by: string;
  time: number;
}

function getCachedData<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    const cached: CachedData<T> = JSON.parse(stored);
    if (Date.now() - cached.timestamp > CACHE_DURATION) {
      localStorage.removeItem(key);
      return null;
    }
    return cached.data;
  } catch {
    return null;
  }
}

function setCachedData<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    const cached: CachedData<T> = { data, timestamp: Date.now() };
    localStorage.setItem(key, JSON.stringify(cached));
  } catch {
    // Storage might be full, silently fail
  }
}

async function handleGitHubCommand(term: any, args: string[]): Promise<void> {
  const subCommand = args[0]?.toLowerCase();

  if (!subCommand || subCommand === "profile") {
    await displayGitHubProfile(term);
  } else if (subCommand === "repos") {
    await displayGitHubRepos(term);
  } else if (subCommand === "stats") {
    await displayGitHubStats(term);
  } else {
    term.writeln(term.colorize("Usage: github [profile|repos|stats]", "brightYellow"));
    term.writeln("");
    term.writeln(`  ${term.colorize("github", "dim")}         Show GitHub profile summary`);
    term.writeln(`  ${term.colorize("github repos", "dim")}   List public repositories`);
    term.writeln(`  ${term.colorize("github stats", "dim")}   Show contribution stats`);
  }
}

async function displayGitHubProfile(term: any): Promise<void> {
  const cacheKey = `frhd-github-profile-${GITHUB_USERNAME}`;
  let userData = getCachedData<GitHubUser>(cacheKey);

  if (!userData) {
    term.writeln(term.colorize("Fetching GitHub profile...", "brightCyan"));
    try {
      const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      userData = await response.json();
      setCachedData(cacheKey, userData);
    } catch (error) {
      term.writeln(term.colorize("Failed to fetch GitHub profile", "brightRed"));
      term.writeln(term.colorize(`Error: ${error instanceof Error ? error.message : "Unknown error"}`, "dim"));
      return;
    }
  }

  if (!userData) {
    term.writeln(term.colorize("No profile data available", "brightRed"));
    return;
  }

  term.writeln(term.colorize("=== GitHub Profile ===", "brightCyan"));
  term.writeln("");
  term.writeln(`${term.colorize("User:", "white")} ${term.colorize(userData.login, "brightGreen")}`);
  if (userData.name) {
    term.writeln(`${term.colorize("Name:", "white")} ${userData.name}`);
  }
  if (userData.bio) {
    term.writeln(`${term.colorize("Bio:", "white")} ${userData.bio}`);
  }
  term.writeln(`${term.colorize("Public Repos:", "white")} ${term.colorize(userData.public_repos.toString(), "brightYellow")}`);
  term.writeln(`${term.colorize("Followers:", "white")} ${userData.followers}`);
  term.writeln(`${term.colorize("Following:", "white")} ${userData.following}`);
  term.writeln(`${term.colorize("URL:", "white")} ${term.colorize(userData.html_url, "brightBlue")}`);
  term.writeln("");
  term.writeln(term.colorize("Use 'github repos' to see repositories", "dim"));
}

async function displayGitHubRepos(term: any): Promise<void> {
  const cacheKey = `frhd-github-repos-${GITHUB_USERNAME}`;
  let repos = getCachedData<GitHubRepo[]>(cacheKey);

  if (!repos) {
    term.writeln(term.colorize("Fetching repositories...", "brightCyan"));
    try {
      const response = await fetch(
        `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=10`
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      repos = await response.json();
      setCachedData(cacheKey, repos);
    } catch (error) {
      term.writeln(term.colorize("Failed to fetch repositories", "brightRed"));
      term.writeln(term.colorize(`Error: ${error instanceof Error ? error.message : "Unknown error"}`, "dim"));
      return;
    }
  }

  term.writeln(term.colorize("=== Public Repositories ===", "brightCyan"));
  term.writeln("");

  if (!repos || repos.length === 0) {
    term.writeln(term.colorize("No public repositories found", "dim"));
    return;
  }

  for (const repo of repos.slice(0, 10)) {
    const stars = repo.stargazers_count > 0 ? ` ⭐${repo.stargazers_count}` : "";
    const lang = repo.language ? term.colorize(` [${repo.language}]`, "brightMagenta") : "";
    term.writeln(`${term.colorize(repo.name, "brightGreen")}${lang}${stars}`);
    if (repo.description) {
      term.writeln(`  ${term.colorize(repo.description.slice(0, 60), "dim")}${repo.description.length > 60 ? "..." : ""}`);
    }
  }

  term.writeln("");
  term.writeln(term.colorize(`View more at: github.com/${GITHUB_USERNAME}`, "dim"));
}

async function displayGitHubStats(term: any): Promise<void> {
  const cacheKey = `frhd-github-stats-${GITHUB_USERNAME}`;

  // GitHub doesn't have a public API for contribution stats, so we'll show what we can
  let userData = getCachedData<GitHubUser>(`frhd-github-profile-${GITHUB_USERNAME}`);
  let repos = getCachedData<GitHubRepo[]>(`frhd-github-repos-${GITHUB_USERNAME}`);

  if (!userData || !repos) {
    term.writeln(term.colorize("Fetching stats...", "brightCyan"));
    try {
      const [userResponse, reposResponse] = await Promise.all([
        fetch(`https://api.github.com/users/${GITHUB_USERNAME}`),
        fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100`)
      ]);

      if (!userResponse.ok || !reposResponse.ok) {
        throw new Error("Failed to fetch data");
      }

      userData = await userResponse.json();
      repos = await reposResponse.json();
      setCachedData(`frhd-github-profile-${GITHUB_USERNAME}`, userData);
      setCachedData(cacheKey, repos);
    } catch (error) {
      term.writeln(term.colorize("Failed to fetch stats", "brightRed"));
      term.writeln(term.colorize(`Error: ${error instanceof Error ? error.message : "Unknown error"}`, "dim"));
      return;
    }
  }

  // Calculate stats from available data
  const totalStars = repos?.reduce((sum, repo) => sum + repo.stargazers_count, 0) || 0;
  const totalForks = repos?.reduce((sum, repo) => sum + repo.forks_count, 0) || 0;
  const languages = new Set(repos?.map(r => r.language).filter(Boolean));
  const memberSince = userData?.created_at ? new Date(userData.created_at).getFullYear() : "Unknown";

  term.writeln(term.colorize("=== GitHub Stats ===", "brightCyan"));
  term.writeln("");
  term.writeln(`${term.colorize("Total Repositories:", "white")} ${term.colorize(userData?.public_repos?.toString() || "0", "brightYellow")}`);
  term.writeln(`${term.colorize("Total Stars:", "white")} ${term.colorize(`⭐ ${totalStars}`, "brightYellow")}`);
  term.writeln(`${term.colorize("Total Forks:", "white")} ${term.colorize(`🍴 ${totalForks}`, "brightGreen")}`);
  term.writeln(`${term.colorize("Languages:", "white")} ${term.colorize(languages.size.toString(), "brightMagenta")}`);
  term.writeln(`${term.colorize("Member Since:", "white")} ${memberSince}`);
  term.writeln(`${term.colorize("Followers:", "white")} ${userData?.followers || 0}`);
  term.writeln("");

  // Show top languages
  const langCounts: Record<string, number> = {};
  repos?.forEach(repo => {
    if (repo.language) {
      langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
    }
  });
  const topLangs = Object.entries(langCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (topLangs.length > 0) {
    term.writeln(term.colorize("Top Languages:", "brightYellow"));
    for (const [lang, count] of topLangs) {
      const bar = "█".repeat(Math.min(count * 2, 20));
      term.writeln(`  ${term.colorize(lang.padEnd(12), "brightGreen")} ${term.colorize(bar, "brightCyan")} ${count}`);
    }
  }

  term.writeln("");
  term.writeln(term.colorize("Note: Contribution graph requires authentication", "dim"));
}

function displayStatus(term: any): void {
  const visitData = getVisitData();
  const uptime = getSessionUptime();

  term.writeln(term.colorize("=== Site Status ===", "brightCyan"));
  term.writeln("");
  term.writeln(`${term.colorize("Status:", "white")} ${term.colorize("● Online", "brightGreen")}`);
  term.writeln(`${term.colorize("Server:", "white")} Vercel Edge Network`);
  term.writeln(`${term.colorize("Region:", "white")} Global CDN`);
  term.writeln(`${term.colorize("Framework:", "white")} Next.js 15`);
  term.writeln(`${term.colorize("Rendering:", "white")} Static Export`);
  term.writeln("");
  term.writeln(term.colorize("=== Session Info ===", "brightYellow"));
  term.writeln(`${term.colorize("Current Session:", "white")} ${uptime}`);
  term.writeln(`${term.colorize("Your Visit Count:", "white")} ${term.colorize(visitData.visitCount.toString(), "brightGreen")}`);
  term.writeln("");
  term.writeln(term.colorize("=== Browser Info ===", "brightMagenta"));

  if (typeof navigator !== "undefined") {
    const ua = navigator.userAgent;
    const isMobile = /Mobile|Android|iPhone/i.test(ua);
    const browser = ua.includes("Firefox") ? "Firefox" :
                   ua.includes("Chrome") ? "Chrome" :
                   ua.includes("Safari") ? "Safari" :
                   ua.includes("Edge") ? "Edge" : "Unknown";

    term.writeln(`${term.colorize("Browser:", "white")} ${browser}`);
    term.writeln(`${term.colorize("Device:", "white")} ${isMobile ? "Mobile" : "Desktop"}`);
    term.writeln(`${term.colorize("Online:", "white")} ${navigator.onLine ? term.colorize("Yes", "brightGreen") : term.colorize("No", "brightRed")}`);
  }
}

async function handleNewsCommand(term: any, args: string[]): Promise<void> {
  const flag = args[0]?.toLowerCase();

  if (flag !== "--tech" && flag !== "-t" && !flag) {
    await displayTechNews(term);
  } else if (flag === "--tech" || flag === "-t") {
    await displayTechNews(term);
  } else {
    term.writeln(term.colorize("Usage: news [--tech]", "brightYellow"));
    term.writeln("");
    term.writeln(`  ${term.colorize("news", "dim")}        Show tech news from Hacker News`);
    term.writeln(`  ${term.colorize("news --tech", "dim")} Same as above`);
  }
}

async function displayTechNews(term: any): Promise<void> {
  const cacheKey = "frhd-hackernews-top";
  let stories = getCachedData<HackerNewsStory[]>(cacheKey);

  if (!stories) {
    term.writeln(term.colorize("Fetching latest tech news...", "brightCyan"));
    try {
      // Fetch top story IDs
      const idsResponse = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json");
      if (!idsResponse.ok) {
        throw new Error(`HTTP ${idsResponse.status}`);
      }
      const allIds: number[] = await idsResponse.json();
      const topIds = allIds.slice(0, 10);

      // Fetch story details
      const storyPromises = topIds.map(id =>
        fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(r => r.json())
      );
      stories = await Promise.all(storyPromises);
      setCachedData(cacheKey, stories);
    } catch (error) {
      term.writeln(term.colorize("Failed to fetch news", "brightRed"));
      term.writeln(term.colorize(`Error: ${error instanceof Error ? error.message : "Unknown error"}`, "dim"));
      return;
    }
  }

  term.writeln(term.colorize("=== Hacker News Top Stories ===", "brightCyan"));
  term.writeln("");

  if (!stories || stories.length === 0) {
    term.writeln(term.colorize("No stories found", "dim"));
    return;
  }

  for (let i = 0; i < stories.length; i++) {
    const story = stories[i];
    if (!story) continue;

    const rank = term.colorize(`${(i + 1).toString().padStart(2)}.`, "dim");
    const points = term.colorize(`▲${story.score}`, "brightYellow");
    const title = story.title.length > 55
      ? story.title.slice(0, 55) + "..."
      : story.title;

    term.writeln(`${rank} ${title}`);
    term.writeln(`    ${points} by ${term.colorize(story.by, "brightGreen")}`);
  }

  term.writeln("");
  term.writeln(term.colorize("Source: news.ycombinator.com", "dim"));
  term.writeln(term.colorize("Data cached for 1 hour", "dim"));
}

export { isSoundEnabled, isMusicEnabled, unlockAchievement };