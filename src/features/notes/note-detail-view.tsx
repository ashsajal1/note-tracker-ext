import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNotesStore } from '@/stores/notes.store';
import { useUiStore } from '@/stores/ui.store';
import { formatFull, previewText } from '@/utils/format';
import { CopyNoteMenu } from './copy-note-menu';

export function NoteDetailView() {
  const detailNoteId = useUiStore((s) => s.detailNoteId);
  const closeDetail = useUiStore((s) => s.closeDetail);
  const openEditor = useUiStore((s) => s.openEditor);
  const requestDeleteNote = useUiStore((s) => s.requestDeleteNote);

  const notes = useNotesStore((s) => s.notes);

  const note = useMemo(
    () => (detailNoteId ? (notes.find((n) => n.id === detailNoteId) ?? null) : null),
    [detailNoteId, notes],
  );

  if (!note) return null;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={closeDetail}
          aria-label="Back to notes"
          title="Back"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="ml-auto flex items-center gap-1">
          <CopyNoteMenu contentHtml={note.content} />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              closeDetail();
              openEditor(note.id);
            }}
            aria-label="Edit note"
            title="Edit"
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              closeDetail();
              requestDeleteNote(note.id);
            }}
            aria-label="Delete note"
            title="Delete"
            className="hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        <div
          className="note-card-content text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: note.content || '' }}
        />
        {!previewText(note.content) && (
          <p className="italic text-muted-foreground">Empty note</p>
        )}
      </main>

      {/* Footer */}
      <footer className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {note.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
        <div className="ml-auto flex gap-3 text-[11px] text-muted-foreground">
          <time dateTime={note.createdAt} title={formatFull(note.createdAt)}>
            Created {formatFull(note.createdAt)}
          </time>
          <time dateTime={note.updatedAt} title={formatFull(note.updatedAt)}>
            Updated {formatFull(note.updatedAt)}
          </time>
        </div>
      </footer>
    </div>
  );
}
