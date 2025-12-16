/**
 * Audio Context Manager
 * Shared audio context and initialization utilities
 */

// Storage keys
export const SOUND_STORAGE_KEY = "frhd-terminal-sound";
export const MUSIC_STORAGE_KEY = "frhd-terminal-music";
export const MUSIC_VOLUME_KEY = "frhd-terminal-music-volume";

// Shared audio state
let audioContext: AudioContext | null = null;
let isInitialized = false;
let userInteracted = false;

/**
 * Get the shared audio context
 */
export function getAudioContext(): AudioContext | null {
  return audioContext;
}

/**
 * Check if audio is initialized
 */
export function isAudioInitialized(): boolean {
  return isInitialized;
}

/**
 * Initialize audio context (must be called after user interaction)
 */
export async function initAudio(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (isInitialized) return true;

  try {
    audioContext = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)();

    // Resume context if suspended (required by browsers)
    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    isInitialized = true;
    userInteracted = true;
    return true;
  } catch (e) {
    console.warn("Failed to initialize audio context:", e);
    return false;
  }
}

/**
 * Mark that user has interacted (for audio autoplay policy)
 */
export function markUserInteraction(): void {
  userInteracted = true;
}

/**
 * Check if user has interacted
 */
export function hasUserInteracted(): boolean {
  return userInteracted;
}

/**
 * Cleanup audio resources
 */
export function cleanupAudioContext(): void {
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
  isInitialized = false;
}
