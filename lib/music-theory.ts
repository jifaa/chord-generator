/**
 * ============================================
 * MUSIC THEORY HELPERS
 *
 * Dikonversi dari method-method ChordProgressionApp di js/app.js.
 * Di kode asli method ini bergantung pada `this.currentKey`; di sini
 * diubah menjadi fungsi murni yang menerima `key` sebagai parameter,
 * supaya mudah dipakai lintas komponen React / hook.
 * ============================================
 */

import { NOTES, getScale, getDiatonicChords, type DiatonicChordMap } from './chord-data';

const NUMERAL_MAP: Record<string, number> = {
  I: 0, II: 1, III: 2, IV: 3, V: 4, VI: 5, VII: 6,
  i: 0, ii: 1, iii: 2, iv: 3, v: 4, vi: 5, vii: 6,
};

const ALTER_NUMERAL_MAP: Record<string, number> = {
  I: 0, II: 1, III: 2, IV: 3, V: 4, VI: 5, VII: 6,
};

/** Convert roman numeral (I, ii, V7, ...) ke nama chord (C, Dm, G7, ...) untuk kunci tertentu. */
export function numeralToChord(numeral: string, key: string): string {
  const scale = getScale(key.replace('m', ''), key.includes('m') ? 'minor' : 'major');

  const cleanNumeral = numeral.replace(/[^IViv]/g, '');
  const isMinor = numeral === numeral.toLowerCase() || numeral.includes('m');

  const scaleIndex = NUMERAL_MAP[cleanNumeral] ?? NUMERAL_MAP[cleanNumeral.toUpperCase()];
  if (scaleIndex === undefined) return numeral;

  let chord = scale[scaleIndex];
  if (isMinor && !chord.includes('m')) {
    chord += 'm';
  }

  return chord;
}

/** Hitung chord yang dinaikkan/diturunkan `semitones` dari root diatonic (untuk numeral ber-prefix b/#). */
export function getAlteredChord(numeral: string, semitones: number, key: string): string {
  const scale = getScale(key.replace('m', ''));

  const baseNumeral = numeral.replace(/[^IViv°]/g, '').toUpperCase();
  const isMinor = numeral.includes('m') || numeral === numeral.toLowerCase();
  const isDim = numeral.includes('dim') || numeral.includes('°');
  const isSeventh = numeral.includes('7');

  const scaleIndex = ALTER_NUMERAL_MAP[baseNumeral];
  if (scaleIndex === undefined) return numeral;

  const rootIndex = NOTES.indexOf(scale[scaleIndex]);
  const alteredIndex = (rootIndex + semitones + 12) % 12;
  let chord = NOTES[alteredIndex];

  if (isDim) chord += 'dim';
  else if (isMinor) chord += 'm';
  if (isSeventh) chord += '7';

  return chord;
}

/**
 * Translate daftar roman numeral (dari graf genre) menjadi nama chord nyata
 * berdasarkan kunci yang dipilih user. Menangani numeral biasa (I, vi),
 * seventh (Imaj7, V7), diminished (vii°) dan alterasi (bVII, #IV).
 */
