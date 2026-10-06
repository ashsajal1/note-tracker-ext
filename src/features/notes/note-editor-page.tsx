import { ArrowLeft, Trash2 } from 'lucide-react';
import { Suspense, lazy, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { TagInput } from '@/features/tags/tag-input';
import { useNotesStore } from '@/stores/notes.store';
import { useUiStore } from '@/stores/ui.store';
import { countTags, stripHtml } from '@/utils/format';
import { applyTemplateVariables } from '@/utils/templates';
import { notify } from '@/utils/toast';

// Code-split: Tiptap is ~80% of the popup bundle but only needed while
// editing. Lazy-loading keeps the initial popup chunk under control.
const TiptapEditor = lazy(() =>
  import('@/components/ui/tiptap-editor').then((m) => ({ default: m.TiptapEditor })),
);

function EditorLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading editor"
      className="h-[220px] animate-pulse rounded-md bg-muted"
    />
  );
}

/**
 * Full-page create/edit view. Replaces the old editor modal — drafts live
 * in local state and nothing persists until Save.
 */
export function NoteEditorPage() {
  const noteId = useUiStore((s) => s.editor.noteId);
  const template = useUiStore((s) => s.editor.template);
  const closeEditor = useUiStore((s) => s.closeEditor);

  const notes = useNotesStore((s) => s.notes);

  const editing = useMemo(
    () => (noteId ? (notes.find((n) => n.id === noteId) ?? null) : null),
    [noteId, notes],
  );
  const allTags = useMemo(() => countTags(notes).map((t) => t.tag), [notes]);

  const creating = !editing;
  const seedContent = creating && template ? applyTemplateVariables(template.html) : '';
  const seedTags = creating && template ? template.tags : [];

  return (
    <EditorForm
      key={`${noteId ?? 'new'}-${template?.id ?? 'blank'}`}
      noteId={noteId}
      initialContent={editing?.content ?? seedContent}
      initialTags={editing?.tags ?? seedTags}
      editing={Boolean(editing)}
      allTags={allTags}
      onCancel={closeEditor}
      onDelete={
        editing
          ? () => {
              closeEditor();
              useUiStore.getState().requestDeleteNote(editing.id);
            }
          : undefined
      }
    />
  );
}

interface EditorFormProps {
  noteId: string | null;
  initialContent: string;
  initialTags: string[];
  editing: boolean;
  allTags: string[];
  onCancel: () => void;
  onDelete?: () => void;
}

function EditorForm({
  noteId,
  initialContent,
  initialTags,
  editing,
  allTags,
  onCancel,
  onDelete,
}: EditorFormProps) {
  const addNote = useNotesStore((s) => s.addNote);
  const editNote = useNotesStore((s) => s.editNote);

  const [content, setContent] = useState(initialContent);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [saving, setSaving] = useState(false);
  // Sync ref guard: React state updates async, so a rapid double-click /
  // double Ctrl+Enter could fire handleSave twice before `saving` flips.
  // The ref flips synchronously, guaranteeing a single create/update.
  const savingRef = useRef(false);

  const canSave = stripHtml(content).trim().length > 0 && !saving;

  const plain = stripHtml(content).trim();
  const wordCount = plain ? plain.split(/\s+/).length : 0;

  const handleSave = async () => {
    if (savingRef.current) return;
    if (stripHtml(content).trim().length === 0) return;
    savingRef.current = true;
    setSaving(true);
    try {
      if (editing && noteId) {
        await editNote(noteId, { content: content.trim(), tags });
        notify('success', 'Note updated');
      } else {
        await addNote({ content: content.trim(), tags });
        notify('success', 'Note saved');
      }
      onCancel();
    } catch (err) {
      notify('error', err instanceof Error ? err.message : 'Failed to save the note');
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <div
      className="flex h-full flex-col overflow-hidden"
      onKeyDown={(e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          void handleSave();
        }
        // Esc backs out, unless a menu/dialog owns the keystroke.
        if (
          e.key === 'Escape' &&
          !(
            e.target instanceof HTMLElement &&
            e.target.closest('[role="menu"], [role="dialog"], [role="listbox"]')
          )
        ) {
          e.preventDefault();
          onCancel();
        }
      }}
    >
      {/* Header */}
      <header className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onCancel}
          aria-label="Back to notes"
          title="Back"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold tracking-tight">
            {editing ? 'Edit note' : 'New note'}
          </h2>
          <p className="hidden text-[11px] text-muted-foreground sm:block">
            {editing ? 'Changes update the “last modified” time.' : 'Ctrl+Enter to save'}
          </p>
        </div>
        {onDelete && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onDelete}
            aria-label="Delete note"
            title="Delete"
            className="ml-auto hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-3.5" />
          </Button>
        )}
      </header>

      {/* Content */}
      <main className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-3">
        <section aria-label="Note content">
          <Suspense fallback={<EditorLoading />}>
            <TiptapEditor
              content={content}
              onChange={setContent}
              placeholder="Write your note…"
              autoFocus={!editing}
              chrome="plain"
            />
          </Suspense>
        </section>
        <section aria-label="Note tags">
          <div className="mb-1.5 flex items-baseline justify-between">
            <label className="block text-xs font-medium text-muted-foreground">
              Tags{tags.length > 0 && ` · ${tags.length}`}
            </label>
          </div>
          <TagInput value={tags} onChange={setTags} allTags={allTags} />
        </section>
      </main>

      {/* Footer */}
      <footer className="flex items-center gap-2 border-t border-border pt-3">
        <p aria-live="polite" className="text-[11px] text-muted-foreground tabular-nums">
          {wordCount} {wordCount === 1 ? 'word' : 'words'}
        </p>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={() => void handleSave()} disabled={!canSave}>
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Save note'}
          </Button>
        </div>
      </footer>
    </div>
  );
}
