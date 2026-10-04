import fs from 'node:fs';
import { compile } from '@mdx-js/mdx';
import remarkMath from 'remark-math';

const file = process.argv[2];
const src = fs.readFileSync(file, 'utf8');
const lines = src.split('\n');
let lastBad = -1;
for (let n = 1; n <= lines.length; n++) {
  const partial = lines.slice(0, n).join('\n');
  try {
    await compile(partial, { jsxImportSource: 'react', providerImportSource: '@mdx-js/react', remarkPlugins: [remarkMath] });
  } catch (e) {
    lastBad = n;
    console.log('first failing prefix ends at line', n, '::', e.message);
    break;
  }
}
if (lastBad < 0) console.log('no error found in prefixes');
