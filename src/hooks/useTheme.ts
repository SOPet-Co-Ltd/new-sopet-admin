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
