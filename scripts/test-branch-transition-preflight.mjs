import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const preflight = path.join(repoRoot, "scripts/preflight-branch-transition.sh");
const fixtureRoot = mkdtempSync(path.join(os.tmpdir(), "portfolio-branch-transition-"));

function git(args) {
  return execFileSync("git", args, { cwd: fixtureRoot, encoding: "utf8" });
}

function write(relativePath, content) {
  const target = path.join(fixtureRoot, relativePath);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, content);
}

function run(target) {
  return spawnSync("bash", [preflight, "--target", target, "--format", "json"], {
    cwd: fixtureRoot,
    encoding: "utf8",
  });
}

try {
  git(["init", "--initial-branch", "main", "--quiet"]);
  git(["config", "user.email", "tests@example.test"]);
  git(["config", "user.name", "Portfolio tests"]);
  write("README.md", "base\n");
  git(["add", "README.md"]);
  git(["commit", "--quiet", "-m", "chore: base fixture"]);

  git(["checkout", "--quiet", "-b", "incoming"]);
  write("incoming-only.txt", "incoming\n");
  git(["add", "incoming-only.txt"]);
  git(["commit", "--quiet", "-m", "feat: add incoming file"]);
  git(["checkout", "--quiet", "main"]);

  const cleanBefore = git(["status", "--porcelain=v1"]);
  const pass = run("incoming");
  assert.equal(pass.status, 0, pass.stderr);
  const passReceipt = JSON.parse(pass.stdout);
  assert.equal(passReceipt.schemaVersion, "branch-transition-preflight/v1");
  assert.equal(passReceipt.status, "pass");
  assert.deepEqual(passReceipt.collisions, []);
  assert.equal(git(["status", "--porcelain=v1"]), cleanBefore);

  write("incoming-only.txt", "preserve me\n");
  const blockedBefore = git(["status", "--porcelain=v1"]);
  const blocked = run("incoming");
  assert.equal(blocked.status, 1, blocked.stderr);
  const blockedReceipt = JSON.parse(blocked.stdout);
  assert.equal(blockedReceipt.status, "blocked");
  assert.deepEqual(blockedReceipt.collisions, [{ path: "incoming-only.txt", kind: "untracked_overwrite" }]);
  assert.equal(commandText("cat", ["incoming-only.txt"]), "preserve me\n");
  assert.equal(git(["status", "--porcelain=v1"]), blockedBefore);

  const invalid = run("does-not-exist");
  assert.equal(invalid.status, 2);
  assert.match(invalid.stderr, /target is not a commit/);
  assert.equal(git(["status", "--porcelain=v1"]), blockedBefore);

  console.log("PASS branch transition preflight accepts clean transitions and blocks untracked overwrite collisions");
} finally {
  rmSync(fixtureRoot, { recursive: true, force: true });
}

function commandText(command, args) {
  return execFileSync(command, args, { cwd: fixtureRoot, encoding: "utf8" });
}
