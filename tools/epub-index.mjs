// 生成全书插图索引：图号 → 所在小节标题 → 原书图注（用于把 312 张图放回对应段落）。
// 用法: node tools/epub-index.mjs  （输出 .epub/figure-index.txt）
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const files = ['intro.html', ...Array.from({ length: 23 }, (_, i) => `ch${String(i + 1).padStart(2, '0')}.html`),
  'appA.html', 'appB.html', 'appC.html', 'appD.html', 'appE.html'];

const lines = [];
let total = 0;
for (const file of files) {
  const source = resolve(root, '.epub/OEBPS', file);
  if (!existsSync(source)) continue;
  const textPath = resolve(root, `.epub/${file.replace('.html', '.txt')}`);
  if (!existsSync(textPath)) continue;
  const lines2 = readFileSync(textPath, 'utf8').split('\n');
  let section = '(front matter)';
  lines.push(`\n===== ${file} =====`);
  for (let i = 0; i < lines2.length; i += 1) {
    const line = lines2[i];
    if (line.startsWith('#')) { section = line.replace(/^#+\s*/, ''); continue; }
    const match = /^\[\[IMG (Fig[^.\]]+\.jpg)\]\]$/.exec(line);
    if (!match) continue;
    let caption = '';
    for (let j = i + 1; j < Math.min(i + 4, lines2.length); j += 1) {
      const next = lines2[j].trim();
      if (next.startsWith('Figure ')) { caption = next; break; }
    }
    total += 1;
    lines.push(`${match[1]}\t${section}\t${caption}`);
  }
}
writeFileSync(resolve(root, '.epub/figure-index.txt'), `${total} figures\n${lines.join('\n')}`, 'utf8');
console.log(`wrote .epub/figure-index.txt with ${total} figures`);
