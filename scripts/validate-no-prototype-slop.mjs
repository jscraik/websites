import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const roots = ["src", "public"];
const failures = [];
const textExtensions = new Set([".astro", ".css", ".js", ".mjs", ".ts", ".json", ".md", ".html"]);
const forbiddenPatterns = [
  { pattern: /\blorem ipsum\b/gi, message: "placeholder lorem ipsum text is forbidden." },
  { pattern: /href=["']#["']/gi, message: "empty hash links are forbidden." },
  { pattern: /javascript:void\(0\)/gi, message: "javascript:void(0) links are forbidden." },
  { pattern: /console\.log\(/g, message: "console.log must not ship in site source." },
  { pattern: /click here/gi, message: "generic link text is forbidden; use destination-specific text." },
  { pattern: /read more/gi, message: "generic read-more text needs accessible destination context." },
  { pattern: /\/Users\/|\/private\/tmp\/|file:\/\//g, message: "local machine paths must not appear in source or public assets." },
  { pattern: /quick\s+(fix|patch)|temporary\s+(fix|patch|hack)|final\s+fix/gi, message: "implementation comments must describe durable intent, not patch status." }
];

for (const file of roots.flatMap((root) => listFiles(path.join(repoRoot, root)))) {
  if (!textExtensions.has(path.extname(file))) continue;
  const relativePath = path.relative(repoRoot, file);
  const source = fs.readFileSync(file, "utf8");
  for (const rule of forbiddenPatterns) {
    for (const match of source.matchAll(rule.pattern)) {
      failures.push(relativePath + ":" + lineForIndex(source, match.index) + ": " + rule.message);
    }
  }
}

if (failures.length > 0) {
  console.error("Prototype polish validation failed:");
  for (const failure of failures) console.error("- " + failure);
  process.exit(1);
}

console.log("Prototype polish validation passed.");

function listFiles(root) {
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) return listFiles(fullPath);
    if (entry.isFile()) return [fullPath];
    return [];
  });
}

function lineForIndex(source, index) {
  return source.slice(0, index).split("\n").length;
}
