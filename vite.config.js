import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  appType: 'mpa',
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        onepag: resolve(__dirname, 'onepag.html'),
      },
    },
  },
  server: {
    port: 5173,
    open: '/index.html', // abre automaticamente a tela de login
  },
  base: '/',
});
