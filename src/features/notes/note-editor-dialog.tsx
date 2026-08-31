import { Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TiptapEditor } from '@/components/ui/tiptap-editor';
import { TagInput } from '@/features/tags/tag-input';
import type { Note } from '@/types/note';
import { useNotesStore } from '@/stores/notes.store';
import { useUiStore } from '@/stores/ui.store';
import { countTags, stripHtml } from '@/utils/format';

/**
 * Create/edit note dialog. Drafts live in local state and are seeded on
 * mount (the form remounts per open/note) — nothing persists until Save.
 */
export function NoteEditorDialog() {
  const open = useUiStore((s) => s.editor.open);
  const noteId = useUiStore((s) => s.editor.noteId);
  const closeEditor = useUiStore((s) => s.closeEditor);

  const notes = useNotesStore((s) => s.notes);

  const editing = useMemo(
    () => (noteId ? (notes.find((n) => n.id === noteId) ?? null) : null),
    [noteId, notes],
  );
  const allTags = useMemo(() => countTags(notes).map((t) => t.tag), [notes]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) closeEditor();
      }}
    >
      {open && (
        <EditorForm
          key={noteId ?? 'new'}
          editing={editing}
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
      )}
    </Dialog>
  );
}

interface EditorFormProps {
  editing: Note | null;
  allTags: string[];
  onCancel: () => void;
  onDelete?: () => void;
}

function EditorForm({ editing, allTags, onCancel, onDelete }: EditorFormProps) {
  const addNote = useNotesStore((s) => s.addNote);
  const editNote = useNotesStore((s) => s.editNote);

  const [content, setContent] = useState(editing?.content ?? '');
  const [tags, setTags] = useState<string[]>(editing?.tags ?? []);
  const [saving, setSaving] = useState(false);

  const canSave = stripHtml(content).trim().length > 0 && !saving;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      if (editing) {
        await editNote(editing.id, { content: content.trim(), tags });
        toast.success('Note updated');
      } else {
        await addNote({ content: content.trim(), tags });
        toast.success('Note saved');
      }
      onCancel();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save the note');
      setSaving(false);
    }
  };

  return (
    <DialogContent
      className="max-w-xl"
      onKeyDown={(e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          void handleSave();
        }
      }}
    >
      <DialogHeader>
        <DialogTitle>{editing ? 'Edit note' : 'New note'}</DialogTitle>
        <DialogDescription>
          {editing
            ? 'Changes update the “last modified” time.'
            : 'Write freely — everything stays on this device.'}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-3">
        <TiptapEditor
          content={content}
          onChange={setContent}
          placeholder="Write your note…"
        />
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Tags</label>
          <TagInput value={tags} onChange={setTags} allTags={allTags} />
        </div>
      </div>

      <DialogFooter className="sm:justify-between">
        {onDelete ? (
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 aria-hidden />
            Delete
          </Button>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
          <span className="mr-1 hidden text-[11px] text-muted-foreground sm:inline">
            Ctrl+Enter to save
          </span>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={() => void handleSave()} disabled={!canSave}>
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Save note'}
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  );
}
