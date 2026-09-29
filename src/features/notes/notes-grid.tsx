import { NotebookPen, SearchX, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Note } from '@/types/note';
import { NoteCard } from './note-card';

interface NotesGridProps {
  notes: Note[];
  allCount: number;
  loading: boolean;
  hasFilters: boolean;
  onClearFilters: () => void;
  onCreate: () => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleTag: (tag: string) => void;
  activeTags: string[];
  mode?: 'active' | 'trash';
  onRestore?: (id: string) => void;
  onPurge?: (id: string) => void;
  onEmptyTrash?: () => void;
}

export function NotesGrid({
  notes,
  allCount,
  loading,
  hasFilters,
  onClearFilters,
  onCreate,
  onView,
  onEdit,
  onDelete,
  onToggleTag,
  activeTags,
  mode = 'active',
  onRestore,
  onPurge,
  onEmptyTrash,
}: NotesGridProps) {
  if (loading) return <GridSkeleton />;

  if (mode === 'trash') {
    if (notes.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <Trash2 className="size-6 text-muted-foreground" aria-hidden />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Trash is empty</h2>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground">
              Deleted notes stay here for 30 days before being removed forever.
            </p>
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground tabular-nums">
            {notes.length} {notes.length === 1 ? 'note' : 'notes'} in trash
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
            onClick={onEmptyTrash}
          >
            Empty trash
          </Button>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-3">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              activeTags={activeTags}
              onView={() => onView(note.id)}
              onEdit={() => onEdit(note.id)}
              onDelete={() => onDelete(note.id)}
              onToggleTag={onToggleTag}
              mode="trash"
              onRestore={() => onRestore?.(note.id)}
              onPurge={() => onPurge?.(note.id)}
            />
          ))}
        </div>
      </div>
    );
  }

  if (allCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <NotebookPen className="size-6 text-muted-foreground" aria-hidden />
        </div>
        <div>
          <h2 className="text-sm font-semibold">No notes yet</h2>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground">
            Create your first note — everything is stored locally in your browser.
          </p>
        </div>
        <Button size="sm" onClick={onCreate}>
          Create your first note
        </Button>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <SearchX className="size-6 text-muted-foreground" aria-hidden />
        </div>
        <div>
          <h2 className="text-sm font-semibold">No matching notes</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Try different keywords or clear the filters.
          </p>
        </div>
        {hasFilters && (
          <Button variant="outline" size="sm" onClick={onClearFilters}>
            Clear filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-3">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          activeTags={activeTags}
          onView={() => onView(note.id)}
          onEdit={() => onEdit(note.id)}
          onDelete={() => onDelete(note.id)}
          onToggleTag={onToggleTag}
        />
      ))}
    </div>
  );
}

function GridSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading notes"
      className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-3"
    >
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="h-36 animate-pulse rounded-lg bg-muted" />
      ))}
    </div>
  );
}
