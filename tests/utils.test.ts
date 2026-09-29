import { describe, expect, it } from 'vitest';
import { countTags, formatFull, formatRelative, previewText } from '@/utils/format';
import { dedupeTags, normalizeTag, parseTagInput } from '@/utils/tags';

describe('normalizeTag', () => {
  it('lowercases, trims and strips leading hashes', () => {
    expect(normalizeTag('  #Work ')).toBe('work');
    expect(normalizeTag('##deep')).toBe('deep');
  });

  it('collapses whitespace into dashes and caps length', () => {
    expect(normalizeTag('web   dev')).toBe('web-dev');
    expect(normalizeTag('x'.repeat(50))).toHaveLength(32);
  });

  it('returns empty for unusable input', () => {
    expect(normalizeTag('   ')).toBe('');
    expect(normalizeTag('#')).toBe('');
  });
});

describe('parseTagInput', () => {
  it('splits on commas/newlines and dedupes', () => {
    expect(parseTagInput('work, urgent\nWORK')).toEqual(['work', 'urgent']);
    expect(parseTagInput(', ,')).toEqual([]);
  });
});

describe('dedupeTags', () => {
  it('preserves first-seen order case-insensitively', () => {
    expect(dedupeTags(['b', 'A', 'a', 'c'])).toEqual(['b', 'A', 'c']);
  });
});

describe('formatRelative', () => {
  const now = Date.parse('2026-08-20T12:00:00Z');

  it('formats buckets correctly', () => {
    expect(formatRelative(new Date(now - 10_000).toISOString(), now)).toBe('just now');
    expect(formatRelative(new Date(now - 5 * 60_000).toISOString(), now)).toBe('5m ago');
    expect(formatRelative(new Date(now - 3 * 3_600_000).toISOString(), now)).toBe('3h ago');
    expect(formatRelative(new Date(now - 2 * 86_400_000).toISOString(), now)).toBe('2d ago');
    expect(formatRelative(new Date(now - 30 * 86_400_000).toISOString(), now)).toBe('Jul 21');
    expect(formatRelative(new Date(now - 400 * 86_400_000).toISOString(), now)).toMatch(/\d{4}/);
  });

  it('returns empty string for invalid dates', () => {
    expect(formatRelative('not-a-date', now)).toBe('');
  });
});

describe('previewText', () => {
  it('truncates long content with an ellipsis and trims whitespace', () => {
    expect(previewText('  hi  ')).toBe('hi');
    expect(previewText('a'.repeat(400))).toBe('a'.repeat(400));
    expect(previewText('a'.repeat(500))).toBe(`${'a'.repeat(480)}…`);
  });

  it('strips HTML tags from content', () => {
    expect(previewText('<p>hello</p>')).toBe('hello');
    expect(previewText('<p><strong>bold</strong> text</p>')).toBe('bold text');
  });

  it('handles empty HTML content', () => {
    expect(previewText('<p></p>')).toBe('');
    expect(previewText('<div><br/></div>')).toBe('');
  });

  it('truncates HTML content after stripping tags', () => {
    const html = `<p>${'a'.repeat(500)}</p>`;
    expect(previewText(html)).toBe(`${'a'.repeat(480)}…`);
  });
});

describe('countTags', () => {
  it('counts usage and sorts by count desc then name', () => {
    const counts = countTags([
      { id: '1', content: '', tags: ['z', 'a'], createdAt: '', updatedAt: '', deletedAt: null, pinned: false },
      { id: '2', content: '', tags: ['a'], createdAt: '', updatedAt: '', deletedAt: null, pinned: false },
    ]);
    expect(counts).toEqual([
      { tag: 'a', count: 2 },
      { tag: 'z', count: 1 },
    ]);
  });
});

describe('formatFull', () => {
  it('returns a locale string for valid dates', () => {
    expect(formatFull('2026-01-15T10:30:00Z')).toBeTruthy();
    expect(typeof formatFull('2026-01-15T10:30:00Z')).toBe('string');
  });

  it('returns empty string for invalid dates', () => {
    expect(formatFull('not-a-date')).toBe('');
  });
});
