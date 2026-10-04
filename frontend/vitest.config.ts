import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

const frontendRoot = dirname(fileURLToPath(import.meta.url));

// 独立于 vite.config.ts：测试只跑纯函数与状态逻辑，不需要 MDX 或图片构建插件。
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
