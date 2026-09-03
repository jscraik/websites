import { cp, mkdir, rm, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const dist = join(root, 'dist');
const sourceFiles = ['index.html', 'styles.css', 'app.js', 'favicon.svg', 'favicon.ico', 'package.json'];

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
for (const sourceFile of sourceFiles) await cp(join(root, sourceFile), join(dist, sourceFile));

for (const sourceFile of sourceFiles) {
  const output = await stat(join(dist, sourceFile));
  if (!output.isFile() || output.size === 0) throw new Error(`Build output is missing or empty: ${sourceFile}`);
}

console.log(`BUILD PASS: ${dist}`);
