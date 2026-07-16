/**
 * ============================================
 * PROGRESSION GENERATOR
 *
 * Dikonversi dari generateRandomWalk / generateWeightedWalk /
 * generateClassicPattern / weightedRandomChoice di js/app.js.
 * Semua fungsi bekerja pada level roman numeral (belum ditranslasi ke kunci).
 * ============================================
 */

import type { ChordGraph, GenreData } from './chord-data';

export type GeneratorMode = 'random' | 'weighted' | 'classic';

/** Random walk sederhana: pilih target acak dari daftar `targets` tiap node. */
export function generateRandomWalk(graph: ChordGraph, steps: number): string[] {
  const startNode = Object.keys(graph)[0];
  let current = startNode;
  const progression = [current];

  for (let i = 0; i < steps - 1; i++) {
    const targets = graph[current].targets;
    if (targets.length === 0) {
      current = startNode;
    } else {
      current = targets[Math.floor(Math.random() * targets.length)];
    }
    progression.push(current);
  }

  return progression;
}

/** Pilih 1 item secara acak dengan bobot proporsional. */
export function weightedRandomChoice(items: string[], weights: number[]): string {
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return items[i];
    }
  }

  return items[items.length - 1];
}

/** Walk pada graf yang mengikuti bobot probabilitas Circle-of-Fifths tiap edge. */
export function generateWeightedWalk(graph: ChordGraph, steps: number): string[] {
  const startNode = Object.keys(graph)[0];
  let current = startNode;
  const progression = [current];

  for (let i = 0; i < steps - 1; i++) {
    const targets = graph[current].targets;
    const weights = graph[current].weights ?? targets.map(() => 100 / targets.length);

    if (targets.length === 0) {
      current = startNode;
    } else {
      current = weightedRandomChoice(targets, weights);
    }
    progression.push(current);
  }

  return progression;
}

/** Ambil salah satu pola progression klasik genre lalu ulangi hingga sepanjang `targetLength`. */
export function generateClassicPattern(genreData: GenreData, targetLength: number): string[] {
  const patterns = genreData.classicProgressions;
  const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];

  const progression: string[] = [];
  while (progression.length < targetLength) {
    progression.push(...selectedPattern);
  }

  return progression.slice(0, targetLength);
}

/** Entry point: generate progression (dalam roman numeral) sesuai mode yang dipilih. */
export function generateProgression(
  genreData: GenreData,
  mode: GeneratorMode,
  barCount: number
): string[] {
  switch (mode) {
    case 'random':
      return generateRandomWalk(genreData.graph, barCount);
    case 'weighted':
      return generateWeightedWalk(genreData.graph, barCount);
    case 'classic':
      return generateClassicPattern(genreData, barCount);
    default:
      return [];
  }
}
