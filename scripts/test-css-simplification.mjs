import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const cssPath = "src/styles/global.css";
const css = readFileSync(cssPath, "utf8");
const shell = readFileSync("src/styles/shell.css", "utf8");
const layout = readFileSync("src/layouts/BaseLayout.astro", "utf8");
const source = [
  "src/pages/index.astro",
  "src/pages/blog/index.astro",
  "src/pages/now.astro",
  "src/pages/work/[slug].astro",
  "src/components/SiteNav.astro",
  "src/components/SiteFooter.astro"
].map((path) => readFileSync(path, "utf8")).join("\n");
const combinedSource = css + "\n" + source;

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
assert.equal(
  existsSync("src/components/BrandMark.astro"),
  false,
  "the unused BrandMark component must stay removed",
);
assert.doesNotMatch(
  css,
  /\.brand-mark\b/,
  "the unused BrandMark styling must stay removed",
);
assert.doesNotMatch(
  source,
  /brand-mark/i,
  "current Astro source must not emit the removed BrandMark contract",
);
assert.match(
  layout,
  /import "\.\.\/styles\/global\.css";\nimport "\.\.\/styles\/shell\.css";/,
  "the shared shell stylesheet must load after the global stylesheet",
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
  (shell.match(/html body:not\(\.skillsbar-demo\) \.site-header,/g) ?? []).length,
  1,
  "the shared header gradient must have one canonical rule",
);
assert.equal(
  (shell.match(/html body:not\(\.skillsbar-demo\) \.site-footer\s*{/g) ?? []).length,
  1,
  "the shared footer gradient must have one canonical rule",
);
assert.equal(
  (shell.match(/html body:not\(\.skillsbar-demo\) \.site-header \.nav-inner\s*{\s*background:\s*transparent;/g) ?? []).length,
  1,
  "the portfolio navigation surface must have one canonical rule",
);
assert.match(
  shell,
  /html body:not\(\.skillsbar-demo\) \.site-header \.nav-inner\s*{[\s\S]*?background:\s*transparent;/,
  "the navigation content layer must stay transparent",
);
assert.equal(
  (shell.match(/html body:not\(\.skillsbar-demo\) \.site-header \.nav-inner \.nav-bg\s*{/g) ?? []).length,
  1,
  "the portfolio navigation background must have one canonical rule",
);
assert.match(
  shell,
  /html body:not\(\.skillsbar-demo\) \.site-header \.nav-inner \.nav-bg\s*{[\s\S]*?background:\s*var\(--bds-color-portfolio-nav\);/,
  "the navigation background layer must use the portfolio navigation token",
);
assert.match(
  shell,
  /\.site-header \.nav-inner \.nav-bg\s*{[^}]*transform:\s*translate3d\(var\(--nav-highlight-x, 0px\), 0, 0\) scaleX\(var\(--nav-highlight-scale, 1\)\);/,
  "the navigation highlight must move with a compositor-friendly transform",
);
assert.match(
  shell,
  /\.site-header \.nav-inner \.nav-bg\s*{[^}]*transition-property:\s*transform;[^}]*transition-duration:\s*var\(--jp-motion-standard\);/,
  "the navigation highlight must constrain its transition to transform",
);
assert.match(
  shell,
  /@media \(prefers-reduced-transparency: reduce\)[\s\S]*?\.site-header \.nav-inner\s*{[\s\S]*?backdrop-filter:\s*none;/,
  "the extracted shell must preserve the reduced-transparency preference",
);
assert.match(
  shell,
  /@media \(prefers-reduced-motion: reduce\)\s*{\s*\.site-header \.nav-inner \.nav-bg\s*{\s*transform:\s*none;\s*transition:\s*none;\s*}\s*}/,
  "the navigation highlight must stay still when reduced motion is requested",
);
assert.match(source, /<div class="nav-bg" aria-hidden="true"><\/div>/);
assert.match(source, /highlight\.dataset\.active = "true"/);
assert.match(source, /highlight\.style\.setProperty\("--nav-highlight-x"/);
assert.match(source, /highlight\.style\.setProperty\("--nav-highlight-scale"/);
assert.match(source, /navShell\.querySelector\("\.nav-flip:focus-within"\) \?\? navShell\.querySelector\("\.nav-flip:hover"\)/);
assert.match(source, /prefers-reduced-motion: reduce/);
assert.doesNotMatch(
  css,
  /--jp-surface\b/,
  "the removed duplicate Jose surface alias must stay absent",
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
assert.match(
  css,
  /body:has\(\.home-hero\)\s*{[\s\S]*?background:\s*var\(--paper\);/,
  "the home route canvas must use the neutral paper surface",
);
assert.match(
  css,
  /body:has\(\.about-page\) main\s*{[\s\S]*?background:\s*var\(--paper\);/,
  "the About route canvas must use the neutral paper surface",
);
assert.match(
  source,
  /:global\(body:has\(\.blog-index\)\)\s*{[\s\S]*?background:\s*var\(--paper\);/,
  "the Blog route canvas must use the neutral paper surface",
);
assert.doesNotMatch(
  combinedSource,
  /body:has\(\.(?:home-hero|about-page|blog-index)\)[\s\S]*?linear-gradient\(180deg,\s*var\(--surface-card\),\s*var\(--paper\)\)/,
  "route canvases must not add a competing top-level Jose gradient",
);

for (const variant of ["army", "agents", "terminal", "receipt"]) {
  assert.match(css, new RegExp(`\\.about-object--${variant}\\b`));
}

for (const variant of ["paper", "dark", "blue", "peach", "green"]) {
  assert.match(css, new RegExp(`\\.work-thumbnail--${variant}\\b`));
}

console.log("CSS simplification contract passed: removed legacy selectors stay absent and dynamic variants remain covered.");
