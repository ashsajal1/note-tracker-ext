import { Check, Copy, FileCode2, FileText } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { htmlToMarkdown, htmlToPlainText } from '@/utils/clipboard';

interface CopyNoteMenuProps {
  /** Stored Tiptap HTML content. */
  contentHtml: string;
}

/**
 * Copy dropdown: plain text vs Markdown. Reused by the card footer
 * and the detail view header so both offer the same two options.
 */
export function CopyNoteMenu({ contentHtml }: CopyNoteMenuProps) {
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<number | undefined>(undefined);

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
      toast.success(kind === 'plain' ? 'Copied as plain text' : 'Copied as Markdown');
    } catch {
      toast.error('Could not access the clipboard');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Copy note content"
          title="Copy as plain text or Markdown"
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
