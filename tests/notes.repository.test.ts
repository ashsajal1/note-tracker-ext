import { beforeEach, describe, expect, it } from 'vitest';
import * as repo from '@/db/notes.repository';

beforeEach(async () => {
  await repo.clearAllNotes();
});

describe('notes.repository', () => {
  it('creates a note with generated id and timestamps', async () => {
    const created = await repo.createNote({ content: 'hello', tags: ['a'] });
    expect(created.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(created.content).toBe('hello');
    expect(created.tags).toEqual(['a']);
    expect(created.createdAt).toBe(created.updatedAt);

    const all = await repo.getAllNotes();
    expect(all).toHaveLength(1);
    expect(all[0]).toEqual(created);
  });

  it('updates content/tags and bumps updatedAt but keeps createdAt', async () => {
    const created = await repo.createNote({ content: 'v1', tags: [] });
    await new Promise((r) => setTimeout(r, 5));
    const updated = await repo.updateNote(created.id, { content: 'v2', tags: ['x'] });

    expect(updated?.content).toBe('v2');
    expect(updated?.tags).toEqual(['x']);
    expect(updated?.createdAt).toBe(created.createdAt);
    expect(Date.parse(updated!.updatedAt)).toBeGreaterThan(Date.parse(created.updatedAt));

    const all = await repo.getAllNotes();
    expect(all).toHaveLength(1);
    expect(all[0]?.content).toBe('v2');
  });

  it('updateNote returns undefined for unknown ids', async () => {
    await expect(repo.updateNote('missing', { content: 'x', tags: [] })).resolves.toBeUndefined();
  });

  it('deletes notes', async () => {
    const created = await repo.createNote({ content: 'bye', tags: [] });
    await repo.deleteNote(created.id);
    expect(await repo.getAllNotes()).toHaveLength(0);
  });

  it('bulk upserts insert new ids and overwrite existing ones', async () => {
    const first = await repo.createNote({ content: 'v1', tags: [] });
    const extra = await repo.createNote({ content: 'other', tags: [] });

    const edited = { ...first, content: 'v1-imported' };
    await repo.bulkUpsertNotes([edited, extra]);

    const all = await repo.getAllNotes();
    expect(all).toHaveLength(2);
    expect(all.find((n) => n.id === first.id)?.content).toBe('v1-imported');
  });

  it('counts and clears', async () => {
    await repo.createNote({ content: '1', tags: [] });
    await repo.createNote({ content: '2', tags: [] });
    expect(await repo.countNotes()).toBe(2);
    await repo.clearAllNotes();
    expect(await repo.countNotes()).toBe(0);
  });
});
