import type { Note } from '@/types/note';

/** Compact relative time: "just now", "5m ago", "3h ago", "2d ago", else a date. */
export function formatRelative(iso: string, now: number = Date.now()): string {
  const time = Date.parse(iso);
  if (Number.isNaN(time)) return '';

  const diff = now - time;
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return 'just now';
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`;
  return new Date(time).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: new Date(time).getFullYear() === new Date(now).getFullYear() ? undefined : 'numeric',
  });
}

/** Full locale timestamp for tooltips. */
export function formatFull(iso: string): string {
  const time = Date.parse(iso);
  if (Number.isNaN(time)) return '';
  return new Date(time).toLocaleString();
}

/** First line(s) of note content for card previews. */
export function previewText(content: string, maxChars = 320): string {
  const trimmed = content.trim();
  return trimmed.length > maxChars ? `${trimmed.slice(0, maxChars).trimEnd()}…` : trimmed;
}

/** Aggregate tag -> usage count across notes, sorted by count desc then name. */
export function countTags(notes: Note[]): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const note of notes) {
    for (const tag of note.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}
