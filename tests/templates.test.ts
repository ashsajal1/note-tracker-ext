import { describe, expect, it } from 'vitest';
import { NOTE_TEMPLATES, applyTemplateVariables } from '@/utils/templates';

describe('NOTE_TEMPLATES', () => {
  it('has unique ids and labels', () => {
    const ids = NOTE_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain('blank');
  });

  it('blank template seeds nothing', () => {
    const blank = NOTE_TEMPLATES.find((t) => t.id === 'blank')!;
    expect(blank.html).toBe('');
    expect(blank.tags).toEqual([]);
  });
});

describe('applyTemplateVariables', () => {
  it('replaces {{date}} with a locale date', () => {
    const out = applyTemplateVariables('<h2>{{date}}</h2>', Date.parse('2026-08-20T12:00:00Z'));
    expect(out).toContain('Aug 20, 2026');
    expect(out).not.toContain('{{date}}');
  });

  it('leaves html without placeholders untouched', () => {
    expect(applyTemplateVariables('<p>hi</p>')).toBe('<p>hi</p>');
  });
});
