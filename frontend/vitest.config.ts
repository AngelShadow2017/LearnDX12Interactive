import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

const frontendRoot = dirname(fileURLToPath(import.meta.url));

// 独立于 vite.config.ts：测试只跑纯函数与状态逻辑，不需要 MDX、图片或旧页面代理。
export default defineConfig({
  root: frontendRoot,
  resolve: {
    alias: { '@': resolve(frontendRoot, 'src') },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
