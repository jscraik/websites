import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const sourceRoots = ["src/components", "src/layouts", "src/pages", "src/styles"];
const failures = [];
const sourceFiles = sourceRoots
  .flatMap((root) => listFiles(path.join(repoRoot, root)))
  .filter((file) => [".astro", ".css"].includes(path.extname(file)));

for (const file of sourceFiles) {
  const relativePath = path.relative(repoRoot, file);
  const source = fs.readFileSync(file, "utf8");

  if (file.endsWith(".astro")) {
    validateAstroSource(relativePath, source);
  }

  validateCssSource(relativePath, source, file.endsWith(".astro"));
}

if (failures.length > 0) {
  console.error("Astro anti-pattern validation failed:");
  for (const failure of failures) {
    console.error("- " + failure);
  }
  process.exit(1);
}

console.log("Astro anti-pattern validation passed: " + sourceFiles.length + " source files checked.");

function listFiles(root) {
  if (!fs.existsSync(root)) return [];
  const entries = fs.readdirSync(root, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) return listFiles(fullPath);
    if (entry.isFile()) return [fullPath];
    return [];
  });
}

function validateAstroSource(relativePath, source) {
  for (const match of source.matchAll(/\sclient:(?:load|idle|visible|media|only)\b/g)) {
    fail(relativePath, source, match.index, "client:* hydration directives are forbidden in static Astro surfaces; split true browser interactivity into a deliberately reviewed component before adding hydration.");
  }

  for (const match of source.matchAll(/<style\b[^>]*\bis:global\b[^>]*>/g)) {
    fail(relativePath, source, match.index, "component-level is:global styles are forbidden; put tokens, resets, base typography, and site-wide utilities in shared CSS.");
  }

  for (const match of source.matchAll(/\son[a-z]+\s*=/gi)) {
    fail(relativePath, source, match.index, "inline event handlers are forbidden; use native links/buttons or an intentionally hydrated component.");
  }

  for (const match of source.matchAll(/<(div|span)\b[^>]*\brole=["']button["'][^>]*>/gi)) {
    fail(relativePath, source, match.index, "fake buttons are forbidden; use <button type=\"button\"> for actions.");
  }

  for (const match of source.matchAll(/<(div|span)\b[^>]*\brole=["']link["'][^>]*>/gi)) {
    fail(relativePath, source, match.index, "fake links are forbidden; use <a href=\"...\"> for navigation.");
  }

  for (const match of source.matchAll(/<(div|span)\b[^>]*\bclass=["'][^"']*\b(?:button|btn)\b[^"']*["'][^>]*>/gi)) {
    fail(relativePath, source, match.index, "button-styled div/span found; use <a> for navigation or <button> for actions.");
  }

  for (const match of source.matchAll(/<img\b(?![^>]*\balt=)[^>]*>/gi)) {
    fail(relativePath, source, match.index, "images must have intentional alt text; decorative images use alt=\"\" and aria-hidden=\"true\".");
  }

  for (const match of source.matchAll(/<img\b[^>]*\balt=["'](?:image|photo|picture|graphic|icon)["'][^>]*>/gi)) {
    fail(relativePath, source, match.index, "generic image alt text is forbidden; describe the image or mark it decorative with alt=\"\".");
  }

  validateHeadingOrder(relativePath, source);
}

function validateCssSource(relativePath, source, isAstroFile) {
  const cssBlocks = isAstroFile ? astroStyleBlocks(source) : [{ source, startIndex: 0 }];

  for (const block of cssBlocks) {
    for (const match of block.source.matchAll(/transition\s*:\s*all\b/gi)) {
      fail(relativePath, source, block.startIndex + match.index, "transition: all is forbidden; transition only the properties that should animate.");
    }

    for (const match of block.source.matchAll(/!important\b/g)) {
      fail(relativePath, source, block.startIndex + match.index, "!important is forbidden; fix the cascade or use a more explicit scoped selector.");
    }

    for (const match of block.source.matchAll(/overflow-x\s*:\s*hidden\b/gi)) {
      fail(relativePath, source, block.startIndex + match.index, "overflow-x: hidden is forbidden; fix the overflowing element instead of masking layout bugs.");
    }

    for (const match of block.source.matchAll(/@media\s*\(\s*min-width\s*:\s*\d+px\s*\)/gi)) {
      fail(relativePath, source, block.startIndex + match.index, "pixel min-width breakpoints are forbidden; use the repo breakpoint scale in rem.");
    }
  }
}

function astroStyleBlocks(source) {
  return [...source.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((match) => ({
    source: match[1],
    startIndex: match.index + match[0].indexOf(match[1])
  }));
}

function validateHeadingOrder(relativePath, source) {
  const headings = [...source.matchAll(/<h([1-6])\b/gi)].map((match) => ({
    level: Number(match[1]),
    index: match.index
  }));

  let previous = null;
  for (const heading of headings) {
    if (previous !== null && heading.level > previous + 1) {
      fail(
        relativePath,
        source,
        heading.index,
        "heading hierarchy jumps from h" + previous + " to h" + heading.level + "; use CSS for visual size and headings for document outline."
      );
    }
    previous = heading.level;
  }
}

function fail(relativePath, source, index, message) {
  failures.push(relativePath + ":" + lineForIndex(source, index) + ": " + message);
}

function lineForIndex(source, index = 0) {
  return source.slice(0, index).split("\n").length;
}
