/**
 * ============================================
 * BUILDER LOGIC
 *
 * Dikonversi dari method renderInitialChordOptions / renderSuggestedChords
 * di class InteractiveChordBuilder (js/app.js). Diekstrak jadi fungsi murni
 * agar mudah dites dan dipakai dari komponen React Builder.
 * ============================================
 */

import type { GenreData } from './chord-data';

export interface ChordOption {
  numeral: string;
  recommended: boolean;
  highlyRecommended: boolean;
  weight?: number;
}

const INITIAL_SORT_ORDER: Record<string, number> = {
  I: 1, Imaj7: 1,
  i: 2,
  vi: 3, vi7: 3,
  IV: 4, IV7: 4,
  ii: 5, ii7: 5,
  V: 6, V7: 6,
  iii: 7, iii7: 7,
};

const INITIAL_RECOMMENDED = new Set(['I', 'Imaj7', 'i', 'vi', 'vi7']);
const INITIAL_HIGHLY_RECOMMENDED = new Set(['I', 'Imaj7', 'i']);

/** Opsi chord pertama (belum ada chord terpilih), diurutkan dari yang paling umum sebagai starting point. */
export function getInitialChordOptions(genreData: GenreData): ChordOption[] {
  const numerals = Object.keys(genreData.graph);

  return [...numerals]
    .sort((a, b) => (INITIAL_SORT_ORDER[a] ?? 10) - (INITIAL_SORT_ORDER[b] ?? 10))
    .map((numeral) => ({
      numeral,
      recommended: INITIAL_RECOMMENDED.has(numeral),
      highlyRecommended: INITIAL_HIGHLY_RECOMMENDED.has(numeral),
    }));
}

export interface SuggestedChords {
  primary: ChordOption[];
  other: ChordOption[];
  chordFunction: string;
  hasWeights: boolean;
}

/** Saran chord berikutnya berdasarkan numeral chord terakhir yang dipilih. */
export function getSuggestedChords(genreData: GenreData, lastNumeral: string): SuggestedChords | null {
  const nodeData = genreData.graph[lastNumeral];
  if (!nodeData) return null;

  const { targets, weights, function: chordFunction } = nodeData;

  const primary: ChordOption[] = targets.map((targetNumeral, index) => {
    const weight = weights ? weights[index] : Math.round(100 / targets.length);
    return {
      numeral: targetNumeral,
      weight,
      recommended: weight >= 20,
      highlyRecommended: weight >= 35,
    };
  });

  const other: ChordOption[] = Object.keys(genreData.graph)
    .filter((n) => !targets.includes(n))
    .map((numeral) => ({ numeral, recommended: false, highlyRecommended: false }));

  return { primary, other, chordFunction, hasWeights: Boolean(weights) };
}
