import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
export default defineConfig({
  plugins: [react()], resolve: { alias: {
    '@cyberui/tokens': resolve('packages/tokens/src/index.ts'),
    '@cyberui/react': resolve('packages/react/src/index.ts')
  } },
  test: { environment: 'jsdom', setupFiles: ['./tests/setup.ts'], include: ['**/*.test.{ts,tsx}'] }
});
