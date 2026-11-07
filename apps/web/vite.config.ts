import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@ibp/engine': path.resolve(__dirname, '../../packages/ibp-engine/src'),
      '@ibp/language': path.resolve(__dirname, '../../packages/ibp-language/src'),
      '@ibp/vfs': path.resolve(__dirname, '../../packages/virtual-filesystem/src'),
      '@ibp/vm': path.resolve(__dirname, '../../packages/virtual-machine/src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
