'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AudioEngine } from '@/lib/audio-engine';

/**
 * Hook React yang membungkus class AudioEngine (Web Audio API) supaya
 * mudah dipakai dari Client Component mana pun tanpa mengulang boilerplate
 * play/stop/highlight-index.
 */
export function useAudioEngine() {
  const engineRef = useRef<AudioEngine | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingIndex, setPlayingIndex] = useState(-1);
  const [currentChord, setCurrentChord] = useState<string | null>(null);

  const getEngine = useCallback(() => {
    if (!engineRef.current) {
      engineRef.current = new AudioEngine();
    }
    return engineRef.current;
  }, []);

  const playChord = useCallback(
    (chord: string, duration?: number) => {
      getEngine().playChord(chord, duration);
      setCurrentChord(chord);
    },
    [getEngine]
  );

  const playProgression = useCallback(
    async (chords: string[], bpm = 90) => {
      if (chords.length === 0) return;
      setIsPlaying(true);
      await getEngine().playProgression(chords, bpm, (chord, index) => {
        setPlayingIndex(index);
        if (chord) setCurrentChord(chord);
      });
      setIsPlaying(false);
      setPlayingIndex(-1);
    },
    [getEngine]
  );

  const stopAll = useCallback(() => {
    getEngine().stopAll();
    setIsPlaying(false);
    setPlayingIndex(-1);
  }, [getEngine]);

  const setVolume = useCallback(
    (value: number) => {
      getEngine().setVolume(value);
    },
    [getEngine]
  );

  const parseChord = useCallback((chord: string) => getEngine().parseChord(chord), [getEngine]);

  // Stop semua oscillator saat komponen unmount (mis. pindah halaman)
  useEffect(() => {
    return () => {
      engineRef.current?.stopAll();
    };
  }, []);

  return {
    playChord,
    playProgression,
    stopAll,
    setVolume,
    parseChord,
    isPlaying,
    playingIndex,
    currentChord,
  };
}
