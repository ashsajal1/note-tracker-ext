import { describe, expect, it } from 'vitest';
import { countTags, formatRelative, previewText } from '@/utils/format';
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
    expect(previewText('a'.repeat(400))).toMatch(/^a{320}…$/);
  });
});

describe('countTags', () => {
  it('counts usage and sorts by count desc then name', () => {
    const counts = countTags([
      { id: '1', content: '', tags: ['z', 'a'], createdAt: '', updatedAt: '' },
      { id: '2', content: '', tags: ['a'], createdAt: '', updatedAt: '' },
    ]);
    expect(counts).toEqual([
      { tag: 'a', count: 2 },
      { tag: 'z', count: 1 },
    ]);
  });
});
