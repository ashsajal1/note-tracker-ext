import { Search, X } from 'lucide-react';
import { useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Kbd } from '@/components/ui/kbd';
import { useFiltersStore } from '@/stores/filters.store';

interface SearchBarProps {
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export function SearchBar({ inputRef }: SearchBarProps) {
  const query = useFiltersStore((s) => s.query);
  const setQuery = useFiltersStore((s) => s.setQuery);
  const localRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative">
      <Search
        aria-hidden
        className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        ref={inputRef ?? localRef}
        type="text"
        role="searchbox"
        aria-label="Search notes"
        placeholder="Search notes…"
        title='Supports "exact phrase" and -exclude'
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && query) {
            e.stopPropagation();
            setQuery('');
          }
        }}
        autoComplete="off"
        spellCheck={false}
        className="h-10 pl-9 pr-16 text-base"
      />
      <div className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1">
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              (inputRef ?? localRef).current?.focus();
            }}
            aria-label="Clear search"
            className="rounded-sm p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
          >
            <X className="size-4" />
          </button>
        ) : (
          <Kbd>/</Kbd>
        )}
      </div>
    </div>
  );
}
