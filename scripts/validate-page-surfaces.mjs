import { readFileSync } from "node:fs";

const cssPath = process.env.PAGE_SURFACE_CSS_PATH ?? "src/styles/global.css";
const css = readFileSync(cssPath, "utf8");

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
