import fs from 'node:fs';
import { compile } from '@mdx-js/mdx';
import remarkMath from 'remark-math';

const [file, startArg, endArg] = process.argv.slice(2);
const lines = fs.readFileSync(file, 'utf8').split('\n');
const start = Number(startArg) - 1;
const end = Number(endArg); // exclusive
const slice = lines.slice(start, end);

for (let n = 1; n <= slice.length; n++) {
  const partial = slice.slice(0, n).join('\n');
  try {
    await compile(partial + '\n</section>', { jsxImportSource: 'react', providerImportSource: '@mdx-js/react', remarkPlugins: [remarkMath] });
  } catch (e) {
    console.log('prefix through slice line', n, '(file line', start + n, ') fails ::', e.message);
    process.exit(0);
  }
}
console.log('slice compiles cleanly when appended </section>');
