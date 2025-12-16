/**
 * Audio System Types
 * Shared types for sound effects and music
 */

// Sound effect types
export type SoundEffect = "keypress" | "command" | "error" | "achievement" | "game";

// Sound configuration
export interface SoundConfig {
  freq: number;
  duration: number;
  type: OscillatorType;
}

// Sound frequencies configuration
export type SoundFrequencies = Record<SoundEffect, SoundConfig>;
