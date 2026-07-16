'use client';

interface ProgressionChainProps {
  chords: string[];
  playingIndex?: number;
  onChordClick?: (chord: string, index: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES: Record<NonNullable<ProgressionChainProps['size']>, string> = {
  sm: 'min-w-[3rem] px-3 py-2 text-sm',
  md: 'min-w-[3.75rem] px-4 py-3 text-base',
  lg: 'min-w-[4.5rem] px-5 py-4 text-lg',
};

/**
 * Menampilkan progresi sebagai rantai node graf: chip chord dihubungkan
 * oleh garis edge tipis, konsisten dengan motif Circle-of-Fifths di seluruh produk.
 */
export function ProgressionChain({ chords, playingIndex = -1, onChordClick, size = 'md' }: ProgressionChainProps) {
  if (chords.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chords.map((chord, index) => {
        const isPlaying = index === playingIndex;
        return (
          <div key={`${chord}-${index}`} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onChordClick?.(chord, index)}
              className={`font-display rounded-xl border font-semibold transition-all ${SIZE_CLASSES[size]} ${
                isPlaying
                  ? 'scale-105 border-cyan bg-cyan/15 text-cyan shadow-[0_0_18px_rgba(34,211,238,0.45)]'
                  : 'border-surface-line bg-surface text-ink-100 hover:border-violet-soft/60 hover:bg-surface-hi'
              } ${onChordClick ? 'cursor-pointer' : 'cursor-default'}`}
            >
              {chord}
            </button>
            {index < chords.length - 1 && (
              <span aria-hidden="true" className="text-ink-500">
                →
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
