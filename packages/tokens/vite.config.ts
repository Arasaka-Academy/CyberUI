import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { cpSync } from 'node:fs';
export default defineConfig({ plugins: [dts({ include: ['src'], exclude:['src/**/*.test.*'], entryRoot:'src', tsconfigPath: '../../tsconfig.json' }),{name:'license',closeBundle(){cpSync('../../LICENSE','dist/LICENSE');cpSync('../../licenses/upstream-NOTICE.md','dist/NOTICE.md');}}], build: {
  lib: { entry: 'src/index.ts', formats: ['es'], fileName: 'index', cssFileName: 'tokens' }
} });
