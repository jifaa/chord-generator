'use client';

import { GENRES, type GenreKey } from '@/lib/chord-data';
import { Music2 } from 'lucide-react';

interface GenreButtonsProps {
  value: GenreKey;
  onChange: (genre: GenreKey) => void;
}

export function GenreButtons({ value, onChange }: GenreButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {GENRES.map((genre) => {
        const active = genre.key === value;
        return (
          <button
            key={genre.key}
            type="button"
            onClick={() => onChange(genre.key)}
            aria-pressed={active}
            className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
              active
                ? 'border-transparent bg-gradient-to-r from-violet to-violet-dim text-white shadow-[0_0_20px_rgba(124,92,252,0.4)]'
                : 'border-surface-line bg-surface text-ink-300 hover:border-violet-soft/50 hover:text-ink-100'
            }`}
          >
            <Music2 size={14} className="shrink-0" aria-hidden="true" />
            {genre.label}
          </button>
        );
      })}
    </div>
  );
}
