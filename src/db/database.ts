import Dexie, { type EntityTable } from 'dexie';
import type { Note } from '@/types/note';

/**
 * Local-first database. IndexedDB via Dexie — no network, no sync.
 *
 * Schema:
 *  - v1: id (pk), updatedAt, createdAt
 *  - v2: + deletedAt (trash index). Records written before v2 lack
 *    `deletedAt`/`pinned` and are normalized to defaults on read.
 */
export const db = new Dexie('note-tracker') as Dexie & {
  notes: EntityTable<Note, 'id'>;
};

db.version(1).stores({
  notes: 'id, updatedAt, createdAt',
});

db.version(2).stores({
  notes: 'id, updatedAt, createdAt, deletedAt',
});
