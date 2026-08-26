import { Badge } from '@/components/ui/badge';
import { useFiltersStore } from '@/stores/filters.store';
import { useNotesStore } from '@/stores/notes.store';
import { countTags } from '@/utils/format';

/** Horizontal chip list of every tag with usage counts. Click to filter. */
export function TagList() {
  const notes = useNotesStore((s) => s.notes);
  const activeTags = useFiltersStore((s) => s.tags);
  const toggleTag = useFiltersStore((s) => s.toggleTag);

  const tags = countTags(notes);
  if (tags.length === 0) return null;

  return (
    <nav aria-label="Filter by tag" className="flex flex-wrap gap-1.5">
      {tags.map(({ tag, count }) => {
        const active = activeTags.includes(tag);
        return (
          <Badge
            key={tag}
            variant={active ? 'active' : 'interactive'}
            onClick={() => toggleTag(tag)}
            aria-pressed={active}
            title={`Show notes tagged #${tag}`}
          >
            #{tag}
            <span className={active ? 'text-primary-foreground/70' : 'text-muted-foreground'}>
              {count}
            </span>
          </Badge>
        );
      })}
    </nav>
  );
}
