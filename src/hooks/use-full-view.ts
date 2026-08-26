import { useCallback, useEffect, useState } from 'react';
import { browser } from 'wxt/browser';

const FULL_VIEW_PARAM = 'view';

/** True when the app runs in a dedicated full-screen tab (?view=tab) instead of the popup. */
export function isFullView(): boolean {
  return new URLSearchParams(window.location.search).get(FULL_VIEW_PARAM) === 'tab';
}

interface FullView {
  /** Running in the expanded tab (vs. the popup window). */
  isTabView: boolean;
  /** Tab view is currently in native fullscreen (Fullscreen API). */
  isFullscreen: boolean;
  openFullView: () => void;
  toggleFullscreen: () => void;
}

export function useFullView(): FullView {
  const isTabView = isFullView();
  const [isFullscreen, setIsFullscreen] = useState(() => document.fullscreenElement != null);

  useEffect(() => {
    if (!isTabView) return;
    const onChange = () => setIsFullscreen(document.fullscreenElement != null);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, [isTabView]);

  // From the popup: open this UI in a real tab, then dismiss the popup.
  const openFullView = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.set(FULL_VIEW_PARAM, 'tab');
    void browser.tabs.create({ url: url.toString() }).then(() => window.close());
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void document.documentElement.requestFullscreen();
    }
  }, []);

  return { isTabView, isFullscreen, openFullView, toggleFullscreen };
}
