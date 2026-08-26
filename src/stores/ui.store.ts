import type { ThemeSetting } from '@/types/settings';
import { saveThemeSetting } from '@/db/settings.repository';
import { create } from 'zustand';

interface EditorState {
  open: boolean;
  /** note being edited, null when creating a new one */
  noteId: string | null;
}

interface UiState {
  editor: EditorState;
  settingsOpen: boolean;
  deleteTargetId: string | null;
  confirmClearOpen: boolean;
  theme: ThemeSetting;
  openEditor: (noteId?: string | null) => void;
  closeEditor: () => void;
  setSettingsOpen: (open: boolean) => void;
  requestDeleteNote: (id: string | null) => void;
  setConfirmClearOpen: (open: boolean) => void;
  setTheme: (theme: ThemeSetting) => void;
}

export const useUiStore = create<UiState>()((set) => ({
  editor: { open: false, noteId: null },
  settingsOpen: false,
  deleteTargetId: null,
  confirmClearOpen: false,
  theme: 'system',

  openEditor: (noteId = null) => set({ editor: { open: true, noteId } }),
  closeEditor: () => set({ editor: { open: false, noteId: null } }),
  setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
  requestDeleteNote: (deleteTargetId) => set({ deleteTargetId }),
  setConfirmClearOpen: (confirmClearOpen) => set({ confirmClearOpen }),

  setTheme: (theme) => {
    set({ theme });
    void saveThemeSetting(theme).catch(() => {
      /* persistence is best-effort; in-memory value still applies */
    });
  },
}));
