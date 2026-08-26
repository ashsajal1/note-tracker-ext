import type { Note, NoteInput } from '@/types/note';
import { db } from './database';

export async function getAllNotes(): Promise<Note[]> {
  return db.notes.toArray();
}

export async function createNote(input: NoteInput): Promise<Note> {
  const now = new Date().toISOString();
  const note: Note = {
    id: crypto.randomUUID(),
    content: input.content,
    tags: input.tags,
    createdAt: now,
    updatedAt: now,
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