export function translateProgressionToKey(numerals: string[], key: string): string[] {
  const diatonicChords: DiatonicChordMap = getDiatonicChords(key);

  return numerals.map((numeral) => {
    // Handle special numerals directly
    if (diatonicChords[numeral]) {
      return diatonicChords[numeral];
    }

    // Handle alterations (bVII, #IV, etc.)
    if (numeral.startsWith('b')) {
      const baseNumeral = numeral.substring(1);
      return getAlteredChord(baseNumeral, -1, key);
    }
    if (numeral.startsWith('#')) {
      const baseNumeral = numeral.substring(1);
      return getAlteredChord(baseNumeral, 1, key);
    }

    // Handle seventh chords (Imaj7, ii7, V7, vi7, IV7, iii7, etc.)
    if (numeral.includes('7') || numeral.includes('maj7') || numeral.includes('dim7')) {
      // Extract base numeral (remove all suffixes)
      const baseNumeral = numeral
        .replace('maj7', '')
        .replace('dim7', '')
        .replace('7', '')
        .replace('°', '');

      // Try to find in diatonic chords
      let baseChord =
        diatonicChords[baseNumeral] ||
        diatonicChords[baseNumeral.toUpperCase()] ||
        diatonicChords[baseNumeral.toLowerCase()];

      // If not found, try to calculate from numeral
      if (!baseChord) {
        baseChord = numeralToChord(baseNumeral, key);
      }

      // Add appropriate suffix
      if (numeral.includes('maj7')) {
        return baseChord.replace('m', '').replace('dim', '') + 'maj7';
      } else if (numeral.includes('dim7')) {
        return baseChord.replace('m', '').replace('dim', '') + 'dim7';
      } else if (numeral.includes('7')) {
        return baseChord + '7';
      }
    }

    // Handle diminished chords (viio, vii°)
    if (numeral.includes('°') || numeral.includes('o')) {
      const baseNumeral = numeral.replace('°', '').replace('o', '');
      let baseChord = diatonicChords[baseNumeral + '°'] || numeralToChord(baseNumeral, key);
      if (!baseChord.includes('dim')) {
        baseChord = baseChord.replace('m', '') + 'dim';
      }
      return baseChord;
    }

    // Fallback: try to calculate chord from numeral
    const calculatedChord = numeralToChord(numeral, key);
    if (calculatedChord !== numeral) {
      return calculatedChord;
    }

    // Final fallback: return as is
    return numeral;
  });
}

/** Nama lengkap untuk suffix tipe chord (m, 7, maj7, dim, ...) -> "Minor", "Dominant 7th", dst. */
const CHORD_TYPE_NAMES: Record<string, string> = {
  '': 'Mayor',
  m: 'Minor',
  '7': 'Dominant 7th',
  maj7: 'Major 7th',
  m7: 'Minor 7th',
  dim: 'Diminished',
  dim7: 'Diminished 7th',
  aug: 'Augmented',
  sus2: 'Suspended 2nd',
  sus4: 'Suspended 4th',
};

export function getChordTypeName(type: string): string {
  return CHORD_TYPE_NAMES[type] || type || 'Mayor';
}

/** Saran penggunaan progression berdasarkan genre, untuk panel analisis di halaman Generator. */
const USAGE_SUGGESTIONS: Record<string, string> = {
  pop: 'Verse/Chorus lagu pop, musik iklan, background music',
  rock: 'Intro gitar, bridge energetic, anthem crowd-singalong',
  jazz: 'Improvisation, cocktail music, sophisticated background',
  blues: 'Solo gitar, jam session, emotional ballad',
  country: 'Storytelling verses, simple singalong, acoustic set',
  rnb: 'Slow jam, romantic ballad, neo-soul groove',
  edm: 'Drop section, build-up, festival anthem',
  classical: 'Composition exercises, orchestral arrangement, film score',
};

export function suggestUsage(genreKey: string): string {
  return USAGE_SUGGESTIONS[genreKey] || 'berbagai keperluan musik';
}

/** Penjelasan singkat untuk masing-masing fungsi harmoni, dipakai di Builder. */
export const CHORD_FUNCTION_EXPLANATIONS: Record<string, string> = {
  tonic: 'Tonic adalah "rumah" dari progression. Perpindahan ke Dominant (V) atau Subdominant (IV) akan terdengar natural.',
  dominant: 'Dominant memiliki "tarikan gravitasi" kuat ke Tonic (I). Ini adalah resolusi yang paling memuaskan.',
  subdominant: 'Subdominant bisa bergerak ke Dominant untuk membangun tensi, atau langsung ke Tonic.',
  minor: 'Chord minor menambah nuansa emosional. Biasanya bergerak ke chord lain dalam fungsi yang sama atau ke Dominant.',
  seventh: 'Seventh chord menambah warna. Biasanya sebagai "jembatan" menuju resolusi.',
};
