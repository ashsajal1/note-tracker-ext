import { describe, expect, it } from 'vitest';
import {
  filterAndSortNotes,
  filterNotes,
  matchesQuery,
  sortNotes,
  tokenizeQuery,
} from '@/features/search/search';
import type { Note } from '@/types/note';

function note(partial: Partial<Note> & { id: string; content: string }): Note {
  return {
    tags: [],
    createdAt: '2026-01-01T10:00:00.000Z',
    updatedAt: '2026-01-01T10:00:00.000Z',
    deletedAt: null,
    pinned: false,
    ...partial,
  };
}

const NOW = Date.parse('2026-08-20T12:00:00.000Z');

const NOTES: Note[] = [
  note({
    id: '1',
    content: 'Grocery list: milk, eggs',
    tags: ['shopping'],
    createdAt: '2026-08-01T09:00:00Z',
  }),
  note({
    id: '2',
    content: 'Standup notes for the platform team',
    tags: ['work', 'meetings'],
    createdAt: '2026-08-05T09:00:00Z',
    updatedAt: '2026-08-18T09:00:00Z',
  }),
  note({
    id: '3',
    content: 'Book idea: local-first software',
    tags: ['ideas'],
    createdAt: '2026-07-01T09:00:00Z',
    updatedAt: '2026-08-19T09:00:00Z',
  }),
  note({
    id: '4',
    content: 'Old archived scratchpad',
    createdAt: '2025-06-01T09:00:00Z',
    updatedAt: '2025-06-02T09:00:00Z',
  }),
];

describe('tokenizeQuery', () => {
  it('splits on whitespace and lowercases', () => {
    expect(tokenizeQuery('  Local FIRST  software ')).toEqual(['local', 'first', 'software']);
  });

  it('returns [] for blank queries', () => {
    expect(tokenizeQuery('')).toEqual([]);
    expect(tokenizeQuery('   ')).toEqual([]);
  });
});

describe('matchesQuery', () => {
  const n = NOTES[1]!;

  it('matches partial words', () => {
    expect(matchesQuery(n, tokenizeQuery('stand'))).toBe(true);
  });

  it('requires every keyword to match somewhere (content or tags)', () => {
    expect(matchesQuery(n, tokenizeQuery('standup team'))).toBe(true);
    expect(matchesQuery(n, tokenizeQuery('standup meetings'))).toBe(true); // tag match
    expect(matchesQuery(n, tokenizeQuery('standup missingword'))).toBe(false);
  });

  it('always matches when there are no tokens', () => {
    expect(matchesQuery(n, [])).toBe(true);
  });
});

describe('filterNotes', () => {
  it('returns everything for an empty filter set', () => {
    expect(
      filterNotes(NOTES, { query: '', tags: [], scope: 'all', sort: 'created-desc' }, NOW),
    ).toHaveLength(4);
  });

  it('filters by partial multi-keyword query across content and tags', () => {
    const opts = {
      query: 'local soft',
      tags: [],
      scope: 'all' as const,
      sort: 'created-desc' as const,
    };
    expect(filterNotes(NOTES, opts, NOW).map((n) => n.id)).toEqual(['3']);
  });

  it('AND-combines selected tags', () => {
    const both = {
      query: '',
      tags: ['work', 'meetings'],
      scope: 'all' as const,
      sort: 'created-desc' as const,
    };
    expect(filterNotes(NOTES, both, NOW).map((n) => n.id)).toEqual(['2']);

    const one = {
      query: '',
      tags: ['ideas'],
      scope: 'all' as const,
      sort: 'created-desc' as const,
    };
    expect(filterNotes(NOTES, one, NOW).map((n) => n.id)).toEqual(['3']);
  });

  it('recent scope only includes notes updated within the window', () => {
    const opts = { query: '', tags: [], scope: 'recent' as const, sort: 'created-desc' as const };
    expect(
      filterNotes(NOTES, opts, NOW)
        .map((n) => n.id)
        .sort(),
    ).toEqual(['2', '3'].sort());
  });

  it('combines query + tags + scope', () => {
    const opts = {
      query: 'team',
      tags: ['work'],
      scope: 'recent' as const,
      sort: 'created-desc' as const,
    };
    expect(filterNotes(NOTES, opts, NOW).map((n) => n.id)).toEqual(['2']);

    const noMatch = { ...opts, tags: ['ideas'] };
    expect(filterNotes(NOTES, noMatch, NOW)).toHaveLength(0);
  });
});

describe('sortNotes / filterAndSortNotes', () => {
  it('does not mutate the input array', () => {
    const copy = [...NOTES];
    sortNotes(NOTES, 'created-desc');
    expect(NOTES).toEqual(copy);
  });

  it('sorts newest first by default', () => {
    const sorted = sortNotes(NOTES, 'created-desc');
    expect(sorted[0]!.id).toBe('2');
    expect(sorted[sorted.length - 1]!.id).toBe('4');
  });

  it('sorts oldest first', () => {
    const sorted = sortNotes(NOTES, 'created-asc');
    expect(sorted[0]!.id).toBe('4');
  });

  it('supports recently-updated sorting', () => {
    const sorted = sortNotes(NOTES, 'updated-desc');
    expect(sorted[0]!.id).toBe('3'); // updated 2026-08-19
  });

  it('applies filters then sort together', () => {
    const result = filterAndSortNotes(
      NOTES,
      { query: '', tags: [], scope: 'all', sort: 'created-asc' },
      NOW,
    );
    expect(result.map((n) => n.id)).toEqual(['4', '3', '1', '2']);
  });
});

describe('trash exclusion', () => {
  const trashed = note({
    id: 't',
    content: 'trashed milk note',
    deletedAt: '2026-08-19T10:00:00Z',
  });

  it('excludes trashed notes by default', () => {
    const result = filterNotes([...NOTES, trashed], {
      query: 'milk',
      tags: [],
      scope: 'all',
      sort: 'created-desc',
    });
    expect(result.map((n) => n.id)).toEqual(['1']);
  });

  it('includes trashed notes with includeDeleted', () => {
    const result = filterNotes([...NOTES, trashed], {
      query: 'milk',
      tags: [],
      scope: 'all',
      sort: 'created-desc',
      includeDeleted: true,
    });
    expect(result.map((n) => n.id).sort()).toEqual(['1', 't']);
  });
});
