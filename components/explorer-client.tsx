'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Panel } from '@/components/panel';
import { GenreSidebar } from '@/components/ui/GenreSidebar';
import { KeySelect } from '@/components/key-select';
import { ChordGraphCanvas } from '@/components/chord-graph-canvas';
import { useAudioEngine } from '@/hooks/use-audio-engine';
import { GENRE_CHORD_GRAPHS, CHORD_FUNCTION_COLORS, type GenreKey, type ChordFunction } from '@/lib/chord-data';
import { translateProgressionToKey } from '@/lib/music-theory';
import { Map, BarChart3, Lightbulb } from 'lucide-react';

const LEGEND: { key: ChordFunction; label: string }[] = [
  { key: 'tonic', label: 'Tonic (rumah)' },
  { key: 'subdominant', label: 'Subdominant' },
  { key: 'dominant', label: 'Dominant (tarikan kuat)' },
  { key: 'minor', label: 'Minor' },
  { key: 'seventh', label: 'Seventh' },
];

export function ExplorerClient() {
  const searchParams = useSearchParams();
  const [genre, setGenre] = useState<GenreKey>(() => {
    const fromQuery = searchParams.get('genre');
    return fromQuery && fromQuery in GENRE_CHORD_GRAPHS ? (fromQuery as GenreKey) : 'pop';
  });
  const [musicalKey, setMusicalKey] = useState('C');
  const [selected, setSelected] = useState<{ numeral: string; chordName: string } | null>(null);

  const { playChord } = useAudioEngine();

  const genreData = GENRE_CHORD_GRAPHS[genre];

  function handleNodeClick(numeral: string) {
    const chordName = translateProgressionToKey([numeral], musicalKey)[0];
    setSelected({ numeral, chordName });
    playChord(chordName);
  }

  return (
    <div className="w-full pb-24">
      <PageHeader
        eyebrow="node = chord · edge = transisi"
        title="Chord Explorer"
        description="Visualisasi graf akor tiap genre. Klik sebuah node untuk mendengar & melihat detail chord tersebut."
        icon={Map}
      />

      <div className="flex gap-8">
        {/* Genre Sidebar - Left Side */}
        <aside className="sticky top-24 w-44 shrink-0">
          <GenreSidebar value={genre} onChange={setGenre} />
        </aside>

        {/* Main Content - Right Side */}
        <div className="flex-1 space-y-6">
          <Panel title={genreData.name} icon={BarChart3}>
            <p className="text-sm text-ink-300">{genreData.description}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {genreData.characteristics.map((c) => (
                <li key={c} className="rounded-full border border-surface-line bg-ink-soft px-3 py-1 text-xs text-ink-300">
                  {c}
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Graf Chord" icon={Map}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
              <div className="w-40">
                <KeySelect value={musicalKey} onChange={setMusicalKey} id="explorerKeySelect" label="Kunci Tampilan" />
              </div>
              <div className="flex flex-wrap gap-3">
                {LEGEND.map((item) => (
                  <div key={item.key} className="flex items-center gap-1.5 text-xs text-ink-300">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: CHORD_FUNCTION_COLORS[item.key] }}
                      aria-hidden="true"
                    />
                    {item.label}
                  </div>
                ))}
              </div>
            </div>

            <ChordGraphCanvas
              graph={genreData.graph}
              translateFunc={(numeral) => translateProgressionToKey([numeral], musicalKey)[0]}
              onNodeClick={handleNodeClick}
            />

            {selected ? (
              <div className="mt-4 rounded-xl border border-violet-soft/40 bg-violet/5 p-4 text-sm text-ink-200">
                <p className="font-display font-semibold text-ink-100">
                  {selected.chordName} <span className="text-ink-500">({selected.numeral})</span>
                </p>
                <p className="mt-1 text-ink-300">
                  Fungsi: {genreData.graph[selected.numeral]?.function ?? 'default'} · Tujuan umum:{' '}
                  {genreData.graph[selected.numeral]?.targets
                    .map((t) => translateProgressionToKey([t], musicalKey)[0])
                    .join(', ') || '—'}
                </p>
              </div>
            ) : (
              <p className="mt-4 flex items-center gap-2 text-sm text-ink-500">
                <Lightbulb size={14} className="shrink-0 text-amber" aria-hidden="true" />
                Klik salah satu node di graf untuk melihat detailnya.
              </p>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
