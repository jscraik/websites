import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const SCOPE_SCHEMA = "portfolio-pr-scope/v1";

/** Read changed paths from the local diff or hosted PR for scope validation. */
export function readChangedFiles(result, options, pr, run, git, gh) {
  const execution = pr
    ? run(gh, ["pr", "diff", String(pr.number), "--repo", result.repo, "--name-only"])
    : run(git, ["diff", "--name-only", "-z", `${options.base}...${options.head}`, "--"]);
  if (!execution.ok) {
    result.blockers.push({
      code: "changed_files_unavailable",
      message: "Changed-file scope could not be read",
      evidence: { output: execution.output },
    });
    return [];
  }
  const files = execution.stdout.includes("\0")
    ? execution.stdout.split("\0").filter(Boolean)
    : execution.stdout.split(/\r?\n/).filter(Boolean);
  result.scope = { ...(result.scope || {}), changed_files: files };
  return files;
}

/** Match repository-relative paths against the supported scope glob syntax. */
export function globMatches(file, pattern) {
  if (pattern.endsWith("/")) return file.startsWith(pattern);
  if (!pattern.includes("*") && !pattern.includes("?")) return file === pattern || file.startsWith(`${pattern}/`);
  let expression = "^";
  for (let index = 0; index < pattern.length; index += 1) {
    const character = pattern[index];
    if (character === "*" && pattern[index + 1] === "*") {
      if (pattern[index + 2] === "/") {
        expression += "(?:.*/)?";
        index += 2;
      } else {
        expression += ".*";
        index += 1;
      }
    } else if (character === "*") expression += "[^/]*";
    else if (character === "?") expression += "[^/]";
    else expression += character.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  return new RegExp(`${expression}$`).test(file);
}

/** Load and validate the declared PR scope without admitting malformed paths. */
export function loadScope(result, options, addBlocker) {
  const scope = {
    allowed_paths: [...options.allowPath],
    excluded_paths: [],
    dirty_allowed_paths: [...options.allowDirty],
    max_files: null,
    manifest: options.scopeFile || null,
  };
  if (options.scopeFile) {
    try {
      const payload = JSON.parse(readFileSync(resolve(options.scopeFile), "utf8"));
      if (payload.schema_version !== SCOPE_SCHEMA) addBlocker(result, "scope_schema_invalid", "Scope manifest has the wrong schema_version");
      /** Validate a scope pattern list before adding it to the selected path set. */
      const readPatterns = (field, missingCode, target) => {
        const value = payload[field];
        if (!Array.isArray(value)) {
          addBlocker(result, missingCode, `Scope manifest must define ${field} as an array of strings`, { field, value });
          return;
        }
        const invalid = value.filter((entry) => typeof entry !== "string");
        if (invalid.length > 0) {
          addBlocker(result, "scope_field_invalid", `Scope manifest ${field} must contain only strings`, {
            field,
            invalid,
          });
          return;
        }
        target.push(...value);
      };
      readPatterns("allowed_paths", "scope_allowed_paths_missing", scope.allowed_paths);
      if (payload.excluded_paths !== undefined) readPatterns("excluded_paths", "scope_excluded_paths_invalid", scope.excluded_paths);
      if (payload.dirty_allowed_paths !== undefined) {
        readPatterns("dirty_allowed_paths", "scope_dirty_allowed_paths_invalid", scope.dirty_allowed_paths);
      }
      if (payload.max_files !== undefined) {
        if (Number.isInteger(payload.max_files) && payload.max_files >= 0) scope.max_files = payload.max_files;
        else addBlocker(result, "scope_max_files_invalid", "Scope manifest max_files must be a non-negative integer", { value: payload.max_files });
      }
    } catch (error) {
      addBlocker(result, "scope_manifest_unreadable", `Scope manifest could not be read: ${error.message}`, { path: options.scopeFile });
    }
  }
  if (scope.allowed_paths.length === 0) addBlocker(result, "scope_manifest_missing", "Strict readiness requires an explicit changed-path scope manifest or --allow-path pattern");
  return scope;
}

/** Reject changed files outside the declared scope or inside excluded paths. */
export function checkScope(result, scope, changedFiles, addBlocker) {
  const excluded = changedFiles.filter((file) => scope.excluded_paths.some((pattern) => globMatches(file, pattern)));
  const unexpected = changedFiles.filter(
    (file) => !excluded.includes(file) && !scope.allowed_paths.some((pattern) => globMatches(file, pattern)),
  );
  result.scope = {
    ...(result.scope || {}),
    manifest: scope.manifest,
    allowed_paths: scope.allowed_paths,
    excluded_paths: scope.excluded_paths,
    unexpected,
    excluded,
    max_files: scope.max_files,
  };
  if (scope.max_files !== null && changedFiles.length > scope.max_files) {
    addBlocker(result, "scope_file_limit_exceeded", `Changed-file count ${changedFiles.length} exceeds max_files ${scope.max_files}`, {
      changed_files: changedFiles.length,
      max_files: scope.max_files,
    });
  }
  if (excluded.length > 0) addBlocker(result, "excluded_paths_changed", "The PR changes paths explicitly excluded by its scope manifest", { paths: excluded });
  if (unexpected.length > 0) addBlocker(result, "scope_paths_unexpected", "The PR changes paths outside its declared scope", { paths: unexpected });
}

/** Collect staged, unstaged and untracked paths from the current checkout. */
function dirtyFiles(result, run, git, addBlocker) {
  const execution = run(git, ["status", "--porcelain=v1", "-z"]);
  if (!execution.ok) {
    addBlocker(result, "dirty_state_unavailable", "Working-tree status could not be read", { output: execution.output });
    return [];
  }
  const entries = execution.stdout.split("\0").filter(Boolean);
  const files = [];
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    const status = entry.slice(0, 2);
    files.push(entry.slice(3));
    if (status.includes("R") || status.includes("C")) {
      const renamedPath = entries[index + 1];
      if (renamedPath) {
        files.push(renamedPath);
        index += 1;
      }
    }
  }
  return files;
}

