import { NotebookPen, SearchX } from 'lucide-react';
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
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleTag: (tag: string) => void;
  activeTags: string[];
}

export function NotesGrid({
  notes,
  allCount,
  loading,
  hasFilters,
  onClearFilters,
  onCreate,
  onEdit,
  onDelete,
  onToggleTag,
  activeTags,
}: NotesGridProps) {
  if (loading) return <GridSkeleton />;

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
