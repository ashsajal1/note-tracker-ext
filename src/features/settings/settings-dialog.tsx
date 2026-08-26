import { Download, Moon, Sun, SunMoon, Trash2, Upload } from 'lucide-react';
import { useMemo, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { buildExportPayload, parseImportPayload } from '@/utils/export-import';
import { useNotesStore } from '@/stores/notes.store';
import { useUiStore } from '@/stores/ui.store';
import { countTags } from '@/utils/format';
import type { ThemeSetting } from '@/types/settings';
import { cn } from '@/utils/cn';

const THEME_OPTIONS: { value: ThemeSetting; label: string; icon: typeof Sun }[] = [
  { value: 'system', label: 'System', icon: SunMoon },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
];

export function SettingsDialog() {
  const open = useUiStore((s) => s.settingsOpen);
  const setOpen = useUiStore((s) => s.setSettingsOpen);
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);
  const setConfirmClearOpen = useUiStore((s) => s.setConfirmClearOpen);

  const notes = useNotesStore((s) => s.notes);
  const importNotes = useNotesStore((s) => s.importNotes);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const stats = useMemo(() => ({ notes: notes.length, tags: countTags(notes).length }), [notes]);

  const exportNotes = () => {
    try {
      const payload = JSON.stringify(buildExportPayload(notes), null, 2);
      const blob = new Blob([payload], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      const stamp = new Date().toISOString().slice(0, 10);
      anchor.href = url;
      anchor.download = `note-tracker-backup-${stamp}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${notes.length} ${notes.length === 1 ? 'note' : 'notes'}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Export failed');
    }
  };

  const handleImportFile = async (file: File) => {
    try {
      const text = await file.text();
      const { notes: imported, skipped } = parseImportPayload(JSON.parse(text));
      if (imported.length === 0 && skipped > 0) {
        throw new Error('No valid notes found in this file');
      }
      await importNotes(imported);
      toast.success(
        `Imported ${imported.length} ${imported.length === 1 ? 'note' : 'notes'}` +
          (skipped > 0 ? ` · ${skipped} skipped` : ''),
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import failed — invalid file');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            {stats.notes} {stats.notes === 1 ? 'note' : 'notes'} · {stats.tags}{' '}
            {stats.tags === 1 ? 'tag' : 'tags'} — stored locally in your browser.
          </DialogDescription>
        </DialogHeader>

        {/* Appearance */}
        <section aria-label="Appearance" className="grid gap-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Theme
          </h3>
          <div role="radiogroup" aria-label="Theme" className="grid grid-cols-3 gap-2">
            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={theme === value}
                onClick={() => setTheme(value)}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-md border p-3 text-xs font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  theme === value
                    ? 'border-primary bg-secondary text-secondary-foreground'
                    : 'border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )}
              >
                <Icon className="size-4" aria-hidden />
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* Data */}
        <section aria-label="Backup and restore" className="grid gap-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Data
          </h3>
          <p className="text-xs text-muted-foreground">
            Back up your notes as a portable JSON file, or restore a previous backup. Notes with the
            same ID are updated.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={exportNotes}>
              <Download aria-hidden />
              Export notes
            </Button>
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              <Upload aria-hidden />
              Import notes…
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="sr-only"
              aria-hidden="true"
              tabIndex={-1}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleImportFile(file);
                e.target.value = '';
              }}
            />
          </div>
        </section>

        {/* Danger zone */}
        <section aria-label="Danger zone" className="grid gap-2">
          <h3 className="text-xs font-semibold text-destructive uppercase tracking-wide">
            Danger zone
          </h3>
          <Button
            variant="outline"
            size="sm"
            className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
            disabled={stats.notes === 0}
            onClick={() => setConfirmClearOpen(true)}
          >
            <Trash2 aria-hidden />
            Clear all data…
          </Button>
        </section>

        <footer className="rounded-md bg-muted px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
          Note Tracker is fully offline: no accounts, no servers, no tracking. Shortcuts:
          <kbd className="mx-0.5 rounded border bg-background px-1">/</kbd> search ·
          <kbd className="mx-0.5 rounded border bg-background px-1">n</kbd> new note · rebind the
          open shortcut in your browser's extension keyboard settings.
        </footer>
      </DialogContent>
    </Dialog>
  );
}
