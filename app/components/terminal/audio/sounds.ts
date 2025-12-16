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
  keypress: { freq: 800, duration: 0.03, type: "square" }, // Not used for keypress anymore
  command: { freq: 440, duration: 0.08, type: "sine" },
  error: { freq: 200, duration: 0.15, type: "sawtooth" },
  achievement: { freq: 880, duration: 0.3, type: "sine" },
  game: { freq: 660, duration: 0.1, type: "triangle" },
};

/**
 * Play a realistic mechanical keyboard click sound
 * Uses filtered noise to simulate the "click" of a key press
 */
function playKeyboardClick(audioContext: AudioContext): void {
  const now = audioContext.currentTime;

  // Add slight random variation for more natural feel
  const pitchVariation = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
  const volumeVariation = 0.8 + Math.random() * 0.4; // 0.8 to 1.2

  // Create noise buffer for the click
  const bufferSize = audioContext.sampleRate * 0.015; // 15ms of noise
  const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const noiseData = noiseBuffer.getChannelData(0);

  // Fill with noise
  for (let i = 0; i < bufferSize; i++) {
    noiseData[i] = Math.random() * 2 - 1;
  }

  // Noise source
  const noise = audioContext.createBufferSource();
  noise.buffer = noiseBuffer;

  // Bandpass filter to shape the click (gives it that "clacky" character)
  const bandpass = audioContext.createBiquadFilter();
  bandpass.type = "bandpass";
  bandpass.frequency.value = 4000 * pitchVariation; // Center frequency
  bandpass.Q.value = 1.5; // Resonance

  // Highpass to remove low rumble
  const highpass = audioContext.createBiquadFilter();
  highpass.type = "highpass";
  highpass.frequency.value = 1500 * pitchVariation;

  // Envelope for the click
  const envelope = audioContext.createGain();
  envelope.gain.setValueAtTime(0, now);
  envelope.gain.linearRampToValueAtTime(0.06 * volumeVariation, now + 0.001); // Quick attack
  envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.012); // Fast decay

  // Optional: Add a subtle "thock" with a low frequency component
  const thock = audioContext.createOscillator();
  thock.type = "sine";
  thock.frequency.value = 150 * pitchVariation;

  const thockEnvelope = audioContext.createGain();
  thockEnvelope.gain.setValueAtTime(0.02 * volumeVariation, now);
  thockEnvelope.gain.exponentialRampToValueAtTime(0.001, now + 0.008);

  // Connect the noise path
  noise.connect(highpass);
  highpass.connect(bandpass);
  bandpass.connect(envelope);
  envelope.connect(audioContext.destination);

  // Connect the thock path
  thock.connect(thockEnvelope);
  thockEnvelope.connect(audioContext.destination);

  // Start and stop
  noise.start(now);
  noise.stop(now + 0.015);
  thock.start(now);
  thock.stop(now + 0.01);
}

/**
 * Check if sound effects are enabled (off by default)
 */
export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(SOUND_STORAGE_KEY) === "true";
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
    // Use realistic keyboard sound for keypress
    if (effect === "keypress") {
      playKeyboardClick(audioContext);
      return;
    }

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
    gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
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
