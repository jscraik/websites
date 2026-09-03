import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const dist = join(root, 'dist');
const mode = process.argv[2] ?? 'all';
const requiredRegionKeys = {
  1: ['copy', 'stage', 'foundation', 'company-row', 'stage-caption'],
  2: ['statement', 'stage', 'company-row', 'caption'],
  3: ['lead', 'statement', 'stage', 'roi-node', 'closing'],
  4: ['lead', 'statement', 'stages', 'closing'],
  5: ['statement', 'commercial-world', 'fde-node', 'technical-world', 'closing'],
  6: ['copy', 'cards', 'instruction', 'label'],
  7: ['diagram', 'exception', 'evidence-rail', 'closing'],
  8: ['statement', 'phase-rail', 'run-panel', 'approval'],
  9: ['statement', 'chain', 'closing'],
  10: ['copy', 'context-column', 'findings-column', 'artifact-column', 'artifact-header', 'artifact-table', 'bottom-rail'],
  11: ['root', 'branches', 'closing'],
  12: ['evaluation-table', 'evaluation-header', 'report', 'legend', 'bottom-rail'],
  13: ['architecture', 'principles', 'closing'],
  14: ['loop', 'statement', 'prompt'],
  15: ['copy', 'instruction', 'timeline', 'case-study', 'project-note', 'project-tags'],
  16: ['copy', 'calendar', 'system-rail', 'project-tags'],
  17: ['copy', 'calendar', 'system-rail', 'project-tags'],
  18: ['copy', 'calendar', 'system-rail', 'project-tags'],
  19: ['copy', 'calendar', 'system-rail', 'project-tags']
};
const modalRegions = ['modal-backdrop', 'modal-panel', 'modal-tag', 'modal-title', 'modal-punch', 'modal-bullets', 'modal-closing-label', 'modal-closing', 'modal-close'];
const mimeTypes = { '.css': 'text/css', '.html': 'text/html', '.ico': 'image/svg+xml', '.js': 'text/javascript', '.svg': 'image/svg+xml' };

function count(pattern, text) { return [...text.matchAll(pattern)].length; }
function assert(condition, message) { if (!condition) throw new Error(message); }
function sceneMarkup(html, index) {
  const marker = `<section class="scene${index === 0 ? ' hero' : ''}`;
  const start = html.indexOf(`data-scene-index="${index}"`);
  assert(start >= 0, `Missing scene ${index}`);
  const next = html.indexOf('<section ', start + 1);
  return html.slice(Math.max(0, html.lastIndexOf('<section ', start)), next < 0 ? html.length : next);
}
function balancedBraces(css) {
  let depth = 0;
  for (const character of css) { if (character === '{') depth += 1; if (character === '}') depth -= 1; if (depth < 0) return false; }
  return depth === 0;
}

async function validateStructure() {
  const [html, css, app] = await Promise.all([readFile(join(root, 'index.html'), 'utf8'), readFile(join(root, 'styles.css'), 'utf8'), readFile(join(root, 'app.js'), 'utf8')]);
  assert(html.includes('<html lang="en">'), 'Missing English document language.');
  assert(html.includes('<meta charset="UTF-8"'), 'Missing UTF-8 metadata.');
  assert(html.includes('width=device-width,initial-scale=1'), 'Missing viewport metadata.');
  assert(html.includes('<title>Varick — Forward Deployed Engineering</title>'), 'Incorrect document title.');
  assert(count(/<section\b/g, html) === 20, 'Expected exactly 20 sections.');
  assert([...Array(20).keys()].every((index) => html.includes(`data-scene-index="${index}"`)), 'Section indices are incomplete.');
  assert(count(/<h1\b/g, html) === 1, 'Expected exactly one H1.');
  assert(count(/<h2\b/g, html) === 20, 'Expected exactly 20 H2 headings.');
  assert(count(/<h3\b/g, html) === 1, 'Expected exactly one modal H3.');
  assert(count(/<button\b/g, html) === 15, 'Expected exactly 15 buttons.');
  assert(count(/<svg\b/g, html) === 10, 'Expected exactly 10 inline SVG elements.');
  assert(count(/role="img"/g, html) === 4, 'Expected exactly four role=img elements.');
  assert(count(/<dialog\b/g, html) === 1, 'Expected exactly one dialog.');
  assert(count(/<a\b/g, html) === 0 && count(/<form\b/g, html) === 0, 'Anchors and forms are forbidden.');
  assert(!/https?:\/\//.test(html + css + app), 'Candidate must not depend on a remote asset or URL.');
  assert(balancedBraces(css), 'Unbalanced CSS braces.');
  assert(['--paper', '--ink', '--navy', '--line', '--ease'].every((token) => css.includes(token)), 'Required design tokens are absent.');
  for (const [index, keys] of Object.entries(requiredRegionKeys)) {
    const scene = sceneMarkup(html, Number(index));
    for (const key of keys) assert(scene.includes(`data-scene-region="${key}"`), `Scene ${index} is missing region ${key}.`);
  }
  for (const key of modalRegions) assert(html.includes(`data-scene-region="${key}"`), `Modal is missing region ${key}.`);
  assert(app.includes('IntersectionObserver') && app.includes('threshold: [0, .6]'), 'Navigation observer contract is missing.');
  assert(app.includes('window.__fieldcraftValidateScene'), 'Candidate browser-rendered scene validator is missing.');
  assert(app.includes('prefers-reduced-motion'), 'Reduced-motion state contract is missing.');
  console.log('STRUCTURE PASS: 20 scenes, semantic inventory, region wrappers, local assets, and candidate browser validator are present.');
}

async function contentType(file) { return mimeTypes[extname(file)] ?? 'application/octet-stream'; }
async function validateHttp() {
  const files = new Set(['index.html', 'styles.css', 'app.js', 'favicon.svg', 'favicon.ico']);
  await Promise.all([...files].map(async (file) => { const info = await stat(join(dist, file)); assert(info.isFile() && info.size > 0, `Missing build file ${file}.`); }));
  const server = createServer(async (request, response) => {
    const pathname = request.url === '/' ? '/index.html' : request.url ?? '/index.html';
    const requested = normalize(pathname).replace(/^[/\\]+/, '');
    if (!files.has(requested)) { response.writeHead(404); response.end('Not found'); return; }
    const body = await readFile(join(dist, requested));
    response.writeHead(200, { 'content-type': await contentType(requested), 'content-length': body.length });
    response.end(body);
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  try {
    for (const route of ['/', '/styles.css', '/app.js', '/favicon.svg', '/favicon.ico']) {
      const response = await fetch(`http://127.0.0.1:${port}${route}`);
      assert(response.status === 200, `HTTP ${route} returned ${response.status}.`);
      const body = await response.text();
      assert(body.length > 0, `HTTP ${route} returned an empty response.`);
    }
  } finally { await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())); }
  const indexHash = createHash('sha256').update(await readFile(join(dist, 'index.html'))).digest('hex');
  console.log(`HTTP PASS: local candidate route and required assets returned 200.\nARTIFACT SHA256 (dist/index.html): ${indexHash}`);
}

if (mode === 'structure' || mode === 'all') await validateStructure();
if (mode === 'http' || mode === 'all') await validateHttp();
