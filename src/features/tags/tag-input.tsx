import { Plus, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { MAX_TAG_LENGTH } from '@/types/note';
import { cn } from '@/utils/cn';
import { normalizeTag, parseTagInput } from '@/utils/tags';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  /** existing tags across all notes (sorted by usage), used as suggestions */
  allTags?: string[];
}

const MAX_SUGGESTIONS = 6;

/**
 * Tag input with suggestions from previously used tags.
 * - Focus shows your most-used tags; typing filters (prefix matches rank
 *   first, then substring matches).
 * - ↑/↓ highlight, Enter/Tab accept, Esc clears. Click works too.
 */
export function TagInput({ value, onChange, allTags = [] }: TagInputProps) {
  const [draft, setDraft] = useState('');
  const [focused, setFocused] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const [prevDraft, setPrevDraft] = useState(draft);

  // Reset the highlight whenever the query changes (during render —
  // avoids an effect-driven cascading render).
  if (prevDraft !== draft) {
    setPrevDraft(draft);
    setHighlight(-1);
  }

  const suggestions = useMemo(() => {
    const pool = allTags.filter((t) => !value.includes(t));
    const q = normalizeTag(draft);
    if (!q) return pool.slice(0, MAX_SUGGESTIONS);
    const starts = pool.filter((t) => t.startsWith(q));
    const contains = pool.filter((t) => !t.startsWith(q) && t.includes(q));
    return [...starts, ...contains].slice(0, MAX_SUGGESTIONS);
  }, [draft, allTags, value]);

  const showSuggestions = focused && suggestions.length > 0;

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && showSuggestions) {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp' && showSuggestions) {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, -1));
    } else if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (showSuggestions && highlight >= 0) addTag(suggestions[highlight]!);
      else commitDraft();
    } else if (e.key === 'Tab' && showSuggestions && highlight >= 0) {
      e.preventDefault();
      addTag(suggestions[highlight]!);
    } else if (e.key === 'Backspace' && draft === '' && value.length > 0) {
      removeTag(value[value.length - 1]!);
    } else if (e.key === 'Escape' && draft !== '') {
      e.stopPropagation();
      setDraft('');
    }
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
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? 'Add tags…' : ''}
          aria-label="Add tag"
          role="combobox"
          aria-expanded={showSuggestions}
          aria-controls="tag-suggestions"
          aria-autocomplete="list"
          aria-activedescendant={
            showSuggestions && highlight >= 0 ? `tag-suggestion-${highlight}` : undefined
          }
          autoComplete="off"
          spellCheck={false}
          className="h-7 min-w-24 flex-1 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0 dark:bg-transparent"
        />
      </div>
      {showSuggestions && (
        <div
          id="tag-suggestions"
          role="listbox"
          aria-label="Tag suggestions"
          className="mt-1.5 flex flex-wrap gap-1"
        >
          {suggestions.map((tag, i) => (
            <button
              key={tag}
              type="button"
              role="option"
              id={`tag-suggestion-${i}`}
              aria-selected={highlight === i}
              onMouseDown={(e) => {
                // Prevent input blur before the click lands.
                e.preventDefault();
                addTag(tag);
              }}
              onMouseEnter={() => setHighlight(i)}
              className={cn(
                'inline-flex items-center gap-1 rounded-full border border-dashed border-border px-2 py-0.5 text-xs cursor-pointer',
                highlight === i
                  ? 'border-solid border-primary bg-secondary text-secondary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              <Plus className="size-3" aria-hidden />#{tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
