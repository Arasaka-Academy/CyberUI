import { describe, expect, it } from 'vitest';
import { contrast, createTheme, schemes } from './index';

describe('source palettes and accessible theme resolution', () => {
  it('preserves the original Neon identity', () => {
    const t = createTheme('neon', 'dark');
    expect(t.bg).toBe('#1E1517');
    expect(t.ink).toBe('#93E4EA');
    expect(t.accent).toBe('#E0574B');
  });
  it('keeps body and filled-control text readable across seven palettes and two modes', () => {
    expect(Object.keys(schemes)).toHaveLength(7);
    for (const scheme of Object.keys(schemes)) for (const mode of ['light', 'dark'] as const) {
      const t = createTheme(scheme as keyof typeof schemes, mode);
      expect(contrast(t.ink, t.bg)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t.muted, t.bg)).toBeGreaterThanOrEqual(4.5);
      for (const foreground of [t.ink,t.muted,t.accentText,t.success,t.warning,t.danger]) {
        expect(contrast(foreground,t.bg)).toBeGreaterThanOrEqual(4.5);
        expect(contrast(foreground,t.soft)).toBeGreaterThanOrEqual(4.5);
      }
      expect(contrast(t.onAccent, t.accent)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t.onAccent2, t.accent2)).toBeGreaterThanOrEqual(4.5);
    }
  });
  it('derives readable foregrounds for a custom theme without mutating the original palette', () => {
    const t = createTheme('neon', 'dark', { accent: '#ffffff', accent2: '#000000' });
    expect(contrast(t.onAccent, t.accent)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(t.onAccent2, t.accent2)).toBeGreaterThanOrEqual(4.5);
    expect(schemes.neon.dark.accent).toBe('#E0574B');
  });
});
