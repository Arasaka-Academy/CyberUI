import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join, dirname, basename } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import ts from 'typescript';
import { chromium, expect } from '@playwright/test';
import { buildRegistry } from './build-registry.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const artifactRoot = resolve(process.env.CYBERUI_ARTIFACTS_DIR ?? join(root, 'artifacts'));
const { manifest, generated } = await buildRegistry({ check: true });
const cli = resolve(root, 'node_modules/shadcn/dist/index.js');
const toolchainTarballs = JSON.parse(process.env.CYBERUI_TEST_TARBALLS ?? '{}');
for (const path of Object.values(toolchainTarballs)) if (typeof path !== 'string' || !existsSync(path)) throw new Error(`Missing toolchain tarball: ${path}`);
const npmRegistry = process.env.CYBERUI_TEST_REGISTRY ?? 'https://registry.npmjs.org';
const report = { cli: '4.23.0', components: manifest.items.length, githubRef: process.env.CYBERUI_GITHUB_REF ?? null, toolchainTarballCache: Object.keys(toolchainTarballs), consumers: [] };
const base = mkdtempSync(join(tmpdir(), 'cyberui-registry-consumers-'));
const env = { ...process.env, npm_config_registry: npmRegistry, NEXT_TELEMETRY_DISABLED: '1' };
function save(path, value) { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, value); }
function json(path, value) { save(path, JSON.stringify(value, null, 2) + '\n'); }
async function run(command, args, cwd, { input, timeout = 240000 } = {}) {
  return await new Promise((resolveRun, reject) => {
    const child = spawn(command, args, { cwd, env, stdio: ['pipe', 'pipe', 'pipe'] });
    let output = '';
    child.stdout.on('data', data => { output += data; }); child.stderr.on('data', data => { output += data; });
    const timer = setTimeout(() => { child.kill('SIGTERM'); reject(new Error(`Timed out: ${command} ${args.join(' ')}\n${output}`)); }, timeout);
    child.once('error', error => { clearTimeout(timer); reject(error); });
    child.once('close', code => { clearTimeout(timer); if (code === 0) resolveRun(output); else reject(new Error(`${command} ${args.join(' ')} failed (${code})\n${output}`)); });
    if (input !== undefined) child.stdin.end(input); else child.stdin.end();
  });
}
const registry = createServer((request, response) => {
  const name = request.url?.split('/').pop()?.replace('.json', '');
  const item = manifest.items.find(item => item.name === name);
  if (!item) { response.writeHead(404).end(); return; }
  response.setHeader('Content-Type', 'application/json');
  response.end(JSON.stringify({ ...item, files: item.files.map(file => ({ ...file, content: readFileSync(resolve(root, file.path), 'utf8') })) }));
});
await new Promise(resolveListen => registry.listen(0, '127.0.0.1', resolveListen));
const registryURL = `http://127.0.0.1:${registry.address().port}`;
const itemAddress = name => process.env.CYBERUI_GITHUB_REF ? `Arasaka-Academy/CyberUI/${name}#${process.env.CYBERUI_GITHUB_REF}` : `${registryURL}/${name}.json`;
function verifyInstalledSources(installed) {
  const digest = createHash('sha256');
  let count = 0;
  for (const [path, expected] of [...generated].sort(([a], [b]) => a.localeCompare(b))) {
    if (path === 'registry.json') continue;
    const actual = readFileSync(join(installed, basename(path)), 'utf8');
    expect(actual, `Installed source differs: ${path}`).toBe(expected);
    digest.update(path).update('\0').update(actual).update('\0');
    count++;
  }
  return { files: count, sha256: digest.digest('hex') };
}
const demo = ts.createSourceFile('ComponentDemo.tsx', readFileSync(resolve(root, 'apps/docs/src/ComponentDemo.tsx'), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const exampleBodies = demo.statements.flatMap(s => ts.isVariableStatement(s) ? [...s.declarationList.declarations] : []).find(d => d.name.getText(demo) === 'exampleBodies').initializer.properties.map(p => ({ name: p.name.getText(demo), body: p.initializer.text }));
const slug = name => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const appSource = prefix => `'use client';
import { useRef, useState } from 'react';
import { CyberUIProvider } from '${prefix}/provider';
import { Button } from '${prefix}/button';
import { Input } from '${prefix}/input';
import { Dialog } from '${prefix}/dialog';
import { Select } from '${prefix}/select';
import { Progress } from '${prefix}/progress';
import { Chart } from '${prefix}/chart';
export default function App() {
  const input = useRef<HTMLInputElement>(null);
  const [value,setValue] = useState('NOVA_7');
  const [mode,setMode] = useState<'dark'|'light'>('dark');
  return <><div data-testid="host-utilities" className="flex gap-4 p-4 font-semibold"><span>Existing host</span><span>Tailwind utilities</span></div>
  <CyberUIProvider scheme="neon" mode={mode} locale="zh-CN">
    <h1>Source consumer</h1>
    <Input label="Handle" ref={input} value={value} onChange={event=>setValue(event.target.value)} />
    <Button onPress={()=>input.current?.focus()}>Focus input</Button>
    <Button onPress={()=>setMode(mode==='dark'?'light':'dark')}>Toggle theme</Button>
    <Button data-testid="utility-override" variant="danger" size="lg" className="tw:px-[12px] tw:text-cyber-ink">Custom utility</Button>
    <Dialog title="Settings" trigger={<Button>Open settings</Button>}><p>{value}</p></Dialog>
    <Select data-testid="theme-select" label="Theme" defaultValue="neon" options={[{id:'neon',label:'Neon'},{id:'mono',label:'Mono'}]} />
    <Progress label="Decrypted" value={42} />
    <Chart label="Pages" data={[{label:'MON',value:18},{label:'TUE',value:30}]} />
  </CyberUIProvider></>;
}
`;
async function browserChecks(browser, url, framework) {
  const page = await browser.newPage({ viewport: { width: 1000, height: 900 } });
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto(url);
  await expect(page.getByRole('heading', { name: 'Source consumer' })).toBeVisible();
  await expect(page.getByTestId('host-utilities')).toHaveCSS('display', 'flex');
  await expect(page.getByTestId('host-utilities')).toHaveCSS('gap', '16px');
  await expect(page.getByTestId('host-utilities')).toHaveCSS('padding', '16px');
  await expect(page.getByTestId('host-utilities')).toHaveCSS('font-weight', '600');
  await expect(page.locator('[data-cyberui]')).toHaveAttribute('data-mode', 'dark');
  await expect(page.getByTestId('utility-override')).toHaveCSS('padding-left', '12px');
  await expect(page.getByTestId('utility-override')).toHaveCSS('padding-right', '12px');
  await expect(page.getByTestId('utility-override')).toHaveCSS('color', await page.locator('[data-cyberui]').evaluate(el => getComputedStyle(el).color));
  await page.getByRole('button', { name: 'Focus input', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Handle' })).toBeFocused();
  await page.getByRole('textbox', { name: 'Handle' }).fill('NOVA_8');
  await page.getByRole('button', { name: 'Open settings', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Settings' })).toContainText('NOVA_8');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Open settings', exact: true })).toBeFocused();
  await page.getByTestId('theme-select').getByRole('button').click();
  await page.getByRole('option', { name: 'Mono', exact: true }).click();
  await expect(page.getByTestId('theme-select').getByRole('button')).toContainText('Mono');
  await expect(page.getByRole('listbox')).not.toBeVisible();
  await page.getByRole('button', { name: 'Toggle theme' }).click();
  await expect(page.locator('[data-cyberui]')).toHaveAttribute('data-mode', 'light');
  await expect(page.locator('[data-cyberui]')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(page.getByRole('progressbar', { name: 'Decrypted' })).toHaveAttribute('aria-valuenow', '42');
  await expect(page.locator('.recharts-surface').first()).toBeVisible();
  expect(errors).toEqual([]);
  const screenshot = resolve(artifactRoot, 'screenshots/registry-' + framework + '.png');
  await page.screenshot({ path: screenshot, fullPage: true });
  await page.goto(new URL(framework === 'vite' ? '/examples.html' : '/examples', url).href);
  await expect(page.locator('[data-example]')).toHaveCount(manifest.items.length);
  await expect(page.locator('[data-example="ExampleVirtualKeyboard"]')).toBeVisible();
  await expect(page.locator('[data-example="ExampleTextarea"] textarea')).toHaveCSS('padding-top', '10px');
  await expect(page.locator('[data-example="ExampleTextarea"] textarea')).toHaveCSS('padding-right', '13px');
  await expect(page.locator('[data-example="ExampleSelect"] button').first()).toHaveCSS('min-height', '44px');
  expect(errors).toEqual([]);
  await page.close();
}

let browser;
try {
  browser = await chromium.launch();
  for (const framework of ['vite', 'next']) {
    const cwd = join(base, framework); mkdirSync(cwd);
    const componentDir = framework === 'vite' ? 'widgets' : 'components';
    const prefix = `@/${componentDir}/cyberui`;
    json(join(cwd, 'package.json'), { name: `cyberui-${framework}-source-consumer`, private: true, type: 'module', packageManager: 'pnpm@11.3.0', dependencies: { react: '19.3.1', 'react-dom': '19.3.1', ...(framework === 'next' ? { next: '16.4.5' } : {}) }, devDependencies: { typescript: '~5.9.3', '@types/react': '^19.2.0', '@types/react-dom': '^19.2.0', '@types/node': '^22.18.0', tailwindcss: '4.3.4', ...(framework === 'vite' ? { vite: '^7.1.7', '@vitejs/plugin-react': '^5.0.4', '@tailwindcss/vite': '4.3.4' } : { '@tailwindcss/postcss': '4.3.4' }) } });
    json(join(cwd, 'tsconfig.json'), { compilerOptions: { target: 'ES2022', lib: ['ES2022','DOM','DOM.Iterable'], module: 'ESNext', moduleResolution: 'Bundler', jsx: framework === 'next' ? 'preserve' : 'react-jsx', strict: true, skipLibCheck: true, noEmit: true, esModuleInterop: true, resolveJsonModule: true, isolatedModules: true, baseUrl: '.', paths: { '@/*': ['./src/*'] }, ...(framework === 'next' ? { plugins: [{ name: 'next' }] } : { types: ['vite/client'] }) }, include: ['src', 'next-env.d.ts', '.next/types/**/*.ts'] });
    const cssPath = framework === 'next' ? 'src/app/globals.css' : 'src/styles.css';
    // An existing host keeps its own Tailwind compiler root and prefix.
    save(join(cwd, cssPath), `@import 'tailwindcss';\n@source '${framework === 'next' ? '..' : '.'}/';\nbody { margin: 0; }\n`);
    const utilityPath = framework === 'next' ? 'src/app/cyberui.css' : 'src/cyberui.css';
    save(join(cwd, utilityPath), `@layer theme, base, components, utilities;\n@import '${framework === 'next' ? '..' : '.'}/${componentDir}/cyberui/tailwind-theme.css';\n@import 'tailwindcss/utilities.css' layer(utilities) prefix(tw) source(none);\n@source '${framework === 'next' ? '..' : '.'}/';\n`);
    json(join(cwd, 'components.json'), { $schema: 'https://ui.shadcn.com/schema.json', style: 'new-york', rsc: framework === 'next', tsx: true, tailwind: { config: '', css: cssPath, baseColor: 'neutral', cssVariables: false }, aliases: { components: `@/${componentDir}`, ui: `@/${componentDir}/ui`, utils: '@/lib/utils', lib: '@/lib', hooks: '@/hooks' } });
    save(join(cwd, 'pnpm-workspace.yaml'), 'allowBuilds:\n  esbuild: true\n  sharp: true\n' + (framework === 'next' && Object.keys(toolchainTarballs).length ? 'overrides:\n' + Object.entries(toolchainTarballs).map(([name, path]) => `  ${JSON.stringify(name)}: ${JSON.stringify('file:' + path)}\n`).join('') : ''));
    save(join(cwd, '.npmrc'), `registry=${npmRegistry}\n`);
    if (framework === 'vite') {
      save(join(cwd, 'vite.config.ts'), `import { defineConfig } from 'vite';import react from '@vitejs/plugin-react';import tailwindcss from '@tailwindcss/vite';import { fileURLToPath } from 'node:url';export default defineConfig({plugins:[react(),tailwindcss()],resolve:{alias:{'@':fileURLToPath(new URL('./src',import.meta.url))}},build:{rollupOptions:{input:{main:fileURLToPath(new URL('./index.html',import.meta.url)),examples:fileURLToPath(new URL('./examples.html',import.meta.url))}}}});`);
      save(join(cwd, 'index.html'), '<html lang="en"><head><title>Source consumer</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>');
      save(join(cwd, 'src/main.tsx'), "import { createRoot } from 'react-dom/client';import App from './App';import './styles.css';import './cyberui.css';createRoot(document.getElementById('root')!).render(<App/>);");
      save(join(cwd, 'src/App.tsx'), appSource(prefix));
    } else {
      save(join(cwd, 'postcss.config.mjs'), "export default { plugins: { '@tailwindcss/postcss': {} } };\n");
      save(join(cwd, 'next-env.d.ts'), '/// <reference types="next" />\n/// <reference types="next/image-types/global" />\n');
      save(join(cwd, 'src/app/layout.tsx'), "import type { ReactNode } from 'react';import './globals.css';import './cyberui.css';export default function Layout({children}:{children:ReactNode}){return <html lang=\"zh-CN\"><body>{children}</body></html>}");
      save(join(cwd, 'src/app/page.tsx'), appSource(prefix));
    }
    console.log(`${framework}: installing standalone React 19 toolchain in ${cwd}`);
    await run('pnpm', ['install', '--registry', npmRegistry], cwd);
    console.log(`${framework}: real shadcn CLI installation, all 65 components`);
    await run(process.execPath, [cli, 'add', ...manifest.items.map(item => itemAddress(item.name)), '--yes'], cwd);
    const installed = join(cwd, 'src', componentDir, 'cyberui');
    for (const item of manifest.items) for (const file of item.files) expect(existsSync(join(installed, basename(file.path))), file.path).toBe(true);
    const sourceConsistency = verifyInstalledSources(installed);
    const packageAfter = JSON.parse(readFileSync(join(cwd, 'package.json'), 'utf8'));
    expect(Object.keys(packageAfter.dependencies).some(name => name.startsWith('@cyberui/'))).toBe(false);
    expect(existsSync(join(cwd, 'node_modules/tailwindcss'))).toBe(true);
    if (framework === 'vite') {
      const buttonPath = join(installed, 'button.tsx');
      const custom = readFileSync(buttonPath, 'utf8') + '\n// consumer customization preserved\n';
      writeFileSync(buttonPath, custom);
      console.log('vite: verifying repeat installation preserves declined local edits');
      await run(process.execPath, [cli, 'add', itemAddress('button'), '--yes'], cwd, { input: 'n\n' });
      expect(readFileSync(buttonPath, 'utf8')).toBe(custom);
      await run(process.execPath, [cli, 'add', itemAddress('button'), '--yes', '--overwrite'], cwd);
      expect(readFileSync(buttonPath, 'utf8')).toBe(generated.get('registry/cyberui/button.tsx'));
    }
    const names = [...new Set(exampleBodies.flatMap(example => [example.name, ...[...example.body.matchAll(/<([A-Z][A-Za-z]+)/g)].map(m => m[1])]))];
    save(join(cwd, 'src/examples.tsx'), `'use client';\nimport { CyberUIProvider } from '${prefix}/provider';\n` + names.map(name => `import { ${name} } from '${prefix}/${slug(name)}';`).join('\n') + '\n' + exampleBodies.map(example => `export function Example${example.name}(){return <CyberUIProvider>${example.body}</CyberUIProvider>}`).join('\n'));
    save(join(cwd, 'src/ExamplesGallery.tsx'), `'use client';\nimport * as examples from './examples';\nexport default function ExamplesGallery(){return <main>{Object.entries(examples).map(([name,Example])=><section key={name} data-example={name}><h2>{name}</h2><Example/></section>)}</main>}`);
    if (framework === 'vite') {
      save(join(cwd, 'examples.html'), '<html lang="en"><head><title>All source examples</title></head><body><div id="root"></div><script type="module" src="/src/examples-main.tsx"></script></body></html>');
      save(join(cwd, 'src/examples-main.tsx'), "import {createRoot} from 'react-dom/client';import ExamplesGallery from './ExamplesGallery';import './styles.css';import './cyberui.css';createRoot(document.getElementById('root')!).render(<ExamplesGallery/>);");
    } else {
      save(join(cwd, 'src/app/examples/page.tsx'), "export { default } from '../../ExamplesGallery';");
    }
    console.log(`${framework}: typechecking all ${exampleBodies.length} examples and building production output`);
    await run('pnpm', ['exec', 'tsc', '--noEmit'], cwd);
    await run('pnpm', ['exec', framework === 'next' ? 'next' : 'vite', 'build', ...(framework === 'next' ? ['--webpack'] : [])], cwd);
    let close;
    let url;
    if (framework === 'vite') {
      const { preview } = await import(pathToFileURL(join(cwd, 'node_modules/vite/dist/node/index.js')).href);
      const server = await preview({ root: cwd, preview: { host: '127.0.0.1', port: 0 } });
      url = `http://127.0.0.1:${server.httpServer.address().port}`;
      close = () => new Promise(resolveClose => server.httpServer.close(resolveClose));
    } else {
      const server = spawn('pnpm', ['exec','next','start','--hostname','127.0.0.1','--port','0'], { cwd, env, stdio: ['ignore','pipe','pipe'] });
      let output = '';
      url = await new Promise((resolveURL, reject) => {
        const timer = setTimeout(() => reject(new Error('Next server did not start\n' + output)), 30000);
        server.stdout.on('data', data => { output += data; const match = output.match(/http:\/\/127\.0\.0\.1:(\d+)/); if (match) { clearTimeout(timer); resolveURL(match[0]); } });
        server.stderr.on('data', data => { output += data; });
        server.once('exit', code => { clearTimeout(timer); reject(new Error(`Next server exited ${code}\n${output}`)); });
      });
      close = () => new Promise(resolveClose => { server.once('exit', resolveClose); server.kill('SIGTERM'); });
    }
    try { await browserChecks(browser, url, framework); } finally { await close(); }
    report.consumers.push({ framework, directory: cwd, components: manifest.items.length, examples: exampleBodies.length, sourceConsistency, productionBuild: 'passed', renderedExamples: exampleBodies.length, browser: 'passed', customComponentsDirectory: componentDir, tailwindRequired: true, tailwindVersion: '4.3.4', utilitiesOverrideComponents: true, hostTailwindUtilitiesPreserved: true, utilityEntry: 'separate-js-import' });
    console.log(`${framework}: PASS`);
  }
  report.status = 'passed';
  json(resolve(artifactRoot, 'registry-consumer-result.json'), report);
  console.log('PASS: standalone CLI, source, types, production and browser validation.');
} finally {
  await browser?.close();
  await new Promise(resolveClose => registry.close(resolveClose));
}
