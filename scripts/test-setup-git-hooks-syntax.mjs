import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const result = spawnSync("node", ["--check", "scripts/setup-git-hooks.js"], {
  cwd: repoRoot,
  encoding: "utf8",
});

assert.equal(result.status, 0, result.stderr);
console.log("PASS setup-git-hooks is executable JavaScript");
