import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, symlink } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const parent = await mkdtemp(path.join(os.tmpdir(), "fieldcraft-blind-build-"));
const output = path.join(parent, "export");
try {
  const exporterSource = await readFile("scripts/prepare-fieldcraft-blind-build.mjs", "utf8");
  assert.match(exporterSource, /mkdtemp\(path\.join\(canonicalParent/);
  assert.match(exporterSource, /path\.join\(canonicalStaging, source\)/);
  assert.match(exporterSource, /await rename\(canonicalStaging, output\)/);
  assert.doesNotMatch(exporterSource, /path\.join\(output, source\)/);
  const result = spawnSync(process.execPath, ["scripts/prepare-fieldcraft-blind-build.mjs", output], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  const manifest = JSON.parse(await readFile(path.join(output, "blind-build-manifest.json"), "utf8"));
  assert.deepEqual(manifest.workspace, [
    ".npmrc",
    "AGENTS.md",
    "CODESTYLE.md",
    "WORKFLOW.md",
    "astro.config.mjs",
    "package.json",
    "package-lock.json",
    "public",
    "src",
  ]);
  const exportedPackage = JSON.parse(await readFile(path.join(output, "package.json"), "utf8"));
  assert.equal(exportedPackage.scripts.build, "astro build");
  assert.deepEqual(exportedPackage.scripts, {
    dev: "astro dev",
    check: "astro check",
    build: "astro build",
    preview: "astro preview",
    "validate:fast": "npm run check && npm run build",
  });
  const exportedWorkflow = await readFile(path.join(output, "WORKFLOW.md"), "utf8");
  assert.match(exportedWorkflow, /npm run validate:fast/);
  assert.doesNotMatch(exportedWorkflow, /scripts\//);
  assert.match(await readFile(path.join(output, "src/pages/index.astro"), "utf8"), /<BaseLayout/);
  assert.match(await readFile(path.join(output, "public/favicon.svg"), "utf8"), /<svg/);
  await assert.rejects(() => readFile(path.join(output, "docs/reference/fieldcraft-fde/v3/manifest.json"), "utf8"), /ENOENT/);
  await assert.rejects(() => readFile(path.join(output, "scripts/evaluate-fieldcraft-scenes.mjs"), "utf8"), /ENOENT/);
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

  const missingParentOutput = path.join(parent, "missing", "export");
  const missingParent = spawnSync(
    process.execPath,
    ["scripts/prepare-fieldcraft-blind-build.mjs", missingParentOutput],
    { encoding: "utf8" },
  );
  assert.notEqual(missingParent.status, 0, "an output with a missing direct parent must be rejected");
  assert.match(missingParent.stderr, /direct parent must already exist/);

  const link = path.join(parent, "repo-link");
  await symlink(process.cwd(), link);
  const symlinked = spawnSync(process.execPath, ["scripts/prepare-fieldcraft-blind-build.mjs", path.join(link, "export")], { encoding: "utf8" });
  assert.notEqual(symlinked.status, 0, "symlinked output parent must be rejected");
} finally {
  await rm(parent, { recursive: true, force: true });
}
console.log("PASS Fieldcraft blind-build export enforces a new external directory and excludes evaluator-only inputs");