/** Require every dirty path to have explicit scope ownership. */
export function checkDirty(result, scope, run, git, addBlocker) {
  const files = dirtyFiles(result, run, git, addBlocker);
  const unexpected = files.filter((file) => !scope.dirty_allowed_paths.some((pattern) => globMatches(file, pattern)));
  result.dirty_worktree = { files, allowed_paths: scope.dirty_allowed_paths, unexpected };
  if (unexpected.length > 0) addBlocker(result, "dirty_worktree_boundary", "The working tree contains unapproved dirty paths", { paths: unexpected });
}

/** Verify the local branch is based on the expected hosted base and head. */
export function checkAncestry(result, pr, options, defaultBranch, run, git, addBlocker) {
  const base = pr?.baseRefOid || options.base;
  const head = pr?.headRefOid || options.head;
  const localBaseBranch = options.base.startsWith(`${options.remote}/`) ? options.base.slice(options.remote.length + 1) : null;
  const remoteBranch = pr?.baseRefName || localBaseBranch || defaultBranch;
  const remoteExecution = run(git, ["ls-remote", options.remote, `refs/heads/${remoteBranch}`]);
  const line = remoteExecution.stdout.trim().split(/\r?\n/).find(Boolean);
  const remoteSha = line?.split(/\s+/)[0];
  if (!remoteExecution.ok || !/^[0-9a-f]{40}$/.test(remoteSha || "")) {
    addBlocker(result, "remote_ancestry_unavailable", `Remote branch ${options.remote}/${remoteBranch} could not be verified`, {
      command: `${git} ls-remote ${options.remote} refs/heads/${remoteBranch}`,
      output: remoteExecution.output,
    });
  }
  result.ancestry = {
    base,
    head,
    mode: pr ? "hosted" : "local",
    remote: { name: options.remote, branch: remoteBranch, sha: remoteSha || null },
  };
  if (!pr) {
    const baseCheck = run(git, ["rev-parse", "--verify", `${base}^{commit}`]);
    if (!baseCheck.ok) {
      addBlocker(result, "base_ref_missing", `Local base ${base} is unavailable`, { command: `${git} rev-parse --verify ${base}^{commit}` });
      return;
    }
    const localBaseSha = baseCheck.stdout.trim();
    if (remoteSha && localBaseSha !== remoteSha) {
      addBlocker(result, "remote_base_stale", `Local base ${base} is not the current ${options.remote}/${remoteBranch}`, {
        local_base: localBaseSha,
        remote_base: remoteSha,
        remote: options.remote,
        branch: remoteBranch,
      });
    }
  } else if (remoteSha && remoteSha !== pr.baseRefOid) {
    addBlocker(result, "remote_base_stale", `PR base ${pr.baseRefOid} is not the current ${options.remote}/${remoteBranch}`, {
      pr_base: pr.baseRefOid,
      remote_base: remoteSha,
      remote: options.remote,
      branch: remoteBranch,
    });
  }
  for (const [label, sha] of [["base", base], ["head", head]]) {
    const objectCheck = run(git, ["cat-file", "-e", `${sha}^{commit}`]);
    if (!objectCheck.ok) addBlocker(result, `${label}_commit_missing`, `The ${label} commit is not available locally`, { sha });
  }
  const ancestor = run(git, ["merge-base", "--is-ancestor", base, head]);
  if (!ancestor.ok) {
    addBlocker(result, "remote_ancestry_invalid", `${base} is not an ancestor of ${head}`, {
      command: `${git} merge-base --is-ancestor ${base} ${head}`,
      exit_code: ancestor.code,
    });
  } else {
    result.ancestry.ancestor = true;
  }
}

