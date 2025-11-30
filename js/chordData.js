/**
 * ============================================
 * CHORD DATA - Database Akor untuk Berbagai Genre
 * ============================================
 */

// Definisi semua nada dasar
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Interval untuk membuat skala mayor
const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
const MINOR_SCALE_INTERVALS = [0, 2, 3, 5, 7, 8, 10];

// Fungsi untuk mendapatkan skala
function getScale(root, type = 'major') {
    const rootIndex = NOTES.indexOf(root) !== -1 ? NOTES.indexOf(root) : FLAT_NOTES.indexOf(root);
    const intervals = type === 'major' ? MAJOR_SCALE_INTERVALS : MINOR_SCALE_INTERVALS;
    
    return intervals.map(interval => {
        const noteIndex = (rootIndex + interval) % 12;
        return NOTES[noteIndex];
    });
}

// Fungsi untuk mendapatkan akor diatonic dalam kunci tertentu
function getDiatonicChords(key) {
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
// ============================================

const GENRE_CHORD_GRAPHS = {
    // ============================================
    // POP - The "Axis of Awesome" Style
    // ============================================
    pop: {
        name: "Pop",
        description: "Graf pop berupa siklus sederhana yang berulang. Progresi I-V-vi-IV adalah 'formula ajaib' yang digunakan dalam ratusan lagu hit.",
        characteristics: [
            "Siklus 4 akor yang berulang (I-V-vi-IV)",
            "Sangat mudah diingat dan dinyanyikan",
            "Emosional tapi tetap ceria",
            "Cocok untuk melodi sederhana"
        ],
        graph: {
            'I': { 
                targets: ['V', 'vi', 'IV', 'ii'], 
                weights: [35, 30, 25, 10],
                function: 'tonic'
            },
            'V': { 
                targets: ['vi', 'I', 'IV'], 
                weights: [40, 35, 25],
                function: 'dominant'
            },
            'vi': { 
                targets: ['IV', 'V', 'I'], 
                weights: [45, 30, 25],
                function: 'minor'
            },
            'IV': { 
                targets: ['I', 'V', 'vi', 'ii'], 
                weights: [35, 30, 25, 10],
                function: 'subdominant'
            },
            'ii': { 
                targets: ['V', 'IV'], 
                weights: [60, 40],
                function: 'minor'
            },
            'iii': { 
                targets: ['vi', 'IV'], 
                weights: [50, 50],
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
    // ============================================
    rock: {
        name: "Rock",
        description: "Rock menggunakan progresi yang kuat dengan penekanan pada akor power chord dan gerakan root note yang tegas.",
        characteristics: [
            "Banyak menggunakan I, IV, V",
            "Sering menggunakan bVII (flat seven)",
            "Power chords (root + fifth)",
            "Gerakan chromatic untuk transisi"
        ],
        graph: {
            'I': { 
                targets: ['IV', 'V', 'bVII', 'vi'], 
                weights: [30, 30, 25, 15],
                function: 'tonic'
            },
            'IV': { 
                targets: ['I', 'V', 'bVII'], 
                weights: [40, 35, 25],
                function: 'subdominant'
            },
            'V': { 
                targets: ['I', 'IV', 'bVII'], 
                weights: [50, 30, 20],
                function: 'dominant'
            },
            'bVII': { 
                targets: ['IV', 'I', 'V'], 
                weights: [40, 35, 25],
                function: 'seventh'
            },
            'vi': { 
                targets: ['IV', 'V', 'I'], 
                weights: [40, 35, 25],
                function: 'minor'
            },
            'ii': { 
                targets: ['V', 'IV'], 
                weights: [55, 45],
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
    // ============================================
    jazz: {
        name: "Jazz",
        description: "Jazz menggunakan progresi kompleks dengan seventh chords, extended chords, dan substitusi tritone. Graf jazz sangat berliku dengan banyak jalur alternatif.",
        characteristics: [
            "Pola dasar ii-V-I (Dm7-G7-Cmaj7)",
            "Tritone substitution (G7 → Db7 → C)",
            "Extended chords (9th, 11th, 13th)",
            "Secondary dominants dan modal interchange"
        ],
        graph: {
            'Imaj7': { 
                targets: ['ii7', 'IV7', 'vi7', '#IVdim7'], 
                weights: [35, 25, 25, 15],
                function: 'tonic'
            },
            'ii7': { 
                targets: ['V7', 'bII7'], 
                weights: [70, 30],
                function: 'minor'
            },
            'V7': { 
                targets: ['Imaj7', 'vi7', 'bII7'], 
                weights: [50, 30, 20],
                function: 'dominant'
            },
            'vi7': { 
                targets: ['ii7', 'IV7', 'V7'], 
                weights: [45, 30, 25],
                function: 'minor'
            },
            'IV7': { 
                targets: ['iii7', 'V7', 'bVII7'], 
                weights: [35, 40, 25],
                function: 'subdominant'
            },
            'iii7': { 
                targets: ['vi7', 'bIII7'], 
                weights: [60, 40],
                function: 'minor'
            },
            'bII7': { 
                targets: ['Imaj7'], 
                weights: [100],
                function: 'seventh'
            },
            '#IVdim7': { 
                targets: ['V7', 'Imaj7'], 
                weights: [60, 40],
                function: 'seventh'
            },
            'bVII7': { 
                targets: ['Imaj7', 'IV7'], 
                weights: [55, 45],
                function: 'seventh'
            },
            'bIII7': { 
                targets: ['bVII7', 'ii7'], 
                weights: [50, 50],
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
    // ============================================
    blues: {
        name: "Blues",
        description: "Blues menggunakan struktur 12-bar yang ikonik dengan dominant 7th chords. Graf blues sederhana tapi sangat ekspresif.",
        characteristics: [
            "12-bar structure klasik",
            "Semua akor menggunakan dominant 7th",
            "Turnaround di akhir progression",
            "Blue notes dan pentatonic scale"
        ],
        graph: {
            'I7': { 
                targets: ['IV7', 'V7'], 
                weights: [60, 40],
                function: 'tonic'
            },
            'IV7': { 
                targets: ['I7', 'V7', '#IVdim7'], 
                weights: [50, 35, 15],
                function: 'subdominant'
            },
            'V7': { 
                targets: ['IV7', 'I7'], 
                weights: [40, 60],
                function: 'dominant'
            },
            '#IVdim7': { 
                targets: ['V7', 'I7'], 
                weights: [70, 30],
                function: 'seventh'
            },
            'ii7': { 
                targets: ['V7'], 
                weights: [100],
                function: 'minor'
            },
            'vi7': { 
                targets: ['ii7', 'V7'], 
                weights: [50, 50],
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
        description: "Country music sering menggunakan progresi yang 'honest' dan straightforward dengan penekanan pada storytelling.",
        characteristics: [
            "Progresi I-IV-V yang polos",
            "Sering menggunakan sus chords",
            "Pedal steel guitar-friendly progressions",
            "Walking bass lines"
        ],
        graph: {
            'I': { 
                targets: ['IV', 'V', 'vi', 'ii'], 
                weights: [35, 30, 20, 15],
                function: 'tonic'
            },
            'IV': { 
                targets: ['I', 'V', 'ii'], 
                weights: [45, 40, 15],
                function: 'subdominant'
            },
            'V': { 
                targets: ['I', 'IV', 'vi'], 
                weights: [55, 30, 15],
                function: 'dominant'
            },
            'vi': { 
                targets: ['IV', 'ii', 'V'], 
                weights: [40, 35, 25],
                function: 'minor'
            },
            'ii': { 
                targets: ['V', 'IV'], 
                weights: [65, 35],
                function: 'minor'
            },
            'iii': { 
                targets: ['vi', 'IV'], 
                weights: [55, 45],
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
        description: "R&B menggunakan progresi yang smooth dengan extended chords dan chromatic movements untuk menciptakan groove yang sensual.",
        characteristics: [
            "Extended chords (7th, 9th, 11th)",
            "Chromatic bass movement",
            "Gospel-influenced progressions",
            "Neo-soul complex harmonies"
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

const POPULAR_PROGRESSIONS = [
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

const CHORD_FORMULAS = {
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

// Export untuk digunakan di file lain
window.ChordData = {
    NOTES,
    FLAT_NOTES,
    GENRE_CHORD_GRAPHS,
    POPULAR_PROGRESSIONS,
    CHORD_FORMULAS,
    getScale,
    getDiatonicChords
};
