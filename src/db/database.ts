import Dexie, { type EntityTable } from 'dexie';
import type { Note } from '@/types/note';

/**
 * Local-first database. IndexedDB via Dexie — no network, no sync.
 *
 * Schema (v1):
 *  - id: primary key
 *  - updatedAt / createdAt: indexed for fast sorted iteration
 */
export const db = new Dexie('note-tracker') as Dexie & {
  notes: EntityTable<Note, 'id'>;
};

db.version(1).stores({
  notes: 'id, updatedAt, createdAt',
});
