import { mergeConfig } from 'vite';
import base from './vite.config';

// 临时验证配置：复用生产配置但不清空 dist（避免触发安全删除护栏）。
export default mergeConfig(base, {
  build: { emptyOutDir: false },
});
