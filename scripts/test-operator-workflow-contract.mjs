import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { collectPrTemplateContractErrors } from "./lib/pr-template-contract.mjs";

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
const circleciConfig = read(".circleci/config.yml");
const renderFlow = read("scripts/validate-render-flow.mjs");
const contract = JSON.parse(read("harness.contract.json"));
const contributing = read("CONTRIBUTING.md");
const codexEnforced = read("scripts/codex-enforced");
const standaloneRemediationPolicy = /standalone review-remediation PRs may use\s+`jscraik\/<short-description>`\s+when the body records a concrete Linear `n\/a`\s+reason/i;

check("portfolio instructions identify the npm package authority", () => {
  assert.equal(packageJson.name, "brainwav-io");
  assert.ok(existsSync(path.join(repoRoot, "package-lock.json")));
  assert.match(agents, /package\.json is the source of truth/i);
  assert.doesNotMatch(agents, /There was no repo-local AGENTS\.md or CODESTYLE\.md/i);
});

check("worktree instructions and parser support --prepare", () => {
  assert.match(newTask, /--prepare/);
  assert.match(newTask, /--bootstrap\|--prepare\)|--prepare\|--bootstrap\)/);
  assert.match(newTask, /--standalone/);
  const help = command("bash", ["scripts/new-task.sh", "--prepare", "--help"]);
  assert.match(help, /--prepare/);
  assert.match(help, /--standalone/);

  const tempRoot = mkdtempSync(`${tmpdir()}/portfolio-new-task-contract-`);
  const standaloneSlug = `standalone-contract-${process.pid}`;
  const standaloneBranch = `jscraik/${standaloneSlug}`;
  const standalonePath = path.join(tempRoot, "worktree");
  try {
    const output = command("bash", [
      "scripts/new-task.sh",
      "--standalone",
      "--branch-prefix",
      "jscraik",
      "--base",
      "HEAD",
      "--path",
      standalonePath,
      standaloneSlug,
    ]);
    assert.match(output, new RegExp(`branch: ${standaloneBranch}`));
  } finally {
    if (existsSync(standalonePath)) {
      execFileSync("git", ["worktree", "remove", "--force", standalonePath], {
        cwd: repoRoot,
        stdio: "ignore",
      });
    }
    try {
      execFileSync("git", ["show-ref", "--verify", "--quiet", `refs/heads/${standaloneBranch}`], {
        cwd: repoRoot,
        stdio: "ignore",
      });
      execFileSync("git", ["branch", "-D", standaloneBranch], {
        cwd: repoRoot,
        stdio: "ignore",
      });
    } catch {
      // The helper may have rejected before creating the branch.
    }
    rmSync(tempRoot, { force: true, recursive: true });
  }
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

