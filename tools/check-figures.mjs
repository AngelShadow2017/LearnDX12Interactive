// 核对：MDX 里引用的插图 vs 旧页面已引用的 312 张（用完即删）。
// 用法: node tools/check-figures.mjs
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const chapterDir = resolve(root, 'frontend/src/content/chapters');

const used = new Map();
for (const name of readdirSync(chapterDir)) {
  if (!name.endsWith('.mdx')) continue;
  const text = readFileSync(resolve(chapterDir, name), 'utf8');
  for (const match of text.matchAll(/src="images\/(Fig[^"]+\.jpg)"/g)) {
    used.set(match[1], name);
  }
}

const captions = JSON.parse(readFileSync(resolve(root, '.epub/figure-captions.json'), 'utf8'));
const expected = Object.keys(captions);
const missing = expected.filter((file) => !used.has(file));
const extra = [...used.keys()].filter((file) => !captions[file]);

console.log(`旧页面已引用：${expected.length} 张`);
console.log(`新 MDX 已放置：${used.size} 张`);
console.log(`缺少：${missing.length} 张`);
if (missing.length) {
  const byChapter = new Map();
  for (const file of missing) {
    const chapter = file.slice(3, 5);
    byChapter.set(chapter, [...(byChapter.get(chapter) ?? []), file]);
  }
  for (const [chapter, list] of [...byChapter].sort()) console.log(`  第 ${chapter} 章：${list.join(' ')}`);
}
if (extra.length) console.log(`多余（不在旧清单里）：${extra.join(' ')}`);
