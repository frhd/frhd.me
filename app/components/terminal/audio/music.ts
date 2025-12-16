/**
 * Music Manager
 * Handles ambient music generation and playback
 */

import {
  getAudioContext,
  hasUserInteracted,
  initAudio,
  MUSIC_STORAGE_KEY,
  MUSIC_VOLUME_KEY,
} from "./context";

// Music playback state
let musicGainNode: GainNode | null = null;
let musicSource: AudioBufferSourceNode | null = null;
let musicBuffer: AudioBuffer | null = null;

/**
 * Check if music is enabled
 */
export function isMusicEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(MUSIC_STORAGE_KEY) === "true";
}

/**
 * Set music enabled/disabled
 */
export function setMusicEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(MUSIC_STORAGE_KEY, enabled ? "true" : "false");
}

/**
 * Get music volume (0-100)
 */
export function getMusicVolume(): number {
  if (typeof window === "undefined") return 30;
  const stored = localStorage.getItem(MUSIC_VOLUME_KEY);
  return stored ? parseInt(stored, 10) : 30;
}

/**
 * Set music volume (0-100)
 */
export function setMusicVolume(volume: number): void {
  if (typeof window === "undefined") return;
  const clamped = Math.max(0, Math.min(100, volume));
  localStorage.setItem(MUSIC_VOLUME_KEY, clamped.toString());

  // Update live volume if playing
  const audioContext = getAudioContext();
  if (musicGainNode && audioContext) {
    musicGainNode.gain.setValueAtTime(
      (clamped / 100) * 0.3,
      audioContext.currentTime
    );
  }
}

/**
 * Generate ambient music buffer (procedural lo-fi style)
 */
async function generateAmbientMusic(): Promise<AudioBuffer | null> {
  const audioContext = getAudioContext();
  if (!audioContext) return null;

  const sampleRate = audioContext.sampleRate;
  const duration = 30; // 30 second loop
  const numSamples = sampleRate * duration;
  const buffer = audioContext.createBuffer(2, numSamples, sampleRate);

  const leftChannel = buffer.getChannelData(0);
  const rightChannel = buffer.getChannelData(1);

  // Generate a simple ambient drone with harmonics
  const baseFreq = 110; // A2
  const harmonics = [1, 2, 3, 4, 5];
  const harmonicAmps = [0.5, 0.3, 0.15, 0.1, 0.05];

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;

    // Add harmonics
    for (let h = 0; h < harmonics.length; h++) {
      const freq = baseFreq * harmonics[h];
      // Slight detuning for warmth
      const detune = 1 + Math.sin(t * 0.1 * (h + 1)) * 0.002;
      sample += Math.sin(2 * Math.PI * freq * detune * t) * harmonicAmps[h];
    }

    // Add subtle noise for texture
    sample += (Math.random() * 2 - 1) * 0.02;

    // Slow amplitude modulation
    const ampMod = 0.7 + Math.sin(t * 0.2) * 0.3;
    sample *= ampMod * 0.15;

    // Stereo spread
    leftChannel[i] = sample * (0.9 + Math.sin(t * 0.3) * 0.1);
    rightChannel[i] = sample * (0.9 + Math.cos(t * 0.3) * 0.1);
  }

  return buffer;
}

/**
 * Start playing ambient music
 */
export async function startMusic(): Promise<boolean> {
  const audioContext = getAudioContext();
  if (!audioContext || !hasUserInteracted()) {
    const initialized = await initAudio();
    if (!initialized) return false;
  }

  // Stop existing music
  stopMusic();

  try {
    if (!musicBuffer) {
      musicBuffer = await generateAmbientMusic();
    }

    const ctx = getAudioContext();
    if (!musicBuffer || !ctx) return false;

    musicSource = ctx.createBufferSource();
    musicGainNode = ctx.createGain();

    musicSource.buffer = musicBuffer;
    musicSource.loop = true;

    const volume = (getMusicVolume() / 100) * 0.3; // Max 30% volume
    musicGainNode.gain.setValueAtTime(volume, ctx.currentTime);

    musicSource.connect(musicGainNode);
    musicGainNode.connect(ctx.destination);

    musicSource.start(0);
    setMusicEnabled(true);

    return true;
  } catch (e) {
    console.warn("Failed to start music:", e);
    return false;
  }
}

/**
 * Stop ambient music
 */
export function stopMusic(): void {
  if (musicSource) {
    try {
      musicSource.stop();
      musicSource.disconnect();
    } catch {
      // Already stopped
    }
    musicSource = null;
  }
  setMusicEnabled(false);
}

/**
 * Check if music is currently playing
 */
export function isMusicPlaying(): boolean {
  return musicSource !== null && isMusicEnabled();
}

/**
 * Cleanup music resources
 */
export function cleanupMusic(): void {
  stopMusic();
  musicBuffer = null;
  musicGainNode = null;
}
