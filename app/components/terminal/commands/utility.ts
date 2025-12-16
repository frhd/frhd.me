import type { Command } from "./types";
import { WEATHER_CONDITIONS } from "./utils";

/**
 * QR code command - generate QR codes
 */
const qrCommand: Command = {
  name: "qr",
  usage: "qr [url]",
  description: "Generate QR code (default: frhd.me)",
  category: "utility",
  execute: async (term, args) => {
    const targetUrl = args[0] || "https://frhd.me";

    term.writeln(term.colorize("Generating QR code...", "brightCyan"));
    term.writeln("");

    try {
      // Dynamic import to handle module resolution
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
  },
};

/**
 * Base64 command - encode/decode base64
 */
const base64Command: Command = {
  name: "base64",
  usage: "base64 encode|decode <text>",
  description: "Base64 encode/decode text",
  category: "utility",
  execute: (term, args) => {
    const subCommand = args[0]?.toLowerCase();
    const text = args.slice(1).join(" ");

    if (!subCommand || (subCommand !== "encode" && subCommand !== "decode")) {
      term.writeln(
        term.colorize("Usage: base64 encode|decode <text>", "brightYellow")
      );
      term.writeln("");
      term.writeln("Examples:");
      term.writeln(`  ${term.colorize("base64 encode Hello World", "dim")}`);
      term.writeln(
        `  ${term.colorize("base64 decode SGVsbG8gV29ybGQ=", "dim")}`
      );
      return;
    }

    if (!text) {
      term.writeln(
        term.colorize(`base64: missing text to ${subCommand}`, "brightRed")
      );
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
        term.writeln(
          term.colorize("Failed to decode - invalid base64 string", "brightRed")
        );
      }
    }
  },
};

/**
 * Calc command - simple calculator
 */
const calcCommand: Command = {
  name: "calc",
  usage: "calc <expr>",
  description: "Simple calculator",
  category: "utility",
  execute: (term, args) => {
    const expression = args.join(" ");

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
      term.writeln(
        term.colorize(
          "Invalid expression - only numbers and operators allowed",
          "brightRed"
        )
      );
      return;
    }

    // Replace ^ with ** for exponentiation
    const normalized = sanitized.replace(/\^/g, "**");

    try {
      // Safe evaluation using Function constructor
      const result = new Function(`"use strict"; return (${normalized})`)();

      if (typeof result === "number" && !isNaN(result) && isFinite(result)) {
        term.writeln(
          `${term.colorize(expression, "brightCyan")} = ${term.colorize(
            result.toString(),
            "brightGreen"
          )}`
        );
      } else {
        term.writeln(term.colorize("Invalid result", "brightRed"));
      }
    } catch {
      term.writeln(term.colorize("Invalid expression", "brightRed"));
    }
  },
};

/**
 * UUID command - generate random UUID
 */
const uuidCommand: Command = {
  name: "uuid",
  description: "Generate random UUID v4",
  category: "utility",
  execute: (term) => {
    const uuid = crypto.randomUUID();
    term.writeln(term.colorize("Generated UUID v4:", "brightCyan"));
    term.writeln(term.colorize(uuid, "brightGreen"));
    term.writeln("");
    term.writeln(term.colorize("Tip: Run again for a new UUID", "dim"));
  },
};

/**
 * Timestamp command - show current timestamps
 */
const timestampCommand: Command = {
  name: "timestamp",
  description: "Show current timestamps",
  category: "utility",
  execute: (term) => {
    const now = new Date();
    const unixSeconds = Math.floor(now.getTime() / 1000);
    const unixMs = now.getTime();
    const iso = now.toISOString();

    term.writeln(term.colorize("=== Timestamps ===", "brightCyan"));
    term.writeln("");
    term.writeln(
      `Unix (seconds): ${term.colorize(unixSeconds.toString(), "brightGreen")}`
    );
    term.writeln(
      `Unix (ms):      ${term.colorize(unixMs.toString(), "brightYellow")}`
    );
    term.writeln(`ISO 8601:       ${term.colorize(iso, "brightMagenta")}`);
    term.writeln(`Local:          ${term.colorize(now.toLocaleString(), "white")}`);
  },
};

/**
 * Weather command - show simulated weather
 */
const weatherCommand: Command = {
  name: "weather",
  usage: "weather [loc]",
  description: "Show weather (simulated)",
  category: "utility",
  execute: (term, args) => {
    const location = args.join(" ") || "Cyberspace";

    // Pick a random weather condition (simulated)
    const weather =
      WEATHER_CONDITIONS[Math.floor(Math.random() * WEATHER_CONDITIONS.length)];
    const temp =
      Math.floor(Math.random() * (weather.temp.max - weather.temp.min + 1)) +
      weather.temp.min;
    const humidity = Math.floor(Math.random() * 40) + 40; // 40-80%
    const wind = Math.floor(Math.random() * 30) + 5; // 5-35 km/h

    term.writeln(term.colorize(`Weather in ${location}`, "brightCyan"));
    term.writeln("");

    // Display ASCII art
    for (const line of weather.icon) {
      term.writeln(term.colorize(line, weather.color));
    }

    term.writeln("");
    term.writeln(`${term.colorize("Condition:", "white")} ${weather.desc}`);
    term.writeln(
      `${term.colorize("Temperature:", "white")} ${term.colorize(
        temp + "°C",
        "brightYellow"
      )} / ${term.colorize(
        Math.round((temp * 9) / 5 + 32) + "°F",
        "brightYellow"
      )}`
    );
    term.writeln(`${term.colorize("Humidity:", "white")} ${humidity}%`);
    term.writeln(`${term.colorize("Wind:", "white")} ${wind} km/h`);
    term.writeln("");
    term.writeln(
      term.colorize("* Weather data is simulated for demo purposes", "dim")
    );
  },
};

/**
 * Grep command - search text (limited)
 */
const grepCommand: Command = {
  name: "grep",
  usage: "grep <pattern>",
  description: "Search text (limited demo)",
  category: "utility",
  execute: (term, args) => {
    const pattern = args[0];

    if (!pattern) {
      term.writeln(term.colorize("Usage: grep <pattern>", "brightYellow"));
      return;
    }

    term.writeln(
      term.colorize(
        "grep: limited functionality in demo mode. Use 'cat' and 'find' instead.",
        "brightYellow"
      )
    );
  },
};

/**
 * All utility commands
 */
export const utilityCommands: Command[] = [
  qrCommand,
  base64Command,
  calcCommand,
  uuidCommand,
  timestampCommand,
  weatherCommand,
  grepCommand,
];
