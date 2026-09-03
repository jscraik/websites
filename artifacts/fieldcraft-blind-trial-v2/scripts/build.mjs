import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, 'dist');
if (existsSync(dist)) rmSync(dist, { recursive: true });
mkdirSync(dist, { recursive: true });
for (const file of ['index.html', 'styles.css', 'script.js', 'placeholder-icon.svg', 'favicon.ico']) {
  cpSync(join(root, file), join(dist, file));
}
console.log(`Built static candidate at ${dist}`);
