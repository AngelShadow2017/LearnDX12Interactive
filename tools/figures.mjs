// 列出指定章节的插图索引与中文图注（内容编写时用来把图放回对应小节）。
// 用法: node tools/figures.mjs ch06 ch07 ch08 ch09 ch10 ch11
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const index = readFileSync(resolve(root, '.epub/figure-index.txt'), 'utf8').split('\n');
const captions = JSON.parse(readFileSync(resolve(root, '.epub/figure-captions.json'), 'utf8'));

const wanted = process.argv.slice(2);
let current = '';
for (const line of index) {
  if (line.startsWith('=====')) { current = line.replace(/[=\s]/g, ''); continue; }
  if (wanted.length > 0 && !wanted.includes(current.replace('.html', ''))) continue;
  const [src, section, caption = ''] = line.split('\t');
  if (!src?.startsWith('Fig')) continue;
  console.log(`${src}\t${section}\t${captions[src] ?? caption}`);
}
