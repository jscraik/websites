import fs from 'node:fs';

const html = fs.readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const count = (pattern) => [...html.matchAll(pattern)].length;
const checks = [
  ['doctype', html.startsWith('<!doctype html>')],
  ['language', /<html lang="en">/.test(html)],
  ['title', /<title>Varick — Forward Deployed Engineering<\/title>/.test(html)],
  ['sections = 20', count(/<section\b/g) === 20],
  ['ordered section indices', [...Array(20).keys()].every((i) => html.includes(`data-index="${i}"`))],
  ['H1 = 1', count(/<h1\b/g) === 1],
  ['H2 = 20', count(/<h2\b/g) === 20],
  ['modal H3 = 1', count(/<h3 id="modalTitle"/g) === 1],
  ['buttons = 15', count(/<button\b/g) === 15],
  ['inline SVG = 10', count(/<svg\b/g) === 10],
  ['role img = 4', count(/role="img"/g) === 4],
  ['dialog = 1', count(/<dialog\b/g) === 1],
  ['anchors = 0', count(/<a\b/g) === 0],
  ['forms = 0', count(/<form\b/g) === 0],
  ['placeholder icon name', html.includes('aria-label="Varick placeholder icon"')],
  ['no remote assets', !/(https?:\/\/|src="\/\/|url\(['"]?\/\/)/.test(html)],
  ['required tokens', ['#fff', '#171a22', '#022b72', '#8aa6d8', '#6b7280', '#9fb2d4', '#f3f6fb', '#b23a2e'].every((token) => html.includes(token))],
  ['breakpoints', ['1340px', '1080px', '960px', '820px', '720px'].every((point) => html.includes(point))],
  ['reduced motion', html.includes('prefers-reduced-motion:reduce')],
  ['chapter destinations', ['1', '5', '10', '12', '13', '15'].every((dest) => html.includes(`data-dest="${dest}"`))],
  ['final claim content', html.includes('Do the job before you have the title.')],
];

const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
checks.push(['no duplicate IDs', new Set(ids).size === ids.length]);

let failed = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
  if (!ok) failed += 1;
}
console.log(`SUMMARY ${checks.length - failed}/${checks.length} checks passed`);
process.exitCode = failed ? 1 : 0;
