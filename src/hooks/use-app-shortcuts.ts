import { useEffect } from 'react';

interface ShortcutHandlers {
  onFocusSearch?: () => void;
  onNewNote?: () => void;
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
}

/**
 * App-level keyboard shortcuts:
 *  - "/" or Ctrl/Cmd+K → focus search
 *  - "n" → new note (ignored while typing)
 */
export function useAppShortcuts({ onFocusSearch, onNewNote }: ShortcutHandlers): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const typing = isTypingTarget(event.target);

      // Focus search — allowed even while typing (standard escape hatch).
      if ((event.key === 'k' || event.key === 'K') && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        onFocusSearch?.();
        return;
      }
      if (!typing && event.key === '/') {
        event.preventDefault();
        onFocusSearch?.();
        return;
      }
      // New note — plain "n" only when not typing and no modifiers.
      if (!typing && !event.ctrlKey && !event.metaKey && !event.altKey && event.key === 'n') {
        event.preventDefault();
        onNewNote?.();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onFocusSearch, onNewNote]);
}
