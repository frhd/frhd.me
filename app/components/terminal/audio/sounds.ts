/**
 * Sound Effects Manager
 * Handles synthesized sound effects for terminal interactions
 */

import type { SoundEffect, SoundFrequencies } from "./types";
import {
  getAudioContext,
  hasUserInteracted,
  SOUND_STORAGE_KEY,
} from "./context";

// Sound effect frequencies (for synthesized sounds)
const SOUND_FREQUENCIES: SoundFrequencies = {
  keypress: { freq: 800, duration: 0.03, type: "square" },
  command: { freq: 440, duration: 0.08, type: "sine" },
  error: { freq: 200, duration: 0.15, type: "sawtooth" },
  achievement: { freq: 880, duration: 0.3, type: "sine" },
  game: { freq: 660, duration: 0.1, type: "triangle" },
};

/**
 * Check if sound effects are enabled
 */
export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(SOUND_STORAGE_KEY) !== "false";
}

/**
 * Set sound effects enabled/disabled
 */
export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SOUND_STORAGE_KEY, enabled ? "true" : "false");
}

/**
 * Play a synthesized sound effect
 */
export function playSound(effect: SoundEffect): void {
  const audioContext = getAudioContext();
  if (!isSoundEnabled() || !audioContext || !hasUserInteracted()) return;

  try {
    const config = SOUND_FREQUENCIES[effect];

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = config.type;
    oscillator.frequency.setValueAtTime(config.freq, audioContext.currentTime);

    // For achievement, add a second frequency for a pleasant chord
    if (effect === "achievement") {
      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(
        config.freq * 1.5,
        audioContext.currentTime
      );
      gain2.gain.setValueAtTime(0.1, audioContext.currentTime);
      gain2.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + config.duration
      );
      osc2.connect(gain2);
      gain2.connect(audioContext.destination);
      osc2.start(audioContext.currentTime);
      osc2.stop(audioContext.currentTime + config.duration);
    }

    // Very subtle volume
    gainNode.gain.setValueAtTime(
      effect === "keypress" ? 0.02 : 0.08,
      audioContext.currentTime
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + config.duration
    );

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + config.duration);
  } catch {
    // Silently fail - sound is not critical
  }
}

/**
 * Play keypress sound (rate limited for performance)
 */
let lastKeypressTime = 0;
const KEYPRESS_THROTTLE = 30; // ms

export function playKeypressSound(): void {
  const now = Date.now();
  if (now - lastKeypressTime < KEYPRESS_THROTTLE) return;
  lastKeypressTime = now;
  playSound("keypress");
}

// Re-export sound effect type
export type { SoundEffect } from "./types";
