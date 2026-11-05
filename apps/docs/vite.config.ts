import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
export default defineConfig({ base:'./', publicDir: '../../public', plugins: [react()], resolve: { alias: {
  '@cyberui/react/styles.css': fileURLToPath(new URL('../../packages/react/src/styles.css', import.meta.url)),
  '@cyberui/react': fileURLToPath(new URL('../../packages/react/src/index.ts', import.meta.url)),
  '@cyberui/tokens': fileURLToPath(new URL('../../packages/tokens/src/index.ts', import.meta.url))
} }, build: { rollupOptions:{output:{manualChunks(id){
  if(!id.includes('node_modules'))return;
  if(/recharts|d3-|victory-|@reduxjs|\/redux/.test(id))return 'charts';
  if(/react-aria|react-stately|@react-|@internationalized|@swc/.test(id))return 'aria';
  return 'vendor';
}}} }, server: { port: 5173 } });
