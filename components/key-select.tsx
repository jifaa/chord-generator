'use client';

import { KEY_OPTIONS } from '@/lib/chord-data';

interface KeySelectProps {
  value: string;
  onChange: (key: string) => void;
  id?: string;
  label?: string;
}

export function KeySelect({ value, onChange, id = 'key-select', label = 'Kunci' }: KeySelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-xs font-medium uppercase tracking-wide text-ink-500">
          {label}
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-surface-line bg-surface px-3 py-2.5 text-sm font-medium text-ink-100 outline-none transition-colors focus:border-violet-soft"
      >
        {KEY_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-surface">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
