import fs from 'node:fs';
for (const c of ['ch10', 'ch11', 'ch12', 'ch13', 'ch14']) {
  const lines = fs.readFileSync(`frontend/src/content/translations/${c}.mdx`, 'utf8').split('\n');
  let inCode = false;
  lines.forEach((l, i) => {
    if (l.startsWith('```')) { inCode = !inCode; return; }
    if (inCode) return;
    if (l.trimStart().startsWith('$$')) return;
    const n = (l.match(/(?<!\\)\$/g) || []).length;
    if (n % 2) console.log(c, i + 1, 'odd $:', l.slice(0, 100));
  });
}
