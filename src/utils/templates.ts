export interface NoteTemplate {
  id: string;
  label: string;
  hint: string;
  tags: string[];
  /** Tiptap HTML. `{{date}}` is replaced with today's date on use. */
  html: string;
}

export const NOTE_TEMPLATES: NoteTemplate[] = [
  {
    id: 'blank',
    label: 'Blank note',
    hint: 'Start from scratch',
    tags: [],
    html: '',
  },
  {
    id: 'meeting',
    label: 'Meeting notes',
    hint: 'Attendees, decisions, actions',
    tags: ['meeting'],
    html: '<h2>{{date}} — Meeting</h2><p><strong>Attendees:</strong> </p><h3>Agenda</h3><ul><li></li></ul><h3>Decisions</h3><ul><li></li></ul><h3>Action items</h3><ul><li>[ ] </li></ul>',
  },
  {
    id: 'daily',
    label: 'Daily log',
    hint: 'Focus, progress, tomorrow',
    tags: ['daily'],
    html: '<h2>{{date}} — Daily log</h2><h3>Focus today</h3><ul><li></li></ul><h3>Progress</h3><ul><li></li></ul><h3>Tomorrow</h3><ul><li></li></ul>',
  },
  {
    id: 'reading',
    label: 'Reading notes',
    hint: 'Source, ideas, quotes',
    tags: ['reading'],
    html: '<h2>{{date}} — Reading notes</h2><p><strong>Source:</strong> </p><h3>Key ideas</h3><ul><li></li></ul><h3>Quotes</h3><blockquote><p></p></blockquote><h3>Actions</h3><ul><li>[ ] </li></ul>',
  },
];

/** Replace `{{date}}` with a locale date like "Aug 20, 2026". */
export function applyTemplateVariables(html: string, now: number = Date.now()): string {
  const date = new Date(now).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  return html.replaceAll('{{date}}', date);
}
