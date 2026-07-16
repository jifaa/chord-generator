'use client';

import { useRef, useState } from 'react';
import { X, Save, FolderOpen, Trash2, Clock, AlertCircle } from 'lucide-react';
import type { SavedProgression } from '@/hooks/use-progression-storage';
import { translateProgressionToKey } from '@/lib/music-theory';
import SpecularButton from '@/components/ui/SpecularButton';
import { GENRE_CHORD_GRAPHS } from '@/lib/chord-data';

interface ProgressionSaveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  progressions: SavedProgression[];
  draft: SavedProgression | null;
  onSave: (name: string) => void;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  currentChords: string[];
  currentGenre: string;
  currentCount: number;
}

type Tab = 'save' | 'load';

function formatDate(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Baru saja';
  if (diffMin < 60) return `${diffMin}m lalu`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}j lalu`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}h lalu`;
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

function ProgressionItem({
  item,
  onLoad,
  onDelete,
}: {
  item: SavedProgression;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const chords = translateProgressionToKey(item.builtNumerals, 'C');
  const genreName = GENRE_CHORD_GRAPHS[item.genre]?.name ?? item.genre;

  return (
    <div className="group flex items-start gap-3 rounded-xl border border-surface-line bg-surface-hi p-3 transition-colors hover:border-violet-soft/40">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-display truncate text-sm font-semibold text-ink-100">{item.name}</span>
          {item.id === '__draft__' && (
            <span className="shrink-0 rounded-full border border-amber/40 bg-amber/10 px-2 py-0.5 text-[10px] font-medium text-amber">
              Draft
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate font-mono text-xs text-ink-300">{chords.join(' → ')}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="text-[10px] text-ink-500">{genreName}</span>
          <span className="text-[10px] text-ink-500">·</span>
          <span className="flex items-center gap-1 text-[10px] text-ink-500">
            <Clock size={10} aria-hidden="true" />
            {formatDate(item.savedAt)}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 flex-col gap-1">
        <button
          type="button"
          onClick={() => onLoad(item.id)}
          className="rounded-lg border border-surface-line bg-surface p-1.5 text-ink-400 transition-colors hover:border-cyan/60 hover:text-cyan"
          aria-label={`Muat "${item.name}"`}
        >
          <FolderOpen size={13} aria-hidden="true" />
        </button>
        {item.id !== '__draft__' && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Hapus "${item.name}"?`)) onDelete(item.id);
            }}
            className="rounded-lg border border-surface-line bg-surface p-1.5 text-ink-400 transition-colors hover:border-rose/60 hover:text-rose"
            aria-label={`Hapus "${item.name}"`}
          >
            <Trash2 size={13} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}

export function ProgressionSaveDialog({
  isOpen,
  onClose,
  progressions,
  draft,
  onSave,
  onLoad,
  onDelete,
  currentChords,
  currentGenre,
  currentCount,
}: ProgressionSaveDialogProps) {
  const [tab, setTab] = useState<Tab>('load');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  function handleSave() {
    if (!name.trim()) {
      setError('Masukkan nama untuk progression ini.');
      inputRef.current?.focus();
      return;
    }
    onSave(name.trim());
    setName('');
    setError('');
    onClose();
  }

  function handleLoad(id: string) {
    onLoad(id);
    onClose();
  }

  function handleTabChange(t: Tab) {
    setTab(t);
    setError('');
    if (t === 'save') {
      // Pre-fill with a suggested name based on current chords
      if (!name) {
        setName(currentChords.slice(0, 3).join('-') || '');
      }
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      aria-modal="true"
      role="dialog"
      aria-label="Simpan dan Muat Progression"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative z-10 flex w-full max-w-md flex-col rounded-t-2xl border border-surface-line bg-surface sm:rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-line px-5 py-4">
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => handleTabChange('save')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === 'save'
                  ? 'bg-violet/20 text-violet-soft'
                  : 'text-ink-400 hover:text-ink-100'
              }`}
            >
              <Save size={14} aria-hidden="true" />
              Simpan
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('load')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === 'load'
                  ? 'bg-violet/20 text-violet-soft'
                  : 'text-ink-400 hover:text-ink-100'
              }`}
            >
              <FolderOpen size={14} aria-hidden="true" />
              Muat
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-surface-hi hover:text-ink-100"
            aria-label="Tutup"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto p-5">
          {tab === 'save' && (
            <div className="space-y-4">
              {/* Current preview */}
              <div className="rounded-xl border border-surface-line bg-ink-soft p-3">
                <p className="mb-1.5 text-xs text-ink-500">Preview</p>
                <p className="font-mono text-sm text-ink-100">
                  {currentChords.length > 0
                    ? currentChords.join(' → ')
                    : 'Belum ada chord — tambahkan chord terlebih dahulu.'}
                </p>
                {currentChords.length > 0 && (
                  <p className="mt-1 text-xs text-ink-500">
                    {currentCount} chord · {GENRE_CHORD_GRAPHS[currentGenre as keyof typeof GENRE_CHORD_GRAPHS]?.name ?? currentGenre}
                  </p>
                )}
              </div>

              {/* Name input */}
              <div>
                <label htmlFor="prog-name" className="mb-1.5 block text-xs font-medium text-ink-300">
                  Nama Progression
                </label>
                <input
                  ref={inputRef}
                  id="prog-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave();
                    if (e.key === 'Escape') onClose();
                  }}
                  placeholder="Contoh: Pop Verse Emosi"
                  maxLength={60}
                  className="w-full rounded-xl border border-surface-line bg-surface px-3.5 py-2.5 text-sm text-ink-100 outline-none focus:border-violet-soft"
                />
                {error && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-rose">
                    <AlertCircle size={12} aria-hidden="true" />
                    {error}
                  </p>
                )}
              </div>

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
                disabled={currentChords.length === 0}
                onClick={handleSave}
                className="w-full"
              >
                <span className="inline-flex items-center gap-2">
                  <Save size={14} aria-hidden="true" />
                  Simpan Progression
                </span>
              </SpecularButton>
            </div>
          )}

          {tab === 'load' && (
            <div className="space-y-3">
              {draft && draft.builtNumerals.length > 0 && (
                <>
                  <p className="mb-1.5 text-xs font-medium text-amber">Tersimpan otomatis</p>
                  <ProgressionItem item={draft} onLoad={handleLoad} onDelete={onDelete} />
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-surface-line" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-surface px-2 text-[10px] text-ink-500">TERSIMPAN</span>
                    </div>
                  </div>
                </>
              )}

              {progressions.length === 0 && (!draft || draft.builtNumerals.length === 0) ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-ink-500">Belum ada progression tersimpan.</p>
                  <p className="mt-1 text-xs text-ink-500">
                    Bangun progression lalu simpan dengan nama.
                  </p>
                </div>
              ) : (
                <>
                  {progressions.length > 0 && (
                    <p className="mb-1.5 text-xs font-medium text-ink-500">
                      Progression Tersimpan
                    </p>
                  )}
                  {progressions.map((p) => (
                    <ProgressionItem
                      key={p.id}
                      item={p}
                      onLoad={handleLoad}
                      onDelete={onDelete}
                    />
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
