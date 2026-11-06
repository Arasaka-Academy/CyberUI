import { spawn } from 'node:child_process';
import { readdirSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import postcss from 'postcss';

const root = fileURLToPath(new URL('../', import.meta.url));
const label = process.argv[2];
const destination = resolve(root, process.env.CYBERUI_STYLE_ARTIFACTS ?? 'artifacts/styles');
if (!['before', 'after'].includes(label)) throw new Error('Usage: pnpm exec node scripts/measure-styles.mjs before|after');
const files = directory => readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
  const path = resolve(directory, entry.name);
  return entry.isDirectory() ? files(path) : [path];
});

async function build() {
  const start = performance.now();
  await new Promise((done, reject) => {
    const child = spawn('pnpm', ['build'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
    let output = '';
    child.stdout.on('data', data => { output += data; });
    child.stderr.on('data', data => { output += data; });
    child.on('error', reject);
    child.on('close', code => code === 0 ? done() : reject(new Error(output)));
  });
  return Math.round(performance.now() - start);
}

// Keep the first run visible, but compare the following two warmed runs.
const buildMs = [];
for (let i = 0; i < 3; i++) {
  buildMs.push(await build());
  console.log(`${label} build ${i + 1}/3: ${buildMs.at(-1)}ms`);
}
const css = {};
for (const directory of ['packages/react/dist', 'apps/docs/dist']) {
  const styles = files(resolve(root, directory)).filter(path => path.endsWith('.css'));
  css[directory] = {
    files: styles.map(path => ({ path: relative(root, path), bytes: readFileSync(path).length, gzipBytes: gzipSync(readFileSync(path)).length })),
    bytes: styles.reduce((sum, path) => sum + readFileSync(path).length, 0),
    gzipBytes: styles.reduce((sum, path) => sum + gzipSync(readFileSync(path)).length, 0),
  };
}
let spacingReferences = 0;
let motionReferences = 0;
const keyframes = {};
for (const path of files(resolve(root, 'packages/react/src')).filter(path => path.endsWith('.css'))) {
  const ast = postcss.parse(readFileSync(path, 'utf8'));
  ast.walkDecls(declaration => {
    spacingReferences += [...declaration.value.matchAll(/var\(--cyber-space-/g)].length;
    motionReferences += [...declaration.value.matchAll(/var\(--cyber-[\w-]*duration\b/g)].length;
  });
  ast.walkAtRules('keyframes', rule => { keyframes[rule.params] = (keyframes[rule.params] ?? 0) + 1; });
}
const dashboard = readFileSync(resolve(root, 'apps/docs/src/web-scenes/Dashboard.tsx'), 'utf8');
const report = {
  label, node: process.version, buildCommand: 'pnpm build', buildMs,
  warmMeanMs: Math.round((buildMs[1] + buildMs[2]) / 2), css,
  componentSource: { spacingReferences, motionReferences, keyframes },
  orbit: { sourceBytes: Buffer.byteLength(dashboard), utilityReferences: [...dashboard.matchAll(/\btw:/g)].length },
};
mkdirSync(destination, { recursive: true });
writeFileSync(resolve(destination, `${label}.json`), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
