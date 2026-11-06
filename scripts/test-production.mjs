import { preview } from 'vite';
import { existsSync, mkdirSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const evidence = resolve(process.env.CYBERUI_ARTIFACTS_DIR ?? join(root, 'artifacts/production'));
if (!existsSync(join(root, 'apps/docs/dist/index.html'))) throw new Error('Run pnpm build before production browser tests.');
mkdirSync(evidence, { recursive: true });
// Existing audits resolve axe and their output paths from the working directory.
const modules = join(evidence, 'node_modules');
const linkedModules = !existsSync(modules);
if (linkedModules) symlinkSync(join(root, 'node_modules'), modules, 'junction');
let server;
try {
  server = await preview({ root: join(root, 'apps/docs'), configFile: join(root, 'apps/docs/vite.config.ts'), preview: { host: '127.0.0.1', port: 0 } });
  const url = `http://127.0.0.1:${server.httpServer.address().port}`;
  process.stdout.write(`Production preview: ${url}\nEvidence: ${evidence}\n`);
  const child = spawn(process.execPath, [join(root, 'node_modules/@playwright/test/cli.js'), 'test', '--config', join(root, 'playwright.config.ts'), '--reporter=list,json', '--output', join(evidence, 'test-results'), ...process.argv.slice(2)], {
    cwd: evidence,
    env: { ...process.env, CYBERUI_BASE_URL: url, PLAYWRIGHT_JSON_OUTPUT_FILE: join(evidence, 'playwright-results.json') },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  let output = '';
  const record = (stream, data) => { output += data; stream.write(data); writeFileSync(join(evidence, 'run.log'), output); };
  child.stdout.on('data', data => record(process.stdout, data));
  child.stderr.on('data', data => record(process.stderr, data));
  const result = await new Promise((resolveExit, reject) => { child.once('error', reject); child.once('close', (code, signal) => resolveExit({ code, signal })); });
  writeFileSync(join(evidence, 'result.json'), JSON.stringify({ ...result, productionBuild: true, selectors: process.argv.slice(2) }, null, 2) + '\n');
  process.exitCode = result.code ?? 1;
} finally {
  // Keep dependency symlinks out of uploaded browser evidence.
  if (linkedModules) unlinkSync(modules);
  if (server) await new Promise(resolveClose => server.httpServer.close(resolveClose));
}
