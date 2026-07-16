'use client';

import { POPULAR_PROGRESSIONS } from '@/lib/chord-data';
import { translateProgressionToKey } from '@/lib/music-theory';
import { useAudioEngine } from '@/hooks/use-audio-engine';
import SpecularButton from '@/components/ui/SpecularButton';
import { Play, Pause } from 'lucide-react';

const REFERENCE_KEY = 'C';

export function PopularProgressionCards() {
  const { playProgression, isPlaying } = useAudioEngine();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {POPULAR_PROGRESSIONS.map((prog) => {
        const chordsPreview = translateProgressionToKey(prog.numerals, REFERENCE_KEY).slice(0, 4);

        return (
          <div key={prog.name} className="flex flex-col rounded-2xl border border-surface-line bg-surface/60 p-5">
            <h4 className="font-display font-semibold text-ink-100">{prog.name}</h4>
            <p className="font-mono mt-2 text-sm text-violet-soft">{chordsPreview.join(' - ')}</p>
            <p className="mt-2 flex-1 text-sm text-ink-300">{prog.description}</p>
            <p className="mt-3 text-xs italic text-ink-500">{prog.songs.slice(0, 2).join(', ')}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="rounded-full border border-surface-line px-2.5 py-0.5 text-[0.65rem] uppercase tracking-wide text-ink-500">
                {prog.genre}
              </span>
              <SpecularButton
                size="sm"
                radius={9999}
                textColor="#22d3ee"
                tint="#22d3ee"
                tintOpacity={0.15}
                lineColor="#22d3ee"
                baseColor="#2a2440"
                intensity={1}
                shineSize={6}
                shineFade={30}
                thickness={0.8}
                speed={0.5}
                followMouse
                proximity={100}
                autoAnimate={false}
                onClick={() => playProgression(translateProgressionToKey(prog.numerals, REFERENCE_KEY).slice(0, 8), 90)}
              >
                <span className="inline-flex items-center gap-1">
                  {isPlaying ? (
                    <>
                      <Pause size={12} className="shrink-0" aria-hidden="true" />
                      ...
                    </>
                  ) : (
                    <>
                      <Play size={12} className="shrink-0" aria-hidden="true" />
                      Play
                    </>
                  )}
                </span>
              </SpecularButton>
            </div>
          </div>
        );
      })}
    </div>
  );
}
