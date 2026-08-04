'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  applyTheme,
  getStoredTheme,
  getSystemTheme,
  resolveTheme,
  THEME_STORAGE_KEY,
  type Theme,
} from '@/lib/theme';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Resolves theme from localStorage/media query, which only exist client-side;
    // must run post-mount to avoid an SSR/CSR hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(resolveTheme());
    setMounted(true);
  }, []);

  const setThemeValue = useCallback((next: Theme) => {
    setTheme(next);
    applyTheme(next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeValue(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setThemeValue]);

  return {
    theme,
    mounted,
    isDark: theme === 'dark',
    setTheme: setThemeValue,
    toggleTheme,
    systemTheme: getSystemTheme(),
    storedTheme: getStoredTheme(),
  };
}
