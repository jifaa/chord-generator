import { type LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
}

export function PageHeader({ eyebrow, title, description, icon: Icon }: PageHeaderProps) {
  return (
    <header className="mb-10">
      {eyebrow && (
        <p className="font-mono mb-2 text-xs uppercase tracking-[0.2em] text-violet-soft">{eyebrow}</p>
      )}
      <h1 className="font-display flex items-center gap-2 text-3xl font-semibold tracking-tight text-ink-100 sm:text-4xl">
        {Icon && <Icon size={28} className="text-violet-soft shrink-0" aria-hidden="true" />}
        {title}
      </h1>
      {description && <p className="mt-3 max-w-2xl text-ink-300">{description}</p>}
    </header>
  );
}
