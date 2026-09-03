import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const html = await readFile(resolve(root, "dist/index.html"), "utf8");
const css = await readFile(resolve(root, "dist/style.css"), "utf8");
const js = await readFile(resolve(root, "dist/app.js"), "utf8");

const count = (pattern, source = html) => [...source.matchAll(pattern)].length;

assert.equal(count(/<section\b/g), 20, "exactly 20 sections");
assert.equal(count(/<h1\b/g), 1, "exactly one H1");
assert.equal(count(/<h2\b/g), 20, "exactly twenty H2 headings");
assert.equal(count(/<h3\b/g), 1, "exactly one modal H3");
assert.equal(count(/<button\b/g), 15, "exactly fifteen buttons");
assert.equal(count(/<svg\b/g), 10, "exactly ten inline SVG elements");
assert.equal(count(/role="img"/g), 4, "wordmark plus three diagrams use role=img");
assert.equal(count(/<dialog\b/g), 1, "exactly one dialog");
assert.equal(count(/<a\b/g), 0, "no anchors");
assert.equal(count(/<form\b/g), 0, "no forms");
assert.equal(count(/data-scene-region=/g) >= 50, true, "stable scene regions are present");
assert.match(html, /data-state-hidden="true"/, "hidden state layers are declared truthfully");
assert.match(css, /\[data-state-hidden="true"\]/, "hidden state CSS removes hit testing");
assert.match(js, /setAttribute\("data-state-hidden", hidden \? "true" : "false"\)/, "runtime maintains hidden markers");
assert.match(html, /Varick placeholder icon/, "placeholder icon has the required accessible name");
assert.match(html, /Varick — Forward Deployed Engineering/, "required title is present");

for (const path of ["dist/index.html", "dist/style.css", "dist/app.js"]) {
  assert.equal((await stat(resolve(root, path))).isFile(), true, `${path} exists`);
}

console.log("Structural contract: PASS");
