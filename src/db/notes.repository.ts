import type { Note, NoteInput } from '@/types/note';
import { db } from './database';

/** Fill in fields missing from pre-v2 records. */
function normalize(note: Note): Note {
  return {
    ...note,
    deletedAt: note.deletedAt ?? null,
    pinned: note.pinned ?? false,
  };
}

export async function getAllNotes(): Promise<Note[]> {
  return (await db.notes.toArray()).map(normalize);
}

export async function createNote(input: NoteInput): Promise<Note> {
  const now = new Date().toISOString();
  const note: Note = {
    id: crypto.randomUUID(),
    content: input.content,
    tags: input.tags,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    pinned: false,
  };
  await db.notes.add(note);
  return note;
}

export async function updateNote(id: string, input: NoteInput): Promise<Note | undefined> {
  return db.transaction('rw', db.notes, async () => {
    const existing = await db.notes.get(id);
    if (!existing) return undefined;
    const next: Note = {
      ...existing,
      content: input.content,
      tags: input.tags,
      updatedAt: new Date().toISOString(),
    };
    await db.notes.put(next);
    return next;
  });
}

export async function deleteNote(id: string): Promise<void> {
  await db.notes.delete(id);
}

/** Move a note to trash (recoverable for TRASH_RETENTION_MS). */
export async function softDeleteNote(id: string): Promise<Note | undefined> {
  return db.transaction('rw', db.notes, async () => {
    const existing = await db.notes.get(id);
    if (!existing) return undefined;
    const next = normalize({ ...existing, deletedAt: new Date().toISOString() });
    await db.notes.put(next);
    return next;
  });
}

/** Restore a trashed note. */
export async function restoreNote(id: string): Promise<Note | undefined> {
  return db.transaction('rw', db.notes, async () => {
    const existing = await db.notes.get(id);
    if (!existing) return undefined;
    const next = normalize({ ...existing, deletedAt: null });
    await db.notes.put(next);
    return next;
  });
}

/** Permanently delete trashed notes older than the cutoff ISO timestamp. */
export async function purgeDeletedNotes(cutoffIso: string): Promise<number> {
  return db.notes.where('deletedAt').below(cutoffIso).delete();
}

/** Flip the pinned flag. */
export async function togglePinNote(id: string): Promise<Note | undefined> {
  return db.transaction('rw', db.notes, async () => {
    const existing = await db.notes.get(id);
    if (!existing) return undefined;
    const next = normalize({ ...existing, pinned: !existing.pinned });
    await db.notes.put(next);
    return next;
  });
}

export async function clearAllNotes(): Promise<void> {
  await db.notes.clear();
}

/** Upsert a batch of notes (used by import). Returns number written. */
export async function bulkUpsertNotes(notes: Note[]): Promise<number> {
  await db.notes.bulkPut(notes);
  return notes.length;
}

export async function countNotes(): Promise<number> {
  return db.notes.count();
}