/** Require the checked-out commit to match the tracked PR branch. */
export function checkTrackedHead(result, options, run, git, addBlocker) {
  const upstream = run(git, ["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{upstream}"]);
  if (!upstream.ok || !upstream.stdout.trim()) {
    result.ancestry.remote_head = { status: "untracked" };
    addBlocker(result, "remote_head_untracked", "The current branch has no upstream remote head to compare", {
      command: `${git} rev-parse --abbrev-ref --symbolic-full-name @{upstream}`,
      output: upstream.output,
    });
    return;
  }
  const upstreamRef = upstream.stdout.trim();
  const separator = upstreamRef.indexOf("/");
  const remoteName = separator > 0 ? upstreamRef.slice(0, separator) : options.remote;
  const branch = separator > 0 ? upstreamRef.slice(separator + 1) : upstreamRef;
  const remoteHead = run(git, ["ls-remote", remoteName, `refs/heads/${branch}`]);
  const remoteSha = remoteHead.stdout.trim().split(/\r?\n/).find(Boolean)?.split(/\s+/)[0] || "";
  const localHead = run(git, ["rev-parse", "--verify", `${options.head}^{commit}`]);
  result.ancestry.remote_head = {
    status: remoteHead.ok && /^[0-9a-f]{40}$/.test(remoteSha) && localHead.ok ? "tracked" : "unavailable",
    upstream: upstreamRef,
    remote_sha: remoteSha || null,
    local_sha: localHead.stdout.trim() || null,
  };
  if (!remoteHead.ok || !/^[0-9a-f]{40}$/.test(remoteSha) || !localHead.ok) {
    addBlocker(result, "remote_head_unavailable", `Tracked branch head ${upstreamRef} could not be compared`, {
      upstream: upstreamRef,
      remote_output: remoteHead.output,
      local_output: localHead.output,
    });
    return;
  }
  const containsRemote = run(git, ["merge-base", "--is-ancestor", remoteSha, localHead.stdout.trim()]);
  if (!containsRemote.ok) {
    addBlocker(result, "remote_head_stale", `Local head ${localHead.stdout.trim()} does not contain current ${upstreamRef}`, {
      upstream: upstreamRef,
      remote_sha: remoteSha,
      local_sha: localHead.stdout.trim(),
    });
  }
}

/** Match a branch against GitHub ruleset ref patterns and default-branch aliases. */
function rulesetRefMatches(branch, pattern, defaultBranch = branch) {
  if (pattern === "~ALL") return true;
  if (pattern === "~DEFAULT_BRANCH") return branch === defaultBranch;
  const normalized = pattern.startsWith("refs/heads/") ? pattern.slice("refs/heads/".length) : pattern;
  return globMatches(branch, normalized) || globMatches(`refs/heads/${branch}`, pattern);
}

/** Apply only active branch rulesets whose include and exclude patterns match. */
export function rulesetApplies(ruleset, branch, defaultBranch = branch) {
  if (ruleset.enforcement !== "active" || ruleset.target !== "branch") return false;
  const includes = ruleset.conditions?.ref_name?.include || [];
  const excludes = ruleset.conditions?.ref_name?.exclude || [];
  const included = includes.length === 0 || includes.some((pattern) => rulesetRefMatches(branch, pattern, defaultBranch));
  const excluded = excludes.some((pattern) => rulesetRefMatches(branch, pattern, defaultBranch));
  return included && !excluded;
}

