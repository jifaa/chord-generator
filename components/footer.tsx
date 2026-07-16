import Link from 'next/link';
import { Keyboard } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative z-10 mt-24 border-t border-surface-line/70 bg-ink-soft/60">
      <div className="w-full flex flex-col gap-3 px-6 py-8 text-sm text-ink-500 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Chord Map — dibangun di atas teori graf &amp; Circle of Fifths.
        </p>
        <Link
          href="/player"
          className="inline-flex items-center gap-2 text-ink-300 transition-colors hover:text-cyan"
        >
          <Keyboard size={14} className="shrink-0" aria-hidden="true" />
          Coba Chord Player (beta)
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </footer>
  );
}
