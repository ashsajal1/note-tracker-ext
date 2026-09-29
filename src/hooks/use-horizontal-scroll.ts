import { useEffect, useRef, useState } from 'react';

/**
 * Enables mouse interaction for a single-row strip and reports whether
 * more content hides beyond either edge (for fade indicators — a hidden
 * scrollbar gives no scroll affordance on its own).
 *
 * Two interactions are wired up:
 * - Mouse wheel: vertical wheel input does nothing on an `overflow-x-auto`
 *   row by default, so it's translated into horizontal scrolling via a
 *   non-passive wheel listener (React's synthetic `onWheel` is passive
 *   and can't `preventDefault`). Trackpad horizontal gestures are left
 *   alone.
 * - Cursor drag: press and drag the row sideways to scroll. A drag ending
 *   beyond a small threshold swallows the trailing click so chips don't
 *   misfire after a drag.
 */
export function useHorizontalScroll<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      setAtStart(el.scrollLeft <= 1);
      setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
    };
    update();

    const onWheel = (e: WheelEvent) => {
      // Leave trackpad horizontal / diagonal gestures alone.
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      if (el.scrollWidth <= el.clientWidth) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('scroll', update, { passive: true });

    // Cursor drag-to-scroll (mouse only — touch scrolls natively).
    let isDown = false;
    let dragged = false;
    let startX = 0;
    let startScroll = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      isDown = true;
      dragged = false;
      startX = e.clientX;
      startScroll = el.scrollLeft;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      if (!dragged && Math.abs(dx) < 4) return;
      dragged = true;
      el.scrollLeft = startScroll - dx;
    };
    const onPointerUp = () => {
      isDown = false;
    };
    // Swallow the click that follows a drag so chips don't misfire.
    const onClickCapture = (e: MouseEvent) => {
      if (dragged) {
        e.preventDefault();
        e.stopPropagation();
        dragged = false;
      }
    };

    el.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    el.addEventListener('click', onClickCapture, true);

    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('scroll', update);
      el.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('click', onClickCapture, true);
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  return { ref, atStart, atEnd };
}
