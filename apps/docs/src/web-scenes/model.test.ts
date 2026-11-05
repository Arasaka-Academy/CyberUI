import { describe, expect, it, vi } from 'vitest';
import { dashboardMetrics, hydrateWebState, initialWebState, text, webReducer } from './model';
import { startSimulation } from './simulation';

describe('independent Web scene models', () => {
  it('keeps task mutations, derived metrics and history consistent', () => {
    let state = initialWebState();
    expect(state.dashboard.tasks).toHaveLength(12);
    state = webReducer(state, { type: 'task-status', id: 'ORB-101', status: 'done' });
    expect(dashboardMetrics(state.dashboard.tasks)).toEqual({ active: 3, open: 8, completed: 4, due: 5 });
    expect(state.dashboard.activities).toHaveLength(4);
    state = webReducer(state, { type: 'save-task', task: { ...state.dashboard.tasks[0], id: 'new-task', title: ' New delivery ', status: 'todo' } });
    expect(state.dashboard.tasks.at(-1)?.title).toBe('New delivery');
    state = webReducer(state, { type: 'delete-task', id: 'new-task' });
    expect(state.dashboard.tasks).toHaveLength(12);
  });
  it('rejects blank tasks and preserves chats on dashboard reset', () => {
    const state = initialWebState();
    expect(webReducer(state, { type: 'save-task', task: { ...state.dashboard.tasks[0], title: '  ' } })).toBe(state);
    const updated = webReducer(state, { type: 'draft', id: 'welcome', value: 'draft to keep' });
    expect(webReducer(updated, { type: 'reset-scene', scene: 'dashboard' }).chats).toBe(updated.chats);
  });
  it('does not treat an undated task as overdue', () => {
    const task = { ...initialWebState().dashboard.tasks[0], due: '' };
    expect(dashboardMetrics([task]).due).toBe(0);
  });
  it('keeps a running response when the active conversation is selected again', () => {
    const state = webReducer(initialWebState(), { type: 'send', id: 'welcome', messageId: 'same-session', prompt: 'Hello', scenario: 'plan', locale: 'en', fail: false });
    expect(webReducer(state, { type: 'select-chat', id: 'welcome' })).toBe(state);
  });
  it('streams once, stops on navigation, retries without duplicating the user message', () => {
    let state = webReducer(initialWebState(), { type: 'send', id: 'welcome', messageId: 'run1', prompt: '你好', scenario: 'plan', locale: 'zh-CN', fail: false });
    state = webReducer(state, { type: 'send', id: 'welcome', messageId: 'duplicate', prompt: 'Again', scenario: 'plan', locale: 'en', fail: false });
    expect(state.chats.conversations[0].messages).toHaveLength(2);
    for (let i = 0; i < 7; i++) state = webReducer(state, { type: 'tick', id: 'welcome', messageId: 'run1' });
    expect(state.chats.conversations[0].messages[1].visible).toBe(96);
    state = webReducer(state, { type: 'select-chat', id: 'code-sample' });
    expect(state.chats.conversations[0].messages[1].status).toBe('stopped');
    const stopped = state;
    state = webReducer(state, { type: 'tick', id: 'welcome', messageId: 'run1' });
    expect(state.chats.conversations[0].messages).toEqual(stopped.chats.conversations[0].messages);
    state = webReducer(state, { type: 'retry', id: 'welcome', messageId: 'run1' });
    for (let i = 0; i < 40; i++) state = webReducer(state, { type: 'tick', id: 'welcome', messageId: 'run1' });
    expect(state.chats.conversations[0].messages).toHaveLength(2);
    expect(state.chats.conversations[0].messages[1].status).toBe('completed');
    expect(text(state.chats.conversations[0].messages[1].content, 'en')).toContain('你的需求：你好');
  });
  it('fails deterministically, then retries successfully', () => {
    let state = webReducer(initialWebState(), { type: 'send', id: 'welcome', messageId: 'failure', prompt: 'test', scenario: 'research', locale: 'en', fail: true });
    for (let i = 0; i < 4; i++) state = webReducer(state, { type: 'tick', id: 'welcome', messageId: 'failure' });
    expect(state.chats.conversations[0].messages[1].status).toBe('error');
    state = webReducer(state, { type: 'retry', id: 'welcome', messageId: 'failure' });
    expect(state.chats.conversations[0].messages[1].fail).toBe(false);
  });
  it('normalizes interrupted work on reload and recovers from invalid storage', () => {
    const active = webReducer(initialWebState(), { type: 'send', id: 'welcome', messageId: 'reload', prompt: 'test', scenario: 'plan', locale: 'en', fail: false });
    expect(hydrateWebState(JSON.stringify(active)).chats.conversations[0].messages[1].status).toBe('stopped');
    expect(hydrateWebState('{broken')).toEqual(initialWebState());
    expect(hydrateWebState(JSON.stringify({ ...active, chats: { conversations: [{ ...active.chats.conversations[0], messages: [{ tools: null }] }] } }))).toEqual(initialWebState());
  });
  it('cancels the simulated clock without stale updates', () => {
    vi.useFakeTimers();
    try {
      const tick = vi.fn(); const cancel = startSimulation(tick);
      vi.advanceTimersByTime(450); expect(tick).toHaveBeenCalledTimes(5);
      cancel(); vi.advanceTimersByTime(900); expect(tick).toHaveBeenCalledTimes(5);
    } finally { vi.useRealTimers(); }
  });
});
