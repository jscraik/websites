import { readFileSync } from "node:fs";

const cssPath = process.env.PAGE_SURFACE_CSS_PATH ?? "src/styles/global.css";
const css = readFileSync(cssPath, "utf8");
const aboutPagePath = process.env.PAGE_SURFACE_ABOUT_PATH ?? "src/pages/now.astro";
const aboutPageSource = readFileSync(aboutPagePath, "utf8");
const blogPagePath = process.env.PAGE_SURFACE_BLOG_PATH ?? "src/pages/blog/index.astro";
const blogPageSource = readFileSync(blogPagePath, "utf8");

const failures = [];

const forbiddenSurfaceTokens = [
  "#d5d6d0",
  "rgb(213, 214, 208)",
  "rgba(213, 214, 208"
];

for (const token of forbiddenSurfaceTokens) {
  if (css.includes(token)) {
    failures.push(
      cssPath + ": forbidden Jose grey surface token found: " + token + ". Use var(--paper) for Jamie page backgrounds."
    );
  }
}

const forbiddenFullBleedPatterns = [
  /box-shadow:\s*0\s+0\s+0\s+100vmax/gi,
  /clip-path:\s*inset\(0\s+-100vmax\)/gi
];

for (const pattern of forbiddenFullBleedPatterns) {
  const matches = [...css.matchAll(pattern)];
  for (const match of matches) {
    const line = css.slice(0, match.index).split("\n").length;
    failures.push(
      cssPath + ":" + line + ": forbidden full-bleed section background pattern found. Page sections must not create hidden viewport-wide bands."
    );
  }
}

if (/\.blog-about-card\s*{[^}]*max-width:\s*440px;/m.test(css)) {
  failures.push(
    cssPath + ": collapsed .blog-about-card max-width: 440px rule found. Blog author cards need an explicit two-column desktop layout."
  );
}

