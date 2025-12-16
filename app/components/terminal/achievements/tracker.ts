/**
 * Achievement Tracker
 * Handles achievement state, unlocking, and persistence
 */

import { ACHIEVEMENTS, ALL_COMMANDS, type AchievementId, type Achievement } from "./definitions";

// Storage keys
const ACHIEVEMENTS_STORAGE_KEY = "frhd-terminal-achievements";
const COMMANDS_STORAGE_KEY = "frhd-terminal-commands-used";

// State for unlocked achievements
interface AchievementState {
  unlockedAt: number; // timestamp
}

type AchievementsStore = Partial<Record<AchievementId, AchievementState>>;

// In-memory cache
let achievementsCache: AchievementsStore | null = null;

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
export function getAchievementStats(): {
  unlocked: number;
  total: number;
  percentage: number;
} {
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
export function formatAchievement(
  id: AchievementId,
  showSecret: boolean = false
): string {
  const achievement = ACHIEVEMENTS[id];
  const unlocked = isAchievementUnlocked(id);

  if (achievement.secret && !unlocked && !showSecret) {
    return "🔒 ?????? - Secret achievement";
  }

  const status = unlocked ? "✓" : "○";
  const icon = unlocked ? achievement.icon : "🔒";
  return `${status} ${icon} ${achievement.name} - ${achievement.description}`;
}

/**
 * Get achievement by ID
 */
export function getAchievement(id: AchievementId): Achievement {
  return ACHIEVEMENTS[id];
}

// Re-export types and constants for convenience
export { ACHIEVEMENTS, ALL_COMMANDS, type AchievementId, type Achievement } from "./definitions";
