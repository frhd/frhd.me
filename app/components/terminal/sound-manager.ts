/**
 * Sound Manager for Terminal
 * Handles audio playback, sound effects, and ambient music
 */

// Storage keys
const SOUND_STORAGE_KEY = "frhd-terminal-sound";
const MUSIC_STORAGE_KEY = "frhd-terminal-music";
const MUSIC_VOLUME_KEY = "frhd-terminal-music-volume";

// Sound effect types
export type SoundEffect = "keypress" | "command" | "error" | "achievement" | "game";

// Audio context and buffers (lazy loaded)
let audioContext: AudioContext | null = null;
const soundBuffers: Map<SoundEffect, AudioBuffer> = new Map();
let musicGainNode: GainNode | null = null;
let musicSource: AudioBufferSourceNode | null = null;
let musicBuffer: AudioBuffer | null = null;
let isInitialized = false;
let userInteracted = false;

// Sound effect frequencies (for synthesized sounds)
const SOUND_FREQUENCIES: Record<SoundEffect, { freq: number; duration: number; type: OscillatorType }> = {
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
  if (musicGainNode && audioContext) {
    musicGainNode.gain.setValueAtTime(clamped / 100 * 0.3, audioContext.currentTime);
  }
}

/**
 * Initialize audio context (must be called after user interaction)
 */
export async function initAudio(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (isInitialized) return true;

  try {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

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
 * Play a synthesized sound effect
 */
export function playSound(effect: SoundEffect): void {
  if (!isSoundEnabled() || !audioContext || !userInteracted) return;

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
      osc2.frequency.setValueAtTime(config.freq * 1.5, audioContext.currentTime);
      gain2.gain.setValueAtTime(0.1, audioContext.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + config.duration);
      osc2.connect(gain2);
      gain2.connect(audioContext.destination);
      osc2.start(audioContext.currentTime);
      osc2.stop(audioContext.currentTime + config.duration);
    }

    // Very subtle volume
    gainNode.gain.setValueAtTime(effect === "keypress" ? 0.02 : 0.08, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + config.duration);

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

/**
 * Generate ambient music buffer (procedural lo-fi style)
 */
async function generateAmbientMusic(): Promise<AudioBuffer | null> {
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
  if (!audioContext || !userInteracted) {
    const initialized = await initAudio();
    if (!initialized) return false;
  }

  // Stop existing music
  stopMusic();

  try {
    if (!musicBuffer) {
      musicBuffer = await generateAmbientMusic();
    }

    if (!musicBuffer || !audioContext) return false;

    musicSource = audioContext.createBufferSource();
    musicGainNode = audioContext.createGain();

    musicSource.buffer = musicBuffer;
    musicSource.loop = true;

    const volume = getMusicVolume() / 100 * 0.3; // Max 30% volume
    musicGainNode.gain.setValueAtTime(volume, audioContext.currentTime);

    musicSource.connect(musicGainNode);
    musicGainNode.connect(audioContext.destination);

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
 * Cleanup audio resources
 */
export function cleanup(): void {
  stopMusic();
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
  soundBuffers.clear();
  musicBuffer = null;
  isInitialized = false;
}
