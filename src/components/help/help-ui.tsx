'use client';

import { HiMagnifyingGlass } from 'react-icons/hi2';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export const helpChipClass = (active: boolean) =>
  cn(
    'shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors',
    active
      ? 'border-brand/30 bg-brand/10 font-medium text-brand shadow-sm'
      : 'border-border bg-card text-ink hover:border-brand/25 hover:bg-surface',
  );

type HelpSearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  ariaLabel: string;
  className?: string;
};

export function HelpSearchField({
  value,
  onChange,
  placeholder,
  ariaLabel,
  className,
}: HelpSearchFieldProps) {
  return (
    <div className={cn('relative', className)}>
      <HiMagnifyingGlass
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="border-border/80 bg-card pl-9 shadow-sm"
      />
    </div>
  );
}

/** Drop duplicate H1 when PageHeader already shows the article title. */
export function stripDuplicateHelpTitle(markdown: string, title: string): string {
  const lines = markdown.split('\n');
  const first = lines[0]?.trim() ?? '';
  if (first.startsWith('# ') && first.slice(2).trim() === title.trim()) {
    return lines.slice(1).join('\n').replace(/^\n+/, '');
  }
  return markdown;
}
