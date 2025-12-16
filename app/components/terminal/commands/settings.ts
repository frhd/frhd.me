import type { Command } from "./types";
import { dispatchEvent } from "./utils";
import { themes, getThemeNames, setStoredTheme, getStoredTheme } from "../xterm-themes";
import {
  isSoundEnabled,
  setSoundEnabled,
  isMusicPlaying,
  getMusicVolume,
  setMusicVolume,
  startMusic,
  stopMusic,
  playSound,
} from "../sound-manager";
import { unlockAchievement } from "../achievements";

/**
 * CRT effect storage key
 */
const CRT_STORAGE_KEY = "frhd-terminal-crt";

function getCrtEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(CRT_STORAGE_KEY) === "true";
}

function setCrtEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CRT_STORAGE_KEY, enabled ? "true" : "false");
}

/**
 * Theme command - list or change terminal theme
 */
const themeCommand: Command = {
  name: "theme",
  usage: "theme [name]",
  description: "List or change terminal theme",
  category: "visual",
  execute: (term, args) => {
    const subCommand = args[0]?.toLowerCase();

    if (!subCommand || subCommand === "list") {
      // List available themes
      term.writeln(term.colorize("Available themes:", "brightCyan"));
      term.writeln("");
      const currentTheme = getStoredTheme();
      getThemeNames().forEach((name) => {
        const theme = themes[name];
        const indicator =
          name === currentTheme
            ? term.colorize(" ← current", "brightYellow")
            : "";
        term.writeln(
          `  ${term.colorize(
            theme.displayName.padEnd(12),
            "brightGreen"
          )} ${theme.description}${indicator}`
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
        dispatchEvent("terminal-theme-change", { theme: themeName });

        term.writeln(
          term.colorize(`Theme changed to '${theme.displayName}'`, "brightGreen")
        );

        if (themeName === "light") {
          term.writeln("");
          term.writeln(
            term.colorize(
              "☀️ Light mode? Bold choice for a hacker terminal...",
              "brightYellow"
            )
          );
          term.writeln(
            term.colorize("Your neighbors can now see everything.", "dim")
          );
        }
      } else {
        term.writeln(term.colorize(`Unknown theme: ${themeName}`, "brightRed"));
        term.writeln(
          `Use ${term.colorize("theme list", "brightYellow")} to see available themes.`
        );
      }
    }
  },
};

/**
 * CRT command - toggle CRT monitor effect
 */
const crtCommand: Command = {
  name: "crt",
  usage: "crt on|off",
  description: "Toggle CRT monitor effect",
  category: "visual",
  execute: (term, args) => {
    const subCommand = args[0]?.toLowerCase();

    if (!subCommand) {
      const isEnabled = getCrtEnabled();
      term.writeln(
        `CRT effect is currently ${term.colorize(
          isEnabled ? "ON" : "OFF",
          isEnabled ? "brightGreen" : "brightRed"
        )}`
      );
      term.writeln("");
      term.writeln(term.colorize("Usage: crt on|off", "dim"));
    } else if (subCommand === "on") {
      setCrtEnabled(true);
      dispatchEvent("terminal-crt-change", { enabled: true });
      term.writeln(term.colorize("CRT effect enabled", "brightGreen"));
      term.writeln(
        term.colorize("📺 Now you're really living in the 80s!", "dim")
      );
    } else if (subCommand === "off") {
      setCrtEnabled(false);
      dispatchEvent("terminal-crt-change", { enabled: false });
      term.writeln(term.colorize("CRT effect disabled", "brightYellow"));
    } else {
      term.writeln(term.colorize("Usage: crt on|off", "brightRed"));
    }
  },
};

/**
 * Sound command - toggle sound effects
 */
const soundCommand: Command = {
  name: "sound",
  usage: "sound on|off",
  description: "Toggle keyboard & command sounds",
  category: "audio",
  execute: (term, args) => {
    const subCommand = args[0]?.toLowerCase();

    if (!subCommand) {
      const isEnabled = isSoundEnabled();
      term.writeln(
        `Sound effects are ${term.colorize(
          isEnabled ? "ON" : "OFF",
          isEnabled ? "brightGreen" : "brightRed"
        )}`
      );
      term.writeln("");
      term.writeln(term.colorize("Usage: sound on|off", "dim"));
    } else if (subCommand === "on") {
      setSoundEnabled(true);
      dispatchEvent("terminal-sound-change", { enabled: true });
      playSound("achievement");
      term.writeln(term.colorize("Sound effects enabled", "brightGreen"));
    } else if (subCommand === "off") {
      setSoundEnabled(false);
      dispatchEvent("terminal-sound-change", { enabled: false });
      term.writeln(term.colorize("Sound effects disabled", "brightYellow"));
    } else {
      term.writeln(term.colorize("Usage: sound on|off", "brightRed"));
    }
  },
};

/**
 * Music command - toggle ambient lo-fi music
 */
const musicCommand: Command = {
  name: "music",
  usage: "music play|stop|volume <0-100>",
  description: "Toggle ambient lo-fi music",
  category: "audio",
  execute: async (term, args) => {
    const subCommand = args[0]?.toLowerCase();

    if (!subCommand) {
      const isPlaying = isMusicPlaying();
      const volume = getMusicVolume();
      term.writeln(
        `Ambient music is ${term.colorize(
          isPlaying ? "PLAYING" : "STOPPED",
          isPlaying ? "brightGreen" : "brightRed"
        )}`
      );
      term.writeln(`Volume: ${term.colorize(volume + "%", "brightCyan")}`);
      term.writeln("");
      term.writeln(term.colorize("Usage: music play|stop|volume <0-100>", "dim"));
    } else if (subCommand === "play" || subCommand === "start") {
      term.writeln(term.colorize("Starting ambient music...", "brightCyan"));
      const success = await startMusic();
      if (success) {
        term.writeln(term.colorize("🎵 Ambient music playing", "brightGreen"));
        term.writeln(
          term.colorize(
            "Tip: Use 'music volume <0-100>' to adjust volume",
            "dim"
          )
        );
      } else {
        term.writeln(
          term.colorize(
            "Failed to start music. Try again after interacting with the terminal.",
            "brightRed"
          )
        );
      }
    } else if (subCommand === "stop" || subCommand === "pause") {
      stopMusic();
      term.writeln(term.colorize("Music stopped", "brightYellow"));
    } else if (subCommand === "volume" || subCommand === "vol") {
      const volumeArg = args[1];
      if (!volumeArg) {
        const currentVolume = getMusicVolume();
        term.writeln(
          `Current volume: ${term.colorize(currentVolume + "%", "brightCyan")}`
        );
        term.writeln(term.colorize("Usage: music volume <0-100>", "dim"));
      } else {
        const volume = parseInt(volumeArg, 10);
        if (isNaN(volume) || volume < 0 || volume > 100) {
          term.writeln(
            term.colorize(
              "Volume must be a number between 0 and 100",
              "brightRed"
            )
          );
        } else {
          setMusicVolume(volume);
          term.writeln(
            `Volume set to ${term.colorize(volume + "%", "brightGreen")}`
          );
        }
      }
    } else {
      term.writeln(
        term.colorize("Usage: music play|stop|volume <0-100>", "brightRed")
      );
    }
  },
};

/**
 * All settings commands
 */
export const settingsCommands: Command[] = [
  themeCommand,
  crtCommand,
  soundCommand,
  musicCommand,
];

/**
 * Export CRT enabled checker for backwards compatibility
 */
export { getCrtEnabled };
