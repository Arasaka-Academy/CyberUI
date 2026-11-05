export const tracks = [
  { id: 'night-drive', title: 'Night Drive', artist: 'Mira Sol', duration: 184, mood: { en: 'Electronic · After dark', zh: '电子 · 夜行' }, cover: 'drive' },
  { id: 'soft-signal', title: 'Soft Signal', artist: 'Low Orbit', duration: 212, mood: { en: 'Ambient · Slow down', zh: '氛围 · 放慢脚步' }, cover: 'signal' },
  { id: 'orbital', title: 'Orbital', artist: 'Parallel Lines', duration: 167, mood: { en: 'House · In motion', zh: '浩室 · 流动' }, cover: 'orbit' },
  { id: 'after-hours', title: 'After Hours', artist: 'Mira Sol', duration: 246, mood: { en: 'Downtempo · Late nights', zh: '慢拍 · 深夜' }, cover: 'hours' },
  { id: 'open-frequency', title: 'Open Frequency', artist: 'Static Bloom', duration: 198, mood: { en: 'Electronic · Clear skies', zh: '电子 · 晴空' }, cover: 'frequency' },
  { id: 'first-light', title: 'First Light', artist: 'Low Orbit', duration: 175, mood: { en: 'Ambient · A new day', zh: '氛围 · 新的一天' }, cover: 'light' },
] as const;
export type Track = typeof tracks[number];
export const playlists = [
  { id: 'night-shift', title: { en: 'Night shift', zh: '夜间频率' }, description: { en: 'The city settles. Your mind starts moving.', zh: '城市渐静，思绪开始流动。' }, tracks: ['night-drive', 'after-hours', 'orbital'], cover: 'drive' },
  { id: 'deep-focus', title: { en: 'Deep focus', zh: '进入心流' }, description: { en: 'A little space for your next good idea.', zh: '为下一个好想法，留一点空间。' }, tracks: ['soft-signal', 'first-light', 'open-frequency'], cover: 'signal' },
  { id: 'in-transit', title: { en: 'In transit', zh: '在路上' }, description: { en: 'Find a different rhythm on your way home.', zh: '回家的路上，换一种节奏。' }, tracks: ['orbital', 'open-frequency', 'night-drive', 'first-light'], cover: 'orbit' },
] as const;
export interface MusicState { trackId: string; queue: string[]; position: number; playing: boolean; volume: number; favorites: string[] }
export function initialMusic(): MusicState { return { trackId: tracks[0].id, queue: tracks.map(t => t.id), position: 0, playing: false, volume: 65, favorites: [] }; }
export type MusicAction =
  | { type: 'play' | 'pause' | 'tick' | 'next' | 'previous' }
  | { type: 'select'; trackId: string; queue?: readonly string[] }
  | { type: 'seek'; position: number }
  | { type: 'volume'; volume: number }
  | { type: 'favorite'; trackId: string }
  | { type: 'move'; trackId: string; direction: -1 | 1 };
const knownTrack = (id: string) => tracks.some(t => t.id === id);
export function musicReducer(state: MusicState, action: MusicAction): MusicState {
  const track = tracks.find(t => t.id === state.trackId)!;
  const index = state.queue.indexOf(state.trackId);
  switch (action.type) {
    case 'play': return state.playing ? state : { ...state, playing: true, position: state.position >= track.duration ? 0 : state.position };
    case 'pause': return state.playing ? { ...state, playing: false } : state;
    case 'tick': {
      if (!state.playing) return state;
      if (state.position + 1 < track.duration) return { ...state, position: state.position + 1 };
      const next = state.queue[index + 1];
      return next ? { ...state, trackId: next, position: 0 } : { ...state, position: track.duration, playing: false };
    }
    case 'next': return { ...state, trackId: state.queue[(index + 1) % state.queue.length], position: 0 };
    case 'previous': return { ...state, trackId: state.position > 3 ? state.trackId : state.queue[(index - 1 + state.queue.length) % state.queue.length], position: 0 };
    case 'select': {
      if (!knownTrack(action.trackId)) return state;
      const queue = action.queue ? [...new Set(action.queue.filter(knownTrack))] : state.queue.includes(action.trackId) ? state.queue : tracks.map(t => t.id);
      if (!queue.includes(action.trackId)) return state;
      return { ...state, trackId: action.trackId, position: 0, playing: true, queue };
    }
    case 'seek': return Number.isFinite(action.position) ? { ...state, position: Math.max(0, Math.min(track.duration, action.position)) } : state;
    case 'volume': return Number.isFinite(action.volume) ? { ...state, volume: Math.max(0, Math.min(100, action.volume)) } : state;
    case 'favorite': return knownTrack(action.trackId) ? { ...state, favorites: state.favorites.includes(action.trackId) ? state.favorites.filter(id => id !== action.trackId) : [...state.favorites, action.trackId] } : state;
    case 'move': {
      const from = state.queue.indexOf(action.trackId); const to = from + action.direction;
      if (from < 0 || to < 0 || to >= state.queue.length) return state;
      const queue = [...state.queue]; [queue[from], queue[to]] = [queue[to], queue[from]];
      return { ...state, queue };
    }
  }
}
export function hydrateMusic(value: unknown): MusicState {
  if (!value || typeof value !== 'object') return initialMusic();
  const saved = value as MusicState;
  if (!knownTrack(saved.trackId) || !Array.isArray(saved.queue) || !saved.queue.length || !saved.queue.every(knownTrack) || !saved.queue.includes(saved.trackId) || !Number.isFinite(saved.position) || !Number.isFinite(saved.volume) || !Array.isArray(saved.favorites) || !saved.favorites.every(knownTrack)) return initialMusic();
  const duration = tracks.find(t => t.id === saved.trackId)!.duration;
  return { trackId: saved.trackId, queue: [...new Set(saved.queue)], position: Math.max(0, Math.min(duration, saved.position)), playing: false, volume: Math.max(0, Math.min(100, saved.volume)), favorites: [...new Set(saved.favorites)] };
}
export function formatTime(seconds: number) { return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`; }
