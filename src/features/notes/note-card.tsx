import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Note } from '@/types/note';
import { formatFull, formatRelative, previewText } from '@/utils/format';
import { CopyNoteMenu } from './copy-note-menu';

/** Max tags shown inline before collapsing the rest into a "+N" badge. */
const MAX_VISIBLE_TAGS = 3;

interface NoteCardProps {
  note: Note;
  activeTags: string[];
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleTag: (tag: string) => void;
}

export function NoteCard({ note, activeTags, onView, onEdit, onDelete, onToggleTag }: NoteCardProps) {
  const visibleTags = note.tags.slice(0, MAX_VISIBLE_TAGS);
  const hiddenTags = note.tags.slice(MAX_VISIBLE_TAGS);

  return (
    <article
      className="group flex flex-col rounded-lg border border-border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-ring"
      aria-label={`Note from ${formatRelative(note.createdAt)}`}
    >
      {/* Clickable preview opens the detail view */}
      <button
        type="button"
        onClick={onView}
        className="flex-1 p-4 pb-2 text-left focus-visible:outline-none cursor-pointer"
        title="Click to view"
      >
        <div
          className="note-card-content line-clamp-8 text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: note.content || '' }}
        />
        {!previewText(note.content) && (
          <span className="italic text-muted-foreground">Empty note</span>
        )}
      </button>

      {note.tags.length > 0 && (
        <div className="flex items-center gap-1 overflow-hidden px-4 pt-1" aria-label="Note tags">
          {visibleTags.map((tag) => {
            const active = activeTags.includes(tag);
            return (
              <Badge
                key={tag}
                variant={active ? 'active' : 'interactive'}
                onClick={() => onToggleTag(tag)}
                aria-pressed={active}
                title={`Filter by #${tag}`}
                className="max-w-[96px] shrink-0 truncate"
              >
                #{tag}
              </Badge>
            );
          })}
          {hiddenTags.length > 0 && (
            <Badge
              variant="secondary"
              onClick={onView}
              title={`More tags: ${hiddenTags.map((t) => `#${t}`).join(', ')} (click to view)`}
              className="shrink-0 cursor-pointer"
            >
              +{hiddenTags.length}
            </Badge>
          )}
        </div>
      )}

      <footer className="mt-auto flex items-center justify-between gap-2 px-4 py-2.5">
        <time
          dateTime={note.updatedAt}
          title={`Created ${formatFull(note.createdAt)}\nUpdated ${formatFull(note.updatedAt)}`}
          className="truncate text-[11px] text-muted-foreground"
        >
          Updated {formatRelative(note.updatedAt)}
        </time>
        <div className="flex items-center gap-0.5 opacity-70 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <CopyNoteMenu contentHtml={note.content} />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onEdit}
            aria-label="Edit note"
            title="Edit"
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onDelete}
            aria-label="Delete note"
            title="Delete"
            className="hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </footer>
    </article>
  );
}
