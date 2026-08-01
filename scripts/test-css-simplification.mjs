import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const cssPath = "src/styles/global.css";
const css = readFileSync(cssPath, "utf8");
const source = [
  "src/pages/index.astro",
  "src/pages/blog/index.astro",
  "src/pages/now.astro",
  "src/pages/work/[slug].astro"
].map((path) => readFileSync(path, "utf8")).join("\n");

assert.equal(
  packageJson.scripts["test:css-simplification"],
  "node scripts/test-css-simplification.mjs",
  "package.json must expose the simplification contract through a named script",
);
assert.match(
  packageJson.scripts["validate:fast"],
  /npm run test:css-simplification/,
  "validate:fast must run the simplification contract",
);

for (const className of [
  "blog-preview__image",
  "home-hero__dek",
  "web-table",
  "web-table-header",
  "brainwav-resource-grid",
  "brainwav-resource-card",
  "case-gallery",
  "case-gallery-frame",
  "feature-stack",
  "feature-split",
  "feature-split__surface",
  "proof-preview",
  "stacked-list",
  "footer-email",
  "site-footer__credit",
  "col-lg-10",
  "site-footer__inner",
  "nav-link--brand",
  "section-heading",
  "proof-grid",
  "proof-track",
  "brand-mark__home",
  "brand-mark__roof",
]) {
  const selector = new RegExp(`\\.${className}\\b`);
  assert.doesNotMatch(css, selector, `${className} must stay removed from the global stylesheet`);
  assert.doesNotMatch(source, selector, `${className} must not be emitted by current Astro source`);
}

assert.match(source, /about-object about-object--\$\{fact\.visual\}/);
assert.match(source, /skill-icon skill-icon--\$\{skill\.icon\}/);
assert.match(source, /work-thumbnail work-thumbnail--/);
assert.equal(
  (css.match(/html body:not\(\.skillsbar-demo\) \.site-header,/g) ?? []).length,
  1,
  "the shared header gradient must have one canonical rule",
);
assert.equal(
  (css.match(/html body:not\(\.skillsbar-demo\) \.site-footer\s*{/g) ?? []).length,
  1,
  "the shared footer gradient must have one canonical rule",
);
assert.doesNotMatch(
  css,
  /body:has\(\.about-page\) \.site-header\s*{/,
  "About must not reintroduce a route-specific header override",
);
assert.doesNotMatch(
  css,
  /body:has\(\.about-page\) \.site-footer\s*{/,
  "About must not reintroduce a route-specific footer override",
);

for (const variant of ["army", "agents", "terminal", "receipt"]) {
  assert.match(css, new RegExp(`\\.about-object--${variant}\\b`));
}

for (const variant of ["paper", "dark", "blue", "peach", "green"]) {
  assert.match(css, new RegExp(`\\.work-thumbnail--${variant}\\b`));
}

console.log("CSS simplification contract passed: removed legacy selectors stay absent and dynamic variants remain covered.");
