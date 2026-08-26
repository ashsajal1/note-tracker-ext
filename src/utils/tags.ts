import { MAX_TAG_LENGTH } from '@/types/note';

/**
 * Normalize a raw tag string:
 * lowercase, trim, strip leading "#", collapse whitespace into dashes,
 * cap length.
 *
 * Returns '' when nothing usable remains.
 */
export function normalizeTag(raw: string): string {
  return raw.trim().toLowerCase().replace(/^#+/, '').replace(/\s+/g, '-').slice(0, MAX_TAG_LENGTH);
}

/**
 * Parse free-form tag input ("work, urgent #today") into a normalized,
 * de-duplicated list.
 */
export function parseTagInput(raw: string): string[] {
  const tags = raw
    .split(/[,\n]/)
    .map(normalizeTag)
    .filter((t) => t.length > 0);
  return dedupeTags(tags);
}

/** De-duplicate tags (case-insensitively), preserving first-seen order. */
export function dedupeTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const tag of tags) {
    const key = tag.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(tag);
    }
  }
  return result;
}
