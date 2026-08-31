import { describe, expect, it } from 'vitest';
import { stripHtml } from '@/utils/format';

describe('stripHtml', () => {
  it('strips simple HTML tags', () => {
    expect(stripHtml('<p>hello</p>')).toBe('hello');
  });

  it('strips nested tags', () => {
    expect(stripHtml('<p><strong>bold</strong> text</p>')).toBe('bold text');
  });

  it('strips self-closing tags', () => {
    expect(stripHtml('line<br/>break')).toBe('linebreak');
    expect(stripHtml('before<hr/>after')).toBe('beforeafter');
  });

  it('handles empty string', () => {
    expect(stripHtml('')).toBe('');
  });

  it('handles plain text without tags', () => {
    expect(stripHtml('just plain text')).toBe('just plain text');
  });

  it('strips highlight marks', () => {
    expect(stripHtml('<p>see <mark>highlighted</mark> text</p>')).toBe('see highlighted text');
  });

  it('strips heading tags', () => {
    expect(stripHtml('<h1>Title</h1><p>Body</p>')).toBe('TitleBody');
  });

  it('strips list tags', () => {
    expect(stripHtml('<ul><li>one</li><li>two</li></ul>')).toBe('onetwo');
  });

  it('strips code blocks', () => {
    expect(stripHtml('<pre><code>const x = 1;</code></pre>')).toBe('const x = 1;');
  });

  it('handles deeply nested content', () => {
    expect(stripHtml('<div><p><em><strong>deep</strong></em></p></div>')).toBe('deep');
  });
});
