'use client';

import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Panel } from '@/components/panel';
import { GenreSidebar } from '@/components/ui/GenreSidebar';
import { KeySelect } from '@/components/key-select';
import { ProgressionChain } from '@/components/progression-chain';
import { useAudioEngine } from '@/hooks/use-audio-engine';
import { GENRE_CHORD_GRAPHS, type GenreKey } from '@/lib/chord-data';
import { translateProgressionToKey, suggestUsage } from '@/lib/music-theory';
import { generateProgression, type GeneratorMode } from '@/lib/progression-generator';
import { TRANSFER_STORAGE_KEY } from '@/lib/constants';
import SpecularButton from '@/components/ui/SpecularButton';
import {
  Dices,
  Scale,
  Music2,
  Settings,
  Sparkles,
  Upload,
  BarChart3,
  Volume2,
  Play,
  Square,
  Copy,
  Check,
  BookOpen,
} from 'lucide-react';

const MODE_INFO: { value: GeneratorMode; label: string; title: string; description: string; Icon: typeof Dices }[] = [
  {
    value: 'random',
    label: 'Random Walk',
    Icon: Dices,
    title: 'Random Walk',
    description:
      'Memilih chord berikutnya secara acak dari semua chord yang valid berdasarkan graf. Cocok untuk eksplorasi dan menemukan kombinasi baru yang tidak terduga.',
  },
  {
    value: 'weighted',
    label: 'Weighted (Berbobot)',
    Icon: Scale,
    title: 'Weighted (Berbobot)',
    description:
      'Memilih chord berdasarkan probabilitas bobot pada graf. Chord yang lebih umum digunakan memiliki peluang lebih tinggi untuk dipilih — hasil lebih natural.',
  },
  {
    value: 'classic',
    label: 'Classic Pattern',
    Icon: Music2,
    title: 'Classic Pattern',
    description:
      'Menggunakan pola progression klasik yang sudah terbukti populer dalam genre tersebut. Cocok untuk struktur yang familiar.',
  },
];

