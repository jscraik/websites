import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const output = await mkdtemp(path.join(os.tmpdir(), "fieldcraft-blind-build-"));
try {
  const result = spawnSync(process.execPath, ["scripts/prepare-fieldcraft-blind-build.mjs", output], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  const manifest = JSON.parse(await readFile(path.join(output, "blind-build-manifest.json"), "utf8"));
  assert.deepEqual(manifest.exclusions, [
    "docs/reference/fieldcraft-fde/**",
    "artifacts/**",
    "scripts/evaluate-fieldcraft-scenes.mjs",
  ]);
  assert.equal(manifest.inputs.some((entry) => entry.startsWith("docs/reference/")), false);
  assert.equal(manifest.inputs.some((entry) => entry.startsWith("artifacts/")), false);
} finally {
  await rm(output, { recursive: true, force: true });
}
console.log("PASS Fieldcraft blind-build export excludes evaluator-only references");
