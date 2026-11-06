import ts from 'typescript';
import { registrySchema } from 'shadcn/schema';
import postcss from 'postcss';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, unlinkSync } from 'node:fs';
import { resolve, relative, basename, extname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const root = fileURLToPath(new URL('../', import.meta.url));
const reactRoot = resolve(root, 'packages/react/src');
const tokenRoot = resolve(root, 'packages/tokens/src');
const destination = 'registry/cyberui';
const packageInfo = JSON.parse(readFileSync(resolve(root, 'packages/react/package.json'), 'utf8'));
const toolingInfo = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
const slug = name => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

function sourceFile(path) {
  return ts.createSourceFile(path, readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true,
    path.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
}

export async function readCatalogue() {
  const source = readFileSync(resolve(root, 'apps/docs/src/catalogue.ts'), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
  return (await import('data:text/javascript;base64,' + Buffer.from(outputText).toString('base64'))).components;
}

function resolveImport(specifier, from) {
  if (specifier === '@cyberui/tokens') return resolve(tokenRoot, 'index.ts');
  if (!specifier.startsWith('.')) return null;
  const path = resolve(from, '..', specifier);
  const found = [path, path + '.tsx', path + '.ts'].find(candidate => existsSync(candidate));
  if (!found || !(found.startsWith(reactRoot + '/') || found.startsWith(tokenRoot + '/'))) {
    throw new Error(`Unresolved or unsupported source import ${specifier} in ${from}`);
  }
  return found;
}

function outputPath(path) {
  return `${destination}/${path === resolve(tokenRoot, 'index.ts') ? 'tokens.ts' : basename(path)}`;
}

export function createItem(component) {
  const pending = [resolve(reactRoot, slug(component.name) + '.tsx'), resolve(reactRoot, 'provider.tsx')];
  if (component.name === 'Toast') pending.push(resolve(reactRoot, 'toast-provider.tsx'));
  const visited = new Set();
  const contents = new Map();
  const dependencies = new Set();
  const devDependencies = new Set();
  while (pending.length) {
    const path = pending.pop();
    if (visited.has(path)) continue;
    visited.add(path);
    let content = readFileSync(path, 'utf8');
    if (/\.tsx?$/.test(path)) {
      const file = sourceFile(path);
      const replacements = [];
      for (const statement of file.statements) {
        if (!(ts.isImportDeclaration(statement) || ts.isExportDeclaration(statement)) || !statement.moduleSpecifier) continue;
        const literal = statement.moduleSpecifier;
        const dependency = resolveImport(literal.text, path);
        if (dependency) {
          pending.push(dependency);
          const filename = basename(outputPath(dependency));
          const specifier = './' + filename.replace(/\.tsx?$/, '');
          replacements.push({ start: literal.getStart(file), end: literal.end, text: JSON.stringify(specifier) });
        } else {
          const name = literal.text.startsWith('@') ? literal.text.split('/').slice(0, 2).join('/') : literal.text.split('/')[0];
          const version = packageInfo.dependencies[name] ?? packageInfo.peerDependencies[name];
          if (!version) throw new Error(`Undeclared npm dependency: ${name}`);
          dependencies.add(`${name}@${version}`);
        }
      }
      for (const edit of replacements.reverse()) content = content.slice(0, edit.start) + edit.text + content.slice(edit.end);
    } else if (extname(path) === '.css') {
      const style = postcss.parse(content, { from: path });
      const rewrite = (value, pattern, allowCompiler = false) => value.replace(pattern, (match, quote, specifier) => {
        if (allowCompiler && /^tailwindcss(?:\/|$)/.test(specifier)) {
          devDependencies.add(`tailwindcss@${toolingInfo.devDependencies.tailwindcss}`);
          return match;
        }
        const dependency = resolveImport(specifier, path);
        if (!dependency || extname(dependency) !== '.css') throw new Error(`Unsupported CSS dependency ${specifier} in ${path}`);
        pending.push(dependency);
        return match.replace(quote + specifier + quote, quote + './' + basename(outputPath(dependency)) + quote);
      });
      style.walkAtRules(rule => {
        if (['import', 'reference'].includes(rule.name)) rule.params = rewrite(rule.params, /^(['"])([^'"]+)\1/, true);
      });
      style.walkDecls('composes', declaration => {
        declaration.value = rewrite(declaration.value, /\bfrom\s+(['"])([^'"]+)\1/);
      });
      content = style.toString();
    }
    const comment = `Generated from ${relative(root, path)}. Regenerate in CyberUI with pnpm registry:build; after installation, edit this file freely.`;
    contents.set(outputPath(path), (extname(path) === '.css' ? `/* ${comment} */\n` : `// ${comment}\n`) + content);
  }
  for (const [source, target] of [['LICENSE', 'LICENSE'], ['licenses/upstream-NOTICE.md', 'UPSTREAM-NOTICE.md'], ['licenses/upstream-LICENSE', 'UPSTREAM-LICENSE']]) {
    contents.set(`${destination}/${target}`, readFileSync(resolve(root, source), 'utf8'));
  }
  const paths = [...contents.keys()].sort();
  const item = {
    name: slug(component.name), type: 'registry:ui', title: component.name,
    description: component.enDescription,
    dependencies: [...dependencies].sort(),
    devDependencies: [...devDependencies].sort(),
    // These sources already have relative imports and client directives. Copy them
    // verbatim so the CLI's Tailwind transforms cannot alter SVG or text literals.
    files: paths.map(path => ({ path, type: 'registry:file', target: '@components/cyberui/' + basename(path) })),
    docs: 'Configure Tailwind v4 with @tailwindcss/vite (Vite) or @tailwindcss/postcss (Next.js) before building these sources. Wrap your application in CyberUIProvider from your components/cyberui/provider module. The provider loads the scoped baseline without Preflight. React 19 is required. See docs/source-installation.md for the shared tw: theme, utility overrides and optional licensed fonts.',
    meta: { componentName: component.name, zh: component.zh, zhDescription: component.zhDescription, category: component.category }
  };
  return { item, contents };
}

export async function buildRegistry({ check = false } = {}) {
  const catalogue = await readCatalogue();
  if (catalogue.length !== 65 || new Set(catalogue.map(c => c.name)).size !== 65) throw new Error('Expected all 65 catalogue components.');
  const generated = new Map();
  const items = [];
  for (const component of catalogue) {
    const { item, contents } = createItem(component);
    items.push(item);
    for (const [path, content] of contents) {
      if (generated.has(path) && generated.get(path) !== content) throw new Error(`Output path collision: ${path}`);
      generated.set(path, content);
    }
  }
  const manifest = { $schema: 'https://ui.shadcn.com/schema/registry.json', name: 'cyberui', homepage: 'https://github.com/Arasaka-Academy/CyberUI', items };
  registrySchema.parse(manifest);
  generated.set('registry.json', JSON.stringify(manifest, null, 2) + '\n');
  const stale = existsSync(resolve(root, destination)) ? readdirSync(resolve(root, destination)).filter(name => !generated.has(`${destination}/${name}`)) : [];
  const changed = [...generated].filter(([path, content]) => !existsSync(resolve(root, path)) || readFileSync(resolve(root, path), 'utf8') !== content);
  if (check && (changed.length || stale.length)) throw new Error(`Registry is out of date. Run pnpm registry:build.\n${[...changed.map(([path]) => path), ...stale].join('\n')}`);
  if (!check) {
    mkdirSync(resolve(root, destination), { recursive: true });
    for (const [path, content] of changed) writeFileSync(resolve(root, path), content);
    for (const name of stale) {
      const path = resolve(root, destination, name);
      if (!readFileSync(path, 'utf8').includes('Generated from ')) throw new Error(`Refusing to remove unrecognized registry file: ${path}`);
      unlinkSync(path);
    }
  }
  return { manifest, generated };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { manifest, generated } = await buildRegistry({ check: process.argv.includes('--check') });
  process.stdout.write(`Registry ${process.argv.includes('--check') ? 'checked' : 'generated'}: ${manifest.items.length} components, ${generated.size - 1} source/license files.\n`);
}
