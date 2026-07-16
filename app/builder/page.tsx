'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Panel } from '@/components/panel';
import { GenreSidebar } from '@/components/ui/GenreSidebar';
import { useAudioEngine } from '@/hooks/use-audio-engine';
import { useProgressionStorage } from '@/hooks/use-progression-storage';
import { GENRE_CHORD_GRAPHS, type GenreKey, type GenreData } from '@/lib/chord-data';
import { translateProgressionToKey, CHORD_FUNCTION_EXPLANATIONS } from '@/lib/music-theory';
import { getInitialChordOptions, getSuggestedChords, type ChordOption } from '@/lib/builder-logic';
import { TRANSFER_STORAGE_KEY } from '@/lib/constants';
import { ProgressionSaveDialog } from '@/components/progression-save-dialog';
import SpecularButton from '@/components/ui/SpecularButton';
import {
  Hammer,
  RotateCcw,
  Undo2,
  Play,
  Volume2,
  Copy,
  Check,
  Send,
  Lightbulb,
  Star,
  Target,
  CheckCircle2,
  PartyPopper,
  AlertTriangle,
  Music2,
  TrendingUp,
  Save,
  FolderOpen,
} from 'lucide-react';

const COUNT_OPTIONS = [4, 6, 8, 12, 16];
const BUILDER_KEY = 'C';

