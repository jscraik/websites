import { readFile } from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const DEFAULT_RECEIPT_PATH = path.join(ROOT, "docs/implementation-notes/pu-000-release-source-boundary.json");
const inputIndex = process.argv.indexOf("--file");
const RECEIPT_PATH = inputIndex >= 0 && process.argv[inputIndex + 1]
  ? path.resolve(ROOT, process.argv[inputIndex + 1])
  : DEFAULT_RECEIPT_PATH;

function fail(message) {
  console.error(`Release source-boundary validation failed: ${message}`);
  process.exitCode = 1;
}

function git(...args) {
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim();
}

function dirtyPaths() {
  const output = execFileSync("git", ["status", "--porcelain=v1", "--untracked-files=all", "--ignored=matching", "-z"], {
    cwd: ROOT,
    encoding: "utf8",
  });
  return output
    .split("\0")
    .filter(Boolean)
    .map((entry) => entry.slice(3))
    .filter((entry) => entry.length > 0);
}

function assert(condition, message) {
  if (!condition) {
    fail(message);
  }
}

let receipt;
try {
  receipt = JSON.parse(await readFile(RECEIPT_PATH, "utf8"));
} catch (error) {
  fail(`unable to read ${path.relative(ROOT, RECEIPT_PATH)}: ${error.message}`);
  process.exit(1);
}

assert(receipt.schemaVersion === "portfolio-release-source-boundary/v1", "unexpected receipt schema version");
assert(receipt.slice === "PU-000", "receipt must belong to PU-000");
assert(receipt.status === "accepted-local-baseline", "receipt must record an accepted local baseline");

const baselineSha = receipt.baseline?.sha;
const baselineTreeSha = receipt.baseline?.treeSha;
assert(/^[0-9a-f]{40}$/.test(baselineSha ?? ""), "baseline.sha must be a full Git SHA");
assert(/^[0-9a-f]{40}$/.test(baselineTreeSha ?? ""), "baseline.treeSha must be a full Git tree SHA");
assert(receipt.baseline?.worktree?.cleanBeforeEdit === true, "clean worktree evidence is missing");
assert(receipt.baseline?.worktree?.exactPathRecordedInLocalReceipt === true, "local worktree path evidence is missing");
assert(receipt.baseline?.reviewStatus === "local-plan-review-accepted-hosted-review-pending", "baseline review boundary is not explicit");

let baselineTree;
let currentSha;
try {
  baselineTree = git("rev-parse", `${baselineSha}^{tree}`);
  currentSha = git("rev-parse", "HEAD");
  execFileSync("git", ["merge-base", "--is-ancestor", baselineSha, "HEAD"], { cwd: ROOT, stdio: "ignore" });
} catch (error) {
  fail(`baseline SHA is not an ancestor of the current release branch: ${error.message}`);
}

assert(baselineTree === baselineTreeSha, `baseline tree mismatch: recorded ${baselineTreeSha}, actual ${baselineTree}`);
assert(currentSha !== baselineSha, "release branch must contain a post-baseline change");
const dirty = dirtyPaths();
assert(dirty.length === 0, `release worktree must be clean before boundary approval: ${dirty.join(", ")}`);

const acceptedPaths = receipt.acceptedPaths;
const excludedPaths = receipt.excludedPaths;
assert(Array.isArray(acceptedPaths) && acceptedPaths.length > 0, "acceptedPaths must be a non-empty array");
assert(Array.isArray(excludedPaths) && excludedPaths.length > 0, "excludedPaths must be a non-empty array");
assert(excludedPaths.includes(".harness/runtime/**"), "runtime receipts must be excluded");
assert(excludedPaths.includes("artifacts/**"), "generated artifacts must be excluded");
assert(excludedPaths.includes("<external-private-sources>"), "external private sources must be excluded");
assert(acceptedPaths.every((entry) => typeof entry === "string" && !path.isAbsolute(entry)), "accepted paths must be repository-relative patterns");
assert(excludedPaths.every((entry) => typeof entry === "string" && (entry.startsWith("<") || !path.isAbsolute(entry))), "excluded paths must be repository-relative patterns or explicit tokens");

const repositoryPatterns = (patterns) => patterns.filter((pattern) => !pattern.startsWith("<"));
const matchesAny = (file, patterns) => repositoryPatterns(patterns).some((pattern) => path.matchesGlob(file, pattern));
const changedPaths = git("diff", "--name-only", `${baselineSha}..HEAD`).split("\n").filter(Boolean);
const excludedChanges = changedPaths.filter((file) => matchesAny(file, excludedPaths));
const unacceptedChanges = changedPaths.filter((file) => !matchesAny(file, acceptedPaths));
assert(excludedChanges.length === 0, `post-baseline diff changes excluded paths: ${excludedChanges.join(", ")}`);
assert(unacceptedChanges.length === 0, `post-baseline diff changes paths outside the accepted boundary: ${unacceptedChanges.join(", ")}`);

const validation = receipt.baselineValidation;
const requiredValidationGates = new Set(["source-state", "fast-validation", "type-check", "build", "smoke"]);
assert(Array.isArray(validation), "baselineValidation must be an array");
assert(validation.length === requiredValidationGates.size, "baselineValidation must contain exactly the required gates");
assert(new Set(validation.map((entry) => entry.gate)).size === validation.length, "baselineValidation gate identities must be unique");
assert(validation.every((entry) => requiredValidationGates.has(entry.gate)), "baselineValidation contains an unknown gate identity");
assert([...requiredValidationGates].every((gate) => validation.some((entry) => entry.gate === gate)), "baselineValidation is missing a required gate identity");
assert(validation.every((entry) => entry && typeof entry.command === "string" && entry.command.length > 0 && entry.outcome === "pass"), "every baseline validation outcome must be pass with an exact command");
assert(receipt.invariants?.reviewedBaselineShaRecorded === true, "reviewed baseline SHA invariant is not recorded");
assert(receipt.invariants?.cleanWorktreeBeforeEditRecorded === true, "clean worktree invariant is not recorded");
assert(receipt.invariants?.acceptedAndExcludedPathsDeclared === true, "port/exclusion invariant is not recorded");
assert(receipt.invariants?.unchangedBaselineValidated === true, "unchanged-baseline invariant is not recorded");
assert(receipt.invariants?.privateMaterialExcluded === true, "private-material invariant is not recorded");

if (process.exitCode === 1) {
  process.exit(1);
}

console.log(`Release source-boundary validation passed: ${path.relative(ROOT, RECEIPT_PATH)} records baseline ${baselineSha.slice(0, 12)} and ${acceptedPaths.length} accepted path patterns.`);
