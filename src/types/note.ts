export interface Note {
  /** UUID v4 (crypto.randomUUID) */
  id: string;
  content: string;
  /** Normalized: lowercase, trimmed, deduplicated */
  tags: string[];
  /** ISO 8601 timestamp */
  createdAt: string;
  /** ISO 8601 timestamp */
  updatedAt: string;
}

/** Payload used when creating or editing a note */
export interface NoteInput {
  content: string;
  tags: string[];
}

export type SortOption = 'created-desc' | 'created-asc' | 'updated-desc';

export type Scope = 'all' | 'recent';

/** Notes updated within this window count as "recent" */
export const RECENT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export const MAX_TAG_LENGTH = 32;

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'created-desc', label: 'Newest first' },
  { value: 'created-asc', label: 'Oldest first' },
  { value: 'updated-desc', label: 'Recently updated' },
];
