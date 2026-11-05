import { describe, expect, it } from 'vitest';
import { demoReducer, initialDemoState, shopItems } from './model';

describe('replica demo transactions', () => {
  it('renames a book without losing its progress or collection membership', () => {
    const before = initialDemoState(); const book = before.books[0];
    const after = demoReducer(before, { type: 'rename', id: book.id, title: 'New title' });
    expect(after.books[0].title).toBe('New title');
    expect(after.books[0].progress).toBe(book.progress);
    expect(after.books[0].collections).toEqual(book.collections);
    expect(before.books[0].title).not.toBe('New title');
  });
  it('restores a trashed book and all its reading data', () => {
    const state = initialDemoState(); const id = state.books[0].id;
    const trashed = demoReducer(state, { type: 'trash', id });
    expect(trashed.books[0].trashed).toBe(true);
    const restored = demoReducer(trashed, { type: 'restore', id });
    expect(restored.books[0]).toEqual({ ...state.books[0], trashed: false });
  });
  it('prevents a purchase when balance is insufficient', () => {
    const state = initialDemoState(); const costly = shopItems.find(item => item.price > state.balance)!;
    const after = demoReducer(state, { type: 'purchase', id: costly.id });
    expect(after.balance).toBe(state.balance); expect(after.owned).not.toContain(costly.id);
  });
  it('charges once, equips an owned appearance, and prevents duplicate purchases', () => {
    const state = initialDemoState(); const item = shopItems.find(item => item.price === 100)!;
    const bought = demoReducer(state, { type: 'purchase', id: item.id });
    expect(bought.balance).toBe(state.balance - 100);
    expect(bought.equipped[item.category]).toBe(item.id);
    const again = demoReducer(bought, { type: 'purchase', id: item.id });
    expect(again.balance).toBe(bought.balance);
  });
  it('pays a reading milestone only when a gig advances and resets all demo state', () => {
    let state = initialDemoState(); const id = 'carbon';
    state = demoReducer(state, { type: 'take-gig', id });
    const start = state.balance;
    state = demoReducer(state, { type: 'read', id, progress: 10 });
    expect(state.balance).toBeGreaterThan(start);
    const same = demoReducer(state, { type: 'read', id, progress: 10 });
    expect(same.balance).toBe(state.balance);
    expect(demoReducer(same, { type: 'reset' })).toEqual(initialDemoState());
  });
});
