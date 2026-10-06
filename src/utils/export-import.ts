import type { Note } from '@/types/note';
import { htmlToMarkdown } from '@/utils/clipboard';
import { dedupeTags } from '@/utils/tags';

export const EXPORT_FORMAT_VERSION = 1;

export interface ExportPayload {
  app: 'note-tracker';
  version: number;
  exportedAt: string;
  notes: Note[];
}

export function buildExportPayload(notes: Note[]): ExportPayload {
  return {
    app: 'note-tracker',
    version: EXPORT_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    notes,
  };
}

/**
 * Render active notes as a single readable Markdown document:
 * `# Note Tracker Export` + one `## <date>` section per note with
 * its tags and converted body. Trashed notes are skipped (the JSON
 * backup covers full restores).
 */
export function buildMarkdownExport(notes: Note[]): string {
  const active = notes
    .filter((n) => n.deletedAt == null)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const sections = active.map((note) => {
    const date = new Date(note.createdAt).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    const header = [`## ${date}${note.pinned ? ' (pinned)' : ''}`];
    if (note.tags.length > 0) header.push(note.tags.map((t) => `#${t}`).join(' '));
    const body = htmlToMarkdown(note.content).trim();
    if (body) header.push(body);
    return header.join('\n\n');
  });
  return [`# Note Tracker Export`, ...sections].join('\n\n---\n\n') + '\n';
}

export interface ImportResult {
  notes: Note[];
  /** entries dropped because they were malformed */
  skipped: number;
}

/**
 * Validate and sanitize an unknown parsed JSON value into a safe list of
 * notes. Malformed entries are skipped and counted; valid entries are
 * normalized (tags coerced + deduped, invalid dates replaced).
 */
export function parseImportPayload(data: unknown, now = Date.now()): ImportResult {
  const container = asRecord(data);
  const rawNotes = Array.isArray(container?.notes)
    ? container.notes
    : Array.isArray(data)
      ? data
      : null;
  if (!rawNotes) {
    throw new Error('Invalid file: expected { "notes": [...] }');
  }

  let skipped = 0;
  const notes: Note[] = [];
  for (const raw of rawNotes) {
    const note = sanitizeNote(raw, now);
    if (note) notes.push(note);
    else skipped += 1;
  }
  return { notes, skipped };
}

function sanitizeNote(raw: unknown, now: number): Note | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  if (typeof rec.id !== 'string' || rec.id.length === 0) return null;
  if (typeof rec.content !== 'string') return null;

  const tags = Array.isArray(rec.tags)
    ? dedupeTags(rec.tags.filter((t): t is string => typeof t === 'string'))
    : [];

  const fallbackIso = new Date(now).toISOString();
  return {
    id: rec.id,
    content: rec.content,
    tags,
    createdAt: isoOr(rec.createdAt, fallbackIso),
    updatedAt: isoOr(rec.updatedAt, fallbackIso),
    deletedAt:
      rec.deletedAt == null
        ? null
        : typeof rec.deletedAt === 'string' && !Number.isNaN(Date.parse(rec.deletedAt))
          ? rec.deletedAt
          : null,
    pinned: rec.pinned === true,
  };
}

function isoOr(value: unknown, fallback: string): string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value)) ? value : fallback;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}