check("PR template follows the current maintainer evidence contract", () => {
  assert.equal(packageJson.scripts["validate:pr-template"], "node scripts/validate-pr-template.mjs");
  assert.deepEqual(collectPrTemplateContractErrors(pullRequestTemplate), []);
  assert.match(pullRequestTemplate, /## Summary/);
  assert.match(pullRequestTemplate, /## Change details/);
  assert.match(pullRequestTemplate, /## Validation/);
  assert.match(pullRequestTemplate, /## Review and closeout/);
  assert.doesNotMatch(pullRequestTemplate, /## Work performed/);
  assert.doesNotMatch(pullRequestTemplate, /## Testing/);

  const retiredSchemaErrors = collectPrTemplateContractErrors(
    pullRequestTemplate.replace("## Summary", "## Work performed"),
  );
  assert.match(retiredSchemaErrors.join("\n"), /missing required section: ## Summary/i);
  assert.match(retiredSchemaErrors.join("\n"), /retired section: ## Work performed/i);

  const prependedTextErrors = collectPrTemplateContractErrors(`Context before template\n${pullRequestTemplate}`);
  assert.match(prependedTextErrors.join("\n"), /must start with '# Pull request'/i);

  const reorderedSections = pullRequestTemplate
    .replace("## Summary", "## __SUMMARY__")
    .replace("## Change details", "## Summary")
    .replace("## __SUMMARY__", "## Change details");
  const reorderedSectionErrors = collectPrTemplateContractErrors(reorderedSections);
  assert.match(reorderedSectionErrors.join("\n"), /required sections must remain in the declared order/i);

  const hiddenRequiredFieldErrors = collectPrTemplateContractErrors(
    pullRequestTemplate.replace("- Problem:", "<!--\n- Problem:\n-->")
  );
  assert.match(hiddenRequiredFieldErrors.join("\n"), /Summary is missing field: Problem/i);

  const hiddenChecklistErrors = collectPrTemplateContractErrors(
    pullRequestTemplate.replace("- [ ] **(Pending)** Codex review completed and findings handled or explicitly waived.", "<!--\n- [ ] **(Pending)** Codex review completed and findings handled or explicitly waived.\n-->")
  );
  assert.match(hiddenChecklistErrors.join("\n"), /checklist is missing status marker: \*\*\(Pending\)\*\* Codex/i);

  const hiddenBranchPolicyErrors = collectPrTemplateContractErrors(
    pullRequestTemplate.replace("standalone review-remediation PRs may use `jscraik/<short-description>` when the body records a concrete Linear `n/a` reason", "<!-- standalone review-remediation PRs may use `jscraik/<short-description>` when the body records a concrete Linear `n/a` reason -->")
  );
  assert.match(hiddenBranchPolicyErrors.join("\n"), /standalone remediation branch exception/i);

  const hiddenCodestyleEvidenceErrors = collectPrTemplateContractErrors(
    pullRequestTemplate.replace(
      "- Command: `bash scripts/validate-codestyle.sh` -> pass",
      "<!-- - Command: `bash scripts/validate-codestyle.sh` -> pass -->",
    ),
  );
  assert.match(hiddenCodestyleEvidenceErrors.join("\n"), /codestyle command evidence/i);

  const hiddenBlockedEvidenceErrors = collectPrTemplateContractErrors(
    pullRequestTemplate.replace(
      "- Command: `npm run check` -> blocked (reason)",
      "<!-- - Command: `npm run check` -> blocked (reason) -->",
    ),
  );
  assert.match(hiddenBlockedEvidenceErrors.join("\n"), /blocked command evidence with a reason/i);
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

check("CircleCI npm auth does not expose the token in process arguments", () => {
  assert.match(circleciConfig, /printf '%s\\n' "\/\/registry\.npmjs\.org\/:_authToken=\$\{NPM_TOKEN\}"/);
  assert.match(circleciConfig, /printf '%s\\n' "\/\/aiforui\.dev\/npm\/:_authToken=\$\{AIFORUI_NPM_TOKEN\}"/);
  assert.doesNotMatch(circleciConfig, /npm config set[^\n]*NPM_TOKEN/);
  assert.doesNotMatch(circleciConfig, /npm config set[^\n]*AIFORUI_NPM_TOKEN/);
});

check("aggregate source validation reuses its single Astro build", () => {
  const validateSource = packageJson.scripts["validate:source"];
  const validateRendered = packageJson.scripts["validate:rendered"];
  assert.match(validateSource, /ASTRO_TELEMETRY_DISABLED=1 npm run build && node scripts\/smoke-pages\.mjs/);
  assert.equal((validateSource.match(/npm run build/g) ?? []).length, 1);
  assert.equal((validateSource.match(/node scripts\/smoke-pages\.mjs/g) ?? []).length, 1);
  assert.doesNotMatch(validateSource, /npm run test:smoke/);
  assert.equal(
    packageJson.scripts["test:smoke"],
    "ASTRO_TELEMETRY_DISABLED=1 npm run build && node scripts/smoke-pages.mjs",
  );
  assert.match(validateRendered, /node scripts\/validate-js-budget\.mjs/);
  assert.match(validateRendered, /node scripts\/validate-render-flow\.mjs/);
  assert.doesNotMatch(validateRendered, /npm run validate:(?:js-budget|render-flow)/);
});

check("render-flow validation protects route shell landmarks", () => {
  assert.match(renderFlow, /header\.demo-nav/);
  assert.match(renderFlow, /header\.site-header/);
  assert.match(renderFlow, /footer\.site-footer/);
  assert.match(renderFlow, /missing route shell header landmark/);
  assert.match(renderFlow, /missing shared footer landmark/);
  assert.match(renderFlow, /CHROME_CDP_URL/);
  assert.match(renderFlow, /connectOverCDP/);
});

check("Linear branch policy uses the supported single-segment prefix", () => {
  assert.equal(contract.issueTrackingPolicy?.provider, "linear");
  assert.equal(contract.issueTrackingPolicy?.branchPrefix, "jscraik");
  assert.doesNotMatch(contract.issueTrackingPolicy?.branchPrefix ?? "", /\//);
  assert.match(workflow, /Linear issue/i);
  assert.match(contributing, /jscraik\/<linear-key>-<short-description>/);
  assert.match(contributing, standaloneRemediationPolicy);
  assert.match(workflow, standaloneRemediationPolicy);
  assert.match(workflow, /new-task\.sh --prepare --standalone --branch-prefix jscraik/);
  assert.match(contributing, /new-task\.sh --prepare --standalone --branch-prefix jscraik/);
  assert.match(codexEnforced, /WORKTREE_BRANCH_PREFIX="\$\{WORKTREE_BRANCH_PREFIX:-jscraik\}"/);
  assert.match(pullRequestTemplate, /jscraik\/<linear-key>-<short-description>/);
  assert.match(pullRequestTemplate, standaloneRemediationPolicy);
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
