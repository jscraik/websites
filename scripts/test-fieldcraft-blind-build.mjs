import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, symlink } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const parent = await mkdtemp(path.join(os.tmpdir(), "fieldcraft-blind-build-"));
const output = path.join(parent, "export");
try {
  const result = spawnSync(process.execPath, ["scripts/prepare-fieldcraft-blind-build.mjs", output], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  const manifest = JSON.parse(await readFile(path.join(output, "blind-build-manifest.json"), "utf8"));
  assert.deepEqual(manifest.exclusions, [
    "docs/reference/fieldcraft-fde/**",
    "artifacts/**",
    "scripts/**/*fieldcraft*",
  ]);
  assert.equal(manifest.inputs.some((entry) => entry.startsWith("docs/reference/")), false);
  assert.equal(manifest.inputs.some((entry) => entry.startsWith("artifacts/")), false);
  assert.equal(manifest.inputs.some((entry) => entry.startsWith("scripts/")), false);

  const existing = spawnSync(process.execPath, ["scripts/prepare-fieldcraft-blind-build.mjs", output], { encoding: "utf8" });
  assert.notEqual(existing.status, 0, "existing output directory must be rejected");

  const repositoryChild = spawnSync(process.execPath, ["scripts/prepare-fieldcraft-blind-build.mjs", ".fieldcraft-builder-output"], { encoding: "utf8" });
  assert.notEqual(repositoryChild.status, 0, "repository-child output must be rejected");

  const link = path.join(parent, "repo-link");
  await symlink(process.cwd(), link);
  const symlinked = spawnSync(process.execPath, ["scripts/prepare-fieldcraft-blind-build.mjs", path.join(link, "export")], { encoding: "utf8" });
  assert.notEqual(symlinked.status, 0, "symlinked output parent must be rejected");
} finally {
  await rm(parent, { recursive: true, force: true });
}
console.log("PASS Fieldcraft blind-build export enforces a new external directory and excludes evaluator-only inputs");
