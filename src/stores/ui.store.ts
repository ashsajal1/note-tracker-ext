import type { ThemeSetting } from '@/types/settings';
import type { NoteTemplate } from '@/utils/templates';
import { saveThemeSetting } from '@/db/settings.repository';
import { create } from 'zustand';

interface EditorState {
  open: boolean;
  /** note being edited, null when creating a new one */
  noteId: string | null;
  /** template seeding a new note (ignored when editing) */
  template: NoteTemplate | null;
}

interface UiState {
  editor: EditorState;
  detailNoteId: string | null;
  settingsOpen: boolean;
  deleteTargetId: string | null;
  /** note awaiting permanent deletion (from trash) */
  purgeTargetId: string | null;
  confirmClearOpen: boolean;
  theme: ThemeSetting;
  openEditor: (noteId?: string | null, template?: NoteTemplate | null) => void;
  closeEditor: () => void;
  openDetail: (noteId: string) => void;
  closeDetail: () => void;
  setSettingsOpen: (open: boolean) => void;
  requestDeleteNote: (id: string | null) => void;
  requestPurgeNote: (id: string | null) => void;
  setConfirmClearOpen: (open: boolean) => void;
  setTheme: (theme: ThemeSetting) => void;
}

export const useUiStore = create<UiState>()((set) => ({
  editor: { open: false, noteId: null, template: null },
  detailNoteId: null,
  settingsOpen: false,
  deleteTargetId: null,
  purgeTargetId: null,
  confirmClearOpen: false,
  theme: 'system',

  openEditor: (noteId = null, template = null) =>
    set({ editor: { open: true, noteId, template } }),
  closeEditor: () => set({ editor: { open: false, noteId: null, template: null } }),
  openDetail: (noteId) => set({ detailNoteId: noteId }),
  closeDetail: () => set({ detailNoteId: null }),
  setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
  requestDeleteNote: (deleteTargetId) => set({ deleteTargetId }),
  requestPurgeNote: (purgeTargetId) => set({ purgeTargetId }),
  setConfirmClearOpen: (confirmClearOpen) => set({ confirmClearOpen }),

  setTheme: (theme) => {
    set({ theme });
    void saveThemeSetting(theme).catch(() => {
      /* persistence is best-effort; in-memory value still applies */
    });
  },
}));
