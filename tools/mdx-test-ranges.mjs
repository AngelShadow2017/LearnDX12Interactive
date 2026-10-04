import fs from 'node:fs';
import { compile } from '@mdx-js/mdx';
import remarkMath from 'remark-math';

const file = process.argv[2];
const ranges = process.argv.slice(3).map((r) => r.split('-').map(Number));
const lines = fs.readFileSync(file, 'utf8').split('\n');
for (const [a, b] of ranges) {
  const part = lines.slice(a - 1, b).join('\n') + '\n</section>';
  try {
    await compile(part, { jsxImportSource: 'react', providerImportSource: '@mdx-js/react', remarkPlugins: [remarkMath] });
    console.log(`${a}-${b} OK`);
  } catch (e) {
    console.log(`${a}-${b} FAIL: ${e.message} ${JSON.stringify(e.place ?? '')}`);
  }
}
