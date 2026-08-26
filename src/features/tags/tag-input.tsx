import { Plus, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { MAX_TAG_LENGTH } from '@/types/note';
import { cn } from '@/utils/cn';
import { normalizeTag, parseTagInput } from '@/utils/tags';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  /** existing tags across all notes, used as suggestions */
  allTags?: string[];
}

export function TagInput({ value, onChange, allTags = [] }: TagInputProps) {
  const [draft, setDraft] = useState('');
  const [focused, setFocused] = useState(false);

  const suggestions = useMemo(() => {
    const q = normalizeTag(draft);
    if (!q) return [];
    return allTags.filter((t) => t.startsWith(q) && !value.includes(t)).slice(0, 5);
  }, [draft, allTags, value]);

  const commitDraft = () => {
    const parsed = parseTagInput(draft);
    if (parsed.length > 0) {
      onChange([...value, ...parsed.filter((t) => !value.includes(t))]);
    }
    setDraft('');
  };

  const addTag = (tag: string) => {
    if (!value.includes(tag)) onChange([...value, tag]);
    setDraft('');
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  return (
    <div>
      <div
        className={cn(
          'flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-2.5 py-1.5 shadow-sm transition-colors',
          'focus-within:outline-none focus-within:ring-2 focus-within:ring-ring',
        )}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-0.5 rounded-full bg-secondary py-0.5 pl-2 pr-1 text-xs font-medium text-secondary-foreground"
          >
            #{tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={`Remove tag ${tag}`}
              className="rounded-full p-0.5 hover:bg-secondary-foreground/15 cursor-pointer"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value.slice(0, MAX_TAG_LENGTH))}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            commitDraft();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              commitDraft();
            } else if (e.key === 'Backspace' && draft === '' && value.length > 0) {
              removeTag(value[value.length - 1]!);
            }
          }}
          placeholder={value.length === 0 ? 'Add tags…' : ''}
          aria-label="Add tag"
          autoComplete="off"
          spellCheck={false}
          className="h-7 min-w-24 flex-1 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0 dark:bg-transparent"
        />
      </div>
      {focused && suggestions.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1" role="listbox" aria-label="Tag suggestions">
          {suggestions.map((tag) => (
            <button
              key={tag}
              type="button"
              role="option"
              aria-selected={false}
              onMouseDown={(e) => {
                // Prevent input blur before the click lands.
                e.preventDefault();
                addTag(tag);
              }}
              className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-2 py-0.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
            >
              <Plus className="size-3" />#{tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
