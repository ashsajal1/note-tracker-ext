import { RECENT_WINDOW_MS, type Note, type Scope, type SortOption } from '@/types/note';
import { stripHtml } from '@/utils/format';

/**
 * Pure search/filter/sort logic. No storage or React dependencies —
 * fully unit-testable and safe to run on every keystroke (debounced).
 *
 * Strategy: notes are loaded into memory once (fast with thousands of
 * notes); filtering is O(n) per query over precomputed lowercase
 * haystacks. Dexie indexes handle persisted ordering.
 */

const haystackCache = new WeakMap<Note, string>();

/** content (stripped of HTML) + tags, lowercased — the searchable surface of a note */
function haystack(note: Note): string {
  let cached = haystackCache.get(note);
  if (cached === undefined) {
    cached = `${stripHtml(note.content)}\n${note.tags.join('\n')}`.toLowerCase();
    haystackCache.set(note, cached);
  }
  return cached;
}

/** Split "work urgent" into ["work", "urgent"]. Empty tokens removed. */
export function tokenizeQuery(query: string): string[] {
  return query.toLowerCase().trim().split(/\s+/).filter(Boolean);
}

/** Every token must appear somewhere in content or tags (partial match). */
export function matchesQuery(note: Note, tokens: string[]): boolean {
  if (tokens.length === 0) return true;
  const hay = haystack(note);
  return tokens.every((token) => hay.includes(token));
}

function isRecent(note: Note, now: number): boolean {
  const updated = Date.parse(note.updatedAt);
  if (Number.isNaN(updated)) return false;
  return now - updated <= RECENT_WINDOW_MS;
}

function matchesTags(note: Note, tags: string[]): boolean {
  // AND semantics: note must contain every selected tag.
  return tags.every((tag) => note.tags.includes(tag));
}

export interface FilterOptions {
  query: string;
  /** selected tags, AND semantics */
  tags: string[];
  scope: Scope;
  sort: SortOption;
  /** include trashed notes (default false) */
  includeDeleted?: boolean;
}

export function filterNotes(notes: Note[], options: FilterOptions, now = Date.now()): Note[] {
  const tokens = tokenizeQuery(options.query);
  return notes.filter((note) => {
    if (!options.includeDeleted && note.deletedAt != null) return false;
    if (options.scope === 'recent' && !isRecent(note, now)) return false;
    if (!matchesTags(note, options.tags)) return false;
    return matchesQuery(note, tokens);
  });
}

export function sortNotes(notes: Note[], sort: SortOption): Note[] {
  const sorted = [...notes];
  const byDate = (a: Note, b: Note, field: 'createdAt' | 'updatedAt'): number => {
    const ta = Date.parse(a[field]) || 0;
    const tb = Date.parse(b[field]) || 0;
    return tb - ta; // desc
  };
  const byPinned = (a: Note, b: Note): number =>
    Number(b.pinned ?? false) - Number(a.pinned ?? false);
  switch (sort) {
    case 'created-asc':
      return sorted.sort((a, b) => byPinned(a, b) || -byDate(a, b, 'createdAt'));
    case 'updated-desc':
      return sorted.sort((a, b) => byPinned(a, b) || byDate(a, b, 'updatedAt'));
    case 'created-desc':
    default:
      return sorted.sort((a, b) => byPinned(a, b) || byDate(a, b, 'createdAt'));
  }
}

export function filterAndSortNotes(
  notes: Note[],
  options: FilterOptions,
  now = Date.now(),
): Note[] {
  return sortNotes(filterNotes(notes, options, now), options.sort);
}
