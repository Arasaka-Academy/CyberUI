// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { createRequire } from 'node:module';
import { compile } from 'tailwindcss';
import postcss from 'postcss';
import { build } from 'vite';
import tailwindcss from '@tailwindcss/vite';

const require = createRequire(import.meta.url);
async function compileStyles(css: string) {
  const result = await compile(css, {
    base: resolve('packages/react/src'),
    loadStylesheet: async (specifier, base) => {
      const path = specifier.startsWith('.') ? resolve(base, specifier) : require.resolve(specifier);
      return { path, base: dirname(path), content: readFileSync(path, 'utf8') };
    },
  });
  return postcss.parse(result.build([]));
}

describe('shared Tailwind foundation', () => {
  it('resolves semantic tokens on the element without emitting referenced theme defaults', async () => {
    const style = await compileStyles("@reference './tailwind-theme.css'; @layer components { .probe { @apply tw:p-cyber-md tw:text-cyber-accent tw:font-semibold tw:animate-cyber-spin; } }");
    const values: Record<string, string> = {};
    style.walkRules('.probe', rule => { rule.walkDecls(decl => { values[decl.prop] = decl.value; }); });
    expect(values.padding).toBe('var(--cyber-space-md)');
    expect(values.color).toBe('var(--cyber-accent)');
    expect(values['font-weight']).toBe('600');
    expect(values.animation).toBe('var(--cyber-motion-spin)');
    expect(style.toString()).not.toMatch(/--tw-font-weight-semibold:|@apply|@reference/);
  });

  it('keeps component rules layered and preserves native geometric drawing after compilation', async () => {
    const directory = 'packages/react/src';
    for (const name of readdirSync(directory).filter(name => name.endsWith('.module.css'))) {
      const source = readFileSync(resolve(directory, name), 'utf8');
      const ast = postcss.parse(source);
      expect(ast.nodes.some(node => node.type === 'atrule' && node.name === 'reference'), name).toBe(true);
      expect(ast.nodes.some(node => node.type === 'atrule' && node.name === 'layer' && node.params === 'components' && node.nodes), name).toBe(true);
      expect(ast.nodes.some(node => node.type === 'rule'), `${name}: unlayered rules`).toBe(false);
    }
    const style = await compileStyles(readFileSync(resolve(directory, 'button.module.css'), 'utf8'));
    expect(style.toString()).toContain('clip-path: polygon');
    expect(style.toString()).toContain('padding: var(--cyber-space-md) 22px');
    expect(style.toString()).not.toMatch(/@apply|@reference/);
  });

  it('builds shared form styles without leaving Tailwind directives in consumer CSS', async () => {
    const result = await build({
      configFile: false, logLevel: 'silent', plugins: [tailwindcss()],
      build: { write: false, cssMinify: false, lib: { entry: 'packages/react/src/textarea.tsx', formats: ['es'], fileName: 'probe' }, rollupOptions: { external: [/^react($|\/)/, /^react-dom/, /^react-aria/, /^@cyberui\//] } },
    });
    const assets = (Array.isArray(result) ? result : [result]).flatMap(output => 'output' in output ? output.output : []);
    const css = assets.flatMap(asset => asset.type === 'asset' && asset.fileName.endsWith('.css') ? [String(asset.source)] : []).join('\n');
    expect(css).not.toBe('');
    expect(css).not.toMatch(/@(apply|reference)\b/);
    expect(css).toContain('padding: var(--cyber-space-md) 13px');
  });
});
