import { Badge } from '@/components/ui/badge';
import { useHorizontalScroll } from '@/hooks/use-horizontal-scroll';
import { useFiltersStore } from '@/stores/filters.store';
import { useNotesStore } from '@/stores/notes.store';
import { countTags } from '@/utils/format';

/** Single-row scrollable chip list of every tag with usage counts. Click to filter. */
export function TagList() {
  const notes = useNotesStore((s) => s.notes);
  const activeTags = useFiltersStore((s) => s.tags);
  const toggleTag = useFiltersStore((s) => s.toggleTag);

  const tags = countTags(notes);
  const { ref, atStart, atEnd } = useHorizontalScroll<HTMLElement>();
  if (tags.length === 0) return null;

  return (
    <div className="relative">
      <nav
        ref={ref}
        aria-label="Filter by tag"
        className="tags-scroll flex cursor-grab items-center gap-1.5 overflow-x-auto select-none active:cursor-grabbing"
      >
        {tags.map(({ tag, count }) => {
          const active = activeTags.includes(tag);
          return (
            <Badge
              key={tag}
              variant={active ? 'active' : 'interactive'}
              onClick={() => toggleTag(tag)}
              aria-pressed={active}
              title={`Show notes tagged #${tag}`}
              className="shrink-0"
            >
              #{tag}
              <span className={active ? 'text-primary-foreground/70' : 'text-muted-foreground'}>
                {count}
              </span>
            </Badge>
          );
        })}
      </nav>
      {/* Edge fades — the only scroll hint once the scrollbar is hidden. */}
      {!atStart && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent"
        />
      )}
      {!atEnd && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent"
        />
      )}
    </div>
  );
}
