/**
 * HTML -> plain text / Markdown converters for the copy actions.
 *
 * Note content is stored as Tiptap HTML. The card "copy" menu offers:
 * - plain text (readable, no markup)
 * - Markdown (headings, bold/italic, lists, quotes, code preserved)
 *
 * Works in the browser via DOMParser and falls back to regex stripping
 * in non-DOM environments (tests, workers).
 */

/** Readable plain text: blocks separated by newlines, list items bulleted. */
export function htmlToPlainText(html: string): string {
  if (!html) return '';
  if (typeof DOMParser === 'undefined') {
    return fallbackToText(html);
  }
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const out: string[] = [];
  doc.body.childNodes.forEach((node) => {
    const text = renderPlain(node, 0).trimEnd();
    if (text.trim()) out.push(text.trim());
  });
  return out
    .join('\n\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Markdown version of the stored HTML. */
export function htmlToMarkdown(html: string): string {
  if (!html) return '';
  if (typeof DOMParser === 'undefined') {
    return fallbackToMarkdown(html);
  }
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const out: string[] = [];
  doc.body.childNodes.forEach((node) => {
    const text = renderMarkdown(node, 0).trimEnd();
    if (text.trim()) out.push(text.trim());
  });
  return out
    .join('\n\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Strip text-color styling from pasted HTML so content copied from
 * external sources (often `color: #000` / `color: black`) stays readable
 * in dark mode. Background highlight colors from the editor's own
 * <mark> are preserved; only inline `color` declarations and legacy
 * <font color> attributes are removed.
 */
export function sanitizePastedHtml(html: string): string {
  if (!html) return html;
  // Fast path for environments without DOM (tests): regex-strip color decls.
  if (typeof DOMParser === 'undefined') {
    return html
      .replace(/\scolor\s*=\s*(['"]).*?\1/gi, '')
      .replace(/(<font[^>]*)\sstyle\s*=\s*(['"])[^'"]*\2/gi, '$1')
      .replace(/color\s*:\s*[^;}"']+;?/gi, '');
  }
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const els = doc.body.querySelectorAll('*');
  els.forEach((el) => {
    const htmlEl = el as HTMLElement;
    // Legacy <font color="..."> -> drop the attribute, keep the text.
    if (htmlEl.hasAttribute('color')) htmlEl.removeAttribute('color');
    const style = htmlEl.getAttribute('style');
    if (style && /color\s*:/i.test(style)) {
      // Remove only the color declaration, keep the rest (e.g. background).
      const cleaned = style
        .split(';')
        .map((part) => part.trim())
        .filter((part) => part && !/^color\s*:/i.test(part))
        .join('; ');
      if (cleaned) htmlEl.setAttribute('style', cleaned);
      else htmlEl.removeAttribute('style');
    }
    // Unwrap <font> tags that no longer carry meaning.
    if (htmlEl.tagName === 'FONT' && !htmlEl.attributes.length) {
      const parent = htmlEl.parentNode;
      if (parent) {
        while (htmlEl.firstChild) parent.insertBefore(htmlEl.firstChild, htmlEl);
        parent.removeChild(htmlEl);
      }
    }
  });
  return doc.body.innerHTML;
}

// --- internals ----------------------------------------------------------

function fallbackToMarkdown(html: string): string {
  let s = html;
  // Code blocks first (may contain markup-like text).
  s = s.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (_, inner: string) => {
    const code = String(inner)
      .replace(/<code[^>]*>/gi, '')
      .replace(/<\/code>/gi, '')
      .replace(/<[^>]*>/g, '');
    return `\n\`\`\`\n${decodeEntities(code).trim()}\n\`\`\`\n`;
  });
  s = s.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, t: string) => `\n# ${t}\n`);
  s = s.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, t: string) => `\n## ${t}\n`);
  s = s.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, t: string) => `\n### ${t}\n`);
  s = s.replace(/<h[4-6][^>]*>([\s\S]*?)<\/h[4-6]>/gi, (_, t: string) => `\n#### ${t}\n`);
  s = s.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/(strong|b)>/gi, '**$2**');
  s = s.replace(/<(em|i)[^>]*>([\s\S]*?)<\/(em|i)>/gi, '*$2*');
  s = s.replace(/<(s|strike|del)[^>]*>([\s\S]*?)<\/(s|strike|del)>/gi, '~~$2~~');
  s = s.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`');
  s = s.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, t: string) =>
    String(t)
      .split(/\n/)
      .map((line) => `> ${line}`)
      .join('\n'),
  );
  s = s.replace(/<a[^>]*href=(['"])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi, (_, __: string, href: string, text: string) =>
    text && text !== href ? `[${text}](${href})` : href || text,
  );
  s = s.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '\n- $1');
  s = s.replace(/<\/(ul|ol)>/gi, '\n');
  s = s.replace(/<(br|hr)[^>]*>/gi, '\n');
  s = s.replace(/<\/(p|div)>/gi, '\n\n');
  s = s.replace(/<[^>]*>/g, '');
  return decodeEntities(s)
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function fallbackToText(html: string): string {
  return html
    .replace(/<(br|hr)[^>]*>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|ul|ol|blockquote|pre)>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function childPlain(node: Node, depth: number): string {
  let s = '';
  node.childNodes.forEach((child) => {
    s += renderPlain(child, depth);
  });
  return s;
}

function renderPlain(node: Node, depth: number): string {
  if (node.nodeType === 3) return node.textContent ?? '';
  if (node.nodeType !== 1) return '';
  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();
  switch (tag) {
    case 'br':
      return '\n';
    case 'hr':
      return '\n---\n';
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
    case 'p':
    case 'div':
    case 'blockquote':
      return `${childPlain(el, depth).trim()}\n\n`;
    case 'ul':
    case 'ol': {
      let s = '';
      let i = 0;
      el.childNodes.forEach((child) => {
        if (child.nodeType === 1 && (child as HTMLElement).tagName.toLowerCase() === 'li') {
          i += 1;
          const bullet = tag === 'ol' ? `${i}. ` : '- ';
          s += `${'  '.repeat(depth)}${bullet}${childPlain(child, depth + 1).trim()}\n`;
        } else {
          s += renderPlain(child, depth);
        }
      });
      return `${s}\n`;
    }
    case 'li':
      return `${childPlain(el, depth).trim()}\n`;
    case 'pre':
      return `${(el.textContent ?? '').trim()}\n\n`;
    default:
      return childPlain(el, depth);
  }
}

function childMarkdown(node: Node, depth: number): string {
  let s = '';
  node.childNodes.forEach((child) => {
    s += renderMarkdown(child, depth);
  });
  return s;
}

function renderMarkdown(node: Node, depth: number): string {
  if (node.nodeType === 3) return node.textContent ?? '';
  if (node.nodeType !== 1) return '';
  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();
  const inner = () => childMarkdown(el, depth).trim();
  switch (tag) {
    case 'br':
      return '\n';
    case 'hr':
      return '\n---\n';
    case 'h1':
      return `# ${inner()}`;
    case 'h2':
      return `## ${inner()}`;
    case 'h3':
      return `### ${inner()}`;
    case 'h4':
      return `#### ${inner()}`;
    case 'h5':
      return `##### ${inner()}`;
    case 'h6':
      return `###### ${inner()}`;
    case 'p':
    case 'div':
      return inner();
    case 'strong':
    case 'b': {
      const text = inner();
      return text ? `**${text}**` : '';
    }
    case 'em':
    case 'i': {
      const text = inner();
      return text ? `*${text}*` : '';
    }
    case 's':
    case 'strike':
    case 'del': {
      const text = inner();
      return text ? `~~${text}~~` : '';
    }
    case 'code': {
      // Inline code — block-level <pre> is handled separately.
      if (el.parentElement?.tagName.toLowerCase() === 'pre') return el.textContent ?? '';
      const text = (el.textContent ?? '').trim();
      return text ? `\`${text}\`` : '';
    }
    case 'pre': {
      const text = (el.textContent ?? '').replace(/\n+$/g, '');
      return `\`\`\`\n${text}\n\`\`\``;
    }
    case 'blockquote': {
      const text = inner()
        .split('\n')
        .map((line) => (line.trim() ? `> ${line.trim()}` : '>'))
        .join('\n');
      return text;
    }
    case 'ul':
    case 'ol': {
      let s = '';
      let i = 0;
      el.childNodes.forEach((child) => {
        if (child.nodeType === 1 && (child as HTMLElement).tagName.toLowerCase() === 'li') {
          i += 1;
          const bullet = tag === 'ol' ? `${i}. ` : '- ';
          const item = childMarkdown(child, depth + 1).trim();
          s += `${'  '.repeat(depth)}${bullet}${item}\n`;
        } else {
          const extra = renderMarkdown(child, depth).trim();
          if (extra) s += `${extra}\n`;
        }
      });
      return s.trimEnd();
    }
    case 'li':
      return childMarkdown(el, depth).trim();
    case 'a': {
      const text = inner() || el.getAttribute('href') || '';
      const href = el.getAttribute('href');
      return href && text !== href ? `[${text}](${href})` : text;
    }
    case 'mark':
    case 'u':
    case 'span':
    case 'font':
      return childMarkdown(el, depth);
    default:
      return childMarkdown(el, depth);
  }
}
