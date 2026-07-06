'use client';

import { HiMoon, HiSun } from 'react-icons/hi2';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, mounted, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด'}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-ink transition-colors hover:bg-surface',
        className,
      )}
    >
      {mounted && theme === 'dark' ? (
        <HiSun className="size-[18px]" aria-hidden="true" />
      ) : (
        <HiMoon className="size-[18px]" aria-hidden="true" />
      )}
    </button>
  );
}
