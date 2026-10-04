import { cpSync, createReadStream, existsSync } from 'node:fs';
import path, { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';
import bash from 'highlight.js/lib/languages/bash';
import cpp from 'highlight.js/lib/languages/cpp';
import glsl from 'highlight.js/lib/languages/glsl';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import powershell from 'highlight.js/lib/languages/powershell';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import { defineConfig, type Plugin } from 'vite';

const frontendRoot = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(frontendRoot, '..');
const imageRoot = resolve(workspaceRoot, 'images');
function imageAssets(): Plugin {
  return {
    name: 'dx12zh-image-assets',
    configureServer(server) {
      server.middlewares.use('/images', (request, response, next) => {
        const requestedPath = decodeURIComponent((request.url ?? '/').split('?')[0]);
        const resolvedPath = resolve(imageRoot, `.${requestedPath}`);
        const relativePath = path.relative(imageRoot, resolvedPath);
        if (relativePath.startsWith('..') || path.isAbsolute(relativePath) || !existsSync(resolvedPath)) {
          next();
          return;
        }
        response.setHeader('Content-Type', 'image/jpeg');
        response.setHeader('Cache-Control', 'public, max-age=3600');
        createReadStream(resolvedPath).on('error', next).pipe(response);
      });
    },
    closeBundle() {
      const outputRoot = resolve(frontendRoot, 'dist');
      if (existsSync(imageRoot)) cpSync(imageRoot, resolve(outputRoot, 'images'), { recursive: true });
    },
  };
}

export default defineConfig({
  root: frontendRoot,
  base: './',
  publicDir: false,
  plugins: [
    {
      enforce: 'pre',
      ...mdx({
        jsxImportSource: 'react',
        providerImportSource: '@mdx-js/react',
        remarkPlugins: [remarkMath],
        rehypePlugins: [rehypeKatex, [rehypeHighlight, {
          detect: false,
          ignoreMissing: true,
          languages: { bash, cpp, c: cpp, glsl, hlsl: cpp, javascript, json, powershell, sh: bash, typescript, xml, html: xml },
        }]],
      }),
    },
    react(),
    imageAssets(),
  ],
  resolve: {
    alias: { '@': resolve(frontendRoot, 'src') },
  },
  server: {
    host: '127.0.0.1',
    port: 4173,
    strictPort: true,
    fs: { allow: [workspaceRoot] },
  },
  build: {
    outDir: resolve(frontendRoot, 'dist'),
    emptyOutDir: true,
    rollupOptions: { input: resolve(frontendRoot, 'index.html') },
  },
});
