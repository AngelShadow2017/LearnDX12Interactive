// 从旧版中文页面抽取已有中文图注，生成 .epub/figure-captions.json。
// 用法: node tools/figure-captions.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pages = ['intro.html', ...Array.from({ length: 23 }, (_, i) => `ch${String(i + 1).padStart(2, '0')}.html`), 'appendix.html'];
const sourcePages = pages.filter((page) => existsSync(resolve(root, page)));
if (sourcePages.length === 0) {
  throw new Error('No legacy HTML sources found; refusing to overwrite the saved figure caption manifest with an empty file.');
}
const captions = {};
const pattern = /<img[^>]*src="images\/(Fig[^"]+\.jpg)"[^>]*>\s*<figcaption>([\s\S]*?)<\/figcaption>/g;

for (const page of sourcePages) {
  const file = resolve(root, page);
  const html = readFileSync(file, 'utf8');
  for (const match of html.matchAll(pattern)) {
    const [, src, caption] = match;
    captions[src] = decode(caption.replace(/\s+/g, ' ').trim());
  }
}

writeFileSync(resolve(root, '.epub/figure-captions.json'), `${JSON.stringify(captions, null, 2)}\n`, 'utf8');
console.log(`wrote ${Object.keys(captions).length} captions`);

function decode(value) {
  return value
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#(\d+);/g, (_m, code) => String.fromCodePoint(Number(code)));
}
