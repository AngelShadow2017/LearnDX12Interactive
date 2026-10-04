import fs from 'node:fs';
import { compile } from '@mdx-js/mdx';
import remarkMath from 'remark-math';

const [file, startArg, endArg] = process.argv.slice(2);
const lines = fs.readFileSync(file, 'utf8').split('\n');
const start = Number(startArg);
const end = Number(endArg);
for (let n = start + 1; n <= end; n++) {
  const part = lines.slice(start - 1, n).join('\n') + '\n</section>';
  try {
    await compile(part, { jsxImportSource: 'react', providerImportSource: '@mdx-js/react', remarkPlugins: [remarkMath] });
  } catch (e) {
    console.log('first failure when including line', n, '::', e.message);
    console.log('>>> line', n, ':', JSON.stringify(lines[n - 1]?.slice(0, 120)));
    process.exit(0);
  }
}
console.log('no failure');
