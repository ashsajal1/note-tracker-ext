import type { Note } from '@/types/note';

/** Notes not in trash. */
export function activeNotes(notes: Note[]): Note[] {
  return notes.filter((n) => n.deletedAt == null);
}

/** Notes in trash, most recently trashed first. */
export function trashedNotes(notes: Note[]): Note[] {
  return notes
    .filter((n) => n.deletedAt != null)
    .sort((a, b) => Date.parse(b.deletedAt!) - Date.parse(a.deletedAt!));
}
