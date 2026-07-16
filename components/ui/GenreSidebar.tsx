'use client';

import { CSSProperties } from 'react';
import LineSidebar from './LineSidebar';
import { GENRES, type GenreKey } from '@/lib/chord-data';

interface GenreSidebarProps {
  value: GenreKey;
  onChange: (genre: GenreKey) => void;
  className?: string;
}

export function GenreSidebar({ value, onChange, className = '' }: GenreSidebarProps) {
  const genreLabels = GENRES.map((g) => g.label);
  const activeIndex = GENRES.findIndex((g) => g.key === value);

  const handleItemClick = (index: number) => {
    const selectedGenre = GENRES[index];
    if (selectedGenre) {
      onChange(selectedGenre.key);
    }
  };

  return (
    <div className={`sticky top-24 w-44 shrink-0 ${className}`}>
      <LineSidebar
        items={genreLabels}
        showIndex={true}
        showMarker={true}
        proximityRadius={80}
        maxShift={20}
        falloff="smooth"
        markerLength={40}
        markerGap={12}
        tickScale={0.5}
        scaleTick={true}
        itemGap={16}
        fontSize={0.95}
        smoothing={100}
        defaultActive={activeIndex >= 0 ? activeIndex : 0}
        onItemClick={(index) => handleItemClick(index)}
        accentColor="#7c5cfc"
        textColor="#8c85ad"
        markerColor="#2a2440"
      />
    </div>
  );
}
