import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import {
  checkDirty,
  checkHumanApprovals,
  currentCodexCompletion,
  currentCodeRabbitCompletion,
  currentBotReviews,
  checkGlobalReviewReceipt,
  globMatches,
  loadScope,
  readChangedFiles,
  requiredChecks,
  rulesetApplies,
} from "./lib/pr-readiness-boundaries.mjs";

test("directory scope patterns include nested files", () => {
  assert.equal(globMatches("docs/implementation-notes/pr-readiness-gate.md", "docs/implementation-notes/"), true);
  assert.equal(globMatches("docs/implementation-notes/pr-readiness-gate.md", "docs/implementation-notes"), true);
});

test("CodeRabbit reply artifacts require exact identity, PR, head and complete supported layout", () => {
  const head = "a".repeat(40), prUrl = "https://github.com/jscraik/websites/pull/49";
  const body = `<!-- coderabbit-ai-generated:v1 -->\n\n<!-- This is an auto-generated reply by CodeRabbit -->\n\n> [!TIP]\n> For best results, initiate chat on the files or code changes.\n\n<details>\n<summary>🧩 Analysis chain</summary>\n\n🏁 Script executed:\n\n\`\`\`shell\ngh api repos/jscraik/websites/issues/comments/123\n\`\`\`\n\nLength of output: 5055\n\n---\n\n</details>\n\n\`@jscraik\`\n\nNo findings for ${head}.\n\n_You are interacting with an AI system._`;
  const entry = { id: 124, user: { id: 456, login: "coderabbitai[bot]", type: "Bot" }, html_url: `${prUrl}#issuecomment-124`, body, created_at: "2026-10-21T10:00:00Z", updated_at: "2026-10-21T10:00:00Z" };
  assert.equal(currentCodeRabbitCompletion([entry], head, prUrl), entry);
  const invalid = [
    { ...entry, user: { ...entry.user, login: "author" } },
    { ...entry, user: { ...entry.user, type: "User" } },
    { ...entry, html_url: "https://github.com/other/repo/pull/49#issuecomment-124" },
    ...[body.replace(head, "b".repeat(40)), body + "\nFinding: unsafe write", body.replace(":v1", ":v2"),
      body.replace("No findings for", "> No findings for"), body.replace("No findings for", "Inspection incomplete for"),
      body.replace("gh api repos/jscraik/websites/issues/comments/123", "echo 'Inspection failed'"),
      body.replace("Length of output: 5055", "A defect remains")].map(value => ({ ...entry, body: value })),
  ];
  for (const candidate of invalid) assert.equal(currentCodeRabbitCompletion([candidate], head, prUrl), null);
  const later = { ...entry, id: 125, html_url: `${prUrl}#issuecomment-125`, created_at: "2026-10-21T10:01:00Z", updated_at: "2026-10-21T10:01:00Z" };
  for (const body of ["A source defect remains.", "Review incomplete.", "> No findings for " + head]) {
    const concern = { ...later, body };
    assert.equal(currentCodeRabbitCompletion([entry, concern], head, prUrl), null);
    assert.equal(currentCodeRabbitCompletion([concern, entry], head, prUrl), null);
    const editedOlder = { ...concern, created_at: "2026-10-20T10:00:00Z" };
    assert.equal(currentCodeRabbitCompletion([editedOlder, entry], head, prUrl), null);
    const editedClean = { ...entry, updated_at: "2026-10-21T10:02:00Z" };
    assert.equal(currentCodeRabbitCompletion([editedClean, concern], head, prUrl), null);
    assert.equal(currentCodeRabbitCompletion([concern, editedClean], head, prUrl), null);
  }
  assert.equal(currentCodeRabbitCompletion([entry, later], head, prUrl), later);
  assert.equal(currentCodeRabbitCompletion([entry, { ...later, updated_at: entry.updated_at, created_at: entry.created_at }], head, prUrl), null);
  assert.equal(currentCodeRabbitCompletion([entry, { ...later, updated_at: "invalid" }], head, prUrl), null);
});

