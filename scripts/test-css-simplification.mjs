import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const cssPath = "src/styles/global.css";
const css = readFileSync(cssPath, "utf8");
const shell = readFileSync("src/styles/shell.css", "utf8");
const routeRhythm = readFileSync("src/styles/route-rhythm.css", "utf8");
const blogPage = readFileSync("src/pages/blog/index.astro", "utf8");
const desktopRouteRhythm = routeRhythm.match(
  /@media \(min-width: 57\.5626rem\) \{([\s\S]*?)\n\}\n\n@media \(max-width: 57\.5625rem\)/,
)?.[1] ?? "";
const layout = readFileSync("src/layouts/BaseLayout.astro", "utf8");
const source = [
  "src/pages/index.astro",
  "src/pages/blog/index.astro",
  "src/pages/now.astro",
  "src/pages/work/[slug].astro",
  "src/components/SiteNav.astro",
  "src/components/WorkCarousel.astro",
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
  /import "\.\.\/styles\/global\.css";\nimport "\.\.\/styles\/shell\.css";\nimport "\.\.\/styles\/editorial-theme\.css";\nimport "\.\.\/styles\/route-rhythm\.css";/,
  "the shared shell and editorial theme must load before route-specific rhythm overrides",
);
assert.match(
  shell,
  /@media \(min-width: 48rem\) and \(max-width: 57\.5625rem\)[\s\S]*?\.site-header \.container\s*{[\s\S]*?width:\s*94%;/,
  "the tablet shell must preserve the Jose 94% container instead of falling back to the full-width mobile grid",
);
assert.match(
  shell,
  /@media \(min-width: 48rem\) and \(max-width: 57\.5625rem\)[\s\S]*?--jp-fluid-rem:\s*clamp\(/,
  "the tablet contract must define the fluid token used by its measured geometry",
);
assert.match(
  shell,
  /@media \(min-width: 48rem\) and \(max-width: 57\.5625rem\)[\s\S]*?\.site-header \.col-md-10\s*{[\s\S]*?flex-basis:\s*83\.3333%;[\s\S]*?max-width:\s*83\.3333%;/,
  "the tablet navigation must retain its 10-of-12 Jose grid column",
);
assert.match(
  routeRhythm,
  /@media \(min-width: 48rem\) and \(max-width: 57\.5625rem\)[\s\S]*?#featured-work\s*{[\s\S]*?width:\s*94%;/,
  "the tablet featured-work slab must use the same wide Jose container as the shell",
);
assert.match(
  routeRhythm,
  /@media \(min-width: 48rem\) and \(max-width: 57\.5625rem\)[\s\S]*?\.feature-block\s*{[\s\S]*?border:\s*0;/,
  "the tablet project cards must not reintroduce the legacy eight-pixel border",
);
assert.match(
  routeRhythm,
  /@media \(min-width: 57\.5626rem\)[\s\S]*?body:not\(\.skillsbar-demo\):has\(\.home-hero\)\s*{[\s\S]*?background-image:\s*linear-gradient\(180deg,\s*var\(--surface-card\),\s*var\(--paper\)\);/,
  "the desktop homepage must paint one full-width Jose gradient behind the nav and hero",
);
assert.match(
  routeRhythm,
  /@media \(min-width: 57\.5626rem\)[\s\S]*?:has\(\.home-hero\) \.header-inner\s*{[\s\S]*?width:\s*100%;[\s\S]*?background:\s*transparent;/,
  "the desktop hero wrapper must not create an inset competing surface",
);
assert.match(
  routeRhythm,
  /@media \(min-width: 57\.5626rem\)[\s\S]*?\.home-hero__intro\s*{[\s\S]*?padding-inline:\s*var\(--jp-half-gap\);/,
  "the desktop hero copy must retain Jose's half-gutter inset inside its grid column",
);
assert.match(
  blogPage,
  /@media \(min-width: 72\.0001rem\)[\s\S]*?\.blog-index\s*{[\s\S]*?width:\s*min\(62\.12vw,[\s\S]*?min-height:\s*calc\(var\(--jp-fluid-rem\) \* 52\.83\);/,
  "the desktop Blog masthead must use Jose's measured column in its owning page stylesheet",
);
assert.match(
  blogPage,
  /@media \(min-width: 72\.0001rem\)[\s\S]*?\.latest-article article\s*{[\s\S]*?justify-content:\s*space-between;[\s\S]*?min-height:\s*calc\(var\(--jp-fluid-rem\) \* 31\.25\);/,
  "the latest Blog article must preserve the measured vertical rhythm in its owning page stylesheet",
);
assert.match(
  blogPage,
  /@media \(min-width: 72\.0001rem\)[\s\S]*?\.latest-article h2\s*{[\s\S]*?font-family:\s*var\(--body-sans\);[\s\S]*?font-weight:\s*600;/,
  "the latest Blog title must retain Jose's compact sans treatment in its owning page stylesheet",
);

for (const className of [
  "blog-preview__image",
  "home-hero__dek",
  "web-table",
  "web-table-header",
  "brainwav-resource-grid",
  "brainwav-resource-card",
  "brainwav-bridge",
  "brainwav-bridge__intro",
  "brainwav-bridge__cta",
  "brainwav-resource-links",
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

assert.match(source, /class="about-fact-label"/, "About interests retain the shared label treatment without oversized decorative scenes");
assert.match(source, /class="about-skill-icon"[\s\S]*?<Icon name=/, "About skills use the shared SVG icon component rather than pseudo-element glyphs");
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
  /\.site-header \.nav-inner \.nav-bg\s*{[^}]*position:\s*absolute;[^}]*inset:\s*0;[^}]*pointer-events:\s*none;/,
  "the navigation highlight must remain a non-interactive absolute layer while it moves between nav targets",
);
assert.match(
  shell,
  /\.site-header \.nav-inner \.nav-flip\s*{[^}]*border-radius:\s*inherit;/,
  "each navigation target must pass the shell radius to its reparented highlight",
);
assert.match(
  shell,
  /\.site-header \.nav-inner \.nav-flip > :not\(\.nav-bg\)\s*{[^}]*position:\s*relative;[^}]*z-index:\s*1;/,
  "each navigation label must remain above the reparented highlight",
);
assert.match(
  shell,
  /@media \(hover: hover\) and \(pointer: fine\)[\s\S]*?\.site-header :is\(\.nav-link, \.icon-box\.cc-nav\):hover\s*{[^}]*transform:\s*none;/,
  "navigation controls must stay fixed on hover",
);
assert.match(shell, /\.site-header \.nav-inner \.nav-bg\s*{[^}]*transition:\s*none;/, "navigation background must stay static");
assert.match(
  shell,
  /@media \(prefers-reduced-transparency: reduce\)[\s\S]*?\.site-header \.nav-inner\s*{[\s\S]*?backdrop-filter:\s*none;/,
  "the extracted shell must preserve the reduced-transparency preference",
);
assert.match(
  shell,
  /@media \(prefers-reduced-motion: reduce\)\s*{\s*\.site-header \.nav-inner \.nav-bg\s*{\s*transform:\s*none;\s*}\s*}/,
  "the navigation highlight must stay still when reduced motion is requested",
);
assert.match(source, /<div class="nav-bg" aria-hidden="true"><\/div>/);
assert.doesNotMatch(readFileSync("src/components/SiteNav.astro", "utf8"), /<script>|getFlipTransform|highlight\.animate/, "navigation must not reparent or animate its background");
assert.doesNotMatch(`${source}\n${css}`, /--nav-highlight-(?:x|scale)/);
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
