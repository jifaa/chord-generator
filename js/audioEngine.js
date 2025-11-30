/**
 * ============================================
 * AUDIO ENGINE - Web Audio API untuk Chord Player
 * ============================================
 */

class AudioEngine {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.isPlaying = false;
        this.currentOscillators = [];
        this.playbackTimeout = null;
        
        // Frekuensi dasar untuk setiap nada (A4 = 440Hz)
        this.noteFrequencies = {
            'C': 261.63,
            'C#': 277.18, 'Db': 277.18,
            'D': 293.66,
            'D#': 311.13, 'Eb': 311.13,
            'E': 329.63,
            'F': 349.23,
            'F#': 369.99, 'Gb': 369.99,
            'G': 392.00,
            'G#': 415.30, 'Ab': 415.30,
            'A': 440.00,
            'A#': 466.16, 'Bb': 466.16,
            'B': 493.88
        };
    }

    init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
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
    parseChord(chordName) {
        // Handle berbagai format chord
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
    getChordFrequencies(chordName, octave = 4) {
        const { root, type } = this.parseChord(chordName);
        const rootFreq = this.noteFrequencies[root];
        
        if (!rootFreq) {
            console.warn(`Note not found: ${root}`);
            return [];
        }

        // Sesuaikan dengan oktaf
        const baseFreq = rootFreq * Math.pow(2, octave - 4);
        
        // Dapatkan formula chord
        let formula = window.ChordData.CHORD_FORMULAS[''];  // Default major
        
        // Match chord type dengan formula
        if (type.includes('maj7') || type.includes('Maj7')) {
            formula = window.ChordData.CHORD_FORMULAS['maj7'];
        } else if (type.includes('m7') || type.includes('min7')) {
            formula = window.ChordData.CHORD_FORMULAS['m7'];
        } else if (type.includes('dim7')) {
            formula = window.ChordData.CHORD_FORMULAS['dim7'];
        } else if (type.includes('dim') || type.includes('°')) {
            formula = window.ChordData.CHORD_FORMULAS['dim'];
        } else if (type.includes('aug') || type.includes('+')) {
            formula = window.ChordData.CHORD_FORMULAS['aug'];
        } else if (type.includes('7')) {
            formula = window.ChordData.CHORD_FORMULAS['7'];
        } else if (type.includes('m') || type.includes('min')) {
            formula = window.ChordData.CHORD_FORMULAS['m'];
        } else if (type.includes('sus2')) {
            formula = window.ChordData.CHORD_FORMULAS['sus2'];
        } else if (type.includes('sus4')) {
            formula = window.ChordData.CHORD_FORMULAS['sus4'];
        }
        
        // Hitung frekuensi untuk setiap nada dalam chord
        return formula.map(semitones => {
            return baseFreq * Math.pow(2, semitones / 12);
        });
    }

    // Mainkan satu chord
    playChord(chordName, duration = 1.0) {
        this.init();
        
        // Stop current oscillators but don't stop playback
        this.currentOscillators.forEach(({ oscillator, gainNode }) => {
            try {
                const now = this.audioContext.currentTime;
                gainNode.gain.linearRampToValueAtTime(0, now + 0.05);
                oscillator.stop(now + 0.1);
            } catch (e) {
                // Oscillator mungkin sudah berhenti
            }
        });
        this.currentOscillators = [];
        
        const frequencies = this.getChordFrequencies(chordName);
        const now = this.audioContext.currentTime;
        
        frequencies.forEach((freq, index) => {
            // Oscillator untuk setiap nada
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            // Gunakan waveform yang lebih enak didengar
            oscillator.type = 'triangle';
            oscillator.frequency.value = freq;
            
            // ADSR envelope sederhana
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.15, now + 0.05);  // Attack
            gainNode.gain.linearRampToValueAtTime(0.1, now + 0.2);    // Decay
            gainNode.gain.setValueAtTime(0.1, now + duration - 0.1);  // Sustain
            gainNode.gain.linearRampToValueAtTime(0, now + duration); // Release
            
            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);
            
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
    async playProgression(chords, bpm = 120, onChordChange = null) {
        this.init();
        this.stopAll();
        this.isPlaying = true;
        
        const beatDuration = 60 / bpm;  // Durasi 1 beat dalam detik
        const chordDuration = beatDuration * 2;  // 2 beats per chord
        
        for (let i = 0; i < chords.length; i++) {
            if (!this.isPlaying) break;
            
            const chord = chords[i];
            
            if (onChordChange) {
                onChordChange(chord, i);
            }
            
            this.playChord(chord, chordDuration * 0.95);  // Slightly shorter to prevent overlap
            
            // Tunggu sebelum chord berikutnya
            await this.sleep(chordDuration * 1000);
        }
        
        this.isPlaying = false;
        if (onChordChange) {
            onChordChange(null, -1);
        }
    }

    // Stop semua suara
    stopAll() {
        this.isPlaying = false;
        
        this.currentOscillators.forEach(({ oscillator, gainNode }) => {
            try {
                const now = this.audioContext.currentTime;
                gainNode.gain.linearRampToValueAtTime(0, now + 0.05);
                oscillator.stop(now + 0.1);
            } catch (e) {
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
    setVolume(value) {
        if (this.masterGain) {
            this.masterGain.gain.value = Math.max(0, Math.min(1, value));
        }
    }

    // Helper sleep function
    sleep(ms) {
        return new Promise(resolve => {
            this.playbackTimeout = setTimeout(resolve, ms);
        });
    }
}

// Export untuk digunakan di file lain
window.AudioEngine = AudioEngine;
