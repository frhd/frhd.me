/**
 * Achievement Definitions
 * Static data for all achievements in the terminal
 */

// Achievement IDs
export type AchievementId =
  | "first_command"
  | "matrix_fan"
  | "secret_finder"
  | "rabbit_hole"
  | "game_on"
  | "high_scorer"
  | "night_owl"
  | "early_bird"
  | "completionist"
  | "speed_demon"
  | "fork_bomber"
  | "sudo_user"
  | "destroyer"
  | "theme_switcher"
  | "moo";

// Achievement definition interface
export interface Achievement {
  id: AchievementId;
  name: string;
  description: string;
  icon: string;
  secret?: boolean; // Hidden until unlocked
}

// All achievement definitions
export const ACHIEVEMENTS: Record<AchievementId, Achievement> = {
  first_command: {
    id: "first_command",
    name: "Hello, World!",
    description: "Run your first command",
    icon: "🎉",
  },
  matrix_fan: {
    id: "matrix_fan",
    name: "Red Pill",
    description: "Activate the Matrix effect",
    icon: "💊",
  },
  secret_finder: {
    id: "secret_finder",
    name: "Curious Cat",
    description: "Find the .secrets file",
    icon: "🔍",
  },
  rabbit_hole: {
    id: "rabbit_hole",
    name: "White Rabbit",
    description: "Reach the deepest secret",
    icon: "🐰",
  },
  game_on: {
    id: "game_on",
    name: "Player One",
    description: "Play any mini-game",
    icon: "🎮",
  },
  high_scorer: {
    id: "high_scorer",
    name: "High Score!",
    description: "Beat a high score in any game",
    icon: "🏆",
  },
  night_owl: {
    id: "night_owl",
    name: "Night Owl",
    description: "Visit between 2am and 5am",
    icon: "🦉",
    secret: true,
  },
  early_bird: {
    id: "early_bird",
    name: "Early Bird",
    description: "Visit between 5am and 7am",
    icon: "🐦",
    secret: true,
  },
  completionist: {
    id: "completionist",
    name: "Completionist",
    description: "Run every available command",
    icon: "✨",
    secret: true,
  },
  speed_demon: {
    id: "speed_demon",
    name: "Speed Demon",
    description: "Achieve 60+ WPM in the typing test",
    icon: "⚡",
  },
  fork_bomber: {
    id: "fork_bomber",
    name: "Nice Try",
    description: "Attempt a fork bomb",
    icon: "💣",
    secret: true,
  },
  sudo_user: {
    id: "sudo_user",
    name: "Sudo Master",
    description: "Try to use sudo",
    icon: "🔐",
    secret: true,
  },
  destroyer: {
    id: "destroyer",
    name: "Destroyer of Worlds",
    description: "Attempt rm -rf /",
    icon: "💥",
    secret: true,
  },
  theme_switcher: {
    id: "theme_switcher",
    name: "Fashion Forward",
    description: "Change the terminal theme",
    icon: "🎨",
  },
  moo: {
    id: "moo",
    name: "Moo!",
    description: "Make a cow say something",
    icon: "🐄",
  },
};

// List of all commands for completionist tracking
export const ALL_COMMANDS = [
  "help",
  "clear",
  "about",
  "matrix",
  "whoami",
  "pwd",
  "ls",
  "cat",
  "cd",
  "echo",
  "date",
  "neofetch",
  "contact",
  "scan",
  "access",
  "glitch",
  "download",
  "exit",
  "cowsay",
  "fortune",
  "figlet",
  "ping",
  "sl",
  "theme",
  "crt",
  "pipes",
  "plasma",
  "fireworks",
  "snake",
  "tetris",
  "typing",
  "2048",
  "sound",
  "music",
];
