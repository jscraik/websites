import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const sourceRoots = ["src/components", "src/layouts", "src/pages", "src/styles"];
const failures = [];
const allowedColorFiles = new Set(["src/styles/brand-tokens.css", "src/styles/brand-tokens.json"]);

const sourceFiles = sourceRoots
  .flatMap((root) => listFiles(path.join(repoRoot, root)))
  .filter((file) => [".astro", ".css"].includes(path.extname(file)));

for (const file of sourceFiles) {
  const relativePath = path.relative(repoRoot, file);
  const source = fs.readFileSync(file, "utf8");
  const blocks = file.endsWith(".astro") ? astroStyleBlocks(source) : [{ source, startIndex: 0 }];
  for (const block of blocks) {
    for (const segment of policySegments(relativePath, block)) validateCssBlock(relativePath, source, segment);
  }
}

if (failures.length > 0) {
  console.error("CSS policy validation failed:");
  for (const failure of failures) console.error("- " + failure);
  process.exit(1);
}

console.log("CSS policy validation passed: " + sourceFiles.length + " source files checked.");

function listFiles(root) {
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) return listFiles(fullPath);
    if (entry.isFile()) return [fullPath];
    return [];
  });
}

function astroStyleBlocks(source) {
  return [...source.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((match) => ({
    source: match[1],
    startIndex: match.index + match[0].indexOf(match[1])
  }));
}

function validateCssBlock(relativePath, fullSource, block) {
  const css = stripComments(block.source);

  for (const match of css.matchAll(/#[0-9a-f]{3,8}\b/gi)) {
    if (!allowedColorFiles.has(relativePath)) fail(relativePath, fullSource, block.startIndex + match.index, "hard-coded color " + match[0] + " is forbidden outside token files.");
  }

  for (const match of css.matchAll(/\bz-index\s*:\s*(\d+)\s*;/gi)) {
    if (!["0", "1", "2", "10"].includes(match[1]) && !/var\(/.test(match[0])) fail(relativePath, fullSource, block.startIndex + match.index, "z-index must use a token or the approved scale: 0, 1, 2, 10.");
  }

  for (const match of css.matchAll(/font-size\s*:\s*(\d+(?:\.\d+)?px)\s*;/gi)) {
    fail(relativePath, fullSource, block.startIndex + match.index, "font-size " + match[1] + " must use the type scale or clamp token.");
  }

  for (const match of css.matchAll(/@media\s*\(\s*min-width\s*:\s*\d+px\s*\)/gi)) {
    fail(relativePath, fullSource, block.startIndex + match.index, "pixel min-width breakpoint is forbidden; use rem breakpoint scale.");
  }

  for (const rule of css.matchAll(/([^{}@][^{}]*)\{/g)) {
    const selector = rule[1].trim();
    if (!selector || selector.startsWith("from") || selector.startsWith("to")) continue;
    const maxSpecificity = selector
      .split(",")
      .map((part) => (part.match(/[#.[:]/g) ?? []).length)
      .reduce((max, current) => Math.max(max, current), 0);
    if (maxSpecificity > 5) fail(relativePath, fullSource, block.startIndex + rule.index, "selector is too specific; keep CSS shallow and scoped.");
  }
}

function policySegments(relativePath, block) {
  if (relativePath === "src/styles/global.css") {
    return sliceFromMarker(block, "/* Jose parity loop phase 25");
  }

  if (relativePath === "src/pages/blog/index.astro") {
    return sliceFromMarker(block, "@media (min-width: 57.5626rem)");
  }

  return [];
}

function sliceFromMarker(block, marker) {
  const markerIndex = block.source.indexOf(marker);
  if (markerIndex === -1) return [];
  return [
    {
      source: block.source.slice(markerIndex),
      startIndex: block.startIndex + markerIndex
    }
  ];
}

function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, "");
}

function fail(relativePath, source, index, message) {
  failures.push(relativePath + ":" + source.slice(0, index).split("\n").length + ": " + message);
}
