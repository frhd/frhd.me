/**
 * Music Manager
 * Handles ambient lo-fi music generation and playback
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

// ============================================
// Lo-Fi Music Generator
// ============================================

// Musical constants
const NOTE_FREQUENCIES: Record<string, number> = {
  C2: 65.41, D2: 73.42, E2: 82.41, F2: 87.31, G2: 98.0, A2: 110.0, B2: 123.47,
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0, B5: 987.77,
};

// Lo-fi chord progressions (using jazz voicings)
const CHORD_PROGRESSIONS = [
  // ii-V-I-vi in C major (Dm7 - G7 - Cmaj7 - Am7)
  [["D3", "F3", "A3", "C4"], ["G2", "B3", "D4", "F4"], ["C3", "E3", "G3", "B3"], ["A2", "C3", "E3", "G3"]],
  // I-vi-IV-V in C (Cmaj7 - Am7 - Fmaj7 - G7)
  [["C3", "E3", "G3", "B3"], ["A2", "C3", "E3", "G3"], ["F2", "A3", "C4", "E4"], ["G2", "B3", "D4", "F4"]],
  // iii-vi-ii-V (Em7 - Am7 - Dm7 - G7)
  [["E3", "G3", "B3", "D4"], ["A2", "C3", "E3", "G3"], ["D3", "F3", "A3", "C4"], ["G2", "B3", "D4", "F4"]],
];

// Melody patterns (scale degrees, will be mapped to actual notes)
const MELODY_PATTERNS = [
  [0, 2, 4, 2, 0, -1, 0, 2],
  [4, 2, 0, 2, 4, 5, 4, 2],
  [0, 0, 2, 2, 4, 4, 2, 0],
  [2, 4, 5, 4, 2, 0, -1, 0],
];

// C major scale for melody
const MELODY_SCALE = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"];

/**
 * Simple ADSR envelope
 */
function applyEnvelope(
  samples: Float32Array,
  sampleRate: number,
  attack: number,
  decay: number,
  sustain: number,
  release: number,
  startSample: number,
  duration: number
): void {
  const attackSamples = Math.floor(attack * sampleRate);
  const decaySamples = Math.floor(decay * sampleRate);
  const releaseSamples = Math.floor(release * sampleRate);
  const totalSamples = Math.floor(duration * sampleRate);
  const sustainSamples = totalSamples - attackSamples - decaySamples - releaseSamples;

  for (let i = 0; i < totalSamples && startSample + i < samples.length; i++) {
    let envelope = 0;
    if (i < attackSamples) {
      envelope = i / attackSamples;
    } else if (i < attackSamples + decaySamples) {
      const decayProgress = (i - attackSamples) / decaySamples;
      envelope = 1 - decayProgress * (1 - sustain);
    } else if (i < attackSamples + decaySamples + sustainSamples) {
      envelope = sustain;
    } else {
      const releaseProgress = (i - attackSamples - decaySamples - sustainSamples) / releaseSamples;
      envelope = sustain * (1 - releaseProgress);
    }
    samples[startSample + i] *= envelope;
  }
}

/**
 * Generate a sine wave with optional harmonics (Rhodes-like sound)
 */
function generateTone(
  buffer: Float32Array,
  sampleRate: number,
  frequency: number,
  startTime: number,
  duration: number,
  amplitude: number,
  type: "sine" | "rhodes" | "bass" = "sine"
): void {
  const startSample = Math.floor(startTime * sampleRate);
  const numSamples = Math.floor(duration * sampleRate);

  for (let i = 0; i < numSamples && startSample + i < buffer.length; i++) {
    const t = i / sampleRate;
    let sample = 0;

    if (type === "rhodes") {
      // Rhodes-like sound with FM synthesis
      const modIndex = 2 * Math.exp(-t * 3);
      const modFreq = frequency * 2;
      sample = Math.sin(2 * Math.PI * frequency * t + modIndex * Math.sin(2 * Math.PI * modFreq * t));
      // Add warmth with slight detuning
      sample += 0.3 * Math.sin(2 * Math.PI * frequency * 1.003 * t);
      sample *= 0.5;
    } else if (type === "bass") {
      // Warm bass with sub-harmonic
      sample = Math.sin(2 * Math.PI * frequency * t) * 0.7;
      sample += Math.sin(2 * Math.PI * frequency * 0.5 * t) * 0.3;
      // Soft saturation
      sample = Math.tanh(sample * 1.5);
    } else {
      sample = Math.sin(2 * Math.PI * frequency * t);
    }

    buffer[startSample + i] += sample * amplitude;
  }

  // Apply envelope
  if (type === "rhodes") {
    applyEnvelope(buffer, sampleRate, 0.01, 0.1, 0.6, 0.3, startSample, duration);
  } else if (type === "bass") {
    applyEnvelope(buffer, sampleRate, 0.02, 0.1, 0.7, 0.2, startSample, duration);
  } else {
    applyEnvelope(buffer, sampleRate, 0.01, 0.05, 0.8, 0.1, startSample, duration);
  }
}

