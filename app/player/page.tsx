'use client';

import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Panel } from '@/components/panel';
import { KeySelect } from '@/components/key-select';
import { ProgressionChain } from '@/components/progression-chain';
import { useAudioEngine } from '@/hooks/use-audio-engine';
import { getDiatonicChords } from '@/lib/chord-data';
import { getChordTypeName } from '@/lib/music-theory';
import SpecularButton from '@/components/ui/SpecularButton';
import { Keyboard, Music2, Play, Volume2, Square, Pencil, Settings } from 'lucide-react';

export default function PlayerPage() {
  const [musicalKey, setMusicalKey] = useState('C');
  const [currentChord, setCurrentChord] = useState('C');
  const [sequence, setSequence] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [customChords, setCustomChords] = useState<string[]>([]);
  const [volume, setVolume] = useState(70);
  const [tempo, setTempo] = useState(120);

  const { playChord, playProgression, stopAll, isPlaying, playingIndex, setVolume: setEngineVolume } = useAudioEngine();

  const diatonicChords = useMemo(() => Object.values(getDiatonicChords(musicalKey)), [musicalKey]);
  const { root, type } = useMemo(() => {
    if (currentChord.length >= 2 && (currentChord[1] === '#' || currentChord[1] === 'b')) {
      return { root: currentChord.slice(0, 2), type: currentChord.slice(2) };
    }
    return { root: currentChord[0], type: currentChord.slice(1) };
  }, [currentChord]);

  function handleChordClick(chord: string) {
    playChord(chord);
    setCurrentChord(chord);
    setSequence((prev) => [...prev, chord]);
  }

  function handleVolumeChange(value: number) {
    setVolume(value);
    setEngineVolume(value / 100);
  }

  function parseAndPlay() {
    const chords = customInput
      .split(/[,\s]+/)
      .map((c) => c.trim())
      .filter(Boolean);
    if (chords.length === 0) return;
    setCustomChords(chords);
    playProgression(chords, tempo);
  }

  return (
    <div className="w-full pb-24">
      <PageHeader
        eyebrow="beta · bonus page"
        title="Chord Player"
        description="Mainkan dan dengarkan chord secara interaktif — klik untuk membangun urutan, lalu putar kembali."
        icon={Keyboard}
      />

      <div className="flex flex-col gap-6">
        <Panel title="Pilih Kunci Dasar" icon={Music2}>
          <div className="w-48">
            <KeySelect value={musicalKey} onChange={setMusicalKey} id="playerKeySelect" label="" />
          </div>
        </Panel>

        <Panel title="Chord Player Interaktif" icon={Play}>
          <p className="mb-5 text-sm text-ink-300">Klik pada tombol chord untuk mendengar suaranya.</p>

          <div className="mb-6 flex flex-col items-center justify-center rounded-2xl border border-surface-line bg-ink-soft py-8">
            <span className="font-display text-5xl font-bold text-ink-100">{root}</span>
            <span className="mt-1 text-sm text-ink-500">{getChordTypeName(type)}</span>
          </div>

          <div className="flex flex-wrap justify-center gap-2.5">
            {diatonicChords.map((chord) => (
              <button
                key={chord}
                type="button"
                onClick={() => handleChordClick(chord)}
                className={`font-display min-w-[4rem] rounded-xl border px-4 py-3 text-base font-semibold transition-all ${
                  currentChord === chord
                    ? 'border-violet-soft bg-violet/15 text-violet-soft'
                    : 'border-surface-line bg-surface text-ink-100 hover:border-violet-soft/50'
                }`}
              >
                {chord}
              </button>
            ))}
          </div>

          {sequence.length > 0 && (
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Urutan yang kamu mainkan</p>
                <button type="button" onClick={() => setSequence([])} className="text-xs text-ink-500 hover:text-ink-300">
                  Bersihkan
                </button>
              </div>
              <ProgressionChain chords={sequence} playingIndex={isPlaying && customChords.length === 0 ? playingIndex : -1} size="sm" />
            </div>
          )}

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <SpecularButton
              size="md"
              radius={9999}
              textColor="#22d3ee"
              tint="#22d3ee"
              tintOpacity={0.15}
              lineColor="#22d3ee"
              baseColor="#2a2440"
              intensity={1.2}
              shineSize={8}
              shineFade={35}
              thickness={1}
              speed={0.5}
              followMouse
              proximity={150}
              autoAnimate={false}
              disabled={sequence.length === 0}
              onClick={() => {
                setCustomChords([]);
                playProgression(sequence, tempo);
              }}
            >
              <span className="inline-flex items-center gap-2">
                {isPlaying ? (
                  <>
                    <Volume2 size={16} className="shrink-0" aria-hidden="true" />
                    Playing...
                  </>
                ) : (
                  <>
                    <Play size={16} className="shrink-0" aria-hidden="true" />
                    Play Progression
                  </>
                )}
              </span>
            </SpecularButton>
            <SpecularButton
              size="md"
              radius={9999}
              textColor="#c7c1e0"
              tint="#0a0912"
              tintOpacity={0.5}
              lineColor="#a78bfa"
              baseColor="#2a2440"
              intensity={0.8}
              shineSize={8}
              shineFade={35}
              thickness={1}
              speed={0.5}
              followMouse
              proximity={150}
              autoAnimate={false}
              disabled={!isPlaying}
              onClick={stopAll}
            >
              <span className="inline-flex items-center gap-2">
                <Square size={16} className="shrink-0" aria-hidden="true" />
                Stop
              </span>
            </SpecularButton>
          </div>
        </Panel>

        <Panel title="Input Custom Progression" icon={Pencil}>
          <label htmlFor="customProgressionInput" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-500">
            Masukkan chord progression (pisahkan dengan koma atau spasi)
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="customProgressionInput"
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="C, G, Am, F"
              className="flex-1 rounded-xl border border-surface-line bg-surface px-4 py-2.5 text-sm text-ink-100 outline-none focus:border-violet-soft"
            />
            <SpecularButton
              size="md"
              radius={12}
              textColor="#ffffff"
              lineColor="#ffffff"
              baseColor="#7c5cfc"
              intensity={1.25}
              shineSize={10}
              shineFade={40}
              thickness={1}
              speed={1.7}
              followMouse
              proximity={250}
              autoAnimate={false}
              onClick={parseAndPlay}
            >
              <span className="inline-flex items-center gap-2">
                <Play size={14} className="shrink-0" aria-hidden="true" />
                Parse &amp; Play
              </span>
            </SpecularButton>
          </div>
          {customChords.length > 0 && (
            <div className="mt-4">
              <ProgressionChain chords={customChords} playingIndex={isPlaying ? playingIndex : -1} />
            </div>
          )}
        </Panel>

        <Panel title="Kontrol Audio" icon={Settings}>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="volumeSlider" className="mb-1.5 flex justify-between text-xs font-medium uppercase tracking-wide text-ink-500">
                <span>Volume</span>
                <span className="text-ink-300">{volume}%</span>
              </label>
              <input
                id="volumeSlider"
                type="range"
                min={0}
                max={100}
                value={volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-full accent-violet"
              />
            </div>
            <div>
              <label htmlFor="tempoSlider" className="mb-1.5 flex justify-between text-xs font-medium uppercase tracking-wide text-ink-500">
                <span>Tempo (BPM)</span>
                <span className="text-ink-300">{tempo}</span>
              </label>
              <input
                id="tempoSlider"
                type="range"
                min={40}
                max={200}
                value={tempo}
                onChange={(e) => setTempo(Number(e.target.value))}
                className="w-full accent-cyan"
              />
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