test("solo-maintainer human quorum can be zero without satisfying bot-review lanes", () => {
  const result = { blockers: [], reviews: { current_codex: 0, current_coderabbit: 0 } };
  checkHumanApprovals(result, [], 0, "current", (target, code) => target.blockers.push(code));
  assert.deepEqual(result.blockers, []);
  assert.deepEqual(result.reviews, { current_codex: 0, current_coderabbit: 0 });
});

test("formal review artifacts reject human impersonation, stale heads and invalid states", () => {
  const head = "a".repeat(40), prUrl = "https://github.com/jscraik/websites/pull/49";
  for (const login of ["coderabbitai[bot]", "chatgpt-codex-connector[bot]"]) {
    const entry = { id: 123, user: { id: 456, type: "Bot", login }, commit_id: head, html_url: `${prUrl}#pullrequestreview-123`, state: "COMMENTED" };
    assert.deepEqual(currentBotReviews([entry], head, prUrl, login), [entry]);
    for (const candidate of [
      { ...entry, user: { ...entry.user, login: "codex-coderabbit-attacker", type: "User" } },
      { ...entry, user: { ...entry.user, type: "User" } },
      { ...entry, user: { ...entry.user, id: 0 } },
      { ...entry, commit_id: "b".repeat(40) },
      { ...entry, html_url: "https://github.com/other/repo/pull/49#pullrequestreview-123" },
      ...["CHANGES_REQUESTED", "DISMISSED", "PENDING", ""].map(state => ({ ...entry, state })),
    ]) assert.deepEqual(currentBotReviews([candidate], head, prUrl, login), []);
  }
  assert.deepEqual(currentBotReviews([], head, prUrl, "unknown"), []);
});

test("non-zero human quorum and unknown policy fail closed", () => {
  for (const required of [1, 2, undefined, -1, "0"]) {
    const result = { blockers: [] };
    checkHumanApprovals(result, [], required, "current", (target, code) => target.blockers.push(code));
    assert.equal(result.blockers.length, 1);
  }
});

test("merge clearance consumes a matching global receipt and cannot rely on artifact counts", () => {
  const head = "a".repeat(40), pr = { number: 49, headRefOid: head, baseRefName: "main" };
  const receipt = { schema_version: "pr-readiness/v1", status: "pass", phase: "update",
    repo: { head_sha: head, root: "/fixture" }, lanes: { reviews: { status: "pass" }, required_checks: { status: "pass" } } };
  for (const [payload, ok, expected] of [
    [receipt, true, "pass"], [receipt, false, "blocked"],
    [{ ...receipt, status: "fail" }, true, "blocked"],
    [{ ...receipt, phase: "review_inspection" }, true, "blocked"],
    [{ ...receipt, repo: { ...receipt.repo, head_sha: "b".repeat(40) } }, true, "blocked"],
    [{ ...receipt, repo: { ...receipt.repo, root: "/other" } }, true, "blocked"],
    [{ ...receipt, lanes: { ...receipt.lanes, reviews: { status: "fail" } } }, true, "blocked"],
    [{ ...receipt, lanes: { ...receipt.lanes, required_checks: { status: "blocked" } } }, true, "blocked"],
    [null, true, "blocked"], ["malformed", true, "blocked"],
  ]) {
    const result = { repo: "jscraik/websites", repo_root: "/fixture", blockers: [], reviews: { current_codex: 1, current_coderabbit: 1 } };
    const run = (command, args) => {
      assert.equal(command, "python3");
      assert.deepEqual(args, ["/gate/pr-readiness.py", "--phase", "update", "--check-receipt", "--expected-repo", "jscraik/websites", "--expected-pr", "49", "--expected-head", head, "--expected-base", "main"]);
      return { ok, stdout: payload === "malformed" ? "not JSON" : JSON.stringify(payload), output: "review recheck result" };
    };
    checkGlobalReviewReceipt(result, pr, run, "python3", "/gate/pr-readiness.py", (target, code) => target.blockers.push(code));
    assert.equal(result.global_review_clearance.status, expected);
    assert.equal(result.blockers.length, expected === "pass" ? 0 : 1);
  }
});

