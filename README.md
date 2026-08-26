# Note Tracker

A minimal, fast, **private** note tracker browser extension. Create notes, tag
them, and find anything instantly — all data stays in your browser. No
accounts, no servers, no tracking, no network requests.

![stack](https://img.shields.io/badge/Manifest-V3-5b21f6) built with **WXT + React 19 + TypeScript + Tailwind v4 + Zustand + Dexie (IndexedDB)**

## Features

- **Instant search** — partial + multi-keyword matching across note content
  and tags, debounced (120 ms) so results update as you type
- **Tags** — add/remove multiple tags per note with autocomplete suggestions;
  click any tag chip to filter (multi-select, AND semantics) with live counts
- **Sorting** — newest, oldest, recently updated; **Recent** scope (updated in
  the last 7 days)
- **Quick copy** — one click copies a note to the clipboard
- **Dark & light mode** — follows the system theme, with a manual toggle and
  a System/Light/Dark setting
- **Backups** — export/import a portable JSON file; clear all data from the
  settings dialog
- **Keyboard-first** — `/` or `Ctrl+K` search · `n` new note · `Ctrl+Enter`
  save · `Esc` close/clear · rebindable "open extension" shortcut (default
  `Alt+Shift+N` / `Cmd+Shift+N`, configurable in your browser's extension
  keyboard settings)

## Privacy

Everything is stored locally:

- **Notes** → IndexedDB (via Dexie), origin-scoped to the extension
- **Settings** → `browser.storage.local`
- **Zero network activity** — the bundle makes no requests, and there is no
  analytics or telemetry of any kind. Uninstalling the extension removes all
  data.

## Architecture

Feature-based layering; each layer only talks to the one below it:

```text
src/
├── entrypoints/popup/     # thin mount: HTML + React root + theme CSS
├── components/            # cross-feature components
│   └── ui/                # shadcn-style primitives (button, dialog, …)
├── features/
│   ├── notes/             # card, grid, editor dialog
│   ├── tags/              # tag input, chip list, filter bar
│   ├── search/            # pure search/filter/sort logic
│   └── settings/          # settings dialog (theme, export/import, danger zone)
├── stores/                # Zustand: notes, filters, ui
├── db/                    # Dexie database + repositories (only I/O layer)
├── hooks/                 # useTheme, useAppShortcuts, useDebouncedValue
├── utils/                 # cn, tags, format, export-import (pure)
└── types/                 # domain models (Note, settings)
```

### Data flow

```text
UI event ──► Zustand action ──► repository (db/) ──► IndexedDB (Dexie)
   ▲                                                   │
   └── memoized selectors ◄── store state ◄────────────┘
```

- The **store is the single source of truth in memory**; mutations go through
  repositories and update state optimistically (import re-reads to merge).
- **Search** is a pure function over the in-memory list (`features/search`),
  with per-note haystack caching — comfortably handles thousands of notes.
  Dexie indexes (`updatedAt`, `createdAt`) cover persisted ordering.
- Nothing writes to disk until you press **Save**; editor drafts are local.

### Data model

```ts
type Note = {
  id: string; // crypto.randomUUID()
  content: string;
  tags: string[]; // normalized: lowercase, trimmed, deduped
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
};
```

Export format: `{ app: "note-tracker", version: 1, exportedAt, notes: [...] }`.
Import sanitizes every entry and skips malformed ones (reported in a toast).

## Development

```bash
npm install        # also runs `wxt prepare` to generate types
npm run dev        # load the extension from .output/chrome-mv3 (auto-reload)
npm run build      # production build → .output/chrome-mv3
npm run build:ff   # firefox build (see package.json / `wxt build -b firefox`)
npm run test       # vitest (search, storage, utils)
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npm run format     # prettier
```

Load it: Chrome → `chrome://extensions` → enable **Developer mode** →
**Load unpacked** → select `.output/chrome-mv3`.

## Browser compatibility

Chrome, Edge, Brave (Chromium, Manifest V3) and Firefox (MV2 build via WXT).
All WebExtension APIs are accessed through WXT's cross-browser `browser`
abstraction; the only permission requested is `storage`.
