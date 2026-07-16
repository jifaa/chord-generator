import type { ReactNode } from 'react';
import { type LucideIcon } from 'lucide-react';

interface PanelProps {
  children: ReactNode;
  title?: string;
  icon?: LucideIcon;
  className?: string;
}

export function Panel({ children, title, icon: Icon, className = '' }: PanelProps) {
  return (
    <section
      className={`rounded-2xl border border-surface-line bg-surface/60 p-4 sm:p-6 ${className}`}
    >
      {title && (
        <h2 className="font-display mb-4 flex items-center gap-2 text-xl font-semibold text-ink-100">
          {Icon && (
            <Icon size={20} className="text-violet-soft shrink-0" aria-hidden="true" />
          )}
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}
