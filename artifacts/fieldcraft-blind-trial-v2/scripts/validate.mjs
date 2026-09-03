import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const html = readFileSync(join(root, 'index.html'), 'utf8');
const css = readFileSync(join(root, 'styles.css'), 'utf8');
const js = readFileSync(join(root, 'script.js'), 'utf8');
const count = (pattern, source = html) => [...source.matchAll(pattern)].length;
const assertions = [
  [count(/<section class="section\b/g) === 20, 'exactly 20 presentation sections'],
  [count(/<h1\b/g) === 1, 'one H1'],
  [count(/<h2\b/g) === 20, 'twenty H2 elements'],
  [count(/<h3\b/g) === 1 && count(/<h3 id="modal-title"/g) === 1, 'one modal H3'],
  [count(/<button\b/g) === 15, 'fifteen buttons'],
  [count(/<svg\b/g) === 10, 'ten inline SVG elements'],
  [count(/role="img"/g) === 4, 'four role=img elements'],
  [count(/<dialog\b/g) === 1, 'one dialog'],
  [count(/<a\b/g) === 0, 'no anchors'],
  [count(/<form\b/g) === 0, 'no forms'],
  [html.includes('<span>AI Forward Deployed</span><br>Engineering'), 'intentional hero line break'],
  [css.includes('h1>span{display:inline-block;white-space:nowrap;transform:scaleX(.89);transform-origin:left center}'), 'desktop hero first-line fit and wrap guard'],
  [css.includes('@media(min-width:961px) and (max-height:720px){.hero-inner{justify-content:flex-start}.hero h1{margin-top:65.4px}}'), 'compact-height desktop hero vertical placement guard'],
  [css.includes('.hero h1>span{white-space:normal;transform:none}'), 'small-mobile hero restores natural wrapping'],
  [html.includes('href="./favicon.ico"') && existsSync(join(root, 'favicon.ico')), 'local favicon exists'],
  [html.includes('src="./placeholder-icon.svg"') && existsSync(join(root, 'placeholder-icon.svg')), 'local placeholder icon exists'],
  [js.includes('threshold:[0,.6]'), 'intersection observer thresholds'],
  [js.includes('360'), 'wheel momentum lock'],
  [js.includes('finalComplete'), 'final two-state controller'],
  [css.includes('@media(prefers-reduced-motion:reduce)'), 'reduced-motion mode'],
  [html.includes('<html lang="en">'), 'document language'],
  [html.includes('Varick — Forward Deployed Engineering'), 'required title']
];
let failed = 0;
for (const [pass, label] of assertions) {
  console.log(`${pass ? 'PASS' : 'FAIL'} ${label}`);
  if (!pass) failed += 1;
}
if (failed) process.exit(1);
console.log(`PASS all ${assertions.length} structural assertions`);
