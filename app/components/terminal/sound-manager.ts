/**
 * Sound Manager for Terminal
 * Re-exports from modular audio system for backwards compatibility
 */

// Re-export everything from the new modular system
export {
  // Types
  type SoundEffect,
  // Context utilities
  initAudio,
  markUserInteraction,
  hasUserInteracted,
  // Sound effects
  isSoundEnabled,
  setSoundEnabled,
  playSound,
  playKeypressSound,
  // Music
  isMusicEnabled,
  setMusicEnabled,
  getMusicVolume,
  setMusicVolume,
  startMusic,
  stopMusic,
  isMusicPlaying,
  // Cleanup
  cleanup,
} from "./audio/index";
