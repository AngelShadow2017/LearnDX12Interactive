import { readFileSync } from 'node:fs';
import { parse } from 'parse5';

const chapter = process.argv[2];
if (!/^0?[1-6]$/.test(chapter ?? '')) {
  console.error('Usage: node tools/audit-epub-translation-structure.mjs <1-6>');
  process.exit(2);
}

const id = String(chapter).padStart(2, '0');
const sourcePath = `.epub/OEBPS/ch${id}.html`;
const targetPaths = id === '01'
  ? ['frontend/src/content/translations/ch01.mdx', 'frontend/src/content/translations/translation-parts/ch01-remainder.mdx']
  : [`frontend/src/content/translations/ch${id}.mdx`];
const source = parse(readFileSync(sourcePath, 'utf8'));
const target = targetPaths.map((path) => readFileSync(path, 'utf8')).join('\n');
const elements = [];

function walk(node) {
  if (node.tagName) elements.push(node);
  for (const child of node.childNodes ?? []) walk(child);
  if (node.content) walk(node.content);
}

function textContent(node) {
  if (node.nodeName === '#text') return node.value;
  return (node.childNodes ?? []).map(textContent).join('');
}

walk(source);
const paragraphClasses = new Map();
for (const node of elements.filter((item) => item.tagName === 'p')) {
  const className = node.attrs.find((attr) => attr.name === 'class')?.value ?? '(none)';
  paragraphClasses.set(className, (paragraphClasses.get(className) ?? 0) + 1);
}
const headings = elements
  .filter((node) => /^h[1-6]$/.test(node.tagName) || (node.tagName === 'p' && /^(?:h|sec|section|chapter|title|st)/i.test(node.attrs?.find((attr) => attr.name === 'class')?.value ?? '')))
  .map((node) => `${node.tagName}.${node.attrs?.find((attr) => attr.name === 'class')?.value ?? ''}: ${textContent(node).replace(/\s+/g, ' ').trim()}`);
const sourceImages = elements
  .filter((node) => node.tagName === 'img')
  .map((node) => node.attrs.find((attr) => attr.name === 'src')?.value)
  .filter(Boolean);
const sourcePre = elements.filter((node) => node.tagName === 'pre').length;
const sourceCodeLike = elements.filter((node) => {
  const className = node.attrs?.find((attr) => attr.name === 'class')?.value ?? '';
  return /code|program|listing/i.test(className);
}).length;
const targetHeadings = [...target.matchAll(/^\s*<h[1-6][^>]*>(.*?)<\/h[1-6]>/gm)]
  .map((match) => match[1].replace(/<[^>]+>/g, '').trim());
const targetFigures = [...target.matchAll(/<Figure\s+src="([^"]+)"/g)].map((match) => match[1]);
const targetImgs = [...target.matchAll(/\bimages\/([A-Za-z0-9._-]+\.(?:jpg|png|svg|jpeg|gif))/g)].map((match) => match[1]);
const targetBlocks = [...target.matchAll(/^```[A-Za-z0-9_-]*\s*$/gm)].length / 2;
const imageCounts = new Map();
for (const image of sourceImages) imageCounts.set(image, (imageCounts.get(image) ?? 0) + 1);

console.log(`Chapter ${id}`);
console.log(`Source paragraphs: ${elements.filter((node) => node.tagName === 'p').length}; list items: ${elements.filter((node) => node.tagName === 'li').length}; tables: ${elements.filter((node) => node.tagName === 'table').length}; <pre>: ${sourcePre}; code-like classes: ${sourceCodeLike}`);
console.log(`Paragraph classes: ${[...paragraphClasses].map(([name, count]) => `${name}=${count}`).join(', ')}`);
console.log(`Translation code blocks: ${targetBlocks}; Figure components: ${targetFigures.length}; unique referenced images: ${new Set(targetImgs).size}`);
console.log('\nSOURCE OUTLINE');
console.log(headings.join('\n'));
console.log('\nSOURCE IMAGE REFERENCES (counts)');
console.log([...imageCounts].map(([image, count]) => `${image}${count > 1 ? ` ×${count}` : ''}`).join('\n'));
console.log('\nTRANSLATION OUTLINE');
console.log(targetHeadings.join('\n'));
console.log('\nTRANSLATION FIGURES');
console.log(targetFigures.join('\n'));
