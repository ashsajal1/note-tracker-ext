import { describe, expect, it } from 'vitest';
import { htmlToMarkdown, htmlToPlainText, sanitizePastedHtml } from '@/utils/clipboard';

describe('htmlToPlainText', () => {
  it('strips tags and keeps text', () => {
    expect(htmlToPlainText('<p>hello <strong>world</strong></p>')).toBe('hello world');
  });

  it('handles empty input', () => {
    expect(htmlToPlainText('')).toBe('');
  });

  it('separates list items', () => {
    const text = htmlToPlainText('<ul><li>one</li><li>two</li></ul>');
    expect(text).toContain('one');
    expect(text).toContain('two');
  });
});

describe('htmlToMarkdown', () => {
  it('handles empty input', () => {
    expect(htmlToMarkdown('')).toBe('');
  });

  it('converts headings', () => {
    expect(htmlToMarkdown('<h1>Title</h1>')).toBe('# Title');
    expect(htmlToMarkdown('<h2>Sub</h2>')).toBe('## Sub');
  });

  it('converts bold and italic', () => {
    expect(htmlToMarkdown('<p><strong>bold</strong> and <em>italic</em></p>')).toBe(
      '**bold** and *italic*',
    );
  });

  it('converts strikethrough', () => {
    expect(htmlToMarkdown('<p><s>gone</s></p>')).toBe('~~gone~~');
  });

  it('converts bullet lists', () => {
    const md = htmlToMarkdown('<ul><li>one</li><li>two</li></ul>');
    expect(md).toContain('- one');
    expect(md).toContain('- two');
  });

  it('converts ordered lists', () => {
    const md = htmlToMarkdown('<ol><li>first</li><li>second</li></ol>');
    expect(md).toContain('first');
    expect(md).toContain('second');
  });

  it('converts blockquote and code', () => {
    expect(htmlToMarkdown('<blockquote>quoted</blockquote>')).toContain('> quoted');
    expect(htmlToMarkdown('<pre><code>const x = 1;</code></pre>')).toContain('const x = 1;');
    expect(htmlToMarkdown('<p>use <code>x</code> here</p>')).toContain('`x`');
  });

  it('converts links', () => {
    expect(htmlToMarkdown('<p><a href="https://example.com">Example</a></p>')).toBe(
      '[Example](https://example.com)',
    );
  });
});

describe('sanitizePastedHtml', () => {
  it('removes inline text color but keeps the text', () => {
    const out = sanitizePastedHtml('<p><span style="color: #000">hello</span></p>');
    expect(out).toContain('hello');
    expect(out).not.toMatch(/color\s*:/i);
  });

  it('removes named black color declarations', () => {
    const out = sanitizePastedHtml('<p style="color: black; font-weight: bold">hi</p>');
    expect(out).toContain('hi');
    expect(out).not.toMatch(/color\s*:/i);
    // Non-color styles are preserved.
    expect(out).toMatch(/font-weight/);
  });

  it('leaves clean html untouched', () => {
    const html = '<p>plain</p>';
    expect(sanitizePastedHtml(html)).toBe(html);
  });

  it('handles empty input', () => {
    expect(sanitizePastedHtml('')).toBe('');
  });
});
