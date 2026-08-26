import { describe, expect, it } from 'vitest';
import { buildExportPayload, parseImportPayload } from '@/utils/export-import';
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
});
