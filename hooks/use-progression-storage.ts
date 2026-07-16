'use client';

import { useCallback, useEffect, useState } from 'react';
import type { GenreKey } from '@/lib/chord-data';

const STORAGE_KEY = 'chordmap:progressions';
const DRAFT_ID = '__draft__';

/** Single saved or draft progression. */
export interface SavedProgression {
  id: string;
  name: string;
  genre: GenreKey;
  targetCount: number;
  builtNumerals: string[];
  savedAt: number;
}

/** All saved progressions stored under STORAGE_KEY. */
interface StorageData {
  progressions: SavedProgression[];
}

function loadAll(): StorageData {
  if (typeof window === 'undefined') return { progressions: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StorageData) : { progressions: [] };
  } catch {
    return { progressions: [] };
  }
}

function persist(data: StorageData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage full or unavailable — fail silently
  }
}

/** Nanoid-lite for local use */
function shortId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/**
 * useProgressionStorage
 *
 * Manages Builder progression persistence in localStorage:
 * - Auto-saves a draft on every state change (debounced 1s)
 * - Named saves / loads / deletes via explicit user action
 * - Draft restores automatically on next Builder visit
 */
export function useProgressionStorage() {
  // Lazy initial read — runs once at mount, no extra render
  const [progressions, setProgressions] = useState<SavedProgression[]>(() => {
    const data = loadAll();
    return data.progressions.filter((p) => p.id !== DRAFT_ID);
  });
  const [draft, setDraft] = useState<SavedProgression | null>(() => {
    const data = loadAll();
    return data.progressions.find((p) => p.id === DRAFT_ID) ?? null;
  });
  const [isDirty, setIsDirty] = useState(false); // unsaved changes exist

  // Persist named progressions whenever they change (no draft)
  useEffect(() => {
    const current = loadAll();
    const withoutDraft = current.progressions.filter((p) => p.id !== DRAFT_ID);
    persist({ progressions: [...withoutDraft, ...progressions] });
  }, [progressions]);

  // Auto-save draft with debounce
  useEffect(() => {
    if (!isDirty) return;
    const timer = setTimeout(() => {
      if (draft) {
        const data = loadAll();
        const withoutDraft = data.progressions.filter((p) => p.id !== DRAFT_ID);
        persist({ progressions: [draft, ...withoutDraft] });
        setIsDirty(false);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [draft, isDirty]);

  /** Called by Builder whenever targetCount, genre, or builtNumerals changes. */
  const updateDraft = useCallback(
    (targetCount: number, genre: GenreKey, builtNumerals: string[]) => {
      const next: SavedProgression = {
        id: DRAFT_ID,
        name: 'Draft',
        genre,
        targetCount,
        builtNumerals,
        savedAt: Date.now(),
      };
      setDraft(next);
      setIsDirty(true);
    },
    []
  );

  /** Save current state as a named slot. */
  const save = useCallback(
    (name: string, targetCount: number, genre: GenreKey, builtNumerals: string[]): boolean => {
      if (!name.trim()) return false;
      const entry: SavedProgression = {
        id: shortId(),
        name: name.trim(),
        genre,
        targetCount,
        builtNumerals,
        savedAt: Date.now(),
      };
      setProgressions((prev) => {
        // Remove any stale auto-draft with this name
        return [entry, ...prev.filter((p) => p.name !== name.trim())];
      });
      // Clear draft since this replaces it
      setDraft(null);
      setIsDirty(false);
      return true;
    },
    []
  );

  /** Remove a named progression slot. */
  const remove = useCallback((id: string) => {
    setProgressions((prev) => prev.filter((p) => p.id !== id));
  }, []);

  /** Load a saved progression — returns it for the caller to apply to state. */
  const load = useCallback((id: string): SavedProgression | null => {
    const all = loadAll().progressions;
    return all.find((p) => p.id === id) ?? null;
  }, []);

  /** Clear the auto-saved draft (e.g., after a Reset). */
  const clearDraft = useCallback(() => {
    setDraft(null);
    setIsDirty(false);
    const data = loadAll();
    persist({ progressions: data.progressions.filter((p) => p.id !== DRAFT_ID) });
  }, []);

  return {
    progressions,  // named saves only (no draft)
    draft,         // auto-saved draft, or null
    hasDraft: draft != null && draft.builtNumerals.length > 0,
    updateDraft,
    save,
    remove,
    load,
    clearDraft,
  };
}