test("Codex artifact detection rejects stale, unauthenticated and incomplete summaries", () => {
  const head = "a".repeat(40), prUrl = "https://github.com/jscraik/websites/pull/49";
  const state = { code_review: { commit_sha: head, status: "completed", has_any_findings: false, has_unresolved_findings: false } };
  const body = (value) => `<!-- codex-pull-request-review-summary -->\n<!-- codex-review-state:v1 ${JSON.stringify(value)} -->`;
  const entry = { id: 123, user: { id: 456, login: "chatgpt-codex-connector[bot]", type: "Bot" }, html_url: `${prUrl}#issuecomment-123`, body: body(state) };
  assert.equal(currentCodexCompletion([entry], head, prUrl), entry);
  const invalid = [
    { ...entry, user: { ...entry.user, login: "author" } },
    { ...entry, user: { ...entry.user, type: "User" } },
    { ...entry, html_url: "https://github.com/other/repo/pull/49#issuecomment-123" },
    { ...entry, body: "<!-- codex-pull-request-review-summary -->\n<!-- codex-review-state:v1 broken -->" },
    { ...entry, body: body({ security_review: state.code_review }) },
    ...["running", "failed"].map(status => ({ ...entry, body: body({ code_review: { ...state.code_review, status } }) })),
    { ...entry, body: body({ code_review: { ...state.code_review, commit_sha: "b".repeat(40) } }) },
    { ...entry, body: body({ code_review: { ...state.code_review, has_unresolved_findings: true } }) },
    { ...entry, body: body({ code_review: { ...state.code_review, has_any_findings: null } }) },
  ];
  for (const candidate of invalid) assert.equal(currentCodexCompletion([candidate], head, prUrl), null);
  assert.equal(currentCodexCompletion([entry, entry], head, prUrl), null);
  const later = { ...entry, id: 124, html_url: `${prUrl}#issuecomment-124` };
  assert.equal(currentCodexCompletion([entry, later], head, prUrl), null);
  const laterFinding = { ...later, body: body({ code_review: { ...state.code_review, has_any_findings: true, has_unresolved_findings: true } }) };
  assert.equal(currentCodexCompletion([entry, laterFinding], head, prUrl), null);
  assert.equal(currentCodexCompletion([laterFinding, entry], head, prUrl), null);
});

test("single-star patterns stay within one path segment", () => {
  assert.equal(globMatches("scripts/validate-pr-readiness.mjs", "scripts/*.mjs"), true);
  assert.equal(globMatches("scripts/lib/pr-readiness-boundaries.mjs", "scripts/*.mjs"), false);
});

test("double-star patterns cross path segments", () => {
  assert.equal(globMatches("scripts/lib/pr-readiness-boundaries.mjs", "scripts/**/*.mjs"), true);
  assert.equal(globMatches("scripts/validate-pr-readiness.mjs", "scripts/**/*.mjs"), true);
});

test("exact patterns include the path itself and its descendants", () => {
  assert.equal(globMatches("package.json", "package.json"), true);
  assert.equal(globMatches("package.json/backup", "package.json"), true);
  assert.equal(globMatches("package-lock.json", "package.json"), false);
});

test("rulesets honor all-branch, glob, and exclusion targets", () => {
  const base = { enforcement: "active", target: "branch" };
  assert.equal(rulesetApplies({ ...base, conditions: { ref_name: { include: ["~ALL"] } } }, "release/candidate"), true);
  assert.equal(rulesetApplies({ ...base, conditions: { ref_name: { include: ["release/*"] } } }, "release/candidate"), true);
  assert.equal(rulesetApplies({ ...base, conditions: { ref_name: { include: ["~ALL"], exclude: ["release/*"] } } }, "release/candidate"), false);
  assert.equal(rulesetApplies({ ...base, conditions: { ref_name: { include: ["~DEFAULT_BRANCH"] } } }, "main"), true);
});

