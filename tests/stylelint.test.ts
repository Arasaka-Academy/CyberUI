// @vitest-environment node
import { describe, expect, it } from 'vitest';
import stylelint from 'stylelint';

const lint = (code: string) => stylelint.lint({ code, codeFilename: 'packages/react/src/example.module.css', configFile: 'stylelint.config.mjs' });

describe('style token conventions', () => {
  it('rejects raw values covered by spacing and motion tokens', async () => {
    const result = await lint('.layout { gap: 10px; margin: -24px; transition: opacity 120ms; }');
    expect(result.errored).toBe(true);
    expect(result.results[0].warnings.filter(warning => warning.rule === 'declaration-property-value-disallowed-list')).toHaveLength(3);
  });

  it('allows Tailwind references, token utilities and exact geometry', async () => {
    const result = await lint("@reference './tailwind-theme.css'; @layer components { .layout { @apply tw:flex tw:gap-cyber-md tw:p-[13px] tw:text-[length:14px]; clip-path: polygon(0 0, 100% 0, 100% 8px); transition: opacity var(--cyber-state-duration); } }");
    expect(result.errored).toBe(false);
  });

  it('rejects covered pixel values inside spacing utilities and unsafe CSS composition', async () => {
    const result = await lint(".layout { @apply tw:gap-[10px] tw:p-[0_24px]; composes: field from './field.module.css'; }");
    expect(result.errored).toBe(true);
    expect(result.results[0].warnings.filter(warning => warning.rule === 'cyberui/token-utilities')).toHaveLength(2);
    expect(result.results[0].warnings.some(warning => warning.rule === 'property-disallowed-list')).toBe(true);
  });
});
