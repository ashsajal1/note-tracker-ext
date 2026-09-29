import type { Scope, SortOption } from '@/types/note';
import { create } from 'zustand';

interface FiltersState {
  /** raw search text (debounce applied by consumers) */
  query: string;
  /** selected tags — AND semantics */
  tags: string[];
  scope: Scope;
  sort: SortOption;
  /** trash view instead of the notes grid */
  trashOpen: boolean;
  setQuery: (query: string) => void;
  toggleTag: (tag: string) => void;
  clearTags: () => void;
  setScope: (scope: Scope) => void;
  setSort: (sort: SortOption) => void;
  setTrashOpen: (open: boolean) => void;
  resetFilters: () => void;
}

export const useFiltersStore = create<FiltersState>()((set, get) => ({
  query: '',
  tags: [],
  scope: 'all',
  sort: 'created-desc',
  trashOpen: false,

  setQuery: (query) => set({ query }),

  toggleTag: (tag) =>
    set((s) => ({
      tags: s.tags.includes(tag) ? s.tags.filter((t) => t !== tag) : [...s.tags, tag],
    })),

  clearTags: () => set({ tags: [] }),

  setScope: (scope) => set({ scope }),

  setSort: (sort) => set({ sort }),

  setTrashOpen: (trashOpen) => set({ trashOpen }),

  resetFilters: () => set({ query: '', tags: [], scope: 'all', sort: get().sort }),
}));
