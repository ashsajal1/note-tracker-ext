import { AlertCircle } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Toaster } from 'sonner';
import { ConfirmDialog, noteDeleteDescription } from '@/components/confirm-dialog';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { NoteDetailView } from '@/features/notes/note-detail-view';
import { NoteEditorPage } from '@/features/notes/note-editor-page';
import { NotesGrid } from '@/features/notes/notes-grid';
import { SearchBar } from '@/features/search/search-bar';
import { SettingsDialog } from '@/features/settings/settings-dialog';
import { TagFilterBar } from '@/features/tags/tag-filter-bar';
import { TagList } from '@/features/tags/tag-list';
import { useAppShortcuts } from '@/hooks/use-app-shortcuts';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useTheme } from '@/hooks/use-theme';
import { filterAndSortNotes } from '@/features/search/search';
import { useFiltersStore } from '@/stores/filters.store';
import { useNotesStore } from '@/stores/notes.store';
import { useUiStore } from '@/stores/ui.store';

const SEARCH_DEBOUNCE_MS = 120;

export default function App() {
  const searchRef = useRef<HTMLInputElement>(null);

  // Theme: applies class to <html> and syncs with the OS preference.
  const resolvedTheme = useTheme();

  // Boot: load notes once.
  const status = useNotesStore((s) => s.status);
  const error = useNotesStore((s) => s.error);
  useEffect(() => {
    void useNotesStore.getState().initialize();
  }, []);

  // Filters + derived visible notes (search debounced for responsiveness).
  const query = useFiltersStore((s) => s.query);
  const tags = useFiltersStore((s) => s.tags);
  const scope = useFiltersStore((s) => s.scope);
  const sort = useFiltersStore((s) => s.sort);
  const resetFilters = useFiltersStore((s) => s.resetFilters);
  const toggleTag = useFiltersStore((s) => s.toggleTag);
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);

  const notes = useNotesStore((s) => s.notes);
  const removeNote = useNotesStore((s) => s.removeNote);
  const removeAllNotes = useNotesStore((s) => s.removeAllNotes);

  const openEditor = useUiStore((s) => s.openEditor);
  const openDetail = useUiStore((s) => s.openDetail);
  const detailNoteId = useUiStore((s) => s.detailNoteId);
  const editorOpen = useUiStore((s) => s.editor.open);
  const deleteTargetId = useUiStore((s) => s.deleteTargetId);
  const requestDeleteNote = useUiStore((s) => s.requestDeleteNote);
  const confirmClearOpen = useUiStore((s) => s.confirmClearOpen);
  const setConfirmClearOpen = useUiStore((s) => s.setConfirmClearOpen);

  const visibleNotes = useMemo(
    () => filterAndSortNotes(notes, { query: debouncedQuery, tags, scope, sort }),
    [notes, debouncedQuery, tags, scope, sort],
  );

  const focusSearch = useCallback(() => searchRef.current?.focus(), []);
  const newNote = useCallback(() => openEditor(null), [openEditor]);
  useAppShortcuts({ onFocusSearch: focusSearch, onNewNote: newNote });

  const deleteTarget =
    deleteTargetId != null ? (notes.find((n) => n.id === deleteTargetId) ?? null) : null;

  return (
    <div className="flex h-full flex-col gap-3 overflow-hidden bg-background p-4 text-foreground">
      <Header resolvedTheme={resolvedTheme} />
      {!detailNoteId && !editorOpen && <SearchBar inputRef={searchRef} />}

      {!detailNoteId && !editorOpen && (
        <div className="space-y-2">
          <TagFilterBar visibleCount={visibleNotes.length} />
          <TagList />
        </div>
      )}

      <main className="min-h-0 flex-1 overflow-y-auto pb-1 pr-0.5">
        {editorOpen ? (
          <NoteEditorPage />
        ) : detailNoteId ? (
          <NoteDetailView />
        ) : status === 'error' ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <AlertCircle className="size-8 text-destructive" aria-hidden />
            <p className="text-sm text-muted-foreground">Could not load your notes: {error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void useNotesStore.getState().initialize();
              }}
            >
              Retry
            </Button>
          </div>
        ) : (
          <NotesGrid
            notes={visibleNotes}
            allCount={notes.length}
            loading={status !== 'ready'}
            hasFilters={query.length > 0 || tags.length > 0 || scope !== 'all'}
            onClearFilters={resetFilters}
            onCreate={newNote}
            onView={openDetail}
            onEdit={(id) => openEditor(id)}
            onDelete={requestDeleteNote}
            onToggleTag={toggleTag}
            activeTags={tags}
          />
        )}
      </main>

      {/* Dialogs */}
      <SettingsDialog />
      <ConfirmDialog
        open={deleteTarget != null}
        onOpenChange={(open) => {
          if (!open) requestDeleteNote(null);
        }}
        title="Delete this note?"
        description={
          deleteTarget ? `${noteDeleteDescription(deleteTarget)} This cannot be undone.` : undefined
        }
        confirmLabel="Delete note"
        onConfirm={() => {
          if (deleteTarget) {
            void removeNote(deleteTarget.id).then(() => {});
          }
        }}
      />
      <ConfirmDialog
        open={confirmClearOpen}
        onOpenChange={setConfirmClearOpen}
        title="Clear all data?"
        description={`This permanently deletes all ${notes.length} notes from this device. Export a backup first if you might need them.`}
        confirmLabel="Delete everything"
        onConfirm={() => {
          void removeAllNotes();
        }}
      />

      <Toaster
        theme={resolvedTheme}
        position="bottom-right"
        duration={2500}
        closeButton={false}
        toastOptions={{
          classNames: {
            toast:
              '!bg-popover !text-popover-foreground !border !border-border !shadow-lg !rounded-lg !text-sm',
            description: '!text-muted-foreground',
          },
        }}
      />
    </div>
  );
}
