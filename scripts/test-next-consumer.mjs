import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { chromium, expect } from '@playwright/test';

const root = fileURLToPath(new URL('../', import.meta.url));
const artifacts = resolve(process.env.CYBERUI_ARTIFACTS_DIR ?? join(root, 'artifacts'));
const version = JSON.parse(readFileSync(join(root, 'packages/react/package.json'), 'utf8')).version;
const tokensVersion = JSON.parse(readFileSync(join(root, 'packages/tokens/package.json'), 'utf8')).version;
const tokens = join(artifacts, 'packages', `cyberui-tokens-${tokensVersion}.tgz`);
const react = join(artifacts, 'packages', `cyberui-react-${version}.tgz`);
for (const path of [tokens, react]) if (!existsSync(path)) throw new Error(`Run the packed Vite consumer first: missing ${path}`);
const consumer = mkdtempSync(join(tmpdir(), 'cyberui-next-package-consumer-'));
const env = { ...process.env, NEXT_TELEMETRY_DISABLED: '1' };
const save = (name, value) => writeFileSync(join(consumer, name), value);
const json = (name, value) => save(name, JSON.stringify(value, null, 2) + '\n');
async function run(args) {
  return await new Promise((resolveRun, reject) => {
    const child = spawn('pnpm', args, { cwd: consumer, env, stdio: ['ignore', 'pipe', 'pipe'] });
    let output = '';
    child.stdout.on('data', data => { output += data; }); child.stderr.on('data', data => { output += data; });
    const timer = setTimeout(() => { child.kill('SIGTERM'); reject(new Error(`Timed out: pnpm ${args.join(' ')}\n${output}`)); }, 180000);
    child.once('error', error => { clearTimeout(timer); reject(error); });
    child.once('close', code => { clearTimeout(timer); if (code === 0) resolveRun(output); else reject(new Error(`pnpm ${args.join(' ')} failed (${code})\n${output}`)); });
  });
}
json('package.json', { name: 'cyberui-next-package-example', private: true, type: 'module', dependencies: { '@cyberui/tokens': `file:${tokens}`, '@cyberui/react': `file:${react}`, next: '16.4.5', react: '^19.2.0', 'react-dom': '^19.2.0' }, devDependencies: { typescript: '~5.9.3', '@types/node': '^22.18.0', '@types/react': '^19.2.0', '@types/react-dom': '^19.2.0' } });
save('pnpm-workspace.yaml', `overrides:\n  '@cyberui/tokens': ${JSON.stringify(`file:${tokens}`)}\n`);
save('next.config.mjs', "export default { experimental: { cpus: 2 } };\n");
mkdirSync(join(consumer, 'app'));
save('app/providers.tsx', "'use client';\nimport {CyberUIProvider} from '@cyberui/react';\nexport function Providers({children}:{children:React.ReactNode}) {return <CyberUIProvider>{children}</CyberUIProvider>;}\n");
save('app/layout.tsx', "import {Providers} from './providers';\nimport '@cyberui/react/styles.css';\nexport default function Layout({children}:{children:React.ReactNode}) {return <html lang='en'><body><Providers>{children}</Providers></body></html>;}\n");
// This must stay a Server Component. The package owns its client boundary.
save('app/page.tsx', "import {Button,Dialog,Input} from '@cyberui/react';\nexport default function Page() {return <><h1>Next packed CyberUI</h1><Button>Server imported button</Button><Dialog title='Package settings' trigger={<Button>Open package settings</Button>}><Input label='Package name'/></Dialog></>;}\n");
process.stdout.write(`Installing packed Next.js consumer in ${consumer}\n`);
await run(['install', ...(process.env.CYBERUI_CONSUMER_OFFLINE === '0' ? [] : ['--offline']), '--registry', process.env.CYBERUI_TEST_REGISTRY ?? 'https://registry.npmmirror.com']);
expect(existsSync(join(consumer, 'node_modules/tailwindcss'))).toBe(false);
expect(readFileSync(join(consumer, 'node_modules/@cyberui/react/dist/index.js'), 'utf8')).toMatch(/^['"]use client['"];?/);
const buildOutput = await run(['exec', 'next', 'build', '--webpack']);
mkdirSync(artifacts, { recursive: true });
writeFileSync(join(artifacts, 'next-package-build.log'), buildOutput);
const allocator = createServer();
await new Promise(resolveListen => allocator.listen(0, '127.0.0.1', resolveListen));
const port = allocator.address().port;
await new Promise(resolveClose => allocator.close(resolveClose));
const grouped = process.platform !== 'win32';
const server = spawn('pnpm', ['exec', 'next', 'start', '-H', '127.0.0.1', '-p', String(port)], { cwd: consumer, env, detached: grouped, stdio: ['ignore', 'pipe', 'pipe'] });
let serverOutput = ''; let serverError;
server.stdout.on('data', data => { serverOutput += data; }); server.stderr.on('data', data => { serverOutput += data; });
server.on('error', error => { serverError = error; });
let browser;
try {
  const url = `http://127.0.0.1:${port}`;
  const deadline = Date.now() + 60000;
  while (true) {
    if (serverError || server.exitCode !== null || server.signalCode !== null) throw new Error(`Next server failed: ${serverError ?? serverOutput}`);
    try { const response = await fetch(url, { signal: AbortSignal.timeout(1000) }); if (response.ok) break; } catch { /* bounded startup retry */ }
    if (Date.now() > deadline) throw new Error(`Next server did not become ready\n${serverOutput}`);
    await new Promise(resolveWait => setTimeout(resolveWait, 200));
  }
  browser = await chromium.launch();
  const page = await browser.newPage(); const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(url);
  await expect(page.getByRole('heading', { name: 'Next packed CyberUI' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Server imported button' })).toHaveCSS('min-height', '44px');
  await page.getByRole('button', { name: 'Open package settings' }).click();
  await expect(page.getByRole('dialog', { name: 'Package settings' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Package name' }).fill('Next consumer');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Open package settings' })).toBeFocused();
  expect(errors).toEqual([]);
} finally {
  await browser?.close();
  const running = () => server.exitCode === null && server.signalCode === null;
  const signal = value => {
    try { if (grouped) process.kill(-server.pid, value); else server.kill(value); }
    catch (error) { if (error.code !== 'ESRCH') throw error; }
  };
  if (running()) {
    signal('SIGTERM');
    await new Promise(resolveExit => { server.once('close', resolveExit); setTimeout(resolveExit, 5000).unref(); });
    if (running()) signal('SIGKILL');
  }
}

writeFileSync(join(artifacts, 'next-package-consumer-result.json'), JSON.stringify({ status: 'passed', packageVersion: version, nextVersion: '16.4.5', consumerDirectory: consumer, tailwindRequired: false, checks: ['packed client boundary', 'Server Component imports with client Provider', 'Next production build', 'hydrated browser styles and interaction', 'dialog Escape and focus restoration', 'no page errors'] }, null, 2) + '\n');
process.stdout.write('PASS: packed Next.js Server Component imports, production build, browser styles and dialog interaction.\n');