/**
 * Generate a drum hit
 */
function generateDrum(
  buffer: Float32Array,
  sampleRate: number,
  startTime: number,
  type: "kick" | "snare" | "hihat",
  amplitude: number
): void {
  const startSample = Math.floor(startTime * sampleRate);

  if (type === "kick") {
    // Lo-fi kick drum
    const duration = 0.15;
    const numSamples = Math.floor(duration * sampleRate);
    for (let i = 0; i < numSamples && startSample + i < buffer.length; i++) {
      const t = i / sampleRate;
      const pitchEnv = 150 * Math.exp(-t * 40) + 40;
      const ampEnv = Math.exp(-t * 15);
      buffer[startSample + i] += Math.sin(2 * Math.PI * pitchEnv * t) * ampEnv * amplitude;
    }
  } else if (type === "snare") {
    // Lo-fi snare with noise
    const duration = 0.12;
    const numSamples = Math.floor(duration * sampleRate);
    for (let i = 0; i < numSamples && startSample + i < buffer.length; i++) {
      const t = i / sampleRate;
      const ampEnv = Math.exp(-t * 20);
      const tone = Math.sin(2 * Math.PI * 200 * t) * 0.3;
      const noise = (Math.random() * 2 - 1) * 0.7;
      buffer[startSample + i] += (tone + noise) * ampEnv * amplitude;
    }
  } else if (type === "hihat") {
    // Filtered noise hihat
    const duration = 0.05;
    const numSamples = Math.floor(duration * sampleRate);
    for (let i = 0; i < numSamples && startSample + i < buffer.length; i++) {
      const t = i / sampleRate;
      const ampEnv = Math.exp(-t * 50);
      // High-pass filtered noise (simple approximation)
      const noise = Math.random() * 2 - 1;
      buffer[startSample + i] += noise * ampEnv * amplitude * 0.3;
    }
  }
}

/**
 * Add vinyl crackle/noise
 */
function addVinylNoise(buffer: Float32Array, sampleRate: number, amplitude: number): void {
  for (let i = 0; i < buffer.length; i++) {
    // Constant low-level noise
    buffer[i] += (Math.random() * 2 - 1) * amplitude * 0.3;

    // Random crackles
    if (Math.random() < 0.0001) {
      const crackleLength = Math.floor(Math.random() * 200 + 50);
      for (let j = 0; j < crackleLength && i + j < buffer.length; j++) {
        buffer[i + j] += (Math.random() * 2 - 1) * amplitude * 2 * Math.exp(-j / 50);
      }
    }
  }
}

/**
 * Simple low-pass filter
 */
function lowPassFilter(buffer: Float32Array, alpha: number): void {
  let prev = buffer[0];
  for (let i = 1; i < buffer.length; i++) {
    buffer[i] = prev + alpha * (buffer[i] - prev);
    prev = buffer[i];
  }
}

/**
 * Generate lo-fi ambient music
 */
