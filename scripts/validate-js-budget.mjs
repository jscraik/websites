import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const repoRoot = process.cwd();
const distRoot = path.join(repoRoot, "dist");
const sourceRoots = ["src/components", "src/layouts", "src/pages"];
const maxGzipBytes = Number(process.env.JS_BUDGET_GZIP_BYTES ?? 30_000);
const failures = [];

if (!fs.existsSync(distRoot)) {
  console.error("JavaScript budget validation failed: dist/ is missing. Run ASTRO_TELEMETRY_DISABLED=1 npm run build first.");
  process.exit(1);
}

for (const file of sourceRoots.flatMap((root) => listFiles(path.join(repoRoot, root))).filter((file) => file.endsWith(".astro"))) {
  const relativePath = path.relative(repoRoot, file);
  const source = fs.readFileSync(file, "utf8");
  for (const match of source.matchAll(/\sclient:(?:load|idle|visible|media|only)\b/g)) {
    failures.push(relativePath + ":" + lineForIndex(source, match.index) + ": client hydration requires deliberate review and a JavaScript budget update.");
  }
}

const jsFiles = listFiles(distRoot).filter((file) => file.endsWith(".js"));
const totalGzipBytes = jsFiles.reduce((total, file) => total + zlib.gzipSync(fs.readFileSync(file)).byteLength, 0);

if (totalGzipBytes > maxGzipBytes) {
  failures.push("dist/: JavaScript gzip budget exceeded: " + totalGzipBytes + " bytes > " + maxGzipBytes + " bytes.");
}

if (failures.length > 0) {
  console.error("JavaScript budget validation failed:");
  for (const failure of failures) console.error("- " + failure);
  process.exit(1);
}

console.log("JavaScript budget validation passed: " + jsFiles.length + " JS files, " + totalGzipBytes + " gzip bytes.");

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
