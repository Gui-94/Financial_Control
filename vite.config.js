import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

function discoverHtmlPages(pagesDir) {
  if (!fs.existsSync(pagesDir)) return {};
  const entries = {};
  fs.readdirSync(pagesDir)
    .filter((f) => f.endsWith('.html'))
    .forEach((f) => {
      const name = f.replace(/\.html$/, '');
      entries[name] = resolve(pagesDir, f);
    });
  return entries;
}

const pagesDir = resolve(__dirname, '.'); // 👈 raiz do projeto (onde estão index.html, onepag.html)
const input = discoverHtmlPages(pagesDir);
if (!input.index) input.index = resolve(pagesDir, 'index.html');

export default defineConfig({
  appType: 'mpa', // múltiplas páginas
  publicDir: 'public', // 👈 aqui sim define a pasta dos arquivos estáticos
  server: {
    port: 3000,
    open: '/index.html',
  },
  build: {
    rollupOptions: {
      input,
    },
    outDir: 'dist',
    assetsDir: 'assets',
  },
  base: '/',
});
