import { useEffect } from 'react';
import type { ResolvedTheme, ThemeSetting } from '@/types/settings';
import { loadThemeSetting } from '@/db/settings.repository';
import { useUiStore } from '@/stores/ui.store';

const QUERY = '(prefers-color-scheme: dark)';

export function resolveTheme(setting: ThemeSetting, systemDark: boolean): ResolvedTheme {
  if (setting === 'system') return systemDark ? 'dark' : 'light';
  return setting;
}

/**
 * Applies the theme to <html> (class="dark"), keeps it in sync with the
 * OS preference while set to "system", and loads the persisted setting
 * once on mount. Also exposes the resolved theme for components that
 * need it (e.g. toasts).
 */
export function useTheme(): ResolvedTheme {
  const theme = useUiStore((s) => s.theme);

  useEffect(() => {
    void loadThemeSetting().then(useUiStore.getState().setTheme);
  }, []);

  useEffect(() => {
    const media = window.matchMedia(QUERY);

    const apply = () => {
      const resolved = resolveTheme(theme, media.matches);
      document.documentElement.classList.toggle('dark', resolved === 'dark');
      document.documentElement.style.colorScheme = resolved;
    };

    apply();
    if (theme !== 'system') return;

    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [theme]);

  const systemDark = typeof window !== 'undefined' && window.matchMedia(QUERY).matches;
  return resolveTheme(theme, systemDark);
}
