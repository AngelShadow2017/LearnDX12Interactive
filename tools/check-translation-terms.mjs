import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('frontend/src/content/translations');
const rules = [
  { pattern: /坐标系变更矩阵/g, preferred: '坐标系转换矩阵', note: '同一术语统一使用首选译名。' },
  { pattern: /坐标系统/g, preferred: '坐标系', note: '通用术语统一使用首选译名；专名例外需人工判断。' },
  { pattern: /(?<!曲面)细分阶段/g, preferred: '曲面细分阶段', note: '管线阶段使用完整术语。' },
];

function findMdxFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return findMdxFiles(fullPath);
    return entry.isFile() && entry.name.endsWith('.mdx') ? [fullPath] : [];
  });
}

const findings = [];
for (const file of findMdxFiles(root)) {
  const source = fs.readFileSync(file, 'utf8').replace(/```[\s\S]*?```/g, '');
  const lines = source.split(/\r?\n/);
  lines.forEach((line, index) => {
    for (const rule of rules) {
      rule.pattern.lastIndex = 0;
      if (rule.pattern.test(line)) {
        findings.push(`${path.relative(process.cwd(), file)}:${index + 1}: ${rule.note} 建议“${rule.preferred}”`);
      }
    }
  });
}

if (findings.length) {
  console.error(`发现 ${findings.length} 处可能的术语不一致：`);
  for (const finding of findings) console.error(`- ${finding}`);
  process.exitCode = 1;
} else {
  console.log(`术语一致性检查通过：扫描 ${findMdxFiles(root).length} 个 MDX 文件。`);
}
