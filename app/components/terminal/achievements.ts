/**
 * Achievements System for Terminal
 * Tracks and manages unlockable achievements for gamification
 */

// Storage key
const ACHIEVEMENTS_STORAGE_KEY = "frhd-terminal-achievements";

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

// Achievement definition
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

// State for unlocked achievements
interface AchievementState {
  unlockedAt: number; // timestamp
}

type AchievementsStore = Partial<Record<AchievementId, AchievementState>>;

// In-memory cache
let achievementsCache: AchievementsStore | null = null;

// Commands tracker for completionist achievement
const ALL_COMMANDS = [
  "help", "clear", "about", "matrix", "whoami", "pwd", "ls", "cat", "cd",
  "echo", "date", "neofetch", "contact", "scan", "access", "glitch",
  "download", "exit", "cowsay", "fortune", "figlet", "ping", "sl",
  "theme", "crt", "pipes", "plasma", "fireworks",
  "snake", "tetris", "typing", "2048",
  "sound", "music"
];
const COMMANDS_STORAGE_KEY = "frhd-terminal-commands-used";

/**
 * Load achievements from localStorage
 */
function loadAchievements(): AchievementsStore {
  if (achievementsCache) return achievementsCache;
  if (typeof window === "undefined") return {};

  try {
    const stored = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    achievementsCache = stored ? JSON.parse(stored) : {};
    return achievementsCache ?? {};
  } catch {
    achievementsCache = {};
    return achievementsCache ?? {};
  }
}

/**
 * Save achievements to localStorage
 */
function saveAchievements(achievements: AchievementsStore): void {
  if (typeof window === "undefined") return;
  achievementsCache = achievements;
  localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(achievements));
}

/**
 * Check if an achievement is unlocked
 */
export function isAchievementUnlocked(id: AchievementId): boolean {
  const achievements = loadAchievements();
  return id in achievements;
}

/**
 * Get all unlocked achievements
 */
export function getUnlockedAchievements(): AchievementId[] {
  const achievements = loadAchievements();
  return Object.keys(achievements) as AchievementId[];
}

/**
 * Get achievement unlock time
 */
export function getAchievementUnlockTime(id: AchievementId): number | null {
  const achievements = loadAchievements();
  return achievements[id]?.unlockedAt ?? null;
}

/**
 * Unlock an achievement (returns true if newly unlocked)
 */
export function unlockAchievement(id: AchievementId): boolean {
  if (isAchievementUnlocked(id)) return false;

  const achievements = loadAchievements();
  achievements[id] = { unlockedAt: Date.now() };
  saveAchievements(achievements);

  // Dispatch event for notification
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("achievement-unlocked", {
        detail: { achievement: ACHIEVEMENTS[id] },
      })
    );
  }

  return true;
}

/**
 * Track a command for completionist achievement
 */
export function trackCommand(command: string): void {
  if (typeof window === "undefined") return;

  const cmd = command.split(" ")[0].toLowerCase();
  if (!ALL_COMMANDS.includes(cmd)) return;

  try {
    const stored = localStorage.getItem(COMMANDS_STORAGE_KEY);
    const usedCommands: string[] = stored ? JSON.parse(stored) : [];

    if (!usedCommands.includes(cmd)) {
      usedCommands.push(cmd);
      localStorage.setItem(COMMANDS_STORAGE_KEY, JSON.stringify(usedCommands));

      // Check for completionist
      if (usedCommands.length >= ALL_COMMANDS.length) {
        unlockAchievement("completionist");
      }
    }
  } catch {
    // Silently fail
  }
}

/**
 * Get list of used commands
 */
export function getUsedCommands(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(COMMANDS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Check time-based achievements
 */
export function checkTimeAchievements(): void {
  const hour = new Date().getHours();

  // Night owl: 2am - 5am
  if (hour >= 2 && hour < 5) {
    unlockAchievement("night_owl");
  }

  // Early bird: 5am - 7am
  if (hour >= 5 && hour < 7) {
    unlockAchievement("early_bird");
  }
}

/**
 * Get achievement progress stats
 */
export function getAchievementStats(): { unlocked: number; total: number; percentage: number } {
  const unlocked = getUnlockedAchievements().length;
  const total = Object.keys(ACHIEVEMENTS).length;
  return {
    unlocked,
    total,
    percentage: Math.round((unlocked / total) * 100),
  };
}

/**
 * Reset all achievements (for testing)
 */
export function resetAchievements(): void {
  if (typeof window === "undefined") return;
  achievementsCache = {};
  localStorage.removeItem(ACHIEVEMENTS_STORAGE_KEY);
  localStorage.removeItem(COMMANDS_STORAGE_KEY);
}

/**
 * Format achievement for display
 */
export function formatAchievement(id: AchievementId, showSecret: boolean = false): string {
  const achievement = ACHIEVEMENTS[id];
  const unlocked = isAchievementUnlocked(id);

  if (achievement.secret && !unlocked && !showSecret) {
    return "🔒 ?????? - Secret achievement";
  }

  const status = unlocked ? "✓" : "○";
  const icon = unlocked ? achievement.icon : "🔒";
  return `${status} ${icon} ${achievement.name} - ${achievement.description}`;
}
