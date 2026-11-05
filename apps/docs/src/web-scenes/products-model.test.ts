import { describe, expect, it } from 'vitest';
import { hydrateWebState, initialWebState, webReducer } from './model';

describe('music and blog product state', () => {
  it('advances the playback queue when a simulated track reaches its end', () => {
    let state = webReducer(initialWebState(), { type: 'music', action: { type: 'play' } });
    state = webReducer(state, { type: 'music', action: { type: 'seek', position: 183 } });
    state = webReducer(state, { type: 'music', action: { type: 'tick' } });
    expect(state).toMatchObject({ music: { trackId: 'soft-signal', position: 0, playing: true } });
    state = webReducer(state, { type: 'music', action: { type: 'select', trackId: 'first-light' } });
    state = webReducer(state, { type: 'music', action: { type: 'seek', position: 175 } });
    state = webReducer(state, { type: 'music', action: { type: 'tick' } });
    expect(state.music).toMatchObject({ trackId: 'first-light', position: 175, playing: false });
  });

  it('ignores stale ticks after pausing and bounds seek and volume values', () => {
    let state = webReducer(initialWebState(), { type: 'music', action: { type: 'play' } });
    state = webReducer(state, { type: 'music', action: { type: 'tick' } });
    state = webReducer(state, { type: 'music', action: { type: 'pause' } });
    const paused = state;
    state = webReducer(state, { type: 'music', action: { type: 'tick' } });
    expect(state).toMatchObject({ music: { position: 1, playing: false } });
    expect(state.music).toBe(paused.music);
    state = webReducer(state, { type: 'music', action: { type: 'seek', position: -20 } });
    state = webReducer(state, { type: 'music', action: { type: 'volume', volume: 120 } });
    expect(state.music).toMatchObject({ position: 0, volume: 100 });
    expect(webReducer(state, { type: 'music', action: { type: 'seek', position: NaN } })).toBe(state);
    expect(webReducer(state, { type: 'music', action: { type: 'select', trackId: 'missing' } })).toBe(state);
  });

  it('restores playback paused while retaining position, favorites and the queue', () => {
    let state = webReducer(initialWebState(), { type: 'music', action: { type: 'select', trackId: 'orbital' } });
    state = webReducer(state, { type: 'music', action: { type: 'seek', position: 42 } });
    state = webReducer(state, { type: 'music', action: { type: 'favorite', trackId: 'orbital' } });
    const restored = hydrateWebState(JSON.stringify(state));
    expect(restored).toMatchObject({ music: { trackId: 'orbital', position: 42, playing: false, favorites: ['orbital'] } });
    expect(restored.music.queue).toContain('orbital');
  });

  it('loads old version-one records without discarding tasks or chat drafts', () => {
    const original = webReducer(initialWebState(), { type: 'draft', id: 'welcome', value: 'Keep this draft' });
    const legacy = { ...original, music: undefined, blog: undefined };
    const restored = hydrateWebState(JSON.stringify(legacy));
    expect(restored.chats.conversations[0].draft).toBe('Keep this draft');
    expect(restored.dashboard.tasks).toEqual(original.dashboard.tasks);
    expect(restored).toMatchObject({ music: { trackId: 'night-drive', playing: false }, blog: { bookmarks: [] } });
  });

  it('restores a reordered playlist queue without starting playback', () => {
    let state = webReducer(initialWebState(), { type: 'music', action: { type: 'select', trackId: 'orbital', queue: ['orbital', 'after-hours', 'night-drive'] } });
    state = webReducer(state, { type: 'music', action: { type: 'move', trackId: 'night-drive', direction: -1 } });
    const restored = hydrateWebState(JSON.stringify(state));
    expect(restored.music.queue).toEqual(['orbital', 'night-drive', 'after-hours']);
    expect(restored.music).toMatchObject({ trackId: 'orbital', playing: false });
    expect(webReducer(restored, { type: 'music', action: { type: 'move', trackId: 'orbital', direction: -1 } })).toBe(restored);
  });

  it('recovers a damaged new section independently of existing data and other products', () => {
    let state = webReducer(initialWebState(), { type: 'draft', id: 'welcome', value: 'Preserve existing work' });
    state = webReducer(state, { type: 'blog', action: { type: 'bookmark', slug: 'relay-2-4' } });
    const restored = hydrateWebState(JSON.stringify({ ...state, music: { trackId: 'unknown', queue: null } }));
    expect(restored.chats.conversations[0].draft).toBe('Preserve existing work');
    expect(restored).toMatchObject({ music: { trackId: 'night-drive', playing: false }, blog: { bookmarks: ['relay-2-4'] } });
  });

  it('keeps favorites unique and resets only the chosen product', () => {
    let state = webReducer(initialWebState(), { type: 'music', action: { type: 'favorite', trackId: 'night-drive' } });
    state = webReducer(state, { type: 'blog', action: { type: 'bookmark', slug: 'relay-2-4' } });
    state = webReducer(state, { type: 'music', action: { type: 'favorite', trackId: 'night-drive' } });
    expect(state).toMatchObject({ music: { favorites: [] }, blog: { bookmarks: ['relay-2-4'] } });
    const reset = webReducer(state, { type: 'reset-scene', scene: 'mobile-app' });
    expect(reset.blog).toBe(state.blog);
    expect(reset.dashboard).toBe(state.dashboard);
    expect(reset.chats).toBe(state.chats);
    expect(reset.music.playing).toBe(false);
    expect(webReducer(reset, { type: 'reset-scene', scene: 'blog' }).blog.bookmarks).toEqual([]);
  });
});