async function generateAmbientMusic(): Promise<AudioBuffer | null> {
  const audioContext = getAudioContext();
  if (!audioContext) return null;

  const sampleRate = audioContext.sampleRate;
  const bpm = 75; // Lo-fi typically 70-90 BPM
  const beatsPerBar = 4;
  const barsCount = 8; // 8 bars, then loop
  const beatDuration = 60 / bpm;
  const barDuration = beatDuration * beatsPerBar;
  const totalDuration = barDuration * barsCount;
  const numSamples = Math.ceil(sampleRate * totalDuration);

  const buffer = audioContext.createBuffer(2, numSamples, sampleRate);
  const leftChannel = buffer.getChannelData(0);
  const rightChannel = buffer.getChannelData(1);

  // Working buffers
  const chordBuffer = new Float32Array(numSamples);
  const melodyBuffer = new Float32Array(numSamples);
  const bassBuffer = new Float32Array(numSamples);
  const drumBuffer = new Float32Array(numSamples);

  // Pick a random chord progression
  const progression = CHORD_PROGRESSIONS[Math.floor(Math.random() * CHORD_PROGRESSIONS.length)];
  const melodyPattern = MELODY_PATTERNS[Math.floor(Math.random() * MELODY_PATTERNS.length)];

  // Generate chords (one chord per 2 bars)
  for (let bar = 0; bar < barsCount; bar++) {
    const chordIndex = Math.floor(bar / 2) % progression.length;
    const chord = progression[chordIndex];
    const startTime = bar * barDuration;

    // Play chord notes with slight humanization
    chord.forEach((note, noteIndex) => {
      const freq = NOTE_FREQUENCIES[note];
      if (freq) {
        const humanDelay = Math.random() * 0.02; // Slight timing variation
        const humanAmp = 0.12 + Math.random() * 0.03;
        generateTone(chordBuffer, sampleRate, freq, startTime + humanDelay + noteIndex * 0.015, barDuration * 0.9, humanAmp, "rhodes");
      }
    });
  }

  // Generate melody
  for (let bar = 0; bar < barsCount; bar++) {
    for (let beat = 0; beat < 8; beat++) { // 8th notes
      const patternIndex = beat % melodyPattern.length;
      const scaleDegree = melodyPattern[patternIndex] + 4; // Offset to higher register

      if (scaleDegree >= 0 && scaleDegree < MELODY_SCALE.length && Math.random() > 0.3) { // 70% note probability
        const note = MELODY_SCALE[scaleDegree];
        const freq = NOTE_FREQUENCIES[note];
        if (freq) {
          const startTime = bar * barDuration + beat * (beatDuration / 2);
          const noteDuration = beatDuration * (0.4 + Math.random() * 0.3);
          const velocity = 0.08 + Math.random() * 0.04;
          generateTone(melodyBuffer, sampleRate, freq, startTime, noteDuration, velocity, "rhodes");
        }
      }
    }
  }

  // Generate bass line
  for (let bar = 0; bar < barsCount; bar++) {
    const chordIndex = Math.floor(bar / 2) % progression.length;
    const rootNote = progression[chordIndex][0]; // Get root of chord
    const bassNote = rootNote.replace(/\d/, "2"); // Move to octave 2
    const freq = NOTE_FREQUENCIES[bassNote];

    if (freq) {
      // Play on beats 1 and 3
      for (let beat = 0; beat < beatsPerBar; beat += 2) {
        const startTime = bar * barDuration + beat * beatDuration;
        generateTone(bassBuffer, sampleRate, freq, startTime + Math.random() * 0.01, beatDuration * 1.5, 0.2, "bass");
      }
    }
  }

  // Generate drums
  for (let bar = 0; bar < barsCount; bar++) {
    for (let beat = 0; beat < beatsPerBar; beat++) {
      const beatTime = bar * barDuration + beat * beatDuration;

      // Kick on 1 and 3
      if (beat === 0 || beat === 2) {
        generateDrum(drumBuffer, sampleRate, beatTime, "kick", 0.25);
      }

      // Snare on 2 and 4
      if (beat === 1 || beat === 3) {
        generateDrum(drumBuffer, sampleRate, beatTime, "snare", 0.15);
      }

      // Hi-hats on every 8th note
      for (let eighth = 0; eighth < 2; eighth++) {
        const hhTime = beatTime + eighth * (beatDuration / 2);
        const hhVelocity = eighth === 0 ? 0.12 : 0.08; // Accent downbeats
        generateDrum(drumBuffer, sampleRate, hhTime + Math.random() * 0.005, "hihat", hhVelocity);
      }
    }
  }

  // Apply lo-fi processing
  lowPassFilter(chordBuffer, 0.15);
  lowPassFilter(melodyBuffer, 0.2);
  lowPassFilter(bassBuffer, 0.3);
  lowPassFilter(drumBuffer, 0.25);

  // Mix everything together
  const chordGain = 0.35;
  const melodyGain = 0.25;
  const bassGain = 0.3;
  const drumGain = 0.25;

  for (let i = 0; i < numSamples; i++) {
    const mixed =
      chordBuffer[i] * chordGain +
      melodyBuffer[i] * melodyGain +
      bassBuffer[i] * bassGain +
      drumBuffer[i] * drumGain;

    // Soft clipping
    const clipped = Math.tanh(mixed * 1.2);

    // Stereo spread
    const spread = 0.1;
    leftChannel[i] = clipped * (1 - spread * Math.sin(i * 0.0001));
    rightChannel[i] = clipped * (1 + spread * Math.sin(i * 0.0001));
  }

  // Add vinyl noise
  addVinylNoise(leftChannel, sampleRate, 0.008);
  addVinylNoise(rightChannel, sampleRate, 0.008);

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