/** Read required status contexts and the strongest human quorum from hosted policy. */
export function requiredChecks(result, repo, branch, run, gh, commandJson, parseJson, addBlocker) {
  const contexts = [];
  let requiredApprovals = 0;
  /** Reject malformed policy rather than treating it as a zero-approval exception. */
  function includeApprovals(count, source) {
    if (!Number.isInteger(count) || count < 0) {
      addBlocker(result, "approval_policy_invalid", `Invalid required human approval count in ${source}`, { count });
      return;
    }
    requiredApprovals = Math.max(requiredApprovals, count);
  }
  const rulesetsPayload = commandJson(result, gh, ["api", "--paginate", "--slurp", `repos/${repo}/rulesets`], "repository rulesets");
  if (!Array.isArray(rulesetsPayload)) {
    addBlocker(result, "approval_policy_invalid", "Repository ruleset policy must be an array");
  }
  const rulesets = Array.isArray(rulesetsPayload)
    ? rulesetsPayload.flatMap((page) => (Array.isArray(page) ? page : [page]))
    : [];
  if (Array.isArray(rulesets)) {
    for (const summary of rulesets) {
      if (!summary || !Number.isInteger(summary.id) || summary.id <= 0) {
        addBlocker(result, "approval_policy_invalid", "Repository ruleset entry has no valid id");
        continue;
      }
      const detail = commandJson(result, gh, ["api", `repos/${repo}/rulesets/${summary.id}`], `ruleset ${summary.id}`);
      if (!detail || !["active", "disabled", "evaluate"].includes(detail.enforcement) || !["branch", "tag", "push", "repository"].includes(detail.target) || !Array.isArray(detail.rules)) {
        addBlocker(result, "approval_policy_invalid", `Ruleset ${summary.id} policy is malformed`);
        continue;
      }
      if (!rulesetApplies(detail, branch, branch)) continue;
      for (const rule of detail.rules || []) {
        if (rule.type === "pull_request") includeApprovals(rule.parameters?.required_approving_review_count, `ruleset ${summary.id}`);
        if (rule.type !== "required_status_checks") continue;
        for (const check of rule.parameters?.required_status_checks || []) {
          if (check.context && !contexts.includes(check.context)) contexts.push(check.context);
        }
      }
    }
  }
  const sources = [];
  if (contexts.length > 0) sources.push("active repository ruleset");
  const protection = run(gh, ["api", `repos/${repo}/branches/${branch}/protection`]);
  if (protection.ok) {
    const parsed = parseJson(protection.stdout, `branch protection for ${branch}`);
    if (parsed.error) addBlocker(result, "invalid_command_output", parsed.error, { command: [gh, "api", `repos/${repo}/branches/${branch}/protection`].join(" ") });
    if (parsed.value?.required_pull_request_reviews) includeApprovals(parsed.value.required_pull_request_reviews.required_approving_review_count, "branch protection");
    const branchContexts = [
      ...(parsed.value?.required_status_checks?.contexts || []),
      ...(parsed.value?.required_status_checks?.checks || []).map((check) => check.context).filter(Boolean),
    ];
    if (branchContexts.length > 0) {
      contexts.push(...branchContexts);
      sources.push("branch protection");
    }
  } else if (!/Branch not protected/i.test(protection.output)) {
    addBlocker(result, "required_checks_unavailable", `Branch protection for ${branch} could not be verified`, {
      command: [gh, "api", `repos/${repo}/branches/${branch}/protection`].join(" "),
      exit_code: protection.code,
      output: protection.output,
    });
  }
  const uniqueContexts = [...new Set(contexts)];
  if (uniqueContexts.length > 0) return { contexts: uniqueContexts, requiredApprovals, source: sources.join(" + ") };
  addBlocker(result, "required_checks_unconfigured", `No required status checks are configured for protected branch ${branch}`);
  return { contexts: [], requiredApprovals, source: "none found" };
}

/** Enforce the hosted human quorum separately from independent bot-review evidence. */
export function checkHumanApprovals(result, approvals, required, head, addBlocker) {
  if (!Number.isInteger(required) || required < 0) {
    addBlocker(result, "approval_policy_invalid", "Required human approval count is unavailable or invalid");
  } else if (approvals.length < required) {
    addBlocker(result, "independent_approval_missing", `Current-head independent human approvals: ${approvals.length}; required: ${required}`, { head_sha: head });
  }
}

/** Inventory formal review artifacts only for an exact authenticated provider identity. */
export function currentBotReviews(entries, head, prUrl, login) {
  if (!["chatgpt-codex-connector[bot]", "coderabbitai[bot]"].includes(login)) return [];
  return entries.filter(review => review?.user?.login === login && review.user?.type === "Bot" &&
    Number.isInteger(review.user?.id) && review.user.id > 0 && Number.isInteger(review.id) && review.id > 0 &&
    review.commit_id === head && review.html_url === `${prUrl}#pullrequestreview-${review.id}` &&
    ["APPROVED", "COMMENTED"].includes(review.state));
}

