import { Check, Copy, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Note } from '@/types/note';
import { formatFull, formatRelative, previewText } from '@/utils/format';

interface NoteCardProps {
  note: Note;
  activeTags: string[];
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleTag: (tag: string) => void;
}

export function NoteCard({ note, activeTags, onView, onEdit, onDelete, onToggleTag }: NoteCardProps) {
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(copyTimer.current), []);

  const copyNote = async () => {
    try {
      await navigator.clipboard.writeText(note.content);
      setCopied(true);
      window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(false), 1500);
      toast.success('Note copied to clipboard');
    } catch {
      toast.error('Could not access the clipboard');
    }
  };

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
        <div className="flex flex-wrap gap-1 px-4 pt-1">
          {note.tags.map((tag) => {
            const active = activeTags.includes(tag);
            return (
              <Badge
                key={tag}
                variant={active ? 'active' : 'interactive'}
                onClick={() => onToggleTag(tag)}
                aria-pressed={active}
                title={`Filter by #${tag}`}
              >
                #{tag}
              </Badge>
            );
          })}
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
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={copyNote}
            aria-label="Copy note content"
            title="Copy content"
          >
            {copied ? (
              <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </Button>
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