export default function GeneratorPage() {
  const [genre, setGenre] = useState<GenreKey>('pop');
  const [musicalKey, setMusicalKey] = useState('C');
  const [barCount, setBarCount] = useState(8);
  const [mode, setMode] = useState<GeneratorMode>('random');
  const [numerals, setNumerals] = useState<string[]>([]);
  const [importedChords, setImportedChords] = useState<string[] | null>(() => {
    // Lazy init: read and consume the Builder transfer in one synchronous pass
    if (typeof window === 'undefined') return null;
    const stored = sessionStorage.getItem(TRANSFER_STORAGE_KEY);
    if (!stored) return null;
    sessionStorage.removeItem(TRANSFER_STORAGE_KEY);
    try {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
    } catch {
      return null;
    }
  });
  const [copied, setCopied] = useState(false);

  const { playProgression, playChord, stopAll, isPlaying, playingIndex } = useAudioEngine();

  const chords = useMemo(
    () => importedChords ?? translateProgressionToKey(numerals, musicalKey),
    [importedChords, numerals, musicalKey]
  );

  const analysis = useMemo(() => {
    if (numerals.length === 0 || importedChords) return null;
    const uniqueChords = new Set(chords);
    const tonicCount = numerals.filter((n) => n.includes('I') && !n.includes('V')).length;
    const dominantCount = numerals.filter((n) => n.includes('V')).length;
    return { uniqueChords: uniqueChords.size, tonicCount, dominantCount };
  }, [numerals, chords, importedChords]);

  function handleGenerate() {
    const genreData = GENRE_CHORD_GRAPHS[genre];
    const clamped = Math.min(32, Math.max(4, barCount));
    setBarCount(clamped);
    setImportedChords(null);
    setNumerals(generateProgression(genreData, mode, clamped));
    setCopied(false);
  }

  function handleCopy() {
    if (chords.length === 0) return;
    const text = chords.join(' - ');
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => alert(`Progression: ${text}`));
  }

  return (
    <div className="w-full pb-24">
      <PageHeader
        eyebrow="mode: random · weighted · classic"
        title="Chord Generator"
        description="Generate chord progression secara otomatis berdasarkan genre, kunci, dan mode."
        icon={Dices}
      />

      <div className="flex gap-8">
        {/* Genre Sidebar - Left Side */}
        <aside className="sticky top-24 w-44 shrink-0">
          <GenreSidebar value={genre} onChange={setGenre} />
        </aside>

        {/* Main Content - Right Side */}
        <div className="flex-1 space-y-6">
          <Panel title="Pengaturan Generator" icon={Settings}>
            <div className="grid gap-4 sm:grid-cols-3">
              <KeySelect value={musicalKey} onChange={setMusicalKey} id="keySelectGen" />

              <div className="flex flex-col gap-2">
                <label htmlFor="barCount" className="text-xs font-medium uppercase tracking-wide text-ink-500">
                  Jumlah Bar
                </label>
                <input
                  id="barCount"
                  type="number"
                  min={4}
                  max={32}
                  value={barCount}
                  onChange={(e) => setBarCount(Number(e.target.value))}
                  className="rounded-xl border border-surface-line bg-surface px-3 py-2.5 text-sm font-medium text-ink-100 outline-none focus:border-violet-soft"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="generatorMode" className="text-xs font-medium uppercase tracking-wide text-ink-500">
                  Mode
                </label>
                <select
                  id="generatorMode"
                  value={mode}
                  onChange={(e) => setMode(e.target.value as GeneratorMode)}
                  className="rounded-xl border border-surface-line bg-surface px-3 py-2.5 text-sm font-medium text-ink-100 outline-none focus:border-violet-soft"
                >
                  {MODE_INFO.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <SpecularButton
                size="lg"
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
                onClick={handleGenerate}
                className="w-full sm:w-auto"
              >
                <span className="inline-flex items-center gap-2">
                  <Dices size={18} className="shrink-0" aria-hidden="true" />
                  Generate Progression
                </span>
              </SpecularButton>
            </div>
          </Panel>

          <Panel title="Hasil Progression" icon={Sparkles}>
            {importedChords && (
              <p className="mb-2 flex items-center gap-2 rounded-lg border border-cyan/30 bg-cyan/5 px-3 py-2 text-xs text-cyan">
                <Upload size={12} className="shrink-0" aria-hidden="true" />
                Progression ini diimpor dari Builder.
              </p>
            )}
            {chords.length > 0 ? (
              <div className="rounded-xl border border-surface-line bg-ink-soft p-4">
                <ProgressionChain chords={chords} playingIndex={playingIndex} onChordClick={(c) => playChord(c)} />
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-surface-line p-4 text-sm text-ink-500">
                Klik tombol &ldquo;Generate Progression&rdquo; untuk membuat chord progression.
              </p>
            )}

            {analysis && (
              <div className="mt-4 rounded-xl border border-surface-line bg-ink-soft p-4 text-sm text-ink-300">
                <p className="font-display flex items-center gap-2 font-semibold text-ink-100">
                  <BarChart3 size={16} className="shrink-0 text-cyan" aria-hidden="true" />
                  Analisis Progression
                </p>
                <p className="mt-1.5">• Jumlah chord unik: {analysis.uniqueChords}</p>
                <p>• Kembali ke Tonic (I): {analysis.tonicCount} kali</p>
                <p>• Dominant (V) count: {analysis.dominantCount} kali</p>
                <p>• Cocok untuk: {suggestUsage(genre)}</p>
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-3">
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
                disabled={chords.length === 0}
                onClick={() => playProgression(chords, 90)}
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
                disabled={chords.length === 0}
                onClick={handleCopy}
              >
                <span className="inline-flex items-center gap-2">
                  {copied ? (
                    <>
                      <Check size={16} className="shrink-0 text-[#34d399]" aria-hidden="true" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={16} className="shrink-0" aria-hidden="true" />
                      Copy
                    </>
                  )}
                </span>
              </SpecularButton>
            </div>
          </Panel>

          <Panel title="Penjelasan Mode Generator" icon={BookOpen}>
            <div className="grid gap-4 sm:grid-cols-3">
              {MODE_INFO.map((m) => (
                <div key={m.value} className="rounded-xl border border-surface-line bg-ink-soft p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet/10">
                    <m.Icon size={20} className="text-violet-soft" aria-hidden="true" />
                  </div>
                  <h3 className="font-display mt-3 font-semibold text-ink-100">{m.title}</h3>
                  <p className="mt-1.5 text-sm text-ink-300">{m.description}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
