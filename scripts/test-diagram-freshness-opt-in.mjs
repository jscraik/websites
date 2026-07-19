import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
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
  assert.match(result.stdout, /no tracked diagram manifest baseline/);
  console.log("PASS diagram freshness requires a tracked manifest baseline before generating outputs");
} finally {
  rmSync(changedPathsRoot, { recursive: true, force: true });
}
