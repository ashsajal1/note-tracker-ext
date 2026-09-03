# Changelog

All notable changes to Note Tracker.

## [1.1.0] - 2026-09-03 - Second Chrome Release

Fast, private, local-first note tracker. All data stays in your browser (IndexedDB + `storage.local`), zero network requests.

### Added
- **Rich Text Editor** - Tiptap WYSIWYG with bold, italic, underline, highlight (multicolor), headings, lists, blockquote, and code blocks. Note cards render formatted HTML (`src/components/ui/tiptap-editor.tsx`, `src/components/ui/tiptap.css`).
- **Note Detail View** - Clicking a card opens a dedicated detail view with back button; pencil icon opens editor directly (`src/features/notes/note-detail-view.tsx`).
- **Tag Autocomplete** - Suggests previously used tags while typing.
- **Full Screen Mode** - Open popup in a full browser tab + native fullscreen toggle from header.
- **Preview & UX** - More preview text per card, widened popup to 800px.
- **Firefox Support** - Added `browser_specific_settings` and `data_collection_permissions` (`wxt.config.ts:13`).
- **Tests** - Vitest coverage for search, storage, utils, format and HTML handling.

### Fixed
- Fix popup width collapse from viewport-unit max-width
- Fix `default_locale` load error when `_locales` missing

### Changed
- Docs: added dark mode screenshot to README

## [1.0.0] - Initial Release
- Notes with tags, instant search (debounced 120ms, partial + multi-keyword), tag filtering (AND), sorting (newest/oldest/recently updated/7 days), quick copy, dark/light/system theme, export/import JSON, clear data, keyboard shortcuts (`/`, `Ctrl+K`, `n`, `Ctrl+Enter`, `Esc`, `Alt+Shift+N`), local-first storage (Dexie + Zustand).
