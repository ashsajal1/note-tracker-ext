import { useEffect, useState } from 'react';

export interface CardNavActions {
  onOpen: (index: number) => void;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

/**
 * Keyboard navigation over visible cards:
 * - j / ArrowDown, k / ArrowUp → move focus (wraps around)
 * - Enter → open, e → edit, x → delete, Esc → drop focus
 *
 * Ignored while typing, when disabled, or when focus sits on an inner
 * control (so card buttons keep their own keys). Focused cards are
 * scrolled into view.
 */
export function useCardNavigation(ids: string[], enabled: boolean, actions: CardNavActions) {
  const [index, setIndex] = useState<number | null>(null);

  // Keep focus valid as the list changes or navigation disables.
  // (Adjusted during render — the cascading-render-safe pattern —
  // instead of an effect, which the lint rules forbid here.)
  const [trackedLength, setTrackedLength] = useState(ids.length);
  if (trackedLength !== ids.length) {
    setTrackedLength(ids.length);
    if (index != null && index >= ids.length) setIndex(null);
  }
  if (!enabled && index != null) {
    setIndex(null);
  }

  // Move DOM focus to the selected card.
  useEffect(() => {
    if (index == null || index >= ids.length) return;
    const el = document.querySelector<HTMLElement>(`[data-note-card="${ids[index]}"]`);
    el?.focus({ preventScroll: true });
    el?.scrollIntoView({ block: 'nearest' });
  }, [index, ids]);

  useEffect(() => {
    if (!enabled || ids.length === 0) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.isContentEditable || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')
      ) {
        return;
      }
      const card = target?.closest?.('[data-note-card]');
      // Inner buttons/links own their keystrokes.
      if (card && e.target !== card) return;

      const move = (delta: number) => {
        e.preventDefault();
        setIndex((prev) =>
          prev == null
            ? delta > 0
              ? 0
              : ids.length - 1
            : (prev + delta + ids.length) % ids.length,
        );
      };

      switch (e.key) {
        case 'j':
        case 'ArrowDown':
          move(1);
          break;
        case 'ArrowUp':
        case 'k':
          move(-1);
          break;
        case 'Enter':
          if (index != null) {
            e.preventDefault();
            actions.onOpen(index);
          }
          break;
        case 'e':
          if (index != null) actions.onEdit(index);
          break;
        case 'x':
          if (index != null) actions.onDelete(index);
          break;
        case 'Escape':
          setIndex(null);
          break;
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [enabled, ids, index, actions]);

  return index;
}
