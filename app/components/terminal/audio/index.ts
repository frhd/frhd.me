/**
 * Audio Module
 * Barrel export for audio system (sounds and music)
 */

// Export types
export type { SoundEffect, SoundConfig, SoundFrequencies } from "./types";

// Export context utilities
export {
  getAudioContext,
  isAudioInitialized,
  initAudio,
  markUserInteraction,
  hasUserInteracted,
  cleanupAudioContext,
  SOUND_STORAGE_KEY,
  MUSIC_STORAGE_KEY,
  MUSIC_VOLUME_KEY,
} from "./context";

// Export sound effects
export {
  isSoundEnabled,
  setSoundEnabled,
  playSound,
  playKeypressSound,
} from "./sounds";

// Export music functions
export {
  isMusicEnabled,
  setMusicEnabled,
  getMusicVolume,
  setMusicVolume,
  startMusic,
  stopMusic,
  isMusicPlaying,
  cleanupMusic,
} from "./music";

// Import cleanup functions
import { cleanupMusic } from "./music";
import { cleanupAudioContext } from "./context";

/**
 * Cleanup all audio resources
 */
export function cleanup(): void {
  cleanupMusic();
  cleanupAudioContext();
}
