#!/usr/bin/env node

import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import {
  checkAncestry,
  checkDirty,
  checkHumanApprovals,
  currentCodexCompletion,
  checkScope,
  checkTrackedHead,
  loadScope,
  requiredChecks,
  readChangedFiles,
} from "./lib/pr-readiness-boundaries.mjs";

const SCHEMA_VERSION = "portfolio-pr-readiness/v1";
const GH = process.env.GH_BIN || (existsSync("/opt/homebrew/bin/gh") ? "/opt/homebrew/bin/gh" : "gh");
const GIT = process.env.GIT_BIN || (existsSync("/usr/bin/git") ? "/usr/bin/git" : "git");

function parseArgs(argv) {
  const options = {
    phase: null,
    pr: null,
    repo: null,
    remote: "origin",
    base: "origin/main",
    head: "HEAD",
    scopeFile: null,
    allowDirty: [],
    allowPath: [],
    json: false,
    strict: true,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const next = () => {
      index += 1;
      if (index >= argv.length) throw new Error(`${token} requires a value`);
      return argv[index];
    };
    if (token === "--phase" || token === "--mode") options.phase = next();
    else if (token === "--pr") options.pr = Number.parseInt(next(), 10);
    else if (token === "--repo") options.repo = next();
    else if (token === "--remote") options.remote = next();
    else if (token === "--base") options.base = next();
    else if (token === "--head") options.head = next();
    else if (token === "--scope-file") options.scopeFile = next();
    else if (token === "--allow-dirty") options.allowDirty.push(next());
    else if (token === "--allow-path") options.allowPath.push(next());
    else if (token === "--json") options.json = true;
    else if (token === "--report-only") options.strict = false;
    else if (token === "--strict") options.strict = true;
    else if (token === "--help" || token === "-h") options.help = true;
    else throw new Error(`unknown argument: ${token}`);
  }

  if (options.pr !== null && (!Number.isInteger(options.pr) || options.pr < 1)) {
    throw new Error("--pr must be a positive pull request number");
  }
  if (options.phase === null) options.phase = options.pr === null ? "pre-pr" : "merge";
  if (!new Set(["pre-pr", "merge"]).has(options.phase)) {
    throw new Error("--phase must be pre-pr or merge");
  }
  if (options.phase === "merge" && options.pr === null) {
    throw new Error("--phase merge requires --pr <number>");
  }
  return options;
}

function printHelp() {
  console.log(`Usage: node scripts/validate-pr-readiness.mjs [options]
  --phase <pre-pr|merge>  Local creation or hosted merge lane
  --pr <number>           Hosted PR to inspect; required for merge
  --repo <owner/repo>     GitHub repository (inferred when omitted)
  --remote <name>         Git remote used for current branch ancestry (origin)
  --base/--head <ref>     Local comparison refs (origin/main, HEAD)
  --scope-file <path>     JSON manifest with allowed_paths and exclusions
  --allow-path <pattern>  Additional changed-path pattern (repeatable)
  --allow-dirty <pattern> Additional dirty-path pattern (repeatable)
  --json                  Emit portfolio-pr-readiness/v1 JSON
  --report-only           Report blockers but exit 0; strict is the default
  --help                  Show this help

pre-pr proves local ancestry, declared scope, and dirty boundaries. merge additionally proves
hosted ancestry, current-head reviews, reported checks, and stacked-parent readiness.`);
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: "utf8",
    maxBuffer: 2 * 1024 * 1024,
  });
  return {
    ok: result.status === 0,
    code: result.status,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
    output: `${result.stdout || ""}${result.stderr || ""}`.trim(),
  };
}

function parseJson(output, evidence) {
  try {
    return { value: JSON.parse(output), error: null };
  } catch (error) {
    return { value: null, error: `${evidence}: invalid JSON (${error.message})` };
  }
}

function addBlocker(result, code, message, evidence = {}) {
  result.blockers.push({ code, message, evidence });
}

function commandJson(result, command, args, evidence) {
  const execution = run(command, args);
  if (!execution.ok) {
    addBlocker(result, "command_failed", `${evidence} command failed`, {
      command: [command, ...args].join(" "),
      exit_code: execution.code,
      output: execution.output,
    });
    return null;
  }
  if (!execution.stdout.trim()) {
    addBlocker(result, "command_failed", `${evidence} could not be read`, {
      command: [command, ...args].join(" "),
      exit_code: execution.code,
      output: execution.output,
    });
    return null;
  }
  const parsed = parseJson(execution.stdout, evidence);
  if (parsed.error) addBlocker(result, "invalid_command_output", parsed.error, { command: [command, ...args].join(" ") });
  return parsed.value;
}

