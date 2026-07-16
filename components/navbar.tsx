'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { CircleOfFifthsRing } from './circle-of-fifths-ring';
import { House, Dices, Hammer, Map, BookOpen } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Beranda', Icon: House },
  { href: '/generator', label: 'Generator', Icon: Dices },
  { href: '/builder', label: 'Builder', Icon: Hammer },
  { href: '/explorer', label: 'Explorer', Icon: Map },
  { href: '/reference', label: 'Referensi', Icon: BookOpen },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-surface-line/70 bg-ink/85 backdrop-blur-xl">
      <div className="w-full flex items-center justify-between gap-4 px-6 py-3">
        <Link href="/" className="flex items-center gap-2.5 shrink-0" onClick={() => setOpen(false)}>
          <CircleOfFifthsRing size={34} showLabels={false} />
          <span className="font-display text-lg font-semibold tracking-tight text-ink-100">
            Chord<span className="text-violet-soft">Map</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  active ? 'text-ink-100' : 'text-ink-300 hover:text-ink-100'
                }`}
              >
                {active && (
                  <span className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-violet to-violet-dim shadow-[0_0_24px_rgba(124,92,252,0.45)]" />
                )}
                <item.Icon size={16} className="shrink-0" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="md:hidden flex flex-col gap-1.5 p-2"
        >
          <span
            className={`h-0.5 w-6 rounded-full bg-ink-100 transition-transform ${open ? 'translate-y-2 rotate-45' : ''}`}
          />
          <span className={`h-0.5 w-6 rounded-full bg-ink-100 transition-opacity ${open ? 'opacity-0' : ''}`} />
          <span
            className={`h-0.5 w-6 rounded-full bg-ink-100 transition-transform ${open ? '-translate-y-2 -rotate-45' : ''}`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="md:hidden border-t border-surface-line/70 bg-ink/95 px-5 py-3">
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium ${
                      active ? 'bg-gradient-to-r from-violet to-violet-dim text-white' : 'text-ink-300'
                    }`}
                  >
                    <item.Icon size={16} className="shrink-0" aria-hidden="true" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}
