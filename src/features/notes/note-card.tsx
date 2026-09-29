import { Pin, Pencil, Trash2, Undo2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useHorizontalScroll } from '@/hooks/use-horizontal-scroll';
import type { Note } from '@/types/note';
import { cn } from '@/utils/cn';
import { formatFull, formatRelative, previewText } from '@/utils/format';
import { CopyNoteMenu } from './copy-note-menu';

interface NoteCardProps {
  note: Note;
  activeTags: string[];
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleTag: (tag: string) => void;
  /** trash mode swaps edit/copy for restore + delete-forever */
  mode?: 'active' | 'trash';
  onRestore?: () => void;
  onPurge?: () => void;
  onTogglePin?: () => void;
}

export function NoteCard({
  note,
  activeTags,
  onView,
  onEdit,
  onDelete,
  onToggleTag,
  mode = 'active',
  onRestore,
  onPurge,
  onTogglePin,
}: NoteCardProps) {
  const { ref: tagsScrollRef, atStart, atEnd } = useHorizontalScroll<HTMLDivElement>();
  const trashed = mode === 'trash';

  return (
    <article
      className="group flex h-full flex-col rounded-lg border border-border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-ring"
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
        <div className="relative px-4 pt-1">
          <div
            ref={tagsScrollRef}
            className="tags-scroll flex cursor-grab items-center gap-1 overflow-x-auto select-none active:cursor-grabbing"
            aria-label="Note tags"
          >
            {note.tags.map((tag) => {
              const active = activeTags.includes(tag);
              return trashed ? (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="max-w-[96px] shrink-0 truncate"
                >
                  #{tag}
                </Badge>
              ) : (
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
          </div>
          {!atStart && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-4 w-6 bg-gradient-to-r from-card to-transparent"
            />
          )}
          {!atEnd && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-4 w-6 bg-gradient-to-l from-card to-transparent"
            />
          )}
        </div>
      )}

      <footer className="mt-auto flex items-center justify-between gap-2 px-4 py-2.5">
        {trashed && note.deletedAt ? (
          <time
            dateTime={note.deletedAt}
            title={`Deleted ${formatFull(note.deletedAt)}`}
            className="truncate text-[11px] text-muted-foreground"
          >
            Deleted {formatRelative(note.deletedAt)}
          </time>
        ) : (
          <time
            dateTime={note.updatedAt}
            title={`Created ${formatFull(note.createdAt)}\nUpdated ${formatFull(note.updatedAt)}`}
            className="truncate text-[11px] text-muted-foreground"
          >
            Updated {formatRelative(note.updatedAt)}
          </time>
        )}
        <div className="flex items-center gap-0.5 opacity-70 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          {trashed ? (
            <>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onRestore}
                aria-label="Restore note"
                title="Restore"
              >
                <Undo2 className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onPurge}
                aria-label="Delete forever"
                title="Delete forever"
                className="hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onTogglePin}
                aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
                aria-pressed={note.pinned}
                title={note.pinned ? 'Unpin' : 'Pin to top'}
              >
                <Pin className={cn('size-3.5', note.pinned && 'fill-current')} />
              </Button>
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
                title="Move to trash"
                className="hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </>
          )}
        </div>
      </footer>
    </article>
  );
}
