/**
 * ============================================
 * AUDIO ENGINE - Web Audio API untuk Chord Player
 *
 * Dikonversi 1:1 dari js/audioEngine.js. Class ini murni client-side
 * (memakai window.AudioContext), jadi hanya boleh diinstansiasi di
 * dalam Client Component (lihat hooks/use-audio-engine.ts).
 * ============================================
 */

import { CHORD_FORMULAS } from './chord-data';

interface ParsedChord {
  root: string;
  type: string;
}

interface OscillatorHandle {
  oscillator: OscillatorNode;
  gainNode: GainNode;
}

export type ChordChangeCallback = (chord: string | null, index: number) => void;

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying = false;
  private currentOscillators: OscillatorHandle[] = [];
  private playbackTimeout: ReturnType<typeof setTimeout> | null = null;

  // Frekuensi dasar untuk setiap nada (A4 = 440Hz)
  private readonly noteFrequencies: Record<string, number> = {
    C: 261.63,
    'C#': 277.18, Db: 277.18,
    D: 293.66,
    'D#': 311.13, Eb: 311.13,
    E: 329.63,
    F: 349.23,
    'F#': 369.99, Gb: 369.99,
    G: 392.0,
    'G#': 415.3, Ab: 415.3,
    A: 440.0,
    'A#': 466.16, Bb: 466.16,
    B: 493.88,
  };

  init(): void {
    if (!this.audioContext) {
      const AudioContextClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioContextClass();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = 0.3;
    }

    // Resume context jika suspended
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  // Parse nama akor menjadi root note dan type
  parseChord(chordName: string): ParsedChord {
    let root = '';
    let type = '';

    // Cek apakah ada sharp atau flat
    if (chordName.length >= 2 && (chordName[1] === '#' || chordName[1] === 'b')) {
      root = chordName.substring(0, 2);
      type = chordName.substring(2);
    } else {
      root = chordName[0];
      type = chordName.substring(1);
    }

    return { root, type };
  }

  // Dapatkan frekuensi untuk chord berdasarkan formula
  getChordFrequencies(chordName: string, octave = 4): number[] {
    const { root, type } = this.parseChord(chordName);
    const rootFreq = this.noteFrequencies[root];

    if (!rootFreq) {
      console.warn(`Note not found: ${root}`);
      return [];
    }

    // Sesuaikan dengan oktaf
    const baseFreq = rootFreq * Math.pow(2, octave - 4);

    // Dapatkan formula chord
    let formula = CHORD_FORMULAS[''] ?? [0, 4, 7]; // Default major

    // Match chord type dengan formula
    if (type.includes('maj7') || type.includes('Maj7')) {
      formula = CHORD_FORMULAS['maj7'];
    } else if (type.includes('m7') || type.includes('min7')) {
      formula = CHORD_FORMULAS['m7'];
    } else if (type.includes('dim7')) {
      formula = CHORD_FORMULAS['dim7'];
    } else if (type.includes('dim') || type.includes('°')) {
      formula = CHORD_FORMULAS['dim'];
    } else if (type.includes('aug') || type.includes('+')) {
      formula = CHORD_FORMULAS['aug'];
    } else if (type.includes('7')) {
      formula = CHORD_FORMULAS['7'];
    } else if (type.includes('m') || type.includes('min')) {
      formula = CHORD_FORMULAS['m'];
    } else if (type.includes('sus2')) {
      formula = CHORD_FORMULAS['sus2'];
    } else if (type.includes('sus4')) {
      formula = CHORD_FORMULAS['sus4'];
    }

    // Hitung frekuensi untuk setiap nada dalam chord
    return formula.map((semitones) => baseFreq * Math.pow(2, semitones / 12));
  }

  // Mainkan satu chord
  playChord(chordName: string, duration = 1.0): void {
    this.init();
    if (!this.audioContext || !this.masterGain) return;

    // Stop current oscillators but don't stop playback
    this.currentOscillators.forEach(({ oscillator, gainNode }) => {
      try {
        const now = this.audioContext!.currentTime;
        gainNode.gain.linearRampToValueAtTime(0, now + 0.05);
        oscillator.stop(now + 0.1);
      } catch {
        // Oscillator mungkin sudah berhenti
      }
    });
    this.currentOscillators = [];

    const frequencies = this.getChordFrequencies(chordName);
    const now = this.audioContext.currentTime;

    frequencies.forEach((freq) => {
      // Oscillator untuk setiap nada
      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();

      // Gunakan waveform yang lebih enak didengar
      oscillator.type = 'triangle';
      oscillator.frequency.value = freq;

      // ADSR envelope sederhana
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.15, now + 0.05); // Attack
      gainNode.gain.linearRampToValueAtTime(0.1, now + 0.2); // Decay
      gainNode.gain.setValueAtTime(0.1, now + duration - 0.1); // Sustain
      gainNode.gain.linearRampToValueAtTime(0, now + duration); // Release

      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain!);

      oscillator.start(now);
      oscillator.stop(now + duration);

      this.currentOscillators.push({ oscillator, gainNode });

      // Cleanup setelah selesai
      oscillator.onended = () => {
        gainNode.disconnect();
      };
    });
  }

  // Mainkan progression
  async playProgression(chords: string[], bpm = 120, onChordChange: ChordChangeCallback | null = null): Promise<void> {
    this.init();
    this.stopAll();
    this.isPlaying = true;

    const beatDuration = 60 / bpm; // Durasi 1 beat dalam detik
    const chordDuration = beatDuration * 2; // 2 beats per chord

    for (let i = 0; i < chords.length; i++) {
      if (!this.isPlaying) break;

      const chord = chords[i];

      if (onChordChange) {
        onChordChange(chord, i);
      }

      this.playChord(chord, chordDuration * 0.95); // Slightly shorter to prevent overlap

      // Tunggu sebelum chord berikutnya
      await this.sleep(chordDuration * 1000);
    }

    this.isPlaying = false;
    if (onChordChange) {
      onChordChange(null, -1);
    }
  }

  // Stop semua suara
  stopAll(): void {
    this.isPlaying = false;

    this.currentOscillators.forEach(({ oscillator, gainNode }) => {
      try {
        const now = this.audioContext!.currentTime;
        gainNode.gain.linearRampToValueAtTime(0, now + 0.05);
        oscillator.stop(now + 0.1);
      } catch {
        // Oscillator mungkin sudah berhenti
      }
    });

    this.currentOscillators = [];

    if (this.playbackTimeout) {
      clearTimeout(this.playbackTimeout);
      this.playbackTimeout = null;
    }
  }

  // Set volume
  setVolume(value: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, value));
    }
  }

  // Helper sleep function
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      this.playbackTimeout = setTimeout(resolve, ms);
    });
  }
}