const forbiddenSecondLineTitleRules = [
  /\.h1-name\s+span:nth-child\(2\)\s*{/g,
  /\.home-hero\s+h1\s+span:nth-child\(2\)\s*{/g
];

for (const pattern of forbiddenSecondLineTitleRules) {
  const matches = [...css.matchAll(pattern)];
  for (const match of matches) {
    const line = css.slice(0, match.index).split("\n").length;
    failures.push(
      cssPath + ":" + line + ": forbidden second-line hero title override found. Hero title lines must share the same display scale through the shared h1 rule."
    );
  }
}

const compressedTagRowPattern = /\.tag-row\s*{[^}]*min-height:\s*26px;/g;
for (const match of css.matchAll(compressedTagRowPattern)) {
  const line = css.slice(0, match.index).split("\n").length;
  failures.push(
    cssPath + ":" + line + ": forbidden compressed .tag-row min-height found. All work tags should use the shared Jose-measured tag-row height token."
  );
}

const compressedStartLinkPattern =
  /\.start-links\s+a\s*{[^}]*font-size:\s*calc\(var\(--jp-fluid-rem\)\s*\*\s*0\.875\)/g;
for (const match of css.matchAll(compressedStartLinkPattern)) {
  const line = css.slice(0, match.index).split("\n").length;
  failures.push(
    cssPath + ":" + line + ": forbidden compressed .start-links link font size found. Start links should inherit the shared Jose body text scale."
  );
}

const monoForcedStartLinkTextPattern =
  /\.start-links\s+a\s+span:last-child\s*{[^}]*font-family:\s*["']?Geist Mono/g;
for (const match of css.matchAll(monoForcedStartLinkTextPattern)) {
  const line = css.slice(0, match.index).split("\n").length;
  failures.push(
    cssPath + ":" + line + ": forbidden mono-forced .start-links link text found. Start-link labels should inherit the shared Jose body text family."
  );
}

const inflatedHeroIntroPattern =
  /\.home-hero__intro\s*{[^}]*max-width:\s*none;[^}]*padding-right:\s*var\(--jp-half-gap\)/g;
for (const match of css.matchAll(inflatedHeroIntroPattern)) {
  const line = css.slice(0, match.index).split("\n").length;
  failures.push(
    cssPath + ":" + line + ": forbidden inflated .home-hero__intro layout found. The hero intro should keep the shared Jose-measured stack width instead of padding past it."
  );
}

const footerGradientPattern = /\.site-footer\s*{[^}]*background:\s*linear-gradient/g;
for (const match of css.matchAll(footerGradientPattern)) {
  const line = css.slice(0, match.index).split("\n").length;
  failures.push(
    cssPath + ":" + line + ": forbidden .site-footer gradient found. Footer should stay on the shared var(--paper) page surface."
  );
}

if (/class=["']about-page\s+section-shell["']/.test(aboutPageSource)) {
  failures.push(
    aboutPagePath + ": forbidden About wrapper found. The About intro should be a header-height .about-page section, not a page-wide section-shell around every About section."
  );
}

if (!/class=["']about-hero-spacer["']/.test(aboutPageSource)) {
  failures.push(
    aboutPagePath + ": missing About hero spacer column. The About intro should keep the Jose-derived 5/1/2 header grid instead of collapsing to a local two-column exception."
  );
}

if (!/class=["']about-fact-label["']/.test(aboutPageSource)) {
  failures.push(
    aboutPagePath + ": missing About fact label element. Fun Facts cards should use the shared Jose label-tag sizing pattern instead of ad hoc card text."
  );
}

if (!/class=["']about-band-heading["']/.test(aboutPageSource)) {
  failures.push(
    aboutPagePath + ": missing About band heading wrapper. Section headings and meta labels should share one Jose-style heading block before the grid."
  );
}

if (!/class=["']about-skills-stack["']/.test(aboutPageSource)) {
  failures.push(
    aboutPagePath + ": missing About skills stack. The Skills section should keep the Jose-style title, skill grid, and capabilities stack rather than a split-section exception."
  );
}

if (!/class=["']about-capabilities["']/.test(aboutPageSource)) {
  failures.push(
    aboutPagePath + ": missing All Capabilities block. The Skills section should include the capabilities pill row from the Jose reference structure."
  );
}

if (!/class=["']about-history-stack["']/.test(aboutPageSource)) {
  failures.push(
    aboutPagePath + ": missing About history stack. Work History should use the Jose-style centered stack instead of the generic split-section layout."
  );
}

if (!/class=["']work-history-inner\s+cc-top["']/.test(aboutPageSource)) {
  failures.push(
    aboutPagePath + ": missing Work History top row. Each history item should expose company, spacer, and date metadata in the Jose-style grid."
  );
}

if (!/class=["']about-web-stack["']/.test(aboutPageSource)) {
  failures.push(
    aboutPagePath + ": missing About web stack. On the Web should use the Jose-style centered recognition list rather than the generic split-section layout."
  );
}

if (!/class=["']recognition-list-li\s+cc-header["']/.test(aboutPageSource)) {
  failures.push(
    aboutPagePath + ": missing recognition list header row. The On the Web table should expose Date, Venue, Occasion, and Subject as a Jose-style grid header."
  );
}

if (!/class=["']blog-page-main["']/.test(blogPageSource)) {
  failures.push(
    blogPagePath + ": missing Blog page main wrapper. Browse all articles and the author block should stay in the Jose-style centered Blog page flow."
  );
}

if (!/class=["']blog-author-copy["']/.test(blogPageSource)) {
  failures.push(
    blogPagePath + ": missing Blog author copy wrapper. The Blog author section should keep the Jose-style image, spacer, and rich text column structure."
  );
}

if (!/class=["']text-lg\s+w-richtext["']/.test(blogPageSource)) {
  failures.push(
    blogPagePath + ": missing Blog author richtext block. The author copy should keep the Jose-style text-lg w-richtext paragraph stack."
  );
}

const requiredPaperRules = [
  {
    name: "About page shell",
    pattern: /body:has\(\.about-page\),\s*\nbody:has\(\.about-page\) main\s*{\s*\n\s*background:\s*var\(--paper\);/m
  },
  {
    name: "About page container",
    pattern: /\.about-page\s*{[\s\S]*?background:\s*var\(--paper\);[\s\S]*?}/m
  },
  {
    name: "Footer",
    pattern: /\.site-footer\s*{[\s\S]*?background:\s*var\(--paper\);[\s\S]*?}/m
  }
];

for (const rule of requiredPaperRules) {
  if (!rule.pattern.test(css)) {
    failures.push(cssPath + ": missing required var(--paper) surface rule for " + rule.name + ".");
  }
}

if (failures.length > 0) {
  console.error("Page surface validation failed:");
  for (const failure of failures) {
    console.error("- " + failure);
  }
  process.exit(1);
}

console.log("Page surface validation passed: page backgrounds stay on var(--paper).");
