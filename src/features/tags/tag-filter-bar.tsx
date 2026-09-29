import { ArrowUpDown, Check, Trash2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SORT_OPTIONS, type Scope, type SortOption } from '@/types/note';
import { useFiltersStore } from '@/stores/filters.store';
import { useNotesStore } from '@/stores/notes.store';
import { cn } from '@/utils/cn';

const SCOPES: { value: Scope; label: string }[] = [
  { value: 'all', label: 'All notes' },
  { value: 'recent', label: 'Recent' },
];

interface TagFilterBarProps {
  /** number of notes matching current filters (for the live region) */
  visibleCount: number;
}

export function TagFilterBar({ visibleCount }: TagFilterBarProps) {
  const scope = useFiltersStore((s) => s.scope);
  const setScope = useFiltersStore((s) => s.setScope);
  const sort = useFiltersStore((s) => s.sort);
  const setSort = useFiltersStore((s) => s.setSort);
  const tags = useFiltersStore((s) => s.tags);
  const toggleTag = useFiltersStore((s) => s.toggleTag);
  const clearTags = useFiltersStore((s) => s.clearTags);
  const query = useFiltersStore((s) => s.query);
  const setQuery = useFiltersStore((s) => s.setQuery);
  const trashOpen = useFiltersStore((s) => s.trashOpen);
  const setTrashOpen = useFiltersStore((s) => s.setTrashOpen);
  const trashCount = useNotesStore((s) => s.notes.filter((n) => n.deletedAt != null).length);

  const hasActiveFilters = tags.length > 0 || query.length > 0 || scope !== 'all';

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Scope segmented control */}
      <div role="group" aria-label="Notes scope" className="inline-flex rounded-md border p-0.5">
        {SCOPES.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setScope(value)}
            aria-pressed={scope === value}
            className={cn(
              'rounded-sm px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              scope === value
                ? 'bg-secondary text-secondary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <p aria-live="polite" className="text-xs text-muted-foreground tabular-nums">
        {visibleCount} {visibleCount === 1 ? 'note' : 'notes'}
      </p>

      <div className="ml-auto flex items-center gap-1.5">
        {/* Active tag chips */}
        {tags.map((tag) => (
          <Badge key={tag} variant="active">
            #{tag}
            <button
              type="button"
              onClick={() => toggleTag(tag)}
              aria-label={`Remove filter ${tag}`}
              className="rounded-full p-0.5 hover:bg-primary-foreground/15 cursor-pointer"
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-muted-foreground"
            onClick={() => {
              clearTags();
              setQuery('');
              setScope('all');
            }}
          >
            Clear
          </Button>
        )}

        {/* Trash */}
        <Button
          variant={trashOpen ? 'secondary' : 'ghost'}
          size="sm"
          className="h-7 gap-1.5 text-xs tabular-nums"
          onClick={() => setTrashOpen(!trashOpen)}
          aria-pressed={trashOpen}
          title={trashOpen ? 'Back to notes' : 'Open trash'}
        >
          <Trash2 className="size-3" aria-hidden />
          {trashOpen ? 'Notes' : trashCount > 0 ? `Trash · ${trashCount}` : 'Trash'}
        </Button>

        {/* Sort */}
        <DropdownMenu>          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs">
              <ArrowUpDown className="size-3" aria-hidden />
              {SORT_OPTIONS.find((o) => o.value === sort)?.label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {SORT_OPTIONS.map((option) => (
              <DropdownMenuItem key={option.value} onSelect={() => setSort(option.value)}>
                <Check className={cn('opacity-0', option.value === sort && 'opacity-100')} />
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export type { SortOption };
