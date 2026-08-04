'use client';

import { HiMoon, HiSun } from 'react-icons/hi2';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

type ThemeToggleVariant = 'icon' | 'labeled';

export function ThemeToggle({
  className,
  variant = 'icon',
}: {
  className?: string;
  variant?: ThemeToggleVariant;
}) {
  const { theme, mounted, toggleTheme } = useTheme();
  const actionLabel = theme === 'dark' ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด';
  const modeLabel = theme === 'dark' ? 'โหมดมืด' : 'โหมดสว่าง';
  const ModeIcon = mounted && theme === 'dark' ? HiSun : HiMoon;

  if (variant === 'labeled') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={actionLabel}
        className={cn(
          'flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-all hover:bg-surface hover:text-ink',
          className,
        )}
      >
        <ModeIcon className="size-4 shrink-0" aria-hidden="true" />
        <span className="flex-1 text-left">{modeLabel}</span>
        <span className="text-xs text-muted/80">สลับ</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={actionLabel}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-ink transition-colors hover:bg-surface',
        className,
      )}
    >
      <ModeIcon className="size-[18px]" aria-hidden="true" />
    </button>
  );
}
