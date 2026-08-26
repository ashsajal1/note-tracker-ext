import type { Note, NoteInput } from '@/types/note';
import * as repo from '@/db/notes.repository';
import { create } from 'zustand';

export type NotesStatus = 'idle' | 'loading' | 'ready' | 'error';

interface NotesState {
  notes: Note[];
  status: NotesStatus;
  error: string | null;
  /** Load all notes from IndexedDB. Safe to call multiple times. */
  initialize: () => Promise<void>;
  addNote: (input: NoteInput) => Promise<Note>;
  editNote: (id: string, input: NoteInput) => Promise<boolean>;
  removeNote: (id: string) => Promise<void>;
  removeAllNotes: () => Promise<void>;
  importNotes: (notes: Note[]) => Promise<void>;
}

let initialized = false;

export const useNotesStore = create<NotesState>()((set, get) => ({
  notes: [],
  status: 'idle',
  error: null,

  initialize: async () => {
    if (initialized || get().status === 'loading') return;
    initialized = true;
    set({ status: 'loading', error: null });
    try {
      const notes = await repo.getAllNotes();
      set({ notes, status: 'ready' });
    } catch (err) {
      initialized = false;
      set({
        status: 'error',
        error: err instanceof Error ? err.message : 'Failed to load notes',
      });
    }
  },

  addNote: async (input) => {
    const note = await repo.createNote(input);
    set((s) => ({ notes: [note, ...s.notes] }));
    return note;
  },

  editNote: async (id, input) => {
    const updated = await repo.updateNote(id, input);
    if (!updated) return false;
    set((s) => ({ notes: s.notes.map((n) => (n.id === id ? updated : n)) }));
    return true;
  },

  removeNote: async (id) => {
    await repo.deleteNote(id);
    set((s) => ({ notes: s.notes.filter((n) => n.id !== id) }));
  },

  removeAllNotes: async () => {
    await repo.clearAllNotes();
    set({ notes: [] });
  },

  importNotes: async (incoming) => {
    await repo.bulkUpsertNotes(incoming);
    // Re-read so imported updates merge correctly with existing state.
    const notes = await repo.getAllNotes();
    set({ notes });
  },
}));
