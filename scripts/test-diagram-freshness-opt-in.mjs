import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const changedPathsRoot = mkdtempSync(path.join(os.tmpdir(), "portfolio-diagram-gate-"));
const changedPaths = path.join(changedPathsRoot, "paths.txt");
const refreshTimeoutSeconds = Number.parseInt(process.env.DIAGRAM_REFRESH_TIMEOUT_SECONDS ?? "90", 10);
assert.ok(Number.isSafeInteger(refreshTimeoutSeconds) && refreshTimeoutSeconds > 0, "DIAGRAM_REFRESH_TIMEOUT_SECONDS must be a positive integer");
const refreshOptions = {
  cwd: repoRoot,
  encoding: "utf8",
  timeout: refreshTimeoutSeconds * 1000,
  killSignal: "SIGTERM",
};

const generatedArtifactSnapshots = new Map();
const snapshotGeneratedArtifact = (relativePath) => {
  const artifactPath = path.join(repoRoot, relativePath);
  generatedArtifactSnapshots.set(
    relativePath,
    existsSync(artifactPath) ? readFileSync(artifactPath) : null,
  );
};
const restoreGeneratedArtifacts = () => {
  for (const [relativePath, content] of generatedArtifactSnapshots) {
    const artifactPath = path.join(repoRoot, relativePath);
    if (content === null) {
      rmSync(artifactPath, { force: true });
    } else {
      writeFileSync(artifactPath, content);
    }
  }
};

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
  const requiredUserEdge =
    "test_design_system_contract_2b5439cd --> design_system_contract_744a00f2";
  assert.match(
    readFileSync(path.join(repoRoot, ".diagram/user.mmd"), "utf8"),
    new RegExp(requiredUserEdge),
  );
  assert.match(readFileSync(path.join(repoRoot, "AI/context/diagram-context.md"), "utf8"), new RegExp(requiredUserEdge));

  for (const artifactPath of [
    ".diagram/manifest.json",
    ...manifest.diagrams.map((entry) => entry.outputPath),
    "AI/context/diagram-context.md",
    ".diagram/context/diagram-context.meta.json",
    ".diagram/context/refresh.log",
  ]) {
    snapshotGeneratedArtifact(artifactPath);
  }

  const firstSecurityRefresh = spawnSync("bash", ["scripts/refresh-diagram-context.sh", "--force"], refreshOptions);
  assert.notEqual(firstSecurityRefresh.error?.code, "ETIMEDOUT", firstSecurityRefresh.error?.message);
  assert.equal(firstSecurityRefresh.status, 0, firstSecurityRefresh.error?.message ?? firstSecurityRefresh.stderr);
  const securityAfterFirstRefresh = readFileSync(path.join(repoRoot, ".diagram/security.mmd"), "utf8");
  const secondSecurityRefresh = spawnSync("bash", ["scripts/refresh-diagram-context.sh", "--force"], refreshOptions);
  assert.notEqual(secondSecurityRefresh.error?.code, "ETIMEDOUT", secondSecurityRefresh.error?.message);
  assert.equal(secondSecurityRefresh.status, 0, secondSecurityRefresh.error?.message ?? secondSecurityRefresh.stderr);
  assert.equal(readFileSync(path.join(repoRoot, ".diagram/security.mmd"), "utf8"), securityAfterFirstRefresh);

  console.log("PASS diagram freshness consumes a changed-path list and validates manifest metadata");
} finally {
  restoreGeneratedArtifacts();
  rmSync(changedPathsRoot, { recursive: true, force: true });
}
