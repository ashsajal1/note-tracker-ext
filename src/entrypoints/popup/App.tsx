import { AlertCircle } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { useCardNavigation } from '@/hooks/use-card-navigation';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useTheme } from '@/hooks/use-theme';
import { filterAndSortNotes, matchesQuery, parseSearchQuery } from '@/features/search/search';
import { useFiltersStore } from '@/stores/filters.store';
import { useNotesStore } from '@/stores/notes.store';
import { useUiStore } from '@/stores/ui.store';
import { activeNotes, trashedNotes } from '@/utils/notes';

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
  const trashOpen = useFiltersStore((s) => s.trashOpen);
  const resetFilters = useFiltersStore((s) => s.resetFilters);
  const toggleTag = useFiltersStore((s) => s.toggleTag);
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);

  const notes = useNotesStore((s) => s.notes);
  const removeNote = useNotesStore((s) => s.removeNote);
  const trashNote = useNotesStore((s) => s.trashNote);
  const restoreNote = useNotesStore((s) => s.restoreNote);
  const togglePin = useNotesStore((s) => s.togglePin);
  const emptyTrash = useNotesStore((s) => s.emptyTrash);
  const removeAllNotes = useNotesStore((s) => s.removeAllNotes);

  const openEditor = useUiStore((s) => s.openEditor);
  const openDetail = useUiStore((s) => s.openDetail);
  const detailNoteId = useUiStore((s) => s.detailNoteId);
  const editorOpen = useUiStore((s) => s.editor.open);
  const settingsOpen = useUiStore((s) => s.settingsOpen);
  const deleteTargetId = useUiStore((s) => s.deleteTargetId);
  const requestDeleteNote = useUiStore((s) => s.requestDeleteNote);
  const purgeTargetId = useUiStore((s) => s.purgeTargetId);
  const requestPurgeNote = useUiStore((s) => s.requestPurgeNote);
  const confirmClearOpen = useUiStore((s) => s.confirmClearOpen);
  const setConfirmClearOpen = useUiStore((s) => s.setConfirmClearOpen);

  const visibleNotes = useMemo(
    () => filterAndSortNotes(notes, { query: debouncedQuery, tags, scope, sort }),
    [notes, debouncedQuery, tags, scope, sort],
  );

  // Trash view: trashed notes matching the same query/tag filters.
  const visibleTrash = useMemo(() => {
    const parsed = parseSearchQuery(debouncedQuery);
    return trashedNotes(notes).filter(
      (n) =>
        tags.every((t) => n.tags.includes(t)) && matchesQuery(n, parsed),
    );
  }, [notes, debouncedQuery, tags]);

  const focusSearch = useCallback(() => searchRef.current?.focus(), []);
  const newNote = useCallback(() => openEditor(null), [openEditor]);
  useAppShortcuts({ onFocusSearch: focusSearch, onNewNote: newNote });

  const [confirmEmptyTrashOpen, setConfirmEmptyTrashOpen] = useState(false);

  // Keyboard navigation over the currently listed cards.
  const navIds = useMemo(
    () => (trashOpen ? visibleTrash.map((n) => n.id) : visibleNotes.map((n) => n.id)),
    [trashOpen, visibleTrash, visibleNotes],
  );
  const navEnabled =
    !editorOpen &&
    !detailNoteId &&
    !settingsOpen &&
    deleteTargetId == null &&
    purgeTargetId == null &&
    !confirmClearOpen &&
    !confirmEmptyTrashOpen &&
    status === 'ready';
  const navActions = useMemo(
    () => ({
      onOpen: (i: number) => openDetail(navIds[i]!),
      onEdit: (i: number) => {
        const id = navIds[i]!;
        if (trashOpen) void restoreNote(id);
        else openEditor(id);
      },
      onDelete: (i: number) => {
        const id = navIds[i]!;
        if (trashOpen) requestPurgeNote(id);
        else requestDeleteNote(id);
      },
    }),
    [navIds, trashOpen, openDetail, openEditor, restoreNote, requestPurgeNote, requestDeleteNote],
  );
  useCardNavigation(navIds, navEnabled, navActions);

  const activeCount = useMemo(() => activeNotes(notes).length, [notes]);

  const deleteTarget =
    deleteTargetId != null ? (notes.find((n) => n.id === deleteTargetId) ?? null) : null;
  const purgeTarget =
    purgeTargetId != null ? (notes.find((n) => n.id === purgeTargetId) ?? null) : null;

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
        ) : trashOpen ? (
          <NotesGrid
            mode="trash"
            notes={visibleTrash}
            allCount={visibleTrash.length}
            loading={status !== 'ready'}
            hasFilters={query.length > 0 || tags.length > 0}
            onClearFilters={resetFilters}
            onCreate={newNote}
            onView={openDetail}
            onEdit={(id) => void restoreNote(id)}
            onDelete={requestPurgeNote}
            onToggleTag={toggleTag}
            activeTags={tags}
            onRestore={(id) => void restoreNote(id)}
            onPurge={requestPurgeNote}
            onEmptyTrash={() => setConfirmEmptyTrashOpen(true)}
          />
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
            allCount={activeCount}
            loading={status !== 'ready'}
            hasFilters={query.length > 0 || tags.length > 0 || scope !== 'all'}
            onClearFilters={resetFilters}
            onCreate={newNote}
            onView={openDetail}
            onEdit={(id) => openEditor(id)}
            onDelete={requestDeleteNote}
            onToggleTag={toggleTag}
            activeTags={tags}
            onTogglePin={(id) => void togglePin(id)}
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
        title="Move to trash?"
        description={
          deleteTarget
            ? `${noteDeleteDescription(deleteTarget)} You can restore it within 30 days.`
            : undefined
        }
        confirmLabel="Move to trash"
        onConfirm={() => {
          if (deleteTarget) {
            void trashNote(deleteTarget.id).then(() => {});
          }
        }}
      />
      <ConfirmDialog
        open={purgeTarget != null}
        onOpenChange={(open) => {
          if (!open) requestPurgeNote(null);
        }}
        title="Delete forever?"
        description={
          purgeTarget
            ? `${noteDeleteDescription(purgeTarget)} This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete forever"
        onConfirm={() => {
          if (purgeTarget) {
            if (detailNoteId === purgeTarget.id) useUiStore.getState().closeDetail();
            void removeNote(purgeTarget.id).then(() => {});
          }
        }}
      />
      <ConfirmDialog
        open={confirmEmptyTrashOpen}
        onOpenChange={setConfirmEmptyTrashOpen}
        title="Empty trash?"
        description="This permanently deletes every note in trash. This cannot be undone."
        confirmLabel="Empty trash"
        onConfirm={() => {
          void emptyTrash();
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
