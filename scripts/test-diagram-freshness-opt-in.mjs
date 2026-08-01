import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const changedPathsRoot = mkdtempSync(path.join(os.tmpdir(), "portfolio-diagram-gate-"));
const changedPaths = path.join(changedPathsRoot, "paths.txt");

try {
  writeFileSync(changedPaths, "package.json\n");
  const result = spawnSync(
    "bash",
    ["scripts/check-diagram-freshness.sh", "--changed-files", changedPaths],
    { cwd: repoRoot, encoding: "utf8" },
  );

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Diagram freshness check passed/);

  const manifest = JSON.parse(readFileSync(path.join(repoRoot, ".diagram/manifest.json"), "utf8"));
  assert.match(manifest.generatedAt, /^\d{4}-\d{2}-\d{2}T/);
  for (const entry of manifest.diagrams) {
    const content = readFileSync(path.join(repoRoot, entry.outputPath));
    const text = content.toString("utf8");
    const lines = text.split(/\r?\n/).length;
    assert.equal(entry.lines, lines, `${entry.outputPath}: manifest line count`);
    assert.equal(entry.bytes, content.byteLength, `${entry.outputPath}: manifest byte count`);
  }

  console.log("PASS diagram freshness consumes a changed-path list and validates manifest metadata");
} finally {
  rmSync(changedPathsRoot, { recursive: true, force: true });
}
