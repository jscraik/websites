import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

import { collectPrBodyContractErrors, collectPrTemplateContractErrors } from "./lib/pr-template-contract.mjs";

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
const relatedTests = read("scripts/check-related-tests.sh");
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

check("PR body validation follows the repository template contract", () => {
  const validBody = pullRequestTemplate
    .replace(/^Write for maintainers\.[\s\S]*?^## Summary$/m, "## Summary")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/^- ([^\n:]+):$/gm, "- $1: verified value")
    .replace(/^- Release mode:.*$/m, "- Release mode: Harness")
    .replace(/^- User-facing impact:.*$/m, "- User-facing impact: n.a. because this validator has no visitor impact")
    .replace(
      "- Regression coverage: verified value",
      "- Regression coverage: PR-body schema\n- Command: `npm run validate:pr-template` -> pass",
    );
  assert.deepEqual(collectPrBodyContractErrors(validBody, pullRequestTemplate), []);

  const missingValue = validBody.replace("- Problem: verified value", "- Problem:");
  assert.match(collectPrBodyContractErrors(missingValue, pullRequestTemplate).join("\n"), /Problem must not be empty/i);

  const optionalEvidenceFieldsEmpty = [
    "Validation evidence",
    "Review artifacts",
    "Pattern scope inventory",
    "Meta-behavior proof",
    "Repeated-error research",
    "Durable evidence map",
  ].reduce((body, field) => body.replace(`- ${field}: verified value`, `- ${field}:`), validBody);
  assert.deepEqual(collectPrBodyContractErrors(optionalEvidenceFieldsEmpty, pullRequestTemplate), []);

  const duplicateRequiredField = validBody.replace("- Problem: verified value", "- Problem: filled\n- Problem:");
  assert.match(collectPrBodyContractErrors(duplicateRequiredField, pullRequestTemplate).join("\n"), /Problem must appear exactly once/i);

  const placeholderValue = validBody.replace("- Problem: verified value", "- Problem: n.a. because reason");
  assert.match(collectPrBodyContractErrors(placeholderValue, pullRequestTemplate).join("\n"), /replace the template placeholder/i);

  const slashPlaceholderValue = validBody.replace("- Linear reference: verified value", "- Linear reference: n/a because reason");
  assert.match(collectPrBodyContractErrors(slashPlaceholderValue, pullRequestTemplate).join("\n"), /replace the template placeholder/i);

  for (const incompleteReason of [
    "n.a.",
    "n.a. because",
    "n.a. because   ",
    "n.a. because ---",
    "n/a",
    "n/a because",
    "n/a because   ",
    "n/a because ---",
  ]) {
    const incompleteNotApplicable = validBody.replace(
      "- Linear reference: verified value",
      `- Linear reference: ${incompleteReason}`,
    );
    assert.match(collectPrBodyContractErrors(incompleteNotApplicable, pullRequestTemplate).join("\n"), /concrete reason after n\.a\./i);
  }

  const releaseModePlaceholder = validBody.replace(
    "- Release mode: Harness",
    "- Release mode: Prototype / Portfolio / Product / Harness / n.a. because reason",
  );
  assert.match(collectPrBodyContractErrors(releaseModePlaceholder, pullRequestTemplate).join("\n"), /replace the template placeholder/i);

  const userImpactPlaceholder = validBody.replace(
    "- User-facing impact: n.a. because this validator has no visitor impact",
    "- User-facing impact: yes, with changelog / no / n.a. because reason",
  );
  assert.match(collectPrBodyContractErrors(userImpactPlaceholder, pullRequestTemplate).join("\n"), /replace the template placeholder/i);

  const normalizedUserImpactPlaceholder = validBody.replace(
    "- User-facing impact: n.a. because this validator has no visitor impact",
    "- User-facing impact: Yes,  with changelog / no / n.a. because reason",
  );
  assert.match(collectPrBodyContractErrors(normalizedUserImpactPlaceholder, pullRequestTemplate).join("\n"), /replace the template placeholder/i);

  const sampleOnlyEvidence = validBody
    .replace("- Command: `npm run validate:pr-template` -> pass", "- Command: `bash scripts/validate-codestyle.sh` -> pass");
  assert.match(collectPrBodyContractErrors(sampleOnlyEvidence, pullRequestTemplate).join("\n"), /must include an exact command/i);

  const bareBlockedEvidence = validBody.replace(
    "- Command: `npm run validate:pr-template` -> pass",
    "- Command: `npm run validate:pr-template` -> blocked",
  );
  assert.match(collectPrBodyContractErrors(bareBlockedEvidence, pullRequestTemplate).join("\n"), /must include an exact command/i);

  const blankBlockedReason = validBody.replace(
    "- Command: `npm run validate:pr-template` -> pass",
    "- Command: `npm run validate:pr-template` -> blocked (   )",
  );
  assert.match(collectPrBodyContractErrors(blankBlockedReason, pullRequestTemplate).join("\n"), /must include an exact command/i);

  const placeholderBlockedReason = validBody.replace(
    "- Command: `npm run validate:pr-template` -> pass",
    "- Command: `npm run validate:pr-template` -> blocked (reason)",
  );
  assert.match(collectPrBodyContractErrors(placeholderBlockedReason, pullRequestTemplate).join("\n"), /must include an exact command/i);

  const blankValidationCommand = validBody.replace(
    "- Command: `npm run validate:pr-template` -> pass",
    "- Command: `   ` -> pass",
  );
  assert.match(collectPrBodyContractErrors(blankValidationCommand, pullRequestTemplate).join("\n"), /must include an exact command/i);

  const fencedHeadingExample = validBody.replace(
    "- Untested paths and limitations: verified value",
    "- Untested paths and limitations: verified value\n\n```md\n## Summary\n```",
  );
  assert.deepEqual(collectPrBodyContractErrors(fencedHeadingExample, pullRequestTemplate), []);

  const longIndentedFenceExample = validBody.replace(
    "- Untested paths and limitations: verified value",
    "- Untested paths and limitations: verified value\n\n  ````md\n## Summary\n  ````",
  );
  assert.deepEqual(collectPrBodyContractErrors(longIndentedFenceExample, pullRequestTemplate), []);

  const invalidBacktickInfoFence = validBody.replace(
    "- Untested paths and limitations: verified value",
    "- Untested paths and limitations: verified value\n\n```bad`info\n## Summary\n```",
  );
  assert.match(collectPrBodyContractErrors(invalidBacktickInfoFence, pullRequestTemplate).join("\n"), /exactly the repository template sections/i);

  const indentedExtraHeading = validBody.replace(
    "- Untested paths and limitations: verified value",
    "- Untested paths and limitations: verified value\n\n  ## Deployment notes\n- None",
  );
  assert.match(collectPrBodyContractErrors(indentedExtraHeading, pullRequestTemplate).join("\n"), /exactly the repository template sections/i);

  const renamedSection = validBody.replace("## Summary", "## Overview");
  assert.match(collectPrBodyContractErrors(renamedSection, pullRequestTemplate).join("\n"), /exactly the repository template sections/i);

  const changedChecklist = validBody.replace("I did not push directly to `main`", "I avoided main");
  assert.match(collectPrBodyContractErrors(changedChecklist, pullRequestTemplate).join("\n"), /checklist items must exactly match/i);

  const fencedChecklistExample = validBody.replace(
    "- [ ] I will delete the branch and worktree after merge.",
    "- [ ] I will delete the branch and worktree after merge.\n\n```md\n- [ ] Example item\n```",
  );
  assert.deepEqual(collectPrBodyContractErrors(fencedChecklistExample, pullRequestTemplate), []);
});

check("pre-commit validation uses portfolio package contracts", () => {
  assert.match(codestyleValidator, /run_required_script "validate:fast"/);
  assert.doesNotMatch(preCommitHook, /npm run lint/);
  assert.doesNotMatch(preCommitHook, /npm run quality:debt/);
  assert.match(preCommitHook, /make related-tests-staged/);
  assert.match(relatedTests, /npm exec -- vitest run/);
  assert.doesNotMatch(relatedTests, /pnpm exec vitest run/);
});

check("pre-push validation uses the npm and Astro contract", () => {
  assert.match(read("scripts/validate-codestyle.sh"), /run-package-command\.sh" npm/);
  assert.doesNotMatch(read("scripts/validate-codestyle.sh"), /run-package-command\.sh" pnpm/);
  assert.doesNotMatch(prePushHook, /check-diagram-freshness|refresh-diagram-context/);
  assert.match(prePushHook, /node \.\/scripts\/validate-operator-contract\.mjs/);
  assert.match(prePushHook, /npm run check:git-worktree-authority/);
  assert.match(prePushHook, /npm run validate:fast/);
  assert.match(prePushHook, /npm run check/);
  assert.match(prePushHook, /npm run build/);
  assert.doesNotMatch(prePushHook, /tooling-audit|check-environment\.sh|semgrep-changed/);
});

check("CircleCI npm auth does not expose the token in process arguments", () => {
  assert.match(circleciConfig, /printf '%s\\n' "\/\/registry\.npmjs\.org\/:_authToken=\$\{NPM_TOKEN\}"/);
  assert.doesNotMatch(circleciConfig, /AIFORUI_NPM_TOKEN|aiforui\.dev\/npm/);
  assert.doesNotMatch(circleciConfig, /npm config set[^\n]*NPM_TOKEN/);
});

check("CircleCI mise installs preserve scoped GitHub auth without logging it", () => {
  const wrappers = [...circleciConfig.matchAll(/install_mise_with_github_auth\(\) \{\n([\s\S]*?)\n            \}/g)];
  assert.equal(wrappers.length, 3, "uv, full environment and security bootstrap must share the auth contract");
  for (const [, body] of wrappers) {
    for (const [credentials, expected] of [
      [{ GITHUB_TOKEN: "fixture-github", GH_TOKEN: "fixture-gh" }, "fixture-github"],
      [{ GH_TOKEN: "fixture-gh" }, "fixture-gh"],
      [{ GITHUB_PERSONAL_ACCESS_TOKEN: "fixture-pat" }, "fixture-pat"],
      [{}, ""],
    ]) {
      const output = execFileSync("/bin/bash", ["--noprofile", "--norc", "-euc", `
        mise() {
          test "$1" = install && test "$2" = uv
          test "\u0024{GITHUB_TOKEN:-}" = "$EXPECTED_TOKEN"
        }
        install_mise_with_github_auth() { ${body}\n }
        install_mise_with_github_auth uv
        test "\u0024{GITHUB_TOKEN:-}" = "$ORIGINAL_TOKEN"
      `], { encoding: "utf8", env: { PATH: process.env.PATH, ...credentials,
        EXPECTED_TOKEN: expected, ORIGINAL_TOKEN: credentials.GITHUB_TOKEN ?? "" } });
      assert.equal(output, "", "bootstrap must not log credentials");
    }
  }
  assert.doesNotMatch(circleciConfig, /install_mise_without_github_tokens|unset GH_TOKEN GITHUB_TOKEN/);
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

check("CircleCI retains check labels and success-only Astro dependency", () => {
  const config = parse(circleciConfig);
  const jobs = config.workflows["pr-pipeline"].jobs;
  const byName = Object.fromEntries(jobs.map((entry) => {
    const [job, options] = Object.entries(entry)[0];
    return [options.name ?? job, { job, ...options }];
  }));
  assert.deepEqual(Object.keys(byName).sort(), [
    "pr-template", "linear-gate", "risk-policy-gate", "dependency-scan",
    "orb-pinning", "docs-gate", "lint", "typecheck", "test", "audit",
    "check", "memory", "security-scan", "snyk-dependency-scan", "publish-pages", "release-portfolio",
  ].sort());
  assert.equal(jobs.length, Object.keys(byName).length);
  assert.equal(packageJson.scripts.typecheck, "ASTRO_TELEMETRY_DISABLED=1 npm run check");
  assert.equal(packageJson.scripts.check, "astro check");
  assert.equal(byName.typecheck.command, "npm run typecheck");
  const verifyDependency = (candidate) => assert.deepEqual(candidate.requires, ["typecheck"]);
  verifyDependency(byName.check);
  for (const requires of [[], ["lint"], [{ typecheck: ["success", "failed"] }]]) {
    assert.throws(() => verifyDependency({ ...byName.check, requires }));
  }
  assert.equal(byName.check.job, "typecheck-complete");
  assert.equal(config.jobs["typecheck-complete"].steps.length, 1);
  assert.deepEqual(byName.check.filters, byName.typecheck.filters);
  assert.equal(jobs.filter((entry) => entry["run-governance-check"]?.command === "npm run check").length, 0);
  assert.equal(byName.audit.command, "npm run audit");
  assert.equal(byName["dependency-scan"].command, "npm run audit:strict");
  for (const scanner of ["gitleaks detect", "trivy fs", "bash scripts/check-semgrep-full.sh"]) {
    assert.ok(byName["security-scan"].command.includes(scanner));
  }
  assert.deepEqual(byName["publish-pages"].requires, [
    "dependency-scan", "orb-pinning", "docs-gate", "lint", "typecheck",
    "test", "audit", "check", "memory", "security-scan",
  ]);
  assert.deepEqual(byName["publish-pages"].filters, { branches: { only: "main" }, tags: { ignore: "/.*/" } });
  assert.equal(byName["publish-pages"].context, "cloudflare-pages-production");
  assert.deepEqual(byName["release-portfolio"].requires, ["publish-pages"]);
  assert.deepEqual(byName["release-portfolio"].filters, byName["publish-pages"].filters);
  const release = config.jobs["release-portfolio"];
  assert.equal(release.type, "release");
  assert.equal(release.plan_name, "portfolio-production");
  assert.equal(release.validation.enabled, true);
  assert.equal(release.validation.auto_rollback_on_failure, false);
  assert.equal(release.validation.evaluation_time, "15m");
  assert.deepEqual(release.validation.webhooks, [{
    name: "website_uptime",
    provider: "custom",
    data_points: {
      component_name: "request.component_name",
      env: "request.env",
      project_id: "request.project_id",
      signal_name: "request.signal_name",
      criteria: "request.status",
    },
    fail_when: 'criteria == "firing"',
    max_failures: 1,
  }]);
});

check("CircleCI publication reports upload and health failures", () => {
  const config = parse(circleciConfig);
  const publish = config.jobs["publish-pages"].steps.find(
    (step) => step.run?.name === "Publish main artifact to Cloudflare Pages",
  ).run.command;
  const temporary = mkdtempSync(path.join(tmpdir(), "portfolio-release-contract-"));
  const bin = path.join(temporary, "bin");
  const trace = path.join(temporary, "trace");
  const commit = "0123456789abcdef0123456789abcdef01234567";
  mkdirSync(bin);
  mkdirSync(path.join(temporary, "dist"));
  const fake = (name, content) => writeFileSync(path.join(bin, name), "#!/bin/sh\n" + content, { mode: 0o755 });
  fake("git", 'test "$*" = "rev-parse HEAD" || exit 99\nprintf "%s\\n" "' + commit + '"\n');
  fake("circleci", 'printf "%s\\n" "$*" >> "$CI_TEST_TRACE"\n'
    + '[ "${CI_TEST_FAILURE:-}" != plan ] || [ "$1 $2 $3" != "run release plan" ] || exit 44\n'
    + '[ "${CI_TEST_FAILURE:-}" != running ] || [ "$1 $2 $3 $4 $5" != "run release update portfolio-production --status=running" ] || exit 45\n'
    + '[ "${CI_TEST_FAILURE:-}" != upload-report ] || [ "$1 $2 $3 $4 $5" != "run release update portfolio-production --status=FAILED" ] || exit 77\n');
  fake("npx", 'printf "%s\\n" "upload $*" >> "$CI_TEST_TRACE"\n'
    + 'case "${CI_TEST_FAILURE:-}" in upload|upload-report) exit 42 ;; esac\n');
  fake("curl", 'printf "%s\\n" "probe $*" >> "$CI_TEST_TRACE"\n'
    + '[ "${CI_TEST_FAILURE:-}" != probe ] || exit 43\n'
    + 'if [ "${CI_TEST_FAILURE:-}" = redirect ]; then printf 302; else printf 200; fi\n');
  const run = (failure, credentials = true) => {
    writeFileSync(trace, "");
    const env = {
      PATH: bin + ":/usr/bin:/bin",
      CI_TEST_TRACE: trace,
      CI_TEST_FAILURE: failure,
      CLOUDFLARE_ACCOUNT_ID: "test-account",
      CLOUDFLARE_PAGES_PROJECT: "portfolio",
    };
    if (credentials) env.CLOUDFLARE_API_TOKEN = "test-token";
    const result = spawnSync("bash", ["-c", publish], { cwd: temporary, env, encoding: "utf8" });
    return { result, events: readFileSync(trace, "utf8").trim().split("\n").filter(Boolean) };
  };
  try {
    const success = run("");
    assert.equal(success.result.status, 0, success.result.stderr);
    assert.match(success.events[0], new RegExp("^run release plan portfolio-production .*--target-version=" + commit + "$"));
    assert.match(success.events[1], /^upload .*wrangler@4\.69\.0 pages deploy dist /);
    assert.equal(success.events[2], "run release update portfolio-production --status=running");
    assert.match(success.events[3], /^probe .*https:\/\/jscraik\.com\//);
    assert.equal(success.events.length, 4);
    assert.doesNotMatch(success.result.stdout + success.result.stderr, /test-token/);

    const uploadFailure = run("upload");
    assert.equal(uploadFailure.result.status, 42);
    assert.equal(uploadFailure.events.at(-1), "run release update portfolio-production --status=FAILED");
    assert.equal(uploadFailure.events.some((event) => event.startsWith("probe ")), false);

    const runningFailure = run("running");
    assert.equal(runningFailure.result.status, 45);
    assert.equal(runningFailure.events.at(-1), "run release update portfolio-production --status=FAILED --keep-target-version-live");
    assert.equal(runningFailure.events.some((event) => event.startsWith("probe ")), false);

    const probeFailure = run("probe");
    assert.equal(probeFailure.result.status, 43);
    assert.equal(probeFailure.events.at(-1), "run release update portfolio-production --status=FAILED --keep-target-version-live");

    const redirect = run("redirect");
    assert.notEqual(redirect.result.status, 0);
    assert.equal(redirect.events.at(-1), "run release update portfolio-production --status=FAILED --keep-target-version-live");

    const reportingFailure = run("upload-report");
    assert.equal(reportingFailure.result.status, 42);

    const planFailure = run("plan");
    assert.equal(planFailure.result.status, 44);
    assert.equal(planFailure.events.length, 1);
    const missingToken = run("", false);
    assert.notEqual(missingToken.result.status, 0);
    assert.deepEqual(missingToken.events, []);
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
});

check("CircleCI memory predicate fails closed without full governance setup", () => {
  const config = parse(circleciConfig);
  const steps = config.jobs["validate-memory"].steps;
  assert.equal(steps[0], "checkout");
  assert.equal(steps.length, 3);
  const predicate = steps[2].run.command;
  const temporary = mkdtempSync(path.join(tmpdir(), "websites-ci-memory-"));
  try {
    const evaluate = (contents) => {
      const file = path.join(temporary, "memory.json");
      if (contents === null) rmSync(file, { force: true });
      else writeFileSync(file, contents);
      return spawnSync("bash", ["-c", predicate], { cwd: temporary, encoding: "utf8" }).status;
    };
    assert.equal(evaluate(JSON.stringify({ meta: { version: "1.0" }, preamble: { bootstrap: false, search: true }, entries: [] })), 0);
    for (const invalid of [null, "{", "{}", JSON.stringify({ meta: { version: "1.0" }, preamble: { bootstrap: "true", search: true }, entries: [] })]) {
      assert.notEqual(evaluate(invalid), 0);
    }
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
});

if (failures.length > 0) {
  console.error(`\n${failures.length} operator-contract test(s) failed.`);
  process.exitCode = 1;
}