function repoRoot(result) {
  const execution = run(GIT, ["rev-parse", "--show-toplevel"]);
  if (!execution.ok) {
    addBlocker(result, "not_git_repository", "The readiness gate must run inside a Git worktree", {
      command: `${GIT} rev-parse --show-toplevel`,
      output: execution.output,
    });
    return null;
  }
  return execution.stdout.trim();
}

function inferRepo(result, suppliedRepo) {
  if (suppliedRepo) return suppliedRepo;
  const data = commandJson(result, GH, ["repo", "view", "--json", "nameWithOwner,defaultBranchRef"], "gh repo view");
  return data?.nameWithOwner || null;
}

function getRepoMetadata(result, repo) {
  if (!repo) return { defaultBranch: "main" };
  const data = commandJson(result, GH, ["repo", "view", repo, "--json", "nameWithOwner,defaultBranchRef"], "repository metadata");
  return { defaultBranch: data?.defaultBranchRef?.name || "main" };
}

function localDefaultBranch(base, remote) {
  if (base.startsWith(`${remote}/`)) return base.slice(remote.length + 1).split("/")[0] || "main";
  return "main";
}

function loadHostedPr(result, repo, number) {
  const fields = [
    "number",
    "title",
    "state",
    "isDraft",
    "headRefName",
    "headRefOid",
    "headRepositoryOwner",
    "baseRefName",
    "baseRefOid",
    "mergeable",
    "mergeStateStatus",
    "reviewDecision",
    "author",
    "url",
  ].join(",");
  const data = commandJson(result, GH, ["pr", "view", String(number), "--repo", repo, "--json", fields], `PR #${number}`);
  if (!data) return null;
  result.hosted = data;
  if (data.state !== "OPEN") addBlocker(result, "pr_not_open", `PR #${number} is ${data.state}, not OPEN`, { state: data.state });
  if (data.isDraft) addBlocker(result, "pr_is_draft", `PR #${number} is still a draft`);
  if (data.mergeable !== "MERGEABLE") {
    addBlocker(result, "pr_not_mergeable", `PR #${number} is ${data.mergeable}`, { mergeable: data.mergeable });
  }
  if (["BEHIND", "DIRTY", "UNKNOWN"].includes(data.mergeStateStatus)) {
    addBlocker(result, "pr_base_not_current", `PR #${number} merge state is ${data.mergeStateStatus}`, {
      merge_state_status: data.mergeStateStatus,
      base_sha: data.baseRefOid,
      head_sha: data.headRefOid,
    });
  }
  return data;
}

function ownerName(owner) {
  return owner?.login || owner?.name || owner || null;
}

function allPullRequests(result, repo, headBranch = null, headOwner = null) {
  const query = headBranch && headOwner ? `&head=${encodeURIComponent(`${headOwner}:${headBranch}`)}` : "";
  const payload = commandJson(
    result,
    GH,
    ["api", "--paginate", "--slurp", `repos/${repo}/pulls?state=all&per_page=100${query}`],
    "repository PR list",
  );
  const pages = Array.isArray(payload) ? payload : [];
  return pages.flatMap((page) => (Array.isArray(page) ? page : [page])).map((candidate) => ({
    number: candidate.number,
    state: candidate.merged_at ? "MERGED" : candidate.state?.toUpperCase(),
    headRefName: candidate.head?.ref,
    headRepositoryOwner: candidate.head?.repo?.owner?.login || candidate.head?.user?.login || null,
    baseRefName: candidate.base?.ref,
    headRefOid: candidate.head?.sha,
    title: candidate.title,
    url: candidate.html_url,
  })).filter((candidate) => {
    if (headBranch && candidate.headRefName !== headBranch) return false;
    return !headOwner || ownerName(candidate.headRepositoryOwner) === headOwner;
  });
}

