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

const pagesDir = resolve(__dirname, 'pages');
const input = discoverHtmlPages(pagesDir);
if (!input.index) input.index = resolve(pagesDir, 'index.html');

export default defineConfig({
  appType: 'mpa',
  plugins: [
    {
      name: 'pretty-urls-pages-mapper',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          const original = req.url;
          const url = original.split('?')[0];
          if (url === '/' || url === '/index.html') {
            req.url = '/pages/index.html';
          } else if (!url.includes('.') && !url.startsWith('/api')) {
            // ex.: /sobre -> /pages/sobre.html
            req.url = `/pages${url}.html`;
          }
          next();
        });
      }
    }
  ],
  server: {
    port: 3000,
    strictPort: false,
    open: '/pages/index.html',
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  build: {
    rollupOptions: {
      input
    },
    outDir: 'dist',
    assetsDir: 'assets'
  },
  base: '/'
});


