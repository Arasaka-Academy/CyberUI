import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import dts from 'vite-plugin-dts';
import { cpSync, mkdirSync } from 'node:fs';
export default defineConfig({ plugins: [react(), tailwindcss(), dts({ include: ['src'], exclude:['src/**/*.test.*'], entryRoot:'src', tsconfigPath: '../../tsconfig.json' }), {
  name: 'licensed-font-assets', closeBundle() {
    mkdirSync('dist', { recursive: true });
    cpSync('../../public/fonts', 'dist/fonts', { recursive: true });
    cpSync('../../public/fonts.css', 'dist/fonts.css');
    cpSync('../../licenses', 'dist/licenses', { recursive: true });
    cpSync('../../LICENSE', 'dist/LICENSE');
    cpSync('src/tailwind-theme.css', 'dist/tailwind.css');
  }
}],
  build: { lib: { entry: 'src/index.ts', formats: ['es'], fileName: 'index', cssFileName: 'cyberui' },
    rollupOptions: {
      output: { banner: '"use client";' },
      external: [/^react($|\/)/, /^react-dom($|\/)/, /^react-aria($|\/)/, /^react-aria-components/, /^recharts/, /^@internationalized\/date/, /^@cyberui\/tokens/]
    }
  }
});
