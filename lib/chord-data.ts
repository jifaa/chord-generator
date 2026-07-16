/**
 * ============================================
 * CHORD DATA - Database Akor untuk Berbagai Genre
 * Berbasis Circle of Fifths untuk Probabilitas Transisi
 *
 * Dikonversi dari js/chordData.js (vanilla JS) ke TypeScript.
 * ============================================
 */

// ============================================
// TYPES
// ============================================

/** Fungsi harmoni sebuah chord dalam graf */
export type ChordFunction =
  | 'tonic'
  | 'subdominant'
  | 'dominant'
  | 'minor'
  | 'seventh'
  | 'default';

/** Satu node dalam graf akor: daftar tujuan + bobot + fungsi harmoni */
export interface ChordGraphNode {
  targets: string[];
  weights: number[];
  function: ChordFunction;
}

/** Adjacency list lengkap untuk satu genre (key = roman numeral) */
export type ChordGraph = Record<string, ChordGraphNode>;

/** Data lengkap satu genre musik */
export interface GenreData {
  name: string;
  description: string;
  characteristics: string[];
  graph: ChordGraph;
  classicProgressions: string[][];
}

export type GenreKey =
  | 'pop'
  | 'rock'
  | 'jazz'
  | 'blues'
  | 'country'
  | 'rnb'
  | 'edm'
  | 'classical';

export interface PopularProgression {
  name: string;
  numerals: string[];
  description: string;
  songs: string[];
  genre: string;
}

export type ScaleType = 'major' | 'minor';

/** Peta roman numeral -> nama chord untuk satu kunci tertentu */
export type DiatonicChordMap = Record<string, string>;