test("scope manifests fail closed without applying malformed fields", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "portfolio-pr-readiness-"));
  const scopeFile = path.join(directory, "scope.json");
  await writeFile(
    scopeFile,
    JSON.stringify({
      schema_version: "portfolio-pr-scope/v1",
      allowed_paths: ["scripts", 42],
      excluded_paths: ["docs", null],
      dirty_allowed_paths: "runtime/**",
      max_files: -1,
    })
  );
  const result = { blockers: [] };
  const scope = loadScope(
    result,
    { allowPath: ["package.json"], allowDirty: [], scopeFile },
    (target, code, message, evidence) => target.blockers.push({ code, message, evidence })
  );
  assert.deepEqual(scope.allowed_paths, ["package.json"]);
  assert.deepEqual(scope.excluded_paths, []);
  assert.deepEqual(scope.dirty_allowed_paths, []);
  assert.equal(scope.max_files, null);
  assert.deepEqual(
    result.blockers.map((blocker) => blocker.code),
    ["scope_field_invalid", "scope_field_invalid", "scope_dirty_allowed_paths_invalid", "scope_max_files_invalid"]
  );
  await rm(directory, { recursive: true, force: true });
});

test("changed and dirty paths preserve NUL-delimited filenames exactly", () => {
  const changedResult = {};
  const changed = readChangedFiles(
    changedResult,
    { base: "origin/main", head: "HEAD" },
    null,
    () => ({ ok: true, stdout: "dir/with space/file -> still-a-name\0exact-name\0", output: "" }),
    "git",
    "gh"
  );
  assert.deepEqual(changed, ["dir/with space/file -> still-a-name", "exact-name"]);
  const dirtyResult = { blockers: [] };
  const scope = { dirty_allowed_paths: ["**"] };
  checkDirty(
    dirtyResult,
    scope,
    () => ({ ok: true, stdout: "R  new name\0old name\0 M file -> literal\0", output: "" }),
    "git",
    (target, code, message, evidence) => target.blockers.push({ code, message, evidence })
  );
  assert.deepEqual(dirtyResult.dirty_worktree.files, ["new name", "old name", "file -> literal"]);
});

test("required checks union active rulesets and branch protection", () => {
  const result = { blockers: [] };
  const commandJson = (_result, _command, args) => {
    if (args[0] === "api" && args.at(-1).endsWith("/rulesets")) return [{ id: 1 }];
    if (args[0] === "api" && args.at(-1).endsWith("/rulesets/1")) {
      return {
        enforcement: "active",
        target: "branch",
        conditions: { ref_name: { include: ["~ALL"] } },
        rules: [{ type: "required_status_checks", parameters: { required_status_checks: [{ context: "lint" }] } }, { type: "pull_request", parameters: { required_approving_review_count: 2 } }],
      };
    }
    return null;
  };
  const checks = requiredChecks(
    result,
    "jscraik/portfolio",
    "main",
    () => ({ ok: true, stdout: JSON.stringify({ required_status_checks: { contexts: ["test"], checks: [] }, required_pull_request_reviews: { required_approving_review_count: 1 } }), output: "" }),
    "gh",
    commandJson,
    (output) => ({ value: JSON.parse(output), error: null }),
    (target, code, message, evidence) => target.blockers.push({ code, message, evidence })
  );
  assert.deepEqual(checks.contexts, ["lint", "test"]);
  assert.equal(checks.requiredApprovals, 2);
  assert.equal(checks.source, "active repository ruleset + branch protection");
  assert.deepEqual(result.blockers, []);
});

test("required checks fail closed when branch protection lookup is unavailable", () => {
  const result = { blockers: [] };
  const commandJson = (_result, _command, args) => {
    if (args[0] === "api" && args.at(-1).endsWith("/rulesets")) return [];
    return null;
  };
  const checks = requiredChecks(
    result,
    "jscraik/portfolio",
    "main",
    () => ({ ok: false, code: 403, stdout: "", output: "gh: Resource not accessible by integration (HTTP 403)" }),
    "gh",
    commandJson,
    (output) => ({ value: JSON.parse(output), error: null }),
    (target, code, message, evidence) => target.blockers.push({ code, message, evidence })
  );
  assert.deepEqual(checks.contexts, []);
  assert.equal(result.blockers[0].code, "required_checks_unavailable");
  assert.equal(result.blockers[1].code, "required_checks_unconfigured");
});

