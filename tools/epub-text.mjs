// 把 EPUB 章节 HTML 转成便于人工校对的纯文本，保留图片位置、小节标题和图注。
// 用法: node tools/epub-text.mjs <chapter>  例如: node tools/epub-text.mjs ch01
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const name = process.argv[2] ?? 'ch01';
const html = readFileSync(resolve(root, '.epub/OEBPS', `${name}.html`), 'utf8');

let text = html
  .replace(/<script[\s\S]*?<\/script>/gi, '')
  .replace(/<style[\s\S]*?<\/style>/gi, '')
  .replace(/<img[^>]*src="([^"]*)"[^>]*>/gi, (_m, src) => `\n[[IMG ${src.split('/').pop()}]]\n`)
  .replace(/<p class="h([1-4])"[^>]*>([\s\S]*?)<\/p>/gi, (_m, level, body) => `\n\n${'#'.repeat(Number(level))} ${strip(body)}\n`)
  .replace(/<h([1-4])[^>]*>([\s\S]*?)<\/h\1>/gi, (_m, level, body) => `\n\n${'#'.repeat(Number(level))} ${strip(body)}\n`)
  .replace(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/gi, (_m, body) => `\n[CAPTION] ${strip(body)}\n`)
  .replace(/<div[^>]*class="[^"]*(caption|figcap|figure-title)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi, (_m, _c, body) => `\n[CAPTION] ${strip(body)}\n`)
  .replace(/<li[^>]*>/gi, '\n- ')
  .replace(/<\/(p|li|tr|div|section|table)>/gi, '\n')
  .replace(/<br\s*\/?>/gi, '\n')
  .replace(/<[^>]+>/g, '');

text = decode(text)
  .split('\n')
  .map((line) => line.replace(/[ \t]+/g, ' ').trim())
  .filter((line, index, all) => line !== '' || (all[index - 1] ?? '') !== '')
  .join('\n');

writeFileSync(resolve(root, `.epub/${name}.txt`), text, 'utf8');
console.log(`wrote .epub/${name}.txt (${text.length} chars)`);

function strip(fragment) {
  return decode(fragment.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function decode(value) {
  return value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_m, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_m, code) => String.fromCodePoint(parseInt(code, 16)));
}