function checkStackParent(result, repo, pr, defaultBranch) {
  if (!pr || pr.baseRefName === defaultBranch) {
    result.stack = { stacked: false, default_branch: defaultBranch };
    return;
  }
  const currentOwner = ownerName(pr.headRepositoryOwner);
  const candidates = allPullRequests(result, repo, pr.baseRefName, currentOwner);
  const parent = candidates.find((candidate) => {
    return candidate.headRefName === pr.baseRefName && Boolean(currentOwner && ownerName(candidate.headRepositoryOwner) === currentOwner);
  });
  result.stack = {
    stacked: true,
    default_branch: defaultBranch,
    parent: parent || null,
  };
  if (!parent) {
    addBlocker(result, "stack_parent_missing", `No PR owns stacked base branch ${pr.baseRefName}`, { base_branch: pr.baseRefName });
  } else if (parent.state !== "MERGED") {
    addBlocker(result, "stack_parent_not_merged", `Stacked parent PR #${parent.number} is ${parent.state}; merge the parent first`, {
      parent_pr: parent.number,
      parent_state: parent.state,
      parent_head: parent.headRefOid,
    });
  }
}

function getReviews(result, repo, number) {
  const payload = commandJson(result, GH, ["api", "--paginate", "--slurp", `repos/${repo}/pulls/${number}/reviews`], `PR #${number} reviews`);
  if (!Array.isArray(payload)) return [];
  return payload.flatMap((page) => (Array.isArray(page) ? page : [page]));
}

function isBot(review) {
  const login = review.user?.login || "";
  return review.user?.type === "Bot" || login.endsWith("[bot]") || /coderabbit|codex|chatgpt/i.test(login);
}

/** Evaluate current-head review artifacts and the separately configured human quorum. */
function checkReviews(result, repo, pr, requiredApprovals) {
  const reviews = getReviews(result, repo, pr.number);
  const latestByReviewer = new Map();
  for (const review of reviews) {
    if (review.commit_id !== pr.headRefOid) continue;
    const reviewer = review.user?.login || review.user?.id || review.id;
    const previous = latestByReviewer.get(reviewer);
    if (previous && previous.state === "APPROVED" && review.state === "COMMENTED") continue;
    if (previous && previous.state === "CHANGES_REQUESTED" && review.state === "COMMENTED") continue;
    latestByReviewer.set(reviewer, review);
  }
  const current = [...latestByReviewer.values()].filter((review) => review.state !== "DISMISSED");
  const currentCodex = current.filter((review) => /codex|chatgpt/i.test(review.user?.login || ""));
  const currentCodeRabbit = current.filter((review) => /coderabbit/i.test(review.user?.login || ""));
  const commentPages = currentCodex.length === 0
    ? commandJson(result, GH, ["api", "--paginate", "--slurp", `repos/${repo}/issues/${pr.number}/comments`], "Codex completion artifacts")
    : [];
  if (!Array.isArray(commentPages)) addBlocker(result, "review_artifacts_invalid", "Codex comment inventory must be an array");
  const completion = currentCodexCompletion(Array.isArray(commentPages) ? commentPages.flat() : [], pr.headRefOid, pr.url);
  const independentApprovals = current.filter(
    (review) => review.state === "APPROVED" && !isBot(review) && review.user?.login !== pr.author?.login,
  );
  result.reviews = {
    head_sha: pr.headRefOid,
    total: reviews.length,
    current_head: current.map((review) => ({ login: review.user?.login, state: review.state, commit_id: review.commit_id })),
    independent_approvals: independentApprovals.map((review) => review.user?.login),
    required_human_approvals: requiredApprovals,
    current_codex: currentCodex.length || (completion ? 1 : 0),
    codex_completion_artifact: completion?.html_url ?? null,
    current_coderabbit: currentCodeRabbit.length,
  };
  checkHumanApprovals(result, independentApprovals, requiredApprovals, pr.headRefOid, addBlocker);
  if (currentCodex.length === 0 && !completion) addBlocker(result, "codex_review_missing", "No Codex review artifact is attached to the current PR head", { head_sha: pr.headRefOid });
  if (currentCodeRabbit.length === 0) {
    addBlocker(result, "coderabbit_review_missing", "No CodeRabbit review is attached to the current PR head", { head_sha: pr.headRefOid });
  }
}

