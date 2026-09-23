import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, test } from "node:test";

const repoRoot = process.cwd();
const fixtureRoot = mkdtempSync(join(tmpdir(), "portfolio-output-validators-"));
cpSync(join(repoRoot, "dist"), join(fixtureRoot, "dist"), { recursive: true });
after(() => rmSync(fixtureRoot, { recursive: true, force: true }));

const run = (script) => spawnSync(process.execPath, [join(repoRoot, script)], {
  cwd: fixtureRoot,
  encoding: "utf8",
  timeout: 30_000,
});

test("sitemap smoke rejects every 404 URL form only in loc entries", () => {
  const path = join(fixtureRoot, "dist", "sitemap.xml");
  const original = readFileSync(path, "utf8");
  assert.equal(run("scripts/smoke-pages.mjs").status, 0);
  try {
    for (const route of ["/404", "/404/", "/404.html"]) {
      writeFileSync(path, original.replace("</urlset>", `<url><loc>https://jscraik.com${route}</loc></url></urlset>`));
      const result = run("scripts/smoke-pages.mjs");
      assert.equal(result.status, 1, `expected ${route} to fail: ${result.stderr}`);
      assert.match(result.stderr, /404 recovery page must not be indexed/);
    }
    writeFileSync(path, original.replace("</urlset>", "<!-- /404.html --></urlset>"));
    assert.equal(run("scripts/smoke-pages.mjs").status, 0);
  } finally {
    writeFileSync(path, original);
  }
});

test("HTML validator requires the About portrait and checks class tokens", () => {
  const path = join(fixtureRoot, "dist", "now", "index.html");
  const original = readFileSync(path, "utf8");
  const image = /<img class="about-portrait"[^>]*>/;
  assert.match(original, image);
  assert.equal(run("scripts/validate-html-output.mjs").status, 0);
  try {
    writeFileSync(path, original.replace(image, ""));
    let result = run("scripts/validate-html-output.mjs");
    assert.equal(result.status, 1);
    assert.match(result.stderr, /About portrait is missing/);

    const extraClass = original.replace('class="about-portrait"', 'class="portrait about-portrait"');
    writeFileSync(path, extraClass);
    assert.equal(run("scripts/validate-html-output.mjs").status, 0);

    writeFileSync(path, extraClass.replace('src="/jamie-profile-360x480.webp"', 'src="/wrong.webp"'));
    result = run("scripts/validate-html-output.mjs");
    assert.equal(result.status, 1);
    assert.match(result.stderr, /About portrait must use the center-cropped/);
  } finally {
    writeFileSync(path, original);
  }
});
