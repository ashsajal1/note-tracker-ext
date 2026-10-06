# Changelog

All notable changes to Note Tracker.

## [1.2.0] - 2026-10-06 - Power Notes Release

Eight new features, all local-first. Storage migrates to schema v2 (`deletedAt` index); pre-v2 records and legacy backups normalize on read/import.

### Added
- **Trash** - Delete moves notes to trash with restore, trash view with search, empty trash, delete-forever confirmation, and 30-day auto-purge on startup.
- **Pin Notes** - Pin toggle on cards and detail view; pinned notes sort first in every sort order.
- **Duplicate Note** - Clone any note (fresh id/timestamps) from the note actions menu.
- **Image Support** - Paste, drag-drop, or toolbar-insert images, embedded as data URLs (3 MB guard per image).
- **Search Operators** - `"exact phrase"` matching plus `-term` / `-"phrase"` exclusions, with a tooltip on the search box.
- **Markdown Export** - Export all active notes as a single readable `.md` document (date sections, tags, pinned markers).
- **Keyboard Card Navigation** - `j`/`k` move focus (wraps), `Enter` opens, `e` edits, `x` trashes, `Esc` unfocuses; documented in Settings.
- **Note Templates** - New-note split button with Blank, Meeting, Daily log, and Reading templates; `{{date}}` fills in automatically.
- **Full-Page Editor** - Create/edit opens a dedicated page (no modal) with autofocus, word count, and a borderless writing surface.
- **Scrollable Tag Rows** - Single-row tag strips with wheel + cursor-drag scrolling and edge fade hints, on cards and the filter bar.

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
