import { describe, expect, it } from 'vitest';
import {
  buildExportPayload,
  buildMarkdownExport,
  parseImportPayload,
} from '@/utils/export-import';
import type { Note } from '@/types/note';

const NOW = Date.parse('2026-08-20T00:00:00Z');

describe('buildExportPayload', () => {
  it('wraps notes in a versioned portable payload', () => {
    const note: Note = {
      id: 'a',
      content: 'hi',
      tags: ['x'],
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      deletedAt: null,
      pinned: false,
    };
    const payload = buildExportPayload([note]);
    expect(payload.app).toBe('note-tracker');
    expect(payload.version).toBe(1);
    expect(payload.exportedAt).toBeTruthy();
    expect(payload.notes).toEqual([note]);
  });
});

describe('parseImportPayload', () => {
  const base = {
    id: 'n1',
    content: 'hello',
    tags: ['work'],
    createdAt: '2026-05-01T10:00:00Z',
    updatedAt: '2026-05-02T10:00:00Z',
    deletedAt: null,
    pinned: false,
  };

  it('accepts the export format', () => {
    const result = parseImportPayload(
      { app: 'note-tracker', version: 1, exportedAt: 'now', notes: [base] },
      NOW,
    );
    expect(result.notes).toHaveLength(1);
    expect(result.skipped).toBe(0);
    expect(result.notes[0]).toEqual(base);
  });

  it('accepts a bare array of notes', () => {
    const result = parseImportPayload([base], NOW);
    expect(result.notes).toHaveLength(1);
  });

  it('skips malformed entries and counts them', () => {
    const result = parseImportPayload(
      [
        base,
        null,
        42,
        { content: 'no id' },
        { id: '', content: 'empty id' },
        { id: 'ok' }, // missing content
      ],
      NOW,
    );
    expect(result.notes).toHaveLength(1);
    expect(result.skipped).toBe(5);
  });

  it('sanitizes tags: drops non-strings, dedupes, keeps order', () => {
    const result = parseImportPayload([{ ...base, tags: ['Work', 5, 'work', 'life'] }], NOW);
    expect(result.notes[0]?.tags).toEqual(['Work', 'life']);
  });

  it('replaces invalid dates with a fallback timestamp', () => {
    const result = parseImportPayload([{ ...base, createdAt: 'not-a-date', updatedAt: 123 }], NOW);
    const fallback = new Date(NOW).toISOString();
    expect(result.notes[0]?.createdAt).toBe(fallback);
    expect(result.notes[0]?.updatedAt).toBe(fallback);
  });

  it('throws a clear error for wrong shapes', () => {
    expect(() => parseImportPayload({ foo: 'bar' })).toThrow(/notes/);
    expect(() => parseImportPayload('nope')).toThrow(/notes/);
    expect(() => parseImportPayload(null)).toThrow();
  });

  it('defaults deletedAt/pinned for legacy backups', () => {
    const result = parseImportPayload([{ id: 'x', content: 'y' }], NOW);
    expect(result.notes[0]).toMatchObject({ deletedAt: null, pinned: false });
  });

  it('preserves valid deletedAt and pinned flags', () => {
    const result = parseImportPayload(
      [{ ...base, deletedAt: '2026-08-01T00:00:00Z', pinned: true }],
      NOW,
    );
    expect(result.notes[0]).toMatchObject({
      deletedAt: '2026-08-01T00:00:00Z',
      pinned: true,
    });
  });

  it('drops invalid deletedAt values', () => {
    const result = parseImportPayload([{ ...base, deletedAt: 'yesterday' }], NOW);
    expect(result.notes[0]?.deletedAt).toBeNull();
  });
});

describe('buildMarkdownExport', () => {
  const md = (partial: Partial<Note> & { id: string }): Note => ({
    content: '',
    tags: [],
    createdAt: '2026-08-20T10:00:00Z',
    updatedAt: '2026-08-20T10:00:00Z',
    deletedAt: null,
    pinned: false,
    ...partial,
  });

  it('renders a titled document with date sections, tags, and body', () => {
    const doc = buildMarkdownExport([
      md({ id: '1', content: '<p>Hello <strong>world</strong></p>', tags: ['a', 'b'] }),
    ]);
    expect(doc).toContain('# Note Tracker Export');
    expect(doc).toContain('## Aug 20, 2026');
    expect(doc).toContain('#a #b');
    expect(doc).toContain('Hello **world**');
  });

  it('skips trashed notes and marks pinned ones', () => {
    const doc = buildMarkdownExport([
      md({ id: '1', content: '<p>gone</p>', deletedAt: '2026-08-19T00:00:00Z' }),
      md({ id: '2', content: '<p>kept</p>', pinned: true }),
    ]);
    expect(doc).not.toContain('gone');
    expect(doc).toContain('kept');
    expect(doc).toContain('(pinned)');
  });

  it('ends with a newline and handles empty notes', () => {
    expect(buildMarkdownExport([])).toBe('# Note Tracker Export\n');
  });
});
