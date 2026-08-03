import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function requireMatch(value, pattern, message) {
  if (!pattern.test(value)) errors.push(message);
}

function rejectMatch(value, pattern, message) {
  if (pattern.test(value)) errors.push(message);
}

const packageJson = JSON.parse(read("package.json"));
const agents = read("AGENTS.md");
const workflow = read("WORKFLOW.md");
const pullRequestTemplate = read(".github/PULL_REQUEST_TEMPLATE.md");
const contributing = read("CONTRIBUTING.md");
const newTask = read("scripts/new-task.sh");
const gitignore = read(".gitignore");
const prePushHook = read("scripts/hook-pre-push.sh");
const contract = JSON.parse(read("harness.contract.json"));
const standaloneRemediationPolicy = /standalone review-remediation PRs may use\s+`jscraik\/<short-description>`\s+when the body records a concrete Linear `n\/a`\s+reason/i;

if (packageJson.name !== "brainwav-io") errors.push("package.json must identify the brainwav-io site package");
if (!existsSync(path.join(repoRoot, "package-lock.json"))) errors.push("package-lock.json must exist for this npm repository");
requireMatch(agents, /package\.json is the source of truth/i, "AGENTS.md must identify package.json as the portfolio command authority");
rejectMatch(agents, /There was no repo-local AGENTS\.md or CODESTYLE\.md/i, "AGENTS.md must describe the current root instruction surfaces");
requireMatch(newTask, /--prepare/, "new-task must support the documented --prepare alias");
requireMatch(newTask, /--bootstrap\|--prepare\)|--prepare\|--bootstrap\)/, "new-task parser must bind --prepare to bootstrap behavior");
requireMatch(newTask, /--standalone/, "new-task must support explicit standalone remediation branches");
if (contract.issueTrackingPolicy?.provider !== "linear") errors.push("harness contract must retain Linear as the issue authority");
if (contract.issueTrackingPolicy?.branchPrefix !== "jscraik") errors.push("Linear branch prefix must use the supported jscraik segment");
requireMatch(workflow, /# Portfolio workflow/i, "WORKFLOW.md must identify the portfolio workflow");
requireMatch(workflow, /npm run validate:fast/, "WORKFLOW.md must name the repository validation entrypoint");
requireMatch(workflow, standaloneRemediationPolicy, "WORKFLOW.md must document the standalone remediation branch exception");
requireMatch(contributing, standaloneRemediationPolicy, "CONTRIBUTING.md must document the standalone remediation branch exception");
requireMatch(pullRequestTemplate, /jscraik\/<linear-key>-<short-description>/, "PR template must use the Linear-linked branch policy");
requireMatch(pullRequestTemplate, /standalone review-remediation PRs may use `jscraik\/<short-description>`/, "PR template must document the standalone remediation branch exception");
rejectMatch(pullRequestTemplate, /jscraik\/feature\/\*/, "PR template must not retain the retired agent branch prefix");
rejectMatch(workflow, /Symphony Workflow Configuration/i, "WORKFLOW.md must not carry an unconfigured Symphony template");
rejectMatch(workflow, /\$LINEAR_API_KEY|\$SYMPHONY_WORKSPACE_ROOT|<your-project-slug>|<owner>|<escalation-path>/, "WORKFLOW.md must not contain unresolved operational placeholders");
rejectMatch(workflow, /rm -rf node_modules/, "WORKFLOW.md must not declare destructive runtime cleanup hooks");
requireMatch(gitignore, /^\.harness\/runtime\/$/m, ".harness/runtime/ must be ignored as generated state");
requireMatch(gitignore, /^\.cache\/prek\/$/m, ".cache/prek/ must be ignored as worktree bootstrap state");
requireMatch(prePushHook, /node \.\/scripts\/validate-operator-contract\.mjs/, "pre-push must validate the portfolio operator contract");
requireMatch(prePushHook, /npm run check:git-worktree-authority/, "pre-push must verify worktree Git authority");
requireMatch(prePushHook, /npm run validate:fast/, "pre-push must run the portfolio fast validation surface");
requireMatch(prePushHook, /npm run check/, "pre-push must run Astro type checking");
requireMatch(prePushHook, /npm run build/, "pre-push must build the portfolio");
rejectMatch(prePushHook, /tooling-audit|check-environment\.sh|semgrep-changed/, "pre-push must not require inherited full-Harness tooling gates");

const trackedReceipt = execFileSync("git", ["ls-files", ".harness/runtime/codex-preflight-status.json"], { cwd: repoRoot, encoding: "utf8" }).trim();
if (trackedReceipt) errors.push("generated codex preflight receipt must not be tracked");

try {
  execFileSync("make", ["-n", "worktree-ready"], { cwd: repoRoot, stdio: "pipe" });
} catch {
  errors.push("Makefile must parse before new-task selects make worktree-ready");
}

if (errors.length > 0) {
  for (const error of errors) console.error(`operator-contract: ${error}`);
  process.exit(1);
}

console.log("operator-contract: pass");