test("repository rulesets are valid but do not impose branch approval policy", () => {
  const result = { blockers: [] };
  const checks = requiredChecks(result, "jscraik/portfolio", "main",
    () => ({ ok: true, stdout: JSON.stringify({ required_status_checks: { contexts: ["lint"] } }), output: "" }),
    "gh", (_result, _gh, args) => args.at(-1).endsWith("/rulesets") ? [{ id: 1 }] : {
      target: "repository", enforcement: "active", rules: [{ type: "pull_request", parameters: { required_approving_review_count: 2 } }],
    }, (output) => ({ value: JSON.parse(output), error: null }),
    (target, code) => target.blockers.push(code));
  assert.deepEqual(checks.contexts, ["lint"]);
  assert.equal(checks.requiredApprovals, 0);
  assert.deepEqual(result.blockers, []);
});

test("only an explicit unprotected-branch response permits absent protection", () => {
  for (const output of ["HTTP 404: Not Found", "HTTP 404: Resource not accessible by integration", "HTTP 404: Branch not protected"]) {
    const result = { blockers: [] };
    const commandJson = (_result, _gh, args) => args.at(-1).endsWith("/rulesets") ? [[{ id: 1 }]] : {
      target: "branch", enforcement: "active", rules: [{ type: "required_status_checks", parameters: { required_status_checks: [{ context: "lint" }] } }],
    };
    requiredChecks(result, "jscraik/portfolio", "main", () => ({ ok: false, output }), "gh", commandJson,
      (value) => ({ value: JSON.parse(value), error: null }), (target, code) => target.blockers.push(code));
    assert.deepEqual(result.blockers, output.includes("Branch not protected") ? [] : ["required_checks_unavailable"]);
  }
});

test("hosted approval policy preserves zero and rejects malformed counts", () => {
  for (const count of [0, -1, "0"]) {
    const result = { blockers: [] };
    const checks = requiredChecks(result, "jscraik/portfolio", "main",
      () => ({ ok: true, stdout: JSON.stringify({ required_status_checks: { contexts: ["lint"] }, required_pull_request_reviews: { required_approving_review_count: count } }), output: "" }),
      "gh", () => [], (output) => ({ value: JSON.parse(output), error: null }),
      (target, code) => target.blockers.push(code));
    assert.equal(checks.requiredApprovals, 0);
    assert.deepEqual(result.blockers, count === 0 ? [] : ["approval_policy_invalid"]);
  }
});

test("malformed ruleset lists cannot infer zero approvals from branch checks", () => {
  for (const payload of [{}, null, [null], [{}], [[{ id: "1" }]]]) {
    const result = { blockers: [] };
    requiredChecks(result, "jscraik/portfolio", "main",
      () => ({ ok: true, stdout: JSON.stringify({ required_status_checks: { contexts: ["lint"] } }), output: "" }),
      "gh", () => payload, (output) => ({ value: JSON.parse(output), error: null }),
      (target, code) => target.blockers.push(code));
    assert.ok(result.blockers.includes("approval_policy_invalid"));
  }
});

test("malformed ruleset detail cannot silently remove a human quorum", () => {
  for (const detail of [null, {}, { enforcement: "active", target: "branch", rules: {} }]) {
    const result = { blockers: [] };
    requiredChecks(result, "jscraik/portfolio", "main",
      () => ({ ok: false, output: "HTTP 404: Branch not protected" }), "gh",
      (_result, _gh, args) => args.at(-1).endsWith("/rulesets") ? [[{ id: 1 }]] : detail,
      (output) => ({ value: JSON.parse(output), error: null }),
      (target, code) => target.blockers.push(code));
    assert.ok(result.blockers.includes("approval_policy_invalid"));
  }
});
