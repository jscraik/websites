import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function check(name, assertion) {
  try {
    assertion();
    console.log(`PASS ${name}`);
  } catch (error) {
    failures.push(`${name}: ${error.message}`);
    console.error(`FAIL ${name}: ${error.message}`);
  }
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function command(command, args) {
  return execFileSync(command, args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

const packageJson = JSON.parse(read("package.json"));
const agents = read("AGENTS.md");
const workflow = read("WORKFLOW.md");
const pullRequestTemplate = read(".github/PULL_REQUEST_TEMPLATE.md");
const newTask = read("scripts/new-task.sh");
const gitignore = read(".gitignore");
const codestyleValidator = read("scripts/validate-codestyle.sh");
const preCommitHook = read("scripts/hook-pre-commit.sh");
const prePushHook = read("scripts/hook-pre-push.sh");
const contract = JSON.parse(read("harness.contract.json"));
const contributing = read("CONTRIBUTING.md");
const codexEnforced = read("scripts/codex-enforced");

check("portfolio instructions identify the npm package authority", () => {
  assert.equal(packageJson.name, "brainwav-io");
  assert.ok(existsSync(path.join(repoRoot, "package-lock.json")));
  assert.match(agents, /package\.json is the source of truth/i);
  assert.doesNotMatch(agents, /There was no repo-local AGENTS\.md or CODESTYLE\.md/i);
});

check("worktree instructions and parser support --prepare", () => {
  assert.match(newTask, /--prepare/);
  assert.match(newTask, /--bootstrap\|--prepare\)|--prepare\|--bootstrap\)/);
  const help = command("bash", ["scripts/new-task.sh", "--prepare", "--help"]);
  assert.match(help, /--prepare/);
});

check("the Makefile parses before bootstrap selection", () => {
  const output = command("make", ["-n", "worktree-ready"]);
  assert.match(output, /scripts\/prepare-worktree\.sh/);
  const help = command("make", ["help"]);
  assert.match(help, /worktree-ready/);
});

check("workflow documentation is portfolio-owned and non-destructive", () => {
  assert.match(workflow, /# Portfolio workflow/i);
  assert.match(workflow, /npm run validate:fast/);
  assert.doesNotMatch(workflow, /Symphony Workflow Configuration/i);
  assert.doesNotMatch(workflow, /\$LINEAR_API_KEY|\$SYMPHONY_WORKSPACE_ROOT|<your-project-slug>|<owner>|<escalation-path>/);
  assert.doesNotMatch(workflow, /rm -rf node_modules/);
});

check("preflight receipt is generated runtime state, not tracked source", () => {
  assert.match(gitignore, /^\.harness\/runtime\/$/m);
  assert.match(gitignore, /^\.cache\/prek\/$/m);
  const tracked = command("git", ["ls-files", ".harness/runtime/codex-preflight-status.json"]);
  assert.equal(tracked.trim(), "");
  assert.match(read("scripts/codex-preflight.sh"), /\.harness\/runtime\/codex-preflight-status\.json/);
});

check("operator contract validator accepts the repository", () => {
  command("node", ["scripts/validate-operator-contract.mjs"]);
});

check("pre-commit validation uses portfolio package contracts", () => {
  assert.match(codestyleValidator, /run_required_script "validate:fast"/);
  assert.doesNotMatch(preCommitHook, /npm run lint/);
  assert.doesNotMatch(preCommitHook, /npm run quality:debt/);
  assert.match(preCommitHook, /make related-tests-staged/);
});

check("pre-push validation uses the npm and Astro contract", () => {
  assert.match(prePushHook, /node \.\/scripts\/validate-operator-contract\.mjs/);
  assert.match(prePushHook, /npm run check:git-worktree-authority/);
  assert.match(prePushHook, /npm run validate:fast/);
  assert.match(prePushHook, /npm run check/);
  assert.match(prePushHook, /npm run build/);
  assert.doesNotMatch(prePushHook, /tooling-audit|check-environment\.sh|semgrep-changed/);
});

check("Linear branch policy uses the supported single-segment prefix", () => {
  assert.equal(contract.issueTrackingPolicy?.provider, "linear");
  assert.equal(contract.issueTrackingPolicy?.branchPrefix, "jscraik");
  assert.doesNotMatch(contract.issueTrackingPolicy?.branchPrefix ?? "", /\//);
  assert.match(workflow, /Linear issue/i);
  assert.match(contributing, /jscraik\/<linear-key>-<short-description>/);
  assert.match(codexEnforced, /WORKTREE_BRANCH_PREFIX="\$\{WORKTREE_BRANCH_PREFIX:-jscraik\}"/);
  assert.match(pullRequestTemplate, /jscraik\/<linear-key>-<short-description>/);
  assert.doesNotMatch(pullRequestTemplate, /jscraik\/feature\/\*/);
});

check("required agent governance surfaces describe portfolio operations", () => {
  const requiredDocs = [
    "docs/agents/02-tooling-policy.md",
    "docs/agents/06-security-and-governance.md",
    "docs/agents/07b-agent-governance.md",
  ];
  for (const relativePath of requiredDocs) {
    assert.ok(existsSync(path.join(repoRoot, relativePath)), `${relativePath} must exist`);
  }
  assert.match(read(requiredDocs[0]), /@brainwav\/coding-harness/);
  assert.match(read(requiredDocs[1]), /Linear/);
  assert.match(read(requiredDocs[2]), /PR readiness/i);
});

if (failures.length > 0) {
  console.error(`\n${failures.length} operator-contract test(s) failed.`);
  process.exitCode = 1;
}
