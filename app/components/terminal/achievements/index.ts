/**
 * Achievements Module
 * Barrel export for achievement system
 */

// Export definitions
export {
  ACHIEVEMENTS,
  ALL_COMMANDS,
  type AchievementId,
  type Achievement,
} from "./definitions";

// Export tracker functions
export {
  isAchievementUnlocked,
  getUnlockedAchievements,
  getAchievementUnlockTime,
  unlockAchievement,
  trackCommand,
  getUsedCommands,
  checkTimeAchievements,
  getAchievementStats,
  resetAchievements,
  formatAchievement,
  getAchievement,
} from "./tracker";
