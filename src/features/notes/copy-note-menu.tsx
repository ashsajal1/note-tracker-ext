import { Check, Copy, CopyPlus, FileCode2, FileText } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotesStore } from '@/stores/notes.store';
import { htmlToMarkdown, htmlToPlainText } from '@/utils/clipboard';
import { notify } from '@/utils/toast';

interface CopyNoteMenuProps {
  /** Note id (for duplicate). */
  noteId: string;
  /** Stored Tiptap HTML content. */
  contentHtml: string;
}

/**
 * Note actions menu: copy as plain text / Markdown, plus duplicate.
 * Reused by the card footer and the detail view header.
 */
export function CopyNoteMenu({ noteId, contentHtml }: CopyNoteMenuProps) {
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<number | undefined>(undefined);
  const duplicateNote = useNotesStore((s) => s.duplicateNote);

  useEffect(() => () => window.clearTimeout(copyTimer.current), []);

  const flashCopied = () => {
    setCopied(true);
    window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(false), 1500);
  };

  const copyAs = async (kind: 'plain' | 'markdown') => {
    try {
      const text = kind === 'plain' ? htmlToPlainText(contentHtml) : htmlToMarkdown(contentHtml);
      await navigator.clipboard.writeText(text);
      flashCopied();
      notify('success', kind === 'plain' ? 'Copied as plain text' : 'Copied as Markdown');
    } catch {
      notify('error', 'Could not access the clipboard');
    }
  };

  const duplicate = async () => {
    const clone = await duplicateNote(noteId);
    if (clone) notify('success', 'Note duplicated');
    else notify('error', 'Could not duplicate the note');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Note actions"
          title="Copy or duplicate"
        >
          {copied ? (
            <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Copy as</DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => void copyAs('plain')}>
          <FileText aria-hidden />
          Plain text
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void copyAs('markdown')}>
          <FileCode2 aria-hidden />
          Markdown
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void duplicate()}>
          <CopyPlus aria-hidden />
          Duplicate note
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
