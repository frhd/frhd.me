/* eslint-disable @typescript-eslint/no-explicit-any */
export async function executeCommand(
  term: any,
  command: string
): Promise<void> {
  const [cmd, ...args] = command.split(" ");
  const arg = args.join(" ");

  switch (cmd.toLowerCase()) {
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
        term.writeln(term.coloriz("Press 'q' or ESC to exit", "brightYellow"));
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
  ];

  term.writeln(term.colorize("Available Commands:", "brightCyan"));
  term.writeln("");
  commands.forEach(({ name, desc }) => {
    const paddedName = name.padEnd(25);
    term.writeln(
      `  ${term.colorize(paddedName, "brightGreen")} ${desc}`
    );
  });
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
    "Specialties: React, TypeScript, Node.js, System Design",
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
    ".secrets": ["Nice try ;)"],
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