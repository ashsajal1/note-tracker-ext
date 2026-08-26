import { storage } from 'wxt/utils/storage';
import type { ThemeSetting } from '@/types/settings';

const themeItem = storage.defineItem<ThemeSetting>('local:theme', {
  fallback: 'system',
});

export async function loadThemeSetting(): Promise<ThemeSetting> {
  try {
    const value = await themeItem.getValue();
    return value === 'light' || value === 'dark' || value === 'system' ? value : 'system';
  } catch {
    return 'system';
  }
}

export async function saveThemeSetting(theme: ThemeSetting): Promise<void> {
  await themeItem.setValue(theme);
}