/** Revalidate the global receipt so artifact presence alone cannot admit a merge. */
export function checkGlobalReviewReceipt(result, pr, run, python, gatePath, addBlocker) {
  const execution = run(python, [gatePath, "--phase", "update", "--check-receipt",
    "--expected-repo", result.repo, "--expected-pr", String(pr.number),
    "--expected-head", pr.headRefOid, "--expected-base", pr.baseRefName]);
  let receipt;
  try {
    receipt = JSON.parse(execution.stdout);
  } catch {
    receipt = null;
  }
  const valid = execution.ok && receipt?.schema_version === "pr-readiness/v1" &&
    receipt.status === "pass" && receipt.phase === "update" &&
    receipt.repo?.head_sha === pr.headRefOid && receipt.repo?.root === result.repo_root &&
    receipt.lanes?.reviews?.status === "pass" && receipt.lanes?.required_checks?.status === "pass";
  result.global_review_clearance = { status: valid ? "pass" : "blocked", head_sha: pr.headRefOid,
    source: "fresh global update receipt with live hosted-state recheck" };
  if (!valid) addBlocker(result, "global_review_clearance_missing",
    "Merge requires a passing current-head global update receipt and live review/check revalidation",
    { output: execution.output });
}

/** Locate an authenticated current-head Codex completion artifact, not merge clearance. */
export function currentCodexCompletion(entries, head, prUrl) {
  const candidates = [];
  for (const entry of entries) {
    if (entry?.user?.login !== "chatgpt-codex-connector[bot]" || entry.user?.type !== "Bot" ||
      !Number.isInteger(entry.user?.id) || entry.user.id <= 0 || !Number.isInteger(entry.id) || entry.id <= 0 ||
      entry.html_url !== `${prUrl}#issuecomment-${entry.id}` || typeof entry.body !== "string" ||
      !entry.body.startsWith("<!-- codex-pull-request-review-summary -->")) continue;
    const markers = [...entry.body.matchAll(/<!-- codex-review-state:v1 (.*?) -->/g)];
    if (markers.length !== 1) return null;
    try {
      const code = JSON.parse(markers[0][1]).code_review;
      if (code?.commit_sha === head) candidates.push({ entry, code });
    } catch {
      return null;
    }
  }
  if (candidates.length !== 1) return null;
  const { entry, code } = candidates[0];
  return code.status === "completed" && code.has_any_findings === false &&
    code.has_unresolved_findings === false ? entry : null;
}

/** Locate a supported authenticated CodeRabbit reply artifact; global readiness owns clearance. */
export function currentCodeRabbitCompletion(entries, head, prUrl) {
  if (!/^[0-9a-f]{40}(?:[0-9a-f]{24})?$/.test(head)) return null;
  const events = entries.filter(entry => entry?.user?.login === "coderabbitai[bot]");
  const dated = events.map(entry => ({ entry, time: Math.max(Date.parse(entry.created_at), Date.parse(entry.updated_at)) }));
  if (dated.some(event => !Number.isFinite(event.time))) return null;
  dated.sort((left, right) => right.time - left.time);
  if (!dated.length || (dated[1] && dated[0].time === dated[1].time)) return null;
  const newestCreated = Date.parse(dated[0].entry.created_at);
  if (dated.slice(1).some(event => Date.parse(event.entry.created_at) >= newestCreated)) return null;
  const header = "<!-- This is an auto-generated reply by CodeRabbit -->";
  const tip = "> [!TIP]\n> For best results, initiate chat on the files or code changes.";
  const analysis = /<details>\n<summary>🧩 Analysis chain<\/summary>\n\n🏁 Script executed:\n\n```shell\ngh api repos\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/issues\/comments\/[1-9][0-9]*\n```\n\nLength of output: [0-9]+\n\n---\n\n<\/details>\n\n/;
  const mention = /^(?:`@[A-Za-z0-9][A-Za-z0-9-]{0,38}`|@[A-Za-z0-9][A-Za-z0-9-]{0,38})\n\n/;
  const entry = dated[0].entry;
  if (entry.user?.type !== "Bot" ||
    !Number.isInteger(entry.user?.id) || entry.user.id <= 0 || !Number.isInteger(entry.id) || entry.id <= 0 ||
    entry.html_url !== `${prUrl}#issuecomment-${entry.id}` || typeof entry.body !== "string") return null;
  let body = entry.body.replace(/^<!-- coderabbit-ai-generated:v1 -->\n\n/, "");
  if (!body.startsWith(`${header}\n\n`)) return null;
  body = body.slice(header.length + 2);
  if (body.startsWith(`${tip}\n\n`)) body = body.slice(tip.length + 2);
  const trace = analysis.exec(body);
  if (trace?.index === 0) body = body.slice(trace[0].length);
  body = body.replace(mention, "");
  return body === `No findings for ${head}.\n\n_You are interacting with an AI system._` ? entry : null;
}
