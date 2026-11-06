// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, basename, dirname } from 'node:path';
import ts from 'typescript';
import postcss from 'postcss';
import { registrySchema } from 'shadcn/schema';

const manifest = JSON.parse(readFileSync('registry.json', 'utf8'));

describe('GitHub registry source delivery', () => {
  it('has 65 unique schema-valid component entries and no cross-ref dependency fetches', () => {
    expect(() => registrySchema.parse(manifest)).not.toThrow();
    expect(manifest.items).toHaveLength(65);
    expect(new Set(manifest.items.map((item: {name:string}) => item.name)).size).toBe(65);
    for (const item of manifest.items) expect(item.registryDependencies ?? []).toEqual([]);
  });

  it('makes every component self-contained including type imports, CSS, provider and licenses', () => {
    for (const item of manifest.items) {
      const paths = new Set<string>(item.files.map((file: {path:string}) => resolve(file.path)));
      const targets = item.files.map((file: {target:string}) => file.target);
      expect(new Set(targets).size).toBe(targets.length);
      expect(targets).toContain('@components/cyberui/provider.tsx');
      expect(targets).toContain('@components/cyberui/styles.css');
      expect(targets).toContain('@components/cyberui/tokens.css');
      expect(targets).toContain('@components/cyberui/motion.css');
      expect(targets).toContain('@components/cyberui/tailwind-theme.css');
      expect(targets).toContain('@components/cyberui/LICENSE');
      for (const path of paths) {
        const content = readFileSync(path, 'utf8');
        if (path.endsWith('.css')) {
          const style = postcss.parse(content);
          const dependencies: string[] = [];
          style.walkAtRules(rule => {
            if (!['import', 'reference'].includes(rule.name)) return;
            const match = rule.params.match(/^(['"])([^'"]+)\1/);
            expect(match, `${item.name}: unsupported CSS import`).not.toBeNull();
            dependencies.push(match![2]);
          });
          style.walkDecls('composes', declaration => {
            const match = declaration.value.match(/\bfrom\s+(['"])([^'"]+)\1/);
            if (match) dependencies.push(match[2]);
          });
          for (const dependency of dependencies) {
            if (dependency.startsWith('tailwindcss/')) {
              expect(item.devDependencies).toContain('tailwindcss@4.3.4');
              continue;
            }
            expect(dependency).toMatch(/^\.\/[^/]+\.css$/);
            expect(paths.has(resolve(dirname(path), dependency)), `${item.name}: missing CSS dependency ${dependency}`).toBe(true);
          }
        }
        if (!/\.tsx?$/.test(path)) continue;
        const file = ts.createSourceFile(path, content, ts.ScriptTarget.Latest, true);
        for (const statement of file.statements) {
          if (!(ts.isImportDeclaration(statement) || ts.isExportDeclaration(statement)) || !statement.moduleSpecifier || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
          const specifier = statement.moduleSpecifier.text;
          expect(specifier).not.toMatch(/@cyberui|workspace:|packages\//);
          if (specifier.startsWith('.')) {
            expect([specifier, specifier+'.ts', specifier+'.tsx'].some(s => paths.has(resolve(dirname(path), s))), `${item.name}: missing ${specifier}`).toBe(true);
          } else {
            const pkg = specifier.startsWith('@') ? specifier.split('/').slice(0,2).join('/') : specifier.split('/')[0];
            expect(item.dependencies.some((d:string) => d.startsWith(pkg+'@')), `${item.name}: undeclared ${pkg}`).toBe(true);
          }
        }
      }
      // The CLI copies prefixed utilities and CSS Module references verbatim.
      for (const file of item.files) expect(file.type).toBe('registry:file');
    }
  });

  it('installs graph and CSS dependencies on demand', () => {
    const button = manifest.items.find((item:{name:string}) => item.name === 'button');
    const chart = manifest.items.find((item:{name:string}) => item.name === 'chart');
    expect(button.dependencies.some((d:string) => d.startsWith('recharts@'))).toBe(false);
    for (const item of manifest.items) expect(item.dependencies.some((d:string) => /tailwind/i.test(d))).toBe(false);
    for (const item of manifest.items) expect(item.devDependencies).toEqual(['tailwindcss@4.3.4']);
    expect(chart.dependencies.some((d:string) => d.startsWith('recharts@'))).toBe(true);
    expect(button.files.some((f:{path:string}) => basename(f.path) === 'input.tsx')).toBe(false);
    const all = new Set<string>(manifest.items.flatMap((item:{files:{path:string}[]}) => item.files.map(f=>f.path)));
    for (const path of all) {
      if (!path.endsWith('.tsx')) continue;
      const source = readFileSync(path, 'utf8');
      const classes = [...source.matchAll(/\bs\.([A-Za-z_]\w*)/g)].map(m=>m[1]);
      if (!classes.length) continue;
      const css = readFileSync(path.replace('.tsx','.module.css'), 'utf8');
      const defined = new Set<string>();
      postcss.parse(css).walkRules(rule=>{for(const m of rule.selector.matchAll(/\.([A-Za-z_]\w*)/g))defined.add(m[1]);});
      for(const name of classes)expect(defined.has(name), `${path}: missing CSS for ${name}`).toBe(true);
    }
  });
});
