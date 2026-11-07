import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import tailwindConfig from './tailwind.config.js';

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
  css: {
    postcss: {
      plugins: [
        tailwindcss(tailwindConfig as any),
        autoprefixer(),
      ],
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
