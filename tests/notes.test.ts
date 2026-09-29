import { describe, expect, it } from 'vitest';
import type { Note } from '@/types/note';
import { activeNotes, trashedNotes } from '@/utils/notes';

function note(partial: Partial<Note> & { id: string }): Note {
  return {
    content: '',
    tags: [],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    deletedAt: null,
    pinned: false,
    ...partial,
  };
}

describe('activeNotes / trashedNotes', () => {
  const notes = [
    note({ id: 'a' }),
    note({ id: 'b', deletedAt: '2026-08-02T00:00:00Z' }),
    note({ id: 'c', deletedAt: '2026-08-01T00:00:00Z' }),
  ];

  it('splits active from trashed', () => {
    expect(activeNotes(notes).map((n) => n.id)).toEqual(['a']);
    expect(trashedNotes(notes).map((n) => n.id).sort()).toEqual(['b', 'c']);
  });

  it('orders trash most-recently-trashed first', () => {
    expect(trashedNotes(notes).map((n) => n.id)).toEqual(['b', 'c']);
  });
});