export default function BuilderPage() {
  const router = useRouter();
  const { playProgression, playChord, isPlaying, playingIndex } = useAudioEngine();
  const { progressions, draft, updateDraft, save, remove, load: loadProgression, clearDraft, hasDraft } =
    useProgressionStorage();
  const [dialogOpen, setDialogOpen] = useState(false);

  // Seed initial state from the draft lazily — no setState in useEffect needed
  const [targetCount, setTargetCount] = useState(draft?.targetCount ?? 8);
  const [customCount, setCustomCount] = useState('');
  const [genre, setGenre] = useState<GenreKey>(draft?.genre ?? 'pop');
  const [builtNumerals, setBuiltNumerals] = useState<string[]>(draft?.builtNumerals ?? []);
  const [copied, setCopied] = useState(false);
  const [transferred, setTransferred] = useState(false);

  const genreData = GENRE_CHORD_GRAPHS[genre];
  const builtChords = useMemo(() => translateProgressionToKey(builtNumerals, BUILDER_KEY), [builtNumerals]);
  const isComplete = builtNumerals.length >= targetCount;
  const currentIndex = builtNumerals.length;

  // Auto-save draft whenever state changes
  useEffect(() => {
    updateDraft(targetCount, genre, builtNumerals);
  }, [targetCount, genre, builtNumerals, updateDraft]);

  // Keyboard shortcut: Escape = undo last chord
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && builtNumerals.length > 0 && !isComplete) {
        undoLast();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [builtNumerals.length, isComplete]);

  function resetBuilder() {
    setBuiltNumerals([]);
    setCopied(false);
    setTransferred(false);
    clearDraft();
  }

  function handleCountSelect(count: number) {
    setTargetCount(count);
    setCustomCount('');
    setBuiltNumerals([]);
    setCopied(false);
    setTransferred(false);
    clearDraft();
  }

  function handleCustomCount(value: string) {
    setCustomCount(value);
    const parsed = parseInt(value, 10);
    if (parsed >= 2 && parsed <= 32) {
      setTargetCount(parsed);
      setBuiltNumerals([]);
      setCopied(false);
      setTransferred(false);
      clearDraft();
    }
  }

  function selectChord(numeral: string, chordName: string) {
    if (isComplete) return;
    setBuiltNumerals((prev) => [...prev, numeral]);
    playChord(chordName);
    setTransferred(false);
  }

  function undoLast() {
    setBuiltNumerals((prev) => prev.slice(0, -1));
    setTransferred(false);
  }

  function handleCopy() {
    const numeralText = builtNumerals.join(' - ');
    const chordText = builtChords.join(' - ');
    const fullText = `Chord Progression: ${chordText}\nNumerals: ${numeralText}`;
    navigator.clipboard
      .writeText(fullText)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        // Inline error — clipboard unavailable
      });
  }

  function handleSave(name: string) {
    save(name, targetCount, genre, builtNumerals);
  }

  function handleLoad(id: string) {
    const loaded = loadProgression(id);
    if (loaded) {
      setTargetCount(loaded.targetCount);
      setGenre(loaded.genre);
      setBuiltNumerals(loaded.builtNumerals);
      setCopied(false);
      setTransferred(false);
    }
  }

  function useInGenerator() {
    sessionStorage.setItem(TRANSFER_STORAGE_KEY, JSON.stringify(builtChords));
    setTransferred(true);
    router.push('/generator');
  }

  return (
    <div className="w-full pb-24">
      <PageHeader
        eyebrow="pilih → dapat saran → ulangi"
        title="Interactive Chord Builder"
        description="Tentukan jumlah chord, pilih chord dasar, lalu sistem akan menyarankan chord berikutnya yang harmonis."
        icon={Hammer}
      />

      <div className="flex gap-8">
        {/* Genre Sidebar - Left Side */}
        <aside className="sticky top-24 w-44 shrink-0">
          <GenreSidebar value={genre} onChange={setGenre} />
        </aside>

        {/* Main Content - Right Side */}
        <div className="flex-1 space-y-6">
          <Panel title="Pengaturan Awal" icon={Lightbulb}>
            <div className="flex flex-col gap-4">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-500">
                  Jumlah Chord yang Diinginkan
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {COUNT_OPTIONS.map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => handleCountSelect(count)}
                      className={`h-10 w-10 rounded-full text-sm font-semibold transition-all ${
                        targetCount === count && !customCount
                          ? 'bg-gradient-to-r from-violet to-violet-dim text-white shadow-[0_0_16px_rgba(124,92,252,0.4)]'
                          : 'border border-surface-line bg-surface text-ink-300 hover:text-ink-100'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                  <input
                    type="number"
                    min={2}
                    max={32}
                    placeholder="Custom"
                    value={customCount}
                    onChange={(e) => handleCustomCount(e.target.value)}
                    className="h-10 w-24 rounded-full border border-surface-line bg-surface px-4 text-sm text-ink-100 outline-none focus:border-violet-soft"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
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
                  onClick={resetBuilder}
                >
                  <span className="inline-flex items-center gap-2">
                    <RotateCcw size={14} className="shrink-0" aria-hidden="true" />
                    Reset
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
                  onClick={() => setDialogOpen(true)}
                >
                  <span className="inline-flex items-center gap-2">
                    <FolderOpen size={14} className="shrink-0" aria-hidden="true" />
                    {hasDraft ? 'Lanjutkan Draft' : 'Muat'}
                  </span>
                </SpecularButton>

                <SpecularButton
                  size="md"
                  radius={9999}
                  textColor="#ffffff"
                  tint="#7c5cfc"
                  tintOpacity={0.1}
                  lineColor="#7c5cfc"
                  baseColor="#2a2440"
                  intensity={1.0}
                  shineSize={8}
                  shineFade={35}
                  thickness={1}
                  speed={0.5}
                  followMouse
                  proximity={150}
                  autoAnimate={false}
                  disabled={builtChords.length === 0}
                  onClick={() => setDialogOpen(true)}
                >
                  <span className="inline-flex items-center gap-2">
                    <Save size={14} className="shrink-0" aria-hidden="true" />
                    Simpan
                  </span>
                </SpecularButton>
              </div>
            </div>
          </Panel>

        <Panel title="Chord Builder" icon={Music2}>
          {/* Progress */}
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between text-sm text-ink-300">
              <span>
                Chord: {currentIndex} / {targetCount}
              </span>
              {hasDraft && (
                <span className="flex items-center gap-1.5 text-xs text-amber">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber" aria-hidden="true" />
                  Tersimpan otomatis
                </span>
              )}
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet to-cyan transition-all"
                style={{ width: `${(currentIndex / targetCount) * 100}%` }}
              />
            </div>
          </div>

          {/* Slots */}
          <div className="mb-6 flex flex-wrap gap-3" role="group" aria-label="Chord progression slots">
            {Array.from({ length: targetCount }).map((_, i) => {
              const filled = i < builtChords.length;
              const isCurrent = i === builtChords.length;
              return (
                <button
                  key={i}
                  type="button"
                  tabIndex={filled ? 0 : -1}
                  role="button"
                  aria-label={filled ? `Chord ${i + 1}: ${builtChords[i]}, tekan untuk memutar` : `Slot ${i + 1}: kosong`}
                  aria-pressed={filled}
                  disabled={!filled}
                  onClick={() => filled && playChord(builtChords[i])}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && filled) {
                      e.preventDefault();
                      playChord(builtChords[i]);
                    }
                  }}
                  className={`flex h-14 w-16 items-center justify-center rounded-xl border font-display text-sm font-semibold transition-all ${
                    playingIndex === i
                      ? 'border-cyan bg-cyan/15 text-cyan shadow-[0_0_16px_rgba(34,211,238,0.4)]'
                      : filled
                        ? 'border-violet-soft/50 bg-surface-hi text-ink-100'
                        : isCurrent
                          ? 'border-dashed border-violet-soft text-ink-500'
                          : 'border-dashed border-surface-line text-ink-500'
                  }`}
                >
                  {filled ? builtChords[i] : i + 1}
                </button>
              );
            })}
          </div>

          {/* Suggestions */}
          <BuilderSuggestions
            genreData={genreData}
            builtNumerals={builtNumerals}
            builtChords={builtChords}
            isComplete={isComplete}
            onSelect={selectChord}
            onPreview={(chordName) => playChord(chordName, 0.3)}
          />
        </Panel>

        {/* Actions */}
        <Panel title="Aksi" icon={Play}>
          <div className="flex flex-wrap gap-3">
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
              disabled={builtChords.length === 0}
              onClick={undoLast}
            >
              <span className="inline-flex items-center gap-2">
                <Undo2 size={14} className="shrink-0" aria-hidden="true" />
                Undo
              </span>
            </SpecularButton>
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
              disabled={builtChords.length === 0}
              onClick={() => playProgression(builtChords, 90)}
            >
              <span className="inline-flex items-center gap-2">
                {isPlaying ? (
                  <>
                    <Volume2 size={14} className="shrink-0" aria-hidden="true" />
                    Playing...
                  </>
                ) : (
                  <>
                    <Play size={14} className="shrink-0" aria-hidden="true" />
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
              disabled={builtChords.length === 0}
              onClick={handleCopy}
            >
              <span className="inline-flex items-center gap-2">
                {copied ? (
                  <>
                    <Check size={14} className="shrink-0 text-[#34d399]" aria-hidden="true" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={14} className="shrink-0" aria-hidden="true" />
                    Copy
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
              disabled={builtChords.length === 0}
              onClick={useInGenerator}
            >
              <span className="inline-flex items-center gap-2">
                {transferred ? (
                  <>
                    <Check size={14} className="shrink-0 text-[#34d399]" aria-hidden="true" />
                    Transferred!
                  </>
                ) : (
                  <>
                    <Send size={14} className="shrink-0" aria-hidden="true" />
                    Gunakan di Generator
                  </>
                )}
              </span>
            </SpecularButton>
          </div>
        </Panel>
        </div>
      </div>

      <ProgressionSaveDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        progressions={progressions}
        draft={draft}
        onSave={handleSave}
        onLoad={handleLoad}
        onDelete={remove}
        currentChords={builtChords}
        currentGenre={genre}
        currentCount={targetCount}
      />
    </div>
  );
}

function ChordOptionButton({
  option,
  chordName,
  muted,
  onSelect,
  onPreview,
}: {
  option: ChordOption;
  chordName: string;
  muted?: boolean;
  onSelect: () => void;
  onPreview: () => void;
}) {
  return (
    <button
      type="button"
      tabIndex={0}
      role="button"
      aria-label={`${chordName}${option.highlyRecommended ? ', sangat direkomendasikan' : option.recommended ? ', direkomendasikan' : ''}${option.weight != null ? `, bobot ${option.weight}%` : ''}`}
      onClick={onSelect}
      onMouseEnter={onPreview}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`font-display group relative rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${
        option.highlyRecommended
          ? 'border-amber/60 bg-amber/10 text-amber shadow-[0_0_16px_rgba(245,165,36,0.25)]'
          : option.recommended
            ? 'border-violet-soft/50 bg-violet/10 text-violet-soft'
            : 'border-surface-line bg-surface text-ink-300'
      } ${muted ? 'opacity-60' : ''} hover:-translate-y-0.5`}
      title={option.weight != null ? `Bobot: ${option.weight}%` : undefined}
    >
      {chordName}
      {option.highlyRecommended && (
        <span className="ml-1.5 inline-flex items-center gap-0.5 text-amber" aria-hidden="true">
          <TrendingUp size={12} />
        </span>
      )}
      {!option.highlyRecommended && option.recommended && (
        <span className="ml-1.5 inline-flex items-center" aria-hidden="true">
          <Star size={12} className="text-violet-soft" />
        </span>
      )}
    </button>
  );
}

function BuilderSuggestions({
  genreData,
  builtNumerals,
  builtChords,
  isComplete,
  onSelect,
  onPreview,
}: {
  genreData: GenreData;
  builtNumerals: string[];
  builtChords: string[];
  isComplete: boolean;
  onSelect: (numeral: string, chordName: string) => void;
  onPreview: (chordName: string) => void;
}) {
  if (isComplete) {
    return (
      <div>
        <h4 className="mb-3 flex items-center gap-2 font-display font-semibold text-ink-100">
          <CheckCircle2 size={18} className="shrink-0 text-mint" aria-hidden="true" />
          Progression Selesai!
        </h4>
        <p className="text-sm text-cyan">
          Klik &ldquo;Play Progression&rdquo; untuk mendengarkan hasil, atau &ldquo;Reset&rdquo; untuk mulai ulang.
        </p>
        <div className="mt-4 rounded-xl border border-cyan/40 bg-cyan/5 p-4">
          <p className="flex items-center gap-2 font-display font-semibold text-ink-100">
            <PartyPopper size={16} className="shrink-0 text-amber" aria-hidden="true" />
            Progression Selesai!
          </p>
          <p className="mt-1 text-sm text-ink-300">
            Kamu telah membuat progression: <strong className="text-ink-100">{builtChords.join(' → ')}</strong>
          </p>
        </div>
      </div>
    );
  }

  const currentIndex = builtNumerals.length;

  if (currentIndex === 0) {
    const options = getInitialChordOptions(genreData);
    return (
      <div>
        <h4 className="mb-3 flex items-center gap-2 font-display font-semibold text-ink-100">
          <Target size={18} className="shrink-0 text-amber" aria-hidden="true" />
          Pilih Chord Dasar (Chord Pertama)
        </h4>
        <p className="mb-4 flex items-start gap-2 text-sm text-ink-300">
          <Lightbulb size={14} className="mt-0.5 shrink-0 text-amber" aria-hidden="true" />
          <span>
            Tips: Chord pertama menentukan &ldquo;mood&rdquo; progression. Pilih <strong className="text-ink-100">I (Tonic)</strong> untuk
            rasa stabil, atau <strong className="text-ink-100">vi</strong> untuk nuansa emosional.
          </span>
        </p>
        <div className="flex flex-wrap gap-2">
          {options.map((opt) => {
            const chordName = translateProgressionToKey([opt.numeral], BUILDER_KEY)[0];
            return (
              <ChordOptionButton
                key={opt.numeral}
                option={opt}
                chordName={chordName}
                onSelect={() => onSelect(opt.numeral, chordName)}
                onPreview={() => onPreview(chordName)}
              />
            );
          })}
        </div>
      </div>
    );
  }

  const lastNumeral = builtNumerals[builtNumerals.length - 1];
  const lastChord = builtChords[builtChords.length - 1];
  const suggestion = getSuggestedChords(genreData, lastNumeral);

  if (!suggestion) {
    const options = getInitialChordOptions(genreData);
    return (
      <div>
        <h4 className="mb-3 flex items-center gap-2 font-display font-semibold text-ink-100">
          <Music2 size={18} className="shrink-0 text-violet-soft" aria-hidden="true" />
          Pilih Chord ke-{currentIndex + 1} (setelah {lastChord})
        </h4>
        <p className="mb-4 flex items-center gap-2 rounded-lg border border-amber/30 bg-amber/5 px-3 py-2 text-sm text-amber">
          <AlertTriangle size={14} className="shrink-0" aria-hidden="true" />
          Chord sebelumnya tidak punya saran spesifik. Pilih yang cocok.
        </p>
        <div className="flex flex-wrap gap-2">
          {options.map((opt) => {
            const chordName = translateProgressionToKey([opt.numeral], BUILDER_KEY)[0];
            return (
              <ChordOptionButton
                key={opt.numeral}
                option={opt}
                chordName={chordName}
                onSelect={() => onSelect(opt.numeral, chordName)}
                onPreview={() => onPreview(chordName)}
              />
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h4 className="mb-3 flex items-center gap-2 font-display font-semibold text-ink-100">
        <Music2 size={18} className="shrink-0 text-violet-soft" aria-hidden="true" />
        Pilih Chord ke-{currentIndex + 1} (setelah {lastChord})
      </h4>

      <p className="mb-2 flex items-center gap-1.5 text-center text-xs font-semibold uppercase tracking-wide text-cyan">
        <Star size={12} aria-hidden="true" />
        Rekomendasi Utama
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {suggestion.primary.map((opt) => {
          const chordName = translateProgressionToKey([opt.numeral], BUILDER_KEY)[0];
          return (
            <ChordOptionButton
              key={opt.numeral}
              option={opt}
              chordName={chordName}
              onSelect={() => onSelect(opt.numeral, chordName)}
              onPreview={() => onPreview(chordName)}
            />
          );
        })}
      </div>

      {suggestion.other.length > 0 && (
        <>
          <p className="mb-2 mt-4 text-center text-xs text-ink-500">Opsi lain (kurang umum)</p>
          <div className="flex flex-wrap justify-center gap-2">
            {suggestion.other.map((opt) => {
              const chordName = translateProgressionToKey([opt.numeral], BUILDER_KEY)[0];
              return (
                <ChordOptionButton
                  key={opt.numeral}
                  option={opt}
                  chordName={chordName}
                  muted
                  onSelect={() => onSelect(opt.numeral, chordName)}
                  onPreview={() => onPreview(chordName)}
                />
              );
            })}
          </div>
        </>
      )}

      <div className="mt-4 rounded-xl border border-surface-line bg-ink-soft p-4 text-sm text-ink-300">
        <p>
          <strong className="flex items-center gap-2 text-ink-100">
            <Music2 size={14} className="shrink-0" aria-hidden="true" />
            Tentang {lastChord} ({lastNumeral}):
          </strong>{' '}
          Fungsi <em>{suggestion.chordFunction}</em>
        </p>
        <p className="mt-1.5">
          {CHORD_FUNCTION_EXPLANATIONS[suggestion.chordFunction] || 'Pilih chord yang terasa cocok dengan konteks musikmu.'}
        </p>
        <p className="mt-2 flex items-center gap-2 text-amber">
          <TrendingUp size={14} className="shrink-0" aria-hidden="true" />
          Chord dengan highlight adalah pilihan paling populer ({suggestion.hasWeights ? 'berdasarkan bobot' : 'umum digunakan'}).
        </p>
      </div>
    </div>
  );
}
