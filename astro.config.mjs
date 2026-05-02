import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://donttouchmydoc.com',
  output: 'static',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
    server: {
      // Allow dev to serve files from parent directories so the dev server
      // works when running from a git worktree (e.g. .claude/worktrees/<name>),
      // where node_modules lives in the main repo a few levels up.
      fs: { allow: ['..', '../..', '../../..'] },
    },
    optimizeDeps: {
      // Pre-bundle the client-side PDF libs used by inline <script> blocks.
      // Providing explicit entries stops esbuild from trying to scan .astro files itself.
      entries: [],
      include: ['pdf-lib', 'pdfjs-dist', 'jszip'],
    },
    worker: {
      format: 'es',
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'pdf-lib': ['pdf-lib'],
            'pdfjs': ['pdfjs-dist'],
          },
        },
      },
    },
  },
  build: {
    inlineStylesheets: 'auto',
  },
  compressHTML: true,
});