/** Compare current reported checks with the already verified hosted policy. */
function checkChecks(result, repo, pr, protectedBranch, required) {
  const execution = run(GH, ["pr", "checks", String(pr.number), "--repo", repo, "--json", "name,bucket,state,link,workflow"]);
  const parsed = parseJson(execution.stdout, `PR #${pr.number} checks`);
  const checks = Array.isArray(parsed.value) ? parsed.value : [];
  result.checks = {
    source: "gh pr checks --json plus active branch protection/ruleset configuration",
    required_branch: protectedBranch,
    required_contexts: required.contexts,
    required_source: required.source,
    checks: checks.map((check) => ({ name: check.name, bucket: check.bucket, state: check.state, link: check.link })),
  };
  if (parsed.error || !execution.stdout.trim()) {
    addBlocker(result, "checks_unavailable", parsed.error || `PR #${pr.number} checks returned no JSON`, { output: execution.output });
    return;
  }
  if (checks.length === 0) addBlocker(result, "checks_missing", `PR #${pr.number} reported no check contexts`);
  const requiredContexts = new Set(required.contexts);
  const optionalFailures = checks.filter((check) => check.bucket !== "pass" && !requiredContexts.has(check.name));
  result.checks.optional_failures = optionalFailures.map((check) => ({ name: check.name, bucket: check.bucket, state: check.state, link: check.link }));
  for (const check of checks) {
    if (check.bucket !== "pass" && requiredContexts.has(check.name)) {
      addBlocker(result, "check_not_passing", `${check.name} is ${check.bucket || check.state}`, {
        name: check.name,
        bucket: check.bucket,
        state: check.state,
        link: check.link,
      });
    }
  }
  const byName = new Map(checks.map((check) => [check.name, check]));
  for (const context of required.contexts) {
    const check = byName.get(context);
    if (!check) {
      addBlocker(result, "required_check_missing", `${context} is required but is not reported for PR #${pr.number}`, { context });
    }
  }
}

function humanSummary(result) {
  console.log(`pr-readiness: ${result.status} (${result.phase})`);
  if (result.pr) console.log(`PR #${result.pr} ${result.hosted?.title || ""}`.trim());
  for (const blocker of result.blockers) console.log(`- ${blocker.code}: ${blocker.message}`);
}

/** Collect local and hosted proof lanes and return a non-zero status for any blocker. */
function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`pr-readiness: argument error: ${error.message}`);
    process.exitCode = 2;
    return;
  }
  if (options.help) {
    printHelp();
    return;
  }
  const result = {
    schema_version: SCHEMA_VERSION,
    status: "pass",
    phase: options.phase,
    pr: options.pr,
    repo: options.repo,
    blockers: [],
  };
  result.repo_root = repoRoot(result);
  const hostedMetadataRequired = options.phase === "merge" || Boolean(options.repo);
  result.repo = hostedMetadataRequired ? inferRepo(result, options.repo) : options.repo;
  const metadata = hostedMetadataRequired ? getRepoMetadata(result, result.repo) : { defaultBranch: localDefaultBranch(options.base, options.remote) };
  result.default_branch = metadata.defaultBranch;
  const pr = options.pr && result.repo ? loadHostedPr(result, result.repo, options.pr) : null;
  if (options.phase === "merge" && !pr) addBlocker(result, "pr_unavailable", "Hosted merge readiness requires a readable PR");
  checkAncestry(result, pr, options, metadata.defaultBranch, run, GIT, addBlocker);
  if (!pr) checkTrackedHead(result, options, run, GIT, addBlocker);
  const scope = loadScope(result, options, addBlocker);
  const changedFiles = readChangedFiles(result, options, pr, run, GIT, GH);
  checkScope(result, scope, changedFiles, addBlocker);
  checkDirty(result, scope, run, GIT, addBlocker);
  if (pr && result.repo) {
    checkStackParent(result, result.repo, pr, metadata.defaultBranch);
    const required = requiredChecks(result, result.repo, metadata.defaultBranch, run, GH, commandJson, parseJson, addBlocker);
    checkReviews(result, result.repo, pr, required.requiredApprovals);
    checkChecks(result, result.repo, pr, metadata.defaultBranch, required);
  }
  result.status = result.blockers.length > 0 ? "blocked" : "pass";
  if (options.json) console.log(JSON.stringify(result, null, 2));
  else humanSummary(result);
  if (options.strict && result.blockers.length > 0) process.exitCode = 1;
}

main();
