import type { Note } from '@/types/note';

/** Strip HTML tags and decode entities, returning plain text. */
export function stripHtml(html: string): string {
  if (typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent ?? '';
  }
  // Fallback for non-browser environments (e.g. tests)
  return html.replace(/<[^>]*>/g, '');
}

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

/** First line(s) of note content for card previews. Strips HTML. */
export function previewText(content: string, maxChars = 480): string {
  const plain = stripHtml(content).trim();
  return plain.length > maxChars ? `${plain.slice(0, maxChars).trimEnd()}…` : plain;
}

/** Description snippet for a note about to be deleted. */
export function noteDeleteDescription(note: Note): string {
  const preview = note.content.trim().replace(/\s+/g, ' ').slice(0, 80);
  return preview ? `“${preview}${note.content.length > 80 ? '…' : ''}”` : 'This note is empty.';
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
