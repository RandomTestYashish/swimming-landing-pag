import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

const KEY = 'ff-theme';

/**
 * Theme follows the system by default. A manual choice is remembered,
 * because both modes carry real brand expression here: the light scene is
 * the pool hall in late morning, the dark one is the same pool at dusk.
 */
export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light';
    const saved = window.localStorage.getItem(KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // keep following the system until the reader expresses a preference
  useEffect(() => {
    if (window.localStorage.getItem(KEY)) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const on = () => setTheme(mq.matches ? 'dark' : 'light');
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  const toggle = useCallback(() => {
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark';
      try { window.localStorage.setItem(KEY, next); } catch { /* private mode */ }
      return next;
    });
  }, []);

  return [theme, toggle];
}
