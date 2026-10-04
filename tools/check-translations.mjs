import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const translationsRoot = path.join(repoRoot, 'frontend', 'src', 'content', 'translations');
const imageRoot = path.join(repoRoot, 'images');
const strict = process.argv.includes('--strict');

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

const translationFiles = walk(translationsRoot)
  .filter((file) => file.endsWith('.mdx') && !file.endsWith('chapter-template.mdx'));
const imageFiles = new Set(walk(imageRoot)
  .filter((file) => /\.(?:png|jpe?g|gif|webp|svg)$/i.test(file))
  .map((file) => path.relative(imageRoot, file).split(path.sep).join('/')));

const expected = [
  'intro.mdx',
  'appendix.mdx',
  ...Array.from({ length: 23 }, (_, index) => `ch${String(index + 1).padStart(2, '0')}.mdx`),
];
const present = new Set(readdirSync(translationsRoot).filter((name) => name.endsWith('.mdx')));
const missing = expected.filter((name) => !present.has(name));
const errors = [];
let imageReferenceCount = 0;

for (const file of translationFiles) {
  const relativeFile = path.relative(repoRoot, file).split(path.sep).join('/');
  const source = readFileSync(file, 'utf8');

  if (/\[\[IMG\s+/i.test(source)) errors.push(`${relativeFile}: 未处理的 [[IMG ...]] 图片标记`);

  for (const match of source.matchAll(/\b(?:src|href)\s*=\s*["']([^"']+)["']/g)) {
    const assetPath = match[1];
    if (/^\/images\//i.test(assetPath)) {
      errors.push(`${relativeFile}: 图片路径必须相对，当前为 ${assetPath}`);
      continue;
    }
    if (!assetPath.startsWith('images/')) continue;
    imageReferenceCount += 1;
    if (!imageFiles.has(assetPath.slice('images/'.length))) {
      errors.push(`${relativeFile}: 图片不存在或文件名大小写不匹配：${assetPath}`);
    }
  }

  const ids = new Set();
  for (const match of source.matchAll(/\bid\s*=\s*["']([^"']+)["']/g)) {
    if (ids.has(match[1])) errors.push(`${relativeFile}: 重复的页面锚点 id="${match[1]}"`);
    ids.add(match[1]);
  }
}

console.log(`译文 MDX 文件：${translationFiles.length}`);
console.log(`译文图片引用：${imageReferenceCount}`);
console.log(`全书目标文件：${expected.length}；缺少：${missing.length}`);
if (missing.length) console.log(`尚待录入：${missing.join(', ')}`);
if (errors.length) {
  console.error(`译文检查发现 ${errors.length} 个问题：`);
  for (const error of errors) console.error(`- ${error}`);
}

if (errors.length || (strict && missing.length)) process.exitCode = 1;
