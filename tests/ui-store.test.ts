import { describe, expect, it, beforeEach, vi } from 'vitest';

// Mock wxt storage to avoid browser API errors in Node test environment
vi.mock('wxt/utils/storage', () => ({
  storage: {
    defineItem: () => ({
      getValue: vi.fn().mockResolvedValue('system'),
      setValue: vi.fn().mockResolvedValue(undefined),
    }),
  },
}));

import { useUiStore } from '@/stores/ui.store';

describe('useUiStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useUiStore.setState({
      editor: { open: false, noteId: null, template: null },
      detailNoteId: null,
      settingsOpen: false,
      deleteTargetId: null,
      purgeTargetId: null,
      confirmClearOpen: false,
      theme: 'system',
    });
  });

  describe('editor state', () => {
    it('opens editor with null noteId for new note', () => {
      useUiStore.getState().openEditor(null);
      const state = useUiStore.getState();
      expect(state.editor.open).toBe(true);
      expect(state.editor.noteId).toBeNull();
    });

    it('opens editor with noteId for editing', () => {
      useUiStore.getState().openEditor('note-123');
      const state = useUiStore.getState();
      expect(state.editor.open).toBe(true);
      expect(state.editor.noteId).toBe('note-123');
    });

    it('closes editor and resets noteId', () => {
      useUiStore.getState().openEditor('note-123');
      useUiStore.getState().closeEditor();
      const state = useUiStore.getState();
      expect(state.editor.open).toBe(false);
      expect(state.editor.noteId).toBeNull();
    });

    it('seeds new notes with a template and clears it on close', () => {
      const template = { id: 'meeting', label: 'Meeting', hint: '', tags: [], html: '' };
      useUiStore.getState().openEditor(null, template);
      expect(useUiStore.getState().editor.template).toEqual(template);
      useUiStore.getState().closeEditor();
      expect(useUiStore.getState().editor.template).toBeNull();
    });
  });

  describe('detail view state', () => {
    it('opens detail view with noteId', () => {
      useUiStore.getState().openDetail('note-456');
      expect(useUiStore.getState().detailNoteId).toBe('note-456');
    });

    it('closes detail view', () => {
      useUiStore.getState().openDetail('note-456');
      useUiStore.getState().closeDetail();
      expect(useUiStore.getState().detailNoteId).toBeNull();
    });

    it('detail view is independent of editor state', () => {
      useUiStore.getState().openDetail('note-456');
      useUiStore.getState().openEditor('note-789');
      const state = useUiStore.getState();
      expect(state.detailNoteId).toBe('note-456');
      expect(state.editor.open).toBe(true);
      expect(state.editor.noteId).toBe('note-789');
    });
  });

  describe('delete target state', () => {
    it('sets delete target', () => {
      useUiStore.getState().requestDeleteNote('note-delete');
      expect(useUiStore.getState().deleteTargetId).toBe('note-delete');
    });

    it('clears delete target', () => {
      useUiStore.getState().requestDeleteNote('note-delete');
      useUiStore.getState().requestDeleteNote(null);
      expect(useUiStore.getState().deleteTargetId).toBeNull();
    });
  });

  describe('settings state', () => {
    it('toggles settings open', () => {
      useUiStore.getState().setSettingsOpen(true);
      expect(useUiStore.getState().settingsOpen).toBe(true);
      useUiStore.getState().setSettingsOpen(false);
      expect(useUiStore.getState().settingsOpen).toBe(false);
    });
  });

  describe('confirm clear state', () => {
    it('toggles confirm clear open', () => {
      useUiStore.getState().setConfirmClearOpen(true);
      expect(useUiStore.getState().confirmClearOpen).toBe(true);
      useUiStore.getState().setConfirmClearOpen(false);
      expect(useUiStore.getState().confirmClearOpen).toBe(false);
    });
  });

  describe('theme state', () => {
    it('sets theme', () => {
      useUiStore.getState().setTheme('dark');
      expect(useUiStore.getState().theme).toBe('dark');
    });
  });
});