// Definisi semua nada dasar
export const NOTES: string[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const FLAT_NOTES: string[] = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Interval untuk membuat skala mayor
const MAJOR_SCALE_INTERVALS: number[] = [0, 2, 4, 5, 7, 9, 11];
const MINOR_SCALE_INTERVALS: number[] = [0, 2, 3, 5, 7, 8, 10];

// ============================================
// CIRCLE OF FIFTHS - Weighted Adjacency System
// ============================================

// Posisi nada di Circle of Fifths (Major)
// C=0, G=1, D=2, A=3, E=4, B=5, F#/Gb=6, Db=7, Ab=8, Eb=9, Bb=10, F=11
const CHROMATIC_TO_CIRCLE_MAJOR: Record<number, number> = {
    0: 0,   // C
    1: 7,   // C#/Db
    2: 2,   // D
    3: 9,   // D#/Eb
    4: 4,   // E
    5: 11,  // F
    6: 6,   // F#/Gb
    7: 1,   // G
    8: 8,   // G#/Ab
    9: 3,   // A
    10: 10, // A#/Bb
    11: 5   // B
};

// Posisi nada di Circle of Fifths (Minor)
// Urutan: A, E, B, F#, C#, G#, D#, A#, F, C, G, D
const CIRCLE_MINOR_ORDER: string[] = ['A', 'E', 'B', 'Gb', 'Db', 'Ab', 'Eb', 'Bb', 'F', 'C', 'G', 'D'];

const CHROMATIC_TO_CIRCLE_MINOR: Record<number, number> = {};
CIRCLE_MINOR_ORDER.forEach((note, pos) => {
    const chromaIndex = FLAT_NOTES.indexOf(note) !== -1 ? FLAT_NOTES.indexOf(note) : NOTES.indexOf(note);
    CHROMATIC_TO_CIRCLE_MINOR[chromaIndex] = pos;
});

// Weight map berdasarkan jarak di Circle of Fifths
// Semakin dekat (jarak kecil), semakin harmonis (bobot besar)
const CIRCLE_WEIGHT_MAP: Record<number, number> = {
    0: 1.00,  // Sama persis
    1: 0.86,  // Sangat dekat (kuint/kuart)
    2: 0.71,  // Dekat
    3: 0.57,  // Cukup dekat
    4: 0.43,  // Agak jauh
    5: 0.29,  // Jauh
    6: 0.29   // Tritone (paling jauh)
};

/**
 * Mendapatkan posisi chord di Circle of Fifths
 */
function getCirclePosition(note: string, type: ScaleType = 'major'): number {
    let chromaIndex = NOTES.indexOf(note);
    if (chromaIndex === -1) {
        chromaIndex = FLAT_NOTES.indexOf(note);
    }
    if (chromaIndex === -1) {
        // Handle enharmonic equivalents
        const enharmonic: Record<string, string> = {
            'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb'
        };
        if (enharmonic[note]) {
            chromaIndex = FLAT_NOTES.indexOf(enharmonic[note]);
        }
    }

    if (type === 'minor') {
        return CHROMATIC_TO_CIRCLE_MINOR[chromaIndex] || 0;
    }
    return CHROMATIC_TO_CIRCLE_MAJOR[chromaIndex] || 0;
}

/**
 * Menghitung bobot transisi berdasarkan Circle of Fifths (0.29 - 1.00)
 */
export function getCircleWeight(fromNote: string, fromType: ScaleType, toNote: string, toType: ScaleType): number {
    const posFrom = getCirclePosition(fromNote, fromType);
    const posTo = getCirclePosition(toNote, toType);

    const diff = Math.abs(posFrom - posTo);
    const distance = Math.min(diff, 12 - diff);

    return CIRCLE_WEIGHT_MAP[distance] || 0.29;
}

/**
 * Mengkonversi bobot Circle of Fifths ke persentase untuk array weights (total ~100)
 */
export function normalizeWeights(weights: number[]): number[] {
    const total = weights.reduce((sum, w) => sum + w, 0);
    return weights.map(w => Math.round((w / total) * 100));
}

// Fungsi untuk mendapatkan skala
export function getScale(root: string, type: ScaleType = 'major'): string[] {
    const rootIndex = NOTES.indexOf(root) !== -1 ? NOTES.indexOf(root) : FLAT_NOTES.indexOf(root);
    const intervals = type === 'major' ? MAJOR_SCALE_INTERVALS : MINOR_SCALE_INTERVALS;

    return intervals.map(interval => {
        const noteIndex = (rootIndex + interval) % 12;
        return NOTES[noteIndex];
    });
}

// Fungsi untuk mendapatkan akor diatonic dalam kunci tertentu
export function getDiatonicChords(key: string): DiatonicChordMap {
    const scale = getScale(key.replace('m', ''), key.includes('m') ? 'minor' : 'major');

    if (key.includes('m')) {
        // Minor key
        return {
            'i': scale[0] + 'm',
            'ii°': scale[1] + 'dim',
            'III': scale[2],
            'iv': scale[3] + 'm',
            'v': scale[4] + 'm',
            'VI': scale[5],
            'VII': scale[6]
        };
    } else {
        // Major key
        return {
            'I': scale[0],
            'ii': scale[1] + 'm',
            'iii': scale[2] + 'm',
            'IV': scale[3],
            'V': scale[4],
            'vi': scale[5] + 'm',
            'vii°': scale[6] + 'dim'
        };
    }
}

// ============================================
// GRAF AKOR UNTUK SETIAP GENRE
// Bobot berdasarkan Circle of Fifths Distance
// Jarak 0=100, 1=86, 2=71, 3=57, 4=43, 5=29, 6=29
// ============================================

export const GENRE_CHORD_GRAPHS: Record<GenreKey, GenreData> = {
    // ============================================
    // POP - The "Axis of Awesome" Style
    // Dalam kunci C: I=C, ii=Dm, iii=Em, IV=F, V=G, vi=Am
    // Circle positions (Major): C=0, G=1, D=2, A=3, E=4, F=11
    // ============================================
    pop: {
        name: "Pop",
        description: "Graf pop berupa siklus sederhana yang berulang. Progresi I-V-vi-IV adalah 'formula ajaib' yang digunakan dalam ratusan lagu hit. Bobot berdasarkan jarak Circle of Fifths.",
        characteristics: [
            "Siklus 4 akor yang berulang (I-V-vi-IV)",
            "Sangat mudah diingat dan dinyanyikan",
            "Emosional tapi tetap ceria",
            "Bobot transisi berdasarkan Circle of Fifths"
        ],
        graph: {
            // I (C) -> V(G)=jarak 1=86, vi(Am)=jarak 3=57, IV(F)=jarak 1=86, ii(Dm)=jarak 2=71
            'I': { 
                targets: ['V', 'vi', 'IV', 'ii'], 
                weights: [29, 19, 29, 23],  // Normalized dari [86, 57, 86, 71] = 300 -> %
                function: 'tonic'
            },
            // V (G) -> vi(Am)=jarak 2=71, I(C)=jarak 1=86, IV(F)=jarak 2=71
            'V': { 
                targets: ['vi', 'I', 'IV'], 
                weights: [31, 38, 31],  // Normalized dari [71, 86, 71] = 228
                function: 'dominant'
            },
            // vi (Am) -> IV(F)=jarak 2=71, V(G)=jarak 2=71, I(C)=jarak 3=57
            'vi': { 
                targets: ['IV', 'V', 'I'], 
                weights: [36, 36, 28],  // Normalized dari [71, 71, 57] = 199
                function: 'minor'
            },
            // IV (F) -> I(C)=jarak 1=86, V(G)=jarak 2=71, vi(Am)=jarak 2=71, ii(Dm)=jarak 3=57
            'IV': { 
                targets: ['I', 'V', 'vi', 'ii'], 
                weights: [30, 25, 25, 20],  // Normalized dari [86, 71, 71, 57] = 285
                function: 'subdominant'
            },
            // ii (Dm) -> V(G)=jarak 1=86, IV(F)=jarak 3=57
            'ii': { 
                targets: ['V', 'IV'], 
                weights: [60, 40],  // Normalized dari [86, 57] = 143
                function: 'minor'
            },
            // iii (Em) -> vi(Am)=jarak 1=86, IV(F)=jarak 4=43
            'iii': { 
                targets: ['vi', 'IV'], 
                weights: [67, 33],  // Normalized dari [86, 43] = 129
                function: 'minor'
            }
        },
        classicProgressions: [
            ['I', 'V', 'vi', 'IV'],  // The classic pop progression
            ['I', 'IV', 'V', 'I'],   // 50s progression
            ['vi', 'IV', 'I', 'V'],  // Sad version
            ['I', 'vi', 'IV', 'V']   // 50s doo-wop
        ]
    },

    // ============================================
    // ROCK - Power Chord Driven
    // bVII dalam C = Bb, Circle position = 10
    // ============================================
    rock: {
        name: "Rock",
        description: "Rock menggunakan progresi yang kuat dengan penekanan pada akor power chord dan gerakan root note yang tegas. Bobot berdasarkan Circle of Fifths.",
        characteristics: [
            "Banyak menggunakan I, IV, V",
            "Sering menggunakan bVII (flat seven)",
            "Power chords (root + fifth)",
            "Bobot transisi berdasarkan Circle of Fifths"
        ],
        graph: {
            // I (C=0) -> IV(F=11)=jarak 1=86, V(G=1)=jarak 1=86, bVII(Bb=10)=jarak 2=71, vi(Am)=jarak 3=57
            'I': { 
                targets: ['IV', 'V', 'bVII', 'vi'], 
                weights: [29, 29, 23, 19],  // Normalized dari [86, 86, 71, 57] = 300
                function: 'tonic'
            },
            // IV (F=11) -> I(C=0)=jarak 1=86, V(G=1)=jarak 2=71, bVII(Bb=10)=jarak 1=86
            'IV': { 
                targets: ['I', 'V', 'bVII'], 
                weights: [35, 29, 36],  // Normalized dari [86, 71, 86] = 243
                function: 'subdominant'
            },
            // V (G=1) -> I(C=0)=jarak 1=86, IV(F=11)=jarak 2=71, bVII(Bb=10)=jarak 3=57
            'V': { 
                targets: ['I', 'IV', 'bVII'], 
                weights: [40, 33, 27],  // Normalized dari [86, 71, 57] = 214
                function: 'dominant'
            },
            // bVII (Bb=10) -> IV(F=11)=jarak 1=86, I(C=0)=jarak 2=71, V(G=1)=jarak 3=57
            'bVII': { 
                targets: ['IV', 'I', 'V'], 
                weights: [40, 33, 27],  // Normalized dari [86, 71, 57] = 214
                function: 'seventh'
            },
            // vi (Am) -> IV(F)=jarak 2=71, V(G)=jarak 2=71, I(C)=jarak 3=57
            'vi': { 
                targets: ['IV', 'V', 'I'], 
                weights: [36, 36, 28],  // Normalized dari [71, 71, 57] = 199
                function: 'minor'
            },
            // ii (Dm=2) -> V(G=1)=jarak 1=86, IV(F=11)=jarak 3=57
            'ii': { 
                targets: ['V', 'IV'], 
                weights: [60, 40],  // Normalized dari [86, 57] = 143
                function: 'minor'
            }
        },
        classicProgressions: [
            ['I', 'IV', 'V', 'IV'],     // Classic rock
            ['I', 'bVII', 'IV', 'I'],   // Rock anthem
            ['I', 'V', 'bVII', 'IV'],   // Modern rock
            ['vi', 'IV', 'I', 'V']      // Emotional rock
        ]
    },

    // ============================================
    // JAZZ - Complex ii-V-I with Substitutions
    // Menggunakan extended chords, jarak dihitung dari root note
    // ============================================
    jazz: {
        name: "Jazz",
        description: "Jazz menggunakan progresi kompleks dengan seventh chords, extended chords, dan substitusi tritone. Bobot berdasarkan Circle of Fifths.",
        characteristics: [
            "Pola dasar ii-V-I (Dm7-G7-Cmaj7)",
            "Tritone substitution (G7 → Db7 → C)",
            "Extended chords (9th, 11th, 13th)",
            "Bobot transisi berdasarkan Circle of Fifths"
        ],
        graph: {
            // Imaj7 (C=0) -> ii7(D=2)=jarak 2=71, IV7(F=11)=jarak 1=86, vi7(A=3)=jarak 3=57, #IVdim7(F#=6)=jarak 6=29
            'Imaj7': { 
                targets: ['ii7', 'IV7', 'vi7', '#IVdim7'], 
                weights: [29, 35, 24, 12],  // Normalized dari [71, 86, 57, 29] = 243
                function: 'tonic'
            },
            // ii7 (D=2) -> V7(G=1)=jarak 1=86, bII7(Db=7)=jarak 5=29
            'ii7': { 
                targets: ['V7', 'bII7'], 
                weights: [75, 25],  // Normalized dari [86, 29] = 115
                function: 'minor'
            },
            // V7 (G=1) -> Imaj7(C=0)=jarak 1=86, vi7(A=3)=jarak 2=71, bII7(Db=7)=jarak 6=29
            'V7': { 
                targets: ['Imaj7', 'vi7', 'bII7'], 
                weights: [46, 38, 16],  // Normalized dari [86, 71, 29] = 186
                function: 'dominant'
            },
            // vi7 (A=3) -> ii7(D=2)=jarak 1=86, IV7(F=11)=jarak 4=43, V7(G=1)=jarak 2=71
            'vi7': { 
                targets: ['ii7', 'IV7', 'V7'], 
                weights: [43, 22, 35],  // Normalized dari [86, 43, 71] = 200
                function: 'minor'
            },
            // IV7 (F=11) -> V7(G=1)=jarak 2=71, iii7(E=4)=jarak 5=29, bVII7(Bb=10)=jarak 1=86
            'IV7': { 
                targets: ['V7', 'iii7', 'bVII7'], 
                weights: [38, 16, 46],  // Normalized dari [71, 29, 86] = 186
                function: 'subdominant'
            },
            // iii7 (E=4) -> vi7(A=3)=jarak 1=86, bIII7(Eb=9)=jarak 5=29
            'iii7': { 
                targets: ['vi7', 'bIII7'], 
                weights: [75, 25],  // Normalized dari [86, 29] = 115
                function: 'minor'
            },
            // bII7 (Db=7) -> Imaj7(C=0)=jarak 5=29 (tritone sub resolves to I)
            'bII7': { 
                targets: ['Imaj7'], 
                weights: [100],
                function: 'seventh'
            },
            // #IVdim7 (F#=6) -> V7(G=1)=jarak 5=29, Imaj7(C=0)=jarak 6=29
            '#IVdim7': { 
                targets: ['V7', 'Imaj7'], 
                weights: [50, 50],  // Normalized dari [29, 29] = 58
                function: 'seventh'
            },
            // bVII7 (Bb=10) -> Imaj7(C=0)=jarak 2=71, IV7(F=11)=jarak 1=86
            'bVII7': { 
                targets: ['Imaj7', 'IV7'], 
                weights: [45, 55],  // Normalized dari [71, 86] = 157
                function: 'seventh'
            },
            // bIII7 (Eb=9) -> bVII7(Bb=10)=jarak 1=86, ii7(D=2)=jarak 5=29
            'bIII7': { 
                targets: ['bVII7', 'ii7'], 
                weights: [75, 25],  // Normalized dari [86, 29] = 115
                function: 'seventh'
            }
        },
        classicProgressions: [
            ['ii7', 'V7', 'Imaj7'],           // Basic ii-V-I
            ['Imaj7', 'vi7', 'ii7', 'V7'],    // Rhythm changes
            ['iii7', 'vi7', 'ii7', 'V7'],     // Extended turnaround
            ['Imaj7', '#IVdim7', 'V7', 'Imaj7'] // With passing diminished
        ]
    },

    // ============================================
    // BLUES - 12-Bar Blues Structure
    // Semua chord dominan 7th
    // ============================================
    blues: {
        name: "Blues",
        description: "Blues menggunakan struktur 12-bar yang ikonik dengan dominant 7th chords. Bobot berdasarkan Circle of Fifths.",
        characteristics: [
            "12-bar structure klasik",
            "Semua akor menggunakan dominant 7th",
            "Turnaround di akhir progression",
            "Bobot transisi berdasarkan Circle of Fifths"
        ],
        graph: {
            // I7 (C=0) -> IV7(F=11)=jarak 1=86, V7(G=1)=jarak 1=86
            'I7': { 
                targets: ['IV7', 'V7'], 
                weights: [50, 50],  // Normalized dari [86, 86] = 172
                function: 'tonic'
            },
            // IV7 (F=11) -> I7(C=0)=jarak 1=86, V7(G=1)=jarak 2=71, #IVdim7(F#=6)=jarak 5=29
            'IV7': { 
                targets: ['I7', 'V7', '#IVdim7'], 
                weights: [46, 38, 16],  // Normalized dari [86, 71, 29] = 186
                function: 'subdominant'
            },
            // V7 (G=1) -> I7(C=0)=jarak 1=86, IV7(F=11)=jarak 2=71
            'V7': { 
                targets: ['I7', 'IV7'], 
                weights: [55, 45],  // Normalized dari [86, 71] = 157
                function: 'dominant'
            },
            // #IVdim7 (F#=6) -> V7(G=1)=jarak 5=29, I7(C=0)=jarak 6=29
            '#IVdim7': { 
                targets: ['V7', 'I7'], 
                weights: [50, 50],  // Normalized dari [29, 29] = 58
                function: 'seventh'
            },
            // ii7 (D=2) -> V7(G=1)=jarak 1=86
            'ii7': { 
                targets: ['V7'], 
                weights: [100],
                function: 'minor'
            },
            // vi7 (A=3) -> ii7(D=2)=jarak 1=86, V7(G=1)=jarak 2=71
            'vi7': { 
                targets: ['ii7', 'V7'], 
                weights: [55, 45],  // Normalized dari [86, 71] = 157
                function: 'minor'
            }
        },
        classicProgressions: [
            ['I7', 'I7', 'I7', 'I7', 'IV7', 'IV7', 'I7', 'I7', 'V7', 'IV7', 'I7', 'V7'], // 12-bar blues
            ['I7', 'IV7', 'I7', 'V7'],   // Quick change blues
            ['I7', '#IVdim7', 'V7', 'I7'] // Blues turnaround
        ]
    },

    // ============================================
    // COUNTRY - Nashville Number System
    // ============================================
    country: {
        name: "Country",
        description: "Country music sering menggunakan progresi yang 'honest' dan straightforward. Bobot berdasarkan Circle of Fifths.",
        characteristics: [
            "Progresi I-IV-V yang polos",
            "Sering menggunakan sus chords",
            "Pedal steel guitar-friendly progressions",
            "Bobot transisi berdasarkan Circle of Fifths"
        ],
        graph: {
            // I (C=0) -> IV(F=11)=jarak 1=86, V(G=1)=jarak 1=86, vi(Am)=jarak 3=57, ii(Dm)=jarak 2=71
            'I': { 
                targets: ['IV', 'V', 'vi', 'ii'], 
                weights: [29, 29, 19, 23],  // Normalized dari [86, 86, 57, 71] = 300
                function: 'tonic'
            },
            // IV (F=11) -> I(C=0)=jarak 1=86, V(G=1)=jarak 2=71, ii(Dm)=jarak 3=57
            'IV': { 
                targets: ['I', 'V', 'ii'], 
                weights: [40, 33, 27],  // Normalized dari [86, 71, 57] = 214
                function: 'subdominant'
            },
            // V (G=1) -> I(C=0)=jarak 1=86, IV(F=11)=jarak 2=71, vi(Am)=jarak 2=71
            'V': { 
                targets: ['I', 'IV', 'vi'], 
                weights: [38, 31, 31],  // Normalized dari [86, 71, 71] = 228
                function: 'dominant'
            },
            // vi (Am) -> IV(F)=jarak 2=71, ii(Dm)=jarak 1=86, V(G)=jarak 2=71
            'vi': { 
                targets: ['IV', 'ii', 'V'], 
                weights: [31, 38, 31],  // Normalized dari [71, 86, 71] = 228
                function: 'minor'
            },
            // ii (Dm=2) -> V(G=1)=jarak 1=86, IV(F=11)=jarak 3=57
            'ii': { 
                targets: ['V', 'IV'], 
                weights: [60, 40],  // Normalized dari [86, 57] = 143
                function: 'minor'
            },
            // iii (Em=4) -> vi(Am)=jarak 1=86, IV(F=11)=jarak 5=29
            'iii': { 
                targets: ['vi', 'IV'], 
                weights: [75, 25],  // Normalized dari [86, 29] = 115
                function: 'minor'
            }
        },
        classicProgressions: [
            ['I', 'IV', 'V', 'I'],      // Basic country
            ['I', 'V', 'vi', 'IV'],     // Modern country
            ['I', 'IV', 'I', 'V'],      // Train beat country
            ['vi', 'IV', 'I', 'V']      // Sad country ballad
        ]
    },

    // ============================================
    // R&B / SOUL - Smooth Progressions
    // ============================================
    rnb: {
        name: "R&B/Soul",
        description: "R&B menggunakan progresi yang smooth dengan extended chords. Bobot berdasarkan Circle of Fifths.",
        characteristics: [
            "Extended chords (7th, 9th, 11th)",
            "Chromatic bass movement",
            "Gospel-influenced progressions",
            "Bobot transisi berdasarkan Circle of Fifths"
        ],
        graph: {
            'Imaj7': { 
                targets: ['IV7', 'ii7', 'vi7', 'V7'], 
                weights: [30, 30, 25, 15],
                function: 'tonic'
            },
            'ii7': { 
                targets: ['V7', 'Imaj7', 'bVII7'], 
                weights: [45, 35, 20],
                function: 'minor'
            },
            'IV7': { 
                targets: ['iii7', 'V7', 'Imaj7'], 
                weights: [35, 35, 30],
                function: 'subdominant'
            },
            'V7': { 
                targets: ['Imaj7', 'vi7', 'IV7'], 
                weights: [45, 35, 20],
                function: 'dominant'
            },
            'vi7': { 
                targets: ['ii7', 'IV7', 'V7'], 
                weights: [40, 35, 25],
                function: 'minor'
            },
            'iii7': { 
                targets: ['vi7', 'ii7'], 
                weights: [55, 45],
                function: 'minor'
            },
            'bVII7': { 
                targets: ['IV7', 'Imaj7'], 
                weights: [55, 45],
                function: 'seventh'
            }
        },
        classicProgressions: [
            ['Imaj7', 'vi7', 'ii7', 'V7'],    // Classic R&B
            ['ii7', 'V7', 'Imaj7', 'IV7'],    // Neo-soul
            ['Imaj7', 'iii7', 'vi7', 'IV7'],  // Smooth R&B
            ['vi7', 'ii7', 'V7', 'Imaj7']     // Gospel influenced
        ]
    },

    // ============================================
    // EDM - Electronic Dance Music
    // ============================================
    edm: {
        name: "EDM",
        description: "EDM menggunakan progresi yang membangun energy dengan drops yang powerful. Chord progressions sering dimodifikasi untuk maximum impact.",
        characteristics: [
            "Build-up dan drop structure",
            "Minor keys untuk emotional impact",
            "Simple but powerful progressions",
            "Supersaw chords dan plucks"
        ],
        graph: {
            'i': { 
                targets: ['VI', 'III', 'VII', 'iv'], 
                weights: [30, 30, 25, 15],
                function: 'tonic'
            },
            'VI': { 
                targets: ['VII', 'III', 'i'], 
                weights: [40, 35, 25],
                function: 'subdominant'
            },
            'VII': { 
                targets: ['i', 'III', 'VI'], 
                weights: [45, 30, 25],
                function: 'seventh'
            },
            'III': { 
                targets: ['VI', 'VII', 'iv'], 
                weights: [40, 35, 25],
                function: 'tonic'
            },
            'iv': { 
                targets: ['i', 'VI', 'VII'], 
                weights: [40, 35, 25],
                function: 'minor'
            },
            'v': { 
                targets: ['i', 'VI'], 
                weights: [60, 40],
                function: 'minor'
            }
        },
        classicProgressions: [
            ['i', 'VI', 'III', 'VII'],    // Classic EDM (Am-F-C-G in Am)
            ['i', 'VII', 'VI', 'VII'],    // Trance style
            ['i', 'iv', 'VI', 'VII'],     // Future bass
            ['VI', 'VII', 'i', 'III']     // Progressive house
        ]
    },

    // ============================================
    // CLASSICAL - Traditional Harmony
    // ============================================
    classical: {
        name: "Classical",
        description: "Musik klasik mengikuti aturan harmoni tradisional dengan voice leading yang ketat dan cadences yang proper.",
        characteristics: [
            "Authentic cadence (V-I)",
            "Plagal cadence (IV-I)",
            "Deceptive cadence (V-vi)",
            "Strict voice leading rules"
        ],
        graph: {
            'I': { 
                targets: ['IV', 'V', 'vi', 'ii'], 
                weights: [30, 35, 20, 15],
                function: 'tonic'
            },
            'ii': { 
                targets: ['V', 'viio'], 
                weights: [70, 30],
                function: 'minor'
            },
            'iii': { 
                targets: ['vi', 'IV'], 
                weights: [55, 45],
                function: 'minor'
            },
            'IV': { 
                targets: ['V', 'I', 'ii'], 
                weights: [45, 35, 20],
                function: 'subdominant'
            },
            'V': { 
                targets: ['I', 'vi'], 
                weights: [75, 25],
                function: 'dominant'
            },
            'vi': { 
                targets: ['ii', 'IV', 'V'], 
                weights: [40, 35, 25],
                function: 'minor'
            },
            'viio': { 
                targets: ['I', 'iii'], 
                weights: [80, 20],
                function: 'seventh'
            }
        },
        classicProgressions: [
            ['I', 'IV', 'V', 'I'],        // Basic cadence
            ['I', 'vi', 'IV', 'V'],       // Romantic era
            ['I', 'ii', 'V', 'I'],        // ii-V-I
            ['I', 'IV', 'viio', 'I']      // With diminished
        ]
    }
};

// ============================================
// POPULAR PROGRESSIONS DATABASE
// ============================================

export const POPULAR_PROGRESSIONS: PopularProgression[] = [
    {
        name: "The Pop Canon",
        numerals: ['I', 'V', 'vi', 'IV'],
        description: "Digunakan dalam ratusan lagu pop",
        songs: ["Let It Be - Beatles", "No Woman No Cry - Bob Marley", "With or Without You - U2"],
        genre: "Pop"
    },
    {
        name: "50s Progression",
        numerals: ['I', 'vi', 'IV', 'V'],
        description: "Klasik doo-wop era 50an",
        songs: ["Stand By Me - Ben E. King", "Every Breath You Take - Police"],
        genre: "Pop/Rock"
    },
    {
        name: "Sad Progression",
        numerals: ['vi', 'IV', 'I', 'V'],
        description: "Versi minor dari pop canon",
        songs: ["Numb - Linkin Park", "Zombie - Cranberries"],
        genre: "Rock/Pop"
    },
    {
        name: "12-Bar Blues",
        numerals: ['I7', 'I7', 'I7', 'I7', 'IV7', 'IV7', 'I7', 'I7', 'V7', 'IV7', 'I7', 'V7'],
        description: "Struktur blues klasik",
        songs: ["Johnny B. Goode - Chuck Berry", "Sweet Home Chicago - Robert Johnson"],
        genre: "Blues"
    },
    {
        name: "Jazz ii-V-I",
        numerals: ['ii7', 'V7', 'Imaj7'],
        description: "Fondasi jazz harmony",
        songs: ["Autumn Leaves", "All The Things You Are"],
        genre: "Jazz"
    },
    {
        name: "Rhythm Changes",
        numerals: ['Imaj7', 'vi7', 'ii7', 'V7'],
        description: "Berdasarkan 'I Got Rhythm'",
        songs: ["I Got Rhythm - Gershwin", "Oleo - Sonny Rollins"],
        genre: "Jazz"
    },
    {
        name: "Andalusian Cadence",
        numerals: ['i', 'VII', 'VI', 'V'],
        description: "Flamenco/Spanish progression",
        songs: ["Hit The Road Jack - Ray Charles", "Smooth - Santana"],
        genre: "Latin/Pop"
    },
    {
        name: "Pachelbel's Canon",
        numerals: ['I', 'V', 'vi', 'iii', 'IV', 'I', 'IV', 'V'],
        description: "Baroque progression yang abadi",
        songs: ["Canon in D - Pachelbel", "Basket Case - Green Day"],
        genre: "Classical/Rock"
    },
    {
        name: "EDM Anthem",
        numerals: ['i', 'VI', 'III', 'VII'],
        description: "Festival anthem progression",
        songs: ["Wake Me Up - Avicii", "Titanium - David Guetta"],
        genre: "EDM"
    },
    {
        name: "Neo-Soul",
        numerals: ['Imaj7', 'iii7', 'vi7', 'IV7'],
        description: "Smooth neo-soul progression",
        songs: ["Untitled (How Does It Feel) - D'Angelo"],
        genre: "R&B/Soul"
    },
    {
        name: "Rock Anthem",
        numerals: ['I', 'bVII', 'IV', 'I'],
        description: "Power rock progression",
        songs: ["Sweet Child O' Mine - Guns N' Roses", "Livin' On A Prayer - Bon Jovi"],
        genre: "Rock"
    },
    {
        name: "Country Classic",
        numerals: ['I', 'IV', 'V', 'I'],
        description: "Simple country progression",
        songs: ["Wagon Wheel - Old Crow Medicine Show", "Ring of Fire - Johnny Cash"],
        genre: "Country"
    }
];

// ============================================
// CHORD FORMULAS (untuk Audio Engine)
// ============================================

export const CHORD_FORMULAS: Record<string, number[]> = {
    '': [0, 4, 7],              // Major triad
    'm': [0, 3, 7],             // Minor triad
    '7': [0, 4, 7, 10],         // Dominant 7th
    'maj7': [0, 4, 7, 11],      // Major 7th
    'm7': [0, 3, 7, 10],        // Minor 7th
    'dim': [0, 3, 6],           // Diminished triad
    'dim7': [0, 3, 6, 9],       // Diminished 7th
    'aug': [0, 4, 8],           // Augmented triad
    'sus2': [0, 2, 7],          // Suspended 2nd
    'sus4': [0, 5, 7],          // Suspended 4th
    '9': [0, 4, 7, 10, 14],     // Dominant 9th
    'maj9': [0, 4, 7, 11, 14],  // Major 9th
    'm9': [0, 3, 7, 10, 14],    // Minor 9th
    'add9': [0, 4, 7, 14],      // Add 9
    '6': [0, 4, 7, 9],          // Major 6th
    'm6': [0, 3, 7, 9]          // Minor 6th
};

// ============================================
// UI METADATA (bantuan untuk komponen React)
// ============================================

export interface GenreMeta {
  key: GenreKey;
  label: string;
}

/** Daftar genre, urutan sesuai UI asli */
export const GENRES: GenreMeta[] = [
  { key: 'pop', label: 'Pop' },
  { key: 'rock', label: 'Rock' },
  { key: 'jazz', label: 'Jazz' },
  { key: 'blues', label: 'Blues' },
  { key: 'country', label: 'Country' },
  { key: 'rnb', label: 'R&B/Soul' },
  { key: 'edm', label: 'EDM' },
  { key: 'classical', label: 'Classical' },
];

export interface KeyOption {
  value: string;
  label: string;
}

/** Daftar kunci dasar yang tersedia di selector */
export const KEY_OPTIONS: KeyOption[] = [
  { value: 'C', label: 'C Mayor' },
  { value: 'G', label: 'G Mayor' },
  { value: 'D', label: 'D Mayor' },
  { value: 'A', label: 'A Mayor' },
  { value: 'E', label: 'E Mayor' },
  { value: 'F', label: 'F Mayor' },
  { value: 'Bb', label: 'Bb Mayor' },
  { value: 'Am', label: 'A Minor' },
  { value: 'Em', label: 'E Minor' },
  { value: 'Dm', label: 'D Minor' },
];

/** Warna (hex) untuk tiap fungsi chord — dipakai di canvas graph (Explorer) & badge, selaras dengan palet Tailwind di globals.css */
export const CHORD_FUNCTION_COLORS: Record<ChordFunction, string> = {
  tonic: '#34d399',
  subdominant: '#22d3ee',
  dominant: '#fb7185',
  minor: '#a78bfa',
  seventh: '#f5a524',
  default: '#64748b',
};

