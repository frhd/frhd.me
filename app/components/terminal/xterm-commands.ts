/* eslint-disable @typescript-eslint/no-explicit-any */
import { themes, getThemeNames, setStoredTheme, getStoredTheme } from "./xterm-themes";

export async function executeCommand(
  term: any,
  command: string
): Promise<void> {
  const [cmd, ...args] = command.split(" ");
  const arg = args.join(" ");

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

  const gameCommands = [
    { name: "snake", desc: "Classic snake game" },
    { name: "tetris", desc: "The classic block game" },
    { name: "typing", desc: "Test your typing speed" },
    { name: "2048", desc: "Slide and merge numbers" },
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
  term.writeln(term.colorize("🐍 Launching Snake...", "brightGreen"));
  term.writeln(term.colorize("Arrow keys or WASD to move | SPACE to pause | Q/ESC to exit", "brightYellow"));

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("visual-effect", { detail: { effect: "snake" } }));
  }
}

function displayTetris(term: any): void {
  term.writeln(term.colorize("🧱 Launching Tetris...", "brightCyan"));
  term.writeln(term.colorize("Arrow keys to move | UP to rotate | ENTER for hard drop | Q/ESC to exit", "brightYellow"));

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("visual-effect", { detail: { effect: "tetris" } }));
  }
}

function displayTyping(term: any): void {
  term.writeln(term.colorize("⌨️  Launching Typing Test...", "brightMagenta"));
  term.writeln(term.colorize("Start typing when ready | TAB to skip whitespace | Q/ESC to exit", "brightYellow"));

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("visual-effect", { detail: { effect: "typing" } }));
  }
}

function display2048(term: any): void {
  term.writeln(term.colorize("🎮 Launching 2048...", "brightYellow"));
  term.writeln(term.colorize("Arrow keys to move | SPACE to restart | Q/ESC to exit", "brightYellow"));

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("visual-effect", { detail: { effect: "2048" } }));
  }
}